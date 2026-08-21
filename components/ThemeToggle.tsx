"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // 读取保存的主题
    const saved = localStorage.getItem("lg_theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("lg_theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="nav-pill cursor-pointer hover:border-white/25"
      title={theme === "dark" ? "切换到白天模式" : "切换到夜间模式"}
    >
      {theme === "dark" ? "☀️ 白天" : "🌙 夜间"}
    </button>
  );
}
