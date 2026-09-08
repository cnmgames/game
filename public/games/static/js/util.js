/* ==================== 通用工具 ==================== */

/* HTML 转义：所有插入 innerHTML 的用户可控字符串（昵称、绑定对象名等）必须先经此转义，
 * 防止存储型 XSS。服务端注册时也会做白名单校验，此处为前端兜底。 */
function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export { escapeHtml };

/* 玩家名清洗：去除 HTML 元字符与控制字符（与服务端用户名白名单一致）。
 * 玩家名（本地模式）由用户在身份页/设置页自由输入，会在多处 innerHTML 渲染，
 * 并随分数数据持久化，故在输入源头即清洗。 */
function sanitizeName(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[<>&"'\x00-\x1f\x7f]/g, '').trim();
}

export { sanitizeName };
