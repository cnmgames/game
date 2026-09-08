import GameBase from '../game_base.js';
import Toast from '../components/toast.js';
import { playerBadge } from '../components/game_ui.js';
import GameRegistry from '../registry.js';
import { ensureSession } from '../platform.js';
import { bindSessionEvents } from '../session.js';
import IconFactory from '../components/icon_factory.js';

/* ==================== 默契翻牌 - 视图 ====================
 * 服务端权威（MemoryMatchRoom）：洗牌/配对判定/连击/胜负全部由服务端判定，
 * 前端只负责渲染卡片 + 点击翻牌。
 * - 两人轮流翻：翻开 2 张相同 → 配对保留并连击；不同 → 翻回换人
 * - 全部配对 → 合作双赢；翻错达 12 次 → 合作失败
 */
const PAIR_EMOJI = ['💖', '🌙', '⭐', '🌹', '🍰', '🐱', '🎵', '🎁'];

class MemoryMatchGame extends GameBase {
    constructor(manifest) {
        super(manifest);
        this._snapshot = null;
        this._online = false;
        this._sessionId = null;
        this._myRole = null;
        this._offSocketHandlers = [];
        this._busy = false;          // 判定中禁止连点（防状态未广播时重复翻卡）
    }

    async onStart() {
        await ensureSession('memory_match', 'online');
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
                this._busy = false;
                this._render();
            },
            onEvent: (evt) => {
                if (this.handleInteractionEvent(evt)) return;   // 公共处理 interaction_drawn
                if (this.handleRestartEvent(evt)) return;       // 重开协商(暂停菜单)
                if (evt.event === 'game_over') {
                    this._snapshot = evt;
                    this._busy = false;
                    this._handleGameOver(evt);
                    this._render();
                }
            },
            onError: (data) => {
                this._busy = false;   // 操作失败也解除防连点锁，避免卡死
                Toast && Toast.error((data && data.message) || '操作失败');
            },
        }));
    }

    _handleGameOver(evt) {
        // 认输/中断：合作未完成
        if (evt.surrender_by) {
            const names = this._playerNames(evt);
            const name = names[evt.surrender_by] || '对方';
            Toast && Toast.show(`${name} 离开了，本局作罢`, 'info');
            return;
        }
        if (evt.winner === 'tie') {
            // 合作双赢：两人都赢
            this.playSound('win');
            Toast && Toast.show('翻出全部配对，合作共赢！', 'success');
            // 房主发起合作成功互动抽取（双方通过 interaction_drawn 同步显示）
            if (this._online && this._myRole === 'player1') this.requestInteraction();
            return;
        }
        // 错次达上限：合作失败（无胜者）
        this.playSound('lose');
        Toast && Toast.show('翻错次数达到上限，挑战失败…', 'error');
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
            <div class="mm-wrap">
                <div class="mm-title">${IconFactory.icon('heart', 26)} 默契翻牌</div>
                <div class="mm-players">
                    ${playerBadge(`💖 玩家1：${names.player1}`, { side: 'p1' })}
                    ${playerBadge(guestJoined ? `💖 玩家2：${names.player2}` : '💖 玩家2：等待加入…', { side: 'p2' })}
                </div>
                <p class="mm-desc">4×4 翻牌找配对 · 翻对连击 · 12 次翻错前找齐 8 对</p>
                ${isHost
                    ? '<button class="btn btn-primary btn-lg" id="mm-start">开始游戏</button>'
                    : '<div class="mm-waiting">等待房主开始游戏…</div>'}
            </div>
        `;
        if (isHost) {
            container.querySelector('#mm-start').addEventListener('click', () => this._emit('start', {}));
        }
    }

    _renderBoard(container) {
        const s = this._snapshot;
        const myTurn = s.current_player === this._myRole;
        const names = this._playerNames(s);
        const remain = (s.size || 16) - (s.matched || []).filter(Boolean).length;
        const misses = s.miss_count || 0;
        const missLimit = s.miss_limit || 12;
        const revealing = !!s.revealing;   // 翻错展示期：两张亮着，禁翻新卡
        const turnText = revealing
            ? `${IconFactory.icon('eye', 16)} 记住这两张的位置~`
            : (myTurn
                ? `${IconFactory.icon('target', 16)} 轮到你翻牌`
                : `${IconFactory.icon('moon', 16)} 等待对方翻牌…`);

        container.innerHTML = `
            <div class="mm-wrap">
                <div class="mm-header">
                    <div class="mm-turn${myTurn ? ' my-turn' : ''}">${turnText}</div>
                    <div class="mm-misses">剩余配对 ${remain} 对 · 翻错 ${misses}/${missLimit}</div>
                </div>
                <div class="mm-players small">
                    ${playerBadge(`💖 ${names.player1}${s.current_player === 'player1' ? ' ⏳' : ''}`, { side: 'p1', active: s.current_player === 'player1' })}
                    ${playerBadge(`💖 ${names.player2}${s.current_player === 'player2' ? ' ⏳' : ''}`, { side: 'p2', active: s.current_player === 'player2' })}
                </div>
                <div class="mm-board${revealing ? ' revealing' : ''}" id="mm-board">${this._boardHtml(s)}</div>
                <div class="mm-hint">${revealing ? '看清楚后马上自动翻回~' : '点击翻开卡片 · 记住对方翻过的位置一起配对'}</div>
            </div>
        `;

        const board = container.querySelector('#mm-board');
        if (board) {
            board.querySelectorAll('.mm-card').forEach(card => {
                card.addEventListener('click', () => this._onFlip(card));
            });
        }
    }

    _boardHtml(s) {
        const view = s.view || [];      // 翻开卡的图案 id（未翻开为 null，防作弊）
        const matched = s.matched || [];
        const faceUp = s.face_up || [];
        let html = '';
        for (let i = 0; i < view.length; i++) {
            let content = '';
            let cls = 'mm-card';
            const isMatched = matched[i];
            const isUp = isMatched || faceUp[i];
            if (isUp) {
                // 已配对的永久翻开；未配对但 face_up 的是展示中(翻错待翻回)或待配对的当前张
                cls += isMatched ? ' open matched' : ' open reveal';
                content = PAIR_EMOJI[(view[i] ?? 0) % PAIR_EMOJI.length] || '💖';
            } else {
                cls += ' closed';
                content = '';
            }
            html += `<div class="${cls}" data-index="${i}">${content}</div>`;
        }
        return html;
    }

    _renderGameOver(container) {
        const s = this._snapshot;
        const isHost = this._myRole === 'player1';
        const misses = s.miss_count || 0;

        let title, resultLine;
        if (s.winner === 'tie') {
            title = `${IconFactory.icon('handshake', 24)} 合作共赢！`;
            resultLine = `翻错 ${misses} 次就找齐了全部 ${s.pair_count || 8} 对，默契满分！`;
        } else if (s.surrender_by) {
            title = '游戏结束';
            resultLine = '有人离开了房间，这局没有完成~';
        } else {
            title = `${IconFactory.icon('x', 24)} 挑战失败`;
            resultLine = `翻错了 ${misses} 次，没能找齐配对…再试一次吧！`;
        }

        container.innerHTML = `
            <div class="mm-wrap">
                <div class="mm-title">${title}</div>
                <div class="mm-result-line">${resultLine}</div>
                <div class="mm-board" id="mm-board-final">${this._boardHtml(s)}</div>
                ${isHost
                    ? '<button class="btn btn-primary btn-lg" id="mm-again">再来一局</button>'
                    : '<div class="mm-waiting">等待房主重开…</div>'}
            </div>
        `;
        if (isHost) {
            container.querySelector('#mm-again').addEventListener('click', () => this._emit('restart', {}));
        }
    }

    /* ---------- 交互 ---------- */
    _onFlip(card) {
        if (this._busy) return;
        if (!this._snapshot || this._snapshot.game_over) return;
        if (!this._snapshot.started) return;
        // 展示期禁翻新卡（等自动翻回后再继续）
        if (this._snapshot.revealing) {
            Toast && Toast.show('先记住翻错的两张~', 'info');
            return;
        }
        if (this._snapshot.current_player !== this._myRole) {
            Toast && Toast.show('还没轮到你~', 'info');
            return;
        }
        const i = parseInt(card.dataset.index, 10);
        // 已翻开/已配对的卡不可再点
        if (this._snapshot.face_up[i] || this._snapshot.matched[i]) return;
        this.playSound('turn');
        this._busy = true;
        this._emit('flip', { index: i });
    }
}

GameRegistry.register('memory_match', MemoryMatchGame);

/* ---- 内联样式 ---- */
(function injectStyles() {
    if (document.getElementById('mm-styles')) return;
    const style = document.createElement('style');
    style.id = 'mm-styles';
    style.textContent = `
        .mm-wrap { display: flex; flex-direction: column; gap: 14px; align-items: center; padding: 16px 0; }
        .mm-title { font-size: 26px; font-weight: 800; color: var(--primary); }
        .mm-desc { font-size: 13px; color: var(--text-muted); text-align: center; }
        .mm-players { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
        .mm-players.small { font-size: 13px; }
        .mm-waiting { font-size: 15px; color: var(--text-muted); }
        .mm-header { display: flex; align-items: center; gap: 18px; justify-content: center; flex-wrap: wrap; }
        .mm-turn { font-size: 16px; color: var(--text-light); min-height: 24px; }
        .mm-turn.my-turn { color: var(--primary); font-weight: 700; }
        .mm-misses { font-size: 14px; color: var(--text-muted); font-weight: 600; }
        .mm-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; width: min(92vw, 360px); aspect-ratio: 1; touch-action: manipulation; user-select: none; -webkit-user-select: none; }
        .mm-card { display: flex; align-items: center; justify-content: center; border-radius: 12px; font-size: 34px; cursor: pointer; aspect-ratio: 1; background: linear-gradient(135deg, rgba(231,84,128,0.16), rgba(231,84,128,0.06)); border: 1px solid rgba(231,84,128,0.28); transition: transform .12s ease, box-shadow .12s ease; }
        .mm-card.closed { color: transparent; }
        .mm-card.closed::after { content: '?'; font-size: 22px; color: rgba(231,84,128,0.55); font-weight: 800; }
        .mm-card.closed:hover { background: rgba(231,84,128,0.28); transform: translateY(-1px); box-shadow: 0 3px 10px rgba(231,84,128,0.18); }
        /* 未配对但翻开的卡（配对确认中的当前张）：常规白底 */
        .mm-card.open { background: #fff; border-color: rgba(231,84,128,0.35); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        /* 配对成功的卡：白底 + 玫红粗实边 + 对勾角标，一眼可辨「已完成」 */
        .mm-card.matched { background: #fff; border: 3px solid var(--primary); box-shadow: 0 2px 10px rgba(231,84,128,0.22); cursor: default; }
        .mm-card.matched::after { content: '✓'; position: absolute; top: 2px; right: 5px; font-size: 12px; font-weight: 900; color: #fff; background: var(--primary); border-radius: 50%; width: 16px; height: 16px; line-height: 16px; text-align: center; }
        .mm-card { position: relative; }
        /* 翻错展示期：整板禁点，仅两张翻错的卡高亮闪烁（淡红底区分白底的已配对卡） */
        .mm-board.revealing .mm-card { pointer-events: none; }
        .mm-board.revealing .mm-card.reveal { background: #fff5f5; border: 2px solid rgba(239,68,68,0.7); animation: mm-pulse .55s ease-in-out 3; }
        @keyframes mm-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.55); } 50% { box-shadow: 0 0 0 7px rgba(239,68,68,0.22); } }
        .mm-hint { font-size: 12px; color: var(--text-muted); }
        .mm-result-line { font-size: 16px; color: var(--text); text-align: center; }
    `;
    document.head.appendChild(style);
})();
