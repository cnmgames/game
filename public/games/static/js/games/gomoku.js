import GameBase from '../game_base.js';
import Toast from '../components/toast.js';
import { escapeHtml } from '../util.js';
import { playerBadge } from '../components/game_ui.js';
import GameRegistry from '../registry.js';
import { ensureSession } from '../platform.js';
import { bindSessionEvents } from '../session.js';
import IconFactory from '../components/icon_factory.js';

/* ==================== 五子棋 - 视图（本地/远程统一会话） ====================
 * 服务端权威（GomokuRoom）：棋盘、回合、五连胜负均由服务端判定。
 * 前端只负责渲染 + 点击落子，通过 session_action / session_state / session_event 与服务端交互。
 */
class GomokuGame extends GameBase {
    constructor(manifest) {
        super(manifest);
        this._snapshot = null;   // 服务端状态 {started, board, current_player, winner, game_over}
        this._online = false;
        this._sessionId = null;
        this._myRole = null;     // 'player1'(黑) | 'player2'(白)
        this._canvas = null;
        this._ctx = null;
        this._offSocketHandlers = [];
    }

    /* 棋盘常量 */
    get SIZE() { return 15; }
    get CELL() { return 30; }
    get MARGIN() { return 24; }
    get BOARD_PX() { return this.MARGIN * 2 + (this.SIZE - 1) * this.CELL; }

    async onStart() {
        await ensureSession('gomoku', 'online');
        await this._initStandardSession();
    }

