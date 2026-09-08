import Toast from '../components/toast.js';
import Dialog from '../components/dialog.js';
import IconFactory from '../components/icon_factory.js';
import API from '../api.js';

/* ==================== 语音情书 - 播放列表页 Mixin ====================
 * 从 VoiceLoveGame 拆出的播放列表页与卡片渲染，通过 Object.assign 挂到原型。
 */
const PlaylistMixin = {
    _showPlaylistPage() {
        this._clearContainer();
        const container = this.getContainer();
        this._currentPage = 'playlist';

        const wrapper = document.createElement('div');
        wrapper.className = 'vl-page';

        // 头部
        const header = document.createElement('div');
        header.className = 'vl-header-spread';
        const title = document.createElement('div');
        title.className = 'vl-title-lg';
        title.textContent = '声音情书';
        header.appendChild(title);

        const recordBtn = document.createElement('button');
        recordBtn.className = 'btn btn-primary vl-record-link-btn';
        recordBtn.textContent = '录制';
        recordBtn.addEventListener('click', () => this._showStorySelectPage());
        header.appendChild(recordBtn);

        wrapper.appendChild(header);

        // 内容区：录制结果列表（同一故事可多份，按录制人/时间区分）
        if (this._recordingList.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'vl-empty';
            empty.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;">${IconFactory.icon('letter', 48)}</div>
                <div>还没有录制完成的故事</div>
                <div>点击右上角「录制」完成你的第一个声音故事吧</div>
            `;
            wrapper.appendChild(empty);
        } else {
            const list = document.createElement('div');
            list.className = 'vl-list';
            for (const rec of this._recordingList) {
                const card = this._createRecordingCard(rec);
                card.addEventListener('click', () => this._showPlaybackPage(rec));
                list.appendChild(card);
            }
            wrapper.appendChild(list);
        }

        container.appendChild(wrapper);
    },

    /* 录制结果卡片：故事名 + 录制人 + 时间 + 删除 */
    _createRecordingCard(rec) {
        const card = document.createElement('div');
        card.className = 'vl-story-card';

        const icon = document.createElement('div');
        icon.className = 'vl-story-card-icon';
        icon.innerHTML = IconFactory.icon('headphones', 20);

        const info = document.createElement('div');
        info.className = 'vl-story-card-info';
        const nameEl = document.createElement('div');
        nameEl.className = 'vl-story-card-name';
        nameEl.textContent = rec.story_title || rec.story_id;
        info.appendChild(nameEl);

        const metaEl = document.createElement('div');
        metaEl.className = 'vl-story-card-meta';
        metaEl.textContent = `${rec.recorder || '未知'} · ${rec.recorded_at || ''}`;
        info.appendChild(metaEl);

        card.appendChild(icon);
        card.appendChild(info);

        const arrow = document.createElement('div');
        arrow.className = 'vl-story-card-arrow';
        arrow.textContent = '▶';
        card.appendChild(arrow);

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-outline btn-sm vl-story-del';
        delBtn.innerHTML = IconFactory.icon('trash', 16);
        delBtn.title = '删除这份录音';
        delBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!await Dialog.confirm(`删除「${rec.story_title || rec.story_id}」的这份录音？`, { title: '删除录音', danger: true })) return;
            const res = await API.deleteRecording(rec.recording_id);
            if (res && res.ok) {
                Toast && Toast.success('已删除');
                await this._loadRecordedList();
                this._showPlaylistPage();
            } else {
                Toast && Toast.error((res && res.error) || '删除失败');
            }
        });
        card.appendChild(delBtn);

        return card;
    },

    _createStoryCard(story, isRecorded = false) {
        const card = document.createElement('div');
        card.className = 'vl-story-card';

        const icon = document.createElement('div');
        icon.className = 'vl-story-card-icon';
        icon.innerHTML = isRecorded ? IconFactory.icon('headphones', 20) : IconFactory.icon('mic', 20);

        const info = document.createElement('div');
        info.className = 'vl-story-card-info';
        const nameEl = document.createElement('div');
        nameEl.className = 'vl-story-card-name';
        nameEl.textContent = story.title;
        info.appendChild(nameEl);

        const descEl = document.createElement('div');
        descEl.className = 'vl-story-card-desc';
        descEl.textContent = story.description || story.desc || '';
        info.appendChild(descEl);

        const metaEl = document.createElement('div');
        metaEl.className = 'vl-story-card-meta';
        metaEl.textContent = story.custom
            ? `自定义 · ${story.scenes.length}个场景`
            : `${story.scenes.length}个场景`;
        info.appendChild(metaEl);

        card.appendChild(icon);
        card.appendChild(info);

        if (isRecorded) {
            const arrow = document.createElement('div');
            arrow.className = 'vl-story-card-arrow';
            arrow.textContent = '▶';
            card.appendChild(arrow);
        }

        return card;
    },
};

export default PlaylistMixin;
