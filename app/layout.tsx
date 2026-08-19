import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '情侣互动小游戏合集 | 约会之夜前戏必备',
  description: '探索专为情侣夫妻伴侣设计的在线情趣派对游戏，如情趣飞行棋、真心话大冒险、夫妻骰子等，可自定义事件库。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
