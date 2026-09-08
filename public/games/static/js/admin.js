import Router from './router.js';
import { AuthPage } from './room.js';
import Toast from './components/toast.js';
import Dialog from './components/dialog.js';
import IconFactory from './components/icon_factory.js';
import { escapeHtml } from './util.js';
import App from './app.js';

/* ==================== 管理员后台 ====================
 * 使用管理员专用 Key 登录（独立于用户 Key），签发 admin token。
 * 面板：统计 + 用户列表 + 重置 Key / 解绑 / 删除 / 解除所有绑定。
 */
class AdminPage {
    static TOKEN_KEY = 'admin_token';

    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    static setToken(t) {
        localStorage.setItem(this.TOKEN_KEY, t);
    }

    static clearToken() {
        localStorage.removeItem(this.TOKEN_KEY);
    }

    static headers() {
        const t = this.getToken();
        return t ? { 'Authorization': 'Bearer ' + t } : {};
    }

    constructor() {
        this._el = document.getElementById('page-admin');
    }

    show() {
        this._el.classList.remove('hidden');
        if (App && App.hideModeSwitch) App.hideModeSwitch();
        if (AdminPage.getToken()) {
            this._renderPanel();
        } else {
            this._renderLogin();
        }
    }

    hide() {
        this._el.classList.add('hidden');
    }

