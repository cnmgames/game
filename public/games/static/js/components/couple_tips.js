import EventBus from '../event_bus.js';
import { session } from '../session.js';

/* ==================== 情侣互动提示 ====================
 * 互动文案统一由配置文件 /static/data/couple_interactions.json 提供：
 *   - cooperative  ：合作型游戏结算，轻松温馨（拥抱、亲亲等）
 *   - competitive  ：对抗型游戏结算，分 6 档激进程度（普通→神话，权重递减），赢家奖励互动
 * 文案随机选取；配置文件加载失败时回退到内置通用文案。
 */

/* 通用/回退文案（配置加载失败或未就绪时使用） */
const COUPLE_TIPS_GENERAL = [
    '今天想和TA一起挑战什么？',
    '每一局游戏都是甜蜜的回忆~',
    '和你在一起，什么游戏都好玩~',
];

let _interactions = null;
let _loadPromise = null;

function loadInteractions() {
    if (_loadPromise) return _loadPromise;
    _loadPromise = fetch('/static/data/couple_interactions.json')
        .then(r => r.json())
        .then(data => { _interactions = data; return data; })
        .catch(() => { _interactions = null; return null; });
    return _loadPromise;
}

function pickRandom(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

/* 按权重随机选一个档位（普通→神话，权重递减：普通最常见、神话最稀有） */
function pickTier(cfg) {
    const tiers = cfg.competitive && cfg.competitive.tiers;
    if (!tiers || tiers.length === 0) return null;
    const total = tiers.reduce((s, t) => s + (t.weight || 1), 0);
    let r = Math.random() * total;
    for (const t of tiers) {
        r -= (t.weight || 1);
        if (r <= 0) return t;
    }
    return tiers[0];
}

function randomTip(category) {
    const cfg = _interactions;
    if (cfg) {
        // 结算同步：读当前房间设置（enable_interactions），双方基于同一房间设置抽取一致文本
        const enabled = !!(session.currentSessionState
            && session.currentSessionState.room_settings
            && session.currentSessionState.room_settings.enable_interactions);
        if (enabled) {
            if (category === 'coop_success') {
                const t = pickRandom(cfg.cooperative && cfg.cooperative.success);
                if (t) return t;
            } else if (category === 'coop_fail') {
                const t = pickRandom(cfg.cooperative && cfg.cooperative.fail);
                if (t) return t;
            } else if (category === 'win') {
                const tier = pickTier(cfg);
                if (tier) {
                    const t = pickRandom(tier.tips);
                    if (t) return `${tier.icon || '🎉'} ${t}`;
                }
            } else if (category === 'lose') {
                const t = pickRandom(cfg.competitive && cfg.competitive.lose);
                if (t) return t;
            }
        } else {
            const t = pickRandom(cfg.simple && cfg.simple[category]);
            if (t) return t;
        }
    }
    return pickRandom(COUPLE_TIPS_GENERAL) || '游戏结束啦~';
}

class CoupleTips {
    constructor() {
        this._overlay = document.getElementById('couple-tip-overlay');
        this._bindGlobal();
        loadInteractions();  // 预加载互动配置
    }

    _bindGlobal() {
        // 游戏内触发情侣提示
        EventBus.on('couple_tip:show', (category, text) => {
            this.showDialog(category, text);
        });
    }

    /* ---- 游戏结束弹窗 ---- */
    showDialog(category, customText = null, onClose = null) {
        const text = customText || randomTip(category);
        this._overlay.innerHTML = `
            <div class="couple-tip-panel">
                <div class="couple-tip-icon">❤</div>
                <div class="couple-tip-text">${text}</div>
                <button class="btn btn-primary" id="couple-tip-close">好的~</button>
            </div>
        `;
        this._overlay.style.display = 'flex';
        this._overlay.querySelector('#couple-tip-close').addEventListener('click', () => {
            this._overlay.style.display = 'none';
            if (onClose) onClose();
        });
    }

    hide() {
        this._overlay.style.display = 'none';
    }
}

export default new CoupleTips();
export { randomTip };
