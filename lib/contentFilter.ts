// 内容过滤工具：字数统计和脏字检测

// 脏词列表（常见辱骂词汇）
const DIRTY_WORDS = [
  "操", "草", "日", "妈的", "他妈的", "你妈", "傻逼", "傻b", "煞笔",
  "白痴", "笨蛋", "废物", "垃圾", "滚蛋", "去死", "混蛋", "王八蛋",
  "狗娘养的", "婊子", "贱货", "骚货", "贱人", "脑残", "智障", "弱智",
  "变态", "恶心", "去死吧", "滚", "猪", "蠢", "笨", "傻",
  "fuck", "shit", "bitch", "asshole", "damn", "crap", "stupid",
  "idiot", "moron", "dumb", "suck", "sucks", "fucking",
];

// 统计有效字数（只统计中文字符和英文字母，不统计符号、数字、空格）
export function countValidChars(text: string): number {
  if (!text) return 0;
  // 匹配中文字符和英文字母
  const matches = text.match(/[\u4e00-\u9fa5a-zA-Z]/g);
  return matches ? matches.length : 0;
}

// 检测是否包含脏字
export function containsDirtyWord(text: string): { hasDirty: boolean; word?: string } {
  if (!text) return { hasDirty: false };
  const lowerText = text.toLowerCase();
  for (const word of DIRTY_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      return { hasDirty: true, word };
    }
  }
  return { hasDirty: false };
}

// 验证内容
export function validateContent(text: string): { valid: boolean; message?: string } {
  const charCount = countValidChars(text);
  if (charCount < 10) {
    return { valid: false, message: `请至少输入10个有效文字（当前${charCount}字，符号空格不算）` };
  }
  const dirtyCheck = containsDirtyWord(text);
  if (dirtyCheck.hasDirty) {
    return { valid: false, message: `内容包含不文明用语，请修改后再提交` };
  }
  return { valid: true };
}
