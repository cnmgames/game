import Auth from './auth.js';
import Toast from './components/toast.js';
import Dialog from './components/dialog.js';
import { session, connectSocket } from './session.js';

/* ==================== 房间事件处理 Mixin ====================
 * 从 room.js 拆出：socket 房间事件订阅与处理（互动开关 + 游戏建议），
 * 通过 Object.assign(RoomHall.prototype, RoomEventsMixin) 挂载。
 */
const RoomEventsMixin = {
    _myRole() {
        const s = session.currentSessionState || {};
        const meId = (Auth.getUser() || {}).id;
        return (s.host && s.host.id === meId) ? 'player1' : 'player2';
    },

    _bindRoomEvents() {
        const sock = connectSocket();
        const onEvent = (evt) => {
            if (!evt || evt.session_id !== session.currentSessionId) return;
            if (evt.event === 'interaction_request') {
                this._onInteractionRequest(evt);
            } else if (evt.event === 'interaction_set') {
                this._onInteractionSet(evt);
            } else if (evt.event === 'game_suggest') {
                this._onGameSuggest(evt);
            } else if (evt.event === 'game_suggest_denied') {
                // 拒绝方看到「已拒绝」，申请方看到「对方拒绝」
                if (evt.from === this._myRole()) {
                    Toast && Toast.show('已拒绝对方的游戏建议', 'info');
                } else {
                    Toast && Toast.show('对方拒绝了游戏建议', 'info');
                }
            } else if (evt.event === 'interaction_denied') {
                // 拒绝方看到「已拒绝」，申请方看到「对方已拒绝」
                if (evt.from === this._myRole()) {
                    Toast && Toast.show('已拒绝对方的互动申请', 'info');
                } else {
                    Toast && Toast.show('对方已拒绝开启互动', 'info');
                }
            }
        };
        sock.on('session_event', onEvent);
    },

    _emitRoomAction(action, data) {
        const sock = connectSocket();
        sock.emit('session_action', {
            session_id: session.currentSessionId,
            action,
            data: data || {},
        });
    },

    _enableInteractions() {
        this._emitRoomAction('enable_interactions', {});
        Toast && Toast.show('已申请开启互动，等待对方同意…', 'info');
    },

    _disableInteractions() {
        this._emitRoomAction('disable_interactions', {});
    },

    async _onInteractionRequest(evt) {
        // 对方申请开启互动 → 弹窗确认（自己发起的忽略）
        const from = evt.payload && evt.payload.from;
        if (from === this._myRole()) return;
        const agree = await Dialog.confirm('对方申请开启情侣互动，是否同意？', { title: '开启互动' });
        this._emitRoomAction('interaction_response', { agree });
    },

    _onInteractionSet(evt) {
        const enabled = !!(evt.payload && evt.payload.enable_interactions);
        if (session.currentSessionState) {
            session.currentSessionState.room_settings = {
                ...(session.currentSessionState.room_settings || {}),
                enable_interactions: enabled,
            };
        }
        Toast && Toast.success(enabled ? '互动已开启' : '互动已关闭');
        if (this._inRoom) {
            this._render();
        }
    },

    async _onGameSuggest(evt) {
        // 对方建议游玩某游戏 → 弹窗确认（自己发起的忽略）
        const from = evt.payload && evt.payload.from;
        const gameId = evt.payload && evt.payload.game_id;
        if (!gameId || from === this._myRole()) return;
        const game = this._onlineGames.find(g => g.id === gameId);
        const name = game ? game.name : gameId;
        const agree = await Dialog.confirm(`对方建议一起玩「${name}」，是否同意？`, { title: '游戏建议' });
        this._emitRoomAction('game_suggest_response', { agree, game_id: gameId });
    },

    _highlightSelected() {
        const grid = this._el.querySelector('#room-game-grid');
        if (!grid) return;
        grid.querySelectorAll('.game-card').forEach(c => {
            c.classList.toggle('game-card-selected', c.dataset.gameId === this._selectedGame);
        });
    },
};

export default RoomEventsMixin;