    onDestroy() {
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
                    this._onGameOverEvent(evt);
                    this._render();
                }
            },
            onError: (data) => Toast && Toast.error((data && data.message) || '操作失败'),
        }));
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
            this._renderGame(container);
        }
    }

    _renderLobby(container) {
        const s = this._snapshot || {};
        const names = this._playerNames(s);
        const isHost = this._myRole === 'player1';
        const guestJoined = !!(s.guest);

        container.innerHTML = `
            <div class="go-wrap">
                <div class="go-title">${IconFactory.icon('gomoku', 24)} 五子棋</div>
                <div class="go-players">
                    ${playerBadge(`⚫ 玩家1（黑）：${names.player1}`, { side: 'p1' })}
                    ${playerBadge(guestJoined ? `⚪ 玩家2（白）：${names.player2}` : '⚪ 玩家2：等待加入…', { side: 'p2' })}
                </div>
                ${isHost
                    ? '<button class="btn btn-primary btn-lg" id="go-start">开始游戏</button>'
                    : '<div class="go-waiting">等待房主开始游戏…</div>'}
            </div>
        `;
        if (isHost) {
            container.querySelector('#go-start').addEventListener('click', () => this._emit('start', {}));
        }
    }

    _renderGame(container) {
        const s = this._snapshot;
        const curColor = s.current_player === 'player1' ? '黑方' : '白方';
        const myTurn = s.current_player === this._myRole;
        const turnText = this._online
            ? (myTurn ? `${IconFactory.icon('target', 16)} 轮到你落子` : `${IconFactory.icon('moon', 16)} 等待对方落子`)
            : `${IconFactory.icon('target', 16)} 轮到${curColor}落子`;

        container.innerHTML = `
            <div class="go-wrap">
                <div class="go-turn${myTurn ? ' my-turn' : ''}">${turnText}</div>
                <div class="go-board-wrap">
                    <canvas id="go-canvas"></canvas>
                </div>
                <div class="go-hint">${this._online ? `你执${this._myRole === 'player1' ? '黑子' : '白子'}` : '玩家1执黑子 · 玩家2执白子'}</div>
            </div>
        `;

        this._setupCanvas();
        this._drawBoard();
    }

    _renderGameOver(container) {
        const s = this._snapshot;
        const isHost = this._myRole === 'player1';
        const names = this._playerNames(s);
        const winName = names[s.winner] || '?';
        const iWon = s.winner === this._myRole;
        const surrendered = !!s.surrender_by;
        const surrenderName = names[s.surrender_by] || '对方';
        const resultLine = surrendered
            ? (iWon
                ? `${escapeHtml(surrenderName)} 认输，你获胜！`
                : `你已认输，${escapeHtml(winName)} 获胜`)
            : `${escapeHtml(winName)} 连成五子获胜`;

        container.innerHTML = `
            <div class="go-wrap">
                <div class="go-title">${iWon ? `${IconFactory.icon('trophy', 24)} 你赢了！` : '游戏结束'}</div>
                <div class="go-result-line">${resultLine}</div>
                ${isHost
                    ? '<button class="btn btn-primary btn-lg" id="go-again">再来一局</button>'
                    : '<div class="go-waiting">等待房主重开…</div>'}
            </div>
        `;
        if (isHost) {
            container.querySelector('#go-again').addEventListener('click', () => this._emit('restart', {}));
        }
    }

    /* ---------- 棋盘 ---------- */
    _setupCanvas() {
        this._canvas = document.getElementById('go-canvas');
        if (!this._canvas) return;
        this._ctx = this._canvas.getContext('2d');
        const wrap = this._canvas.parentElement;
        const maxWidth = Math.min(wrap.clientWidth - 16, this.BOARD_PX);
        this._canvas.width = this.BOARD_PX;
        this._canvas.height = this.BOARD_PX;
        this._canvas.style.width = maxWidth + 'px';
        this._canvas.style.height = maxWidth + 'px';
        this._canvas.addEventListener('click', (e) => this._onBoardClick(e));
    }

    _drawBoard() {
        const ctx = this._ctx;
        const canvas = this._canvas;
        if (!ctx || !canvas) return;
        const size = this.BOARD_PX;
        const cell = this.CELL;
        const margin = this.MARGIN;

        ctx.clearRect(0, 0, size, size);

        // 棋盘木色背景
        ctx.fillStyle = '#e8c078';
        ctx.fillRect(0, 0, size, size);

        // 网格线
        ctx.strokeStyle = '#4a3728';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.SIZE; i++) {
            const p = margin + i * cell;
            ctx.beginPath();
            ctx.moveTo(margin, p);
            ctx.lineTo(size - margin, p);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(p, margin);
            ctx.lineTo(p, size - margin);
            ctx.stroke();
        }

        // 星位（天元 + 四星）
        const stars = [[3, 3], [11, 3], [7, 7], [3, 11], [11, 11]];
        ctx.fillStyle = '#4a3728';
        for (const [sx, sy] of stars) {
            ctx.beginPath();
            ctx.arc(margin + sx * cell, margin + sy * cell, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // 棋子
        const board = (this._snapshot && this._snapshot.board) || [];
        for (let y = 0; y < this.SIZE; y++) {
            for (let x = 0; x < this.SIZE; x++) {
                const v = (board[y] && board[y][x]) || 0;
                if (!v) continue;
                this._drawStone(ctx, x, y, v === 1 ? '#111' : '#f5f5f5');
            }
        }
    }

    _drawStone(ctx, x, y, color) {
        const px = this.MARGIN + x * this.CELL;
        const py = this.MARGIN + y * this.CELL;
        const r = this.CELL * 0.42;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 1;
        const grad = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, r * 0.2, px, py, r);
        if (color === '#111') {
            grad.addColorStop(0, '#555');
            grad.addColorStop(1, '#000');
        } else {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(1, '#ccc');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    _onBoardClick(e) {
        if (!this._snapshot || this._snapshot.game_over || this._snapshot.board == null) return;
        const rect = this._canvas.getBoundingClientRect();
        const scale = this._canvas.width / rect.width;
        const px = (e.clientX - rect.left) * scale;
        const py = (e.clientY - rect.top) * scale;
        const x = Math.round((px - this.MARGIN) / this.CELL);
        const y = Math.round((py - this.MARGIN) / this.CELL);
        if (x < 0 || x >= this.SIZE || y < 0 || y >= this.SIZE) return;
        if (this._snapshot.board[y][x] !== 0) return;
        this.playSound('turn');
        this._emit('move', { x, y });
    }
}

GameRegistry.register('gomoku', GomokuGame);

/* ---- 内联样式 ---- */
(function injectStyles() {
    if (document.getElementById('go-styles')) return;
    const style = document.createElement('style');
    style.id = 'go-styles';
    style.textContent = `
        .go-wrap { display: flex; flex-direction: column; gap: 16px; align-items: center; padding: 20px 0; }
        .go-title { font-size: 28px; font-weight: 800; color: var(--primary); }
        .go-players { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
        .go-waiting { font-size: 15px; color: var(--text-muted); }
        .go-turn { font-size: 16px; color: var(--text-light); min-height: 24px; }
        .go-turn.my-turn { color: var(--primary); font-weight: 700; }
        .go-board-wrap { width: 100%; display: flex; justify-content: center; }
        .go-board-wrap canvas { border-radius: 8px; box-shadow: var(--shadow); cursor: pointer; }
        .go-hint { font-size: 13px; color: var(--text-muted); }
        .go-result-line { font-size: 16px; color: var(--text); }
    `;
    document.head.appendChild(style);
})();
