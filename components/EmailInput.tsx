"use client";
import { useEffect, useRef, useState } from "react";

const DOMAINS = [
  "@qq.com",
  "@gmail.com",
  "@163.com",
  "@126.com",
  "@outlook.com",
  "@foxmail.com",
  "@icloud.com",
  "@hotmail.com",
];

const CUSTOM_KEY = "__custom__";

function parseEmail(value: string) {
  const src = (value || "").trim();
  const at = src.lastIndexOf("@");
  if (at <= 0) {
    return { prefix: src, domain: DOMAINS[0], custom: false, full: "" };
  }
  const suffix = src.slice(at).toLowerCase();
  if (DOMAINS.indexOf(suffix) > -1) {
    return { prefix: src.slice(0, at), domain: suffix, custom: false, full: "" };
  }
  return { prefix: "", domain: DOMAINS[0], custom: true, full: src };
}

export default function EmailInput({
  value,
  onChange,
  onBlur,
  placeholder = "邮箱前缀",
  error = false,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}) {
  const init = parseEmail(value);
  const [prefix, setPrefix] = useState(init.prefix);
  const [domain, setDomain] = useState(init.domain);
  const [custom, setCustom] = useState(init.custom);
  const [full, setFull] = useState(init.full);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 外部值被程序改动时重新解析（用户输入时 value 与内部一致，不会触发）
  useEffect(() => {
    const computed = custom ? full : prefix ? prefix + domain : "";
    if (value !== computed) {
      const p = parseEmail(value);
      setPrefix(p.prefix);
      setDomain(p.domain);
      setCustom(p.custom);
      setFull(p.full);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emit = (p: string, d: string, c: boolean, f: string) => {
    if (c) onChange(f);
    else onChange(p ? p + d : "");
  };

  const handlePrefix = (raw: string) => {
    // 粘贴完整邮箱时自动拆分
    if (raw.indexOf("@") > -1) {
      const p = parseEmail(raw);
      if (p.custom) {
        setCustom(true);
        setFull(p.full);
        emit("", "", true, p.full);
      } else {
        setCustom(false);
        setPrefix(p.prefix);
        setDomain(p.domain);
        emit(p.prefix, p.domain, false, "");
      }
      return;
    }
    const clean = raw.replace(/\s/g, "");
    setPrefix(clean);
    emit(clean, domain, false, "");
  };

  const chooseDomain = (d: string) => {
    setOpen(false);
    if (d === CUSTOM_KEY) {
      const now = prefix ? prefix + domain : "";
      setCustom(true);
      setFull(now);
      emit("", "", true, now);
      setTimeout(() => inputRef.current?.focus(), 60);
      return;
    }
    // 从「其他邮箱」切回常见后缀时，保留用户已输入的前缀，避免清空
    let pre = prefix;
    if (custom) {
      const at = full.lastIndexOf("@");
      pre = at > 0 ? full.slice(0, at) : full.replace(/@/g, "");
    }
    setCustom(false);
    setPrefix(pre);
    setDomain(d);
    emit(pre, d, false, "");
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const borderCls = error
    ? "1px solid rgba(248,113,113,0.5)"
    : open
    ? "1px solid rgba(255,120,160,0.55)"
    : "1px solid rgba(255,255,255,0.1)";

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderRadius: "12px",
          border: borderCls,
          background: open ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
          padding: "4px 8px 4px 16px",
          minHeight: "52px",
          transition: "all .15s",
        }}
      >
        {custom ? (
          <>
            <input
              ref={inputRef}
              type="email"
              value={full}
              disabled={disabled}
              onChange={(e) => {
                const v = e.target.value;
                setFull(v);
                onChange(v);
              }}
              onBlur={onBlur}
              placeholder="请输入完整邮箱地址"
              autoComplete="email"
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "16px",
                padding: "10px 0",
              }}
            />
            <button
              type="button"
              onClick={() => chooseDomain(DOMAINS[0])}
              style={{
                flexShrink: 0,
                border: "none",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.55)",
                fontSize: "12px",
                padding: "6px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              选常见邮箱
            </button>
          </>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              value={prefix}
              disabled={disabled}
              onChange={(e) => handlePrefix(e.target.value)}
              onBlur={onBlur}
              placeholder={placeholder}
              autoComplete="off"
              inputMode="email"
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "16px",
                padding: "10px 0",
              }}
            />
            <button
              type="button"
              onClick={() => {
                inputRef.current?.blur();
                setOpen(!open);
              }}
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                border: "none",
                background: "rgba(255,55,95,0.14)",
                color: "#FF8FA8",
                fontSize: "14px",
                fontWeight: 600,
                padding: "8px 10px",
                borderRadius: "9px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {domain}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF8FA8"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </>
        )}
      </div>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 80 }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: 90,
              background: "#141416",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "14px",
              padding: "6px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
              maxHeight: "264px",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {DOMAINS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => chooseDomain(d)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  border: "none",
                  background: d === domain ? "rgba(255,55,95,0.16)" : "transparent",
                  color: d === domain ? "#FF8FA8" : "rgba(255,255,255,0.82)",
                  fontSize: "14px",
                  padding: "11px 12px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span>{d}</span>
                {d === domain && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF8FA8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 12 4 20" transform="translate(0,-2)" />
                  </svg>
                )}
              </button>
            ))}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "4px 8px" }} />
            <button
              type="button"
              onClick={() => chooseDomain(CUSTOM_KEY)}
              style={{
                display: "block",
                width: "100%",
                border: "none",
                background: "transparent",
                color: "rgba(255,255,255,0.6)",
                fontSize: "13px",
                padding: "11px 12px",
                borderRadius: "10px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              其他邮箱（手动输入完整地址）
            </button>
          </div>
        </>
      )}
    </div>
  );
}
