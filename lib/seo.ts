import type { Metadata } from 'next'

// 游戏SEO配置
const GAME_SEO: Record<string, {
  title: string
  description: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
}> = {
  truth: {
    title: '真心话大冒险转盘 - 情侣互动派对游戏 | 免费在线玩',
    description: '情侣真心话大冒险转盘游戏，支持自定义玩家、自定义题库，旋转转盘抽取劲爆真心话或刺激大冒险，情侣约会必备互动游戏。',
    keywords: ['真心话大冒险', '情侣游戏', '转盘游戏', '派对游戏', '互动游戏', '情侣约会'],
    ogTitle: '真心话大冒险转盘 - 情侣互动派对游戏',
    ogDescription: '旋转转盘抽取劲爆真心话或刺激大冒险，支持自定义玩家和题库，情侣约会必备。',
  },
  dice: {
    title: '情趣骰子 - 情侣前戏互动游戏 | 免费在线玩',
    description: '情侣情趣骰子游戏，多面骰子随机生成亲密动作和指令，增加情侣间的情趣互动，适合约会前戏和卧室游戏。',
    keywords: ['情趣骰子', '情侣骰子', '前戏游戏', '互动游戏', '情侣情趣', '卧室游戏'],
    ogTitle: '情趣骰子 - 情侣前戏互动游戏',
    ogDescription: '多面骰子随机生成亲密动作和指令，增加情侣间的情趣互动。',
  },
  flight: {
    title: '情侣飞行棋 - 双人互动棋盘游戏 | 免费在线玩',
    description: '情侣专属飞行棋游戏，每格都有惊喜任务，掷骰子前进，完成亲密挑战，适合情侣居家约会互动。',
    keywords: ['情侣飞行棋', '飞行棋', '双人游戏', '棋盘游戏', '情侣互动', '约会游戏'],
    ogTitle: '情侣飞行棋 - 双人互动棋盘游戏',
    ogDescription: '每格都有惊喜任务，掷骰子前进完成亲密挑战，情侣居家约会必备。',
  },
  'flight-pro': {
    title: '情侣飞行棋Pro - 进阶版双人互动游戏 | 免费在线玩',
    description: '情侣飞行棋进阶版，更多任务格子、更丰富的互动玩法，支持自定义规则，情侣深度互动游戏。',
    keywords: ['情侣飞行棋Pro', '飞行棋进阶', '双人游戏', '情侣互动', '深度互动', '自定义规则'],
    ogTitle: '情侣飞行棋Pro - 进阶版双人互动游戏',
    ogDescription: '更多任务格子、更丰富的互动玩法，支持自定义规则。',
  },
  beast: {
    title: '野兽模式 - 情侣激情互动游戏 | 免费在线玩',
    description: '野兽模式情侣游戏，随机生成激情指令和挑战，释放内心欲望，适合情侣提升亲密度和激情。',
    keywords: ['野兽模式', '情侣游戏', '激情互动', '亲密游戏', '情侣情趣', '提升亲密度'],
    ogTitle: '野兽模式 - 情侣激情互动游戏',
    ogDescription: '随机生成激情指令和挑战，释放内心欲望，提升情侣亲密度。',
  },
  gay: {
    title: '同志情侣游戏 - LGBTQ+专属互动游戏 | 免费在线玩',
    description: '专为同志情侣设计的互动游戏集合，包含多种亲密互动玩法，支持自定义内容，LGBTQ+情侣约会必备。',
    keywords: ['同志游戏', 'gay游戏', 'LGBTQ+', '情侣游戏', '男同游戏', '互动游戏'],
    ogTitle: '同志情侣游戏 - LGBTQ+专属互动游戏',
    ogDescription: '专为同志情侣设计的互动游戏集合，多种亲密互动玩法。',
  },
  'infinite-celsius': {
    title: '无限摄氏度 - 情侣升温互动游戏 | 免费在线玩',
    description: '无限摄氏度情侣游戏，通过层层递进的互动任务让感情持续升温，从浅到深的亲密挑战，情侣约会必备。',
    keywords: ['无限摄氏度', '情侣升温', '互动游戏', '亲密挑战', '情侣约会', '感情升温'],
    ogTitle: '无限摄氏度 - 情侣升温互动游戏',
    ogDescription: '层层递进的互动任务让感情持续升温，从浅到深的亲密挑战。',
  },
  monopoly: {
    title: '情侣大富翁 - 双人互动棋盘游戏 | 免费在线玩',
    description: '情侣版大富翁游戏，掷骰子买地收租，加入情侣专属任务和惩罚，双人互动约会游戏。',
    keywords: ['情侣大富翁', '大富翁', '双人游戏', '棋盘游戏', '情侣互动', '约会游戏'],
    ogTitle: '情侣大富翁 - 双人互动棋盘游戏',
    ogDescription: '掷骰子买地收租，加入情侣专属任务和惩罚，双人互动约会游戏。',
  },
  posture: {
    title: '姿势大全 - 情侣亲密姿势指南 | 免费在线查询',
    description: '情侣亲密姿势大全，多种姿势图文详解，支持随机抽取和收藏，帮助情侣探索更多可能，提升亲密体验。',
    keywords: ['姿势大全', '情侣姿势', '亲密姿势', '姿势指南', '情侣情趣', '亲密体验'],
    ogTitle: '姿势大全 - 情侣亲密姿势指南',
    ogDescription: '多种姿势图文详解，支持随机抽取和收藏，提升情侣亲密体验。',
  },
  roleplay: {
    title: '角色扮演 - 情侣情景互动游戏 | 免费在线玩',
    description: '情侣角色扮演游戏，多种情景剧本随机生成，包含医生病人、老师学生等经典场景，增加情侣情趣和新鲜感。',
    keywords: ['角色扮演', '情侣游戏', '情景游戏', '剧本游戏', '情侣情趣', '新鲜感'],
    ogTitle: '角色扮演 - 情侣情景互动游戏',
    ogDescription: '多种情景剧本随机生成，经典场景扮演，增加情侣情趣和新鲜感。',
  },
  senses: {
    title: '感官游戏 - 情侣五感互动体验 | 免费在线玩',
    description: '情侣感官游戏，通过视觉、听觉、触觉、嗅觉、味觉五感互动，提升情侣亲密体验和感官享受。',
    keywords: ['感官游戏', '五感游戏', '情侣互动', '亲密体验', '感官享受', '情侣游戏'],
    ogTitle: '感官游戏 - 情侣五感互动体验',
    ogDescription: '通过五感互动提升情侣亲密体验和感官享受。',
  },
  slot: {
    title: '情侣老虎机 - 趣味互动抽奖游戏 | 免费在线玩',
    description: '情侣版老虎机游戏，拉动摇杆随机生成亲密任务和奖励，增加约会趣味性，情侣互动小游戏。',
    keywords: ['情侣老虎机', '老虎机', '抽奖游戏', '互动游戏', '情侣游戏', '约会趣味'],
    ogTitle: '情侣老虎机 - 趣味互动抽奖游戏',
    ogDescription: '拉动摇杆随机生成亲密任务和奖励，增加约会趣味性。',
  },
  'strip-cards': {
    title: '脱衣扑克牌 - 情侣趣味卡牌游戏 | 免费在线玩',
    description: '情侣版脱衣扑克游戏，输的人接受惩罚，增加情侣间的情趣和互动，适合私密约会场合。',
    keywords: ['脱衣扑克', '情侣扑克', '卡牌游戏', '情侣游戏', '情趣游戏', '私密约会'],
    ogTitle: '脱衣扑克牌 - 情侣趣味卡牌游戏',
    ogDescription: '输的人接受惩罚，增加情侣间的情趣和互动。',
  },
  telepathy: {
    title: '心灵感应 - 情侣默契测试游戏 | 免费在线玩',
    description: '情侣心灵感应游戏，通过答题测试双方默契度，多种题型随机抽取，了解彼此的同时增加互动乐趣。',
    keywords: ['心灵感应', '默契测试', '情侣游戏', '答题游戏', '情侣默契', '互动游戏'],
    ogTitle: '心灵感应 - 情侣默契测试游戏',
    ogDescription: '通过答题测试双方默契度，了解彼此的同时增加互动乐趣。',
  },
}

// 生成游戏页面metadata
export function generateGameMetadata(slug: string): Metadata {
  const config = GAME_SEO[slug] || {
    title: '情侣互动小游戏 | 免费在线玩',
    description: '专为情侣设计的在线互动游戏集合，多种玩法提升亲密度，免费在线玩。',
    keywords: ['情侣游戏', '互动游戏', '情侣互动', '免费游戏', '在线游戏'],
    ogTitle: '情侣互动小游戏',
    ogDescription: '专为情侣设计的在线互动游戏集合。',
  }

  const url = `https://love.ttla.top/${slug}/`

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords.join(', '),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: config.ogTitle,
      description: config.ogDescription,
      url: url,
      siteName: '情侣互动小游戏',
      type: 'website',
      locale: 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.ogTitle,
      description: config.ogDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}
