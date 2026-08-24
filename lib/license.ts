// 激活码工具函数
// 类型：E=天卡(1天), A=周卡(7天), B=月卡(30天), C=季卡(90天), D=年卡(365天), T=测试卡(5分钟)
// 格式：7位字母+数字大写（无横线）
// ============================================
// ⚠️ 重要配置：Cloudflare Workers API 地址
// ============================================
const API_BASE_URL = "https://api.ttla.top";

const TYPE_DAYS: Record<string, number> = {
  E: 1,
  A: 7,
  B: 30,
  C: 90,
  D: 365,
  T: 0, // 测试卡5分钟，单独处理
};

export const TYPE_NAMES: Record<number, string> = {
  0: "天卡",
  1: "周卡",
  2: "月卡",
  3: "季卡",
  4: "年卡",
  5: "测试卡",
};

// 类型数字到字母的映射
const TYPE_NUM_TO_CHAR: Record<number, string> = {
  0: "E",
  1: "A",
  2: "B",
  3: "C",
  4: "D",
  5: "T",
};

// 类型字母到数字的映射
const TYPE_CHAR_TO_NUM: Record<string, number> = {
  E: 0,
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  T: 5,
};

// 可用字符（去掉易混淆的I/O/0/1）
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// 获取或生成设备唯一ID（一人一码核心）
export function getDeviceId(): string {
  if (typeof window === "undefined") return "unknown";
  let deviceId = localStorage.getItem("lg_device_id");
  if (!deviceId) {
    // 生成基于浏览器特征的设备指纹
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let fingerprint = "";
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("fingerprint", 2, 2);
      fingerprint = canvas.toDataURL();
    }
    const raw = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      fingerprint,
      Math.random().toString(36).substring(2),
    ].join("|");
    deviceId = hashStr(raw).toString(36) + Date.now().toString(36);
    localStorage.setItem("lg_device_id", deviceId);
  }
  return deviceId;
}

function randomStr(len: number): string {
  let result = "";
  for (let i = 0; i < len; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

// 计算校验位（基于前6位）
function calcCheckChar(raw6: string): string {
  const hash = hashStr(raw6);
  return CHARS[hash % CHARS.length];
}

// 生成激活码（7位，无横线）
export function generateCode(type: number): string {
  const typeChar = TYPE_NUM_TO_CHAR[type] || "A";
  const random = randomStr(5);
  const raw6 = typeChar + random;
  const check = calcCheckChar(raw6);
  return raw6 + check;
}

// 解析激活码
export function parseCode(code: string): { type: number } | null {
  const clean = code.toUpperCase().trim().replace(/[^A-Z0-9]/g, "");
  if (clean.length !== 7) return null;
  const typeChar = clean[0];
  const type = TYPE_CHAR_TO_NUM[typeChar];
  if (!type) return null;
  const raw6 = clean.slice(0, 6);
  const check = clean[6];
  const expectedCheck = calcCheckChar(raw6);
  if (check !== expectedCheck) return null;
  return { type };
}

// 云端验证：检查码是否已使用
async function cloudCheck(code: string): Promise<{ used: boolean } | null> {
  if (!API_BASE_URL) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/check?code=${encodeURIComponent(code)}`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      return { used: !!data.used };
    }
    return null;
  } catch {
    return null;
  }
}

// 云端激活：标记码为已使用
async function cloudActivate(code: string): Promise<{ success: boolean; message: string; expireAt?: number } | null> {
  if (!API_BASE_URL) return null;
  try {
    const deviceId = getDeviceId();
    const res = await fetch(`${API_BASE_URL}/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, deviceId }),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: !!data.success, message: data.message || "", expireAt: data.expireAt };
    }
    return null;
  } catch {
    return null;
  }
}

// 验证激活码并激活
export function activateCode(code: string): Promise<{ success: boolean; message: string; type?: number; expireAt?: number }> {
  return (async () => {
    if (typeof window === "undefined") {
      return { success: false, message: "服务端环境" };
    }
    const parsed = parseCode(code);
    if (parsed === null) {
      return { success: false, message: "激活码格式不正确或已失效" };
    }
    const clean = code.toUpperCase().trim().replace(/[^A-Z0-9]/g, "");
    // ===== 云端验证（一人一码核心）=====
    const cloudResult = await cloudActivate(clean);
    if (cloudResult !== null) {
      if (!cloudResult.success) {
        // 云端返回失败（包括被封禁、已使用、已过期、设备不匹配），直接返回
        return { success: false, message: cloudResult.message || "激活码无效" };
      }
    } else {
      // 云端不可用，拒绝激活（确保一人一码，不允许离线激活）
      return { success: false, message: "网络异常，请检查网络后重试" };
    }
    // 保存激活信息到本地
    const now = Date.now();
    // 优先使用云端返回的expireAt（从第一次激活时间算），没有则本地计算
    let expireAt: number = cloudResult?.expireAt || 0;
    let durationText: string;
    if (!expireAt) {
      if (clean[0] === "T") {
        expireAt = now + 5 * 60 * 1000;
        durationText = "5分钟";
      } else {
        const days = TYPE_DAYS[clean[0]] || 7;
        expireAt = now + days * 24 * 60 * 60 * 1000;
        durationText = `${days}天`;
      }
    } else {
      const daysLeft = Math.ceil((expireAt - now) / (24 * 60 * 60 * 1000));
      durationText = daysLeft > 0 ? `${daysLeft}天` : "即将过期";
    }
    const activation = {
      code: clean,
      type: parsed.type,
      activatedAt: now,
      expireAt,
    };
    localStorage.setItem("lg_activation", JSON.stringify(activation));
    return {
      success: true,
      message: `激活成功！${TYPE_NAMES[parsed.type]}，剩余${durationText}`,
      type: parsed.type,
      expireAt,
    };
  })();
}

// 检查是否已激活且未过期
export function checkActivation(): { active: boolean; type?: number; expireAt?: number; daysLeft?: number; timeLeftText?: string; code?: string } {
  if (typeof window === "undefined") {
    return { active: false };
  }
  const data = localStorage.getItem("lg_activation");
  if (!data) return { active: false };
  try {
    const activation = JSON.parse(data);
    const now = Date.now();
    // 兼容两种字段名：expireAt 和 expiresAt
    const expireAt = activation.expireAt || activation.expiresAt;
    if (!expireAt || now > expireAt) {
      return { active: false };
    }
    const msLeft = expireAt - now;
    const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
    // 智能时间显示
    let timeLeftText: string;
    if (msLeft < 60 * 60 * 1000) {
      // 小于1小时，显示分钟
      const minutesLeft = Math.max(1, Math.ceil(msLeft / (60 * 1000)));
      timeLeftText = `${minutesLeft} 分钟`;
    } else if (msLeft < 24 * 60 * 60 * 1000) {
      // 小于1天，显示小时
      const hoursLeft = Math.ceil(msLeft / (60 * 60 * 1000));
      timeLeftText = `${hoursLeft} 小时`;
    } else {
      // 大于1天，显示天
      timeLeftText = `${daysLeft} 天`;
    }
    return {
      active: true,
      type: activation.type,
      expireAt: expireAt,
      daysLeft,
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
