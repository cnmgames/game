import type { Metadata } from "next";
import UserStatusMonitor from "../components/UserStatusMonitor";

export const metadata: Metadata = {
  title: "情侣游戏 - 情侣互动小游戏合集",
  description: "情侣互动小游戏合集，包含情侣飞行棋、真心话大冒险、情趣骰子等多种情侣游戏",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, padding: 0 }}>
        <UserStatusMonitor />
        {children}
      </body>
    </html>
  );
}
