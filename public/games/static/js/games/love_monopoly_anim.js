/* ==================== 恋爱大富翁 - 棋子移动动画（共享） ====================
 * 逐格移动棋子 DOM：沿环形路径每 stepMs 跳一格，途经格高亮 + 棋子弹跳。
 * 单机（已知步数）与联机（已知起终点）共用此实现，避免两端逻辑重复。
 *
 * moveTokenStepByStep({
 *   board,            // #lm-board 容器
 *   player,           // 'player1' | 'player2'
 *   from, to, total,  // 起/终格下标与总格数（to 取模后合法）
 *   stepMs = 240,     // 每格间隔毫秒
 *   onDone,           // 完成回调
 *   onMove,           // 每移动一格后的回调（可同步最新状态位置）
 * })
 * 返回清理函数（取消未完成的移动链）。
 */
function moveTokenStepByStep({ board, player, from, to, total, stepMs = 240, onDone, onMove } = {}) {
    if (!board) { if (onDone) onDone(); return () => {}; }
    const tokenSel = `[data-player="${player}"]`;
    // 规范化终点（支持负数/越界）
    const norm = (v) => ((v % total) + total) % total;
    const target = norm(to);
    let fromIdx = norm(from);
    // 环形路径步数：若终点在起点前方则正向走，否则绕环正向走到
    let diff = (target - fromIdx + total) % total;
    if (diff === 0) {
        // 原地不动（理论不出现）
        if (onDone) onDone();
        return () => {};
    }
    let step = 0;
    let cancelled = false;
    const cleanPath = () => {
        board.querySelectorAll('.lm-cell-path').forEach(c => c.classList.remove('lm-cell-path'));
    };
    const tick = () => {
        if (cancelled) return;
        step++;
        const cur = (fromIdx + step) % total;
        const cell = board.querySelector(`.lm-cell[data-idx="${cur}"]`);
        const token = board.querySelector(tokenSel);
        if (cell && token) {
            cleanPath();
            cell.classList.add('lm-cell-path');
            token.classList.remove('lm-token-moving');
            cell.appendChild(token);
            // 强制重排以重触发 CSS 动画
            void token.offsetWidth;
            token.classList.add('lm-token-moving');
        }
        if (onMove) onMove(cur);
        if (step >= diff) {
            cleanPath();
            if (onDone) onDone();
        } else {
            token._lmTimer = setTimeout(tick, stepMs);
        }
    };
    tick();
    return () => { cancelled = true; cleanPath(); };
}

/* 清理指定棋子未完成的移动链 */
function cancelTokenMove(board, player) {
    if (!board) return;
    const token = board.querySelector(`[data-player="${player}"]`);
    if (token && token._lmTimer) {
        clearTimeout(token._lmTimer);
        token._lmTimer = null;
    }
}

export { moveTokenStepByStep, cancelTokenMove };
