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
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [showPartner, setShowPartner] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleFeedback = async () => {
    if (!feedbackText.trim()) { setFeedbackMsg("请输入反馈内容"); return; }
    setFeedbackSending(true);
    setFeedbackMsg("");
    try {
      const res = await fetch(API_BASE + "ticket/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "用户意见反馈",
          content: feedbackText,
          contact: user?.email || "",
          type: "feedback",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg("提交成功，感谢你的反馈！");
        setFeedbackText("");
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
        <Link href="/" className="back-btn mb-6 inline-flex">
          ← 返回首页
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
              <span className="flex-1 text-sm text-white">意见反馈</span>
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

        <p className="text-center text-xs text-white/30">
          🔞 仅供18岁以上成年情侣在双方自愿前提下使用
        </p>
      </div>

      {/* 意见反馈弹窗 */}
      {showFeedback && (
        <div className="modal-overlay" onClick={() => setShowFeedback(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <Icon name="message" size={20} color="#BF5AF2" /> 意见反馈
              </h3>
              <button onClick={() => setShowFeedback(false)} className="text-white/50 hover:text-white text-xl">×</button>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-white/60">
              说说哪里不好用、想加什么玩法，或者哪些内容需要调整。采纳意见将在一周内上线，采纳意见可获得永久付费会员权益。
            </p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="输入你的建议或反馈..."
              rows={5}
              className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-pink-400/50 focus:bg-white/10"
            />
            {feedbackMsg && <p className="mb-3 text-sm text-center text-pink-300">{feedbackMsg}</p>}
            <button
              onClick={handleFeedback}
              disabled={feedbackSending}
              className="w-full rounded-full py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)", boxShadow: "0 4px 20px rgba(255,55,95,0.3)" }}
            >
              {feedbackSending ? "提交中..." : "提交反馈"}
            </button>
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
