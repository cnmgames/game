// 激活码工具函数 - 安全版（Token 机制 + 服务端实时验证）
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

// 校验激活码格式（去掉横杠后必须是16位字母数字）
export function parseCode(code: string): { valid: boolean } | null {
  const clean = code.toUpperCase().trim().replace(/[^A-Z0-9]/g, "");
  if (clean.length !== 16) return null;
  return { valid: true };
}

function dateToTs(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  const t = new Date(dateStr.replace(" ", "T")).getTime();
  return isNaN(t) ? 0 : t;
}

// 云端激活（返回 Token）
async function cloudActivate(code: string): Promise<{ success: boolean; message: string; token?: string; type?: string; type_text?: string; expiry_at?: string | null } | null> {
  try {
    const deviceId = getDeviceId();
    const res = await fetch(API_BASE_URL + "activate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Device-Id": deviceId },
      body: JSON.stringify({ code, device_id: deviceId }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: !!data.success,
        message: data.message || "",
        token: data.token,
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

// 云端 Token 验证
async function cloudVerify(token: string): Promise<{ valid: boolean; message?: string; type?: string; expiry_at?: string | null } | null> {
  try {
    const deviceId = getDeviceId();
    const res = await fetch(API_BASE_URL + "verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Token": token, "X-Device-Id": deviceId },
      body: JSON.stringify({ token, device_id: deviceId }),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        valid: !!data.valid,
        message: data.message,
        type: data.type,
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
      return { success: false, message: "激活码格式不正确，请输入16位激活码（如 ABCD-EFGH-IJKL-MNOP）" };
    }
    const clean = code.toUpperCase().trim().replace(/[^A-Z0-9]/g, "");

    const cloudResult = await cloudActivate(clean);
    if (cloudResult === null) {
      return { success: false, message: "网络异常，请检查网络后重试" };
    }
    if (!cloudResult.success) {
      return { success: false, message: cloudResult.message || "激活码无效" };
    }
    if (!cloudResult.token) {
      return { success: false, message: "激活失败，请重试" };
    }

    // 保存 Token 和激活信息
    const now = Date.now();
    const type = cloudResult.type || "forever";
    const expireAt = dateToTs(cloudResult.expiry_at);
    const typeText = cloudResult.type_text || TYPE_NAMES[type] || "永久卡";

    const activation = {
      token: cloudResult.token,
      code: clean,
      type,
      activatedAt: now,
      expireAt,
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

// 检查是否已激活（每次调用都去服务端验证 Token）
export function checkActivation(): Promise<{ active: boolean; type?: string; expireAt?: number; timeLeftText?: string; code?: string; message?: string }> {
  return (async () => {
    if (typeof window === "undefined") {
      return { active: false };
    }
    const data = localStorage.getItem("lg_activation");
    if (!data) return { active: false };
    try {
      const activation = JSON.parse(data);
      if (!activation.token) {
        localStorage.removeItem("lg_activation");
        return { active: false };
      }
      // 服务端验证 Token
      const result = await cloudVerify(activation.token);
      if (result === null) {
        // 网络异常：用本地缓存兜底（但标记为待验证）
        const now = Date.now();
        const expireAt = activation.expireAt || 0;
        if (expireAt > 0 && now > expireAt) {
          return { active: false };
        }
        return {
          active: true,
          type: activation.type,
          expireAt,
          timeLeftText: expireAt === 0 ? "永久有效" : "验证中...",
          code: activation.code,
        };
      }
      if (!result.valid) {
        // Token 无效，清除本地缓存
        localStorage.removeItem("lg_activation");
        return { active: false, message: result.message };
      }
      // 验证通过，更新本地信息
      const expireAt = dateToTs(result.expiry_at);
      activation.type = result.type || activation.type;
      activation.expireAt = expireAt;
      localStorage.setItem("lg_activation", JSON.stringify(activation));

      let timeLeftText: string;
      if (expireAt === 0) {
        timeLeftText = "永久有效";
      } else {
        const msLeft = expireAt - Date.now();
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
        expireAt,
        timeLeftText,
        code: activation.code,
      };
    } catch {
      return { active: false };
    }
  })();
}

// 同步检查（仅用于 UI 快速判断，不保证准确）
export function checkActivationSync(): { active: boolean; type?: string; expireAt?: number; code?: string } {
  if (typeof window === "undefined") return { active: false };
  const data = localStorage.getItem("lg_activation");
  if (!data) return { active: false };
  try {
    const activation = JSON.parse(data);
    const now = Date.now();
    const expireAt = activation.expireAt || 0;
    if (expireAt > 0 && now > expireAt) {
      return { active: false };
    }
    return { active: !!activation.token, type: activation.type, expireAt, code: activation.code };
  } catch {
    return { active: false };
  }
}

export function clearActivation() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("lg_activation");
}
