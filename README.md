# 情侣互动小游戏合集 (LoveGame)

一个专为情侣设计的在线互动小游戏合集，采用 Next.js 14 + TypeScript + Tailwind CSS 构建。

## 功能特性

- 🎮 **6款互动游戏**
  - ✈️ 情侣飞行棋 - 经典飞行棋的浪漫升级版
  - 🎡 真心话大冒险 - 旋转转盘抽取题目
  - 🎲 情趣骰子 - 掷骰子决定互动动作
  - 🦁 暗兽棋 - 翻牌记忆配对游戏
  - 🎰 桃色老虎机 - 随机组合亲密时刻
  - 💎 午夜大富翁 - 棋盘冒险事件

- 🎨 **深色玻璃拟态设计** - 精致的视觉效果
- 📱 **全设备响应式** - 手机、平板、电脑完美适配
- ⚡ **流畅动画** - 骰子滚动、转盘旋转、卡片翻转动画
- 🔧 **可自定义事件库** - 轻松修改游戏内容

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **部署**: 支持 Vercel / 静态导出 / Node.js 服务

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

### 静态导出（可选）

在 `next.config.js` 中添加 `output: 'export'` 即可生成纯静态文件。

## 部署到 GitHub

### 方式一：Vercel 一键部署（推荐，最简单）

1. 将本项目推送到 GitHub
2. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
3. 点击 "Add New Project"，导入你的仓库
4. 直接点击 "Deploy"，无需任何配置
5. 部署完成后获得一个 `xxx.vercel.app` 的域名，随时可访问

### 方式二：GitHub Pages（免费，已配置自动部署）

项目已内置 GitHub Actions 工作流，推送到 `main` 分支后自动构建部署：

1. 将本项目推送到 GitHub
2. 在仓库设置中：**Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**
3. 如果部署到 `https://用户名.github.io/仓库名/`（非自定义域名），需要在 `next.config.js` 中设置 `basePath` 和 `assetPrefix` 为 `/你的仓库名`
4. 推送代码到 `main` 分支，Actions 会自动构建并部署
5. 部署完成后在 Settings → Pages 中查看访问地址

### 上传到 GitHub 的命令

```bash
# 在项目目录下执行
git init
git add .
git commit -m "init: 情侣互动小游戏合集"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

## 项目结构

```
lovegame/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── globals.css         # 全局样式
│   ├── ludo/               # 情侣飞行棋
│   ├── truth-or-dare/      # 真心话大冒险
│   ├── dice/               # 情趣骰子
│   ├── dark-beast/         # 暗兽棋
│   ├── slots/              # 桃色老虎机
│   └── monopoly/           # 午夜大富翁
├── components/
│   └── GameLayout.tsx      # 游戏页面通用布局
├── lib/
│   └── gameData.ts         # 游戏数据/事件库
├── public/
│   └── manifest.json       # PWA 配置
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 自定义游戏内容

所有游戏的事件、题目、动作都在 `lib/gameData.ts` 中定义，可以根据喜好自由修改：

- `ludoEvents` - 飞行棋格子事件
- `truthQuestions` - 真心话题目
- `dareChallenges` - 大冒险挑战
- `diceActions` - 骰子动作
- `slotWheels` - 老虎机选项
- `beastPieces` - 暗兽棋棋子
- `monopolyEvents` - 大富翁事件

## 注意事项

- 本项目仅供学习和个人使用
- 游戏内容请在双方自愿、充分沟通的前提下使用
- 请遵守当地法律法规

## License

MIT
