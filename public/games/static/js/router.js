import EventBus from './event_bus.js';

/* ==================== 路由管理 ==================== */
class Router {
    constructor() {
        this._currentPage = 'room';
        this._currentGame = null;
        this._pages = {
            auth: document.getElementById('page-auth'),
            room: document.getElementById('page-room'),
            admin: document.getElementById('page-admin'),
            settings: document.getElementById('page-settings'),
            game: document.getElementById('page-game'),
        };
        this._gameTitle = document.getElementById('game-title');
        this._gameContent = document.getElementById('game-content');
        this._onBack = null;

        document.getElementById('btn-game-back').addEventListener('click', () => this.goBack());
    }

    get currentPage() { return this._currentPage; }
    get currentGame() { return this._currentGame; }

    setOnBack(callback) {
        this._onBack = callback;
    }

    _showOnly(name) {
        for (const [key, el] of Object.entries(this._pages)) {
            if (!el) continue;
            if (key === name) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
        this._currentPage = name;
    }

    goToAuth() {
        this._showOnly('auth');
        EventBus.emit('page:auth');
    }

    goToRoom() {
        // 纯联机：返回房间即离开当前游戏上下文
        this._currentGame = null;
        this._showOnly('room');
        EventBus.emit('page:room');
    }

    goToAdmin() {
        this._showOnly('admin');
        EventBus.emit('page:admin');
    }




    goToSettings() {
        this._showOnly('settings');
        EventBus.emit('page:settings');
    }

    goToGame(gameId, gameName) {
        this._currentGame = gameId;
        this._gameTitle.textContent = gameName;
        this._showOnly('game');
        EventBus.emit('page:game', gameId);
    }

    goBack() {
        if (this._onBack) {
            this._onBack();
        } else {
            this.goToRoom();
        }
    }

    getGameContent() {
        return this._gameContent;
    }

    setGameContent(html) {
        this._gameContent.innerHTML = html;
    }

    appendGameContent(html) {
        this._gameContent.innerHTML += html;
    }
}

export default new Router();
