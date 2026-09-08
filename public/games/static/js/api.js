import Auth from './auth.js';

/* ==================== API 客户端 ==================== */
const API = {
    async getGames() {
        const res = await fetch('/api/games');
        return res.json();
    },

    async getScores(gameId) {
        const res = await fetch(`/api/scores/${gameId}`);
        return res.json();
    },

    async getVoiceLoveStories() {
        const res = await fetch('/api/voice_love/stories');
        return res.json();
    },

    async createCustomStory(title, text) {
        const res = await fetch('/api/voice_love/stories', {
            method: 'POST',
            headers: { ...Auth.authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, text })
        });
        return res.json();
    },

    async deleteCustomStory(storyId) {
        const res = await fetch(`/api/voice_love/stories/${storyId}`, {
            method: 'DELETE',
            headers: Auth.authHeaders()
        });
        return res.json();
    },

    async getVoiceLoveRecordings() {
        const res = await fetch('/api/voice_love/recordings', { headers: Auth.authHeaders() });
        return res.json();
    },

    async createRecording(storyId, mode) {
        const res = await fetch('/api/voice_love/recordings', {
            method: 'POST',
            headers: { ...Auth.authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ story_id: storyId, mode: mode || 'solo' })
        });
        return res.json();
    },

    async deleteRecording(recordingId) {
        const res = await fetch(`/api/voice_love/recordings/${recordingId}`, {
            method: 'DELETE',
            headers: Auth.authHeaders()
        });
        return res.json();
    },

    async uploadRecording(recordingId, sceneIndex, audioBlob) {
        const form = new FormData();
        form.append('recording_id', recordingId);
        form.append('scene_index', String(sceneIndex));
        // 按实际编码格式命名扩展名（webm/mp4），后端据此保存正确文件与 Content-Type
        const type = (audioBlob.type || '').toLowerCase();
        const ext = type.includes('mp4') ? 'mp4'
            : type.includes('ogg') ? 'ogg'
            : type.includes('m4a') ? 'm4a'
            : 'webm';
        form.append('audio', audioBlob, `sentence_${String(sceneIndex).padStart(2, '0')}.${ext}`);
        const res = await fetch('/api/voice_love/record', {
            method: 'POST',
            headers: Auth.authHeaders(),
            body: form
        });
        return res.json();
    },

    async getAudioBlobUrl(recordingId, sceneIndex) {
        // 通过 Authorization 头鉴权拉取音频，避免长期 token 进入 URL/历史/日志。
        // 客户端支持 Opus 时告知服务端，优先返回原始录音，避免二次转码损失音质。
        const canPlayOpus = !!(new Audio().canPlayType('audio/webm;codecs=opus'));
        const qs = canPlayOpus ? '?opus=1' : '';
        const res = await fetch(`/api/voice_love/audio/${recordingId}/${sceneIndex}${qs}`, {
            headers: Auth.authHeaders()
        });
        if (!res.ok) {
            throw new Error('audio fetch failed: ' + res.status);
        }
        const blob = await res.blob();
        return URL.createObjectURL(blob);
    },

    async downloadCert() {
        // 下载根 CA 证书（带鉴权），触发浏览器保存为 rootCA.pem
        const res = await fetch('/api/certs/rootCA.pem', { headers: Auth.authHeaders() });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error((data && data.error) || ('download failed: ' + res.status));
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rootCA.pem';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    }
};

export default API;