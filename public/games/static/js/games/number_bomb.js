import GameBase from '../game_base.js';
import Toast from '../components/toast.js';
import { escapeHtml } from '../util.js';
import { playerBadge } from '../components/game_ui.js';
import GameRegistry from '../registry.js';
import { ensureSession, createNumberBombPlatform } from '../platform.js';
import { session } from '../session.js';
import IconFactory from '../components/icon_factory.js';

/* ==================== 数字炸弹 - 视图（远程联机会话） ====================
 * 视图只依赖 Platform 抽象接口，服务端权威判定。
 * 渲染/交互代码完全一致。
 */
class NumberBombGame extends GameBase {
    constructor(manifest) {
        super(manifest);
        this.platform = null;
        this._snapshot = null;
        this._sessionId = null;
        this._offInteraction = null;
    }

    async onStart() {
        // 确保有联机会话（远程联机已由房间大厅创建）
        await ensureSession('number_bomb', 'online');
        this._sessionId = session.currentSessionId;
        this._online = true;   // 数字炸弹仅联机
        this.platform = createNumberBombPlatform();
        this._snapshot = this.platform.getInitialState();
        this._bindInteraction();   // 监听 interaction_drawn（服务端权威互动抽取）
        this.enableInGamePause();   // 右上角暂停按钮 + 操作菜单(继续/重新开始/退出)
        this.platform.onState((s) => {
            this._snapshot = s;
            this._render();
        });
        this.platform.onEvent('game_over', (s) => {
            this._snapshot = s;
            const iWon = s.winner === this.platform.getMyRole();
            this.playSound(iWon ? 'win' : 'lose');
            if (s.surrenderBy) {
                const name = s.playerNames[s.surrenderBy] || '对方';
                Toast && Toast.show(`${name} 认输`, 'info');
            }
            this._render();
            // 认输结束：服务端已预抽取互动并随 game_over 下发（防 exit_game 竞态丢失）
            if (s.interaction) {
                this.showCoupleTip('win', s.interaction);
                // 认输方自己要看到惩罚内容：展示后通知 App 完成退出
                if (s.surrenderBy === this.platform.getMyRole()) this._notifySurrenderSettled();
                return;
            }
            // 联机赢家请求服务器端抽取互动（双方通过 interaction_drawn 同步显示）
            if (iWon) this.requestInteraction();
        });
        this._render();
    }

    /* 监听 interaction_drawn（Platform.onEvent 会丢失 payload，这里直接监听原始事件） */
    _bindInteraction() {
        const sock = session.socket;
        if (!sock) return;
        const onEvent = (evt) => {
            if (!evt || evt.session_id !== this._sessionId) return;
            if (this.handleInteractionEvent(evt)) return;
            this.handleRestartEvent(evt);   // 重开协商(暂停菜单)
        };
        sock.on('session_event', onEvent);
        this._offInteraction = () => sock.off('session_event', onEvent);
    }

    onDestroy() {
        if (this._offInteraction) { this._offInteraction(); this._offInteraction = null; }
        if (this.platform) {
            this.platform.destroy();
            this.platform = null;
        }
    }

    _render() {
        const container = this.getContainer();
        if (!this._snapshot || !this._snapshot.started) {
            this._renderLobby(container);
        } else if (this._snapshot.gameOver) {
            this._renderGameOver(container);
        } else {
            this._renderGame(container);
        }
    }

