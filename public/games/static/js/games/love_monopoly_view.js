import IconFactory from '../components/icon_factory.js';
import { escapeHtml } from '../util.js';

/* ==================== 恋爱大富翁 - 棋盘渲染/HTML 生成 Mixin ====================
 * 从 love_monopoly_online.js 拆出：棋盘渲染、决策区/事件/结算 HTML 生成，
 * 以及地块图标/名称工具函数。通过 Object.assign 挂到 OnlineMixin 同款原型。
 */
const TYPE_ICONS = {
    start: 'flag', building: 'building', bonus: 'coins', event: 'dice',
    interaction: 'heart', forward: 'arrow-up', backward: 'arrow-down', normal: 'coffee',
};
const TYPE_NAMES = {
    start: '起点', building: '建筑', bonus: '资金', event: '事件',
    interaction: '互动', forward: '前进', backward: '后退', normal: '休息站',
};

/* 地块图标 + 类型名（服务端下发的 cell 若带可用 icon 名则优先，否则按类型映射） */
function cellIcon(cell) {
    const name = (cell && cell.icon && IconFactory.has(cell.icon)) ? cell.icon : TYPE_ICONS[cell.type];
    return IconFactory.icon(name || 'coffee', 18);
}

function cellName(cell) {
    return (cell && cell.name) || TYPE_NAMES[cell.type] || '';
}

function isMyTurnCheck(st, myRole) {
    return st.current_player === myRole;
}

