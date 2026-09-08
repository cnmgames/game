/* ==================== 共享运行时状态 + Socket 连接 ====================
 * 原 window.socket / window.currentSessionXxx 等跨文件可变状态，
 * 收敛为单一模块，供所有模块通过 import 访问，避免依赖 window 全局命名空间。
 */
import Auth from './auth.js';
import EventBus from './event_bus.js';

const SESSION_STORAGE_KEY = 'treasure_session';

export const session = {
    socket: null,
    currentSessionId: null,
    currentSessionState: null,
    currentSessionMode: null,
    currentSessionShowRoomCode: null,
};

export function connectSocket() {
    // 只要 socket 对象已存在就复用（即使当前处于断线/重连中），让 socket.io 自动重连。
    // 若在断线时新建 socket，会丢失 _watchGameSwitch / _bindRoomEvents 等绑定在
    // 旧 socket 上的 session_event 监听器，导致断线重连后收不到游戏建议/互动申请/游戏切换等广播。
    if (session.socket) return session.socket;
    const socket = io({ auth: { token: Auth.getToken() } });
    session.socket = socket;
    socket.on('connect_error', (err) => {
        console.error('[socket] 连接失败:', err && err.message);
        if (err && err.message === 'authentication failed') {
            Auth.clear();
            EventBus.emit('auth:expired');
        }
    });
    socket.on('invite', (data) => {
        EventBus.emit('socket:invite', data);
    });
    // 保持 session.currentSessionState 与服务器同步：
    // 游戏切换（switch_game）、开始/结束等都会广播最新会话状态，
    // 若不同步，返回房间或进入新游戏时会读到陈旧状态。
    socket.on('session_state', (state) => {
        if (state && state.session_id === session.currentSessionId) {
            session.currentSessionState = state;
        }
    });
    // 每次连接成功（含断线重连）后，若仍在会话中则自动重新加入房间。
    // 服务器在断线时已移除该 sid 的房间成员关系，重连后须重新 session_join，
    // 否则收不到 session_event 房间广播。
    socket.on('connect', () => {
        if (session.currentSessionId) {
            socket.emit('session_join', { session_id: session.currentSessionId });
        }
    });
    return socket;
}

export function disconnectSocket() {
    if (session.socket) {
        session.socket.disconnect();
        session.socket = null;
    }
}

export function clearSessionContext() {
    session.currentSessionId = null;
    session.currentSessionState = null;
    session.currentSessionMode = null;
    session.currentSessionShowRoomCode = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function persistSessionContext(ctx) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(ctx));
}

/* ==================== 会话事件绑定（消除各游戏重复 socket 胶水） ====================
 * 统一监听某会话的 session_state / session_event / error 广播，按 session_id 过滤，
 * 返回取消函数。断线重连后自动重新 join（服务器断开时已移除房间成员关系）。
 * 游戏只需提供回调：onState(state) / onEvent(evt) / onError(payload)。
 */
export function bindSessionEvents(sessionId, { onState, onEvent, onError } = {}) {
    const sock = connectSocket();
    if (!sock) return () => {};

    const handleState = (st) => {
        if (!st || st.session_id !== sessionId) return;
        // 全局 currentSessionState 同步已由 connectSocket 内统一处理，此处只转发
        if (onState) onState(st);
    };
    const handleEvent = (evt) => {
        if (!evt || evt.session_id !== sessionId) return;
        if (onEvent) onEvent(evt);
    };
    const handleError = (payload) => {
        if (onError) onError(payload);
    };

    sock.on('session_state', handleState);
    sock.on('session_event', handleEvent);
    sock.on('error', handleError);
    // 断线重连后自动回到会话房间：connectSocket() 内已统一处理 connect → join，
    // 此处无需重复注册；首次绑定如已连接且当前在会话中则补一次 join。

    return () => {
        sock.off('session_state', handleState);
        sock.off('session_event', handleEvent);
        sock.off('error', handleError);
    };
}
