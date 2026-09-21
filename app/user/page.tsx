"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "../../components/Icon";

const _API_HOST = ["k", "ttla", "top"];
const API_BASE = "https://" + _API_HOST[0] + "." + _API_HOST[1] + "." + _API_HOST[2] + "/api.php?action=";

function getDeviceId(): string {
  try { return localStorage.getItem("device_id") || "dev_unknown"; } catch (e) { return "dev_unknown"; }
}

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [codeInfo, setCodeInfo] = useState<any>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [showPartner, setShowPartner] = useState(false);
  const [showMiniProgramModal, setShowMiniProgramModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);
  const [adRewardCode, setAdRewardCode] = useState("");
  const [adLoading, setAdLoading] = useState(false);
  const [adTodayClaimed, setAdTodayClaimed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (!token) { router.push("/login"); return; }
    fetch(API_BASE + "user/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setCodeInfo(data.code_info);
          setAdTodayClaimed(data.ad_today_claimed || false);
        } else {
          localStorage.removeItem("user_token");
          router.push("/login");
        }
      })
      .catch(() => setMessage("网络错误"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleActivate = () => {
    const token = localStorage.getItem("user_token");
    if (!token) return;
    if (!code.trim()) { setMessage("请输入激活码"); return; }
    setActivating(true);
    setMessage("");
    fetch(API_BASE + "user/bind", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, code: code.trim(), device_id: getDeviceId() }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("game_token", data.token);
          setMessage("激活成功！");
          setTimeout(() => window.location.reload(), 1000);
        } else {
          setMessage(data.message || "激活失败");
        }
      })
      .catch(() => setMessage("网络错误"))
      .finally(() => setActivating(false));
  };

  const handleLogout = () => {
    const token = localStorage.getItem("user_token");
    if (token) {
      fetch(API_BASE + "user/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).catch(() => {});
    }
    localStorage.removeItem("user_token");
    localStorage.removeItem("game_token");
    router.push("/");
  };

  // 违禁词列表（骂人、敏感、无意义内容）
  const forbiddenWords = [
    "傻逼", "sb", "SB", "煞笔", "草泥马", "操你妈", "操", "艹", "尼玛", "你妈",
    "去死", "垃圾", "废物", "脑残", "智障", "白痴", "弱智", "混蛋", "王八蛋",
    "狗东西", "贱人", "婊子", "鸡巴", "屌", "逼", "他妈的", "tmd", "TMD",
    "nmsl", "NMSL", "fuck", "shit", "bitch", "asshole",
    "111", "222", "333", "444", "555", "666", "777", "888", "999", "000",
    "aaa", "bbb", "ccc", "ddd", "eee", "fff", "ggg", "hhh", "iii", "jjj",
    "测试", "test", "TEST", "Test", "asdf", "asdfgh", "qwer", "qwerty",
  ];

  const handleFeedback = async () => {
    const text = feedbackText.trim();
    if (!text) { setFeedbackMsg("请输入反馈内容"); return; }
    if (text.length < 10) { setFeedbackMsg("请至少输入10个字，详细描述你的建议或问题"); return; }
    // 违禁词检测
    const lowerText = text.toLowerCase();
    for (const word of forbiddenWords) {
      if (lowerText.includes(word.toLowerCase())) {
        setFeedbackMsg("内容包含不当用语，请文明发言");
        return;
      }
    }
    // 检测是否全是重复字符或无意义内容
    if (/^(.)\1+$/.test(text.replace(/[\s，。！？、]/g, ""))) {
      setFeedbackMsg("请输入有意义的内容，不要重复填写");
      return;
    }
    setFeedbackSending(true);
    setFeedbackMsg("");
    const typeMap: Record<string, string> = {
      suggestion: "玩法建议",
      bug: "问题反馈",
      content: "内容调整",
      other: "其他建议",
    };
    try {
      const res = await fetch(API_BASE + "ticket/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `[${typeMap[feedbackType] || "建议反馈"}] ${text.slice(0, 30)}`,
          content: text,
          contact: user?.email || "",
          type: feedbackType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg("提交成功，感谢你的建议！");
        setFeedbackText("");
        setFeedbackType("suggestion");
        setTimeout(() => setShowFeedback(false), 1500);
      } else {
        setFeedbackMsg(data.message || "提交失败");
      }
    } catch {
      setFeedbackMsg("网络错误，请重试");
    } finally {
      setFeedbackSending(false);
    }
  };

  const copyWechat = () => {
    navigator.clipboard.writeText("nbioss").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const saveQRCode = () => {
    const link = document.createElement("a");
    link.href = "/images/miniprogram-qrcode.jpg";
    link.download = "小程序码.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("二维码已保存，请打开微信扫码进入小程序");
  };

  // 看广告领激活码
  const handleWatchAd = () => {
    setShowAdModal(true);
    setAdCountdown(30);
    setAdRewardCode("");
    setAdLoading(false);
  };

  useEffect(() => {
    if (!showAdModal || adCountdown <= 0 || adRewardCode) return;
    const timer = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // 倒计时结束，领取激活码
          claimAdReward();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showAdModal, adCountdown, adRewardCode]);

  const claimAdReward = async () => {
    setAdLoading(true);
    const token = localStorage.getItem("user_token");
    try {
      const res = await fetch(API_BASE + "user/ad_reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) {
        setAdRewardCode(data.code);
        setAdTodayClaimed(true);
      } else {
        alert(data.message || "领取失败");
        setShowAdModal(false);
      }
    } catch {
      alert("网络错误，请重试");
      setShowAdModal(false);
    } finally {
      setAdLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="bg-aurora" />
        <div className="relative z-10 flex min-h-screen items-center justify-center text-white/60">加载中...</div>
      </>
    );
  }

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-2xl px-4 py-6 sm:py-10">
        <Link href="/" style={{display:"inline-flex",alignItems:"center",padding:"6px 14px",borderRadius:"9999px",border:"1px solid rgba(255,255,255,0.2)",background:"rgba(0,0,0,0.6)",color:"rgba(255,255,255,0.85)",fontSize:"13px",textDecoration:"none",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",fontWeight:500,whiteSpace:"nowrap",lineHeight:1.5,marginBottom:"24px"}}>
          返回首页
        </Link>

        {/* 用户信息卡片 */}
        <div className="game-container mb-6 fade-in-up">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)", boxShadow: "0 4px 20px rgba(255,55,95,0.3)" }}>
              <Icon name="user" size={32} color="#fff" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="truncate text-xl font-bold text-white">{user?.email?.split("@")[0]}</h2>
              <p className="truncate text-sm text-white/50">{user?.email}</p>
            </div>
            {user?.email_verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
                <Icon name="check" size={12} /> 已验证
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
                <Icon name="alert" size={12} /> 未验证
              </span>
            )}
          </div>
        </div>

        {/* 激活状态卡片 */}
        <div className="game-container mb-6 fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-pink-200">
            <Icon name="ticket" size={16} /> 激活状态
          </h3>
          {codeInfo ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">激活码</span>
                <span className="font-mono text-white">{codeInfo.code?.match(/.{1,4}/g)?.join("-")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">类型</span>
                <span className="text-white">{codeInfo.type === "forever" ? "永久卡" : "周卡"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">激活时间</span>
                <span className="text-white">{codeInfo.used_at?.replace("T", " ").substring(0, 16)}</span>
              </div>
              {codeInfo.expiry_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">到期时间</span>
                  <span className="text-white">{codeInfo.expiry_at?.replace("T", " ").substring(0, 16)}</span>
                </div>
              )}
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-green-500/10 py-3 text-sm font-semibold text-green-300">
                <Icon name="check" size={16} /> 已激活 · 可正常使用
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-white/60">尚未激活，输入激活码开始游戏</p>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="LOVE-XXXX-XXXX-XXXX"
                className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 font-mono text-white placeholder-white/30 outline-none transition focus:border-pink-400/50 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20"
              />
              {message && (
                <p className={`mb-3 text-sm ${message.includes("成功") ? "text-green-300" : "text-red-300"}`}>{message}</p>
              )}
              <button
                onClick={handleActivate}
                disabled={activating}
                className="w-full rounded-full py-3.5 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                style={{ background: "linear-gradient(135deg, #FF375F 0%, #FF2D55 50%, #D70040 100%)", boxShadow: "0 4px 24px rgba(255,55,95,0.4)" }}
              >
                {activating ? "激活中..." : "立即激活"}
              </button>
            </div>
          )}
        </div>

        {/* 引导小程序领激活码 */}
        <div className="game-container mb-6 fade-in-up" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #07C160 0%, #00B578 100%)", boxShadow: "0 4px 20px rgba(7,193,96,0.3)" }}>
              <Icon name="star" size={28} color="#fff" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">小程序领激活码</h3>
              <p className="text-xs text-white/50 mt-0.5">看广告免费领周卡，更多福利尽在小程序</p>
            </div>
            <button
              onClick={() => setShowMiniProgramModal(true)}
              className="rounded-full px-4 py-2 text-xs font-bold text-white transition hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #07C160 0%, #00B578 100%)", boxShadow: "0 2px 12px rgba(7,193,96,0.4)" }}
            >
              去看看
            </button>
          </div>
        </div>

        {/* 功能菜单 */}
        <div className="game-container mb-6 fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="divide-y divide-white/5">
            <Link href="/" className="flex items-center gap-3 py-4 transition active:bg-white/5">
              <Icon name="gamepad" size={20} color="#FF375F" />
              <span className="flex-1 text-sm text-white">开始游戏</span>
              <span className="text-white/30">›</span>
            </Link>
            <a href="https://weidian.com/?userid=1388425837" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-4 transition active:bg-white/5">
              <Icon name="star" size={20} color="#FFD60A" />
              <span className="flex-1 text-sm text-white">购买激活码</span>
              <span className="text-white/30">›</span>
            </a>
            <div onClick={() => setShowFeedback(true)} className="flex items-center gap-3 py-4 cursor-pointer transition active:bg-white/5">
              <Icon name="message" size={20} color="#BF5AF2" />
              <span className="flex-1 text-sm text-white">建议反馈</span>
              <span className="text-white/30">›</span>
            </div>
            <div onClick={() => setShowPartner(true)} className="flex items-center gap-3 py-4 cursor-pointer transition active:bg-white/5">
              <Icon name="heart" size={20} color="#FF2D55" />
              <span className="flex-1 text-sm text-white">合作意向</span>
              <span className="text-white/30">›</span>
            </div>
            <div onClick={handleLogout} className="flex items-center gap-3 py-4 cursor-pointer transition active:bg-white/5">
              <Icon name="logout" size={20} color="#FF453A" />
              <span className="flex-1 text-sm text-red-300">退出登录</span>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-center">
          <p className="text-xs text-amber-200/70 flex items-center justify-center gap-1.5">
            <Icon name="shield" size={12} color="rgba(251,191,36,0.5)" />
            每个账号最多绑定3台设备，超过将自动封禁
          </p>
        </div>

        <p className="text-center text-xs text-white/30 flex items-center justify-center gap-1.5">
          <Icon name="shield" size={14} color="rgba(255,255,255,0.3)" />
          仅供18岁以上成年情侣在双方自愿前提下使用
        </p>
      </div>

      {/* 看广告领激活码弹窗 */}
      {showAdModal && (
        <div className="modal-overlay" onClick={() => !adLoading && !adRewardCode && setShowAdModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {adRewardCode ? (
              /* 领取成功 */
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                  <Icon name="check" size={36} color="#34C759" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">领取成功！</h3>
                <p className="mb-4 text-sm text-white/60">你的专属激活码：</p>
                <div className="mb-6 rounded-xl border border-pink-400/30 bg-pink-500/10 p-4">
                  <p className="font-mono text-xl font-bold tracking-wider text-pink-300">{adRewardCode}</p>
                </div>
                <p className="mb-6 text-xs text-white/40">复制激活码，回到上方输入框激活即可开始游戏</p>
                <button
                  onClick={() => setShowAdModal(false)}
                  className="w-full rounded-full py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)" }}
                >
                  我知道了
                </button>
              </div>
            ) : (
              /* 广告播放中 */
              <div className="py-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                    <Icon name="play" size={20} color="#FFD60A" /> 广告播放中
                  </h3>
                  {!adLoading && (
                    <button onClick={() => setShowAdModal(false)} className="text-white/50 hover:text-white text-xl">×</button>
                  )}
                </div>

                {/* 广告占位区域 */}
                <div className="mb-4 flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <div className="text-center">
                    <Icon name="play" size={48} color="rgba(255,255,255,0.3)" />
                    <p className="mt-2 text-sm text-white/40">广告区域</p>
                  </div>
                </div>

                {/* 倒计时 */}
                <div className="text-center">
                  <p className="text-sm text-white/60">
                    {adLoading ? "正在领取激活码..." : (
                      <>
                        观看结束后可领取激活码，剩余 <span className="font-bold text-pink-300">{adCountdown}</span> 秒
                      </>
                    )}
                  </p>
                  {/* 进度条 */}
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${((30 - adCountdown) / 30) * 100}%`,
                        background: "linear-gradient(90deg, #FFD60A, #FF9F0A)",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 建议反馈弹窗 */}
      {showFeedback && (
        <div className="modal-overlay" onClick={() => setShowFeedback(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <Icon name="message" size={20} color="#BF5AF2" /> 建议反馈
              </h3>
              <button onClick={() => setShowFeedback(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white text-lg">×</button>
            </div>

            {/* 反馈类型选择 */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold text-white/50">反馈类型</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "suggestion", label: "玩法建议", color: "#BF5AF2" },
                  { value: "bug", label: "问题反馈", color: "#FF453A" },
                  { value: "content", label: "内容调整", color: "#FF9F0A" },
                  { value: "other", label: "其他", color: "#64D2FF" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFeedbackType(item.value)}
                    className="rounded-xl border py-2.5 text-xs font-semibold transition-all"
                    style={{
                      borderColor: feedbackType === item.value ? item.color : "rgba(255,255,255,0.1)",
                      background: feedbackType === item.value ? `${item.color}20` : "rgba(255,255,255,0.03)",
                      color: feedbackType === item.value ? item.color : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 提示卡片 */}
            <div className="mb-4 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 space-y-2">
              <p className="text-xs leading-relaxed text-purple-200/80">
                说说哪里不好用、想加什么玩法，或者哪些内容需要调整。
              </p>
              <p className="text-xs leading-relaxed text-pink-300 font-semibold">
                采纳意见将在一周内上线，采纳可获得永久付费会员权益。
              </p>
            </div>

            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="详细描述你的建议或遇到的问题..."
              rows={5}
              maxLength={500}
              className="mb-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-purple-400/50 focus:bg-white/10"
            />
            <div className="mb-4 flex justify-end">
              <span className="text-xs text-white/30">{feedbackText.length}/500</span>
            </div>

            {feedbackMsg && <p className="mb-3 text-sm text-center text-pink-300">{feedbackMsg}</p>}
            <button
              onClick={handleFeedback}
              disabled={feedbackSending || !feedbackText.trim()}
              className="w-full rounded-full py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: "linear-gradient(135deg, #BF5AF2 0%, #FF375F 100%)", boxShadow: "0 4px 20px rgba(191,90,242,0.3)" }}
            >
              {feedbackSending ? "提交中..." : "提交建议"}
            </button>
          </div>
        </div>
      )}

      {/* 小程序引导弹窗 */}
      {showMiniProgramModal && (
        <div className="modal-overlay" onClick={() => setShowMiniProgramModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl" style={{ background: "linear-gradient(135deg, #07C160 0%, #00B578 100%)" }}>
                <Icon name="star" size={40} color="#fff" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">小程序领激活码</h3>
              <p className="mb-4 text-sm text-white/60">
                打开微信，搜索小程序名称，即可看广告免费领激活码，更多福利等你发现！
              </p>
              <div className="mb-6">
                <div className="mx-auto mb-4 w-48 h-48 rounded-2xl overflow-hidden border border-white/10">
                  <img src="/images/miniprogram-qrcode.jpg" alt="小程序码" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm text-white/60 mb-3">长按图片保存到相册，打开微信扫码进入小程序</p>
                <button
                  onClick={saveQRCode}
                  className="w-full rounded-full py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #07C160 0%, #00B578 100%)" }}
                >
                  保存二维码到相册
                </button>
              </div>
              <button
                onClick={() => setShowMiniProgramModal(false)}
                className="w-full rounded-full py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #07C160 0%, #00B578 100%)" }}
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 合作意向弹窗 */}
      {showPartner && (
        <div className="modal-overlay" onClick={() => setShowPartner(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <Icon name="heart" size={20} color="#FF2D55" /> 合作意向
              </h3>
              <button onClick={() => setShowPartner(false)} className="text-white/50 hover:text-white text-xl">×</button>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-white/60">
              定制开发、渠道合作都可联系，欢迎洽谈。
            </p>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="mb-2 text-xs text-white/50">微信</p>
              <p className="mb-3 text-2xl font-bold tracking-wider text-white">nbioss</p>
              <button
                onClick={copyWechat}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)" }}
              >
                <Icon name="check" size={16} />
                {copied ? "已复制" : "复制微信号"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
