import Router from '../router.js';
import Toast from '../components/toast.js';
import TouchControls from '../components/touch_controls.js';
import { session, bindSessionEvents } from '../session.js';
import IconFactory from '../components/icon_factory.js';

/* ==================== 小学数学竞速赛 - 联机模式 Mixin ====================
 * 服务端权威（MathRaceRoom）：客户端只拿到 {text, options}，永远拿不到答案；
 * 用户选择选项下标 → emit 'answer' {index, round}，判题与记分全在服务端。
 */
const OnlineMixin = {
    _initOnline() {
        const s = session.currentSessionState || {};
        this._sessionId = session.currentSessionId;
        // _myRole 已在主文件 onStart 中由 Auth 推断
        const isHost = this._myRole === 'player1';
        if (s.started && !s.game_over) {
            // 刷新重连：直接从服务端状态恢复当前题
            this._score = s.score || { player1: 0, player2: 0 };
            this._round = s.round || 1;
            this._difficulty = s.difficulty || 'medium';
            this._target = s.target || 5;
            this._question = s.question;
            this._locked = false;
            this._gameOver = false;
            this._lastShownRound = this._round;
            this._renderOnlineRound();
            this._bindOnline();
            return;
        }
        // 开始屏（房主选难度/目标分；客机等待）
        const container = this.getContainer();
        container.innerHTML = `
            <div class="mr-start">
                <div class="mr-start-icon">${IconFactory.icon('math', 56)}</div>
                <h2 class="mr-start-title">小学数学竞速赛 · 联机</h2>
                <p class="mr-start-desc">${isHost ? '选择难度与目标分，等待双方就绪后开始' : '等待房主设置并开始…'}</p>
                <div class="mr-setting">
                    <div class="mr-setting-label">难度</div>
                    <div class="mr-setting-options" id="mr-diff">
                        ${Object.entries({ easy: '简单', medium: '中等', hard: '困难' }).map(([key, name], i) => `
                            <button class="mr-chip ${key === (this._difficulty || 'medium') ? 'active' : ''}" data-value="${key}" data-group="diff" style="--chip-color:${['var(--success)', 'var(--warning)', 'var(--danger)'][i]}">${name}</button>
                        `).join('')}
                    </div>
                </div>
                <div class="mr-setting">
                    <div class="mr-setting-label">先到几分获胜</div>
                    <div class="mr-setting-options" id="mr-target">
                        ${[3, 5, 10].map(t => `
                            <button class="mr-chip ${t === (this._target || 5) ? 'active' : ''}" data-value="${t}" data-group="target">${t} 分</button>
                        `).join('')}
                    </div>
                </div>
                ${isHost
                    ? '<button class="btn btn-primary btn-lg" id="mr-btn-start">开始游戏</button>'
                    : '<div class="mr-waiting">等待房主开始…</div>'}
            </div>
        `;
        if (isHost) {
            container.querySelectorAll('.mr-chip').forEach(btn => {
                btn.addEventListener('click', () => {
                    // 按 data-group 分组清除，只影响同组按钮，保留另一组的选中状态
                    const group = btn.dataset.group;
                    container.querySelectorAll(`.mr-chip[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    if (group === 'diff') this._difficulty = btn.dataset.value;
                    else this._target = parseInt(btn.dataset.value, 10);
                });
            });
            container.querySelector('#mr-btn-start').addEventListener('click', () => {
                this._emit('start', { difficulty: this._difficulty, target: this._target });
            });
        }
        this._bindOnline();
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
        this._difficulty = st.difficulty || this._difficulty;
        this._target = st.target || this._target;
        if (st.started && !st.game_over) {
            // 重开/刷新后：复位本地对局状态（房主 restart 后双方都应解锁）
            this._gameOver = false;
            this._score = st.score || { player1: 0, player2: 0 };
            this._round = st.round || 1;
            this._question = st.question;
            // 房主 start 广播 → 客机进入；题目轮次变化 → 解锁作答
            if (this._round !== this._lastShownRound) {
                this._locked = false;
                this._lastShownRound = this._round;
                this._renderOnlineRound();
            } else {
                this._updateScoreOnly();
            }
        }
        if (st.game_over && !this._gameOver) {
            this._gameOver = true;
            this._showOnlineGameOver(st.winner, st.score);
        }
    },

    _onSessionEvent(evt) {
        if (this.handleInteractionEvent(evt)) return;   // 公共处理 interaction_drawn
        if (this.handleRestartEvent(evt)) return;       // 重开协商(暂停菜单)
        if (evt.event === 'game_over') {
            this._gameOver = true;
            this._showOnlineGameOver(evt.winner, evt.score);
            this._handleGameOverInteraction(evt, evt.winner);
        }
    },

    _renderOnlineRound() {
        const container = this.getContainer();
        const q = this._question;
        if (!q || !q.options) return;
        const names = this._playerNames(session.currentSessionState);
        const optionHtml = q.options.map((opt, i) => `
            <button class="mr-option" data-index="${i}">
                <span class="mr-option-key">${i + 1}</span>
                <span class="mr-option-value">${opt}</span>
            </button>
        `).join('');
        container.innerHTML = `
            <div class="mr-game">
                <div class="mr-header">
                    <div class="mr-stat"><span class="mr-stat-label">${names.player1}</span><span class="mr-stat-val" id="mr-p1">${this._score.player1 || 0}</span></div>
                    <div class="mr-target-info">第 ${this._round} 题 · 先到 ${this._target} 分</div>
                    <div class="mr-stat"><span class="mr-stat-label">${names.player2}</span><span class="mr-stat-val" id="mr-p2">${this._score.player2 || 0}</span></div>
                </div>
                <div class="mr-question">${q.text}</div>
                <div class="mr-options" id="mr-options">${optionHtml}</div>
                <div class="mr-feedback" id="mr-feedback">抢答！答对得分，答错送对方一分</div>
            </div>
        `;
        container.querySelectorAll('.mr-option').forEach(btn => {
            btn.addEventListener('click', () => this._submitAnswer(parseInt(btn.dataset.index, 10)));
        });
        // 先移除旧监听再绑新，避免多轮后 document 上监听器累积
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
        }
        this._keyHandler = (e) => {
            const key = e.key.toUpperCase();
            const map = { '1': 0, '2': 1, '3': 2, '4': 3, A: 0, S: 1, D: 2, F: 3 };
            if (key in map) { e.preventDefault(); this._submitAnswer(map[key]); }
        };
        document.addEventListener('keydown', this._keyHandler);
        this._setupTouchControls();
    },

    /* 联机触屏：单行 1/2/3/4 答题键 */
    _setupTouchControls() {
        TouchControls.show([[
            { key: '1', code: 'Digit1', label: '1' },
            { key: '2', code: 'Digit2', label: '2' },
            { key: '3', code: 'Digit3', label: '3' },
            { key: '4', code: 'Digit4', label: '4' },
        ]]);
    },

    _submitAnswer(index) {
        if (this._locked || this._gameOver) return;
        this._locked = true;
        this._emit('answer', { index, round: this._round });
        const fb = document.getElementById('mr-feedback');
        if (fb) fb.innerHTML = '<span style="color:var(--text-muted);">已提交，等待判定…</span>';
        const container = this.getContainer();
        if (container) {
            container.querySelectorAll('.mr-option').forEach(btn => { btn.disabled = true; });
        }
    },

    _updateScoreOnly() {
        const container = this.getContainer();
        const p1 = container && container.querySelector('#mr-p1');
        const p2 = container && container.querySelector('#mr-p2');
        if (p1) p1.textContent = this._score.player1 || 0;
        if (p2) p2.textContent = this._score.player2 || 0;
    },

    _showOnlineGameOver(winner, score) {
        const container = this.getContainer();
        const s = score || this._score || {};
        const names = this._playerNames(session.currentSessionState);
        const won = winner === this._myRole;
        const text = won ? '你赢了！' : `${names[winner] || '对方'} 获胜！`;
        container.innerHTML = `
            <div class="mr-over">
                <div class="mr-over-icon">${IconFactory.icon(won ? 'trophy' : 'heart-broken', 56)}</div>
                <h2 class="mr-over-title">${text}</h2>
                <div class="mr-over-score">
                    <span>${names.player1} ${s.player1 || 0}</span>
                    <span class="mr-over-vs">:</span>
                    <span>${s.player2 || 0} ${names.player2}</span>
                </div>
                <div class="mr-over-actions">
                    <button class="btn btn-primary btn-lg" id="mr-btn-again">再来一局</button>
                    <button class="btn btn-outline" id="mr-btn-back">返回房间</button>
                </div>
            </div>
        `;
        container.querySelector('#mr-btn-again').addEventListener('click', () => {
            if (this._myRole === 'player1') {
                this._emit('restart', {});
                this._gameOver = false;
            } else {
                Toast.show('等待房主重开…', 'info');
            }
        });
        container.querySelector('#mr-btn-back').addEventListener('click', () => this._onExitClick());
        TouchControls.hide();
    },

    _onExitClick() {
        const inProgress = this._round > 0 && !this._gameOver;
        this.requestExit(inProgress, () => this._emit('surrender', {})).then(async (blocked) => {
            if (!blocked) {
                // 认输方也要看到惩罚内容：等 game_over(含预抽取互动)展示后再退房
                if (this._surrenderPending) {
                    await new Promise((r) => setTimeout(r, 600));
                }
                this._emit('exit_game', {});
                if (Router) Router.goBack();
            }
        });
    },

    /* 对局进行中判定：已进入第 1 题且未结束 */
    _isInProgress() {
        return this._round > 0 && !this._gameOver;
    },
};

export default OnlineMixin;
