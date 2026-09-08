import GameBase from '../game_base.js';
import BreakoutEngine from '../breakout_engine.js';
import GameRegistry from '../registry.js';
import Toast from '../components/toast.js';
import { session, bindSessionEvents } from '../session.js';
import { ensureSession } from '../platform.js';
import IconFactory from '../components/icon_factory.js';
import TouchControls from '../components/touch_controls.js';

/* ==================== 打砖块（联机对抗） ====================
 * 各自一个场地，客户端权威本地跑球，只同步比分/存活（低频，避免实时同步卡顿）。
 * 入场强制联机会话（ensureSession），仅远程联机玩法。
 */
class BreakoutGame extends GameBase {
    constructor(manifest) {
        super(manifest);
        this._sessionId = null;
        this._myRole = null;
        this._opponent = { score: 0, lives: 3, finished: false };
        this._offSocketHandlers = [];
        this._fields = [];       // 场地列表（联机仅 1 个 solo 场地）
        this._running = false;
        this._rafId = null;
        this._keyHandler = null;
        this._keyUpHandler = null;
        this._sentSync = { score: -1, lives: -1 };
        this._gameOver = false;
        this._started = false;
    }

    async onStart() {
        await ensureSession('breakout', 'online');
        this._sessionId = session.currentSessionId;
        this._online = true;   // 打砖块仅联机
        const s = session.currentSessionState || {};
        this._myRole = this._inferRole(s);
        this._bindOnline();
        // 右上角暂停按钮 + 操作菜单；实时游戏菜单打开/继续本地停启游戏循环
        this.enableInGamePause({
            isRealTime: true,
            onServerPause: () => { if (this._started && !this._gameOver) this._stopLoop(); },
            onServerResume: () => { if (this._started && !this._gameOver) this._startLoop(); },
        });
        this._renderStartScreen();
    }

    /* 服务端协商重开批准：本地复位并重开一局 */
    _onRestartApproved() {
        this._gameOver = false;
        this._started = false;
        this._snapshot = this._snapshot || {};
        if (this._online && session.currentSessionState) {
            this._initGame();
            this._started = true;
        }
    }

    /* 联机对局中判定：本地引擎 started 且未结束 */
    _isInProgress() {
        return !!this._started && !this._gameOver;
    }

    onDestroy() {
        this._stopLoop();
        this._removeKeyHandlers();
        TouchControls.hide();
        this._offSocketHandlers.forEach(off => off());
        this._offSocketHandlers = [];
    }

    /* ---------- 页面 ---------- */

