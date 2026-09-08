import { escapeHtml } from '../util.js';
import IconFactory from './icon_factory.js';

/* ==================== 共享游戏 UI 组件 ====================
 * 双人游戏中反复出现的 UI 片段，统一抽取为纯函数/工具，降低新游戏开发复杂度。
 * 所有渲染到 innerHTML 的字符串内部已做 escapeHtml 转义，调用方无需重复处理。
 *
 * 提供：
 *   - playerBadge(name, opts)      玩家徽标
 *   - turnBadge(name, {active})    回合指示徽标
 *   - statsBar(items)              统计条
 *   - countdownTimer(seconds, cb)  倒计时器（start/stop/cancel）
 */

/* 玩家徽标：标准化双人游戏中的玩家身份展示。
 * icon 为原始 HTML（如 IconFactory 生成的 SVG），name 会经 escapeHtml 转义。
 */
function playerBadge(name, { side = '', active = false, icon = '' } = {}) {
    const cls = `side-${side}${active ? ' active' : ''}`;
    return `<div class="player-badge ${cls}">${icon}${escapeHtml(name)}</div>`;
}

/* 回合指示徽标：突出「当前轮到谁」 */
function turnBadge(name, { active = false, prefix = null } = {}) {
    if (!active) return '';
    const icon = prefix || IconFactory.icon('target', 16);
    return `<span class="turn-badge">${icon} ${escapeHtml(name)} 的回合</span>`;
}

/* 统计条：形如「已解：3 题 | 总题数：5」 */
function statsBar(items) {
    // items: [{ label, value }]
    const parts = (items || []).map((it) =>
        `<span class="stats-item">${escapeHtml(it.label)}：<b>${escapeHtml(String(it.value))}</b></span>`
    );
    return `<div class="stats-bar">${parts.join('<span class="stats-sep">|</span>')}</div>`;
}

/* 倒计时器：返回 { start, stop, cancel } 控制器
 * cb 为 { onTick(remainingSeconds), onDone() }
 */
function countdownTimer(seconds, { onTick, onDone } = {}) {
    let timerId = null;
    let remaining = seconds;

    function tick() {
        if (onTick) onTick(remaining);
        if (remaining <= 0) {
            stop();
            if (onDone) onDone();
            return;
        }
        remaining--;
        timerId = setTimeout(tick, 1000);
    }

    function start() {
        stop();
        remaining = seconds;
        tick();
    }

    function stop() {
        if (timerId) { clearTimeout(timerId); timerId = null; }
    }

    function cancel() {
        stop();
        remaining = seconds;
    }

    return { start, stop, cancel };
}

export { playerBadge, turnBadge, statsBar, countdownTimer };
