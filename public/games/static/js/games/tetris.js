import GameBase from '../game_base.js';
import TetrisEngine from '../tetris_engine.js';
import TouchControls from '../components/touch_controls.js';
import GameRegistry from '../registry.js';
import { session } from '../session.js';
import { ensureSession } from '../platform.js';
import OnlineMixin from './tetris_online.js';
import RenderMixin from './tetris_render.js';

/* ==================== 俄罗斯方块（联机比分竞速） ====================
 * 双方各一棋盘，消行可攻击对方（垃圾行）；服务端权威判定胜负。
 * 入场强制联机会话（ensureSession）；渲染方法见 tetris_render.js，
 * 会话/广播逻辑见 tetris_online.js。
 */
class TetrisGame extends GameBase {
    constructor(manifest) {
        super(manifest);
        this._loopId = null;
        this._players = [];
        this._keyState = {};
        this._lastTime = 0;
        this._paused = true;
        this._started = false;
        this._online = false;        // 联机模式（比分竞速）
        this._playerCount = 1;       // 联机仅操作我方棋盘（索引 0）
        this._sessionId = null;
        this._myRole = null;         // 'player1' | 'player2'
        this._snapshot = null;       // 服务端最近状态（含 paused，供暂停取反）
        this._opponent = { score: 0, lines: 0, finished: false };
        this._finalResult = null;    // 服务端判定的最终结果
        this._interactionShown = false;  // 联机结算互动是否已触发（防重复）
        this._sentSyncScore = -1;
        this._sentSyncLines = -1;
        this._offSocketHandlers = [];
        this._opponentBoard = null;   // 观战：对手棋盘快照（ROWS×COLS）
        this._opponentCanvas = null;
        this._opponentCtx = null;
    }

    /* ---------- 常量 ---------- */
    get COLS() { return 10; }
    get ROWS() { return 20; }
    get CELL() { return 30; }
    get OPP_CELL() { return 12; }   // 观战对手棋盘的单格尺寸
    get BOARD_W() { return this.COLS * this.CELL; }
    get BOARD_H() { return this.ROWS * this.CELL; }

    /* ---------- 锁定后的联机副作用（攻击行 + 棋盘广播 + 快照缓存） ---------- */
    _afterLock(eng, res) {
        if (res && res.garbage > 0) {
            this._emit('attack', { lines: res.garbage });
        }
        this._sendBoard(eng);
        this._sendSnapshot(eng);    // 服务器快照（跨设备兜底，低频）
        this._saveLocalSnapshot(eng);  // 本地缓存（同设备刷新恢复，高频无延迟）
    }

