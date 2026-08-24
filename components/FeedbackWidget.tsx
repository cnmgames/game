"use client";
import { useState, useEffect } from "react";

const API_BASE = "https://api.ttla.top";
import { validateContent } from "../lib/contentFilter";

// 游戏页面路径列表（这些页面不显示悬浮按钮，改用页面内反馈入口）
const GAME_PATHS = ["/flight", "/truth", "/dice", "/beast", "/slot", "/monopoly", "/flight-pro", "/posture"];

export default function FeedbackWidget() {
  // 所有state必须在顶层声明，不能在条件判断之后
  const [open, setOpen] = useState(false);
  const [isGamePage, setIsGamePage] = useState(false);
  const [type, setType] = useState("suggestion");
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // 检测是否是游戏页面
  useEffect(() => {
    const path = window.location.pathname;
    setIsGamePage(GAME_PATHS.some(p => path.startsWith(p)));
  }, []);

  // 弹窗打开时禁用背景滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [open]);

  // 游戏页面不显示悬浮按钮（必须在所有Hooks之后）
  if (isGamePage) return null;

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
      const typeMap: Record<string, string> = {
        suggestion: "功能建议",
        bug: "问题反馈",
        other: "其他反馈",
      };
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
          title: `${typeMap[type]} - ${new Date().toLocaleString("zh-CN")}`,
          content: content.trim(),
          contact: contact.trim(),
          page: window.location.pathname,
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

  const closeModal = () => {
    if (status === "submitting") return;
    setOpen(false);
  };

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setOpen(true)}
        aria-label="反馈建议"
        onTouchStart={(e) => {
          if (e.touches.length > 1) e.preventDefault();
        }}
        onTouchMove={(e) => {
          if (e.touches.length > 1) e.preventDefault();
        }}
        onDoubleClick={(e) => e.preventDefault()}
        style={{
          position: "fixed",
          right: "max(10px, env(safe-area-inset-right))",
          bottom: "max(55px, calc(env(safe-area-inset-bottom) + 50px))",
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ec4899, #a855f7)",
          border: "none",
          color: "#fff",
          fontSize: "18px",
          cursor: "pointer",
          boxShadow: "0 3px 12px rgba(236,72,153,0.4)",
          zIndex: 99998,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTapHighlightColor: "transparent",
          WebkitTouchCallout: "none",
          outline: "none",
          WebkitTextSizeAdjust: "none",
          textSizeAdjust: "none",
        }}
      >
        💬
      </button>

      {/* 弹窗遮罩 */}
      {open && (
        <div
          onClick={closeModal}
          onTouchMove={(e) => e.preventDefault()}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "0",
            overflow: "hidden",
            touchAction: "none",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="feedback-modal"
            style={{
              background: "linear-gradient(180deg, #1e1e3a 0%, #15152a 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px 16px 0 0",
              padding: "16px 16px",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 70px)",
              width: "100%",
              maxWidth: "420px",
              maxHeight: "75vh",
              overflowY: "auto",
              boxShadow: "0 -8px 30px rgba(0,0,0,0.5)",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div style={{ width: "36px", height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.2)", margin: "0 auto 12px" }} />

            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>✅</div>
                <h3 style={{ color: "#fff", fontSize: "1.05rem", marginBottom: "6px", fontWeight: "700" }}>感谢您的反馈！</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", lineHeight: "1.5" }}>您的建议已提交，我们会认真查看</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h3 style={{ color: "#fff", fontSize: "1.05rem", fontWeight: "700" }}>💬 反馈与建议</h3>
                  <button
                    onClick={closeModal}
                    aria-label="关闭"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "none",
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "14px",
                      cursor: "pointer",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      WebkitTapHighlightColor: "transparent",
                      touchAction: "manipulation",
                    }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginBottom: "6px", fontWeight: "600" }}>反馈类型</label>
                    <div style={{ display: "flex", gap: "6px" }}>
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
                            padding: "9px 4px",
                            borderRadius: "8px",
                            border: type === item.value ? `2px solid ${item.color}` : "1px solid rgba(255,255,255,0.1)",
                            background: type === item.value ? `${item.color}22` : "rgba(255,255,255,0.03)",
                            color: "#fff",
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            transition: "none",
                            fontWeight: type === item.value ? "600" : "400",
                            WebkitTapHighlightColor: "transparent",
                            touchAction: "manipulation",
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            outline: "none",
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginBottom: "6px", fontWeight: "600" }}>详细描述 <span style={{ color: "#ef4444" }}>*</span></label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onFocus={(e) => {
                        // 阻止iOS输入时自动放大
                        e.target.style.fontSize = "16px";
                      }}
                      onBlur={(e) => {
                        e.target.style.fontSize = "0.85rem";
                      }}
                      placeholder="请描述您的建议或遇到的问题（至少10字）..."
                      rows={3}
                      maxLength={1000}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.04)",
                        color: "#fff",
                        fontSize: "16px",
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                        lineHeight: "1.5",
                        WebkitTextSizeAdjust: "none",
                        textSizeAdjust: "none",
                      }}
                    />
                    <div style={{ textAlign: "right", marginTop: "3px", fontSize: "0.68rem", color: "rgba(255,255,255,0.35)" }}>有效{content.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, "").length}/10字起</div>
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginBottom: "6px", fontWeight: "600" }}>联系方式 <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>(选填)</span></label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      onFocus={(e) => { e.target.style.fontSize = "16px"; }}
                      onBlur={(e) => { e.target.style.fontSize = "0.85rem"; }}
                      placeholder="微信/QQ/邮箱"
                      maxLength={50}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.04)",
                        color: "#fff",
                        fontSize: "16px",
                        outline: "none",
                        WebkitTextSizeAdjust: "none",
                      }}
                    />
                  </div>

                  {status === "error" && (
                    <div style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#fca5a5",
                      fontSize: "0.8rem",
                      marginBottom: "10px",
                    }}>
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!content.trim() || status === "submitting"}
                    style={{
                      width: "100%",
                      padding: "11px",
                      borderRadius: "10px",
                      border: "none",
                      background: content.trim() && status !== "submitting"
                        ? "linear-gradient(135deg, #ec4899, #a855f7)"
                        : "rgba(255,255,255,0.08)",
                      color: "#fff",
                      fontSize: "0.92rem",
                      fontWeight: "600",
                      cursor: content.trim() && status !== "submitting" ? "pointer" : "not-allowed",
                      transition: "none",
                      boxShadow: content.trim() && status !== "submitting" ? "0 3px 12px rgba(236,72,153,0.35)" : "none",
                      opacity: status === "submitting" ? 0.7 : 1,
                      WebkitTapHighlightColor: "transparent",
                      touchAction: "manipulation",
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
