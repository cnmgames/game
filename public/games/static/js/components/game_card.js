/* ==================== 游戏卡片 ==================== */
import IconFactory from './icon_factory.js';

const GAME_CARD_COLORS = ['pink', 'blue', 'green', 'purple', 'orange', 'teal'];

const CATEGORY_NAMES = {
    'competitive': '竞技对抗',
    'cooperative': '合作闯关',
    'quiz': '趣味问答',
    'puzzle': '益智烧脑',
    'casual': '休闲放松',
};

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function createGameCard(game) {
    const colorIdx = hashString(game.id) % GAME_CARD_COLORS.length;
    const color = GAME_CARD_COLORS[colorIdx];
    const category = CATEGORY_NAMES[game.category_id] || game.category_id;

    return `
        <div class="game-card theme-${color}" data-game-id="${game.id}">
            <div class="card-icon" style="color: var(--primary); display:flex; justify-content:center; padding: 6px 0 2px;">
                ${IconFactory.gameIcon(game.id, 34)}
            </div>
            <div class="card-name">${game.name}</div>
            <div class="card-desc">${game.description}</div>
            <div class="card-meta">
                <span>${category}</span>
                <span class="card-tag">${game.difficulty}</span>
            </div>
        </div>
    `;
}

export { GAME_CARD_COLORS, CATEGORY_NAMES, hashString, createGameCard };