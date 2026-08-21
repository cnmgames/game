import './globals.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import AntiDebugProvider from '../components/AntiDebugProvider'

export const metadata: Metadata = {
  title: '情侣互动小游戏合集 | 约会之夜前戏必备',
  description: '探索专为情侣夫妻伴侣设计的在线情趣派对游戏，如情趣飞行棋、真心话大冒险、夫妻骰子等，可自定义事件库。',
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '情侣游戏',
  },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 主题初始化（在页面渲染前执行，避免闪烁）
              (function() {
                try {
                  var savedTheme = localStorage.getItem("lg_theme");
                  if (savedTheme === "light") {
                    document.documentElement.setAttribute("data-theme", "light");
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <AntiDebugProvider>
          {children}
        </AntiDebugProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 移动端滑动误触检测
              (function() {
                let touchStartX = 0, touchStartY = 0, touchMoved = false, touchStartTime = 0;
                document.addEventListener('touchstart', function(e) {
                  touchStartX = e.touches[0].clientX;
                  touchStartY = e.touches[0].clientY;
                  touchMoved = false;
                  touchStartTime = Date.now();
                }, { passive: true });
                document.addEventListener('touchmove', function(e) {
                  var dx = Math.abs(e.touches[0].clientX - touchStartX);
                  var dy = Math.abs(e.touches[0].clientY - touchStartY);
                  if (dx > 8 || dy > 8) touchMoved = true;
                }, { passive: true });
                document.addEventListener('touchend', function(e) {
                  if (touchMoved && Date.now() - touchStartTime < 500) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                  touchMoved = false;
                }, { passive: false, capture: true });
                document.addEventListener('click', function(e) {
                  if (touchMoved) {
                    e.preventDefault();
                    e.stopPropagation();
                    touchMoved = false;
                  }
                }, true);
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
