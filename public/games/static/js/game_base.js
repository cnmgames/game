import EventBus from './event_bus.js';
import Sound from './sound.js';
import PauseMenu from './components/pause_menu.js';
import Toast from './components/toast.js';
import Dialog from './components/dialog.js';
import IconFactory from './components/icon_factory.js';
import Router from './router.js';
import Auth from './auth.js';
import { session } from './session.js';

/* ==================== 兼容性 Polyfill ==================== */
// CanvasRenderingContext2D.roundRect 在旧浏览器（Chrome<99 / Safari<16）不可用，
// 若缺失则用 path 手动实现，避免棋盘类游戏绘制崩溃。
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
        let r = (typeof radii === 'number') ? radii : 0;
        const rr = Array.isArray(radii) ? radii : [r, r, r, r];
        const tl = (rr[0] !== undefined) ? rr[0] : r;
        const tr = (rr[1] !== undefined) ? rr[1] : tl;
        const br = (rr[2] !== undefined) ? rr[2] : tl;
        const bl = (rr[3] !== undefined) ? rr[3] : tl;

        this.moveTo(x + tl, y);
        this.lineTo(x + w - tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + tr);
        this.lineTo(x + w, y + h - br);
        this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        this.lineTo(x + bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - bl);
        this.lineTo(x, y + tl);
        this.quadraticCurveTo(x, y, x + tl, y);
        this.closePath();
        return this;
    };
}

/* ==================== 游戏基类 ==================== */
class GameBase {
    constructor(manifest) {
        this.manifest = manifest;
        this._state = 'idle'; // idle | running | paused | finished
        this._container = null;
        this._unsubscribers = [];
    }

    get state() { return this._state; }

    /* ---- 生命周期（子类重写） ---- */
    onStart() {}
    onPause() {}
    onResume() {}
    onDestroy() {}

    /* ---- 内部方法 ---- */
    init(container) {
        this._container = container;
        this._state = 'idle';
    }

    start() {
        this._state = 'running';
        this.onStart();
    }

    pause() {
        if (this._state !== 'running') return;
        this._state = 'paused';
        this.onPause();
    }

    resume() {
        if (this._state !== 'paused') return;
        this._state = 'running';
        this.onResume();
    }

    /* ---- 音效（对齐 Qt 端 play_sound） ---- */
    playSound(name) {
        if (Sound) Sound.play(name);
    }

    /* ---- 情侣提示（对齐 Qt 端 show_couple_tip） ---- */
    showCoupleTip(category, customText = null) {
        if (EventBus) {
            EventBus.emit('couple_tip:show', category, customText);
        }
    }

    /* ---- 结算互动（跨游戏公共：客户端请求 → 服务器端抽取 → 双方同步显示） ---- */
    requestInteraction() {
        // 对局结束时请求服务器端抽取互动（服务器端跨游戏公共操作）
        const sock = session.socket;
        if (!sock || !this._sessionId) return;
        sock.emit('session_action', { session_id: this._sessionId, action: 'draw_interaction', data: {} });
    }

    handleInteractionEvent(evt) {
        // 处理服务器端返回的互动文本（interaction_drawn 事件），返回 true 表示已处理
        if (!evt || evt.event !== 'interaction_drawn') return false;
        const interaction = evt.payload && evt.payload.interaction;
        if (interaction) this.showCoupleTip('win', interaction);
        return true;
    }

    /* 认输等结束路径：服务端在 game_over 广播时可能已预抽取互动（payload.interaction，
     * 见 socket_routes surrender 分支）。返回 true 表示已消费，调用方应跳过 requestInteraction，
     * 避免认输方立即 exit_game 切空房间导致事后请求抽不到、或与预抽取重复。 */
    hasPreDrawnInteraction(evt) {
        return !!(evt && evt.payload && evt.payload.interaction);
    }

    /* 对局结束后的互动结算（各游戏 game_over 事件统一入口）：
     * - 服务端预抽取(认输)：展示互动；发起认输方通知 App 完成退出
     * - 否则：赢家请求服务端抽取(interaction_drawn 同步)
     * 子类可覆写 _requestInteraction() 定制抽取触发。 */
    _handleGameOverInteraction(evt, winner) {
        if (this.hasPreDrawnInteraction(evt)) {
            this.showCoupleTip('win', evt.payload.interaction);
            if (evt.surrender_by === this._myRole) this._notifySurrenderSettled();
            return true;
        }
        if (this._online && winner === this._myRole) this.requestInteraction();
        return false;
    }

