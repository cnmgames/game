// 游戏数据 - 事件库

// 飞行棋格子事件
export const ludoEvents = [
  { id: 1, type: "sweet", text: "深情对视10秒，然后亲吻对方额头" },
  { id: 2, type: "truth", text: "真心话：你最喜欢对方身上的哪个部位？" },
  { id: 3, type: "dare", text: "大冒险：用鼻尖在对方脖子上画一个爱心" },
  { id: 4, type: "sweet", text: "给对方一个持续15秒的拥抱" },
  { id: 5, type: "truth", text: "真心话：你们第一次约会时你在想什么？" },
  { id: 6, type: "dare", text: "大冒险：模仿对方生气时的样子" },
  { id: 7, type: "sweet", text: "在对方耳边轻声说一句情话" },
  { id: 8, type: "truth", text: "真心话：你做过最浪漫的事是什么？" },
  { id: 9, type: "dare", text: "大冒险：公主抱/被公主抱做3个深蹲" },
  { id: 10, type: "sweet", text: "互相喂对方吃一口零食" },
  { id: 11, type: "truth", text: "真心话：你最想和对方一起去的地方是哪里？" },
  { id: 12, type: "dare", text: "大冒险：用嘴唇把一张纸从对方手里接过来" },
  { id: 13, type: "sweet", text: "给对方按摩肩膀1分钟" },
  { id: 14, type: "truth", text: "真心话：对方哪一点最让你心动？" },
  { id: 15, type: "dare", text: "大冒险：蒙眼猜对方身体的三个部位" },
  { id: 16, type: "sweet", text: "十指相扣，一起深呼吸5次" },
  { id: 17, type: "truth", text: "真心话：你有没有偷偷看过对方的手机？" },
  { id: 18, type: "dare", text: "大冒险：在对方脖子上留下一个吻痕" },
  { id: 19, type: "sweet", text: "用手指在对方手心写一句我爱你" },
  { id: 20, type: "truth", text: "真心话：你理想中的婚礼是什么样的？" },
  { id: 21, type: "dare", text: "大冒险：脱掉一件外套（自愿原则）" },
  { id: 22, type: "sweet", text: "额头相抵，安静地待30秒" },
  { id: 23, type: "truth", text: "真心话：你最想改掉对方的一个小习惯是什么？" },
  { id: 24, type: "dare", text: "大冒险：用身体摆出一个字母让对方猜" },
];

// 真心话大冒险题目
export const truthQuestions = [
  "你第一次对我心动是什么时候？",
  "你最喜欢我穿什么风格的衣服？",
  "你做过最疯狂的事是什么？",
  "你手机里最尴尬的一张照片是什么？",
  "你有没有在我面前放过屁？",
  "你最想和我一起尝试什么新事物？",
  "你觉得我们之间最默契的瞬间是什么？",
  "你有没有偷偷幻想过我们的未来？",
  "你最不能忍受对方的一点是什么？",
  "你上一次哭是因为什么？",
  "你有没有对我说过谎？",
  "你最想收到我送的什么礼物？",
  "你觉得我们第一次约会怎么样？",
  "你最喜欢我什么性格特点？",
  "你有没有在朋友面前夸过我？",
  "你最想和我一起去哪里旅行？",
  "你觉得我们之间最大的挑战是什么？",
  "你有没有做过让你后悔的决定？",
  "你最害怕失去什么？",
  "你对我们的未来有什么规划？",
];

export const dareChallenges = [
  "深情亲吻对方10秒",
  "用嘴喂对方一口水",
  "给对方跳一段15秒的热舞",
  "在对方脖子上留下一个吻痕",
  "模仿动物叫让对方猜",
  "用舌头在对方手上画爱心",
  "把对方的袜子脱下来（如果穿着）",
  "蒙眼亲对方，猜亲的是哪个部位",
  "给对方讲一个荤段子",
  "用身体摆出一个爱心形状",
  "舔对方的耳垂",
  "把衣服领口拉大让对方看里面（自愿）",
  "坐在对方腿上待30秒",
  "用鼻子蹭对方的鼻子",
  "给对方一个湿吻",
  "在对方耳边吹气",
  "把对方按在墙上强吻",
  "用手指划过对方的嘴唇",
  "咬对方的下唇轻轻拉一下",
  "在对方锁骨上留下吻痕",
];