    _renderStartScreen() {
        const container = this.getContainer();
        const isHost = this._myRole === 'player1';
        container.innerHTML = `
            <div class="bo-start">
                <div class="bo-start-icon">${IconFactory.icon('tetris', 64)}</div>
                <h2 class="bo-start-title">打砖块 · 对抗</h2>
                <p class="bo-start-desc">各自独立清砖，比谁先清完 / 活得久！</p>
                <div class="bo-controls-hint">
                    <div class="bo-ctrl-card"><span class="bo-ctrl-key">← / →</span>移动挡板 · 发球</div>
                </div>
                ${isHost
                    ? '<button class="btn btn-primary btn-lg" id="bo-btn-start">开始游戏</button>'
                    : '<div class="bo-waiting">等待房主开始…</div>'}
            </div>
        `;
        const startBtn = container.querySelector('#bo-btn-start');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this._emit('start', {});
                this._started = true;
                this._initGame();   // 房主本地立即进入棋盘（客机收到 started 后进入）
            });
        }
    }

    _renderGameBoard() {
        const container = this.getContainer();
        container.innerHTML = `
            <div class="bo-game">
                <div class="bo-header">
                    <div class="bo-stat"><span class="bo-stat-label">我</span><span class="bo-stat-val" id="bo-p1">0 分 · 3 命</span></div>
                    <div class="bo-stat"><span class="bo-stat-label">对手</span><span class="bo-stat-val" id="bo-opp">${this._opponent.score} 分 · ${this._opponent.lives} 命</span></div>
                </div>
                <div class="bo-fields" id="bo-fields"></div>
                <div class="bo-footer">
                    <button class="btn btn-outline btn-sm" id="bo-btn-restart">重新开始</button>
                </div>
                <div class="bo-overlay hidden" id="bo-overlay"></div>
            </div>
        `;
        container.querySelector('#bo-btn-restart').addEventListener('click', () => {
            if (this._myRole === 'player1') this._emit('start', {});
            this._initGame();
        });
    }

    _initGame() {
        this._renderGameBoard();
        this._gameOver = false;
        this._fields = [];
        this._fields.push(this._createField('solo'));
        for (const f of this._fields) {
            f.engine.reset();
            f.engine.initBricks();
            f.engine.resetPaddle();
            f.engine.resetBall();
        }
        this._updateDisplays();
        this._attachKeyHandlers();
        this._setupTouchControls();
        this._draw();
        this._startLoop();
    }

    _createField(side) {
        const field = { side, engine: new BreakoutEngine(), canvas: null, ctx: null, keys: { left: false, right: false } };
        // 每个场地创建一个 canvas，挂到 #bo-fields
        const wrap = document.getElementById('bo-fields');
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'bo-field';
        const canvas = document.createElement('canvas');
        canvas.className = 'bo-field-canvas';
        canvas.width = field.engine.WIDTH;
        canvas.height = field.engine.HEIGHT;
        fieldDiv.appendChild(canvas);
        wrap.appendChild(fieldDiv);
        field.canvas = canvas;
        field.ctx = canvas.getContext('2d');
        return field;
    }

    /* ---------- 键盘 ---------- */

    _isLeftKey(side, k) {
        // solo：两种键位都认
        return k === 'ArrowLeft' || k === 'a' || k === 'A';
    }

    _isRightKey(side, k) {
        // solo：两种键位都认
        return k === 'ArrowRight' || k === 'd' || k === 'D';
    }

    _attachKeyHandlers() {
        this._removeKeyHandlers();
        this._keyHandler = (e) => {
            const k = e.key;
            for (const f of this._fields) {
                if (this._isLeftKey(f.side, k)) { f.keys.left = true; this._maybeLaunch(f); }
                if (this._isRightKey(f.side, k)) { f.keys.right = true; this._maybeLaunch(f); }
            }
            if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(k)) e.preventDefault();
        };
        this._keyUpHandler = (e) => {
            const k = e.key;
            for (const f of this._fields) {
                if (this._isLeftKey(f.side, k)) f.keys.left = false;
                if (this._isRightKey(f.side, k)) f.keys.right = false;
            }
        };
        document.addEventListener('keydown', this._keyHandler);
        document.addEventListener('keyup', this._keyUpHandler);
    }

    _removeKeyHandlers() {
        if (this._keyHandler) { document.removeEventListener('keydown', this._keyHandler); this._keyHandler = null; }
        if (this._keyUpHandler) { document.removeEventListener('keyup', this._keyUpHandler); this._keyUpHandler = null; }
    }

    _setupTouchControls() {
        // 触屏设备显示虚拟按键，合成等价键盘事件（沿用 TouchControls 组件）
        // 联机：单个挡板，左右移动
        TouchControls.show([
            [
                { key: 'ArrowLeft', code: 'ArrowLeft', label: '◀' },
                { key: 'ArrowRight', code: 'ArrowRight', label: '▶' },
            ],
        ]);
    }

    _maybeLaunch(f) {
        // idle 时（球停在挡板上）按下移动键即发球
        if (!this._gameOver && f.engine.state === 'idle') {
            f.engine.state = 'playing';
        }
    }

    /* ---------- 循环 ---------- */

    _startLoop() {
        if (this._rafId) return;
        this._running = true;
        this._loop();
    }

    _stopLoop() {
        this._running = false;
        if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    }

    _loop() {
        if (!this._running) return;
        this._update();
        this._draw();
        this._rafId = requestAnimationFrame(() => this._loop());
    }

    _update() {
        for (const f of this._fields) {
            const evt = f.engine.update(f.keys);
            if (evt.type === 'brick_hit' || evt.type === 'win' || evt.type === 'ball_lost' || evt.type === 'lose') {
                this._updateDisplays();
                this._maybeSync(f);
            }
            if (evt.type === 'win') this._handleFieldEnd(f, 'win');
            else if (evt.type === 'lose') this._handleFieldEnd(f, 'lose');
        }
    }

    _draw() {
        for (const f of this._fields) {
            const ctx = f.ctx;
            const eng = f.engine;
            if (!ctx) continue;
            ctx.clearRect(0, 0, eng.WIDTH, eng.HEIGHT);
            ctx.fillStyle = 'rgba(0,0,0,0.04)';
            ctx.fillRect(0, 0, eng.WIDTH, eng.HEIGHT);

            // 砖块
            for (const brick of eng.bricks) {
                if (!brick.alive) continue;
                ctx.fillStyle = brick.color;
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 3);
                ctx.fill();
            }
            // 挡板
            ctx.fillStyle = '#E75480';
            ctx.beginPath();
            ctx.roundRect(eng.paddle.x, eng.paddle.y, eng.paddle.width, eng.paddle.height, 6);
            ctx.fill();
            // 球
            ctx.fillStyle = '#FF9800';
            ctx.beginPath();
            ctx.arc(eng.ball.x, eng.ball.y, eng.ball.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /* ---------- 显示 ---------- */

    _updateDisplays() {
        const fmt = (f) => `${f.engine.score} 分 · ${f.engine.lives} 命`;
        const me = this._fields[0];
        const p1 = document.getElementById('bo-p1');
        if (p1 && me) p1.textContent = fmt(me);
        const opp = document.getElementById('bo-opp');
        if (opp) opp.textContent = `${this._opponent.score} 分 · ${this._opponent.lives} 命`;
    }

    _handleFieldEnd(f, result) {
        // 联机：上报服务端判胜负
        if (this._gameOver) return;
        this._emit('game_over', { score: f.engine.score, lives: f.engine.lives, result });
        // 本地先停循环，等广播最终胜负
        this._stopLoop();
        this._gameOver = true;
    }

    _showGameOver(title, icon = IconFactory.icon('trophy', 48)) {
        const overlay = document.getElementById('bo-overlay');
        if (!overlay) return;
        overlay.classList.remove('hidden');
        overlay.innerHTML = `
            <div class="bo-overlay-content">
                <div class="bo-overlay-icon">${icon}</div>
                <div class="bo-overlay-title">${title}</div>
                <button class="btn btn-primary" id="bo-btn-over-restart">再来一局</button>
            </div>
        `;
        overlay.querySelector('#bo-btn-over-restart').addEventListener('click', () => {
            if (this._myRole === 'player1') this._emit('start', {});
            this._initGame();
        });
    }

    /* ---------- 联机 ---------- */

    _bindOnline() {
        this._offSocketHandlers.push(bindSessionEvents(this._sessionId, {
            onState: (st) => { this._onSessionState(st); },
            onEvent: (evt) => { this._onSessionEvent(evt); },
            onError: (data) => Toast && Toast.error((data && data.message) || '操作失败'),
        }));
    }


    _maybeSync(f) {
        if (!this._sessionId) return;
        if (f.engine.score === this._sentSync.score && f.engine.lives === this._sentSync.lives) return;
        this._sentSync.score = f.engine.score;
        this._sentSync.lives = f.engine.lives;
        this._emit('sync', { score: f.engine.score, lives: f.engine.lives });
    }

    _onSessionState(st) {
        const other = this._myRole === 'player1' ? 'player2' : 'player1';
        this._opponent.score = (st.scores && st.scores[other]) || 0;
        this._opponent.lives = (st.lives && st.lives[other]) || 3;
        this._opponent.finished = !!(st.finished && st.finished[other]);
        // 房主开始 → 客机自动进入游戏
        if (st.started && !this._started) {
            this._started = true;
            this._initGame();
        }
        this._updateDisplays();
    }

    _onSessionEvent(evt) {
        if (this.handleInteractionEvent(evt)) return;   // 公共处理 interaction_drawn
        if (this.handleRestartEvent(evt)) return;       // 重开协商(暂停菜单)
        if (evt.event === 'game_over') {
            this._gameOver = true;
            this._stopLoop();
            const w = evt.winner;
            const won = (w === this._myRole);
            const title = (w === 'tie') ? '平局！' : (won ? '你赢了！' : '对方获胜！');
            const icon = (w === 'tie') ? IconFactory.icon('handshake', 48) : (won ? IconFactory.icon('trophy', 48) : IconFactory.icon('heart-broken', 48));
            this._showGameOver(title, icon);
            this._handleGameOverInteraction(evt, w);
        }
    }
}

GameRegistry.register('breakout', BreakoutGame);

/* ---- 内联样式 ---- */
(function injectStyles() {
    if (document.getElementById('bo-styles')) return;
    const style = document.createElement('style');
    style.id = 'bo-styles';
    style.textContent = `
        .bo-start { text-align: center; padding: 30px 20px; }
        .bo-start-icon { font-size: 64px; margin-bottom: 16px; }
        .bo-start-title { font-size: 28px; font-weight: 800; color: var(--primary); margin-bottom: 12px; }
        .bo-start-desc { color: var(--text-light); font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
        .bo-waiting { font-size: 15px; color: var(--text-muted); margin-bottom: 16px; }
        .bo-controls-hint { display: flex; gap: 16px; justify-content: center; margin-bottom: 24px; flex-wrap: wrap; }
        .bo-ctrl-card { background: var(--bg-card); padding: 12px 20px; border-radius: var(--radius); font-size: 14px; color: var(--text-light); display: flex; flex-direction: column; align-items: center; gap: 4px; border: 2px solid var(--border); }
        .bo-ctrl-key { background: rgba(231,84,128,0.1); color: var(--primary); padding: 2px 10px; border-radius: 6px; font-weight: 700; font-size: 13px; letter-spacing: 2px; }
        .bo-game { display: flex; flex-direction: column; gap: 12px; align-items: center; }
        .bo-header { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .bo-stat { display: flex; flex-direction: column; align-items: center; background: var(--bg-card); padding: 8px 16px; border-radius: var(--radius); }
        .bo-stat-label { font-size: 12px; color: var(--text-muted); }
        .bo-stat-val { font-size: 16px; font-weight: 700; color: var(--primary); }
        .bo-fields { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .bo-field { position: relative; }
        .bo-field-canvas { border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); max-width: 100%; height: auto; }
        .bo-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); z-index: 100; }
        .bo-overlay.hidden { display: none; }
        .bo-overlay-content { text-align: center; color: white; }
        .bo-overlay-icon { font-size: 48px; margin-bottom: 8px; }
        .bo-overlay-title { font-size: 24px; font-weight: 800; margin-bottom: 16px; }
        .bo-footer { display: flex; gap: 8px; }
    `;
    document.head.appendChild(style);
})();
