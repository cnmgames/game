"use client";
import { useState, useEffect } from "react";

const API_BASE = "https://api.ttla.top";
import { validateContent } from "../lib/contentFilter";

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
    // 内容验证：字数和脏字
    const validation = validateContent(content);
    if (!validation.valid) {
      setStatus("error");
      setErrorMsg(validation.message || "内容不符合要求");
      return;
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
      const res = await fetch(`${API_BASE}/ticket/create`, {
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
      {/* 游戏内反馈按钮 - 放在顶部合适位置 */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          top: "max(12px, env(safe-area-inset-top))",
          right: "max(12px, env(safe-area-inset-right))",
          padding: "4px 10px",
          borderRadius: "9999px",
          background: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(236,72,153,0.3)",
          color: "#f9a8d4",
          fontSize: "12px",
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

      {/* 弹窗 */}
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
              <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "700" }}>💬 {gameName} - 反馈建议</h3>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "14px", cursor: "pointer", width: "28px", height: "28px", borderRadius: "50%" }}>✕</button>
            </div>

            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                <h3 style={{ color: "#fff", fontSize: "1.1rem", marginBottom: "8px" }}>感谢您的反馈！</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>您的建议已提交，我们会认真查看</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "8px", fontWeight: "600" }}>反馈类型</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[{ value: "suggestion", label: "💡 建议", color: "#a855f7" }, { value: "bug", label: "🐛 问题", color: "#ef4444" }, { value: "other", label: "📝 其他", color: "#6b7280" }].map((item) => (
                      <button key={item.value} type="button" onClick={() => setType(item.value)} style={{ flex: 1, padding: "10px 4px", borderRadius: "8px", border: type === item.value ? `2px solid ${item.color}` : "1px solid rgba(255,255,255,0.1)", background: type === item.value ? `${item.color}22` : "rgba(255,255,255,0.03)", color: "#fff", fontSize: "0.85rem", cursor: "pointer", fontWeight: type === item.value ? "600" : "400", WebkitTapHighlightColor: "transparent" }}>{item.label}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "8px", fontWeight: "600" }}>详细描述 <span style={{ color: "#ef4444" }}>*</span></label>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} onFocus={(e) => { e.target.style.fontSize = "16px"; }} onBlur={(e) => { e.target.style.fontSize = "0.9rem"; }} placeholder="请描述您的建议或遇到的问题（至少10字）..." rows={4} maxLength={1000} required style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: "16px", resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: "1.5", WebkitTextSizeAdjust: "none" }} />
                  <div style={{ textAlign: "right", marginTop: "4px", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>有效{content.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, "").length}/10字起</div>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "8px", fontWeight: "600" }}>联系方式 <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>(选填)</span></label>
                  <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} onFocus={(e) => { e.target.style.fontSize = "16px"; }} onBlur={(e) => { e.target.style.fontSize = "0.9rem"; }} placeholder="微信/QQ/邮箱" maxLength={50} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: "16px", outline: "none", WebkitTextSizeAdjust: "none" }} />
                </div>
                {status === "error" && <div style={{ padding: "10px 12px", borderRadius: "6px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: "0.85rem", marginBottom: "12px" }}>⚠️ {errorMsg}</div>}
                <button type="submit" disabled={!content.trim() || status === "submitting"} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: content.trim() && status !== "submitting" ? "linear-gradient(135deg, #ec4899, #a855f7)" : "rgba(255,255,255,0.08)", color: "#fff", fontSize: "1rem", fontWeight: "600", cursor: content.trim() && status !== "submitting" ? "pointer" : "not-allowed", boxShadow: content.trim() && status !== "submitting" ? "0 4px 12px rgba(236,72,153,0.35)" : "none", opacity: status === "submitting" ? 0.7 : 1, WebkitTapHighlightColor: "transparent" }}>{status === "submitting" ? "提交中..." : "提交反馈"}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
