import GameBase from '../game_base.js';
import Toast from '../components/toast.js';
import { escapeHtml } from '../util.js';
import { playerBadge } from '../components/game_ui.js';
import GameRegistry from '../registry.js';
import { ensureSession } from '../platform.js';
import { bindSessionEvents } from '../session.js';
import IconFactory from '../components/icon_factory.js';

/* ==================== 双人扫雷 - 视图 ====================
 * 服务端权威（MinesweeperRoom）：布雷/数字/展开/胜负全部由服务端判定，
 * 前端只负责渲染格子 + 点击开格/插旗。
 * - 轮流翻开，踩雷者输、对方赢
 * - 排完所有安全格 → 合作双赢（触发合作成功互动）
 */
class MinesweeperGame extends GameBase {
    constructor(manifest) {
        super(manifest);
        this._snapshot = null;
        this._online = false;
        this._sessionId = null;
        this._myRole = null;
        this._offSocketHandlers = [];
        this._longPressTimer = null;
        this._longPressFired = false;   // 长按插旗后拦截补发 click，防误开格
    }

    get SIZE() { return (this._snapshot && this._snapshot.size) || 8; }

    async onStart() {
        await ensureSession('minesweeper', 'online');
        await this._initStandardSession();
    }

    onDestroy() {
        this._clearLongPress();
        this._offSocketHandlers.forEach(off => off());
        this._offSocketHandlers = [];
    }

    /* ---------- 会话 ---------- */
    _bindOnline() {
        this._offSocketHandlers.push(bindSessionEvents(this._sessionId, {
            onState: (st) => {
                this._snapshot = st;
                this._render();
            },
            onEvent: (evt) => {
                if (this.handleInteractionEvent(evt)) return;   // 公共处理 interaction_drawn
                if (this.handleRestartEvent(evt)) return;       // 重开协商(暂停菜单)
                if (evt.event === 'game_over') {
                    this._snapshot = evt;
                    this._handleGameOver(evt);
                    this._render();
                }
            },
            onError: (data) => Toast && Toast.error((data && data.message) || '操作失败'),
        }));
    }

    _handleGameOver(evt) {
        const w = evt.winner;
        if (w === 'tie') {
            // 合作双赢：两人都赢
            this.playSound('win');
            Toast && Toast.show('排完所有雷，合作共赢！', 'success');
            // 房主发起合作成功互动抽取（双方通过 interaction_drawn 同步显示）
            if (this._online && this._myRole === 'player1') this.requestInteraction();
            return;
        }
        // 单赢：踩雷者输
        const iWon = w === this._myRole;
        this.playSound(iWon ? 'win' : 'lose');
        const names = this._playerNames(evt);
        if (evt.payload && evt.payload.hit_mine) {
            // 踩雷者是 evt.from；踩雷者看「你踩到雷了」，对方看「XX 踩到雷了」
            const hitMineByMe = evt.from === this._myRole;
            if (hitMineByMe) {
                Toast && Toast.show('你踩到雷了！', 'error');
            } else {
                const loserName = names[evt.from] || '对方';
                Toast && Toast.show(`${loserName} 踩到雷了！`, 'info');
            }
        }
        if (evt.surrender_by) {
            const name = names[evt.surrender_by] || '对方';
            Toast && Toast.show(`${name} 认输`, 'info');
        }
        this._handleGameOverInteraction(evt, w);
    }

    /* ---------- 渲染 ---------- */
    _render() {
        const container = this.getContainer();
        const s = this._snapshot || {};
        if (!s.started) {
            this._renderLobby(container);
        } else if (s.game_over) {
            this._renderGameOver(container);
        } else {
            this._renderBoard(container);
        }
    }

    _renderLobby(container) {
        const s = this._snapshot || {};
        const names = this._playerNames(s);
        const isHost = this._myRole === 'player1';
        const guestJoined = !!(s.guest);

        container.innerHTML = `
            <div class="ms-wrap">
                <div class="ms-title">${IconFactory.icon('minesweeper', 26)} 双人扫雷</div>
                <div class="ms-players">
                    ${playerBadge(`💣 玩家1：${names.player1}`, { side: 'p1' })}
                    ${playerBadge(guestJoined ? `💣 玩家2：${names.player2}` : '💣 玩家2：等待加入…', { side: 'p2' })}
                </div>
                <p class="ms-desc">8×8 藏 8 雷 · 轮流开格 · 踩雷者输 · 排完双赢</p>
                ${isHost
                    ? '<button class="btn btn-primary btn-lg" id="ms-start">开始游戏</button>'
                    : '<div class="ms-waiting">等待房主开始游戏…</div>'}
            </div>
        `;
        if (isHost) {
            container.querySelector('#ms-start').addEventListener('click', () => this._emit('start', {}));
        }
    }