    /* ---------- 输入处理 ---------- */
    _onKeyDown(e) {
        this._keyState[e.key] = true;
        this._keyState[e.code] = true;

        // ESC/P/触屏⏸ 已由 enableInGamePause 统一处理(打开操作菜单)
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') return;

        if (!this._started || this._paused) return;

        // WASD + 方向键都控制同一棋盘（方便不同键位习惯）
        const eng = this._players[0].engine;
        if (e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            if (eng.tryMove(-1, 0)) this._onPlayerMove();
        }
        if (e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            if (eng.tryMove(1, 0)) this._onPlayerMove();
        }
        if (e.key === 'w' || e.key === 'W') {
            e.preventDefault();
            if (eng.tryRotate(true)) this._onPlayerMove();
        }
        if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            if (eng.tryMove(0, 1)) {
                this._onPlayerMove();
                eng.score += 1;
            }
        }
        if (e.code === 'Space') {
            e.preventDefault();
            this._afterLock(eng, eng.hardDrop());
            eng.dropAccum = 0;
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (eng.tryMove(-1, 0)) this._onPlayerMove();
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (eng.tryMove(1, 0)) this._onPlayerMove();
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (eng.tryRotate(true)) this._onPlayerMove();
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (eng.tryMove(0, 1)) {
                this._onPlayerMove();
                eng.score += 1;
            }
        }
        if (e.key === '/') {
            e.preventDefault();
            this._afterLock(eng, eng.hardDrop());
            eng.dropAccum = 0;
        }
    }

    _onKeyUp(e) {
        this._keyState[e.key] = false;
        this._keyState[e.code] = false;
    }

    _onPlayerMove() {
        const eng = this._players[0].engine;
        const cur = eng.current;
        if (!cur) return;
        // 锁定移动限制仅在方块「接地」后计数，避免方块在半空被强制锁定
        if (eng.collides(cur.shape, cur.x, cur.y + 1)) {
            eng.lockMoves++;
            if (eng.lockMoves >= eng.maxLockMoves) {
                this._afterLock(eng, eng.lockPiece());
                return;
            }
            eng.lockTimer = 0;
        }
    }

    /* ---------- 游戏循环 ---------- */
    _gameLoop(timestamp) {
        if (this._state !== 'running') return;

        if (!this._lastTime) this._lastTime = timestamp;
        // 钳制帧间隔上限：浏览器切后台/长时间卡顿时 rAF 冻结，
        // 恢复后首帧 timestamp 跳变（dt 可达数万 ms）。若直接用会：
        //  1) dropAccum 一帧内远超 interval 却只落 1 格 → 方块"跳一下后卡住"
        //  2) lockTimer 瞬间超时 → 方块未落地就误锁定
        // 限制单帧 ≤100ms，让恢复后按正常帧率继续下落。
        const dt = Math.min(timestamp - this._lastTime, 100);
        this._lastTime = timestamp;

        if (this._paused || !this._started) {
            this._render();
            this._loopId = requestAnimationFrame((t) => this._gameLoop(t));
            return;
        }

        const eng = this._players[0].engine;

        // 持续按键软降（S / ↓）
        if (!eng.gameOver) {
            const isDown = this._keyState['s'] || this._keyState['ArrowDown'];
            if (isDown) {
                eng.softDropAccum += dt;
                while (eng.softDropAccum >= 50) {
                    eng.softDropAccum -= 50;
                    if (eng.tryMove(0, 1)) {
                        eng.score += 1;
                        eng.lockTimer = 0;
                    } else {
                        break;  // 触底，停止软降
                    }
                }
            } else {
                eng.softDropAccum = 0;
            }
        }

        // 重力下落 + 接地锁定
        if (!eng.gameOver && eng.current) {
            // 重力：每帧累加，到达间隔则尝试下落一格
            eng.dropAccum += dt;
            if (eng.dropAccum >= eng.dropInterval) {
                eng.dropAccum = 0;
                if (eng.tryMove(0, 1)) {
                    eng.lockTimer = 0;
                }
            }

            // 接地检测 + 锁定计时（触底后按 lockDelay 锁定，避免长时间卡住）
            const cur = eng.current;
            if (eng.collides(cur.shape, cur.x, cur.y + 1)) {
                eng.lockTimer += dt;
                if (eng.lockTimer >= eng.lockDelay) {
                    this._afterLock(eng, eng.lockPiece());
                }
            } else {
                eng.lockTimer = 0;
                eng.lockMoves = 0;   // 未接地时重置移动计数，避免跨接地周期累积
            }
        }

        this._render();
        this._maybeSync();

        // 我方棋盘结束 → 上报并等待对手
        if (eng.gameOver) {
            this._endGame();
            return;
        }

        this._loopId = requestAnimationFrame((t) => this._gameLoop(t));
    }

    _setPausedLocal(paused) {
        this._paused = paused;
        const overlay = this._container && this._container.querySelector('.tetris-pause-overlay');
        if (overlay) {
            overlay.style.display = paused ? 'flex' : 'none';
        }
    }

    _endGame() {
        // 联机：我方棋盘结束，上报并等待对手
        const p = this._players[0].engine;
        this._emit('game_over', { score: p.score, lines: p.lines });
        if (!this._finalResult) {
            this._showOnlineGameOver('你已结束，等待对手…', null);
        }
    }

    /* 服务端协商重开批准：隐藏结束/暂停浮层，本地引擎复位并重开一局 */
    _onRestartApproved() {
        this._finalResult = null;
        this._setPausedLocal(false);
        if (this._loopId) { cancelAnimationFrame(this._loopId); this._loopId = null; }
        if (this._onlineOverlay) this._onlineOverlay.style.display = 'none';
        // 结束 overlay 可能正显示(协商自结束界面发起的重开)；重置后开新局
        if (this._startBtn) this._startBtn.style.display = 'none';
        this._started = false;
        this._startGame();
        this.log('协商重开: 已开新局');
    }

    /* ---------- 玩家初始化 ---------- */
    _initPlayer(p, container) {
        return {
            engine: new TetrisEngine(this.COLS, this.ROWS),
            canvas: null,
            ctx: null,
            nextCanvas: null,
            nextCtx: null,
            scoreEl: null,
            levelEl: null,
            linesEl: null
        };
    }

    /* ---------- 触屏控件（联机移动端显示虚拟按键） ---------- */
    _setupTouchControls() {
        const move = [
            { key: 'a', code: 'KeyA', label: '◀' },
            { key: 'd', code: 'KeyD', label: '▶' },
        ];
        const action = [
            { key: 'w', code: 'KeyW', label: '↻' },
            { key: 's', code: 'KeyS', label: '▼' },
            { key: ' ', code: 'Space', label: '⤓' },
        ];
        const pause = [
            { key: 'Escape', code: 'Escape', label: '⏸' },
        ];
        TouchControls.show([move, action, pause]);
    }

    /* ---------- 生命周期 ---------- */
    async onStart() {
        const container = this.getContainer();
        await ensureSession('tetris', 'online');
        this._online = session.currentSessionMode === 'online';
        this._playerCount = 1;
        this._setupTouchControls();
        this._initOnline(container);
        // 右上角暂停按钮 + 统一操作菜单；实时游戏菜单打开/继续同步服务端暂停
        this.enableInGamePause({
            isRealTime: true,
            onServerPause: () => this._requestPauseState(true),
            onServerResume: () => this._requestPauseState(false),
        });
        // 页面切后台：rAF 会冻结，切回后若直接继续会造成 dt 跳变与对局不公平。
        // 隐藏时若对局进行中且未暂停 → 请求服务端暂停（双方同步）；
        // 恢复可见不自动继续，由用户点「继续」浮层按钮恢复。
        this._visibilityHandler = () => {
            if (!document.hidden || !this._online || !this._started || this._finalResult) return;
            const paused = !!(this._snapshot && this._snapshot.paused);
            if (!paused) this._emit('pause', {});
        };
        document.addEventListener('visibilitychange', this._visibilityHandler);
    }

    /* 服务端暂停/恢复请求（菜单与切后台共用；服务端幂等） */
    _requestPauseState(paused) {
        if (!this._started || this._finalResult) return;
        const cur = !!(this._snapshot && this._snapshot.paused);
        if (cur === paused) return;   // 状态一致不发
        this._emit(paused ? 'pause' : 'resume', {});
    }

    _startGame(restoreSnap = null, clearCache = true) {
        this._started = true;
        // 刷新重连（restoreSnap 有值）时继承服务端暂停态；正常开局默认未暂停。
        // 首个 onSessionState 广播也会同步 paused，此处只为消除重连窗口期短暂跑动。
        this._paused = !!(restoreSnap && this._snapshot && this._snapshot.paused);
        this._lastTime = 0;
        if (clearCache) this._clearLocalSnapshot();   // 新对局开始清空旧缓存

        const eng = this._players[0].engine;
        if (restoreSnap) {
            eng.restore(restoreSnap);   // 刷新重连：恢复棋盘快照
        } else {
            eng.reset();
            eng.refillBag();
            eng.refillBag();
            eng.spawnPiece();
        }

        this._loopId = requestAnimationFrame((t) => this._gameLoop(t));
        this.log(restoreSnap ? '游戏恢复' : '游戏开始');
    }

    onPause() {
        this._paused = true;
    }

    onResume() {
        this._paused = false;
    }

    onDestroy() {
        if (this._loopId) {
            cancelAnimationFrame(this._loopId);
            this._loopId = null;
        }
        if (this._visibilityHandler) {
            document.removeEventListener('visibilitychange', this._visibilityHandler);
            this._visibilityHandler = null;
        }
        document.removeEventListener('keydown', this._keyHandler);
        document.removeEventListener('keyup', this._keyUpHandler);
        this._offSocketHandlers.forEach(off => off());
        this._offSocketHandlers = [];
        this._players = [];
        this._keyState = {};
        TouchControls.hide();
        this.log('游戏销毁');
    }

    /* 对局进行中判定：本地引擎 started 且尚未收到服务端最终结果 */
    _isInProgress() {
        return !!this._started && !this._finalResult;
    }
}

Object.assign(TetrisGame.prototype, OnlineMixin);
Object.assign(TetrisGame.prototype, RenderMixin);

GameRegistry.register('tetris', TetrisGame);
