import Toast from './components/toast.js';
import API from './api.js';
import EventBus from './event_bus.js';
import { session, connectSocket } from './session.js';
import Auth from './auth.js';
import { RoomHall } from './room.js';

/* ==================== 应用 - 会话/游戏生命周期 Mixin ====================
 * 从 app.js 拆出：socket 会话事件监听、游戏启动分发、对局退出、
 * 会话销毁/恢复（刷新重连）。通过 Object.assign(App, SessionMixin) 挂载。
 */
const SessionMixin = {
    _watchGameSwitch() {
        // 幂等：init（已登录）与 afterLogin（登录后）都可能调用，只绑定一次
        if (this._watchBound) return;
        this._watchBound = true;
        // 监听 game_switch / game_exit / session_destroyed 事件
        const sock = connectSocket();
        const onEvent = (evt) => {
            if (!evt || evt.session_id !== session.currentSessionId) return;
            if (evt.event === 'game_switch') {
                this._switchToGame(evt.game_id || (evt.payload && evt.payload.game_id));
            } else if (evt.event === 'game_exit') {
                this._onGameExit();
            } else if (evt.event === 'session_destroyed') {
                this._onSessionDestroyed();
            }
        };
        sock.on('session_event', onEvent);
    },

    _onGameExit() {
        // 对方退出游戏返回房间：结束当前对局并回到房间内（会话保留）
        if (this._currentGame) {
            this._currentGame.destroy();
            this._currentGame = null;
        }
        this.enterRoom();
    },

    _switchToGame(gameId) {
        // 通用分发：从房间在线清单取 manifest（含名称/图标），不存在则走 API 兜底
        this._launchOnlineGame(gameId);
    },

    async _launchOnlineGame(gameId) {
        if (!gameId) return;
        let manifest = null;
        if (RoomHall && RoomHall._onlineGames) {
            manifest = RoomHall._onlineGames.find(g => g.id === gameId) || null;
        }
        if (!manifest) {
            try {
                const games = await API.getGames();
                manifest = games.find(g => g.id === gameId) || null;
            } catch (e) { manifest = null; }
        }
        if (!manifest) {
            Toast.error(`游戏 "${gameId}" 暂未实现`);
            return;
        }
        this._launchGame(manifest, () => this._exitOnlineGame());
    },

    async afterLogin(user) {
        // 登录后进入联机房间大厅（无本地同屏模式）
        this._watchGameSwitch();
        this.showTopbar();
        // 先尝试恢复未完成的对局（刷新页面重连），失败则进房间大厅
        const restored = await this._tryRestoreSession();
        if (!restored) {
            this.enterRoomHall();
        }
    },

    async _tryRestoreSession() {
        let ctx = null;
        try {
            ctx = JSON.parse(localStorage.getItem('treasure_session') || 'null');
        } catch (e) {
            ctx = null;
        }
        if (!ctx || !ctx.session_id) return false;
        try {
            const res = await fetch(`/api/sessions/${ctx.session_id}`, { headers: Auth.authHeaders() });
            if (!res.ok) throw new Error('会话已失效');
            const data = await res.json();
            if (!data.session) throw new Error('无会话');
            session.currentSessionId = data.session.session_id;
            session.currentSessionState = data.session;
            session.currentSessionMode = 'online';
            session.currentSessionShowRoomCode = false;
            const socket = connectSocket();
            const join = () => socket.emit('session_join', { session_id: data.session.session_id });
            if (socket.connected) join();
            else socket.once('connect', join);
            if (!data.session.game_id) {
                // 空房间（进入房间但未选择游戏）→ 回到房间内，而非进入具体游戏
                this.enterRoom();
            } else {
                // 通用分发：按 game_id 从清单取 manifest 并启动（新游戏无需登记白名单）
                await this._launchOnlineGame(data.session.game_id);
            }
            return true;
        } catch (e) {
            localStorage.removeItem('treasure_session');
            return false;
        }
    },

    async _exitOnlineGame() {
        // 联机对局中「返回房间」：先交给游戏实例判断是否需要确认判负
        const game = this._currentGame;
        if (game && typeof game.tryExit === 'function' && await game.tryExit()) {
            return;   // 游戏拦截了退出（如用户取消），留在对局
        }
        // 已确认认输：服务端会广播 game_over（若互动开启则携带预抽取互动）。
        // 认输方也是「输的人」，应看到惩罚内容——短暂等待结算展示窗口再销毁，
        // 让本实例收到 game_over 并弹出互动（overlay 为全局元素，不随实例销毁）。
        // 仅确实发起认输时才等待；未开局/已结束返回不产生延迟。
        if (game && game._surrenderPending) {
            await this._waitSurrenderSettled();
        }
        this._finishExitOnlineGame();
    },

    /* 等待认输结算展示：实例展示完预抽取互动会发 game:surrender_settled；
     * 未开启互动 / 无广播时靠超时兜底，不阻塞退出。 */
    _waitSurrenderSettled() {
        return new Promise((resolve) => {
            let done = false;
            const finish = () => { if (!done) { done = true; EventBus.off('game:surrender_settled', onSettled); resolve(); } };
            const onSettled = () => finish();
            EventBus.on('game:surrender_settled', onSettled);
            setTimeout(finish, 600);   // 兜底：广播往返 + 弹窗展示最多等 600ms
        });
    },

    _finishExitOnlineGame() {
        if (this._currentGame) {
            this._currentGame.destroy();
            this._currentGame = null;
        }
        // 退出游戏（非退出房间）：通知服务器重置对局状态，双方回到房间内；
        // 会话保留，刷新仍能回到该房间
        this._emitExitGame();
        this.enterRoom();
    },

    _emitExitGame() {
        const sid = session.currentSessionId;
        if (!sid) return;
        const sock = connectSocket();
        if (sock && sock.connected) {
            sock.emit('session_action', { session_id: sid, action: 'exit_game', data: {} });
        }
    },

    _destroySession() {
        // 销毁当前会话：先清空本地上下文，再通知服务器移除会话。
        // 先清空是为了避免自己触发 session_destroyed 时被误判为「对方离开」。
        const sid = session.currentSessionId;
        this._clearSessionContext();
        if (!sid) return;
        const sock = connectSocket();
        if (sock && sock.connected) {
            sock.emit('session_leave', { session_id: sid });
        }
    },

    _onSessionDestroyed() {
        // 对方离开了会话（会话已销毁）：结束当前游戏并返回大厅
        if (this._currentGame) {
            this._currentGame.destroy();
            this._currentGame = null;
        }
        this._clearSessionContext();
        this.enterRoomHall();
        if (Toast) Toast.show('对方已离开房间', 'info');
    },
};

export default SessionMixin;
