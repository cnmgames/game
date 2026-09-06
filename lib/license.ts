// 激活码工具函数
// 新格式：LOVE-RTXD-JDE5-GHHJ（16位字母数字 + 3个横杠，共19字符）
// 类型由服务端返回：week=周卡, forever=永久卡
// ============================================
// API 地址（域名混淆拼接，不在代码中出现完整域名）
// ============================================
const _API_HOST = ["k", "ttla", "top"];
const API_BASE_URL = "https://" + _API_HOST[0] + "." + _API_HOST[1] + "." + _API_HOST[2] + "/api.php?action=";

export const TYPE_NAMES: Record<string, string> = {
  week: "周卡",
  forever: "永久卡",
};

function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// 获取或生成设备唯一ID
export function getDeviceId(): string {
  if (typeof window === "undefined") return "unknown";
  const nav = navigator as any;
  let canvasFp = "";
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.fillText("fingerprint_ios_safe", 2, 2);
      canvasFp = canvas.toDataURL();
    }
  } catch (e) {}
  const raw = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    screen.pixelDepth,
    new Date().getTimezoneOffset(),
    nav.hardwareConcurrency || 0,
    nav.deviceMemory || 0,
    canvasFp.substring(0, 100),
  ].join("|");
  return "dev_" + hashStr(raw).toString(36);
}

export function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "unknown";
  const nav = navigator as any;
  let canvasFp = "";
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.fillText("fp_migrate", 2, 2);
      canvasFp = canvas.toDataURL();
    }
  } catch (e) {}
  const raw = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    nav.hardwareConcurrency || 0,
    canvasFp.substring(0, 80),
  ].join("|");
  return "fp_" + hashStr(raw).toString(36);
}

// 校验激活码格式（去掉横杠后必须是16位字母数字）
export function parseCode(code: string): { valid: boolean } | null {
  const clean = code.toUpperCase().trim().replace(/[^A-Z0-9]/g, "");
  if (clean.length !== 16) return null;
  return { valid: true };
}

// 日期字符串转时间戳
function dateToTs(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  const t = new Date(dateStr.replace(" ", "T")).getTime();
  return isNaN(t) ? 0 : t;
}

// 云端验证：检查码状态
async function cloudCheck(code: string): Promise<{ exists: boolean; used: boolean; status: string; type: string; expired: boolean; expiry_at: string | null } | null> {
  try {
    const res = await fetch(API_BASE_URL + "check&code=" + encodeURIComponent(code), {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        exists: !!data.exists,
        used: !!data.used,
        status: data.status || "unknown",
        type: data.type || "forever",
        expired: !!data.expired,
        expiry_at: data.expiry_at || null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// 云端激活
async function cloudActivate(code: string): Promise<{ success: boolean; message: string; type?: string; type_text?: string; expiry_at?: string | null } | null> {
  try {
    const deviceId = getDeviceId();
    const res = await fetch(API_BASE_URL + "activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, device_id: deviceId }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: !!data.success,
        message: data.message || "",
        type: data.type,
        type_text: data.type_text,
        expiry_at: data.expiry_at,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// 验证激活码并激活
export function activateCode(code: string): Promise<{ success: boolean; message: string; type?: string; expireAt?: number }> {
  return (async () => {
    if (typeof window === "undefined") {
      return { success: false, message: "服务端环境" };
    }
    const parsed = parseCode(code);
    if (parsed === null) {
      return { success: false, message: "激活码格式不正确，请输入 LOVE-XXXX-XXXX-XXXX 格式" };
    }
    const clean = code.toUpperCase().trim().replace(/[^A-Z0-9]/g, "");

    // 云端激活
    const cloudResult = await cloudActivate(clean);
    if (cloudResult === null) {
      return { success: false, message: "网络异常，请检查网络后重试" };
    }
    if (!cloudResult.success) {
      return { success: false, message: cloudResult.message || "激活码无效" };
    }

    // 保存激活信息到本地
    const now = Date.now();
    const type = cloudResult.type || "forever";
    const expireAt = dateToTs(cloudResult.expiry_at); // 永久卡为0
    const typeText = cloudResult.type_text || TYPE_NAMES[type] || "永久卡";

    const activation = {
      code: clean,
      type,
      activatedAt: now,
      expireAt, // 0=永久有效
    };
    localStorage.setItem("lg_activation", JSON.stringify(activation));

    const durationText = expireAt > 0
      ? "到期时间：" + new Date(expireAt).toLocaleDateString("zh-CN")
      : "永久有效";

    return {
      success: true,
      message: `激活成功！${typeText}，${durationText}`,
      type,
      expireAt,
    };
  })();
}

// 检查是否已激活且未过期
export function checkActivation(): { active: boolean; type?: string; expireAt?: number; timeLeftText?: string; code?: string } {
  if (typeof window === "undefined") {
    return { active: false };
  }
  const data = localStorage.getItem("lg_activation");
  if (!data) return { active: false };
  try {
    const activation = JSON.parse(data);
    const now = Date.now();
    const expireAt = activation.expireAt || activation.expiresAt || 0;
    // expireAt=0 表示永久有效
    if (expireAt > 0 && now > expireAt) {
      return { active: false };
    }
    let timeLeftText: string;
    if (expireAt === 0) {
      timeLeftText = "永久有效";
    } else {
      const msLeft = expireAt - now;
      const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
      if (msLeft < 60 * 60 * 1000) {
        const minutesLeft = Math.max(1, Math.ceil(msLeft / (60 * 1000)));
        timeLeftText = `${minutesLeft}分钟`;
      } else if (msLeft < 24 * 60 * 60 * 1000) {
        const hoursLeft = Math.ceil(msLeft / (60 * 60 * 1000));
        timeLeftText = `${hoursLeft}小时`;
      } else {
        timeLeftText = `${daysLeft}天`;
      }
    }
    return {
      active: true,
      type: activation.type,
      expireAt: expireAt,
      timeLeftText,
      code: activation.code,
    };
  } catch {
    return { active: false };
  }
}

export function clearActivation() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("lg_activation");
}
