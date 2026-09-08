const _API_HOST = ["k", "ttla", "top"];
export const API_BASE = "https://" + _API_HOST[0] + "." + _API_HOST[1] + "." + _API_HOST[2] + "/api.php?action=";

export function getDeviceId(): string {
  try {
    let dev = localStorage.getItem("device_id");
    if (!dev) {
      const s = screen, n = navigator;
      const r = [n.userAgent, n.language, s.width + "x" + s.height, s.colorDepth, new Date().getTimezoneOffset()].join("|");
      let h = 0;
      for (let i = 0; i < r.length; i++) { h = ((h << 5) - h + r.charCodeAt(i)) | 0; }
      dev = "dev_" + Math.abs(h).toString(36) + "_" + Math.random().toString(36).substr(2, 6);
      localStorage.setItem("device_id", dev);
    }
    return dev;
  } catch (e) { return "dev_unknown"; }
}

export function getUserToken(): string {
  try { return localStorage.getItem("user_token") || ""; } catch (e) { return ""; }
}

export function setUserToken(token: string) {
  try { localStorage.setItem("user_token", token); } catch (e) {}
}

export function clearUserToken() {
  try { localStorage.removeItem("user_token"); } catch (e) {}
}

// 检查用户状态（是否被禁用），返回 { banned, message }
export async function checkUserStatus(): Promise<{ banned: boolean; message: string }> {
  const token = getUserToken();
  if (!token) return { banned: false, message: "" };
  try {
    const res = await fetch(API_BASE + "user/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (data.banned) {
      clearUserToken();
      return { banned: true, message: data.message || "账号已被禁用，请联系客服" };
    }
    return { banned: false, message: "" };
  } catch (e) {
    return { banned: false, message: "" };
  }
}
