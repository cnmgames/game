import { useEffect, useState } from 'react';

interface AiImportModalProps {
  isOpen: boolean;
  themeName: string;
  onClose: () => void;
  onImport: (tasks: string[], mode: 'append' | 'replace') => void;
}

// 内置任务库，根据主题关键词智能匹配
const TASK_LIBRARY: Record<string, string[]> = {
  '甜蜜日常': [
    '一起拥抱30秒不说话',
    '互相说一句今天最开心的事',
    '给对方捏捏肩膀2分钟',
    '额头碰额头闭眼10秒',
    '一起拍一张搞怪合照',
    '互相喂一口水',
    '牵手散步5分钟',
    '给对方一个早安吻',
    '一起听一首喜欢的歌',
    '互相夸奖对方3个优点',
    '一起做一个深呼吸',
    '给对方揉揉头发',
    '背靠背坐5分钟聊天',
    '互相说一句我爱你',
    '一起看一张老照片',
    '给对方一个晚安吻',
    '牵手闭眼许愿10秒',
    '互相捏捏脸',
    '一起喝一杯水',
    '给对方揉揉手'
  ],
  '暧昧升温': [
    '在对方耳边轻声说句情话',
    '从背后抱住对方1分钟',
    '轻咬对方耳垂3秒',
    '用鼻尖蹭对方鼻尖',
    '舔一下对方嘴唇',
    '在对方脖子上种草莓',
    '用手指划过对方嘴唇',
    '深情对视10秒不笑',
    '慢慢解开对方一颗扣子',
    '用舌头画圈舔对方锁骨',
    '在对方耳边吹气',
    '轻咬对方下巴',
    '用手指划过对方后背',
    '慢慢脱掉对方一件衣服',
    '在对方手心画圈',
    '用嘴唇轻碰对方额头',
    '慢慢亲吻对方脖子',
    '用手指轻抚对方脸颊',
    '在对方耳边说我想要你',
    '慢慢亲吻对方肩膀'
  ],
  '干柴烈火': [
    '互相脱掉对方上衣',
    '用舌头舔对方乳头',
    '轻咬对方乳头3秒',
    '用手抚摸对方胸部',
    '慢慢亲吻对方腹部',
    '用舌头画圈舔对方肚脐',
    '脱掉对方裤子只剩内裤',
    '用手隔着内裤抚摸对方',
    '慢慢亲吻对方大腿内侧',
    '用舌头轻舔对方大腿内侧',
    '互相抚摸对方私密处',
    '用嘴亲吻对方私密处',
    '慢慢脱掉对方内裤',
    '69式互相取悦',
    '用手指进入对方身体',
    '慢慢亲吻对方全身',
    '用舌头舔遍对方全身',
    '互相自慰给对方看',
    '用嘴含住对方手指',
    '慢慢进入对方身体'
  ],
  '极度诱惑': [
    '穿性感内衣给对方跳一段舞',
    '蒙住对方眼睛用羽毛轻抚全身',
    '用冰块划过对方身体',
    '滴蜡在对方胸口（低温蜡烛）',
    '用手铐铐住对方双手',
    '用鞭子轻抽对方臀部',
    '角色扮演老师和学生',
    '角色扮演医生和病人',
    '角色扮演秘书和老板',
    '用嘴喂对方吃水果',
    '用舌头舔掉对方身上的奶油',
    '慢慢脱衣舞给对方看',
    '用丝袜蒙住对方眼睛',
    '用高跟鞋轻踩对方身体',
    '角色扮演护士和病人',
    '用嘴叼住玫瑰送给对方',
    '慢慢亲吻对方手指',
    '用舌头舔对方耳朵',
    '慢慢脱掉对方丝袜',
    '用嘴解开对方胸罩'
  ],
  '灵肉合一': [
    '女上位自己动1分钟',
    '后入式抽插50下不射',
    '一边接吻一边做爱',
    '男抱女站立式做爱',
    '在快要高潮时停下来冷静10秒',
    '看着镜子里的彼此做爱',
    '用最慢的速度抽插感受每一寸摩擦',
    '女生夹紧双腿男生尝试从后面进入',
    '男生在女生耳边详细描述现在的感觉',
    '互相同时达到高潮',
    '做完后抱着对方说情话5分钟',
    '用舌头清理对方身体',
    '互相亲吻全身事后安抚',
    '抱着对方一起洗澡',
    '事后给对方按摩放松',
    '一起裸睡什么都不做',
    '用最慢的速度做爱10分钟',
    '互相说最羞耻的幻想',
    '在对方体内停留5分钟不动',
    '一起达到高潮后抱着不分开'
  ],
  '默认': [
    '一起拥抱30秒',
    '互相说一句情话',
    '给对方捏捏肩膀',
    '额头碰额头闭眼10秒',
    '深情对视10秒',
    '互相夸奖对方3个优点',
    '牵手散步5分钟',
    '给对方一个吻',
    '一起听一首歌',
    '互相喂一口水',
    '给对方揉揉头发',
    '背靠背聊天5分钟',
    '一起做一个深呼吸',
    '互相捏捏脸',
    '给对方揉揉手',
    '一起拍一张合照',
    '互相说一句我爱你',
    '牵手闭眼许愿',
    '给对方一个拥抱',
    '一起喝一杯水'
  ]
};

