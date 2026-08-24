"use client";
import { useEffect } from "react";

export default function TicketAdminRedirect() {
  useEffect(() => {
    window.location.replace("/ticket-admin.html");
  }, []);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      color: "#fff",
      fontSize: "1.1rem",
    }}>
      正在跳转到工单管理系统...
    </div>
  );
}
