import Settings from '../settings.js';
import Sound from '../sound.js';
import Toast from './toast.js';
import EventBus from '../event_bus.js';
import Router from '../router.js';
import API from '../api.js';
import IconFactory from './icon_factory.js';

/* ==================== 设置页 ====================
 * 对齐 Qt 端 components/settings_page.py
 * 玩家昵称、音量、主题色、操作提示开关。
 */
class SettingsPage {
    constructor() {
        this._el = document.getElementById('page-settings');
        this._content = document.getElementById('settings-content');
        this._onBack = null;
    }

    show(onBack = null) {
        this._onBack = onBack;
        this._el.classList.remove('hidden');
        this._render();
    }

    hide() {
        this._el.classList.add('hidden');
    }

    _render() {
        const s = Settings.getAll();
        const themeBtns = Object.entries(Settings.THEMES).map(([id, t]) => `
            <button class="theme-choice ${s.theme === id ? 'active' : ''}" data-theme="${id}">
                ${t.icon} ${t.name}
            </button>
        `).join('');

        this._content.innerHTML = `
            <div class="settings-main">
                <div class="settings-header">
                    <button class="btn-back" id="settings-back">${IconFactory.icon('arrow-left', 16)} 返回</button>
                    <span class="settings-title">${IconFactory.icon('settings', 18)} 设置</span>
                    <span></span>
                </div>
                <div class="settings-section">
                    <div class="settings-section-title">音量设置</div>
                    <div class="settings-row">
                        <label>音效音量</label>
                        <input type="range" id="settings-sound" min="0" max="100" value="${s.sound_volume}">
                        <span class="settings-val" id="settings-sound-val">${s.sound_volume}%</span>
                    </div>
                    <div class="settings-row">
                        <label>背景音乐</label>
                        <input type="range" id="settings-bgm" min="0" max="100" value="${s.bgm_volume}">
                        <span class="settings-val" id="settings-bgm-val">${s.bgm_volume}%</span>
                    </div>
                </div>
                <div class="settings-section">
                    <div class="settings-section-title">${IconFactory.icon('palette', 18)} 主题色</div>
                    <div class="settings-theme-row">${themeBtns}</div>
                </div>
                <div class="settings-section">
                    <div class="settings-section-title">操作提示</div>
                    <div class="settings-row">
                        <label>显示操作提示浮层</label>
                        <button class="btn btn-sm ${s.show_operation_hints ? 'btn-primary' : 'btn-outline'}" id="settings-hint">
                            ${s.show_operation_hints ? `${IconFactory.icon('check', 16)} 开启` : `${IconFactory.icon('x', 16)} 关闭`}
                        </button>
                    </div>
                </div>
                <div class="settings-section">
                    <div class="settings-section-title">${IconFactory.icon('mic', 18)} 录音证书（手机端）</div>
                    <div class="settings-row">
                        <label>异地录音需手机安装信任证书</label>
                        <button class="btn btn-sm btn-primary" id="settings-download-ca">下载证书</button>
                    </div>
                    <div class="settings-row">
                        <button class="btn btn-sm btn-outline" id="settings-ca-tutorial">查看安装教程 ▾</button>
                    </div>
                    <div id="settings-ca-tutorial-box" class="hidden" style="margin-top:8px;padding:12px;background:rgba(0,0,0,0.04);border-radius:8px;font-size:13px;line-height:1.9;color:var(--text-muted);">
                        <div style="color:var(--text);font-weight:700;margin-bottom:4px;">🍎 iOS（iPhone）</div>
                        <div>1. 点「下载证书」，保存 rootCA.pem</div>
                        <div>2. 打开该文件，允许安装描述文件</div>
                        <div>3. 设置 → 通用 → VPN与设备管理 → 安装</div>
                        <div>4. 设置 → 通用 → 关于本机 → 证书信任设置 → <b style="color:var(--primary);">开启完全信任</b></div>
                        <div style="color:var(--text);font-weight:700;margin:8px 0 4px;">🤖 Android</div>
                        <div>1. 点「下载证书」，保存 rootCA.pem</div>
                        <div>2. 设置 → 安全 → 加密与凭据 → 安装证书 → CA 证书</div>
                        <div>3. 选择下载的 rootCA.pem 完成安装</div>
                    </div>
                </div>
                <button class="btn btn-primary btn-lg" id="settings-save">${IconFactory.icon('save', 18)} 保存设置</button>
            </div>
        `;

        this._content.querySelector('#settings-back').addEventListener('click', () => this._goBack());
        this._content.querySelector('#settings-save').addEventListener('click', () => this._save());

        const soundSlider = this._content.querySelector('#settings-sound');
        soundSlider.addEventListener('input', () => {
            this._content.querySelector('#settings-sound-val').textContent = soundSlider.value + '%';
        });
        const bgmSlider = this._content.querySelector('#settings-bgm');
        bgmSlider.addEventListener('input', () => {
            this._content.querySelector('#settings-bgm-val').textContent = bgmSlider.value + '%';
        });

        const hintBtn = this._content.querySelector('#settings-hint');
        hintBtn.addEventListener('click', () => {
            const on = hintBtn.classList.contains('btn-primary');
            if (on) {
                hintBtn.classList.remove('btn-primary');
                hintBtn.classList.add('btn-outline');
                hintBtn.innerHTML = `${IconFactory.icon('x', 16)} 关闭`;
            } else {
                hintBtn.classList.remove('btn-outline');
                hintBtn.classList.add('btn-primary');
                hintBtn.innerHTML = `${IconFactory.icon('check', 16)} 开启`;
            }
        });

        this._content.querySelectorAll('.theme-choice').forEach(btn => {
            btn.addEventListener('click', () => {
                this._content.querySelectorAll('.theme-choice').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // 录音证书：下载 + 安装教程折叠
        const downloadBtn = this._content.querySelector('#settings-download-ca');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', async () => {
                downloadBtn.disabled = true;
                downloadBtn.textContent = '下载中…';
                try {
                    await API.downloadCert();
                    Toast.success('证书已下载，请按教程安装');
                } catch (e) {
                    Toast.error((e && e.message) || '下载失败');
                } finally {
                    downloadBtn.disabled = false;
                    downloadBtn.textContent = '下载证书';
                }
            });
        }
        const tutorialBtn = this._content.querySelector('#settings-ca-tutorial');
        const tutorialBox = this._content.querySelector('#settings-ca-tutorial-box');
        if (tutorialBtn && tutorialBox) {
            tutorialBtn.addEventListener('click', () => {
                const hidden = tutorialBox.classList.toggle('hidden');
                tutorialBtn.textContent = hidden ? '查看安装教程 ▾' : '收起教程 ▴';
            });
        }
    }

    _save() {
        const sound = parseInt(this._content.querySelector('#settings-sound').value);
        const bgm = parseInt(this._content.querySelector('#settings-bgm').value);
        const theme = this._content.querySelector('.theme-choice.active').dataset.theme;
        const hintOn = this._content.querySelector('#settings-hint').classList.contains('btn-primary');

        Settings.update({
            sound_volume: sound,
            bgm_volume: bgm,
            theme,
            show_operation_hints: hintOn,
        });

        if (Sound) Sound.play('click');
        Toast.success('设置已保存');
        EventBus.emit('settings:saved', Settings.getAll());
        this._goBack();
    }

    _goBack() {
        this.hide();
        if (this._onBack) this._onBack();
        else Router.goToRoom();
    }
}

export default new SettingsPage();
