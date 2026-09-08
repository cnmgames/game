import Auth from '../auth.js';
import Router from '../router.js';
import Toast from './toast.js';
import IconFactory from './icon_factory.js';
import App from '../app.js';
import AdminPage from '../admin.js';
import { connectSocket } from '../session.js';

/* ==================== 登录 / 注册页 ====================
 * 从 room.js 拆出，独立管理登录/注册表单与 Key 展示。
 */
class AuthPage {
    constructor() {
        this._el = document.getElementById('page-auth');
        this._mode = 'login'; // 'login' | 'register'
        this._bind();
    }

    _bind() {
        const submit = document.getElementById('auth-submit');
        if (submit) submit.addEventListener('click', () => this._submit());
        const toggle = document.getElementById('auth-toggle');
        if (toggle) toggle.addEventListener('click', () => this._switchMode());
        const admin = document.getElementById('auth-admin');
        if (admin) admin.addEventListener('click', () => this._goAdmin());
    }

    _goAdmin() {
        Router.goToAdmin();
        AdminPage.show();
    }

    show() {
        this._el.classList.remove('hidden');
        if (App && App.hideModeSwitch) App.hideModeSwitch();
        this._render();
    }

    hide() {
        this._el.classList.add('hidden');
    }

    _switchMode() {
        this._mode = this._mode === 'login' ? 'register' : 'login';
        this._render();
    }

    _render() {
        if (this._mode === 'login') {
            this._el.innerHTML = `
                <div class="auth-box">
                    <h1 class="auth-title">❤ 我们的宝藏</h1>
                    <p class="auth-subtitle">输入你的专属 Key 进入游戏~</p>
                    <div class="auth-form">
                        <input type="password" id="auth-key" class="auth-input"
                            placeholder="API Key（tb_ 开头）" maxlength="64" autocomplete="off">
                        <div class="auth-error" id="auth-error"></div>
                        <button class="btn btn-primary btn-lg" id="auth-submit">进入游戏</button>
                        <button class="auth-toggle-btn" id="auth-toggle">没有 Key？去注册</button>
                        <button class="auth-toggle-btn" id="auth-admin">${IconFactory.icon('lock', 16)} 管理员后台</button>
                    </div>
                </div>
            `;
            this._bind();
            const keyInput = document.getElementById('auth-key');
            keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._submit(); });
        } else {
            this._el.innerHTML = `
                <div class="auth-box">
                    <h1 class="auth-title">❤ 我们的宝藏</h1>
                    <p class="auth-subtitle">注册一个专属账户~</p>
                    <div class="auth-form">
                        <input type="text" id="auth-nickname" class="auth-input"
                            placeholder="昵称（1-20 字）" maxlength="20" autocomplete="off">
                        <input type="password" id="auth-invite" class="auth-input"
                            placeholder="邀请码" autocomplete="off">
                        <div class="auth-error" id="auth-error"></div>
                        <button class="btn btn-primary btn-lg" id="auth-submit">注册</button>
                        <button class="auth-toggle-btn" id="auth-toggle">已有 Key？去登录</button>
                    </div>
                </div>
            `;
            this._bind();
            const invite = document.getElementById('auth-invite');
            invite.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._submit(); });
        }
    }

    _showError(msg) {
        const el = document.getElementById('auth-error');
        if (el) el.textContent = msg || '';
    }

    async _submit() {
        if (this._mode === 'login') {
            await this._login();
        } else {
            await this._register();
        }
    }

    async _login() {
        const key = document.getElementById('auth-key').value.trim();
        if (!key) {
            this._showError('请输入 API Key');
            return;
        }
        const res = await Auth.login(key);
        if (res && res.token) {
            Auth.setSession(res.token, res.user);
            connectSocket();
            this.hide();
            App.afterLogin(res.user);
        } else {
            this._showError((res && res.error) || '操作失败，请重试');
        }
    }

    async _register() {
        const nickname = document.getElementById('auth-nickname').value.trim();
        const invite = document.getElementById('auth-invite').value.trim();
        if (!nickname || !invite) {
            this._showError('请输入昵称和邀请码');
            return;
        }
        const res = await Auth.register(nickname, invite);
        if (res && res.key) {
            this._showKey(res.key);
        } else {
            this._showError((res && res.error) || '注册失败');
        }
    }

    _showKey(key) {
        this._el.innerHTML = `
            <div class="auth-box">
                <h1 class="auth-title">🎉 注册成功</h1>
                <p class="auth-subtitle">请保存你的专属 Key（仅显示一次）</p>
                <div class="auth-form">
                    <div class="key-display">${key}</div>
                    <button class="btn btn-primary btn-lg" id="key-copy">${IconFactory.icon('clipboard', 16)} 复制 Key</button>
                    <button class="btn btn-outline" id="key-done">已保存，去登录</button>
                </div>
            </div>
        `;
        document.getElementById('key-copy').addEventListener('click', () => {
            navigator.clipboard.writeText(key).then(
                () => Toast && Toast.success('已复制'),
                () => Toast && Toast.error('复制失败，请手动复制')
            );
        });
        document.getElementById('key-done').addEventListener('click', () => {
            this._mode = 'login';
            this._render();
        });
    }
}

export default AuthPage;
