import Auth from './auth.js';
import API from './api.js';
import Toast from './components/toast.js';
import Dialog from './components/dialog.js';
import IconFactory from './components/icon_factory.js';
import App from './app.js';
import EventBus from './event_bus.js';
import AuthPage from './components/auth_page.js';
import { session, connectSocket, persistSessionContext } from './session.js';
import { createGameCard } from './components/game_card.js';
import { escapeHtml } from './util.js';
import RoomEventsMixin from './room_events.js';

/* ==================== 登录页 + 房间大厅 ====================
 * 登录成功后建立 WebSocket 连接（携带 token 鉴权），
 * 进入房间大厅：开房（生成房间码）或输码加入，随后进入数字炸弹。
 */

/* ---- 房间大厅 ---- */
class RoomHall {
    constructor() {
        this._el = document.getElementById('page-room');
        this._onlineGames = [];
        this._selectedGame = '';   // 空：房间未选择游戏（避免默认绑定数字炸弹）
        this._joinMode = 'invite';   // 'invite'（一键邀请）| 'code'（房间码）
        this._inRoom = false;        // 是否在房间内（房间持续，可切换游戏）
        this._roomEventsBound = false;
    }

    getJoinMode() { return this._joinMode; }

    isInRoom() { return this._inRoom; }

    toggleJoinMode() {
        this._joinMode = this._joinMode === 'invite' ? 'code' : 'invite';
        this._render();
    }

    async show() {
        // 大厅：选游戏 + 创建/加入房间
        this._inRoom = false;
        this._el.classList.remove('hidden');
        await this._loadOnlineGames();
        this._render();
    }

    async showRoom() {
        // 房间内：显示房间信息 + 可切换游戏 + 退出房间
        this._inRoom = true;
        this._el.classList.remove('hidden');
        if (!this._roomEventsBound) {
            this._bindRoomEvents();   // 登录后 socket 已建立，延迟绑定
            this._roomEventsBound = true;
        }
        // 确保游戏列表已加载：被邀请进入 / 刷新重连等路径会绕过大厅 show() 的加载，
        // 若 _onlineGames 为空则补加载，否则返回房间后游戏列表为空。
        if (this._onlineGames.length === 0) {
            await this._loadOnlineGames();
        }
        this._render();
    }

    resetRoomEvents() {
        // 退出登录会销毁旧 socket，重登后须在新 socket 上重绑房间事件监听
        this._roomEventsBound = false;
    }

    hide() {
        this._el.classList.add('hidden');
    }

    async _loadOnlineGames() {
        try {
            // online 标志由服务端会话工厂权威返回（/api/games）
            const games = await API.getGames();
            this._onlineGames = games.filter(g => g.online);
        } catch (e) {
            this._onlineGames = [];
        }
        // 仅在已选择但选择失效时才回退；空（未选择）保持空，避免创建房间时默认绑定某游戏
        if (this._selectedGame && !this._onlineGames.some(g => g.id === this._selectedGame)) {
            this._selectedGame = this._onlineGames.length ? this._onlineGames[0].id : '';
        }
    }

    _render() {
        if (this._inRoom) {
            this._renderRoom();
        } else {
            this._renderLobby();
        }
    }

    _renderLobby() {
        const user = Auth.getUser() || {};
        const partner = user.partner_name;
        const joinSection = this._joinMode === 'invite'
            ? this._renderInviteSection(partner)
            : this._renderCodeSection();
        this._el.innerHTML = `
            <div class="room-box">
                <div class="room-header">
                    <span class="room-title">${IconFactory.icon('home', 18)} 房间大厅</span>
                    <span class="room-user">${escapeHtml(user.username || '')}</span>
                </div>
                <div class="room-main">
                    <div class="room-actions">
                        ${joinSection}
                        <div class="auth-error" id="room-error"></div>
                    </div>
                </div>
            </div>
        `;

        this._bindJoinSection();
    }