// 根据主题名称匹配任务库
const getTasksForTheme = (themeName: string, count: number): string[] => {
  let library = TASK_LIBRARY['默认'];
  
  // 关键词匹配
  if (themeName.includes('甜蜜') || themeName.includes('日常') || themeName.includes('温馨')) {
    library = TASK_LIBRARY['甜蜜日常'];
  } else if (themeName.includes('暧昧') || themeName.includes('升温') || themeName.includes('前戏')) {
    library = TASK_LIBRARY['暧昧升温'];
  } else if (themeName.includes('干柴') || themeName.includes('烈火') || themeName.includes('肌肤')) {
    library = TASK_LIBRARY['干柴烈火'];
  } else if (themeName.includes('极度') || themeName.includes('诱惑') || themeName.includes('边缘')) {
    library = TASK_LIBRARY['极度诱惑'];
  } else if (themeName.includes('灵肉') || themeName.includes('合一') || themeName.includes('实战') || themeName.includes('冲刺')) {
    library = TASK_LIBRARY['灵肉合一'];
  }
  
  // 随机打乱并选取指定数量
  const shuffled = [...library].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export function AiImportModal({ isOpen, themeName, onClose, onImport }: AiImportModalProps) {
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [generatedTasks, setGeneratedTasks] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateCount, setGenerateCount] = useState(10);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setMode('append');
    setGeneratedTasks([]);
    setIsGenerating(false);
    setGenerateCount(10);
    setError('');
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setError('');
    
    // 模拟AI生成延迟
    setTimeout(() => {
      const tasks = getTasksForTheme(themeName, generateCount);
      setGeneratedTasks(tasks);
      setIsGenerating(false);
    }, 800);
  };

  const handleImport = () => {
    if (generatedTasks.length === 0) {
      setError('请先生成任务卡');
      return;
    }
    onImport(generatedTasks, mode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999999
    }}>
      <div
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '20px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '4px',
          backgroundColor: 'rgba(255,255,255,0.3)',
          borderRadius: '2px',
          margin: '0 auto 16px'
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #BF5AF2, #FF375F)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>AI 智能生成任务卡</h3>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '16px'
        }}>
          {/* 生成数量选择 */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>生成数量</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[5, 10, 15, 20].map(count => (
                <button
                  key={count}
                  onClick={() => setGenerateCount(count)}
                  style={{
                    flex: 1,
                    height: '36px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: generateCount === count ? '#FF375F' : '#2C2C2E',
                    color: generateCount === count ? 'white' : 'rgba(255,255,255,0.7)'
                  }}
                >
                  {count}条
                </button>
              ))}
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{
              width: '100%',
              height: '44px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              background: isGenerating 
                ? 'linear-gradient(90deg, #666, #888)'
                : 'linear-gradient(90deg, #BF5AF2, #FF375F)',
              color: 'white',
              marginBottom: '16px',
              opacity: isGenerating ? 0.7 : 1
            }}
          >
            {isGenerating ? 'AI 生成中...' : '✨ 一键 AI 生成任务卡'}
          </button>

          {/* 生成的任务列表 */}
          {generatedTasks.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                已生成 {generatedTasks.length} 条任务卡（可预览）
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {generatedTasks.map((task, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#2C2C2E',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: 'white',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start'
                    }}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '1px' }}>{idx + 1}</span>
                    <span style={{ flex: 1 }}>{task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 导入方式 */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>导入方式</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setMode('append')}
                style={{
                  flex: 1,
                  height: '36px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: mode === 'append' ? 'white' : '#2C2C2E',
                  color: mode === 'append' ? 'black' : 'rgba(255,255,255,0.7)'
                }}
              >
                追加（保留原有）
              </button>
              <button
                onClick={() => setMode('replace')}
                style={{
                  flex: 1,
                  height: '36px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: mode === 'replace' ? 'white' : '#2C2C2E',
                  color: mode === 'replace' ? 'black' : 'rgba(255,255,255,0.7)'
                }}
              >
                覆盖（清空原有）
              </button>
            </div>
          </div>

          {error && <div style={{ fontSize: '13px', color: '#FF453A', marginBottom: '12px' }}>{error}</div>}
        </div>

        {/* 底部按钮 */}
        <div style={{ display: 'flex', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '999px',
              backgroundColor: '#3A3A3C',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={generatedTasks.length === 0}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '999px',
              background: generatedTasks.length > 0 
                ? 'linear-gradient(90deg, #BF5AF2, #FF375F)'
                : '#3A3A3C',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              cursor: generatedTasks.length > 0 ? 'pointer' : 'not-allowed',
              opacity: generatedTasks.length > 0 ? 1 : 0.5
            }}
          >
            导入任务卡
          </button>
        </div>
      </div>
    </div>
  );
}
