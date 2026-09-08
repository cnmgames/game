import Auth from './auth.js';
import Toast from './components/toast.js';
import { escapeHtml } from './util.js';
import App from './app.js';
import IconFactory from './components/icon_factory.js';

/* ==================== 绑定弹窗（浮层） ====================
 * 未绑定用户点击顶部栏「绑定状态」打开此弹窗：显示我的雪花 ID +
 * 等待列表 + 收到的申请。雪花 ID（去时间戳短码）用于防止同名绑错，
 * 昵称用于列表辨认。绑定成功后关闭弹窗并刷新顶部栏。
 */
class BindPage {
    constructor() {
        this._el = document.getElementById('page-bind');
        this._card = document.getElementById('bind-modal-card');
        this._mask = document.getElementById('bind-modal-mask');
        if (this._mask) {
            this._mask.addEventListener('click', () => this.hide());
        }
    }

    show() {
        this._el.classList.remove('hidden');
        this._load();
    }

    hide() {
        this._el.classList.add('hidden');
    }

    async _load() {
        this._card.innerHTML = '<div class="bind-loading">加载中...</div>';
        try {
            const codeRes = await Auth.bindCode();
            const myCode = codeRes.code;
            const me = Auth.getUser() || {};
            const waitingRes = await Auth.bindWaiting();
            this._render(myCode, me.username, waitingRes.waiting, waitingRes.me_id);
            this._refreshRequests();
        } catch (e) {
            this._card.innerHTML = '<div class="bind-loading">加载失败，请刷新</div>';
        }
    }

    _render(myCode, myNickname, waiting, meId) {
        const others = (waiting || []).filter(u => u.id !== meId);
        const waitingHtml = others.length === 0
            ? '<div class="bind-empty">暂无其他等待用户</div>'
            : others.map(u => `
                <div class="bind-item">
                    <span class="bind-item-name">${escapeHtml(u.nickname)}${u.code ? ` <i class="bind-code">${escapeHtml(u.code)}</i>` : ''}</span>
                    <button class="btn btn-primary btn-sm" data-id="${u.id}">发起申请</button>
                </div>
            `).join('');

        this._card.innerHTML = `
            <div class="bind-box">
                <div class="bind-modal-head">
                    <h1 class="bind-title">💞 绑定关系</h1>
                    <button class="bind-close" id="bind-close">${IconFactory.icon('x', 18)}</button>
                </div>
                <div class="bind-me">
                    <div class="bind-me-label">我的信息</div>
                    <div class="bind-me-row">昵称：<b>${escapeHtml(myNickname)}</b></div>
                    <div class="bind-me-row">雪花 ID：<b class="bind-code">${escapeHtml(myCode)}</b></div>
                </div>
                <div class="bind-section">
                    <div class="bind-section-title">等待绑定的用户</div>
                    <div id="bind-waiting">${waitingHtml}</div>
                </div>
                <div class="bind-section">
                    <div class="bind-section-title">收到的申请</div>
                    <div id="bind-requests"></div>
                </div>
            </div>
        `;

        this._card.querySelector('#bind-close').addEventListener('click', () => this.hide());
        this._card.querySelectorAll('#bind-waiting button').forEach(btn => {
            btn.addEventListener('click', () => this._request(parseInt(btn.dataset.id)));
        });
    }

    async _refreshRequests() {
        const reqEl = this._card.querySelector('#bind-requests');
        if (!reqEl) return;
        const reqRes = await Auth.bindRequests();
        const reqs = reqRes.requests || [];
        if (reqs.length === 0) {
            reqEl.innerHTML = '<div class="bind-empty">暂无申请</div>';
            return;
        }
        reqEl.innerHTML = reqs.map(r => `
            <div class="bind-item">
                <span class="bind-item-name">${escapeHtml(r.nickname)}${r.code ? ` <i class="bind-code">${escapeHtml(r.code)}</i>` : ''}</span>
                <button class="btn btn-success btn-sm" data-id="${r.from_user_id}">接受</button>
            </div>
        `).join('');
        reqEl.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => this._accept(parseInt(btn.dataset.id)));
        });
    }

    async _request(toUserId) {
        const res = await Auth.bindRequest(toUserId);
        if (res && res.ok) {
            Toast.success('申请已发送');
            this._load();
        } else {
            Toast.error((res && res.error) || '申请失败');
        }
    }

    async _accept(fromUserId) {
        const res = await Auth.bindAccept(fromUserId);
        if (res && res.ok) {
            Toast.success('绑定成功！');
            const meRes = await Auth.me();
            if (meRes.user) {
                Auth.setSession(Auth.getToken(), meRes.user);
            }
            this.hide();
            if (App && App.refreshTopbar) App.refreshTopbar();
        } else {
            Toast.error((res && res.error) || '接受失败');
        }
    }
}

export default new BindPage();
