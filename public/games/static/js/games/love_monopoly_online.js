import Router from '../router.js';
import LoveMonopolyEngine from '../love_monopoly_engine.js';
import Toast from '../components/toast.js';
import { session, bindSessionEvents } from '../session.js';
import IconFactory from '../components/icon_factory.js';
import { diceSlotsHtml, rollZoneHtml } from './love_monopoly_dice.js';
import { moveTokenStepByStep, cancelTokenMove } from './love_monopoly_anim.js';
import RenderMixin from './love_monopoly_view.js';

/* ==================== 恋爱大富翁 - 联机模式 Mixin ====================
 * 服务端权威（LoveMonopolyRoom）：骰子/移动/资金/建筑/事件/小游戏/胜负全由服务端判定，
 * 客户端只渲染服务端广播的状态（cells/money/buildings/positions/pending 等）。
 * 本文件保留会话与动画逻辑；棋盘渲染/HTML 生成见 love_monopoly_view.js。
 */
const OnlineMixin = {
    async _initOnline() {
        const s = session.currentSessionState || {};
        this._sessionId = session.currentSessionId;
        if (s.started || s.game_over) {
            // 刷新重连：从服务端状态恢复
            this._restoreFromState(s);
            this._bindOnline();
            return;
        }
        // 开始屏（房主开始；客机等待）
        const container = this.getContainer();
        container.innerHTML = `
            <div class="lm-start">
                <div class="lm-start-icon">${IconFactory.icon('dice', 56)}</div>
                <h2 class="lm-start-title">恋爱大富翁 · 联机</h2>
                <p class="lm-start-desc">环形大富翁！买地建楼、过起点领工资、随机事件与甜蜜惩罚~</p>
                ${this._myRole === 'player1'
                    ? '<button class="btn btn-primary btn-lg" id="lm-btn-start">开始游戏</button>'
                    : '<div class="lm-waiting">等待房主开始…</div>'}
            </div>
        `;
        if (this._myRole === 'player1') {
            container.querySelector('#lm-btn-start').addEventListener('click', () => this._emit('start', {}));
        }
        this._bindOnline();
    },

    _bindOnline() {
        this._offSocketHandlers.push(bindSessionEvents(this._sessionId, {
            onState: (st) => { this._restoreFromState(st); },
            onEvent: (evt) => { this._onSessionEvent(evt); },
            onError: (data) => Toast && Toast.error((data && data.message) || '操作失败'),
        }));
    },

    _onSessionEvent(evt) {
        if (this.handleInteractionEvent(evt)) return;   // 公共处理 interaction_drawn
        if (this.handleRestartEvent(evt)) return;       // 重开协商(暂停菜单)
        if (evt.event === 'game_over') {
            this._restoreFromState(evt);
            this.playSound(evt.winner === this._myRole ? 'win' : 'lose');
            this._handleGameOverInteraction(evt, evt.winner);
        }
    },

    /* ---- 从服务端状态恢复并渲染 ---- */

    _restoreFromState(st) {
        // 复用已有引擎实例，仅替换地图数据（服务端下发）
        if (!this._engine) this._engine = new LoveMonopolyEngine();
        this._engine.board = {
            total: st.total || 24,
            cells: st.cells || [],
            start_money: st.start_money || 1500,
            start_bonus: st.start_bonus || 200,
            win_target: st.win_target || 5000,
        };
        this._engine.total = this._engine.board.total;
        this._engine.cells = this._engine.board.cells;

        // 检测是否发生了「掷骰移动」：last_roll 变化且位置移动
        const rollChanged = st.last_roll !== null && st.last_roll !== this._lastRoll && this._positions
            && (st.positions && (st.positions.player1 !== this._positions.player1
                || st.positions.player2 !== this._positions.player2));
        const prevPositions = { ...this._positions };
        const prevMoney = { ...this._money };
        // 若前一次动画仍在播放（含 game_over 事件等二次推送到达），
        // 记住「最新待应用状态」，动画完成后统一渲染，绝不静默丢失
        this._pendingState = st;

        this._positions = st.positions || { player1: 0, player2: 0 };
        this._money = st.money || { player1: 0, player2: 0 };
        this._buildings = st.buildings || {};
        this._currentPlayer = st.current_player || 'player1';
        this._lastRoll = st.last_roll;
        this._lastEvt = st.last_evt;
        this._task = st.task || null;
        this._pending = st.pending || null;
        this._pendingMini = !!st.pending_mini;
        this._gameOver = !!st.game_over;
        this._winner = st.winner || null;
        const names = this._playerNames(session.currentSessionState);

        if (rollChanged && !this._gameOver && !this._animBusy) {
            // 播放掷骰动画：停定骰子 + 逐格移动（无论自己还是对方发起）
            this._animBusy = true;
            this._playOnlineRoll(st.last_roll, st, names, prevPositions, prevMoney);
        } else if (this._animBusy) {
            // 动画进行中又收到广播（如互动格/加时/二次 event 推送）：
            // 不打断 DOM 移动链，最新状态已存入 this._pendingState，动画完成时统一渲染
            return;
        } else {
            // 无新掷骰：静默结束等待态并渲染终态
            this._clearRollWait();
            this._pendingState = null;
            this._renderOnlineBoard(st, names);
        }
    },

    /* 点击掷骰：本地先播滚动动画，服务端返回点数后停定移动 */
    _onRollClick() {
        if (this._animBusy || this._rollPending) return;
        this._rollPending = true;      // 等待服务端点数（不阻塞回包动画分支）
        this._rollStartAt = Date.now();
        const zone = document.getElementById('lm-action-zone');
        if (zone) zone.innerHTML = rollZoneHtml({ rolling: true, label: '掷骰中…' });
        const diceWrap = document.querySelector('#lm-roll-zone .lm-dice');
        let tick = 0;
        this._rollIv = setInterval(() => {
            tick = (tick % 6) + 1;
            if (diceWrap) diceWrap.innerHTML = diceSlotsHtml(tick);
        }, 90);
        this._emit('roll', {});
    },

    /* 停定骰子 + 棋子逐格移动（服务端权威状态已就位） */
    _playOnlineRoll(steps, st, names, prevPositions, prevMoney) {
        clearInterval(this._rollIv);
        this._rollIv = null;
        this._rollWait = false;
        this._rollPending = false;
        const zone = document.getElementById('lm-action-zone');
        if (zone) zone.innerHTML = rollZoneHtml({ rolling: false, value: steps, label: `掷出 ${steps} 点！` });
        this.playSound('turn');
        // 保证骰子至少展示 ~850ms（服务端回包可能极快，否则动画一闪而过）
        const elapsed = Date.now() - (this._rollStartAt || 0);
        const delay = Math.max(300, 850 - elapsed);
        this._playDelayTimer = setTimeout(() => {
            this._playDelayTimer = null;
            const container = this.getContainer();
            const board = container && container.querySelector('#lm-board');
            // 若 onDestroy 已发生（game_over/离开），直接渲染终态
            if (!board) {
                this._animBusy = false;
                this._renderOnlineBoard(st, names);
                return;
            }
            const targets = st.positions || { player1: 0, player2: 0 };
            // 分别移动发生变化的玩家
            const players = [];
            if (targets.player1 !== prevPositions.player1) players.push('player1');
            if (targets.player2 !== prevPositions.player2) players.push('player2');
            this._chainTokenMoves(board, players, prevPositions, targets, () => {
                this._animBusy = false;
                this._clearRollWait();
                // 动画完成：始终用最新状态（_pendingState 优先，动画期间广播不再丢失）
                // 统一渲染，保证 game_over/互动任务/建筑决策都不漏
                const pending = this._pendingState;
                const curSt = session.currentSessionState;
                const stNow = (pending && pending.session_id === this._sessionId) ? pending
                    : ((curSt && curSt.session_id === this._sessionId) ? curSt : st);
                this._renderOnlineBoard(stNow || st, this._playerNames(curSt || st));
                // 同步最新字段到渲染后的 game 状态（防止后续 rollChanged 误判）
                if (stNow) {
                    this._positions = stNow.positions || this._positions;
                    this._money = stNow.money || this._money;
                    this._currentPlayer = stNow.current_player || this._currentPlayer;
                    this._lastRoll = stNow.last_roll;
                    this._gameOver = !!stNow.game_over;
                    this._winner = stNow.winner || null;
                    this._pending = stNow.pending || null;
                    this._pendingMini = !!stNow.pending_mini;
                }
                this._pendingState = null;
            });
        }, delay);
    },

    /* 串行逐格移动多个玩家的棋子（复用共享动画模块） */
    _chainTokenMoves(board, players, prevPositions, targets, onDone) {
        const moves = players.map((p) => ({
            player: p,
            from: prevPositions[p],
            to: targets[p],
        }));
        this._chainMoves(board, moves, onDone || (() => {}));
    },

    _chainMoves(board, moves, onDone) {
        if (!moves.length || !board) { onDone(); return; }
        const { player, from, to } = moves[0];
        moveTokenStepByStep({
            board,
            player,
            from,
            to,
            total: this._engine.total,
            stepMs: 240,
            onDone: () => {
                this._tokenAnimTimer = null;
                this._chainMoves(board, moves.slice(1), onDone);
            },
        });
    },

    _clearRollWait() {
        if (this._rollIv) { clearInterval(this._rollIv); this._rollIv = null; }
        if (this._tokenAnimTimer) { clearTimeout(this._tokenAnimTimer); this._tokenAnimTimer = null; }
        if (this._playDelayTimer) { clearTimeout(this._playDelayTimer); this._playDelayTimer = null; }
    },

    _clearRollAnim() {
        this._clearRollWait();
        cancelTokenMove(this.getContainer() && this.getContainer().querySelector('#lm-board'));
        this._animBusy = false;
        this._rollWait = false;
        this._lastShownRoll = null;   // 重置动画检测，避免下次错误触发
    },

    _onExitClick() {
        const inProgress = !this._gameOver && (this._lastRoll !== null || this._pending || this._pendingMini);
        this.requestExit(inProgress, () => this._emit('surrender', {})).then(async (blocked) => {
            if (!blocked) {
                // 认输方也要看到惩罚内容：等 game_over(含预抽取互动)展示后再退房
                if (this._surrenderPending) {
                    await new Promise((r) => setTimeout(r, 600));
                }
                this._emit('exit_game', {});
                if (Router) Router.goBack();
            }
        });
    },

    /* 对局进行中判定：已掷骰或有待决策且未结束 */
    _isInProgress() {
        return !this._gameOver && (this._lastRoll !== null || this._pending || this._pendingMini);
    },
};

Object.assign(OnlineMixin, RenderMixin);

export default OnlineMixin;