    /* ---- 大厅（等待/准备） ---- */
    _renderLobby(container) {
        const s = this._snapshot || {};
        const names = s.playerNames || { player1: '玩家1', player2: '玩家2' };
        const isHost = this.platform.isHost();
        const guestJoined = s.guestJoined !== false;
        const min = s.minNum || 1;
        const max = s.maxNum || 100;
        const showRoomCode = this.platform.mode === 'online' && session.currentSessionShowRoomCode !== false;
        const roomCode = showRoomCode ? (this.platform.sessionId || '') : '';

        const guestText = playerBadge(
            guestJoined ? `玩家2：${names.player2}` : '玩家2：等待加入…',
            { side: 'p2', icon: IconFactory.icon('user', 16) }
        );

        const roomCodeBlock = roomCode ? `
                <div class="nb-room-code">
                    <span>房间码</span>
                    <b>${roomCode}</b>
                    <button class="btn btn-outline btn-sm" id="nb-copy-code">复制</button>
                </div>
        ` : '';

        container.innerHTML = `
            <div class="nb-wrap">
                <div class="nb-big-icon">${IconFactory.icon('bomb', 56)}</div>
                <h2 class="nb-title">数字炸弹</h2>
                <div class="nb-players">
                    ${playerBadge(`玩家1：${names.player1}`, { side: 'p1', icon: IconFactory.icon('user', 16) })}
                    ${guestText}
                </div>
                ${roomCodeBlock}
                ${isHost ? `
                    <div class="nb-lobby-controls">
                        <div class="nb-settings-row">
                            <span>范围</span>
                            <input type="number" id="nb-min" class="nb-num-input" value="${min}" min="1" max="999">
                            <span>~</span>
                            <input type="number" id="nb-max" class="nb-num-input" value="${max}" min="2" max="1000">
                        </div>
                        <div class="nb-settings-row">
                            <span>先手</span>
                            <select id="nb-first" class="nb-select">
                                <option value="random">随机</option>
                                <option value="player1">玩家1</option>
                                <option value="player2">玩家2</option>
                            </select>
                        </div>
                        <button class="btn btn-primary btn-lg" id="nb-start">开始游戏</button>
                    </div>
                ` : `
                    <div class="nb-waiting">等待房主开始游戏…</div>
                `}
            </div>
        `;

        if (roomCode) {
            const copyBtn = container.querySelector('#nb-copy-code');
            if (copyBtn) copyBtn.addEventListener('click', () => this._copyRoomCode(roomCode));
        }

        if (isHost) {
            container.querySelector('#nb-start').addEventListener('click', () => {
                const minVal = parseInt(container.querySelector('#nb-min').value) || 1;
                const maxVal = parseInt(container.querySelector('#nb-max').value) || 100;
                const first = container.querySelector('#nb-first').value;
                this.platform.emit('start', { min: minVal, max: maxVal, first }, 'player1');
            });
        }
    }

    _copyRoomCode(code) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(
                () => Toast && Toast.success('房间码已复制，发给对方即可加入'),
                () => Toast && Toast.show('请手动复制房间码：' + code, 'info')
            );
        } else {
            Toast && Toast.show('房间码：' + code, 'info');
        }
    }

    /* ---- 游戏棋盘 ---- */
    _renderGame(container) {
        const s = this._snapshot;
        const myTurn = this.platform.isMyTurn(s);
        const min = s.currentMin;
        const max = s.currentMax;

        let grid = '';
        for (let n = s.minNum; n <= s.maxNum; n++) {
            const disabled = n < min || n > max;
            const cls = disabled ? 'disabled' : 'enabled';
            grid += `<button class="nb-cell ${cls}" data-n="${n}"${disabled ? ' disabled' : ''}>${n}</button>`;
        }

        container.innerHTML = `
            <div class="nb-wrap">
                <div class="nb-range">当前范围：<b>${min} - ${max}</b></div>
                <div class="nb-turn-bar${myTurn ? ' my-turn' : ''}">
                    ${myTurn ? `${IconFactory.icon('target', 16)} 轮到你猜了！` : `${IconFactory.icon('moon', 16)} 等待 ${escapeHtml(s.currentPlayerName)} 猜测…`}
                </div>
                <div class="nb-grid">${grid}</div>
                <div class="nb-log">${this._renderLog()}</div>
            </div>
        `;

        container.querySelectorAll('.nb-cell:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                this.playSound('turn');
                this.platform.emit('guess', { number: parseInt(btn.dataset.n) }, s.currentPlayer);
            });
        });
    }

    _renderLog() {
        const guesses = (this._snapshot.guesses || []).slice(-4);
        if (guesses.length === 0) return '';
        return guesses.map(g =>
            `<div class="nb-log-item">${escapeHtml(g.name)} 猜 ${g.number}：${escapeHtml(g.message)}</div>`
        ).join('');
    }

    /* ---- 结果 ---- */
    _renderGameOver(container) {
        const s = this._snapshot;
        const isHost = this.platform.isHost();
        const winName = s.playerNames[s.winner] || '?';
        const loseName = s.playerNames[s.loser] || '?';
        const iWon = s.winner === this.platform.getMyRole();
        const surrendered = !!s.surrenderBy;
        const surrenderName = s.playerNames[s.surrenderBy] || '对方';
        const bombLine = surrendered ? '' : `<div class="nb-result-line">炸弹数字：<b>${s.bomb}</b></div>`;
        const resultLine = surrendered
            ? (iWon
                ? `${escapeHtml(surrenderName)} 认输，你获胜！`
                : `你已认输，${escapeHtml(winName)} 获胜`)
            : `${escapeHtml(loseName)} 踩中了炸弹，${escapeHtml(winName)} 获胜！`;

        container.innerHTML = `
            <div class="nb-wrap">
                <div class="nb-big-icon">${iWon ? IconFactory.icon('trophy', 56) : IconFactory.icon('zap', 56)}</div>
                <h2 class="nb-title">${iWon ? '你赢了！' : '游戏结束'}</h2>
                ${bombLine}
                <div class="nb-result-line">${resultLine}</div>
                ${isHost
                    ? '<button class="btn btn-primary btn-lg" id="nb-again">再来一局</button>'
                    : '<div class="nb-waiting">等待房主重开…</div>'}
            </div>
        `;

        if (isHost) {
            container.querySelector('#nb-again').addEventListener('click', () => {
                this.platform.emit('restart', {}, 'player1');
            });
        }
    }
}

