import TetrisEngine from '../tetris_engine.js';

/* ==================== 俄罗斯方块 - Canvas 渲染 Mixin ====================
 * 从 TetrisGame 拆出的纯 Canvas 绘制方法，通过 Object.assign 挂到原型。
 * 仅依赖 this._players[p].{engine,ctx,canvas,...} 与常量 getter
 * （this.COLS/this.ROWS/this.CELL/this.BOARD_W/this.BOARD_H）。
 */
const RenderMixin = {
    /* ---------- 渲染 ---------- */
    _drawBoard(p) {
        const player = this._players[p];
        const eng = player.engine;
        const ctx = player.ctx;
        const canvas = player.canvas;
        const cell = this.CELL;
        const w = this.BOARD_W;
        const h = this.BOARD_H;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);

        // 网格线
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        for (let r = 0; r <= this.ROWS; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * cell);
            ctx.lineTo(w, r * cell);
            ctx.stroke();
        }
        for (let c = 0; c <= this.COLS; c++) {
            ctx.beginPath();
            ctx.moveTo(c * cell, 0);
            ctx.lineTo(c * cell, h);
            ctx.stroke();
        }

        // 已锁定的方块
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                if (eng.board[r][c]) {
                    this._drawCell(ctx, c * cell, r * cell, cell, TetrisEngine.pieceColor(eng.board[r][c]));
                }
            }
        }

        // 当前方块
        const cur = eng.current;
        if (cur && !eng.gameOver) {
            // 幽灵方块
            const ghostY = eng.getGhostY();
            if (ghostY !== cur.y) {
                for (let r = 0; r < cur.shape.length; r++) {
                    for (let c = 0; c < cur.shape[r].length; c++) {
                        if (!cur.shape[r][c]) continue;
                        const bx = cur.x + c;
                        const by = ghostY + r;
                        if (by < 0) continue;
                        this._drawGhostCell(ctx, bx * cell, by * cell, cell, eng.currentColor);
                    }
                }
            }

            // 当前方块
            for (let r = 0; r < cur.shape.length; r++) {
                for (let c = 0; c < cur.shape[r].length; c++) {
                    if (!cur.shape[r][c]) continue;
                    const bx = cur.x + c;
                    const by = cur.y + r;
                    if (by < 0) continue;
                    this._drawCell(ctx, bx * cell, by * cell, cell, eng.currentColor);
                }
            }
        }
    },

    _drawCell(ctx, x, y, size, color) {
        const s = size;
        const b = 2; // border

        ctx.fillStyle = color;
        ctx.fillRect(x, y, s, s);

        // 3D 效果 - 亮面左上
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(x, y, s, b);
        ctx.fillRect(x, y, b, s);

        // 暗面右下
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x, y + s - b, s, b);
        ctx.fillRect(x + s - b, y, b, s);

        // 内边框
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
    },

    _drawGhostCell(ctx, x, y, size, color) {
        ctx.fillStyle = color.replace(')', ',0.25)').replace('rgb', 'rgba');
        if (color.startsWith('#')) {
            ctx.fillStyle = color + '40';
        }
        ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 2.5, y + 2.5, size - 5, size - 5);
    },

    _drawNextPiece(p) {
        const player = this._players[p];
        const eng = player.engine;
        const ctx = player.nextCtx;
        const canvas = player.nextCanvas;
        const cell = 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (eng.bag.length === 0) eng.refillBag();
        const nextName = eng.bag[0];
        const shape = TetrisEngine.getPieceShape(nextName, 0);
        const color = TetrisEngine.PIECES[nextName].color;

        const offsetX = (canvas.width - shape[0].length * cell) / 2;
        const offsetY = (canvas.height - shape.length * cell) / 2;

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                this._drawCell(ctx, offsetX + c * cell, offsetY + r * cell, cell, color);
            }
        }
    },

    _drawGameOver(p) {
        const player = this._players[p];
        const eng = player.engine;
        const ctx = player.ctx;
        const w = this.BOARD_W;
        const h = this.BOARD_H;

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#FF6B6B';
        ctx.font = 'bold 28px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 10);

        ctx.fillStyle = 'white';
        ctx.font = '14px -apple-system, sans-serif';
        ctx.fillText(`得分: ${eng.score}`, w / 2, h / 2 + 25);
        ctx.textAlign = 'start';
    },

    _updateStats(p) {
        const player = this._players[p];
        const eng = player.engine;
        player.scoreEl.textContent = eng.score;
        player.levelEl.textContent = eng.level;
        player.linesEl.textContent = eng.lines;
    },

    _render() {
        for (let p = 0; p < this._playerCount; p++) {
            this._drawBoard(p);
            if (this._players[p].engine.gameOver) this._drawGameOver(p);
            this._drawNextPiece(p);
            this._updateStats(p);
        }
    },
};

export default RenderMixin;
