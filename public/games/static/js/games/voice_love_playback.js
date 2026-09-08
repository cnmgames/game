import Toast from '../components/toast.js';
import API from '../api.js';

/* ==================== 语音情书 - 播放页 Mixin ====================
 * 从 VoiceLoveGame 拆出的播放页（连播、预加载、进度展示），
 * 通过 Object.assign 挂到原型。
 */
const PlaybackMixin = {
    /* ---------- 播放页面 ---------- */
    _showPlaybackPage(recording) {
        this._clearContainer();
        const container = this.getContainer();
        this._currentPage = 'playback';

        const storyData = this._getStoryById(recording.story_id);
        if (!storyData) {
            this._showPlaylistPage();
            return;
        }
        const scenes = storyData.scenes;
        const recordingId = recording.recording_id;
        let playIndex = 0;
        let autoPlay = true;
        let audioEl = null;

        // 预加载缓存：连播时复用已解码的 Audio，避免逐句 fetch+decode 造成的开头淡入与句间间隙
        const preloaded = new Array(scenes.length).fill(null);
        const preloadScene = async (index) => {
            if (index < 0 || index >= scenes.length) return null;
            if (preloaded[index]) return preloaded[index];
            const url = await API.getAudioBlobUrl(recordingId, index);
            const audio = new Audio(url);
            audio.preload = 'auto';
            preloaded[index] = { url, audio };
            return preloaded[index];
        };
        const cleanup = () => {
            if (audioEl) { audioEl.pause(); audioEl = null; }
            preloaded.forEach((item) => {
                if (item && item.url) URL.revokeObjectURL(item.url);
            });
            preloaded.fill(null);
        };
        // 挂到实例上，退出游戏时由 onDestroy 调用，确保直接退出也能停止播放
        this._playbackCleanup = cleanup;

        const wrapper = document.createElement('div');
        wrapper.className = 'vl-page-center';

        // 头部
        const header = document.createElement('div');
        header.className = 'vl-header vl-header-full';
        const backBtn = this._createBackBtn(() => {
            cleanup();
            this._showPlaylistPage();
        });
        header.appendChild(backBtn);
        const title = document.createElement('div');
        title.className = 'vl-title';
        title.textContent = recording.story_title || storyData.title;
        header.appendChild(title);
        wrapper.appendChild(header);

        // 进度
        const progressRow = document.createElement('div');
        progressRow.className = 'vl-progress-row';
        const progressBar = document.createElement('div');
        progressBar.className = 'vl-progress-bar';
        progressBar.style.flex = '1';
        const progressFill = document.createElement('div');
        progressFill.id = 'vl-playback-progress';
        progressFill.className = 'vl-progress-fill';
        progressFill.style.width = '0%';
        progressBar.appendChild(progressFill);
        progressRow.appendChild(progressBar);

        const progressText = document.createElement('div');
        progressText.id = 'vl-playback-count';
        progressText.className = 'vl-progress-count';
        progressText.textContent = '0 / ' + scenes.length;
        progressRow.appendChild(progressText);
        wrapper.appendChild(progressRow);

        // 句子展示
        const sentenceCard = document.createElement('div');
        sentenceCard.className = 'vl-sentence-card vl-sentence-card-fade';
        const sentenceText = document.createElement('div');
        sentenceText.id = 'vl-playback-sentence';
        sentenceText.className = 'vl-sentence-text';
        sentenceText.textContent = scenes[0].text;
        sentenceCard.appendChild(sentenceText);
        wrapper.appendChild(sentenceCard);

        // 音频播放器
        const playerArea = document.createElement('div');
        playerArea.className = 'vl-player-area';
        const audioElDiv = document.createElement('audio');
        audioElDiv.id = 'vl-audio-player';
        audioElDiv.className = 'vl-audio';
        audioElDiv.controls = true;
        playerArea.appendChild(audioElDiv);
        wrapper.appendChild(playerArea);

        // 更新显示的函数
        const updateDisplay = () => {
            sentenceText.textContent = scenes[playIndex].text;
            progressText.textContent = `${playIndex + 1} / ${scenes.length}`;
            progressFill.style.width = `${((playIndex + 1) / scenes.length) * 100}%`;
        };

        // 播放函数
        const playScene = async (index) => {
            if (audioEl) {
                audioEl.pause();
                audioEl = null;
            }
            playIndex = index;
            updateDisplay();

            try {
                const item = await preloadScene(index);
                if (!item) return;
                audioEl = item.audio;
                audioEl.currentTime = 0;   // 复用已预加载的音频，从头播放
                audioEl.onended = () => {
                    if (autoPlay && playIndex < scenes.length - 1) {
                        playScene(playIndex + 1);
                    }
                };
                audioEl.onerror = () => {
                    Toast && Toast.show('音频加载失败', 'error');
                };
                audioEl.play().catch((err) => {
                    // 自动播放被浏览器拦截（iOS/Android 需用户手势）：提示一次后由用户手动点播放
                    if (err && (err.name === 'NotAllowedError' || err.name === 'AbortError')) {
                        if (autoPlay) {
                            // 关掉自动连播，避免后续每句都在无手势下继续触发
                            autoPlay = false;
                            if (checkbox) checkbox.checked = false;
                        }
                        Toast && Toast.show('点一下「播放」继续听～', 'info');
                    }
                    // 其它播放错误静默（网络瞬时抖动可重试）
                });
                // 预加载下一句，实现无缝连播（消除句间 fetch+decode 间隙）
                if (index + 1 < scenes.length) {
                    preloadScene(index + 1).catch(() => {});
                }
            } catch (e) {
                Toast && Toast.show('音频加载失败', 'error');
            }
        };

        // 控制按钮
        const controls = document.createElement('div');
        controls.className = 'vl-controls';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'btn btn-outline btn-sm';
        prevBtn.textContent = '上一句';
        prevBtn.addEventListener('click', () => {
            if (playIndex > 0) playScene(playIndex - 1);
        });
        controls.appendChild(prevBtn);

        const playBtn = document.createElement('button');
        playBtn.className = 'btn btn-primary btn-sm';
        playBtn.textContent = '播放';
        playBtn.addEventListener('click', () => playScene(playIndex));
        controls.appendChild(playBtn);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-outline btn-sm';
        nextBtn.textContent = '下一句';
        nextBtn.addEventListener('click', () => {
            if (playIndex < scenes.length - 1) playScene(playIndex + 1);
        });
        controls.appendChild(nextBtn);

        const replayBtn = document.createElement('button');
        replayBtn.className = 'btn btn-outline btn-sm';
        replayBtn.textContent = '重播';
        replayBtn.addEventListener('click', () => playScene(playIndex));
        controls.appendChild(replayBtn);

        wrapper.appendChild(controls);

        // 自动播放开关
        const autoToggle = document.createElement('label');
        autoToggle.className = 'vl-autoplay-toggle';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'vl-checkbox';
        checkbox.checked = true;
        checkbox.addEventListener('change', () => { autoPlay = checkbox.checked; });
        autoToggle.appendChild(checkbox);
        autoToggle.appendChild(document.createTextNode('自动播放下一句'));
        wrapper.appendChild(autoToggle);

        container.appendChild(wrapper);

        // 预加载第一句，让用户点击「播放」后立即出声
        preloadScene(0).catch(() => {});
    },
};

export default PlaybackMixin;
