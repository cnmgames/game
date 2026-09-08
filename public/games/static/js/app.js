import Settings from './settings.js';
import Sound from './sound.js';
import EventBus from './event_bus.js';
import Toast from './components/toast.js';
import Dialog from './components/dialog.js';
import IconFactory from './components/icon_factory.js';
import Auth from './auth.js';
import Router from './router.js';
import GameRegistry from './registry.js';
import { connectSocket, disconnectSocket, clearSessionContext } from './session.js';
import { AuthPage, RoomHall } from './room.js';
import BindPage from './bind.js';
import SettingsPage from './components/settings_page.js';
import SessionMixin from './app_session.js';
// 副作用模块：情侣提示（绑定 EventBus）+ 飘动背景（自启动动画）
import './components/couple_tips.js';
import './components/floating_bg.js';

/* ==================== 应用入口 ==================== */
const App = {
    _currentGame: null,

    init() {
        // 加载全局设置
        Settings.load();
        Sound.init();
        App.applyTheme(Settings.get('theme'));

        // 游戏通过 GameRegistry 自注册 + 按需动态加载，无需在此维护注册表

        // 监听开始游戏（房间内建议同意后进入）
        EventBus.on('game:play', (game) => this._launchGame(game));

        // 监听设置保存
        EventBus.on('settings:saved', (settings) => {
            this.applyTheme(settings.theme);
        });

        // 彩蛋入口：飘动背景中的金色星芒被点击（房间内可用）
        EventBus.on('easter_egg:trigger', () => this._onStarClick());

        // 顶部栏设置按钮
        const settingsBtn = document.getElementById('topbar-settings');
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.openSettings());

        // 顶部栏退出按钮
        const logoutBtn = document.getElementById('topbar-logout');
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());

        // 启动流程：先登录，后进入联机房间大厅
        if (Auth.isLoggedIn()) {
            connectSocket();
            this._watchGameSwitch();
            this.afterLogin(Auth.getUser());
        } else {
            AuthPage.show();
        }
    },

    applyTheme(themeId) {
        document.body.setAttribute('data-theme', themeId || 'pink');
    },

    _onStarClick() {
        // 彩蛋（有声情书）仅房间大厅/房间内可进入
        const page = Router.currentPage;
        if (page !== 'room') return;
        const manifest = {
            id: 'voice_love',
            name: '有声情书',
            description: '录下你的声音，成为TA的专属故事',
            category_id: 'casual',
            difficulty: '简单',
            min_players: 1,
            max_players: 2,
            hidden: true,
            icon: 'letter',
        };
        // 房间内进入则返回房间内（保留会话），否则返回大厅
        const fromRoom = RoomHall && RoomHall.isInRoom();
        this._launchGame(manifest, () => {
            if (this._currentGame) {
                this._currentGame.destroy();
                this._currentGame = null;
            }
            if (fromRoom) {
                // 房间内进入：保留会话，返回房间内
                this.enterRoom();
            } else {
                // 大厅进入：清空会话，返回大厅
                this._clearSessionContext();
                this.enterRoomHall();
            }
        });
    },

    async _launchGame(game, onBack = null) {
        // 按需加载游戏脚本（首次点击时动态拉取，之后走缓存）
        const cls = await GameRegistry.ensure(game.id);
        if (!cls) {
            Toast.error(`游戏 "${game.name}" 暂未实现`);
            return;
        }

        Router.goToGame(game.id, game.name);

        if (this._currentGame) {
            this._currentGame.destroy();
        }

        const gameInstance = new cls(game);
        const container = Router.getGameContent();
        gameInstance.init(container);
        this._currentGame = gameInstance;

        Router.setOnBack(onBack || (() => {
            gameInstance.destroy();
            this._currentGame = null;
            // 联机游戏退出：返回房间大厅
            this.enterRoomHall();
        }));

        gameInstance.start();
    },

    enterRoomHall() {
        Router.goToRoom();
        RoomHall.show();
        this._startBindWatcher();
    },

    enterRoom() {
        // 返回房间内（保留会话，可切换游戏；退出游戏后双方回到此处）
        Router.goToRoom();
        RoomHall.showRoom();
    },

    /* ---------- 会话/游戏生命周期（_watchGameSwitch/_launchOnlineGame/_tryRestoreSession/
     * 退出与销毁）见 app_session.js mixin ---------- */

    openBindModal() {
        BindPage.show();
    },

    _startBindWatcher() {
        this._stopBindWatcher();
        this._bindWatcherTimer = setInterval(async () => {
            if (!Auth.isLoggedIn()) return;
            const oldUser = Auth.getUser();
            const meRes = await Auth.me();
            if (!meRes || !meRes.user) return;
            const user = meRes.user;
            const wasBound = !!(oldUser && oldUser.partner_id);
            const nowBound = !!user.partner_id;
            Auth.setSession(Auth.getToken(), user);
            if (wasBound === nowBound) return;
            if (nowBound) {
                // 刚绑定成功（在绑定弹窗等待对方接受）
                Toast && Toast.success('绑定成功！');
                BindPage.hide && BindPage.hide();
            } else {
                // 刚被解除绑定（管理员解绑或自助解绑）
                Toast && Toast.error('绑定关系已解除');
            }
            this.refreshTopbar();
            // 重新渲染房间大厅，更新绑定对象显示与邀请按钮
            if (Router.currentPage === 'room') {
                RoomHall.show();
            }
        }, 2000);
    },

    _stopBindWatcher() {
        if (this._bindWatcherTimer) {
            clearInterval(this._bindWatcherTimer);
            this._bindWatcherTimer = null;
        }
    },

    _clearSessionContext() {
        clearSessionContext();
    },

    openSettings() {
        // 顶部栏设置入口：从哪里访问就返回哪里
        const fromRoom = RoomHall && RoomHall.isInRoom();
        if (this._currentGame) {
            this._currentGame.destroy();
            this._currentGame = null;
        }
        // 房间内进入：保留会话（返回房间内）；否则清空会话回大厅
        if (!fromRoom) this._clearSessionContext();
        const back = fromRoom ? () => this.enterRoom() : () => this.enterRoomHall();
        Router.goToSettings();
        SettingsPage.show(back);
    },

    showTopbar() {
        const el = document.getElementById('topbar');
        if (!el) return;
        el.classList.remove('hidden');
        document.body.classList.add('has-topbar');
        this.refreshTopbar();
        this.refreshOnlineModeButton();
    },

    refreshOnlineModeButton() {
        const btn = document.getElementById('topbar-online-mode');
        if (!btn) return;
        const joinMode = RoomHall ? RoomHall.getJoinMode() : 'invite';
        // 按钮显示「切换目标」：当前邀请 → 点击切到房间码
        btn.innerHTML = joinMode === 'invite' ? `${IconFactory.icon('key', 16)} 房间码` : '💞 邀请';
        btn.onclick = () => {
            if (RoomHall) {
                RoomHall.toggleJoinMode();
                this.refreshOnlineModeButton();
            }
        };
    },

    refreshTopbar() {
        const user = Auth.getUser() || {};
        const btn = document.getElementById('topbar-bind');
        if (!btn) return;
        if (user.partner_name) {
            btn.textContent = `💞 ${user.partner_name}`;
            btn.onclick = () => this._unbindPartner(user.partner_name);
        } else {
            btn.textContent = '💞 未绑定';
            btn.onclick = () => this.openBindModal();
        }
    },

    async _unbindPartner(partnerName) {
        if (!await Dialog.confirm(`确定解除与 ${partnerName} 的绑定关系？`, { title: '解除绑定', danger: true })) return;
        Auth.unbind().then((res) => {
            if (res && res.ok) {
                Toast && Toast.success('已解除绑定');
                this.refreshTopbar();
            } else {
                Toast && Toast.error((res && res.error) || '解绑失败');
            }
        });
    },

    logout() {
        disconnectSocket();
        this._watchBound = false;   // 重新登录会新建 socket，需在新 socket 上重绑会话事件
        if (RoomHall && RoomHall.resetRoomEvents) RoomHall.resetRoomEvents();   // 同理重置房间事件绑定
        this._clearSessionContext();
        this._stopBindWatcher();
        if (this._currentGame) {
            this._currentGame.destroy();
            this._currentGame = null;
        }
        Auth.clear();
        const tb = document.getElementById('topbar');
        if (tb) tb.classList.add('hidden');
        document.body.classList.remove('has-topbar');
        Router.goToAuth();
        AuthPage.show();
    }
};

Object.assign(App, SessionMixin);

document.addEventListener('DOMContentLoaded', () => App.init());

export default App;
