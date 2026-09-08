import Auth from './auth.js';

/* ==================== 全局设置管理 ====================
 * 对齐 Qt 端 core/settings.py 的设计，使用 localStorage 持久化。
 *
 * 使用方式：
 *   Settings.load()           // 初始化（应用启动时调用一次）
 *   Settings.get('theme')     // 读取
 *   Settings.set('theme', 'blue')  // 写入并持久化
 *   Settings.save()           // 手动持久化
 */
class Settings {
    static KEY = 'treasure_settings';

    static DEFAULTS = {
        sound_volume: 70,
        bgm_volume: 50,
        show_operation_hints: true,
        theme: 'pink',
    };

    // 主题定义（对齐 Qt 端 core/themes.py THEMES）
    static THEMES = {
        pink: { name: '樱花粉', icon: '🌸' },
        yellow: { name: '暖蛋黄', icon: '🌻' },
        blue: { name: '浅海蓝', icon: '🌊' },
    };

    static _data = {};

    static load() {
        try {
            const raw = localStorage.getItem(this.KEY);
            const saved = raw ? JSON.parse(raw) : {};
            this._data = { ...this.DEFAULTS, ...saved };
        } catch (e) {
            this._data = { ...this.DEFAULTS };
        }
        return this._data;
    }

    static save() {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(this._data));
        } catch (e) {
            console.error('[Settings] 保存失败:', e);
        }
    }

    static get(key, fallback = null) {
        if (key in this._data) return this._data[key];
        return (key in this.DEFAULTS) ? this.DEFAULTS[key] : fallback;
    }

    static set(key, value) {
        this._data[key] = value;
        this.save();
        return value;
    }

    static update(patch) {
        Object.assign(this._data, patch);
        this.save();
        return this._data;
    }

    static getAll() {
        return { ...this._data };
    }

    /* 联机玩家昵称：player1=当前登录用户，player2=绑定对象；
     * 未登录/未绑定时回退「玩家1/玩家2」（供彩蛋录音等本地展示兜底） */
    static getPlayerName(playerKey) {
        const u = Auth.getUser();
        if (playerKey === 'player1') return (u && u.username) || '玩家1';
        return (u && u.partner_name) || '玩家2';
    }

    static getPlayerColor(playerKey) {
        return playerKey === 'player1' ? 'var(--primary)' : 'var(--info)';
    }
}

export default Settings;