    _renderBoard(container) {
        const s = this._snapshot;
        const myTurn = s.current_player === this._myRole;
        const names = this._playerNames(s);
        const mineLeft = Math.max(0, s.mine_count - s.flags.flat().filter(Boolean).length);
        const turnText = myTurn
            ? `${IconFactory.icon('target', 16)} 轮到你开格`
            : `${IconFactory.icon('moon', 16)} 等待对方开格…`;

        container.innerHTML = `
            <div class="ms-wrap">
                <div class="ms-header">
                    <div class="ms-turn${myTurn ? ' my-turn' : ''}">${turnText}</div>
                    <div class="ms-mines">💣 剩余雷：${mineLeft} / ${s.mine_count}</div>
                </div>
                <div class="ms-players small">
                    ${playerBadge(`💣 ${names.player1}${s.current_player === 'player1' ? ' ⏳' : ''}`, { side: 'p1', active: s.current_player === 'player1' })}
                    ${playerBadge(`💣 ${names.player2}${s.current_player === 'player2' ? ' ⏳' : ''}`, { side: 'p2', active: s.current_player === 'player2' })}
                </div>
                <div class="ms-board" id="ms-board">${this._boardHtml(s)}</div>
                <div class="ms-hint">点击开格 · 长按/右键插旗</div>
            </div>
        `;

        const board = container.querySelector('#ms-board');
        if (board) {
            board.querySelectorAll('.ms-cell').forEach(cell => {
                cell.addEventListener('click', () => {
                    // 长按插旗后浏览器会补发 click：用标记拦截，避免同格被误开
                    if (this._longPressFired) {
                        this._longPressFired = false;
                        return;
                    }
                    this._onOpen(cell);
                });
                cell.addEventListener('contextmenu', (e) => { e.preventDefault(); this._onFlag(cell); });
                // 触屏长按插旗
                cell.addEventListener('touchstart', (e) => this._onTouchStart(e, cell), { passive: true });
                cell.addEventListener('touchend', () => this._clearLongPress());
                cell.addEventListener('touchmove', () => this._clearLongPress());
            });
        }
    }

    _boardHtml(s) {
        const view = s.view || [];
        const flags = s.flags || [];
        const revealed = s.revealed || [];
        let html = '';
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                const isFlag = flags[r] && flags[r][c];
                const isOpen = revealed[r] && revealed[r][c];
                const val = (view[r] && view[r][c]) || 0;
                let content = '';
                let cls = 'ms-cell';
                if (isFlag) {
                    cls += ' flagged';
                    content = '🚩';
                } else if (isOpen) {
                    if (val === -1) {
                        cls += ' mine';
                        content = '💣';
                    } else if (val > 0) {
                        cls += ` num-${val}`;
                        content = String(val);
                    } else {
                        cls += ' open';
                        content = '';
                    }
                } else {
                    cls += ' closed';
                    content = '';
                }
                html += `<div class="${cls}" data-r="${r}" data-c="${c}">${content}</div>`;
            }
        }
        return html;
    }

    _renderGameOver(container) {
        const s = this._snapshot;
        const isHost = this._myRole === 'player1';
        const names = this._playerNames(s);
        const mineLeft = Math.max(0, s.mine_count - s.flags.flat().filter(Boolean).length);

        let title, resultLine;
        if (s.winner === 'tie') {
            title = `${IconFactory.icon('handshake', 24)} 合作共赢！`;
            resultLine = '两人一起排除了所有雷，默契满分！';
        } else if (s.payload && s.payload.hit_mine) {
            // 踩雷结束：踩雷者是 s.from（触发踩雷的一方），赢家是 s.winner
            const iWon = s.winner === this._myRole;
            const hitMineByMe = s.from === this._myRole;
            const winnerName = names[s.winner] || '对方';
            title = iWon ? `${IconFactory.icon('trophy', 24)} 你赢了！` : '游戏结束';
            resultLine = hitMineByMe
                ? `你踩到雷了，${escapeHtml(winnerName)} 获胜`
                : `${escapeHtml(names[s.from] || '对方')} 踩到雷啦，你赢了！`;
        } else {
            const iWon = s.winner === this._myRole;
            const winName = names[s.winner] || '对方';
            title = iWon ? `${IconFactory.icon('trophy', 24)} 你赢了！` : '游戏结束';
            resultLine = s.surrender_by
                ? (iWon ? `${escapeHtml(names[s.surrender_by])} 认输，你获胜！` : `你已认输，${escapeHtml(winName)} 获胜`)
                : `${escapeHtml(winName)} 获胜`;
        }

        container.innerHTML = `
            <div class="ms-wrap">
                <div class="ms-title">${title}</div>
                <div class="ms-result-line">${resultLine}</div>
                <div class="ms-mines">💣 剩余雷：${mineLeft} / ${s.mine_count}（已全部亮出）</div>
                <div class="ms-board" id="ms-board-final">${this._boardHtml(s)}</div>
                ${isHost
                    ? '<button class="btn btn-primary btn-lg" id="ms-again">再来一局</button>'
                    : '<div class="ms-waiting">等待房主重开…</div>'}
            </div>
        `;
        if (isHost) {
            container.querySelector('#ms-again').addEventListener('click', () => this._emit('restart', {}));
        }
    }

    /* ---------- 交互 ---------- */
    _onOpen(cell) {
        if (!this._snapshot || this._snapshot.game_over) return;
        if (!this._snapshot.started) return;
        if (this._snapshot.current_player !== this._myRole) {
            Toast && Toast.show('还没轮到你~', 'info');
            return;
        }
        const r = parseInt(cell.dataset.r, 10);
        const c = parseInt(cell.dataset.c, 10);
        this.playSound('turn');
        this._emit('open', { row: r, col: c });
    }

    _onFlag(cell) {
        if (!this._snapshot || this._snapshot.game_over) return;
        const r = parseInt(cell.dataset.r, 10);
        const c = parseInt(cell.dataset.c, 10);
        this._emit('flag', { row: r, col: c });
    }

    _onTouchStart(e, cell) {
        // 触屏长按插旗（800ms）：已翻开/已插旗的格不启动计时；
        // 避免与点击开格冲突，避免对无效格发多余请求
        this._clearLongPress();
        if (this._snapshot && this._snapshot.game_over) return;
        if (!this._snapshot || !this._snapshot.started) return;
        const revealed = this._snapshot.revealed || [];
        const flags = this._snapshot.flags || [];
        const r = parseInt(cell.dataset.r, 10);
        const c = parseInt(cell.dataset.c, 10);
        if ((revealed[r] && revealed[r][c]) || (flags[r] && flags[r][c])) return;
        this._longPressTimer = setTimeout(() => {
            this._longPressTimer = null;
            this._longPressFired = true;   // 拦截长按后浏览器补发的 click，防误开格
            this._onFlag(cell);
            if (navigator.vibrate) navigator.vibrate(30);
        }, 800);
    }

    _clearLongPress() {
        if (this._longPressTimer) {
            clearTimeout(this._longPressTimer);
            this._longPressTimer = null;
        }
        this._longPressPos = null;
        // 不在此清 _longPressFired：留给 click 处理器消费（拦截补发的合成点击）
    }
}

