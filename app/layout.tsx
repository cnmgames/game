import type { Metadata } from "next";
import UserStatusMonitor from "../components/UserStatusMonitor";
import WechatTip from "../components/WechatTip";
import VisitTracker from "../components/VisitTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "情侣游戏 - 情侣互动小游戏合集",
  description: "情侣互动小游戏合集，包含情侣飞行棋、真心话大冒险、情趣骰子等多种情侣游戏",
};

// 全局请求补丁：把 application/json 转成 text/plain，并移除自定义头。
// 作用：让所有跨域 POST 成为「简单请求」，不触发 OPTIONS 预检，
// 规避微信 X5 / 部分手机浏览器预检失败导致的「无法连接到服务器」。
// 后端 api.php 读取 php://input 做 JSON 解析，不校验 Content-Type，因此完全兼容。
const FETCH_PATCH = `
(function(){
  if (typeof window === 'undefined' || !window.fetch) return;
  var rawFetch = window.fetch;
  window.fetch = function(input, init){
    try {
      if (init && init.headers && typeof init.headers === 'object') {
        var h = init.headers;
        var isHeadersObj = (typeof Headers !== 'undefined' && h instanceof Headers);
        if (isHeadersObj) {
          var ct = h.get('Content-Type');
          if (ct && ct.indexOf('application/json') !== -1) {
            h.set('Content-Type', 'text/plain');
          }
          h.delete('X-Token');
          h.delete('X-Device-Id');
          h.delete('X-Requested-With');
        } else {
          for (var k in h) {
            if (!Object.prototype.hasOwnProperty.call(h, k)) continue;
            var lower = String(k).toLowerCase();
            if (lower === 'content-type' && typeof h[k] === 'string' && h[k].indexOf('application/json') !== -1) {
              h[k] = 'text/plain';
            }
            if (lower === 'x-token' || lower === 'x-device-id' || lower === 'x-requested-with') {
              delete h[k];
            }
          }
        }
      }
    } catch (e) {}
    var self = this, args = arguments;
    return rawFetch.apply(self, args).catch(function (err) {
      // 网络层失败（DNS/TLS/被代理或插件拦截）自动重试一次，间隔 600ms
      try {
        var url = typeof input === 'string' ? input : ((input && input.url) || '');
        if (url.indexOf('api.php') === -1) throw err;
      } catch (e2) { throw err; }
      return new Promise(function (res) { setTimeout(res, 600); }).then(function () {
        return rawFetch.apply(self, args);
      });
    });
  };
    })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <script dangerouslySetInnerHTML={{ __html: FETCH_PATCH }} />
      </head>
      <body>
        <WechatTip />
        <UserStatusMonitor />
        <VisitTracker />
        {children}
      </body>
    </html>
  );
}
