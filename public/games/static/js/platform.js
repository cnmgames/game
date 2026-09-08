import Auth from './auth.js';
import Toast from './components/toast.js';
import { session, connectSocket } from './session.js';

/* ==================== 平台抽象层（远程联机） ====================
 * 远程联机统一链路：操作发给服务器，状态由服务器广播。
 *
 * 统一接口（游戏视图只依赖这些）：
 *   - emit(action, data, player?)  发送操作
 *   - onState(cb)                  订阅状态更新（统一状态结构）
 *   - onEvent(name, cb)            订阅事件（如 game_over）
 *   - getInitialState()            首次渲染用的状态快照
 *   - getMyRole()                  当前视角身份 'player1'|'player2'
 *   - isHost()                     是否房主
 *   - isMyTurn(state)              当前状态是否轮到「我」操作
 *   - destroy()                    清理
 *
 * 统一状态结构（视图唯一依赖）：
 *   { started, gameOver, minNum, maxNum, currentMin, currentMax,
 *     currentPlayer, currentPlayerName, guesses, winner, loser, bomb,
 *     playerNames: {player1, player2} }
 */

/* ---- 统一平台：操作发 session_action，状态收 session_state ---- */
class Platform {
    constructor(sessionId, snapshot, mode) {
        this.sessionId = sessionId;
        this.mode = mode || 'online';
        this._snapshot = snapshot || null;
        this._stateCbs = [];
        this._eventCbs = {};
        this._unsubscribers = [];
        this.meId = Auth.getUser() ? Auth.getUser().id : null;
        this._myRole = this._computeRole(snapshot);
        this._bindSocket();
    }

    getMyRole() { return this._myRole; }
    isHost() { return this._myRole === 'player1'; }
    isMyTurn(state) {
        return state.currentPlayer === this._myRole;
    }

    emit(action, data, player) {
        if (!session.socket) return;
        const payload = { session_id: this.sessionId, action, data: data || {} };

        session.socket.emit('session_action', payload);
    }

    onState(cb) { this._stateCbs.push(cb); }
    onEvent(name, cb) { (this._eventCbs[name] = this._eventCbs[name] || []).push(cb); }

    getInitialState() {
        return this._mapState(this._snapshot);
    }

    destroy() {
        this._unsubscribers.forEach(u => u());
        this._unsubscribers = [];
        this._stateCbs = [];
        this._eventCbs = {};
    }

    _bindSocket() {
        if (!session.socket) return;
        const onState = (state) => {
            if (!state || state.session_id !== this.sessionId) return;
            this._snapshot = state;
            this._myRole = this._computeRole(state);
            this._stateCbs.forEach(cb => cb(this._mapState(state)));
        };
        const onEvent = (evt) => {
            if (!evt || evt.session_id !== this.sessionId) return;
            this._snapshot = evt;
            this._myRole = this._computeRole(evt);
            (this._eventCbs[evt.event] || []).forEach(cb => cb(this._mapState(evt)));
        };
        const onError = (data) => {
            Toast && Toast.error((data && data.message) || '操作失败');
        };
        session.socket.on('session_state', onState);
        session.socket.on('session_event', onEvent);
        session.socket.on('error', onError);
        this._unsubscribers.push(() => session.socket.off('session_state', onState));
        this._unsubscribers.push(() => session.socket.off('session_event', onEvent));
        this._unsubscribers.push(() => session.socket.off('error', onError));
    }

    _computeRole(state) {
        if (!state) return null;
        if (state.host && state.host.id === this.meId) return 'player1';
        if (state.guest && state.guest.id === this.meId) return 'player2';
        return null;
    }

    _mapState(state) {
        if (!state) return this._emptyState();
        const names = {
            player1: state.host ? state.host.username : '玩家1',
            player2: state.guest ? state.guest.username : '玩家2',
        };
        return {
            started: !!state.started,
            gameOver: !!state.game_over,
            minNum: state.min_num,
            maxNum: state.max_num,
            currentMin: state.current_min,
            currentMax: state.current_max,
            currentPlayer: state.current_player,   // 已是 'player1'/'player2'/null
            currentPlayerName: state.current_player ? names[state.current_player] : '',
            guesses: (state.guesses || []).map(g => ({
                player: g.player,
                name: g.username,
                number: g.number,
                message: g.message,
            })),
            winner: state.winner,
            loser: state.loser,
            bomb: state.bomb,
            surrenderBy: state.surrender_by || null,
            playerNames: names,
            guestJoined: !!(state.guest),
            // 认输等结束路径：服务端预抽取的互动文本（来自 game_over 广播 payload）
            interaction: (state.payload && state.payload.interaction) || null,
        };
    }

    _emptyState() {
        return {
            started: false, gameOver: false,
            minNum: 1, maxNum: 100, currentMin: 1, currentMax: 100,
            currentPlayer: null, currentPlayerName: '',
            guesses: [], winner: null, loser: null, bomb: null,
            surrenderBy: null,
            playerNames: { player1: '玩家1', player2: '玩家2' },
            guestJoined: false,
        };
    }
}


/* ---- 会话管理：确保当前游戏有会话（远程联机由房间大厅创建，此处兜底） ---- */
async function ensureSession(gameId, mode) {
    if (session.currentSessionId) return;   // 已有会话（远程联机已创建）
    try {
        const res = await fetch('/api/sessions/create', {
            method: 'POST',
            headers: { ...Auth.authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({
                game_id: gameId,
                mode: mode || 'online',
            }),
        });
        if (!res.ok) return;   // 非 2xx（如 404/401）直接返回，不抛异常，避免游戏容器空白
        const data = await res.json();
        if (data && data.session) {
            session.currentSessionId = data.session.session_id;
            session.currentSessionState = data.session;
            session.currentSessionMode = data.session.mode || mode;
            // 确保 socket 已连接后再加入会话房间，否则 session_join 事件会丢失
            const socket = connectSocket();
            const join = () => socket.emit('session_join', { session_id: data.session.session_id });
            if (socket && socket.connected) join();
            else if (socket) socket.once('connect', join);
        }
    } catch (e) {
        console.warn('[ensureSession] 会话创建失败:', e);
    }
}


/* ---- 工厂：根据当前会话上下文创建平台 ---- */
function createNumberBombPlatform() {
    return new Platform(
        session.currentSessionId,
        session.currentSessionState,
        session.currentSessionMode || 'online'
    );
}

export default Platform;
export { ensureSession };
export { createNumberBombPlatform };
