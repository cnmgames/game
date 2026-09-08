import GameBase from '../game_base.js';
import Toast from '../components/toast.js';
import { escapeHtml } from '../util.js';
import { playerBadge } from '../components/game_ui.js';
import GameRegistry from '../registry.js';
import { ensureSession } from '../platform.js';
import { bindSessionEvents } from '../session.js';
import IconFactory from '../components/icon_factory.js';

/* ==================== 憋死牛（裤裆棋 / 区字棋） ====================
 * 服务端权威（StifleCowRoom）：区字棋盘 5 棋点，双方各 2 子，轮流走子，憋死对方者胜。
 * 前端只负责渲染 + 点击走子（选中己方棋子 → 点相邻空点），与服务端交互。
 */
class StifleCowGame extends GameBase {
    constructor(manifest) {
        super(manifest);
        this._snapshot = null;   // 服务端状态 {started, board, current_player, winner, game_over}
        this._online = false;
        this._sessionId = null;
        this._myRole = null;     // 'player1'(黑) | 'player2'(白)
        this._canvas = null;
        this._ctx = null;
        this._selected = null;   // 选中的棋点编号 0-4
        this._offSocketHandlers = [];
    }

    /* 棋点相对坐标（0=左上 1=右上 2=左下 3=右下 4=中心） */
    get POINTS() {
        return [
            [0.0, 0.0], [1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [0.5, 0.5],
        ];
    }
    /* 连线（右边 1-3 缺，是「井」开口） */
    get LINES() {
        return [[0, 1], [0, 2], [2, 3], [0, 3], [1, 2]];
    }
    get BOARD() { return 320; }
    get MARGIN() { return 44; }

    async onStart() {
        await ensureSession('stifle_cow', 'online');
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
                this._selected = null;
                this._render();
            },
            onEvent: (evt) => {
                if (this.handleInteractionEvent(evt)) return;   // 公共处理 interaction_drawn
                if (this.handleRestartEvent(evt)) return;       // 重开协商(暂停菜单)
                if (evt.event === 'game_over') {
                    this._selected = null;
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
            <div class="sc-wrap">
                <div class="sc-title">${IconFactory.icon('footprints', 24)} 憋死牛</div>
                <div class="sc-players">
                    ${playerBadge(`⚫ 玩家1（黑）：${names.player1}`, { side: 'p1' })}
                    ${playerBadge(guestJoined ? `⚪ 玩家2（白）：${names.player2}` : '⚪ 玩家2：等待加入…', { side: 'p2' })}
                </div>
                ${isHost
                    ? '<button class="btn btn-primary btn-lg" id="sc-start">开始游戏</button>'
                    : '<div class="sc-waiting">等待房主开始游戏…</div>'}
            </div>
        `;
        if (isHost) {
            container.querySelector('#sc-start').addEventListener('click', () => this._emit('start', {}));
        }
    }

    _renderGame(container) {
        const s = this._snapshot;
        const curColor = s.current_player === 'player1' ? '黑方' : '白方';
        const myTurn = s.current_player === this._myRole;
        const turnText = this._online
            ? (myTurn ? `${IconFactory.icon('target', 16)} 轮到你走子` : `${IconFactory.icon('moon', 16)} 等待对方走子`)
            : `${IconFactory.icon('target', 16)} 轮到${curColor}走子`;
        const selHint = this._selected != null ? '点击相邻空点走子（再点棋子取消）' : '点击你的棋子选中';

        container.innerHTML = `
            <div class="sc-wrap">
                <div class="sc-turn${myTurn ? ' my-turn' : ''}">${turnText}</div>
                <div class="sc-board-wrap">
                    <canvas id="sc-canvas"></canvas>
                </div>
                <div class="sc-hint">${selHint} · ${this._online ? `你执${this._myRole === 'player1' ? '黑子' : '白子'}` : '玩家1执黑子 · 玩家2执白子'}</div>
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
            : `${escapeHtml(winName)} 憋死了对方`;

        container.innerHTML = `
            <div class="sc-wrap">
                <div class="sc-title">${iWon ? `${IconFactory.icon('trophy', 24)} 你赢了！` : '游戏结束'}</div>
                <div class="sc-result-line">${resultLine}</div>
                ${isHost
                    ? '<button class="btn btn-primary btn-lg" id="sc-again">再来一局</button>'
                    : '<div class="sc-waiting">等待房主重开…</div>'}
            </div>
        `;
        if (isHost) {
            container.querySelector('#sc-again').addEventListener('click', () => this._emit('restart', {}));
        }
    }

    /* ---------- 棋盘 ---------- */
    _pointXY(i) {
        const [rx, ry] = this.POINTS[i];
        return {
            x: this.MARGIN + rx * this.BOARD,
            y: this.MARGIN + ry * this.BOARD,
        };
    }

    _setupCanvas() {
        this._canvas = document.getElementById('sc-canvas');
        if (!this._canvas) return;
        this._ctx = this._canvas.getContext('2d');
        const wrap = this._canvas.parentElement;
        const sizePx = this.MARGIN * 2 + this.BOARD;
        const maxWidth = Math.min(wrap.clientWidth - 16, sizePx);
        this._canvas.width = sizePx;
        this._canvas.height = sizePx;
        this._canvas.style.width = maxWidth + 'px';
        this._canvas.style.height = maxWidth + 'px';
        this._canvas.addEventListener('click', (e) => this._onBoardClick(e));
    }

    _drawBoard() {
        const ctx = this._ctx;
        const canvas = this._canvas;
        if (!ctx || !canvas) return;
        const sizePx = this.MARGIN * 2 + this.BOARD;

        ctx.clearRect(0, 0, sizePx, sizePx);

        // 木色背景
        ctx.fillStyle = '#e8c078';
        ctx.fillRect(0, 0, sizePx, sizePx);

        // 连线
        ctx.strokeStyle = '#4a3728';
        ctx.lineWidth = 2;
        for (const [a, b] of this.LINES) {
            const pa = this._pointXY(a);
            const pb = this._pointXY(b);
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.stroke();
        }

        // 「井」标记（右边开口 1-3 之间的小圆圈）
        const p1 = this._pointXY(1);
        const p3 = this._pointXY(3);
        const cx = (p1.x + p3.x) / 2;
        const cy = (p1.y + p3.y) / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.stroke();

        // 棋点（画小点标记）
        ctx.fillStyle = '#4a3728';
        for (let i = 0; i < 5; i++) {
            const p = this._pointXY(i);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // 棋子
        const board = (this._snapshot && this._snapshot.board) || [];
        for (let i = 0; i < 5; i++) {
            const v = board[i];
            if (!v) continue;
            const p = this._pointXY(i);
            this._drawStone(ctx, p.x, p.y, v === 1 ? '#111' : '#f5f5f5');
        }

        // 选中高亮
        if (this._selected != null) {
            const p = this._pointXY(this._selected);
            ctx.strokeStyle = '#FF9800';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, this.BOARD * 0.18, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    _drawStone(ctx, x, y, color) {
        const r = this.BOARD * 0.16;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1;
        const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r);
        if (color === '#111') {
            grad.addColorStop(0, '#555');
            grad.addColorStop(1, '#000');
        } else {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(1, '#ccc');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    _onBoardClick(e) {
        if (!this._snapshot || this._snapshot.game_over || this._snapshot.board == null) return;
        const rect = this._canvas.getBoundingClientRect();
        const scale = this._canvas.width / rect.width;
        const px = (e.clientX - rect.left) * scale;
        const py = (e.clientY - rect.top) * scale;

        // 找最近的棋点
        let best = -1;
        let bestDist = Infinity;
        for (let i = 0; i < 5; i++) {
            const p = this._pointXY(i);
            const d = (px - p.x) ** 2 + (py - p.y) ** 2;
            if (d < bestDist) { bestDist = d; best = i; }
        }
        const hitRadius = this.BOARD * 0.22;
        if (bestDist > hitRadius * hitRadius) return;

        const myPiece = this._myRole === 'player1' ? 1 : 2;
        const board = this._snapshot.board;

        if (board[best] === myPiece) {
            // 点击己方棋子：选中 / 取消选中
            this._selected = (this._selected === best) ? null : best;
            this._drawBoard();
        } else if (this._selected != null && board[best] === 0) {
            // 点击空点：尝试走子（相邻校验交给服务端）
            this.playSound('turn');
            this._emit('move', { from: this._selected, to: best });
            this._selected = null;
        } else {
            this._selected = null;
            this._drawBoard();
        }
    }
}

GameRegistry.register('stifle_cow', StifleCowGame);

/* ---- 内联样式 ---- */
(function injectStyles() {
    if (document.getElementById('sc-styles')) return;
    const style = document.createElement('style');
    style.id = 'sc-styles';
    style.textContent = `
        .sc-wrap { display: flex; flex-direction: column; gap: 16px; align-items: center; padding: 20px 0; }
        .sc-title { font-size: 28px; font-weight: 800; color: var(--primary); }
        .sc-players { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
        .sc-waiting { font-size: 15px; color: var(--text-muted); }
        .sc-turn { font-size: 16px; color: var(--text-light); min-height: 24px; }
        .sc-turn.my-turn { color: var(--primary); font-weight: 700; }
        .sc-board-wrap { width: 100%; display: flex; justify-content: center; }
        .sc-board-wrap canvas { border-radius: 8px; box-shadow: var(--shadow); cursor: pointer; }
        .sc-hint { font-size: 13px; color: var(--text-muted); }
        .sc-result-line { font-size: 16px; color: var(--text); }
    `;
    document.head.appendChild(style);
})();
