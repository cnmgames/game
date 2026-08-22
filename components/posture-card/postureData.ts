export interface Posture {
  id: number;
  name: string;
  emoji: string;
  difficulty: '简单' | '中等' | '困难';
  duration: string;
  description: string;
  howTo: string;
  tips: string;
  suitable: string;
  heat: number; // 1-5
}

export const postureList: Posture[] = [
  {
    id: 1,
    name: '传教士式',
    emoji: '🤝',
    difficulty: '简单',
    duration: '10-15分钟',
    description: '最经典的性爱姿势，双方面对面，男方在上，女方在下。适合新手和追求亲密感的情侣。',
    howTo: '女方仰卧，双腿分开微曲，男方跪趴在女方双腿之间，双手支撑身体，缓慢进入。',
    tips: '可以在女方腰部垫一个枕头，提高舒适度，增加深度。',
    suitable: '所有情侣，尤其适合新手和追求浪漫亲密感的人。',
    heat: 3
  },
  {
    id: 2,
    name: '女上位',
    emoji: '👑',
    difficulty: '简单',
    duration: '10-20分钟',
    description: '女方在上，掌控节奏和深度，是最容易让女性达到高潮的姿势之一。',
    howTo: '男方仰卧，女方跨坐在男方身上，面对男方或背对男方，自行控制节奏和深度。',
    tips: '女方可以前后摆动或上下运动，找到最舒服的角度和节奏。',
    suitable: '想要掌控节奏的女性，以及容易早泄的男性。',
    heat: 4
  },
  {
    id: 3,
    name: '后入式',
    emoji: '🐕',
    difficulty: '简单',
    duration: '8-12分钟',
    description: '从后方进入，深度较深，刺激感强烈，适合追求刺激的情侣。',
    howTo: '女方双膝跪在床上，上半身趴下，臀部翘起，男方从后方跪入，双手扶住女方腰部。',
    tips: '女方可以调整臀部高度，找到最舒服的角度。',
    suitable: '追求深度和刺激感的情侣。',
    heat: 4
  },
  {
    id: 4,
    name: '侧入式',
    emoji: '🌙',
    difficulty: '中等',
    duration: '15-20分钟',
    description: '双方侧卧，从侧面进入，省力且亲密，适合长时间性爱和孕妇。',
    howTo: '双方面对面侧卧，女方将上方的腿搭在男方腰上，男方从侧面进入。',
    tips: '可以用枕头支撑，调整到最舒服的角度。',
    suitable: '想要长时间性爱、省力的情侣，以及孕妇。',
    heat: 3
  },
  {
    id: 5,
    name: '坐莲式',
    emoji: '🪷',
    difficulty: '中等',
    duration: '10-15分钟',
    description: '男方坐着，女方跨坐在男方腿上，面对面，亲密感强，适合深情对视。',
    howTo: '男方坐在床边或椅子上，女方跨坐在男方腿上，双手搂住男方脖子，男方双手扶住女方腰部。',
    tips: '女方可以上下运动或画圈运动，增加刺激感。',
    suitable: '追求亲密感和深情对视的情侣。',
    heat: 4
  },
  {
    id: 6,
    name: '站立式',
    emoji: '🧍',
    difficulty: '困难',
    duration: '5-10分钟',
    description: '双方站立，从前方或后方进入，刺激感强，但需要一定体力。',
    howTo: '女方站在床边，一条腿搭在床上，男方站立从前方进入；或女方双手扶墙，男方从后方站立进入。',
    tips: '可以借助墙壁或家具支撑，节省体力。',
    suitable: '体力较好、追求新鲜刺激的情侣。',
    heat: 5
  },
  {
    id: 7,
    name: '69式',
    emoji: '🔄',
    difficulty: '中等',
    duration: '10-15分钟',
    description: '双方互相口交，同时获得快感，是前戏和互相取悦的经典姿势。',
    howTo: '双方头脚相对，一方仰卧，另一方趴在上方，互相用嘴刺激对方私密部位。',
    tips: '注意沟通，找到双方都舒服的角度和节奏。',
    suitable: '所有情侣，尤其适合前戏和互相取悦。',
    heat: 5
  },
  {
    id: 8,
    name: '拱桥式',
    emoji: '🌉',
    difficulty: '困难',
    duration: '5-8分钟',
    description: '女方腰部拱起，臀部抬高，深度较深，刺激感强烈，需要一定柔韧性。',
    howTo: '女方仰卧，双腿抬起放在男方肩上，腰部拱起，臀部抬高，男方跪入。',
    tips: '可以在女方腰部垫枕头，增加舒适度。',
    suitable: '柔韧性较好、追求深度刺激的情侣。',
    heat: 5
  },
  {
    id: 9,
    name: '牛仔式',
    emoji: '🤠',
    difficulty: '中等',
    duration: '10-15分钟',
    description: '女上位的变体，女方背对男方，像骑马一样上下运动，视觉刺激强。',
    howTo: '男方仰卧，女方跨坐在男方身上，背对男方，双手撑在男方膝盖或大腿上，上下运动。',
    tips: '女方可以前后摆动或画圈，增加刺激感。',
    suitable: '喜欢视觉刺激、女方掌控节奏的情侣。',
    heat: 5
  },
  {
    id: 10,
    name: '摇篮式',
    emoji: '🛏️',
    difficulty: '中等',
    duration: '10-15分钟',
    description: '女方双腿盘在男方腰上，像摇篮一样晃动，亲密感强，适合深情做爱。',
    howTo: '男方坐着或半躺着，女方坐在男方腿上，双腿盘在男方腰上，双手搂住男方脖子，双方一起前后晃动。',
    tips: '可以配合深情接吻，增加浪漫感。',
    suitable: '追求亲密感和浪漫氛围的情侣。',
    heat: 4
  },
  {
    id: 11,
    name: '蜻蜓点水',
    emoji: '🪰',
    difficulty: '困难',
    duration: '5-8分钟',
    description: '女方双手撑地，双腿搭在男方肩上，男方站立进入，难度较高但刺激感强。',
    howTo: '女方双手撑在床上或地上，上半身趴下，双腿抬起搭在男方肩上，男方站立从前方进入。',
    tips: '注意安全，确保支撑稳固。',
    suitable: '体力较好、追求高难度刺激的情侣。',
    heat: 5
  },
  {
    id: 12,
    name: '背靠背式',
    emoji: '🔙',
    difficulty: '中等',
    duration: '10-15分钟',
    description: '双方背靠背坐着，从后方进入，省力且有独特的刺激感。',
    howTo: '双方背靠背坐在床上，女方双腿分开，男方从后方进入，双手可以抚摸女方胸部或私密处。',
    tips: '可以前后晃动，增加刺激感。',
    suitable: '想要省力、尝试新感觉的情侣。',
    heat: 4
  }
];