const RenderMixin = {
    _renderOnlineBoard(st, names) {
        const container = this.getContainer();
        const me = this._myRole;
        const isMyTurn = !this._gameOver && this._currentPlayer === me;
        const needDecision = this._pending || this._pendingMini;
        const turnText = this._gameOver
            ? '对局结束'
            : (needDecision ? '等待你的决策…' : (isMyTurn ? '轮到你掷骰子' : '等待对方掷骰子…'));
        const gridHtml = this._engine.layoutPositions().map((pos, i) => {
            const cell = this._engine.cellAt(i);
            const b = this._buildings[i];
            const isP1Here = this._positions.player1 === i;
            const isP2Here = this._positions.player2 === i;
            const tokens = (isP1Here ? '<span class="lm-token lm-token-p1" data-player="player1">1</span>' : '')
                + (isP2Here ? '<span class="lm-token lm-token-p2" data-player="player2">2</span>' : '');
            const ownerMark = b ? (b.owner === 'player1' ? '<span class="lm-owner lm-owner-p1">P1</span>' : '<span class="lm-owner lm-owner-p2">P2</span>') : '';
            const lv = b ? `Lv${b.level}` : '';
            return `
                <div class="lm-cell lm-cell-${cell.type}${b ? ' built' : ''}"
                     data-idx="${i}"
                     style="grid-row:${pos.row + 1};grid-column:${pos.col + 1};"
                     title="${cell.name || TYPE_NAMES[cell.type] || ''}">
                    <span class="lm-cell-icon">${cellIcon(cell)}</span>
                    <span class="lm-cell-name">${cellName(cell)}</span>
                    ${b ? `<span class="lm-cell-lv">${lv}</span>` : ''}
                    ${ownerMark}
                    ${tokens}
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="lm-game">
                <div class="lm-header">
                    <div class="lm-stat"><span class="lm-stat-label">${names.player1}</span><span class="lm-stat-val lm-p1-color">💰 ${this._money.player1}</span></div>
                    <div class="lm-turn${!this._gameOver ? (isMyTurn ? ' lm-turn-p1' : ' lm-turn-p2') : ''}">${turnText}</div>
                    <div class="lm-stat"><span class="lm-stat-label">${names.player2}</span><span class="lm-stat-val lm-p2-color">💰 ${this._money.player2}</span></div>
                </div>
                <div class="lm-board" id="lm-board">${gridHtml}</div>
                <div class="lm-event" id="lm-event">${this._onlineEventHtml(st)}</div>
                ${this._gameOver ? this._onlineResultHtml(st, names) : '<div class="lm-action-zone" id="lm-action-zone"></div>'}
                ${this._gameOver ? `
                <div class="lm-footer">
                    ${this._myRole === 'player1'
                        ? '<button class="btn btn-outline btn-sm" id="lm-btn-restart">重新开始</button>'
                        : ''}
                    <button class="btn btn-danger btn-sm" id="lm-btn-exit">返回房间</button>
                </div>` : ''}
            </div>
        `;
        const zone = container.querySelector('#lm-action-zone');
        if (zone) zone.innerHTML = this._onlineActionHtml(st);

        const rollBtn = container.querySelector('#lm-btn-roll');
        if (rollBtn) rollBtn.addEventListener('click', () => this._onRollClick());
        const buildBtn = container.querySelector('#lm-btn-build');
        if (buildBtn) buildBtn.addEventListener('click', () => this._buildingOnline('build'));
        const upgradeBtn = container.querySelector('#lm-btn-upgrade');
        if (upgradeBtn) upgradeBtn.addEventListener('click', () => this._buildingOnline('upgrade'));
        const payBtn = container.querySelector('#lm-btn-pay');
        if (payBtn) payBtn.addEventListener('click', () => this._buildingOnline('pay'));
        const taskBtn = container.querySelector('#lm-btn-task');
        if (taskBtn) taskBtn.addEventListener('click', () => this._buildingOnline('task'));
        container.querySelectorAll('.lm-pick-btn').forEach(btn => {
            btn.addEventListener('click', () => this._emit('owner_pick', { index: parseInt(btn.dataset.pick, 10) }));
        });
        const skipBtn = container.querySelector('#lm-btn-skip');
        if (skipBtn) skipBtn.addEventListener('click', () => this._buildingOnline('skip'));
        const headsBtn = container.querySelector('#lm-btn-heads');
        if (headsBtn) headsBtn.addEventListener('click', () => this._emit('mini_game', { choice: 'heads' }));
        const tailsBtn = container.querySelector('#lm-btn-tails');
        if (tailsBtn) tailsBtn.addEventListener('click', () => this._emit('mini_game', { choice: 'tails' }));
        const restartBtn = container.querySelector('#lm-btn-restart');
        if (restartBtn) restartBtn.addEventListener('click', () => this._emit('restart', {}));
        const exitBtn = container.querySelector('#lm-btn-exit');
        if (exitBtn) exitBtn.addEventListener('click', () => this._onExitClick());

        if (this._task) {
            const task = this._task;
            this._task = null;
            this._showTaskDialog(task);
        }
    },

    _buildingOnline(action) {
        this._emit('building_action', { action });
    },

    _onlineActionHtml(st) {
        // 操作隔离：决策（猜硬币/建筑）与掷骰只允许移动方操作；
        // 非移动方一律显示等待（服务端同时有权威校验兜底）
        const myTurn = (st.current_player === this._myRole);
        if (this._pendingMini) {
            if (!myTurn) return '<div class="lm-waiting">等待对方猜硬币…</div>';
            const reward = (this._engine.board && this._engine.board.mini_game_reward) || 100;
            return `
                <div class="lm-action">
                    <div class="lm-action-title">🎲 猜硬币小游戏！猜对 +${reward}</div>
                    <div class="lm-mini-btns">
                        <button class="btn btn-primary" id="lm-btn-heads">正面</button>
                        <button class="btn btn-info" id="lm-btn-tails">反面</button>
                    </div>
                </div>
            `;
        }
        if (this._pending) {
            const kind = this._pending.kind;
            const cell = this._engine.cellAt(this._pending.cell);
            // 建筑持有方出题（owner_pick）：决策权属于持有方（owner），不是移动方
            if (kind === 'owner_pick') {
                if (this._pending.owner !== this._myRole) return '<div class="lm-waiting">等待建筑持有方出题…</div>';
                const names = this._playerNames(st);
                const ownerName = names[this._pending.owner] || '持有方';
                const opts = (this._pending.options || []).map((opt, i) => `
                    <button class="btn btn-outline lm-pick-btn" data-pick="${i}">${opt}</button>
                `).join('');
                return `
                    <div class="lm-action lm-owner-pick">
                        <div class="lm-action-title">🎁 你（${escapeHtml(ownerName)}）来出题：选一条「${cell.name}」Lv${this._pending.level} 惩罚</div>
                        <div class="lm-pick-list">${opts}</div>
                    </div>
                `;
            }
            if (!myTurn) return '<div class="lm-waiting">等待对方决策…</div>';
            if (kind === 'building') {
                const cost = cell.base_cost || 200;
                return `
                    <div class="lm-action">
                        <div class="lm-action-title">🏠 走到无主「${cell.name}」，花费 ${cost} 建造？</div>
                        <div class="lm-mini-btns">
                            <button class="btn btn-primary" id="lm-btn-build">建造（-${cost}）</button>
                            <button class="btn btn-outline" id="lm-btn-skip">放弃</button>
                        </div>
                    </div>
                `;
            }
            if (kind === 'upgrade') {
                const cost = this._pending.cost;
                return `
                    <div class="lm-action">
                        <div class="lm-action-title">🏠 「${cell.name}」可升级，花费 ${cost}？</div>
                        <div class="lm-mini-btns">
                            <button class="btn btn-primary" id="lm-btn-upgrade">升级（-${cost}）</button>
                            <button class="btn btn-outline" id="lm-btn-skip">放弃</button>
                        </div>
                    </div>
                `;
            }
            // pay_or_task：移动方决策（缴费 or 接受互动惩罚）
            const level = this._pending.level;
            const toll = (cell.toll && cell.toll[Math.min(level, 3) - 1]) || 50;
            const names = this._playerNames(st);
            const ownerName = names[this._buildings[this._pending.cell]?.owner] || '对方';
            return `
                <div class="lm-action">
                    <div class="lm-action-title">💞 走到「${cell.name}」（${escapeHtml(ownerName)} 的地 · Lv${level}）：缴费 or 接受互动惩罚？</div>
                    <div class="lm-mini-btns">
                        <button class="btn btn-primary" id="lm-btn-pay">缴费 ${toll}</button>
                        <button class="btn btn-danger" id="lm-btn-task">接受互动惩罚</button>
                    </div>
                </div>
            `;
        }
        if (isMyTurnCheck(st, this._myRole)) {
            return `<button class="btn btn-primary btn-lg" id="lm-btn-roll">${IconFactory.icon('dice', 20)} 掷骰子</button>`;
        }
        return '<div class="lm-waiting">等待对方…</div>';
    },

    _onlineEventHtml(st) {
        const evt = st.last_evt;
        if (!evt || !evt.text) return '点击掷骰子出发~';
        if (!evt.by) return evt.text;
        // 标注操作方：彩色徽标 + 昵称（服务端已对昵称做 XSS 清洗，此处再转义兜底）
        const names = this._playerNames(st);
        const rawName = names[evt.by] || (evt.by === 'player1' ? '玩家1' : '玩家2');
        const name = escapeHtml(rawName);
        const cls = evt.by === 'player1' ? 'lm-by lm-by-p1' : 'lm-by lm-by-p2';
        return `<span class="${cls}">${name}</span> ${evt.text}`;
    },

    _onlineResultHtml(st, names) {
        const winName = names[st.winner] || '?';
        return `
            <div class="lm-result">
                <div class="lm-result-title">${IconFactory.icon('trophy', 24)} ${winName} 获胜！</div>
            </div>
        `;
    },
};

export default RenderMixin;
export { cellIcon, cellName };
