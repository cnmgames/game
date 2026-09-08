import Toast from '../components/toast.js';
import Router from '../router.js';
import TetrisEngine from '../tetris_engine.js';
import { session, bindSessionEvents } from '../session.js';

/* ==================== 俄罗斯方块 - 联机模式 Mixin ====================
 * 从 TetrisGame 拆出的联机方法，通过 Object.assign 挂到原型。
 */
const OnlineMixin = {
    /* ---------- 联机模式（L1 比分竞速） ---------- */

    _initOnline(container) {
        container.innerHTML = '';
        const s = session.currentSessionState || {};
        this._snapshot = s;
        this._sessionId = session.currentSessionId;
        this._myRole = this._inferRole(s);
        const isHost = this._myRole === 'player1';

        const wrapper = document.createElement('div');
        wrapper.className = 'tetris-wrapper';
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:14px;user-select:none;-webkit-user-select:none;';
        container.appendChild(wrapper);

        const title = document.createElement('div');
        title.style.cssText = 'font-size:24px;font-weight:700;color:var(--primary);';
        title.textContent = '俄罗斯方块 · 联机对战';
        wrapper.appendChild(title);

        // 对手状态面板
        const oppPanel = document.createElement('div');
        oppPanel.className = 'status-bar';
        oppPanel.style.cssText = 'font-size:14px;color:var(--text-light);text-align:center;';
        wrapper.appendChild(oppPanel);
        this._opponentPanel = oppPanel;

        // 对手棋盘（观战）+ 我的棋盘
        this._players[0] = this._initPlayer(0);
        const boardsRow = document.createElement('div');
        boardsRow.style.cssText = 'display:flex;gap:16px;align-items:flex-start;justify-content:center;flex-wrap:wrap;';
        wrapper.appendChild(boardsRow);

        const oppCanvas = document.createElement('canvas');
        oppCanvas.className = 'tetris-opponent';
        oppCanvas.width = this.COLS * this.OPP_CELL;
        oppCanvas.height = this.ROWS * this.OPP_CELL;
        oppCanvas.style.cssText = 'border:2px solid #FF8A65;border-radius:6px;';
        this._opponentCanvas = oppCanvas;
        this._opponentCtx = oppCanvas.getContext('2d');
        boardsRow.appendChild(oppCanvas);

        const canvas = document.createElement('canvas');
        canvas.className = 'tetris-board';
        canvas.width = this.BOARD_W;
        canvas.height = this.BOARD_H;
        canvas.style.cssText = 'border:2px solid #4FC3F7;border-radius:8px;box-shadow:0 0 20px rgba(0,0,0,0.3);';
        this._players[0].canvas = canvas;
        this._players[0].ctx = canvas.getContext('2d');
        boardsRow.appendChild(canvas);

        // 我的信息面板
        const infoPanel = document.createElement('div');
        infoPanel.style.cssText = 'display:flex;gap:16px;font-size:13px;color:var(--text-light);';
        const scoreDiv = document.createElement('div');
        scoreDiv.innerHTML = '分数: <strong style="color:#4FC3F7;">0</strong>';
        this._players[0].scoreEl = scoreDiv.querySelector('strong');
        const levelDiv = document.createElement('div');
        levelDiv.innerHTML = '等级: <strong style="color:#4FC3F7;">0</strong>';
        this._players[0].levelEl = levelDiv.querySelector('strong');
        const linesDiv = document.createElement('div');
        linesDiv.innerHTML = '消除: <strong style="color:#4FC3F7;">0</strong>';
        this._players[0].linesEl = linesDiv.querySelector('strong');
        infoPanel.appendChild(scoreDiv);
        infoPanel.appendChild(levelDiv);
        infoPanel.appendChild(linesDiv);
        wrapper.appendChild(infoPanel);

        // 下一个方块预览
        const nextCanvas = document.createElement('canvas');
        nextCanvas.width = 100;
        nextCanvas.height = 80;
        nextCanvas.style.cssText = 'border:1px solid rgba(0,0,0,0.1);border-radius:6px;background:rgba(0,0,0,0.05);';
        this._players[0].nextCanvas = nextCanvas;
        this._players[0].nextCtx = nextCanvas.getContext('2d');
        wrapper.appendChild(nextCanvas);

        // 开始 / 等待（房主开始，客机自动开始）；刷新重连时从快照恢复
        const startBtn = document.createElement('button');
        startBtn.className = 'btn btn-primary btn-lg';
        startBtn.style.cssText = 'margin-top:8px;';
        if (s.started) {
            // 刷新重连：优先本地缓存（高频、无延迟），兜底服务器快照（跨设备）
            const snap = this._loadLocalSnapshot() || (s.snapshots && s.snapshots[this._myRole]);
            this._startGame(snap, false);
            startBtn.style.display = 'none';
        } else {
            startBtn.textContent = isHost ? '开始游戏' : '等待房主开始…';
            startBtn.disabled = !isHost;
            startBtn.addEventListener('click', () => {
                this._emit('start', {});
                this._startGame();
                startBtn.style.display = 'none';
            });
        }
        wrapper.appendChild(startBtn);
        this._startBtn = startBtn;

        // 结束覆盖层
        const overOverlay = document.createElement('div');
        overOverlay.className = 'tetris-gameover-final';
        overOverlay.style.cssText = 'display:none;position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);z-index:11;border-radius:var(--radius-xl);flex-direction:column;justify-content:center;align-items:center;gap:16px;';
        overOverlay.innerHTML = `
            <div class="winner-text" style="font-size:36px;font-weight:800;color:#FFD54F;"></div>
            <div class="score-text" style="font-size:18px;color:white;"></div>
            <button class="btn btn-primary" id="tetris-online-exit">返回</button>
        `;
        wrapper.style.position = 'relative';
        wrapper.appendChild(overOverlay);
        overOverlay.querySelector('#tetris-online-exit').addEventListener('click', () => Router.goBack());
        this._onlineOverlay = overOverlay;

        // 暂停覆盖层（服务端权威暂停：任一方暂停双方同时停下）
        const pauseOverlay = document.createElement('div');
        pauseOverlay.className = 'tetris-pause-overlay';
        pauseOverlay.style.cssText = 'display:none;position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10;border-radius:var(--radius-xl);justify-content:center;align-items:center;flex-direction:column;gap:16px;';
        pauseOverlay.innerHTML = `
            <div style="font-size:32px;font-weight:800;color:white;">已暂停</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.8);">任一方点击「继续」后双方同时恢复</div>
            <button class="btn btn-primary" id="tetris-online-resume">继续游戏</button>
        `;
        pauseOverlay.querySelector('#tetris-online-resume').addEventListener('click', () => {
            this._emit('resume', {});
        });
        wrapper.appendChild(pauseOverlay);
        this._pauseOverlay = pauseOverlay;

        // 键盘
        this._keyHandler = this._onKeyDown.bind(this);
        this._keyUpHandler = this._onKeyUp.bind(this);
        document.addEventListener('keydown', this._keyHandler);
        document.addEventListener('keyup', this._keyUpHandler);

        this._bindOnline();
        this._updateOpponentPanel();
        this._drawBoard(0);
        this._drawOpponentBoard();
    },

    _bindOnline() {
        this._offSocketHandlers.push(bindSessionEvents(this._sessionId, {
            onState: (st) => { this._onSessionState(st); },
            onEvent: (evt) => { this._onSessionEvent(evt); },
            onError: (data) => Toast && Toast.error((data && data.message) || '操作失败'),
        }));
    }
,

    _onSessionState(st) {
        this._snapshot = st;   // 供暂停取反等服务端状态查询
        const other = this._myRole === 'player1' ? 'player2' : 'player1';
        this._opponent.score = (st.scores && st.scores[other]) || 0;
        this._opponent.lines = (st.lines && st.lines[other]) || 0;
        this._opponent.finished = !!(st.finished && st.finished[other]);
        // 服务端权威暂停：任一方暂停 → 双方 _paused=true 并显示浮层；恢复同理
        if (this._started && !st.game_over) {
            this._setPausedLocal(!!st.paused);
        }
        // 房主开始 → 客机自动开始
        if (st.started && !this._started && this._myRole === 'player2') {
            this._startGame();
            if (this._startBtn) this._startBtn.style.display = 'none';
        }
        this._updateOpponentPanel();
    },

    _onSessionEvent(evt) {
        if (this.handleInteractionEvent(evt)) return;   // 公共处理 interaction_drawn
        if (this.handleRestartEvent(evt)) return;       // 重开协商(暂停菜单)
        if (evt.event === 'game_over') {
            this._finalResult = evt;
            // 对局结束：隐藏暂停浮层并清除暂停态
            this._setPausedLocal(false);
            // 停止游戏循环（胜者此时可能仍在运行）
            if (this._loopId) { cancelAnimationFrame(this._loopId); this._loopId = null; }
            this._clearLocalSnapshot();   // 对局结束，清空本地缓存
            const w = evt.winner;
            const surrendered = !!(evt.payload && evt.payload.surrender);
            let text;
            if (w === 'tie') text = '平局！';
            else if (w === this._myRole) text = surrendered ? '对方认输，你赢了！🎉' : '你赢了！🎉';
            else text = surrendered ? '你已认输，对方获胜' : '对方获胜！';
            if (surrendered && w === this._myRole) {
                Toast && Toast.show('对方认输', 'info');
            }
            this._showOnlineGameOver(text, evt);
            // 认输结束：服务端已预抽取互动并随 game_over 下发（防 exit_game 竞态丢失）
            if (this.hasPreDrawnInteraction(evt)) {
                this.showCoupleTip('win', evt.payload.interaction);
                // 认输方自己要看到惩罚内容：展示后通知 App 完成退出
                if (evt.surrender_by === this._myRole) this._notifySurrenderSettled();
                return;
            }
            // 赢家请求服务器端抽取互动（双方通过 interaction_drawn 同步显示，防重复）
            if (w === this._myRole && !this._interactionShown) {
                this._interactionShown = true;
                this.requestInteraction();
            }
        } else if (evt.event === 'opponent_board') {
            // L2 观战：更新对手棋盘（忽略自己广播的）
            if (evt.from && evt.from !== this._myRole && evt.payload && evt.payload.board) {
                this._opponentBoard = evt.payload.board;
                this._drawOpponentBoard();
            }
        } else if (evt.event === 'attack') {
            // L2 攻击行：对手消行，我方积累垃圾行（忽略自己广播的）
            if (evt.from && evt.from !== this._myRole) {
                const lines = (evt.payload && evt.payload.lines) || 0;
                this._players[0].engine.pendingGarbage += lines;
                if (lines > 0) Toast.show(`对手消行，你被攻击 +${lines} 行！`);
            }
        }
    },

    _maybeSync() {
        if (!this._online || !this._sessionId) return;
        const p = this._players[0].engine;
        if (!p) return;
        if (p.score === this._sentSyncScore && p.lines === this._sentSyncLines) return;
        this._sentSyncScore = p.score;
        this._sentSyncLines = p.lines;
        this._emit('sync', { score: p.score, lines: p.lines });
    },

    /* ---------- L2 观战 + 攻击行 ---------- */

    _sendBoard(eng) {
        if (!this._online || !this._sessionId) return;
        const board = eng.board;
        this._emit('board', { board: board.map(row => row.slice()) });
    },

    _sendSnapshot(eng) {
        if (!this._online || !this._sessionId) return;
        this._emit('snapshot', eng.serialize());
    },

    /* ---------- 本地缓存（localStorage 高频记录，刷新恢复优先，避免服务器往返延迟） ---------- */

    _snapKey() {
        return `tetris_snap_${this._sessionId}`;
    },

    _saveLocalSnapshot(eng) {
        if (!this._sessionId) return;
        try {
            localStorage.setItem(this._snapKey(), JSON.stringify(eng.serialize()));
        } catch (e) { /* 容量满或不可用，静默降级到服务器快照 */ }
    },

    _loadLocalSnapshot() {
        if (!this._sessionId) return null;
        try {
            const raw = localStorage.getItem(this._snapKey());
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    },

    _clearLocalSnapshot() {
        if (!this._sessionId) return;
        try {
            localStorage.removeItem(this._snapKey());
        } catch (e) { /* 忽略 */ }
    },

    _drawOpponentBoard() {
        const ctx = this._opponentCtx;
        const canvas = this._opponentCanvas;
        if (!ctx || !canvas) return;
        const cell = this.OPP_CELL;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const board = this._opponentBoard;
        if (!board) return;
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const name = board[r] && board[r][c];
                if (name) {
                    ctx.fillStyle = TetrisEngine.pieceColor(name);
                    ctx.fillRect(c * cell, r * cell, cell - 1, cell - 1);
                }
            }
        }
    },

    _updateOpponentPanel() {
        if (!this._opponentPanel) return;
        const o = this._opponent;
        const status = o.finished ? '已结束' : '进行中';
        this._opponentPanel.textContent = `对手：分数 ${o.score} | 消除 ${o.lines} 行 | ${status}`;
    },

    _showOnlineGameOver(text, evt) {
        const overlay = this._onlineOverlay;
        if (!overlay) return;
        overlay.style.display = 'flex';
        overlay.querySelector('.winner-text').textContent = text;
        const s = (evt && evt.scores) || null;
        overlay.querySelector('.score-text').textContent = s
            ? `最终比分 ${s.player1 || 0} : ${s.player2 || 0}`
            : '';
    }
};

export default OnlineMixin;
