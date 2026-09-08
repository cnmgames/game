/* ==================== 俄罗斯方块 - 纯逻辑引擎（平台无关） ====================
 * 本地双人同屏 + 联机 L2（观战 + 攻击行）共用此引擎。
 * 每个实例负责「单个玩家」的棋盘规则：方块定义 / 旋转踢墙 / 碰撞 / 7-bag / 消行 / 垃圾行 / 锁定计时。
 * 引擎不依赖 DOM / canvas / socket，只做纯状态 + 规则，可独立单测。
 *
 * 视图层（games/tetris.js）只负责：Canvas 渲染、键盘/触屏输入、网络同步。
 * 引擎与视图的边界：
 *   - 引擎返回「事件」（lockPiece 返回 cleared/garbage），由视图决定是否广播 attack / 棋盘。
 *   - 引擎持有 pendingGarbage，视图在收到对手 attack 时累加，锁定时由引擎消费。
 */
class TetrisEngine {
    constructor(cols = 10, rows = 20) {
        this.COLS = cols;
        this.ROWS = rows;
        this.lockDelay = 500;
        this.maxLockMoves = 15;
        this.reset();
    }

    /* ---------- 状态 ---------- */
    reset() {
        this.board = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(null));
        this.score = 0;
        this.level = 0;
        this.lines = 0;
        this.current = null;         // { name, shape, x, y, rotation }
        this.currentColor = null;
        this.bag = [];               // 7-bag 队列
        this.dropInterval = 800;     // 每玩家独立下落间隔（毫秒）
        this.dropAccum = 0;
        this.softDropAccum = 0;      // 软降独立累加器
        this.lockTimer = 0;
        this.lockMoves = 0;
        this.gameOver = false;
        this.pendingGarbage = 0;     // 待应用的垃圾行数
    }

    /* ---------- 快照（刷新重连时恢复棋盘） ---------- */
    serialize() {
        return {
            board: this.board.map(row => row.slice()),
            current: this.current
                ? { ...this.current, shape: this.current.shape.map(r => r.slice()) }
                : null,
            currentColor: this.currentColor,
            bag: this.bag.slice(),
            score: this.score,
            lines: this.lines,
            level: this.level,
            gameOver: this.gameOver,
        };
    }

    restore(snap) {
        if (!snap) return;
        this.board = (snap.board || []).map(row => row.slice());
        this.current = snap.current
            ? { ...snap.current, shape: (snap.current.shape || []).map(r => r.slice()) }
            : null;
        this.currentColor = snap.currentColor;
        this.bag = (snap.bag || []).slice();
        this.score = snap.score || 0;
        this.lines = snap.lines || 0;
        this.level = snap.level || 0;
        this.gameOver = !!snap.gameOver;
    }

    /* ---------- 常量：7 种标准方块 (4x4 矩阵) ---------- */
    static get PIECES() {
        return {
            I: {
                shape: [
                    [0,0,0,0],
                    [1,1,1,1],
                    [0,0,0,0],
                    [0,0,0,0]
                ],
                color: '#00FFFF'
            },
            O: {
                shape: [
                    [1,1],
                    [1,1]
                ],
                color: '#FFFF00'
            },
            T: {
                shape: [
                    [0,1,0],
                    [1,1,1],
                    [0,0,0]
                ],
                color: '#AA00FF'
            },
            S: {
                shape: [
                    [0,1,1],
                    [1,1,0],
                    [0,0,0]
                ],
                color: '#00FF00'
            },
            Z: {
                shape: [
                    [1,1,0],
                    [0,1,1],
                    [0,0,0]
                ],
                color: '#FF0000'
            },
            J: {
                shape: [
                    [1,0,0],
                    [1,1,1],
                    [0,0,0]
                ],
                color: '#0000FF'
            },
            L: {
                shape: [
                    [0,0,1],
                    [1,1,1],
                    [0,0,0]
                ],
                color: '#FF8800'
            }
        };
    }

    static get PIECE_NAMES() { return ['I','O','T','S','Z','J','L']; }

    /* 踢墙数据 (SRS) */
    static get WALL_KICKS() {
        return {
            normal: {
                '0>1': [[-1,0],[-1,1],[0,-2],[-1,-2]],
                '1>0': [[1,0],[1,-1],[0,2],[1,2]],
                '1>2': [[1,0],[1,-1],[0,2],[1,2]],
                '2>1': [[-1,0],[-1,1],[0,-2],[-1,-2]],
                '2>3': [[1,0],[1,1],[0,-2],[1,-2]],
                '3>2': [[-1,0],[-1,-1],[0,2],[-1,2]],
                '3>0': [[-1,0],[-1,-1],[0,2],[-1,2]],
                '0>3': [[1,0],[1,1],[0,-2],[1,-2]]
            },
            I: {
                '0>1': [[-2,0],[1,0],[-2,-1],[1,2]],
                '1>0': [[2,0],[-1,0],[2,1],[-1,-2]],
                '1>2': [[-1,0],[2,0],[-1,2],[2,-1]],
                '2>1': [[1,0],[-2,0],[1,-2],[-2,1]],
                '2>3': [[2,0],[-1,0],[2,1],[-1,-2]],
                '3>2': [[-2,0],[1,0],[-2,-1],[1,2]],
                '3>0': [[1,0],[-2,0],[1,-2],[-2,1]],
                '0>3': [[-1,0],[2,0],[-1,2],[2,-1]]
            }
        };
    }

    /* ---------- 方块矩阵工具 ---------- */
    static _rotateMatrix(matrix, clockwise = true) {
        const n = matrix.length;
        const rotated = Array.from({ length: n }, () => Array(n).fill(0));
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (clockwise) {
                    rotated[c][n - 1 - r] = matrix[r][c];
                } else {
                    rotated[n - 1 - c][r] = matrix[r][c];
                }
            }
        }
        return rotated;
    }

    static getPieceShape(name, rotation) {
        let shape = TetrisEngine.PIECES[name].shape.map(row => [...row]);
        for (let i = 0; i < rotation; i++) {
            shape = TetrisEngine._rotateMatrix(shape);
        }
        return shape;
    }

    static pieceColor(name) {
        if (name === 'G') return '#888888';   // 垃圾行灰色
        return TetrisEngine.PIECES[name] ? TetrisEngine.PIECES[name].color : '#888888';
    }

    /* ---------- 7-bag ---------- */
    refillBag() {
        const bag = [...TetrisEngine.PIECE_NAMES];
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        this.bag = this.bag.concat(bag);
    }

    nextPiece() {
        if (this.bag.length < 2) this.refillBag();
        return this.bag.shift();
    }

    /* ---------- 生成 / 碰撞 ---------- */
    spawnPiece() {
        const name = this.nextPiece();
        const shape = TetrisEngine.getPieceShape(name, 0);
        const cols = shape[0].length;
        const x = Math.floor((this.COLS - cols) / 2);
        const y = 0;
        this.current = { name, shape, x, y, rotation: 0 };
        this.currentColor = TetrisEngine.PIECES[name].color;
        // 检查是否碰撞
        if (this.collides(shape, x, y)) {
            this.gameOver = true;
        }
        this.lockTimer = 0;
        this.lockMoves = 0;
        return this.gameOver;
    }

    collides(shape, px, py) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                const bx = px + c;
                const by = py + r;
                if (bx < 0 || bx >= this.COLS || by >= this.ROWS) return true;
                if (by < 0) continue;
                if (this.board[by][bx]) return true;
            }
        }
        return false;
    }

    /* ---------- 移动 / 旋转 ---------- */
    tryMove(dx, dy) {
        const cur = this.current;
        if (!cur) return false;
        if (!this.collides(cur.shape, cur.x + dx, cur.y + dy)) {
            cur.x += dx;
            cur.y += dy;
            return true;
        }
        return false;
    }

    tryRotate(clockwise) {
        const cur = this.current;
        if (!cur) return false;
        const pieceName = cur.name;
        const oldRot = cur.rotation;
        const newRot = clockwise
            ? (oldRot + 1) % 4
            : (oldRot + 3) % 4;
        const newShape = TetrisEngine.getPieceShape(pieceName, newRot);
        const kickKey = `${oldRot}>${newRot}`;
        const kickTable = pieceName === 'I'
            ? TetrisEngine.WALL_KICKS.I
            : TetrisEngine.WALL_KICKS.normal;
        const kicks = kickTable[kickKey] || [];

        // 先尝试不踢墙
        if (!this.collides(newShape, cur.x, cur.y)) {
            cur.shape = newShape;
            cur.rotation = newRot;
            return true;
        }
        // 尝试踢墙
        for (const [dx, dy] of kicks) {
            if (!this.collides(newShape, cur.x + dx, cur.y - dy)) {
                cur.x += dx;
                cur.y -= dy;
                cur.shape = newShape;
                cur.rotation = newRot;
                return true;
            }
        }
        return false;
    }

    getGhostY() {
        const cur = this.current;
        if (!cur) return 0;
        let gy = cur.y;
        while (!this.collides(cur.shape, cur.x, gy + 1)) {
            gy++;
        }
        return gy;
    }

    /* ---------- 硬降 / 锁定 / 消行 / 垃圾行 ---------- */
    hardDrop() {
        const cur = this.current;
        if (!cur) return { cleared: 0, garbage: 0, gameOver: this.gameOver, locked: false };
        cur.y = this.getGhostY();
        return this.lockPiece();
    }

    lockPiece() {
        const cur = this.current;
        if (!cur) return { cleared: 0, garbage: 0, gameOver: this.gameOver, locked: false };
        const { shape, x, y } = cur;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                const bx = x + c;
                const by = y + r;
                if (by < 0) {
                    this.gameOver = true;
                    return { cleared: 0, garbage: 0, gameOver: true, locked: true };
                }
                this.board[by][bx] = cur.name;
            }
        }
        const { cleared, garbage } = this._clearLines();
        const toppedOut = this.applyPendingGarbage();
        if (toppedOut) this.gameOver = true;
        if (!this.gameOver) this.spawnPiece();
        return { cleared, garbage, gameOver: this.gameOver, locked: true };
    }

    _clearLines() {
        let cleared = 0;
        for (let r = this.ROWS - 1; r >= 0; r--) {
            if (this.board[r].every(cell => cell !== null)) {
                this.board.splice(r, 1);
                this.board.unshift(Array(this.COLS).fill(null));
                cleared++;
                r++; // 重新检查当前行
            }
        }
        let garbage = 0;
        if (cleared > 0) {
            const scores = [0, 100, 300, 500, 800];
            this.score += scores[cleared] * (this.level + 1);
            this.lines += cleared;
            this.level = Math.floor(this.lines / 10);
            this.dropInterval = Math.max(50, 800 - (this.level * 70));
            // L2：消行向对手发送垃圾行（1/2/3/4 行 → 0/1/2/4 垃圾）
            garbage = [0, 0, 1, 2, 4][cleared] || 0;
        }
        return { cleared, garbage };
    }

    applyPendingGarbage() {
        if (this.pendingGarbage <= 0) return false;
        let toppedOut = false;
        for (let i = 0; i < this.pendingGarbage; i++) {
            // 顶部已有方块 → 顶出判负
            if (this.board[0].some(cell => cell !== null)) {
                toppedOut = true;
                break;
            }
            const hole = Math.floor(Math.random() * this.COLS);
            const row = Array.from({ length: this.COLS }, (_, c) => (c === hole ? null : 'G'));
            this.board.push(row);
            this.board.shift();
        }
        this.pendingGarbage = 0;
        return toppedOut;
    }
}

export default TetrisEngine;
