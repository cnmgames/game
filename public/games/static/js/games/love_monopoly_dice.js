/* ==================== 恋爱大富翁 - 骰子 UI 共享工具 ====================
 * 3×3 点阵布局渲染骰子点数；供掷骰动画复用。
 * 点阵位置（3×3 网格索引）：0..8，标准骰子点数排布。
 */
const PIPS = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
};

/* 仅点阵部分（9 个 slot），便于滚动动画中高频替换 */
function diceSlotsHtml(value) {
    const n = Math.max(1, Math.min(6, Math.round(value) || 1));
    const active = PIPS[n] || PIPS[1];
    return Array.from({ length: 9 }, (_, i) =>
        `<span class="lm-dice-slot${active.includes(i) ? ' active' : ''}"></span>`
    ).join('');
}

/* 完整骰子（含外框），用于停定展示 */
function diceHtml(value) {
    return `<div class="lm-dice" id="lm-dice">${diceSlotsHtml(value)}</div>`;
}

/* 掷骰动画区 HTML：rolling=true 显示滚动中的骰子（点数由调用方驱动） */
function rollZoneHtml({ rolling = false, value = null, label = '' } = {}) {
    return `
        <div class="lm-action lm-roll-zone" id="lm-roll-zone">
            <div class="lm-dice-wrap${rolling ? ' rolling' : ''}">${diceHtml(value || 1)}</div>
            <div class="lm-roll-label">${label}</div>
        </div>
    `;
}

export { diceSlotsHtml, diceHtml, rollZoneHtml };
