"use client";
import { useState, useEffect } from "react";

// API 地址（域名混淆拼接，不在代码中出现完整域名）
const _API_HOST = ["k", "ttla", "top"];
const API_BASE = "https://" + _API_HOST[0] + "." + _API_HOST[1] + "." + _API_HOST[2] + "/api.php?action=";

// SVG 图标组件
const MessageIcon = ({ size = 18, color = "#f9a8d4" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CloseIcon = ({ size = 14, color = "rgba(255,255,255,0.6)" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = ({ size = 48, color = "#34C759" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const LightbulbIcon = ({ size = 16, color = "#a855f7" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const BugIcon = ({ size = 16, color = "#ef4444" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="6" width="8" height="14" rx="4" />
    <path d="M19 7l-3 2" />
    <path d="M5 7l3 2" />
    <path d="M19 13l-3-2" />
    <path d="M5 13l3-2" />
    <path d="M19 19l-3-2" />
    <path d="M5 19l3-2" />
    <path d="M12 2v2" />
  </svg>
);

const EditIcon = ({ size = 16, color = "#9ca3af" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const AlertIcon = ({ size = 16, color = "#fca5a5" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function GameFeedbackButton({ gameName }: { gameName: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("suggestion");
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || status === "submitting") return;
    // 联系方式验证（选填，填了就验证格式）
    const contactTrimmed = contact.trim();
    if (contactTrimmed) {
      const isQQ = /^[1-9]\d{5,}$/.test(contactTrimmed);
      const isWechat = /^[a-zA-Z][a-zA-Z0-9_-]{5,}$/.test(contactTrimmed);
      const isEmail = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(contactTrimmed);
      if (!isQQ && !isWechat && !isEmail) {
        setStatus("error");
        setErrorMsg("联系方式格式不正确：QQ至少6位数字、微信号至少6位(字母开头)、或正确邮箱格式");
        return;
      }
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      const typeMap: Record<string, string> = { suggestion: "功能建议", bug: "问题反馈", other: "其他反馈" };
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      const res = await fetch(API_BASE + "ticket/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: `[${gameName}] ${typeMap[type]} - ${new Date().toLocaleString("zh-CN")}`,
          content: content.trim(),
          contact: contact.trim(),
          page: window.location.pathname,
          gameName,
          deviceInfo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setTimeout(() => {
          setOpen(false);
          setStatus("idle");
          setContent("");
          setContact("");
          setType("suggestion");
        }, 2000);
      } else {
        setStatus("error");
        setErrorMsg(data.message || "提交失败，请重试");
      }
    } catch {
      setStatus("error");
      setErrorMsg("网络错误，请检查网络后重试");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          top: "max(12px, env(safe-area-inset-top))",
          right: "max(12px, env(safe-area-inset-right))",
          padding: "6px 14px",
          borderRadius: "9999px",
          background: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(236,72,153,0.3)",
          color: "#f9a8d4",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
          zIndex: 9999,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
          whiteSpace: "nowrap",
          lineHeight: "1.5",
        }}
      >
        建议反馈
      </button>

      {open && (
        <div
          onClick={() => status !== "submitting" && setOpen(false)}
          onTouchMove={(e) => e.preventDefault()}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, #1e1e3a 0%, #15152a 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "20px",
              width: "100%",
              maxWidth: "400px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                <MessageIcon size={20} color="#f9a8d4" />
                {gameName} - 反馈建议
              </h3>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "14px", cursor: "pointer", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CloseIcon size={14} />
              </button>
            </div>

            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
                  <CheckIcon size={48} color="#34C759" />
                </div>
                <h3 style={{ color: "#fff", fontSize: "1.1rem", marginBottom: "8px" }}>感谢您的反馈！</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>您的建议已提交，我们会认真查看</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "8px", fontWeight: "600" }}>反馈类型</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[
                      { value: "suggestion", label: "建议", color: "#a855f7", icon: <LightbulbIcon size={16} color="#a855f7" /> },
                      { value: "bug", label: "问题", color: "#ef4444", icon: <BugIcon size={16} color="#ef4444" /> },
                      { value: "other", label: "其他", color: "#9ca3af", icon: <EditIcon size={16} color="#9ca3af" /> },
                    ].map((item) => (
                      <button key={item.value} type="button" onClick={() => setType(item.value)} style={{ flex: 1, padding: "10px 4px", borderRadius: "8px", border: type === item.value ? `2px solid ${item.color}` : "1px solid rgba(255,255,255,0.1)", background: type === item.value ? `${item.color}22` : "rgba(255,255,255,0.03)", color: "#fff", fontSize: "0.85rem", cursor: "pointer", fontWeight: type === item.value ? "600" : "400", WebkitTapHighlightColor: "transparent", touchAction: "manipulation", userSelect: "none", WebkitUserSelect: "none", transition: "none", outline: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "8px", fontWeight: "600" }}>详细描述 <span style={{ color: "#ef4444" }}>*</span></label>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="请描述您的建议或遇到的问题..." rows={4} maxLength={1000} required style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: "16px", resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: "1.5" }} />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "8px", fontWeight: "600" }}>联系方式 <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>(选填)</span></label>
                  <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="微信/QQ/邮箱（选填）" maxLength={50} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: "16px", outline: "none" }} />
                </div>
                {status === "error" && <div style={{ padding: "10px 12px", borderRadius: "6px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: "0.85rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertIcon size={16} color="#fca5a5" />
                  {errorMsg}
                </div>}
                <button type="submit" disabled={!content.trim() || status === "submitting"} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: content.trim() && status !== "submitting" ? "linear-gradient(135deg, #ec4899, #a855f7)" : "rgba(255,255,255,0.08)", color: "#fff", fontSize: "1rem", fontWeight: "600", cursor: content.trim() && status !== "submitting" ? "pointer" : "not-allowed", boxShadow: content.trim() && status !== "submitting" ? "0 4px 12px rgba(236,72,153,0.35)" : "none", opacity: status === "submitting" ? 0.7 : 1 }}>{status === "submitting" ? "提交中..." : "提交反馈"}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
