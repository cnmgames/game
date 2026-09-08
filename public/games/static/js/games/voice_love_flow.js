import Toast from '../components/toast.js';
import IconFactory from '../components/icon_factory.js';
import API from '../api.js';
import { escapeHtml } from '../util.js';

/* ==================== 语音情书 - 模式选择/确认保存页 Mixin ====================
 * 从 VoiceLoveGame 拆出的模式选择、确认保存页面与保存逻辑。
 */
const FlowMixin = {
    /* ---------- 模式选择页 ---------- */
    _showModeSelectPage() {
        this._clearContainer();
        const container = this.getContainer();
        this._currentPage = 'mode_select';

        const wrapper = document.createElement('div');
        wrapper.className = 'vl-page-center';

        // 头部
        const header = document.createElement('div');
        header.className = 'vl-header vl-header-full';
        const backBtn = this._createBackBtn(() => this._showStorySelectPage());
        header.appendChild(backBtn);

        const title = document.createElement('div');
        title.className = 'vl-title';
        title.textContent = '选择模式';
        header.appendChild(title);
        wrapper.appendChild(header);

        // 故事信息
        const storyInfo = document.createElement('div');
        storyInfo.className = 'vl-story-info';
        storyInfo.innerHTML = `
            <div style="font-size: 18px; font-weight: 600; color: var(--text);">${escapeHtml(this._selectedStory.title)}</div>
            <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">${escapeHtml(this._selectedStory.description || this._selectedStory.desc || '')}</div>
            <div style="font-size: 12px; color: var(--primary); margin-top: 6px;">${this._selectedStory.scenes.length}个场景</div>
        `;
        wrapper.appendChild(storyInfo);

        // 模式按钮
        const modes = document.createElement('div');
        modes.className = 'vl-modes-row';

        const soloBtn = this._createModeBtn('单人录制', IconFactory.icon('mic', 40), '独自录制每一个场景，\n把心声说给Ta听');
        soloBtn.addEventListener('click', () => {
            this._mode = 'solo';
            this._startRecordingFlow();
        });
        modes.appendChild(soloBtn);

        const duetBtn = this._createModeBtn('双人录制', '💑', '和Ta一起录制，\n一人一句，更有默契');
        duetBtn.addEventListener('click', () => {
            this._mode = 'duet';
            this._startRecordingFlow();
        });
        modes.appendChild(duetBtn);

        wrapper.appendChild(modes);

        container.appendChild(wrapper);
    },

    _createModeBtn(title, icon, desc) {
        const btn = document.createElement('div');
        btn.className = 'vl-mode-btn';

        btn.innerHTML = `
            <div style="font-size: 40px;">${icon}</div>
            <div style="font-size: 17px; font-weight: 700; color: var(--primary);">${title}</div>
            <div style="font-size: 13px; color: var(--text-muted); line-height: 1.6; white-space: pre-line;">${desc}</div>
        `;
        return btn;
    },

    /* ---------- 确认保存页 ---------- */
    _showConfirmPage() {
        this._clearContainer();
        const container = this.getContainer();
        this._currentPage = 'confirm';

        const scenes = this._selectedStory.scenes;
        const total = scenes.length;
        const recorded = Object.keys(this._recordings).length;

        const wrapper = document.createElement('div');
        wrapper.className = 'vl-page-center';

        // 头部
        const header = document.createElement('div');
        header.className = 'vl-header vl-header-full';
        const backBtn = this._createBackBtn(() => {
            this._currentSceneIndex = total - 1;
            this._showRecordingPage();
        });
        header.appendChild(backBtn);
        const title = document.createElement('div');
        title.className = 'vl-title';
        title.textContent = '确认保存';
        header.appendChild(title);
        wrapper.appendChild(header);

        // 摘要卡片
        const summary = document.createElement('div');
        summary.className = 'vl-summary-card';
        summary.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 12px;">${IconFactory.icon('letter', 48)}</div>
            <div style="font-size: 20px; font-weight: 700; color: var(--text);">${escapeHtml(this._selectedStory.title)}</div>
            <div style="font-size: 14px; color: var(--text-muted); margin-top: 8px;">
                ${this._mode === 'duet' ? '双人录制' : '单人录制'} · ${total}个场景
            </div>
            <div style="font-size: 14px; color: var(--success); margin-top: 8px; font-weight: 600;">
                已录制 ${recorded} / ${total} 句
            </div>
        `;
        wrapper.appendChild(summary);

        // 场景列表预览
        const sceneList = document.createElement('div');
        sceneList.className = 'vl-scene-list';
        for (let i = 0; i < total; i++) {
            const item = document.createElement('div');
            item.className = 'vl-scene-item';
            const status = this._recordings[i] ? IconFactory.icon('check', 16) : IconFactory.icon('x', 16);
            const text = scenes[i].text.length > 25
                ? scenes[i].text.substring(0, 25) + '...'
                : scenes[i].text;
            item.innerHTML = `
                <span>${status}</span>
                <span style="color: var(--text);">${escapeHtml(text)}</span>
            `;
            sceneList.appendChild(item);
        }
        wrapper.appendChild(sceneList);

        // 按钮
        const actions = document.createElement('div');
        actions.className = 'vl-actions';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-outline';
        cancelBtn.textContent = '返回编辑';
        cancelBtn.addEventListener('click', () => {
            this._currentSceneIndex = total - 1;
            this._showRecordingPage();
        });
        actions.appendChild(cancelBtn);

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary btn-lg';
        saveBtn.textContent = '保存故事';
        saveBtn.addEventListener('click', () => this._saveStory(saveBtn));
        actions.appendChild(saveBtn);

        wrapper.appendChild(actions);

        container.appendChild(wrapper);
    },

    async _saveStory(saveBtn) {
        const story = this._selectedStory;
        const scenes = story.scenes;
        const mode = this._mode || 'solo';

        // 防重复提交 + loading 反馈
        if (this._saving) return;
        this._saving = true;
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = '保存中...';
        }

        try {
            // 1. 创建录制结果（记录故事/录制人/时间），拿到 recording_id
            const createRes = await API.createRecording(story.id, mode);
            if (!createRes || !createRes.recording) {
                Toast && Toast.error('创建录制失败');
                return;
            }
            const recordingId = createRes.recording.recording_id;

            // 2. 并行上传所有已录制的句子（串行会让保存随句数线性变慢）
            const tasks = [];
            for (let i = 0; i < scenes.length; i++) {
                if (this._recordings[i]) {
                    tasks.push(API.uploadRecording(recordingId, i, this._recordings[i]));
                }
            }
            const results = await Promise.all(tasks);
            const saved = results.filter(r => r && r.ok).length;

            Toast && Toast.success(`已保存 ${saved} 句录音`);
            this._stopMediaStream();
            await this._loadRecordedList();
            this._showPlaylistPage();
        } catch (e) {
            this.log('保存失败: ' + e.message);
            Toast && Toast.error('保存失败，请重试');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = '保存故事';
            }
        } finally {
            this._saving = false;
        }
    },
};

export default FlowMixin;