    _renderRoom() {
        const s = session.currentSessionState || {};
        const roomCode = s.session_id || '';
        const interactionsEnabled = !!(s.room_settings && s.room_settings.enable_interactions);
        const gameGrid = this._onlineGames.map(g => createGameCard(g)).join('');
        const interactionSection = `
            <div class="room-section-title">游玩互动</div>
            <div class="room-interaction">
                <span class="room-interaction-state">${interactionsEnabled ? `${IconFactory.icon('check', 16)} 互动已开启` : `${IconFactory.icon('moon', 16)} 互动未开启`}</span>
                ${!interactionsEnabled
                    ? '<button class="btn btn-outline btn-sm" id="room-enable-interaction">申请开启互动</button>'
                    : '<button class="btn btn-outline btn-sm" id="room-disable-interaction">关闭互动</button>'}
            </div>
        `;
        this._el.innerHTML = `
            <div class="room-box">
                <div class="room-header">
                    <span class="room-title">${IconFactory.icon('home', 18)} 房间内</span>
                    <span class="room-user">房间码：${escapeHtml(roomCode)}</span>
                </div>
                <div class="room-main">
                    <div class="room-section-title">选择游戏（点击建议对方一起玩，对方同意后进入）</div>
                    <div class="game-grid" id="room-game-grid">${gameGrid}</div>
                    ${interactionSection}
                    <div class="room-actions">
                        <button class="btn btn-outline btn-lg" id="room-leave">退出房间</button>
                        <div class="auth-error" id="room-error"></div>
                    </div>
                </div>
            </div>
        `;

        this._bindGameCards();
        this._el.querySelector('#room-leave').addEventListener('click', () => this._leaveRoom());
        const enableBtn = this._el.querySelector('#room-enable-interaction');
        if (enableBtn) enableBtn.addEventListener('click', () => this._enableInteractions());
        const disableBtn = this._el.querySelector('#room-disable-interaction');
        if (disableBtn) disableBtn.addEventListener('click', () => this._disableInteractions());
    }

    _renderInviteSection(partner) {
        return partner
            ? `<div class="room-partner">💞 绑定对象：<b>${escapeHtml(partner)}</b></div>
               <button class="btn btn-primary btn-lg" id="room-invite">${IconFactory.icon('gamepad', 18)} 邀请 TA 一起玩</button>`
            : `<div class="room-partner">尚未绑定对象，点顶部「💞 绑定」先完成绑定</div>`;
    }

    _renderCodeSection() {
        return `
            <button class="btn btn-outline btn-lg" id="room-create">创建房间（房间码）</button>
            <div class="room-join-row">
                <input type="text" id="room-code-input" class="auth-input"
                    placeholder="输入 8 位房间码" maxlength="8" inputmode="numeric">
                <button class="btn btn-outline btn-lg" id="room-join">加入房间</button>
            </div>
        `;
    }

