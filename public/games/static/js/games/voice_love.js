import GameBase from '../game_base.js';
import IconFactory from '../components/icon_factory.js';
import API from '../api.js';
import GameRegistry from '../registry.js';
import RecordMixin from './voice_love_record.js';
import PlaylistMixin from './voice_love_playlist.js';
import BrowseMixin from './voice_love_browse.js';
import FlowMixin from './voice_love_flow.js';
import PlaybackMixin from './voice_love_playback.js';

/* ==================== 语音情书 - 页面主入口与生命周期 ====================
 * 页面渲染按职责拆分：
 *   voice_love_record.js   录音流程（RecordMixin）
 *   voice_love_playlist.js 播放列表页（PlaylistMixin）
 *   voice_love_browse.js   故事选择/新建/预览页（BrowseMixin）
 *   voice_love_flow.js     模式选择/确认保存页（FlowMixin）
 *   voice_love_playback.js 播放页（PlaybackMixin）
 * 本文件保留：状态字段、生命周期、数据加载、通用工具、样式注入。
 */
class VoiceLoveGame extends GameBase {
    constructor(manifest) {
        super(manifest);
        this._currentPage = null;
        this._selectedStory = null;
        this._mode = null; // 'solo' | 'duet'
        this._recordings = {}; // { sceneIndex: Blob }
        this._currentSceneIndex = 0;
        this._mediaRecorder = null;
        this._audioChunks = [];
        this._stream = null;
        this._isRecording = false;
        this._recorderMimeType = null; // 实际使用的录音编码格式
        this._stories = [];           // 故事定义（从 API 加载）
        this._recordingList = [];     // 录制结果列表（同一故事可多份，按录制人/时间区分）
        // 录音波形显示（Web Audio API 实时音量，直观确认是否录入了声音）
        this._audioCtx = null;
        this._analyser = null;
        this._waveData = null;
        this._waveAnimId = null;
        this._waveCanvas = null;
        this._playbackCleanup = null; // 播放页资源清理回调（退出游戏时停止播放并释放 blob URL）
        this._saving = false;          // 保存故事进行中标记（防重复提交）
    }

    /* ---------- 生命周期 ---------- */
    onStart() {
        this._loadRecordedList().then(() => {
            this._showPlaylistPage();
        });
    }

    async _loadRecordedList() {
        try {
            const [storiesRes, recordingsRes] = await Promise.all([
                API.getVoiceLoveStories(),
                API.getVoiceLoveRecordings(),
            ]);
            this._stories = storiesRes.stories || [];
            this._recordingList = recordingsRes.recordings || [];
        } catch (e) {
            // API 不可用时使用空列表
            this._stories = [];
            this._recordingList = [];
        }
    }

    _getStoryById(id) {
        return this._stories.find(s => s.id === id) || null;
    }

    /* ---------- 页面渲染 ---------- */
    _clearContainer() {
        const container = this.getContainer();
        container.innerHTML = '';
    }

    /* ---------- 工具 ---------- */
    _createBackBtn(onClick) {
        const btn = document.createElement('button');
        btn.className = 'vl-back-btn';
        btn.innerHTML = IconFactory.icon('arrow-left', 20);
        btn.addEventListener('click', onClick);
        return btn;
    }

    /* ---------- 生命周期 ---------- */
    onDestroy() {
        // 先停止播放并释放音频资源（否则播放中退出游戏会继续出声）
        if (this._playbackCleanup) {
            try { this._playbackCleanup(); } catch (e) { /* 忽略 */ }
            this._playbackCleanup = null;
        }
        this._stopMediaStream();
        this._recordings = {};
        this._selectedStory = null;
        this._mode = null;
        this.log('游戏销毁');
    }
}

// 将各职责 mixin 挂到原型
Object.assign(VoiceLoveGame.prototype, RecordMixin);
Object.assign(VoiceLoveGame.prototype, PlaylistMixin);
Object.assign(VoiceLoveGame.prototype, BrowseMixin);
Object.assign(VoiceLoveGame.prototype, FlowMixin);
Object.assign(VoiceLoveGame.prototype, PlaybackMixin);

GameRegistry.register('voice_love', VoiceLoveGame);

