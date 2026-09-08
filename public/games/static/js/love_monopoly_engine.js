/* ==================== 恋爱大富翁 - 纯逻辑引擎 ====================
 * 环形大富翁：双方轮流掷骰子（1-6）沿 24 格环形地图前进。
 * 格子类型：起点(start) / 建筑(building) / 资金(bonus) / 随机事件(event)
 *           / 互动(interaction) / 前进(forward) / 后退(backward) / 普通(normal)
 *
 * 地图与互动池数据由服务端权威下发（rooms/data.py 读取
 * love_monopoly_board.json / couple_interactions.json 单一事实源，
 * 经会话 to_dict 传给前端，构造引擎时注入），前端不再单独 fetch。
 * 本引擎仅提供布局/格点查询等只读能力；游戏判定全部在服务端。
 */
class LoveMonopolyEngine {
    constructor(board = {}, interactions = {}) {
        this.board = board || {};
        this.interactions = interactions || {};
        this.total = this.board.total || 24;
        this.cells = this.board.cells || [];
    }

    /* ---- 掷骰 ---- */
    roll() {
        return this._randInt(1, this.board.dice_max || 6);
    }

    /* ---- 环形移动 ----
     * position 为当前格下标（0 起点），steps 为骰子点数。
     * 返回 { position, passedStart }：position 为移动后下标；passedStart 表示
     * 本轮移动是否经过或到达起点（经过起点可领工资）。
     */
    move(position, steps) {
        if (this.total <= 0) return { position: 0, passedStart: false };
        const oldPos = ((position % this.total) + this.total) % this.total;
        const newPos = (oldPos + steps) % this.total;
        // 经过起点：oldPos+steps >= total（绕圈回起点），或恰好落在起点
        const passedStart = (oldPos + steps) >= this.total;
        return { position: newPos, passedStart };
    }

    /* ---- 落点格信息 ---- */
    cellAt(position) {
        const idx = ((position % this.total) + this.total) % this.total;
        return this.cells[idx] || { type: 'normal', name: '休息站', icon: 'coffee' };
    }

    /* ---- 资金 ---- */
    bonusAmount(cell) {
        const min = (cell && cell.amount_min) || 50;
        const max = (cell && cell.amount_max) || 150;
        return this._randInt(min, max);
    }

    miniGameReward() {
        return this.board.mini_game_reward || 100;
    }

    shouldTriggerMiniGame() {
        const chance = this.board.mini_game_chance ?? 0.3;
        return Math.random() < chance;
    }

    /* ---- 建筑 ---- */
    baseCost(cell) {
        return (cell && cell.base_cost) || 200;
    }

    upgradeCost(cell, level) {
        const costs = (cell && cell.upgrade_cost) || [150, 200];
        return costs[Math.min(level, costs.length) - 1] || 150;
    }

    tollFor(cell, level) {
        const tolls = (cell && cell.toll) || [50, 100, 180];
        const lv = Math.max(1, Math.min(level, tolls.length));
        return tolls[lv - 1];
    }

    canAfford(money, cost) {
        return money >= cost;
    }

    /* ---- 事件 ---- */
    pickEvent() {
        const events = this.board.events || [];
        if (!events.length) return { type: 'none', text: '原地发呆一分钟~' };
        return events[this._randInt(0, events.length - 1)];
    }

    /* ---- 互动任务（复用系统情侣互动池 couple_interactions，无独立文案文件） ---- */

    /* 取 competitive.tiers[start:end] 的全部 tips */
    _interactionTips(start, end) {
        const tiers = (this.interactions.competitive && this.interactions.competitive.tiers) || [];
        const pool = [];
        for (const t of tiers.slice(start, end)) {
            pool.push(...(t.tips || []));
        }
        return pool;
    }

    /* 随机抽一条互动任务：level1→tier0、level2→tier1-2、level3→tier3-5（含神话） */
    pickTask(levelKey) {
        const map = { level1: [0, 1], level2: [1, 3], level3: [3, 6] };
        const [start, end] = map[levelKey] || [0, 1];
        const pool = this._interactionTips(start, end);
        if (!pool.length) return '给对方一个温暖的拥抱~';
        return pool[this._randInt(0, pool.length - 1)];
    }

    /* 建筑当前等级的惩罚候选列表：复用系统情侣互动池（couple_interactions.json
     * competitive.tiers 6 档），按大富翁建筑 3 级映射——
     *   Lv1→普通+精良、Lv2→优秀+史诗、Lv3→传说+神话。 */
    buildingTaskOptions(cell, level) {
        const lv = Number(level) || 1;
        const map = { 1: [0, 2], 2: [2, 4], 3: [4, 6] };
        const [start, end] = map[lv] || [0, 2];
        const pool = this._interactionTips(start, end);
        if (!pool.length) return ['给对方一个温暖的拥抱~'];
        return pool;
    }

    randomTaskLevel() {
        const keys = ['level1', 'level2', 'level3'];
        return keys[this._randInt(0, keys.length - 1)];
    }

    /* ---- 胜负判定 ---- */
    checkWin(money) {
        return money >= (this.board.win_target || 5000);
    }

    checkBankrupt(money) {
        return money < 0;
    }

    /* ---- 环形布局渲染坐标（24 格：7×7 网格外圈，顺时针） ----
     * 返回 [{ row, col }] 长度 total；辅助前端按网格定位格子。
     */
    layoutPositions() {
        const positions = [];
        // n×n 外圈格数 = 4n-4，取满足 ≥ total 的最小 n（24 格 → 7×7）
        const n = Math.ceil((this.total + 4) / 4);
        // 顶边 y=0, x=0..n-1（7）
        for (let x = 0; x < n; x++) positions.push({ row: 0, col: x });
        // 右边 x=n-1, y=1..n-1（6）
        for (let y = 1; y < n; y++) positions.push({ row: y, col: n - 1 });
        // 底边 y=n-1, x=n-2..0（6）
        for (let x = n - 2; x >= 0; x--) positions.push({ row: n - 1, col: x });
        // 左边 x=0, y=n-2..1（5）
        for (let y = n - 2; y >= 1; y--) positions.push({ row: y, col: 0 });
        return positions.slice(0, this.total);
    }

    /* ---- 工具 ---- */
    _randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

export default LoveMonopolyEngine;
