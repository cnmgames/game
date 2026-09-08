import Settings from './settings.js';

/* ==================== 音效管理器 ====================
 * 对齐 Qt 端 components/sound_manager.py
 * 使用 Web Audio API 合成音效，无需音频文件。
 *
 * 使用方式：
 *   Sound.play('click')
 *   Sound.play('win')
 */
class Sound {
    static SOUND_NAMES = ['click', 'turn', 'win', 'lose', 'pause'];

    constructor() {
        this._ctx = null;
        this._muted = false;
        this._volume = 0.7;
    }

    init() {
        this._volume = (Settings.get('sound_volume', 70)) / 100.0;
        // 懒加载 AudioContext（需用户交互后创建）
    }

    _getCtx() {
        if (!this._ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) this._ctx = new AC();
        }
        if (this._ctx && this._ctx.state === 'suspended') {
            this._ctx.resume().catch(() => {});
        }
        return this._ctx;
    }

    play(name) {
        if (this._muted) return;
        const vol = (Settings.get('sound_volume', 70)) / 100.0;
        if (vol <= 0) return;

        const ctx = this._getCtx();
        if (!ctx) return;

        try {
            switch (name) {
                case 'click': this._tone(ctx, 600, 0.06, 'square', vol * 0.4); break;
                case 'turn':  this._tone(ctx, 440, 0.08, 'sine', vol * 0.4); break;
                case 'pause': this._tone(ctx, 330, 0.12, 'sine', vol * 0.4); break;
                case 'win':
                    this._tone(ctx, 523, 0.12, 'sine', vol * 0.5);
                    setTimeout(() => this._tone(ctx, 659, 0.12, 'sine', vol * 0.5), 120);
                    setTimeout(() => this._tone(ctx, 784, 0.2, 'sine', vol * 0.5), 240);
                    break;
                case 'lose':
                    this._tone(ctx, 392, 0.15, 'triangle', vol * 0.5);
                    setTimeout(() => this._tone(ctx, 311, 0.2, 'triangle', vol * 0.5), 150);
                    setTimeout(() => this._tone(ctx, 233, 0.3, 'triangle', vol * 0.5), 300);
                    break;
                default:
                    this._tone(ctx, 600, 0.06, 'sine', vol * 0.4);
            }
        } catch (e) {
            // 音效失败不影响游戏
        }
    }

    _tone(ctx, freq, duration, type, volume) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    }

    mute() { this._muted = true; }
    unmute() { this._muted = false; }
    toggleMute() {
        this._muted = !this._muted;
        return this._muted;
    }
}

export default new Sound();
