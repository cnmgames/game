import Toast from '../components/toast.js';
import Dialog from '../components/dialog.js';
import IconFactory from '../components/icon_factory.js';
import API from '../api.js';
import { escapeHtml } from '../util.js';

/* ==================== 语音情书 - 故事浏览/新建/预览页 Mixin ====================
 * 从 VoiceLoveGame 拆出的故事选择、新建自定义故事、拆分预览页。
 */
const BrowseMixin = {
    /* ---------- 故事选择页 ---------- */
    _showStorySelectPage() {
        this._clearContainer();
        const container = this.getContainer();
        this._currentPage = 'story_select';

        const wrapper = document.createElement('div');
        wrapper.className = 'vl-page';

        // 头部（返回 + 标题 + 新建）
        const header = document.createElement('div');
        header.className = 'vl-header vl-header-full';
        header.style.justifyContent = 'space-between';
        const headerLeft = document.createElement('div');
        headerLeft.style.cssText = 'display:flex;align-items:center;gap:12px;';
        headerLeft.appendChild(this._createBackBtn(() => this._showPlaylistPage()));
        const title = document.createElement('div');
        title.className = 'vl-title';
        title.textContent = '选择故事';
        headerLeft.appendChild(title);
        header.appendChild(headerLeft);
        const newBtn = document.createElement('button');
        newBtn.className = 'btn btn-primary btn-sm';
        newBtn.textContent = '＋ 新建';
        newBtn.addEventListener('click', () => this._showCreateStoryPage());
        header.appendChild(newBtn);
        wrapper.appendChild(header);

        // 故事列表
        const list = document.createElement('div');
        list.className = 'vl-list';
        for (const story of this._stories) {
            const card = this._createStoryCard(story);
            card.addEventListener('click', () => {
                this._selectedStory = story;
                this._showModeSelectPage();
            });
            // 自定义故事提供删除入口（连带清理录音）
            if (story.custom) {
                const delBtn = document.createElement('button');
                delBtn.className = 'btn btn-outline btn-sm vl-story-del';
                delBtn.innerHTML = IconFactory.icon('trash', 16);
                delBtn.title = '删除自定义故事';
                delBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (!await Dialog.confirm(`删除自定义故事「${story.title}」？相关录音也会一并删除。`, { title: '删除故事', danger: true })) return;
                    const res = await API.deleteCustomStory(story.id);
                    if (res && res.ok) {
                        Toast && Toast.success('已删除');
                        await this._loadRecordedList();
                        this._showStorySelectPage();
                    } else {
                        Toast && Toast.error((res && res.error) || '删除失败');
                    }
                });
                card.appendChild(delBtn);
            }
            list.appendChild(card);
        }
        wrapper.appendChild(list);

        container.appendChild(wrapper);
    },

    /* ---------- 新建自定义故事 ---------- */
    _showCreateStoryPage() {
        this._clearContainer();
        const container = this.getContainer();
        this._currentPage = 'create';

        const wrapper = document.createElement('div');
        wrapper.className = 'vl-page';

        const header = document.createElement('div');
        header.className = 'vl-header';
        header.appendChild(this._createBackBtn(() => this._showStorySelectPage()));
        const title = document.createElement('div');
        title.className = 'vl-title';
        title.textContent = '新建故事';
        header.appendChild(title);
        wrapper.appendChild(header);

        const hint = document.createElement('div');
        hint.className = 'vl-create-hint';
        hint.textContent = '输入故事全文，保存后自动按句子拆分，逐句朗读录制。';
        wrapper.appendChild(hint);

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'vl-create-input';
        titleInput.placeholder = '故事标题（如：小兔子的晚安）';
        titleInput.maxLength = 40;
        wrapper.appendChild(titleInput);

        const textArea = document.createElement('textarea');
        textArea.className = 'vl-create-textarea';
        textArea.placeholder = '在这里粘贴或输入故事全文…\n\n系统会按句号、感叹号、问号等自动拆分句子。';
        textArea.maxLength = 20000;
        wrapper.appendChild(textArea);

        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn btn-primary btn-lg';
        submitBtn.textContent = '创建故事';
        submitBtn.addEventListener('click', async () => {
            const t = titleInput.value.trim();
            const txt = textArea.value.trim();
            if (!t) { Toast && Toast.show('请输入故事标题', 'error'); return; }
            if (!txt) { Toast && Toast.show('请输入故事内容', 'error'); return; }
            submitBtn.disabled = true;
            submitBtn.textContent = '创建中…';
            try {
                const res = await API.createCustomStory(t, txt);
                if (res && res.story) {
                    await this._loadRecordedList();
                    this._showPreviewPage(res.story);
                } else {
                    Toast && Toast.error((res && res.error) || '创建失败');
                    submitBtn.disabled = false;
                    submitBtn.textContent = '创建故事';
                }
            } catch (e) {
                Toast && Toast.error('创建失败，请重试');
                submitBtn.disabled = false;
                submitBtn.textContent = '创建故事';
            }
        });
        wrapper.appendChild(submitBtn);

        container.appendChild(wrapper);
    },

    /* ---------- 拆分预览页 ---------- */
    _showPreviewPage(story) {
        this._clearContainer();
        const container = this.getContainer();
        this._currentPage = 'preview';

        const wrapper = document.createElement('div');
        wrapper.className = 'vl-page';

        const header = document.createElement('div');
        header.className = 'vl-header vl-header-full';
        header.style.justifyContent = 'space-between';
        const headerLeft = document.createElement('div');
        headerLeft.style.cssText = 'display:flex;align-items:center;gap:12px;';
        headerLeft.appendChild(this._createBackBtn(() => this._showStorySelectPage()));
        const title = document.createElement('div');
        title.className = 'vl-title';
        title.textContent = '拆分预览';
        headerLeft.appendChild(title);
        header.appendChild(headerLeft);
        wrapper.appendChild(header);

        const summary = document.createElement('div');
        summary.className = 'vl-summary-card';
        summary.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 12px;">${IconFactory.icon('book', 48)}</div>
            <div style="font-size: 20px; font-weight: 700; color: var(--text);">${escapeHtml(story.title)}</div>
            <div style="font-size: 13px; color: var(--primary); margin-top: 8px; font-weight: 600;">
                已拆分为 ${story.scenes.length} 个句子
            </div>
        `;
        wrapper.appendChild(summary);

        const sceneList = document.createElement('div');
        sceneList.className = 'vl-scene-list vl-scene-list-full';
        for (let i = 0; i < story.scenes.length; i++) {
            const item = document.createElement('div');
            item.className = 'vl-scene-item';
            item.innerHTML = `
                <span class="vl-scene-idx">${i + 1}</span>
                <span style="color: var(--text);">${escapeHtml(story.scenes[i].text)}</span>
            `;
            sceneList.appendChild(item);
        }
        wrapper.appendChild(sceneList);

        const actions = document.createElement('div');
        actions.className = 'vl-actions';

        const redoBtn = document.createElement('button');
        redoBtn.className = 'btn btn-outline';
        redoBtn.textContent = '删除重写';
        redoBtn.addEventListener('click', async () => {
            if (!await Dialog.confirm('删除这个刚创建的故事并重新输入？', { title: '删除重写', danger: true })) return;
            const res = await API.deleteCustomStory(story.id);
            if (res && res.ok) {
                await this._loadRecordedList();
                this._showCreateStoryPage();
            } else {
                Toast && Toast.error((res && res.error) || '删除失败');
            }
        });
        actions.appendChild(redoBtn);

        const doneBtn = document.createElement('button');
        doneBtn.className = 'btn btn-primary btn-lg';
        doneBtn.textContent = '完成';
        doneBtn.addEventListener('click', () => {
            this._selectedStory = story;
            this._showStorySelectPage();
        });
        actions.appendChild(doneBtn);

        wrapper.appendChild(actions);

        container.appendChild(wrapper);
    },
};

export default BrowseMixin;
