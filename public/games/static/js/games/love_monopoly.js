import GameBase from '../game_base.js';
import LoveMonopolyEngine from '../love_monopoly_engine.js';
import GameRegistry from '../registry.js';
import { session } from '../session.js';
import { ensureSession } from '../platform.js';
import OnlineMixin from './love_monopoly_online.js';

/* ==================== 恋爱大富翁（环形 · 联机对战） ====================
 * 环形 24 格大富翁：起始资金 1500，双方轮流掷骰子（1-6）。
 *   ❤️ 起点：经过/到达领 200 工资
 *   🏠 建筑：无主可建造、自己的可升级、对方的缴费或抽互动（按等级）
 *   💰 资金：随机数额，概率触发猜硬币小游戏
 *   🎲 事件：随机有趣事件（得钱/失钱/位移/双方加成/直接互动）
 *   💞 互动：抽情侣互动任务
 *   🚀/⏪：前进/后退
 * 胜负：资金 ≥ 5000 获胜，或资金 < 0 破产判负。
 * 玩法：服务端权威（OnlineMixin，LoveMonopolyRoom），仅远程联机。
 */
class LoveMonopolyGame extends GameBase {
    constructor(manifest) {
        super(manifest);
        this._online = true;
        this._sessionId = null;
        this._myRole = null;
        this._engine = new LoveMonopolyEngine();
        this._positions = { player1: 0, player2: 0 };
        this._money = { player1: 0, player2: 0 };
        this._buildings = {};
        this._currentPlayer = 'player1';
        this._lastRoll = null;
        this._lastEvt = null;
        this._task = null;
        this._pending = null;      // 待决策（建筑）
        this._pendingMini = false; // 待猜硬币
        this._gameOver = false;
        this._winner = null;
        this._offSocketHandlers = [];
    }

    async onStart() {
        await ensureSession('love_monopoly', 'online');
        this._sessionId = session.currentSessionId;
        const s = session.currentSessionState || {};
        this._myRole = this._inferRole(s);
        this._initOnline();
        this.enableInGamePause();   // 右上角暂停按钮 + 操作菜单(继续/重新开始/退出)
    }

    onDestroy() {
        if (typeof this._clearRollAnim === 'function') this._clearRollAnim();
        this._offSocketHandlers.forEach(off => off());
        this._offSocketHandlers = [];
    }

