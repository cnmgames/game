import GameBase from '../game_base.js';
import GameRegistry from '../registry.js';
import { session } from '../session.js';
import { ensureSession } from '../platform.js';
import TouchControls from '../components/touch_controls.js';
import OnlineMixin from './math_race_online.js';

/* ==================== 小学数学竞速赛（联机对战） ====================
 * 双方抢答同一道口算题：先答对者得分，答错则对方得分，先到目标分获胜。
 * 服务端权威（MathRaceRoom）出题判题，客户端只拿 {text, options}。
 */
class MathRaceGame extends GameBase {
    constructor(manifest) {
        super(manifest);
        this._online = true;
        this._sessionId = null;
        this._myRole = null;          // 'player1' | 'player2'
        this._difficulty = 'medium';
        this._target = 5;
        this._round = 0;              // 当前题号
        this._score = { player1: 0, player2: 0 };
        this._question = null;        // {text, options}（服务端下发，无答案）
        this._locked = false;         // 本轮已作答（等待判定）
        this._gameOver = false;
        this._keyHandler = null;
        this._offSocketHandlers = [];
        this._nextTimer = null;
    }

    async onStart() {
        await ensureSession('math_race', 'online');
        this._sessionId = session.currentSessionId;
        const s = session.currentSessionState || {};
        this._myRole = this._inferRole(s);
        this._initOnline();
        this.enableInGamePause();   // 右上角暂停按钮 + 操作菜单(继续/重新开始/退出)
    }

    onDestroy() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        if (this._nextTimer) clearTimeout(this._nextTimer);
        this._offSocketHandlers.forEach(off => off());
        this._offSocketHandlers = [];
        TouchControls.hide();
    }
}

Object.assign(MathRaceGame.prototype, OnlineMixin);

GameRegistry.register('math_race', MathRaceGame);

/* ---- 内联样式（与联机渲染共用：题目/选项/结算） ---- */
(function injectStyles() {
    if (document.getElementById('mr-styles')) return;
    const style = document.createElement('style');
    style.id = 'mr-styles';
    style.textContent = `
        .mr-start { text-align: center; padding: 30px 20px; }
        .mr-start-icon { margin-bottom: 12px; color: var(--primary); }
        .mr-start-title { font-size: 26px; font-weight: 800; color: var(--primary); margin-bottom: 8px; }
        .mr-start-desc { color: var(--text-light); font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
        .mr-setting { margin-bottom: 16px; }
        .mr-setting-label { font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
        .mr-setting-options { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .mr-chip {
            padding: 8px 20px; border-radius: 20px; border: 2px solid var(--border);
            background: var(--bg-card); font-size: 14px; font-weight: 600; cursor: pointer;
            transition: all var(--transition); color: var(--text);
        }
        .mr-chip.active {
            border-color: var(--chip-color, var(--primary));
            color: var(--chip-color, var(--primary));
            background: rgba(231,84,128,0.08);
            transform: scale(1.05);
        }
        .mr-waiting { font-size: 15px; color: var(--text-muted); padding: 8px 0; }
        .mr-game { display: flex; flex-direction: column; gap: 16px; align-items: center; }
        .mr-header { display: flex; gap: 16px; justify-content: space-between; align-items: center; width: 100%; max-width: 560px; }
        .mr-stat { display: flex; flex-direction: column; align-items: center; background: var(--bg-card); padding: 6px 16px; border-radius: var(--radius); min-width: 80px; }
        .mr-stat-label { font-size: 12px; color: var(--text-muted); }
        .mr-stat-val { font-size: 22px; font-weight: 800; color: var(--primary); }
        .mr-target-info { font-size: 13px; color: var(--text-muted); }
        .mr-question {
            font-size: 34px; font-weight: 800; color: var(--text); text-align: center;
            background: linear-gradient(135deg, rgba(231,84,128,0.06), rgba(231,84,128,0.12));
            border-radius: var(--radius-lg); padding: 28px 24px; width: 100%; max-width: 560px;
            min-height: 96px; display: flex; align-items: center; justify-content: center;
        }
        .mr-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 560px; }
        .mr-option {
            position: relative; display: flex; align-items: center; justify-content: center; gap: 8px;
            padding: 16px 12px; border-radius: var(--radius-lg); border: 2px solid var(--border);
            background: var(--bg-card); cursor: pointer; font-size: 24px; font-weight: 700; color: var(--text);
            transition: all var(--transition);
        }
        .mr-option:hover { transform: translateY(-2px); box-shadow: var(--shadow); border-color: var(--primary); }
        .mr-option-key { position: absolute; top: 8px; left: 10px; font-size: 11px; font-weight: 700; color: var(--primary); background: rgba(231,84,128,0.1); border-radius: 4px; padding: 1px 6px; }
        .mr-option.correct { border-color: var(--success); background: rgba(76,175,80,0.15); color: var(--success); transform: scale(1.03); }
        .mr-option.wrong { border-color: var(--danger); background: rgba(244,67,54,0.12); color: var(--danger); }
        .mr-option.dim { opacity: 0.4; }
        .mr-feedback { min-height: 28px; font-size: 16px; font-weight: 700; text-align: center; }
        .mr-fb-win { color: var(--success); }
        .mr-fb-lose { color: var(--danger); }
        .mr-over { text-align: center; padding: 30px 20px; }
        .mr-over-icon { color: var(--warning); margin-bottom: 12px; }
        .mr-over-title { font-size: 28px; font-weight: 800; color: var(--primary); margin-bottom: 16px; }
        .mr-over-score { display: flex; justify-content: center; gap: 14px; align-items: center; font-size: 22px; font-weight: 800; margin-bottom: 24px; }
        .mr-over-vs { color: var(--text-muted); }
        .mr-over-actions { display: flex; gap: 12px; justify-content: center; }
    `;
    document.head.appendChild(style);
})();
