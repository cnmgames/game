"use client";
import { useEffect } from "react";

const _API_HOST = ["k", "ttla", "top"];
const API_BASE = "https://" + _API_HOST[0] + "." + _API_HOST[1] + "." + _API_HOST[2] + "/api.php?action=";

export default function VisitTracker() {
  useEffect(() => {
    // 最简上报：直接用图片GET请求
    const track = () => {
      const page = encodeURIComponent(window.location.pathname);
      new Image().src = API_BASE + "track&p=" + page;
    };

    // 页面加载时立即上报
    track();

    // 每60秒上报一次
    const timer = setInterval(track, 60000);

    return () => clearInterval(timer);
  }, []);

  return null;
}