    /* ---- 登录 ---- */
    _renderLogin() {
        this._el.innerHTML = `
            <div class="auth-box">
                <h1 class="auth-title">${IconFactory.icon('lock', 22)} 管理员后台</h1>
                <p class="auth-subtitle">输入管理员专用 Key</p>
                <div class="auth-form">
                    <input type="password" id="admin-key" class="auth-input"
                        placeholder="管理员 Key" autocomplete="off">
                    <div class="auth-error" id="admin-error"></div>
                    <button class="btn btn-primary btn-lg" id="admin-login">进入后台</button>
                    <button class="auth-toggle-btn" id="admin-back">${IconFactory.icon('arrow-left', 16)} 返回登录</button>
                </div>
            </div>
        `;
        this._el.querySelector('#admin-login').addEventListener('click', () => this._login());
        this._el.querySelector('#admin-back').addEventListener('click', () => {
            Router.goToAuth();
            AuthPage.show();
        });
        const inp = this._el.querySelector('#admin-key');
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._login(); });
    }

    _showError(msg) {
        const el = this._el.querySelector('#admin-error');
        if (el) el.textContent = msg || '';
    }

    async _login() {
        const key = this._el.querySelector('#admin-key').value.trim();
        if (!key) {
            this._showError('请输入管理员 Key');
            return;
        }
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key }),
        });
        const data = await res.json();
        if (data && data.token) {
            AdminPage.setToken(data.token);
            this._renderPanel();
        } else {
            this._showError((data && data.error) || '登录失败');
        }
    }

    _logout() {
        AdminPage.clearToken();
        this._renderLogin();
    }

    /* ---- 面板 ---- */
    async _renderPanel() {
        this._el.innerHTML = '<div class="bind-loading">加载中...</div>';
        let users = [];
        let stats = {};
        let devices = [];
        let recordings = {};
        try {
            const [usersRes, statsRes, devicesRes, recRes] = await Promise.all([
                fetch('/api/admin/users', { headers: AdminPage.headers() }).then(r => r.json()),
                fetch('/api/admin/stats', { headers: AdminPage.headers() }).then(r => r.json()),
                fetch('/api/admin/devices', { headers: AdminPage.headers() }).then(r => r.json()),
                fetch('/api/admin/recordings', { headers: AdminPage.headers() }).then(r => r.json()),
            ]);
            users = usersRes.users || [];
            stats = statsRes;
            devices = devicesRes.devices || [];
            recordings = recRes || {};
        } catch (e) {
            this._el.innerHTML = '<div class="bind-loading">加载失败</div>';
            return;
        }

        const statsHtml = `
            <div class="admin-stats">
                <div class="admin-stat"><b>${stats.total ?? '-'}</b>账号总数</div>
                <div class="admin-stat"><b>${stats.bound ?? '-'}</b>已绑定</div>
                <div class="admin-stat"><b>${stats.max_users ?? '-'}</b>注册上限</div>
                <div class="admin-stat"><b>${devices.length}</b>访问设备</div>
            </div>
        `;

        const rowsHtml = users.length === 0
            ? '<div class="bind-empty">暂无账号</div>'
            : users.map(u => `
                <div class="admin-row">
                    <div class="admin-row-info">
                        <div class="admin-row-name">${escapeHtml(u.username)}
                            <span class="admin-row-id">#${u.id}</span>
                        </div>
                        <div class="admin-row-meta">
                            ${u.partner_name
                                ? `已绑定 <b>${escapeHtml(u.partner_name)}</b>`
                                : '未绑定'}
                            <span class="admin-row-time">${escapeHtml(u.created_at)}</span>
                        </div>
                    </div>
                    <div class="admin-row-actions">
                        <button class="btn btn-outline btn-sm" data-act="reset-key" data-id="${u.id}">重置 Key</button>
                        <button class="btn btn-outline btn-sm" data-act="unbind" data-id="${u.id}">解绑</button>
                        <button class="btn btn-danger btn-sm" data-act="delete" data-id="${u.id}">删除</button>
                    </div>
                </div>
            `).join('');

        const devicesHtml = devices.length === 0
            ? '<div class="bind-empty">暂无访问记录</div>'
            : devices.map(d => `
                <div class="admin-row">
                    <div class="admin-row-info">
                        <div class="admin-row-name">${d.device_type} · ${d.os} · ${d.browser}</div>
                        <div class="admin-row-meta">
                            ${escapeHtml(d.ip)}
                            <span class="admin-row-time">访问 ${d.visit_count} 次 · 最近 ${escapeHtml(d.last_seen)}</span>
                        </div>
                    </div>
                </div>
            `).join('');

        const recordingsHtml = `
            <div class="admin-recordings">
                <div class="admin-rec-meta">录音占用 <b>${this._formatBytes(recordings.total_bytes ?? 0)}</b> · ${recordings.total_files ?? 0} 个文件</div>
                ${(recordings.total_files ?? 0) > 0 ? '<button class="btn btn-danger btn-sm" id="admin-clean-recordings">清理全部录音</button>' : ''}
            </div>
        `;

        this._el.innerHTML = `
            <div class="bind-box admin-box">
                <div class="admin-header">
                    <h1 class="bind-title">${IconFactory.icon('lock', 22)} 管理员后台</h1>
                    <div class="admin-header-btns">
                        <button class="btn btn-outline btn-sm" id="admin-unbind-all">解除所有绑定</button>
                        <button class="btn-back" id="admin-logout">退出</button>
                    </div>
                </div>
                ${statsHtml}
                <div id="admin-key-result"></div>
                <div class="bind-section">
                    <div class="bind-section-title">账号列表</div>
                    <div id="admin-users">${rowsHtml}</div>
                </div>
                <div class="bind-section">
                    <div class="bind-section-title">访问设备</div>
                    <div id="admin-devices">${devicesHtml}</div>
                </div>
                <div class="bind-section">
                    <div class="bind-section-title">录音管理</div>
                    ${recordingsHtml}
                </div>
            </div>
        `;

        this._el.querySelector('#admin-logout').addEventListener('click', () => this._logout());
        this._el.querySelector('#admin-unbind-all').addEventListener('click', () => this._unbindAll());
        const cleanRecBtn = this._el.querySelector('#admin-clean-recordings');
        if (cleanRecBtn) cleanRecBtn.addEventListener('click', () => this._cleanRecordings());
        this._el.querySelectorAll('#admin-users [data-act]').forEach(btn => {
            btn.addEventListener('click', () => {
                const act = btn.dataset.act;
                const id = parseInt(btn.dataset.id);
                if (act === 'reset-key') this._resetKey(id);
                else if (act === 'unbind') this._unbind(id);
                else if (act === 'delete') this._delete(id);
            });
        });
    }

    async _post(url, body) {
        const res = await fetch(url, {
            method: 'POST',
            headers: { ...AdminPage.headers(), 'Content-Type': 'application/json' },
            body: JSON.stringify(body || {}),
        });
        return res.json();
    }

    _showKeyResult(key, username) {
        const el = document.getElementById('admin-key-result');
        if (!el) return;
        el.innerHTML = `
            <div class="admin-key-result">
                <div>「${escapeHtml(username)}」的新 Key（仅显示一次，请立即保存）：</div>
                <div class="key-display">${escapeHtml(key)}</div>
                <button class="btn btn-outline btn-sm" id="admin-key-copy">${IconFactory.icon('clipboard', 16)} 复制</button>
            </div>
        `;
        el.querySelector('#admin-key-copy').addEventListener('click', () => {
            navigator.clipboard.writeText(key).then(
                () => Toast && Toast.success('已复制'),
                () => Toast && Toast.error('复制失败，请手动复制')
            );
        });
    }

    async _resetKey(id) {
        if (!await Dialog.confirm('确认重置该账号的 Key？旧 Key 将立即失效。', { title: '重置 Key', danger: true })) return;
        const data = await this._post('/api/admin/reset-key', { user_id: id });
        if (data && data.ok) {
            this._showKeyResult(data.key, data.username);
            Toast.success('已重置 Key');
        } else {
            Toast.error((data && data.error) || '操作失败');
        }
    }

    async _unbind(id) {
        if (!await Dialog.confirm('确认解除该账号的绑定关系？', { title: '解绑', danger: true })) return;
        const data = await this._post('/api/admin/unbind', { user_id: id });
        if (data && data.ok) {
            Toast.success('已解绑');
            this._renderPanel();
        } else {
            Toast.error((data && data.error) || '操作失败');
        }
    }

    async _delete(id) {
        if (!await Dialog.confirm('确认删除该账号？此操作不可恢复。', { title: '删除账号', danger: true })) return;
        const data = await this._post('/api/admin/delete', { user_id: id });
        if (data && data.ok) {
            Toast.success('已删除');
            this._renderPanel();
        } else {
            Toast.error((data && data.error) || '操作失败');
        }
    }

    async _unbindAll() {
        if (!await Dialog.confirm('确认解除所有绑定关系？', { title: '解除所有绑定', danger: true })) return;
        const data = await this._post('/api/admin/unbind-all', {});
        if (data && data.ok) {
            Toast.success('已解除所有绑定');
            this._renderPanel();
        } else {
            Toast.error((data && data.error) || '操作失败');
        }
    }

    _formatBytes(bytes) {
        if (!bytes || bytes <= 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        let v = bytes;
        let i = 0;
        while (v >= 1024 && i < units.length - 1) {
            v /= 1024;
            i++;
        }
        return v.toFixed(1) + ' ' + units[i];
    }

    async _cleanRecordings() {
        if (!await Dialog.confirm('确认清理所有录音文件？此操作不可恢复。', { title: '清理录音', danger: true })) return;
        const data = await this._post('/api/admin/recordings/clean', {});
        if (data && data.ok) {
            Toast.success('已清理录音');
            this._renderPanel();
        } else {
            Toast.error((data && data.error) || '操作失败');
        }
    }
}

export default new AdminPage();
