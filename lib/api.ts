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
