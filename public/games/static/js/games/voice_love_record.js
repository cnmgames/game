import Toast from '../components/toast.js';
import IconFactory from '../components/icon_factory.js';

/* ==================== 有声情书 - 录制流程 Mixin ====================
 * 从 VoiceLoveGame 拆出的录制相关方法，通过 Object.assign 挂到原型。
 * 方法内通过 this 访问实例状态（_stream/_mediaRecorder/_recordings 等）与
 * 其它原型方法（_clearContainer/getContainer/_showConfirmPage/log）。
 */
const RecordMixin = {
    _startRecordingFlow() {
        this._recordings = {};
        this._currentSceneIndex = 0;
        this._showRecordingPage();
    },

    _showRecordingPage() {
        this._clearContainer();
        const container = this.getContainer();
        this._currentPage = 'recording';

        const scenes = this._selectedStory.scenes;
        const total = scenes.length;
        const idx = this._currentSceneIndex;

        const wrapper = document.createElement('div');
        wrapper.className = 'vl-page-center vl-page-fill';

        // 进度条
        const progressBar = document.createElement('div');
        progressBar.className = 'vl-progress-bar';
        progressBar.style.width = '100%';
        const progressFill = document.createElement('div');
        progressFill.className = 'vl-progress-fill';
        progressFill.style.width = `${((idx + 1) / total) * 100}%`;
        progressBar.appendChild(progressFill);
        wrapper.appendChild(progressBar);

        // 进度文字
        const progressText = document.createElement('div');
        progressText.className = 'vl-progress-text';
        progressText.textContent = `${idx + 1} / ${total}`;
        wrapper.appendChild(progressText);

        // 模式指示
        if (this._mode === 'duet') {
            const roleHint = document.createElement('div');
            const isPlayer1 = idx % 2 === 0;
            roleHint.className = isPlayer1 ? 'vl-role-a' : 'vl-role-b';
            roleHint.textContent = isPlayer1 ? '角色 A' : '角色 B';
            wrapper.appendChild(roleHint);
        }

        // 句子展示卡片
        const sentenceCard = document.createElement('div');
        sentenceCard.className = 'vl-sentence-card';
        const sentenceText = document.createElement('div');
        sentenceText.className = 'vl-sentence-text';
        sentenceText.textContent = scenes[idx].text;
        sentenceCard.appendChild(sentenceText);
        wrapper.appendChild(sentenceCard);

        // 录制状态
        const statusEl = document.createElement('div');
        statusEl.className = 'vl-record-status';
        statusEl.textContent = '点击录制按钮开始';
        wrapper.appendChild(statusEl);

        // 录音波形显示（实时音量，直观确认是否录入了声音）
        const waveCanvas = document.createElement('canvas');
        waveCanvas.className = 'vl-waveform';
        waveCanvas.width = 300;
        waveCanvas.height = 80;
        this._waveCanvas = waveCanvas;
        wrapper.appendChild(waveCanvas);

        // 录制按钮
        const recordBtn = document.createElement('button');
        recordBtn.className = 'btn vl-record-btn';
        recordBtn.innerHTML = IconFactory.icon('mic', 28);
        recordBtn.addEventListener('click', () => {
            if (this._isRecording) {
                this._stopRecording(statusEl, recordBtn);
            } else {
                this._startRecording(statusEl, recordBtn);
            }
        });
        wrapper.appendChild(recordBtn);

        // 操作按钮
        const actions = document.createElement('div');
        actions.className = 'vl-actions';

        if (idx > 0) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'btn btn-outline btn-sm';
            prevBtn.textContent = '上一句';
            prevBtn.addEventListener('click', () => {
                this._stopMediaStream();
                this._currentSceneIndex--;
                this._showRecordingPage();
            });
            actions.appendChild(prevBtn);
        }

        // 重新录制
        if (this._recordings[idx] !== undefined) {
            const redoBtn = document.createElement('button');
            redoBtn.className = 'btn btn-outline btn-sm vl-redo-btn';
            redoBtn.textContent = '重录';
            redoBtn.addEventListener('click', () => {
                this._stopMediaStream();
                delete this._recordings[idx];
                this._showRecordingPage();
            });
            actions.appendChild(redoBtn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-primary btn-sm';
        if (idx < total - 1) {
            nextBtn.textContent = '下一句';
            nextBtn.addEventListener('click', () => {
                if (!this._recordings[idx]) {
                    Toast && Toast.show('请先录制这一句', 'error');
                    return;
                }
                this._stopMediaStream();
                this._currentSceneIndex++;
                this._showRecordingPage();
            });
        } else {
            nextBtn.textContent = '完成录制';
            nextBtn.addEventListener('click', () => {
                if (!this._recordings[idx]) {
                    Toast && Toast.show('请先录制这一句', 'error');
                    return;
                }
                this._stopMediaStream();
                this._showConfirmPage();
            });
        }
        actions.appendChild(nextBtn);

        wrapper.appendChild(actions);

        container.appendChild(wrapper);
    },

    async _startRecording(statusEl, recordBtn) {
        // 麦克风属安全上下文 API：HTTP（非 localhost）下 mediaDevices 不可用，
        // 须 HTTPS 或 localhost 访问，否则给出明确提示而非误导性的「权限」报错。
        if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            Toast && Toast.error('录音需 HTTPS 或 localhost；异地使用请在「设置」页下载并安装证书');
            return;
        }
        try {
            // 采集约束：降噪/回声消除/自动增益提升手机录音听感；
            // 采样率与单声道用 ideal（软约束），设备不支持时回退默认不报错
            this._stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: { ideal: 48000 },
                    channelCount: { ideal: 1 },
                },
            });
            // 优先 webm/opus（Chrome 同设备可正常播放）；跨设备兼容由服务端 ffmpeg
            // 统一转码为 mp3 解决（iOS Safari 的 MediaRecorder 会回退到 audio/mp4/AAC）。
            // 注意：不要优先 audio/mp4 —— Chrome 无 AAC 编码器，录出的 mp4 实为 Opus，
            // 而 Chrome 自身对「MP4 容器 + Opus」播放支持不完善，会导致同设备也播不了。
            this._recorderMimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
                .find(t => MediaRecorder.isTypeSupported(t)) || '';
            const recorder = new MediaRecorder(
                this._stream,
                {
                    ...(this._recorderMimeType ? { mimeType: this._recorderMimeType } : {}),
                    audioBitsPerSecond: 128000,   // 128kbps，人声录音接近透明的码率
                }
            );
            this._mediaRecorder = recorder;
            this._audioChunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) this._audioChunks.push(e.data);
            };

            // 注意：onstop 是异步回调，执行时 _stopMediaStream 可能已将 this._mediaRecorder
            // 置 null，故此处必须引用闭包里的局部 recorder，否则抛 TypeError 导致录音丢失
            recorder.onstop = () => {
                const type = recorder.mimeType || this._recorderMimeType || 'audio/webm';
                const blob = new Blob(this._audioChunks, { type });
                this._recordings[this._currentSceneIndex] = blob;
                statusEl.textContent = '录制完成';
                statusEl.style.color = 'var(--success)';
                recordBtn.innerHTML = IconFactory.icon('mic', 28);
                recordBtn.style.background = 'linear-gradient(135deg, #E75480, #F06292)';
                this._isRecording = false;
            };

            recorder.start();
            this._isRecording = true;
            this._startWaveform();   // 启动实时波形显示
            statusEl.textContent = '录制中...';
            statusEl.style.color = 'var(--danger)';
            recordBtn.textContent = '⏹';
            recordBtn.style.background = 'linear-gradient(135deg, #FF6B6B, #FF5252)';
            recordBtn.style.animation = 'pulse-rec 1.5s infinite';
        } catch (e) {
            this.log('麦克风访问失败: ' + e.message);
            Toast && Toast.error('无法访问麦克风，请检查权限设置');
        }
    },

    _stopRecording(statusEl, recordBtn) {
        if (this._mediaRecorder && this._mediaRecorder.state === 'recording') {
            this._mediaRecorder.stop();
        }
        this._stopMediaStream();
        recordBtn.style.animation = '';
        this._isRecording = false;
    },

    _stopMediaStream() {
        this._stopWaveform();   // 停止波形显示
        if (this._stream) {
            this._stream.getTracks().forEach(track => track.stop());
            this._stream = null;
        }
        if (this._mediaRecorder && this._mediaRecorder.state === 'recording') {
            this._mediaRecorder.stop();
        }
        this._mediaRecorder = null;
        this._isRecording = false;
    },

    _startWaveform() {
        // 用 AnalyserNode 分析麦克风音量，实时绘制波形，直观确认是否录入了声音
        const canvas = this._waveCanvas;
        if (!canvas || !this._stream) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this._audioCtx = new AudioCtx();
            this._analyser = this._audioCtx.createAnalyser();
            this._analyser.fftSize = 256;
            this._analyser.smoothingTimeConstant = 0.5;
            const source = this._audioCtx.createMediaStreamSource(this._stream);
            source.connect(this._analyser);
            this._waveData = new Uint8Array(this._analyser.frequencyBinCount);
        } catch (e) {
            this._analyser = null;
            return;   // AudioContext 创建失败（罕见），静默降级
        }

        const ctx2d = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const draw = () => {
            if (!this._analyser || !this._isRecording) {
                this._waveAnimId = null;
                return;
            }
            this._waveAnimId = requestAnimationFrame(draw);

            ctx2d.clearRect(0, 0, w, h);
            // 静音中线
            ctx2d.strokeStyle = 'rgba(231,84,128,0.25)';
            ctx2d.lineWidth = 1;
            ctx2d.beginPath();
            ctx2d.moveTo(0, h / 2);
            ctx2d.lineTo(w, h / 2);
            ctx2d.stroke();

            this._analyser.getByteTimeDomainData(this._waveData);
            ctx2d.strokeStyle = '#E75480';
            ctx2d.lineWidth = 2;
            ctx2d.beginPath();
            const sliceWidth = w / this._waveData.length;
            let x = 0;
            for (let i = 0; i < this._waveData.length; i++) {
                const v = this._waveData[i] / 128.0;   // 128 为静音中心
                const y = v * (h / 2);
                if (i === 0) ctx2d.moveTo(x, y);
                else ctx2d.lineTo(x, y);
                x += sliceWidth;
            }
            ctx2d.stroke();
        };
        draw();
    },

    _stopWaveform() {
        if (this._waveAnimId) {
            cancelAnimationFrame(this._waveAnimId);
            this._waveAnimId = null;
        }
        if (this._audioCtx) {
            try { this._audioCtx.close(); } catch (e) { /* 忽略 */ }
            this._audioCtx = null;
        }
        this._analyser = null;
        this._waveData = null;
        // 清空波形画布
        if (this._waveCanvas) {
            const ctx = this._waveCanvas.getContext('2d');
            ctx && ctx.clearRect(0, 0, this._waveCanvas.width, this._waveCanvas.height);
        }
    },
};

export default RecordMixin;
