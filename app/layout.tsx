import './globals.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import AntiDebugProvider from '../components/AntiDebugProvider'

export const metadata: Metadata = {
  title: '情侣互动小游戏合集 | 约会之夜前戏必备',
  description: '探索专为情侣夫妻伴侣设计的在线情趣派对游戏，如情趣飞行棋、真心话大冒险、夫妻骰子等，可自定义事件库。',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
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
      <body style={{
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
          touchAction: 'manipulation'
        }}>
        <AntiDebugProvider>
          {children}

        </AntiDebugProvider>
        {/* 免责声明 */}
        <div style={{
          position: 'fixed',
          bottom: '8px',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.25)',
          pointerEvents: 'none',
          zIndex: 1,
          padding: '0 16px'
        }}>
          本网站仅供18岁以上成年情侣娱乐，请在双方自愿且安全的前提下进行
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 禁止双指缩放
              document.addEventListener('gesturestart', function(e) {
                e.preventDefault();
              });
              document.addEventListener('gesturechange', function(e) {
                e.preventDefault();
              });
              document.addEventListener('gestureend', function(e) {
                e.preventDefault();
              });
              // 禁止双击缩放
              var lastTouchEnd = 0;
              document.addEventListener('touchend', function(e) {
                var now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                  e.preventDefault();
                }
                lastTouchEnd = now;
              }, false);
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
