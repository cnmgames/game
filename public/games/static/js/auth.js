/* ==================== 认证管理 ====================
 * token 存储 + 登录态 + 受保护请求封装。
 * 登录成功后 token 存 localStorage，所有受保护请求通过
 * Authorization: Bearer <token> 头携带。
 */
class Auth {
    static TOKEN_KEY = 'treasure_token';
    static USER_KEY = 'treasure_user';

    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    static getUser() {
        try {
            const raw = localStorage.getItem(this.USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    static setSession(token, user) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    static clear() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    static isLoggedIn() {
        return !!this.getToken();
    }

    static authHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': 'Bearer ' + token } : {};
    }

    static async register(nickname, inviteCode) {
        return this._json('/api/auth/register', 'POST', { nickname, invite_code: inviteCode });
    }

    static async login(key) {
        return this._json('/api/auth/login', 'POST', { key });
    }

    static async me() {
        const res = await fetch('/api/auth/me', { headers: this.authHeaders() });
        return res.json();
    }

    // ---- 绑定相关 ----

    static async bindCode() {
        return this._json('/api/bind/code', 'POST', {});
    }

    static async bindWaiting() {
        const res = await fetch('/api/bind/waiting', { headers: this.authHeaders() });
        return res.json();
    }

    static async bindRequest(toUserId) {
        return this._json('/api/bind/request', 'POST', { to_user_id: toUserId });
    }

    static async bindRequests() {
        const res = await fetch('/api/bind/requests', { headers: this.authHeaders() });
        return res.json();
    }

    static async bindAccept(fromUserId) {
        return this._json('/api/bind/accept', 'POST', { from_user_id: fromUserId });
    }

    static async unbind() {
        return this._json('/api/bind/unbind', 'POST', {});
    }

    static async _json(url, method, body) {
        const res = await fetch(url, {
            method,
            headers: { ...this.authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return res.json();
    }
}

export default Auth;
