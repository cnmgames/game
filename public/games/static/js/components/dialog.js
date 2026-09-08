import { escapeHtml } from '../util.js';
import IconFactory from './icon_factory.js';

/* ==================== 公共弹窗组件（替换浏览器原生 confirm/alert） ====================
 * 温馨主题、简约布局、移动端友好（居中卡片 + 大按钮 + 遮罩点击取消）。
 * 用法：
 *   const ok = await Dialog.confirm('确认删除吗？', { title: '删除', danger: true });
 *   await Dialog.alert('已保存');
 */

let _overlay = null;

function _close() {
    if (_overlay) {
        _overlay.remove();
        _overlay = null;
    }
}

function _show({ icon, title, message, danger, buttons }) {
    _close();
    _overlay = document.createElement('div');
    _overlay.className = 'dlg-overlay';
    _overlay.innerHTML = `
        <div class="dlg-panel${danger ? ' dlg-danger' : ''}">
            <div class="dlg-icon">${icon}</div>
            ${title ? `<div class="dlg-title">${escapeHtml(title)}</div>` : ''}
            <div class="dlg-message">${escapeHtml(message)}</div>
            <div class="dlg-actions">${buttons.map(b => `<button class="dlg-btn ${b.cls || ''}">${escapeHtml(b.text)}</button>`).join('')}</div>
        </div>
    `;
    document.body.appendChild(_overlay);

    const btnEls = _overlay.querySelectorAll('.dlg-btn');
    buttons.forEach((b, i) => {
        btnEls[i].addEventListener('click', () => {
            _close();
            if (b.onClick) b.onClick();
        });
    });
    // 点击遮罩 = 取消
    _overlay.addEventListener('click', (e) => {
        if (e.target === _overlay) {
            _close();
            const cancel = buttons.find(b => b.type === 'cancel');
            if (cancel && cancel.onClick) cancel.onClick();
        }
    });
}

const Dialog = {
    confirm(message, opts = {}) {
        return new Promise((resolve) => {
            const danger = !!opts.danger;
            _show({
                icon: danger ? IconFactory.icon('alert', 46) : '💗',
                title: opts.title || '',
                message,
                danger,
                buttons: [
                    {
                        text: opts.cancelText || '取消', cls: 'dlg-btn-cancel', type: 'cancel',
                        onClick: () => resolve(false),
                    },
                    {
                        text: opts.confirmText || '确定',
                        cls: danger ? 'dlg-btn-danger' : 'dlg-btn-primary', type: 'confirm',
                        onClick: () => resolve(true),
                    },
                ],
            });
        });
    },

    alert(message, opts = {}) {
        return new Promise((resolve) => {
            _show({
                icon: opts.icon || '💗',
                title: opts.title || '',
                message,
                buttons: [
                    { text: opts.okText || '好的', cls: 'dlg-btn-primary', onClick: () => resolve() },
                ],
            });
        });
    },
};

export default Dialog;

/* ---- 样式注入 ---- */
(function injectStyles() {
    if (document.getElementById('dlg-styles')) return;
    const style = document.createElement('style');
    style.id = 'dlg-styles';
    style.textContent = `
        .dlg-overlay { position: fixed; inset: 0; background: rgba(58, 24, 40, 0.55); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 24px; animation: dlg-fade-in 0.2s ease; }
        .dlg-panel { background: #fff; border-radius: 22px; padding: 30px 24px 22px; max-width: 320px; width: 100%; text-align: center; box-shadow: 0 14px 44px rgba(0,0,0,0.22); animation: dlg-pop-in 0.25s ease; }
        .dlg-icon { font-size: 46px; margin-bottom: 10px; }
        .dlg-title { font-size: 18px; font-weight: 700; color: #333; margin-bottom: 8px; }
        .dlg-message { font-size: 15px; color: #666; line-height: 1.65; margin-bottom: 24px; word-break: break-word; }
        .dlg-actions { display: flex; gap: 12px; }
        .dlg-btn { flex: 1; padding: 15px 0; border: none; border-radius: 14px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.1s ease; font-family: inherit; -webkit-tap-highlight-color: transparent; touch-action: manipulation; user-select: none; -webkit-user-select: none; }
        .dlg-btn:active { transform: scale(0.96); }
        .dlg-btn-cancel { background: #f1f1f4; color: #666; }
        .dlg-btn-primary { background: linear-gradient(135deg, #E75480, #F06292); color: #fff; box-shadow: 0 4px 14px rgba(231,84,128,0.32); }
        .dlg-btn-danger { background: linear-gradient(135deg, #FF6B6B, #FF5252); color: #fff; box-shadow: 0 4px 14px rgba(255,82,82,0.32); }
        @keyframes dlg-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dlg-pop-in { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
    `;
    document.head.appendChild(style);
})();
