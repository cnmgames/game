"use client";
import { useState, useEffect } from "react";

const API_BASE = "https://api.ttla.top";

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("suggestion");
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || status === "submitting") return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/feedback/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          content: content.trim(),
          contact: contact.trim(),
          page: window.location.pathname,
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
    } catch (err) {
      setStatus("error");
      setErrorMsg("网络错误，请检查网络后重试");
    }
  };

  return (
    <>
      {/* 悬浮按钮 - 适配移动端 */}
      <button
        onClick={() => setOpen(true)}
        aria-label="反馈建议"
        style={{
          position: "fixed",
          right: "max(12px, env(safe-area-inset-right))",
          bottom: "max(65px, calc(env(safe-area-inset-bottom) + 60px))",
          width: "46px",
          height: "46px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ec4899, #a855f7)",
          border: "none",
          color: "#fff",
          fontSize: "20px",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(236,72,153,0.45)",
          zIndex: 99998,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s ease",
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = "scale(0.92)";
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        💬
      </button>

      {/* 弹窗 */}
      {open && (
        <div
          onClick={() => status !== "submitting" && setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "0",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, #1e1e3a 0%, #15152a 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px 20px 0 0",
              padding: "24px 20px",
              paddingBottom: "max(24px, calc(env(safe-area-inset-bottom) + 16px))",
              width: "100%",
              maxWidth: "480px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 -10px 40px rgba(0,0,0,0.5)",
              animation: "slideUp 0.3s cubic-bezier(0.4,0,0.2,1)",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* 顶部拖拽条 */}
            <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.2)", margin: "0 auto 16px" }} />

            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: "52px", marginBottom: "14px" }}>✅</div>
                <h3 style={{ color: "#fff", fontSize: "1.25rem", marginBottom: "8px", fontWeight: "700" }}>
                  感谢您的反馈！
                </h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                  您的建议已提交到云端，我们会认真查看并持续优化
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: "700" }}>
                    💬 反馈与建议
                  </h3>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="关闭"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "none",
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "16px",
                      cursor: "pointer",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* 反馈类型 */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", marginBottom: "10px", fontWeight: "600" }}>
                      反馈类型
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {[
                        { value: "suggestion", label: "💡 建议", color: "#a855f7" },
                        { value: "bug", label: "🐛 问题", color: "#ef4444" },
                        { value: "other", label: "📝 其他", color: "#6b7280" },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setType(item.value)}
                          style={{
                            flex: 1,
                            padding: "11px 6px",
                            borderRadius: "10px",
                            border: type === item.value ? `2px solid ${item.color}` : "1px solid rgba(255,255,255,0.1)",
                            background: type === item.value ? `${item.color}22` : "rgba(255,255,255,0.03)",
                            color: "#fff",
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            fontWeight: type === item.value ? "600" : "400",
                            WebkitTapHighlightColor: "transparent",
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 反馈内容 */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", marginBottom: "8px", fontWeight: "600" }}>
                      详细描述 <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="请描述您的建议或遇到的问题，越详细越好..."
                      rows={4}
                      maxLength={2000}
                      required
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.04)",
                        color: "#fff",
                        fontSize: "0.9rem",
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                        lineHeight: "1.5",
                      }}
                    />
                    <div style={{ textAlign: "right", marginTop: "4px", fontSize: "0.7rem", color: "rgba(255,255,255,0.35)" }}>
                      {content.length}/2000
                    </div>
                  </div>

                  {/* 联系方式 */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", marginBottom: "8px", fontWeight: "600" }}>
                      联系方式 <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>(选填)</span>
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="微信/QQ/邮箱，方便我们回复您"
                      maxLength={100}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.04)",
                        color: "#fff",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* 错误提示 */}
                  {status === "error" && (
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#fca5a5",
                      fontSize: "0.85rem",
                      marginBottom: "14px",
                    }}>
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  {/* 提交按钮 */}
                  <button
                    type="submit"
                    disabled={!content.trim() || status === "submitting"}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      background: content.trim() && status !== "submitting"
                        ? "linear-gradient(135deg, #ec4899, #a855f7)"
                        : "rgba(255,255,255,0.08)",
                      color: "#fff",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: content.trim() && status !== "submitting" ? "pointer" : "not-allowed",
                      transition: "all 0.3s",
                      boxShadow: content.trim() && status !== "submitting" ? "0 4px 16px rgba(236,72,153,0.35)" : "none",
                      opacity: status === "submitting" ? 0.7 : 1,
                    }}
                  >
                    {status === "submitting" ? "提交中..." : "提交反馈"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}


    </>
  );
}