GameRegistry.register('minesweeper', MinesweeperGame);

/* ---- 内联样式 ---- */
(function injectStyles() {
    if (document.getElementById('ms-styles')) return;
    const style = document.createElement('style');
    style.id = 'ms-styles';
    style.textContent = `
        .ms-wrap { display: flex; flex-direction: column; gap: 14px; align-items: center; padding: 16px 0; }
        .ms-title { font-size: 26px; font-weight: 800; color: var(--primary); }
        .ms-desc { font-size: 13px; color: var(--text-muted); text-align: center; }
        .ms-players { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
        .ms-players.small { font-size: 13px; }
        .ms-waiting { font-size: 15px; color: var(--text-muted); }
        .ms-header { display: flex; align-items: center; gap: 18px; justify-content: center; flex-wrap: wrap; }
        .ms-turn { font-size: 16px; color: var(--text-light); min-height: 24px; }
        .ms-turn.my-turn { color: var(--primary); font-weight: 700; }
        .ms-mines { font-size: 14px; color: var(--warning); font-weight: 600; }
        .ms-board { display: grid; grid-template-columns: repeat(8, 1fr); gap: 3px; width: min(92vw, 360px); aspect-ratio: 1; touch-action: manipulation; user-select: none; -webkit-user-select: none; }
        .ms-cell { display: flex; align-items: center; justify-content: center; border-radius: 5px; font-size: 15px; font-weight: 700; cursor: pointer; aspect-ratio: 1; background: rgba(231,84,128,0.12); border: 1px solid rgba(231,84,128,0.25); color: var(--text); }
        .ms-cell.closed:hover { background: rgba(231,84,128,0.25); }
        .ms-cell.open { background: rgba(0,0,0,0.04); border-color: transparent; }
        .ms-cell.flagged { background: rgba(255,165,0,0.18); border-color: rgba(255,165,0,0.4); }
        .ms-cell.mine { background: rgba(255,80,80,0.25); border-color: rgba(255,80,80,0.5); }
        .ms-cell.num-1 { color: #3b82f6; }
        .ms-cell.num-2 { color: #22c55e; }
        .ms-cell.num-3 { color: #ef4444; }
        .ms-cell.num-4 { color: #7c3aed; }
        .ms-cell.num-5 { color: #a0522d; }
        .ms-cell.num-6 { color: #0891b2; }
        .ms-cell.num-7, .ms-cell.num-8 { color: #111; }
        .ms-hint { font-size: 12px; color: var(--text-muted); }
        .ms-result-line { font-size: 16px; color: var(--text); text-align: center; }
    `;
    document.head.appendChild(style);
})();