    /* 对局结束事件通用处理（各游戏 game_over 分支统一入口）：
     * - playSound 胜负音效
     * - 对方认输 Toast
     * - 同步 _snapshot 为最终状态（子类可经 restore 钩子定制，如大富翁 _restoreFromState）
     * - 互动结算(_handleGameOverInteraction)
     * 返回后调用方负责 _render() 展示终局。 */
    _onGameOverEvent(evt, { restore = null } = {}) {
        this._snapshot = evt;
        this.playSound(evt.winner === this._myRole ? 'win' : 'lose');
        if (evt.surrender_by) {
            const names = this._playerNames(evt);
            const name = names[evt.surrender_by] || '对方';
            Toast && Toast.show(`${name} 认输`, 'info');
        }
        this._handleGameOverInteraction(evt, evt.winner);
    }

    /* 认输结算完成信号：认输方展示完服务端预抽取的互动后调用，
     * 通知 App 可以销毁本实例并退出游戏页（否则退出流程会等待超时兜底）。 */
    _notifySurrenderSettled() {
        EventBus.emit('game:surrender_settled', this.manifest && this.manifest.id);
    }

    /* ---- 暂停菜单集成（对齐 Qt 端 PauseMenuOverlay） ----
     * 联机游戏在 onStart() 中调用 this.enableInGamePause()：
     *   - 游戏页 header 右上角注入暂停按钮
     *   - ESC 也可触发
     * 菜单：继续 / 重新开始(协商) / 退出游戏。
     * options.isRealTime: 实时游戏(tetris/breakout)打开菜单时同步服务端暂停
     * options.onServerPause/onServerResume: 由实时游戏提供(走服务端权威暂停)
     * options.onRequestRestart: 服务端协商重开请求(默认 emit restart_request)
     */
    enableInGamePause({ isRealTime = false, onServerPause, onServerResume } = {}) {
        this._inGamePauseOpts = { isRealTime, onServerPause, onServerResume };
        // ESC 触发
        this._pauseKeyHandler = (e) => {
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                this.toggleInGamePause();
            }
        };
        document.addEventListener('keydown', this._pauseKeyHandler);
        // 右上角暂停按钮注入到 game-header 右侧占位 span
        this._pauseBtn = document.createElement('button');
        this._pauseBtn.className = 'btn-pause-top';
        this._pauseBtn.type = 'button';
        this._pauseBtn.setAttribute('aria-label', '暂停');
        this._pauseBtn.innerHTML = IconFactory.icon('pause', 20);
        const headerRight = document.querySelector('#page-game .game-header > span:last-child');
        if (headerRight) headerRight.appendChild(this._pauseBtn);
        this._pauseBtn.addEventListener('click', () => this.toggleInGamePause());
        this.log('暂停菜单已启用');
    }

    /* 打开/关闭通用暂停菜单。打开时若实时游戏则同步暂停服务端对局。 */
    toggleInGamePause() {
        if (!PauseMenu) return;
        if (PauseMenu.isVisible()) {
            this._closeInGamePause();
            return;
        }
        // 对局进行中打开菜单：实时游戏同步服务端暂停；回合制无需停（等轮）
        const inProgress = !!this._inGameProgress?.();
        this._menuOpenedInProgress = inProgress;
        if (inProgress && this._inGamePauseOpts?.isRealTime && this._inGamePauseOpts.onServerPause) {
            this._inGamePauseOpts.onServerPause();
        }
        this.playSound('pause');
        PauseMenu.show({
            onResume: () => this._resumeFromPauseMenu(),
            onRestart: () => this._requestRestartFromMenu(),
            onExit: () => this._exitFromPauseMenu(),
        });
    }

    _closeInGamePause() {
        PauseMenu.hide();
        // 实时游戏恢复：若菜单打开时确实暂停了服务端 → 恢复
        if (this._menuOpenedInProgress && this._inGamePauseOpts?.isRealTime && this._inGamePauseOpts.onServerResume) {
            this._inGamePauseOpts.onServerResume();
        }
        this._menuOpenedInProgress = false;
        this.resume();
    }

    _resumeFromPauseMenu() {
        this._closeInGamePause();
    }

    /* 对局进行中状态钩子：子类可覆写（默认按 session snapshot 判断） */
    _inGameProgress() {
        const s = this._snapshot || session.currentSessionState || {};
        return !!s.started && !s.game_over;
    }

    /* 菜单「重新开始」：联机走服务端协商（restart_request → 对端同意 → 重开）；
     * 若提供自定义协商流程(如实时游戏需先复位引擎)走 options 回调。 */
    _requestRestartFromMenu() {
        PauseMenu.hide();
        // 若菜单打开时暂停了服务端(实时)，恢复以免请求时处于暂停态
        if (this._menuOpenedInProgress && this._inGamePauseOpts?.isRealTime && this._inGamePauseOpts.onServerResume) {
            this._inGamePauseOpts.onServerResume();
        }
        this._menuOpenedInProgress = false;
        // 本地(无会话/彩蛋)：直接重开
        if (!this._online) {
            this._restartLocalGame();
            return;
        }
        // 确认后请求对方（重开需接受一次失败惩罚）
        Dialog.confirm('重新开始本局？发起方需接受一次失败惩罚，且需对方同意。', { title: '重新开始', danger: false })
            .then((ok) => {
                if (!ok) return;
                this._emitRestartRequest();
            });
    }

    /* 子类可覆写：本地(非联机)重新开始 —— 默认销毁重建 */
    _restartLocalGame() {
        this.destroy();
        this._state = 'idle';
        this.start();
    }

    /* 发起服务端协商重开请求（暂停菜单「重新开始」） */
    _emitRestartRequest() {
        if (!session.socket || !this._sessionId) {
            Toast && Toast.show('会话未连接', 'error');
            return;
        }
        session.socket.emit('session_action', {
            session_id: this._sessionId, action: 'restart_request', data: {},
        });
        Toast && Toast.show('已请求重新开始，等待对方同意…', 'info');
    }

    _exitFromPauseMenu() {
        PauseMenu.hide();
        this._menuOpenedInProgress = false;
        // 联机对局「退出游戏」：Router.goBack() 触发 App 设置的 onBack(_exitOnlineGame)，
        // 进入统一退出流程(对局中会经游戏 tryExit 弹确认认输并展示惩罚)。
        // 本地彩蛋：goBack 返回原页面。
        if (Router) Router.goBack();
    }

    /* 处理对端/服务端重开相关事件，返回 true 表示已消费。
     * 子类 bindSessionEvents 的 onEvent 首行调用。 */
    handleRestartEvent(evt) {
        if (!evt) return false;
        if (evt.event === 'restart_requested') {
            const from = evt.payload && evt.payload.from;
            // 自己发起的请求也会广播回自己：无需对自己再弹确认
            if (from === this._myRole) return true;
            // 对端想重新开始（对端将受罚）→ 弹确认
            const who = from === 'player1'
                ? ((this._snapshot && this._snapshot.host && this._snapshot.host.username) || '对方')
                : ((this._snapshot && this._snapshot.guest && this._snapshot.guest.username) || '对方');
            Dialog.confirm(`💬 ${who} 想重新开始本局（${who} 将接受一次失败惩罚），是否同意？`, { title: '重新开始' })
                .then((agree) => {
                    this._emitRoomAction('restart_response', { agree });
                });
            return true;
        }
        if (evt.event === 'restart_approved') {
            const payload = evt.payload || {};
            const penalty = payload.penalty;
            const requesterName = payload.requester === 'player1'
                ? ((this._snapshot && this._snapshot.host && this._snapshot.host.username) || '发起方')
                : ((this._snapshot && this._snapshot.guest && this._snapshot.guest.username) || '发起方');
            // 惩罚内容双方都应看到：发起方显示「本局认输惩罚」，对方显示「对方接受惩罚 + 内容」
            if (penalty) {
                if (payload.requester === this._myRole) {
                    this.showCoupleTip('lose', `本局认输惩罚：${penalty}`);
                } else {
                    this.showCoupleTip('lose', `${requesterName} 已接受本局失败惩罚：${penalty}`);
                }
            }
            // 服务端已重置对局(started=true 新局广播); 实时游戏需本地复位引擎
            this._onRestartApproved?.();
            return true;
        }
        if (evt.event === 'restart_denied') {
            Toast && Toast.show('对方拒绝了重新开始', 'info');
            return true;
        }
        return false;
    }

    /* 子类可覆写：服务端批准重开后，本地复位(实时游戏重跑引擎) */
    _onRestartApproved() {}

    /* 发房间级动作(协商协议用) */
    _emitRoomAction(action, data) {
        if (!session.socket || !this._sessionId) return;
        session.socket.emit('session_action', {
            session_id: this._sessionId, action, data: data || {},
        });
    }

    /* 发送游戏操作(服务端权威 session_action)：各游戏通用入口。
     * 与 _emitRoomAction 等价，保留为游戏逻辑层惯用名。 */
    _emit(action, data) {
        this._emitRoomAction(action, data);
    }

    destroy() {
        this._unsubscribers.forEach(unsub => unsub());
        this._unsubscribers = [];
        if (this._pauseKeyHandler) {
            document.removeEventListener('keydown', this._pauseKeyHandler);
            this._pauseKeyHandler = null;
        }
        // 移除右上角暂停按钮
        if (this._pauseBtn) {
            this._pauseBtn.remove();
            this._pauseBtn = null;
        }
        if (PauseMenu && PauseMenu.isVisible()) {
            PauseMenu.hide();
        }
        this.onDestroy();
        this._container = null;
    }

    /* ---- 联机对局「返回房间」确认认输（通用流程） ----
     * 子类在 tryExit() 中调用：对局进行中时弹确认，确认则认输并退出，取消则留下。
     * 返回 true 表示「已拦截退出（用户取消）」，false 表示「可继续退出」。
     */
    async requestExit(isInProgress, emitSurrender) {
        if (!isInProgress) return false;
        const ok = await Dialog.confirm('确定返回房间吗？返回将自动判负，对方获胜。', { title: '返回房间', danger: true });
        if (!ok) {
            return true;   // 取消，留在对局
        }
        this._surrenderPending = true;   // 已确认认输：App 据此等待结算展示窗口
        if (typeof emitSurrender === 'function') emitSurrender();
        return false;   // 已认输，继续退出流程
    }

    /* ---- 联机对局「返回房间」确认认输（默认实现） ----
     * 子类可覆写 _isInProgress() 定制"对局进行中"判定；默认读会话状态。
     * 认输请求经 _emit('surrender') 由服务端判负。
     */
    async tryExit() {
        return this.requestExit(
            this._online && this._isInProgress(),
            () => this._emit('surrender', {})
        );
    }

    /* 子类可覆写：是否处于对局进行中(默认: started 且未 game_over) */
    _isInProgress() {
        return this._inGameProgress();
    }

    /* 标准联机会话初始化（标准模板游戏的 onStart 骨架）：
     * ensureSession 后由子类调用一次：填充 _sessionId/_online/_myRole/_snapshot、
     * 绑定会话事件(bindSessionEvents)、启用暂停菜单。
     * 子类差异经钩子：_bindOnline()(绑定事件) / _renderAfterStart()(首屏渲染)/
     * _pauseOptions()(实时游戏暂停回调)。 */
    async _initStandardSession() {
        this._sessionId = session.currentSessionId;
        this._online = session.currentSessionMode === 'online';
        const s = session.currentSessionState || {};
        this._myRole = this._inferRole(s);
        this._snapshot = s;
        if (typeof this._bindOnline === 'function') this._bindOnline();
        const pauseOpts = (typeof this._pauseOptions === 'function') ? this._pauseOptions() : {};
        this.enableInGamePause(pauseOpts);
        // 默认首屏渲染；子类可覆写 _renderAfterStart() 定制（如先恢复对局状态再渲染）
        if (typeof this._renderAfterStart === 'function') {
            this._renderAfterStart();
        } else if (typeof this._render === 'function') {
            this._render();
        }
    }

    /* 推断当前视角身份：host=player1、guest=player2（无会话/均不匹配返回 null） */
    _inferRole(s) {
        s = s || session.currentSessionState || {};
        const meId = (Auth.getUser() || {}).id;
        if (!meId) return null;
        if (s.host && s.host.id === meId) return 'player1';
        if (s.guest && s.guest.id === meId) return 'player2';
        return null;
    }

    /* 联机会话玩家昵称（host/guest -> 玩家1/玩家2），供子类渲染结果复用 */
    _playerNames(s) {
        s = s || {};
        return {
            player1: (s.host && s.host.username) || '玩家1',
            player2: (s.guest && s.guest.username) || '玩家2',
        };
    }

    /* ---- 工具方法 ---- */
    listen(event, callback) {
        const unsub = EventBus.on(event, callback);
        this._unsubscribers.push(unsub);
        return unsub;
    }

    getContainer() {
        return this._container;
    }

    log(msg) {
        console.log(`[${this.manifest.id}]`, msg);
    }
}

export default GameBase;