// 骰子游戏 - 每个面对应的动作
export const diceActions = [
  { id: 1, text: "亲吻", icon: "💋", desc: "亲吻对方指定的部位" },
  { id: 2, text: "拥抱", icon: "🤗", desc: "给对方一个深情拥抱" },
  { id: 3, text: "按摩", icon: "💆", desc: "给对方按摩2分钟" },
  { id: 4, text: "真心话", icon: "💭", desc: "回答一个真心话问题" },
  { id: 5, text: "大冒险", icon: "🎯", desc: "完成一个大冒险挑战" },
  { id: 6, text: "脱一件", icon: "👕", desc: "自愿脱掉一件衣物" },
];

// 老虎机 - 三个滚轮的选项
export const slotWheels = {
  location: ["卧室", "客厅", "浴室", "厨房", "阳台", "车里", "沙发", "地板"],
  action: ["亲吻", "抚摸", "拥抱", "按摩", "耳语", "对视", "依偎", "挑逗"],
  bodyPart: ["嘴唇", "脖子", "耳朵", "肩膀", "手背", "额头", "锁骨", "脸颊"],
};

// 暗兽棋棋子
export const beastPieces = [
  { rank: 8, name: "狮王", emoji: "🦁", power: "指定对方做一件事" },
  { rank: 7, name: "猛虎", emoji: "🐯", power: "亲吻对方10秒" },
  { rank: 6, name: "猎豹", emoji: "🐆", power: "给对方按摩" },
  { rank: 5, name: "野狼", emoji: "🐺", power: "说一句情话" },
  { rank: 4, name: "狐狸", emoji: "🦊", power: "真心话" },
  { rank: 3, name: "兔子", emoji: "🐰", power: "大冒险" },
  { rank: 2, name: "猫咪", emoji: "🐱", power: "拥抱对方" },
  { rank: 1, name: "老鼠", emoji: "🐭", power: "可以吃掉狮王（特殊规则）" },
];

// 大富翁事件
export const monopolyEvents = [
  { id: 1, type: "forward", text: "前进2格", effect: "+2" },
  { id: 2, type: "back", text: "后退1格", effect: "-1" },
  { id: 3, type: "event", text: "甜蜜时刻：亲吻对方", effect: "kiss" },
  { id: 4, type: "event", text: "真心话时间", effect: "truth" },
  { id: 5, type: "event", text: "大冒险挑战", effect: "dare" },
  { id: 6, type: "event", text: "给对方按摩3分钟", effect: "massage" },
  { id: 7, type: "forward", text: "前进3格", effect: "+3" },
  { id: 8, type: "event", text: "拥抱对方30秒", effect: "hug" },
  { id: 9, type: "back", text: "后退2格", effect: "-2" },
  { id: 10, type: "event", text: "说一句情话", effect: "sweet" },
  { id: 11, type: "event", text: "互换一件衣服穿", effect: "swap" },
  { id: 12, type: "event", text: "蒙眼喂对方吃东西", effect: "feed" },
  { id: 13, type: "forward", text: "前进1格", effect: "+1" },
  { id: 14, type: "event", text: "公主抱转圈", effect: "carry" },
  { id: 15, type: "event", text: "深情对视20秒", effect: "look" },
  { id: 16, type: "event", text: "终点：赢家获得一个愿望", effect: "win" },
];

// 游戏列表配置
export const gamesList = [
  {
    slug: "ludo",
    title: "情侣飞行棋",
    emoji: "✈️",
    desc: "经典飞行棋的浪漫升级版，专为情侣设计的增进感情的互动游戏。",
    color: "from-pink-500/20 to-rose-500/20",
  },
  {
    slug: "truth-or-dare",
    title: "真心话大冒险",
    emoji: "🎡",
    desc: "旋转转盘抽取题目，回答真心话问题或接受大胆的挑战。",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    slug: "dice",
    title: "情趣骰子",
    emoji: "🎲",
    desc: "掷骰子决定互动动作，简单直接，随时开启甜蜜时刻。",
    color: "from-rose-500/20 to-orange-500/20",
  },
  {
    slug: "dark-beast",
    title: "暗兽棋",
    emoji: "🦁",
    desc: "翻牌、博弈、互动。心跳加速的策略对决，输了要接受惩罚。",
    color: "from-amber-500/20 to-yellow-500/20",
  },
  {
    slug: "slots",
    title: "桃色老虎机",
    emoji: "🎰",
    desc: "一拉定情。地点、动作、部位，随机组合你的下一个亲密时刻。",
    color: "from-red-500/20 to-pink-500/20",
  },
  {
    slug: "monopoly",
    title: "午夜大富翁",
    emoji: "💎",
    desc: "绕着棋盘冒险，每一站都有甜蜜事件等待完成。",
    color: "from-cyan-500/20 to-blue-500/20",
  },
];