/* ---- 内联样式（类化，替换原 style.cssText） ---- */
(function injectStyles() {
    if (document.getElementById('vl-styles')) return;
    const style = document.createElement('style');
    style.id = 'vl-styles';
    style.textContent = `
        /* 页面容器 */
        .vl-page { display: flex; flex-direction: column; gap: 20px; height: 100%; }
        .vl-page-center { display: flex; flex-direction: column; gap: 20px; align-items: center; }
        .vl-page-fill { height: 100%; }
        .vl-list { display: flex; flex-direction: column; gap: 12px; }

        /* 头部 */
        .vl-header { display: flex; align-items: center; gap: 12px; }
        .vl-header-full { width: 100%; }
        .vl-header-spread { display: flex; justify-content: space-between; align-items: center; }
        .vl-title { font-size: 20px; font-weight: 700; color: var(--primary); }
        .vl-title-lg { font-size: 22px; font-weight: 700; color: var(--primary); }
        .vl-back-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-light); padding: 4px; line-height: 1; }

        /* 播放列表页 */
        .vl-record-link-btn { background: #E75480; border-radius: 20px; padding: 8px 20px; }
        .vl-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; text-align: center; color: var(--text-muted); font-size: 15px; line-height: 2; padding: 40px; }

        /* 故事卡片 */
        .vl-story-card { background: rgba(255,255,255,0.8); border-radius: var(--radius-lg); padding: 18px; cursor: pointer; transition: all 0.2s ease; border: 2px solid rgba(231,84,128,0.2); display: flex; align-items: center; gap: 14px; }
        .vl-story-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(231,84,128,0.15); border-color: var(--primary); }
        .vl-story-card-icon { font-size: 32px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #fce4ec, #f8bbd0); border-radius: 12px; flex-shrink: 0; }
        .vl-story-card-info { flex: 1; }
        .vl-story-card-name { font-size: 16px; font-weight: 600; color: var(--text); }
        .vl-story-card-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
        .vl-story-card-meta { font-size: 11px; color: var(--primary); margin-top: 4px; }
        .vl-story-card-arrow { font-size: 18px; color: var(--text-muted); }

        /* 模式选择 */
        .vl-story-info { text-align: center; padding: 16px; background: rgba(231,84,128,0.05); border-radius: var(--radius-lg); width: 100%; }
        .vl-modes-row { display: flex; gap: 16px; width: 100%; }
        .vl-mode-btn { flex: 1; background: rgba(255,255,255,0.8); border-radius: var(--radius-lg); padding: 28px 20px; cursor: pointer; transition: all 0.2s ease; border: 2px solid rgba(231,84,128,0.15); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .vl-mode-btn:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(231,84,128,0.2); border-color: var(--primary); }

        /* 录制页 */
        .vl-progress-bar { height: 4px; background: rgba(0,0,0,0.06); border-radius: 2px; overflow: hidden; }
        .vl-progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--primary-light)); border-radius: 2px; transition: width 0.3s ease; }
        .vl-progress-text { font-size: 13px; color: var(--text-muted); }
        .vl-progress-count { font-size: 12px; color: var(--text-muted); white-space: nowrap; }
        .vl-progress-row { width: 100%; display: flex; align-items: center; gap: 10px; }
        .vl-role-a { font-size: 13px; color: #4FC3F7; font-weight: 600; padding: 4px 12px; background: rgba(79,195,247,0.1); border-radius: 12px; }
        .vl-role-b { font-size: 13px; color: #FF8A65; font-weight: 600; padding: 4px 12px; background: rgba(255,138,101,0.1); border-radius: 12px; }
        .vl-sentence-card { width: 100%; background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(252,228,236,0.6)); border-radius: var(--radius-xl); padding: 32px 24px; text-align: center; border: 2px solid rgba(231,84,128,0.15); min-height: 120px; display: flex; align-items: center; justify-content: center; }
        .vl-sentence-card-fade { transition: opacity 0.3s ease; }
        .vl-sentence-text { font-size: 20px; color: var(--text); line-height: 1.8; font-weight: 500; }
        .vl-record-status { font-size: 14px; color: var(--text-muted); min-height: 20px; }
        .vl-waveform { width: 100%; max-width: 340px; height: 80px; background: rgba(255,255,255,0.7); border-radius: 8px; border: 2px solid rgba(231,84,128,0.15); display: block; }
        .vl-record-btn { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #E75480, #F06292); color: white; font-size: 28px; border: none; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(231,84,128,0.4); display: flex; align-items: center; justify-content: center; position: relative; }
        .vl-redo-btn { color: var(--warning); border-color: var(--warning); }
        .vl-actions { display: flex; gap: 12px; align-items: center; }

        @keyframes pulse-rec {
            0%, 100% { box-shadow: 0 4px 15px rgba(255,107,107,0.4); }
            50% { box-shadow: 0 4px 30px rgba(255,107,107,0.8); transform: scale(1.05); }
        }

        /* 确认页 */
        .vl-summary-card { width: 100%; background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(252,228,236,0.6)); border-radius: var(--radius-xl); padding: 28px 24px; text-align: center; border: 2px solid rgba(231,84,128,0.15); }
        .vl-scene-list { width: 100%; display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; }
        .vl-scene-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: rgba(255,255,255,0.6); border-radius: 8px; font-size: 13px; }

        /* 播放页 */
        .vl-player-area { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .vl-audio { width: 100%; display: none; }
        .vl-controls { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: center; }
        .vl-autoplay-toggle { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); cursor: pointer; }
        .vl-checkbox { accent-color: var(--primary); }

        /* 新建故事页 */
        .vl-create-hint { font-size: 13px; color: var(--text-muted); line-height: 1.6; }
        .vl-create-input { width: 100%; padding: 12px 14px; border: 2px solid var(--border); border-radius: var(--radius); font-size: 16px; font-family: inherit; outline: none; background: rgba(255,255,255,0.8); box-sizing: border-box; }
        .vl-create-input:focus { border-color: var(--primary); }
        .vl-create-textarea { width: 100%; min-height: 240px; padding: 12px 14px; border: 2px solid var(--border); border-radius: var(--radius); font-size: 15px; font-family: inherit; line-height: 1.8; outline: none; resize: vertical; background: rgba(255,255,255,0.8); box-sizing: border-box; }
        .vl-create-textarea:focus { border-color: var(--primary); }

        /* 拆分预览页 + 自定义故事删除 */
        .vl-scene-list-full { max-height: none; }
        .vl-scene-idx { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 22px; border-radius: 11px; background: rgba(231,84,128,0.12); color: var(--primary); font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .vl-story-del { margin-left: auto; flex-shrink: 0; padding: 4px 10px; }
    `;
    document.head.appendChild(style);
})();
