import './globals.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import AntiDebugProvider from '../components/AntiDebugProvider'
import WechatBlocker from '../components/WechatBlocker'

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
  other: {
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
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
          paddingBottom: '48px',
          overflowX: 'hidden',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
          touchAction: 'manipulation'
        }}>
        {/* 微信拦截 */}
        <WechatBlocker />
        {/* 预连接API服务器 */}
        <link rel="preconnect" href="https://k.ttla.top" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://k.ttla.top" />
        {/* Google AdSense */}
        <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7156604582462189" crossOrigin="anonymous" strategy="afterInteractive" />
        <AntiDebugProvider>
          {children}
                  </AntiDebugProvider>
        {/* 访问记录 + 在线心跳上报 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var _h = ["k","ttla","top"];
                var _api = "https://" + _h[0] + "." + _h[1] + "." + _h[2] + "/api.php?action=";
                function getDev() {
                  try {
                    var s = screen, n = navigator, c = document.createElement("canvas");
                    var x = c.getContext("2d");
                    if (x) { x.font = "14px Arial"; x.fillText("fp", 2, 2); }
                    var r = [n.userAgent, n.language, s.width+"x"+s.height, s.colorDepth, new Date().getTimezoneOffset()].join("|");
                    var h = 0;
                    for (var i = 0; i < r.length; i++) { h = ((h << 5) - h + r.charCodeAt(i)) | 0; }
                    return "dev_" + Math.abs(h).toString(36);
                  } catch(e) { return "dev_unknown"; }
                }
                function getCode() {
                  try {
                    var a = JSON.parse(localStorage.getItem("lg_activation") || "{}");
                    return a.code || "";
                  } catch(e) { return ""; }
                }
                function logVisit() {
                  try {
                    fetch(_api + "visit/log", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        page: window.location.pathname,
                        device_id: getDev(),
                        code: getCode()
                      })
                    }).catch(function(){});
                  } catch(e) {}
                }
                function heartbeat() {
                  try {
                    fetch(_api + "online/visit", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        code: getCode(),
                        device_id: getDev()
                      })
                    }).catch(function(){});
                  } catch(e) {}
                }
                // 页面加载时上报访问记录+在线心跳
                if (document.readyState === "loading") {
                  document.addEventListener("DOMContentLoaded", function() { logVisit(); heartbeat(); });
                } else {
                  logVisit();
                  heartbeat();
                }
                // 每30秒上报一次在线心跳
                setInterval(heartbeat, 30000);
              })();
            `,
          }}
        />
        {/* 免责声明 */}
        <div className="global-disclaimer" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.6)',
          pointerEvents: 'none',
          zIndex: 99999,
          padding: '10px 16px',
          paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 60%, transparent 100%)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          fontWeight: 500
        }}>
          ⚠️ 18+成年情侣娱乐 | 双方自愿安全 | 不适即停
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 禁止双指缩放
              document.addEventListener('gesturestart', function(e) { e.preventDefault(); });
              document.addEventListener('gesturechange', function(e) { e.preventDefault(); });
              document.addEventListener('gestureend', function(e) { e.preventDefault(); });
              // 禁止双击缩放
              var lastTouchEnd = 0;
              document.addEventListener('touchend', function(e) {
                var now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) { e.preventDefault(); }
                lastTouchEnd = now;
              }, false);
            `,
          }}
        />
      </body>
    </html>
  )
}
