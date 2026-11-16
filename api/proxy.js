// 同域 API 代理：浏览器只访问 love.ttla.top，由 Vercel 服务端转发到 PHP 后台
// 这样可绕过终端网络/设备对 k.ttla.top 的连接拦截，同时消除跨域
const UPSTREAM = "https://k.ttla.top/api.php?action=";

const ALLOWED = new Set([
  "health", "stats", "check", "ip-check", "activate", "generate", "track",
]);

function allowed(action) {
  if (ALLOWED.has(action)) return true;
  return /^(user|ticket|online|codes|visit)\//.test(action);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).end();
    return;
  }

  const raw = req.query.action;
  const action = Array.isArray(raw) ? raw[0] : raw || "";
  if (!action) {
    res.status(400).json({ success: false, message: "缺少 action" });
    return;
  }
  if (!allowed(action)) {
    res.status(400).json({ success: false, message: "不支持的 action" });
    return;
  }

  let body;
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (typeof req.body === "string") body = req.body;
    else if (Buffer.isBuffer(req.body)) body = req.body;
    else body = JSON.stringify(req.body || {});
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const r = await fetch(UPSTREAM + action, {
      method: req.method === "HEAD" ? "GET" : req.method,
      headers: {
        "Content-Type": "text/plain",
        "User-Agent": "lovegame-proxy/1.0",
        "Origin": "https://love.ttla.top",
        "Referer": "https://love.ttla.top/",
      },
      body,
      signal: controller.signal,
      redirect: "follow",
    });
    const text = await r.text();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(r.status).send(text);
  } catch (e) {
    res.status(502).json({ success: false, message: "上游不可达", detail: String(e && e.message || e) });
  } finally {
    clearTimeout(timer);
  }
};