    _bindJoinSection() {
        if (this._joinMode === 'invite') {
            const inviteBtn = this._el.querySelector('#room-invite');
            if (inviteBtn) inviteBtn.addEventListener('click', () => this._invitePartner());
        } else {
            this._el.querySelector('#room-create').addEventListener('click', () => this._create());
            this._el.querySelector('#room-join').addEventListener('click', () => this._join());
            const codeInput = this._el.querySelector('#room-code-input');
            codeInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this._join();
            });
        }
    }

    _bindGameCards() {
        const grid = this._el.querySelector('#room-game-grid');
        if (!grid) return;
        grid.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                // 房间内：点击卡片建议游玩该游戏
                this._suggestGame(card.dataset.gameId);
            });
        });
    }

    _suggestGame(gameId) {
        this._emitRoomAction('suggest_game', { game_id: gameId });
        Toast && Toast.show('已建议对方，等待同意…', 'info');
    }

    _leaveRoom() {
        // 退出房间：销毁会话（服务器 + 本地）+ 回大厅
        if (App && App._destroySession) {
            App._destroySession();
        }
        this._inRoom = false;
        this._render();
    }

    /* ---------- 房间事件（互动开关 + 游戏建议）见 room_events.js mixin ---------- */

    _logout() {
        // 统一走顶部栏退出逻辑
        if (App && App.logout) {
            App.logout();
        }
    }

    _showError(msg) {
        const el = this._el.querySelector('#room-error');
        if (el) el.textContent = msg || '';
    }

    async _create() {
        this._showError('');
        try {
            const res = await fetch('/api/sessions/create', {
                method: 'POST',
                headers: { ...Auth.authHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ game_id: this._selectedGame, mode: 'online' }),
            });
            const data = await res.json();
            if (data && data.session) {
                this._enterSession(data.session);
            } else {
                this._showError((data && data.error) || '创建房间失败');
            }
        } catch (e) {
            this._showError('创建房间失败，请刷新页面重试');
        }
    }

    async _join() {
        const code = this._el.querySelector('#room-code-input').value.trim();
        if (!code) {
            this._showError('请输入房间码');
            return;
        }
        await this._joinByCode(code);
    }

    async _joinByCode(code) {
        this._showError('');
        try {
            const res = await fetch('/api/sessions/join', {
                method: 'POST',
                headers: { ...Auth.authHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: code }),
            });
            const data = await res.json();
            if (data && data.session) {
                this._enterSession(data.session, false);
            } else {
                this._showError((data && data.error) || '加入房间失败');
            }
        } catch (e) {
            this._showError('加入房间失败，请刷新页面重试');
        }
    }

    async _invitePartner() {
        this._showError('');
        let session = null;
        try {
            const res = await fetch('/api/sessions/create', {
                method: 'POST',
                headers: { ...Auth.authHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ game_id: this._selectedGame, mode: 'online' }),
            });
            const data = await res.json();
            if (data && data.session) {
                session = data.session;
            } else {
                this._showError((data && data.error) || '创建房间失败');
                return;
            }
        } catch (e) {
            this._showError('创建房间失败，请刷新页面重试');
            return;
        }
        // 通过 socket 邀请绑定对象
        const socket = connectSocket();
        const sendInvite = () => socket.emit('invite_partner', { session_id: session.session_id });
        if (socket.connected) sendInvite();
        else socket.once('connect', sendInvite);
        this._enterSession(session, false);
    }

    async onInvite(data) {
        if (!data || !data.session_id) return;
        const from = data.from_username || '对方';
        const ok = await Dialog.confirm(`💞 ${from} 邀请你一起玩游戏，是否接受？`, { title: '游戏邀请' });
        if (!ok) return;
        this._joinByCode(data.session_id);
    }

    _enterSession(sess, showRoomCode = true) {
        session.currentSessionId = sess.session_id;
        session.currentSessionState = sess;
        session.currentSessionMode = 'online';
        // 邀请进入 / 被邀请加入时无需展示房间码，仅「创建房间」场景展示
        session.currentSessionShowRoomCode = showRoomCode;
        // 持久化会话上下文，刷新页面后自动重连
        persistSessionContext({
            session_id: sess.session_id,
            game_id: sess.game_id,
            mode: sess.mode || 'online',
        });
        const socket = connectSocket();
        // 确保 socket 已连接后再 session_join
        const join = () => socket.emit('session_join', { session_id: sess.session_id });
        if (socket.connected) {
            join();
        } else {
            socket.once('connect', join);
        }
        this.hide();
        // 进入房间内（展示游戏列表），双方建议游戏后进入
        this.showRoom();
    }
}

const authPage = new AuthPage();
const roomHall = new RoomHall();

// 房间事件处理（互动开关 + 游戏建议）挂到 RoomHall 原型
Object.assign(RoomHall.prototype, RoomEventsMixin);

export { authPage as AuthPage, roomHall as RoomHall };

// 对方邀请事件：由 session.js 的 connectSocket 转发，这里订阅后交给房间大厅处理
EventBus.on('socket:invite', (data) => roomHall.onInvite(data));
