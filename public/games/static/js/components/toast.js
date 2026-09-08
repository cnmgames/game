/* ==================== Toast 提示 ==================== */
class Toast {
    constructor() {
        this.el = document.getElementById('toast');
        this.timer = null;
    }

    show(message, type = '', duration = 2000) {
        if (this.timer) clearTimeout(this.timer);

        this.el.textContent = message;
        this.el.className = 'toast ' + type;
        // 强制 reflow 后再加 show，确保每次都能播放滑入 transition
        // （同步执行，不依赖 requestAnimationFrame —— 避免低端机/繁忙时 rAF
        //   延迟导致提示永不浮现或时序错乱）
        void this.el.offsetWidth;
        this.el.classList.add('show');

        this.timer = setTimeout(() => {
            this.el.classList.remove('show');
            this.timer = null;
        }, duration);
    }

    success(msg) { this.show(msg, 'success'); }
    error(msg) { this.show(msg, 'error'); }
}

export default new Toast();