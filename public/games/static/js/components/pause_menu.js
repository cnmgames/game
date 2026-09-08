/* ==================== 暂停菜单浮层 ====================
 * 对齐 Qt 端 components/pause_menu.py
 * 统一暂停菜单：继续 / 重新开始 / 退出游戏。
 */
import IconFactory from './icon_factory.js';

class PauseMenu {
    constructor() {
        this._el = document.getElementById('pause-overlay');
        this._onResume = null;
        this._onRestart = null;
        this._onExit = null;
        this._render();
    }

    _render() {
        this._el.innerHTML = `
            <div class="pause-panel">
                <div class="pause-title">${IconFactory.icon('pause', 18)} 游戏暂停</div>
                <button class="btn btn-primary" id="pause-resume">${IconFactory.icon('play', 18)} 继续游戏</button>
                <button class="btn btn-outline" id="pause-restart">${IconFactory.icon('refresh', 18)} 重新开始</button>
                <button class="btn btn-danger" id="pause-exit">${IconFactory.icon('logout', 18)} 退出游戏</button>
            </div>
        `;
        this._el.querySelector('#pause-resume').addEventListener('click', () => this.hide() && this._onResume && this._onResume());
        this._el.querySelector('#pause-restart').addEventListener('click', () => this.hide() && this._onRestart && this._onRestart());
        this._el.querySelector('#pause-exit').addEventListener('click', () => this._onExit && this._onExit());
    }

    show({ onResume, onRestart, onExit } = {}) {
        this._onResume = onResume || this._onResume;
        this._onRestart = onRestart || this._onRestart;
        this._onExit = onExit || this._onExit;
        this._el.style.display = 'flex';
    }

    hide() {
        this._el.style.display = 'none';
        return true;
    }

    isVisible() {
        return this._el.style.display !== 'none';
    }
}

export default new PauseMenu();