    /* 共用：互动任务弹窗（双方共用） */
    _showTaskDialog(task, onClose) {
        const overlay = document.createElement('div');
        overlay.className = 'lm-task-overlay';
        overlay.innerHTML = `
            <div class="lm-task-panel">
                <div class="lm-task-icon">💞</div>
                <div class="lm-task-title">情侣互动任务</div>
                <div class="lm-task-text">${task}</div>
                <button class="btn btn-primary" id="lm-task-done">完成啦~</button>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('#lm-task-done').addEventListener('click', () => {
            overlay.remove();
            if (onClose) onClose();
        });
    }
}

Object.assign(LoveMonopolyGame.prototype, OnlineMixin);

GameRegistry.register('love_monopoly', LoveMonopolyGame);

/* ---- 内联样式 ---- */
(function injectStyles() {
    if (document.getElementById('lm-styles')) return;
    const style = document.createElement('style');
    style.id = 'lm-styles';
    style.textContent = `
        .lm-start { text-align: center; padding: 30px 20px; }
        .lm-start-icon { margin-bottom: 12px; color: var(--primary); }
        .lm-start-title { font-size: 26px; font-weight: 800; color: var(--primary); margin-bottom: 8px; }
        .lm-start-desc { color: var(--text-light); font-size: 14px; line-height: 1.6; margin-bottom: 20px; max-width: 480px; margin-left: auto; margin-right: auto; }
        .lm-legend { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
        .lm-legend-item { background: var(--bg-card); padding: 5px 10px; border-radius: var(--radius); font-size: 12px; color: var(--text-light); display: inline-flex; align-items: center; gap: 4px; }
        .lm-legend-start { color: #E75480; }
        .lm-legend-building { color: #FF9800; }
        .lm-legend-bonus { color: #4CAF50; }
        .lm-legend-event { color: #9C27B0; }
        .lm-legend-interaction { color: #E75480; }
        .lm-game { display: flex; flex-direction: column; gap: 14px; align-items: center; }
        .lm-header { display: flex; gap: 14px; justify-content: space-between; align-items: center; width: 100%; max-width: 520px; }
        .lm-stat { display: flex; flex-direction: column; align-items: center; background: var(--bg-card); padding: 6px 14px; border-radius: var(--radius); min-width: 110px; }
        .lm-stat-label { font-size: 12px; color: var(--text-muted); }
        .lm-stat-val { font-size: 15px; font-weight: 700; }
        .lm-p1-color { color: var(--primary); }
        .lm-p2-color { color: var(--info); }
        .lm-turn { font-size: 14px; font-weight: 700; text-align: center; }
        .lm-turn-p1 { color: var(--primary); }
        .lm-turn-p2 { color: var(--info); }
        .lm-board {
            display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: repeat(7, 1fr);
            gap: 5px; width: 100%; max-width: 520px; aspect-ratio: 1;
        }
        .lm-cell {
            position: relative; border-radius: 8px;
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
            border: 2px solid var(--border); background: var(--bg-card); font-size: 14px;
            overflow: hidden; min-height: 0;
        }
        .lm-cell-start { border-color: rgba(231,84,128,0.5); background: rgba(231,84,128,0.08); }
        .lm-cell-building { border-color: rgba(255,152,0,0.5); background: rgba(255,152,0,0.06); }
        .lm-cell-bonus { border-color: rgba(76,175,80,0.5); background: rgba(76,175,80,0.08); }
        .lm-cell-event { border-color: rgba(156,39,176,0.5); background: rgba(156,39,176,0.06); }
        .lm-cell-interaction { border-color: rgba(231,84,128,0.5); background: rgba(231,84,128,0.08); }
        .lm-cell-forward { border-color: rgba(33,150,243,0.5); background: rgba(33,150,243,0.06); }
        .lm-cell-backward { border-color: rgba(255,152,0,0.5); background: rgba(255,152,0,0.08); }
        .lm-cell-built { box-shadow: 0 0 0 2px var(--warning) inset; }
        .lm-cell-icon { font-size: 15px; line-height: 1; color: inherit; }
        .lm-cell-icon svg { width: 20px; height: 20px; }
        .lm-cell-start .lm-cell-icon { color: #E75480; }
        .lm-cell-building .lm-cell-icon { color: #FF9800; }
        .lm-cell-bonus .lm-cell-icon { color: #4CAF50; }
        .lm-cell-event .lm-cell-icon { color: #9C27B0; }
        .lm-cell-interaction .lm-cell-icon { color: #E75480; }
        .lm-cell-forward .lm-cell-icon { color: #2196F3; }
        .lm-cell-backward .lm-cell-icon { color: #FF9800; }
        .lm-cell-normal .lm-cell-icon { color: #78909C; }
        .lm-cell-name { font-size: 8px; color: var(--text-muted); line-height: 1; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .lm-cell-lv { position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: 800; color: var(--warning); }
        .lm-owner { position: absolute; bottom: 1px; left: 2px; font-size: 7px; font-weight: 800; border-radius: 3px; padding: 0 3px; color: #fff; }
        .lm-owner-p1 { background: var(--primary); }
        .lm-owner-p2 { background: var(--info); }
        .lm-token {
            position: absolute; width: 26px; height: 26px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 13px; font-weight: 900; color: #fff; z-index: 5;
            box-shadow: 0 0 8px rgba(0,0,0,0.35);
        }
        .lm-token-p1 {
            top: -6px; left: -6px;
            background: radial-gradient(circle at 35% 30%, #ffb3c7, #E75480 60%, #c2185b);
            border: 2.5px solid #fff;
            box-shadow: 0 0 10px rgba(231,84,128,0.8);
        }
        .lm-token-p2 {
            bottom: -6px; right: -6px;
            background: radial-gradient(circle at 35% 30%, #9be1ff, #2196F3 60%, #0d47a1);
            border: 2.5px solid #fff;
            box-shadow: 0 0 10px rgba(33,150,243,0.8);
        }
        /* 移动中的棋子：放大 + 弹跳 */
        .lm-token.lm-token-moving {
            animation: lm-token-hop 0.35s ease;
            transform: scale(1.6);
            z-index: 6;
        }
        @keyframes lm-token-hop {
            0% { transform: scale(1); }
            40% { transform: scale(1.9) translateY(-4px); }
            100% { transform: scale(1.6); }
        }
        /* 路径上的格子高亮（棋子经过时闪烁） */
        .lm-cell.lm-cell-path {
            box-shadow: inset 0 0 0 3px rgba(255,215,64,0.9);
            transform: scale(1.06);
            z-index: 3;
            transition: box-shadow 0.15s ease, transform 0.15s ease;
        }

        /* 掷骰动画区 */
        .lm-roll-zone { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .lm-dice-wrap {
            width: 76px; height: 76px; border-radius: 16px;
            background: #fff;
            box-shadow: 0 6px 18px rgba(0,0,0,0.25), inset 0 -4px 0 rgba(0,0,0,0.12);
            display: flex; align-items: center; justify-content: center;
            padding: 10px;
        }
        .lm-dice-wrap.rolling { animation: lm-dice-shake 0.16s linear infinite; }
        @keyframes lm-dice-shake {
            0% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(14deg) scale(1.06); }
            50% { transform: rotate(-10deg) scale(1.08); }
            75% { transform: rotate(8deg) scale(1.05); }
            100% { transform: rotate(0deg) scale(1); }
        }
        .lm-dice {
            width: 100%; height: 100%;
            display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);
            gap: 2px;
        }
        .lm-dice-slot { display: flex; align-items: center; justify-content: center; }
        .lm-dice-slot.active::after {
            content: ''; width: 11px; height: 11px; border-radius: 50%;
            background: #c2185b;
            box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2);
        }
        .lm-roll-label { font-size: 14px; font-weight: 700; color: var(--primary); min-height: 20px; }
        .lm-event { min-height: 26px; font-size: 14px; font-weight: 600; color: var(--primary); text-align: center; line-height: 1.4; }
        .lm-by {
            display: inline-block; padding: 1px 10px; border-radius: 10px;
            font-size: 12px; font-weight: 800; margin-right: 4px; color: #fff; vertical-align: 1px;
        }
        .lm-by-p1 { background: linear-gradient(135deg, #ff8fb0, #E75480); }
        .lm-by-p2 { background: linear-gradient(135deg, #6ec8ff, #2196F3); }
        .lm-action { text-align: center; }
        .lm-action-title { font-size: 15px; font-weight: 700; margin-bottom: 10px; color: var(--text); }
        .lm-mini-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .lm-result { text-align: center; }
        .lm-result-title { font-size: 22px; font-weight: 800; color: var(--primary); }
        .lm-footer { display: flex; gap: 8px; }
        .lm-task-overlay {
            position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
            background: rgba(0,0,0,0.55); z-index: 200; padding: 20px;
        }
        .lm-task-panel {
            background: var(--bg-card); border-radius: var(--radius-lg); padding: 28px 24px;
            max-width: 420px; text-align: center; box-shadow: var(--shadow);
        }
        .lm-task-icon { font-size: 44px; margin-bottom: 10px; }
        .lm-task-title { font-size: 18px; font-weight: 800; color: var(--primary); margin-bottom: 10px; }
        .lm-task-text { font-size: 16px; line-height: 1.6; color: var(--text); margin-bottom: 18px; }
    `;
    document.head.appendChild(style);
})();
