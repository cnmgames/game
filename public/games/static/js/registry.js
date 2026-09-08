/* ==================== 游戏注册表 ====================
 * 统一管理游戏 id → 游戏类的映射，替代 app.js 中硬编码的注册数组。
 *
 * 游戏 JS 文件在末尾调用 `GameRegistry.register(id, GameClass)` 自注册，
 * 前端无需再手动维护注册表或 <script> 标签：新增游戏只需
 *   1) games/{id}/manifest.json
 *   2) web_app/static/js/games/{id}.js（末尾自注册）
 *
 * 游戏模块按需动态加载（ensure 走 import()），并支持批量预加载（loadAll）。
 */
const GameRegistry = {
    _registry: {},   // id -> GameClass
    _loading: {},    // id -> Promise

    register(id, cls) {
        this._registry[id] = cls;
        return cls;
    },

    get(id) {
        return this._registry[id] || null;
    },

    has(id) {
        return id in this._registry;
    },

    all() {
        return { ...this._registry };
    },

    /* 动态加载某个游戏的模块（若未加载），返回 Promise<GameClass|null> */
    loadScript(id) {
        if (this._loading[id]) return this._loading[id];
        this._loading[id] = import(`/static/js/games/${id}.js`)
            .then(() => this._registry[id] || null)
            .catch((e) => {
                console.error(`[GameRegistry] 加载游戏失败: ${id}`, e);
                return null;
            })
            .finally(() => { delete this._loading[id]; });
        return this._loading[id];
    },

    /* 确保某游戏已加载，返回 GameClass|null */
    async ensure(id) {
        if (this._registry[id]) return this._registry[id];
        const cls = await this.loadScript(id);
        return cls || null;
    },

    /* 批量预加载（并行），返回 Promise */
    async loadAll(ids) {
        return Promise.all(ids.map((id) => this.ensure(id)));
    },
};

export default GameRegistry;
