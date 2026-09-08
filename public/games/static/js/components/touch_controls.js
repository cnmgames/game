/* ==================== 触屏控件 ====================
 * 为依赖键盘的联机/本地游戏提供移动端屏幕按钮，把触摸操作合成为等价的键盘事件，
 * 使现有游戏逻辑（document 上的 keydown/keyup 监听）无需改动即可兼容移动端。
 *
 * 用法：
 *   TouchControls.show([
 *       [{ key:'a', code:'KeyA', label:'◀' }, ...],   // 玩家1 按钮组
 *       [{ key:'ArrowLeft', code:'ArrowLeft', label:'◀' }, ...],  // 玩家2 按钮组
 *   ]);
 *   TouchControls.hide();
 *
 * 仅在触屏设备上显示；桌面端调用 show 为 no-op，保持原有键盘体验。
 */
const TouchControls = {
    _container: null,

    isTouchDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    },

    /* groups: 二维数组，每个子数组为一组按钮（如玩家1 / 玩家2） */
    show(groups) {
        if (!this.isTouchDevice()) return;
        this.hide();
        this._container = document.createElement('div');
        this._container.className = 'touch-controls';
        groups.forEach((group) => {
            const g = document.createElement('div');
            g.className = 'touch-group';
            group.forEach((b) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'touch-btn';
                btn.textContent = b.label;
                btn.setAttribute('aria-label', b.label);
                this._bind(btn, b.key, b.code);
                g.appendChild(btn);
            });
            this._container.appendChild(g);
        });
        document.body.appendChild(this._container);
    },

    hide() {
        if (this._container) {
            this._container.remove();
            this._container = null;
        }
    },

    _bind(btn, key, code) {
        const down = (e) => { e.preventDefault(); this._dispatch('keydown', key, code); };
        const up = (e) => { e.preventDefault(); this._dispatch('keyup', key, code); };
        btn.addEventListener('touchstart', down, { passive: false });
        btn.addEventListener('touchend', up);
        btn.addEventListener('touchcancel', up);
        // 桌面调试：鼠标可模拟触控
        btn.addEventListener('mousedown', down);
        btn.addEventListener('mouseup', up);
        btn.addEventListener('mouseleave', up);
    },

    _dispatch(type, key, code) {
        try {
            const evt = new KeyboardEvent(type, { key, code, bubbles: true, cancelable: true });
            document.dispatchEvent(evt);
        } catch (e) {
            /* 忽略不支持 KeyboardEvent 构造的环境 */
        }
    },
};

export default TouchControls;