GameRegistry.register('number_bomb', NumberBombGame);

/* ---- 内联样式 ---- */
(function injectStyles() {
    if (document.getElementById('nb-styles')) return;
    const style = document.createElement('style');
    style.id = 'nb-styles';
    style.textContent = `
        .nb-wrap { display: flex; flex-direction: column; gap: 16px; align-items: center; padding: 20px 0; }
        .nb-big-icon { font-size: 64px; }
        .nb-title { font-size: 28px; font-weight: 800; color: var(--primary); }
        .nb-players { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
        .nb-player { padding: 10px 18px; border-radius: var(--radius); font-size: 15px; background: var(--bg-card); border: 2px solid var(--border); }
        .nb-player.p1 { border-color: rgba(231,84,128,0.4); }
        .nb-player.p2 { border-color: rgba(33,150,243,0.4); }
        .nb-room-code { display: flex; align-items: center; gap: 12px; padding: 12px 20px; background: rgba(255,255,255,0.85); border: 2px dashed var(--primary); border-radius: var(--radius); }
        .nb-room-code span { font-size: 13px; color: var(--text-muted); }
        .nb-room-code b { font-size: 24px; letter-spacing: 4px; color: var(--primary); font-weight: 800; }
        .nb-waiting { font-size: 15px; color: var(--text-muted); }
        .nb-lobby-controls { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 340px; }
        .nb-settings-row { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--text-light); }
        .nb-num-input { width: 80px; padding: 8px 10px; border: 2px solid var(--border); border-radius: var(--radius); font-size: 15px; font-family: inherit; outline: none; text-align: center; }
        .nb-num-input:focus { border-color: var(--primary); }
        .nb-select { flex: 1; padding: 8px 10px; border: 2px solid var(--border); border-radius: var(--radius); font-size: 15px; font-family: inherit; outline: none; background: white; }
        .nb-range { font-size: 16px; color: var(--text); }
        .nb-range b { color: var(--primary); font-size: 20px; }
        .nb-turn-bar { position: sticky; top: 76px; z-index: 10; width: 100%; max-width: 640px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; background: var(--bg-card); border: 2px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); font-size: 16px; font-weight: 600; color: var(--text-light); min-height: 44px; }
        .nb-turn-bar.my-turn { color: var(--primary); border-color: rgba(231,84,128,0.4); background: rgba(231,84,128,0.06); font-weight: 700; }
        .nb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(52px, 1fr)); gap: 6px; width: 100%; max-width: 640px; }
        .nb-cell { padding: 12px 4px; border: 2px solid var(--border); border-radius: var(--radius); background: var(--bg-card); color: var(--text); font-size: 15px; font-weight: 600; cursor: pointer; transition: all var(--transition); font-family: inherit; min-height: 44px; }
        .nb-cell:hover { background: rgba(231,84,128,0.1); border-color: var(--primary); }
        .nb-cell.enabled { background: rgba(231,84,128,0.08); border-color: rgba(231,84,128,0.45); font-weight: 700; }
        .nb-cell.disabled { opacity: 0.25; cursor: not-allowed; background: rgba(0,0,0,0.03); color: var(--text-muted); border-color: transparent; }
        .nb-log { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--text-muted); min-height: 20px; }
        .nb-log-item { padding: 2px 0; }
        .nb-result-line { font-size: 16px; color: var(--text); }
        .nb-result-line b { color: var(--danger); font-size: 20px; }
    `;
    document.head.appendChild(style);
})();
