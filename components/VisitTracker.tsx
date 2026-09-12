"use client";
import { useEffect } from "react";

const _API_HOST = ["k", "ttla", "top"];
const API_BASE = "https://" + _API_HOST[0] + "." + _API_HOST[1] + "." + _API_HOST[2] + "/api.php?action=";

export default function VisitTracker() {
  useEffect(() => {
    // 获取或生成设备ID
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId = "dev_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem("device_id", deviceId);
    }

    // 用Image Beacon方式上报（简单可靠，不会被跨域拦截）
    const reportVisit = () => {
      const page = encodeURIComponent(window.location.pathname);
      const url = API_BASE + "visit/log_beacon&page=" + page + "&device=" + encodeURIComponent(deviceId);
      // 用Image方式上报，不会有跨域问题
      const img = new Image();
      img.src = url;
    };

    // 页面加载时立即上报
    reportVisit();

    // 每30秒上报一次
    const timer = setInterval(reportVisit, 30000);

    return () => clearInterval(timer);
  }, []);

  return null;
}
