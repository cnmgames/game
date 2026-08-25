"use client";
import { useState, useEffect } from 'react';
import { postureList, Posture } from './postureData';
import { PostureIllustration } from './PostureIllustration';
import { ArrowLeft, Flame, Clock, Target, X } from 'lucide-react';



export default function PostureCardApp() {
  const [selectedPosture, setSelectedPosture] = useState<Posture | null>(null);
  const [filter, setFilter] = useState<'全部' | '简单' | '中等' | '困难'>('全部');

  useEffect(() => {
    if (selectedPosture) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPosture]);

  const filteredList = filter === '全部' 
    ? postureList 
    : postureList.filter(p => p.difficulty === filter);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '简单': return '#4CAF50';
      case '中等': return '#FF9800';
      case '困难': return '#F44336';
      default: return '#999';
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      backgroundColor: '#000',
      color: 'white',
      padding: '12px 16px',
      boxSizing: 'border-box',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* 头部 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '12px',
        paddingTop: '0'
      }}>
        <h1 className="game-title" style={{fontSize:'24px',marginBottom:'4px'}}>姿势大全</h1>
        <div className="game-title-underline" />
      </div>

      {/* 筛选按钮 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {(['全部', '简单', '中等', '困难'] as const).map(level => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === level ? '#FF375F' : 'rgba(255,255,255,0.1)',
              color: filter === level ? 'white' : 'rgba(255,255,255,0.7)'
            }}
          >
            {level}
          </button>
        ))}
      </div>

      {/* 姿势列表 - 响应式网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '10px'
      }}>
        {filteredList.map(posture => {
          const color = getDifficultyColor(posture.difficulty);
          return (
            <div
              key={posture.id}
              onClick={() => setSelectedPosture(posture)}
              style={{
                backgroundColor: '#1C1C1E',
                borderRadius: '14px',
                padding: '14px',
                cursor: 'pointer',
                border: `1px solid ${color}30`,
                transition: 'transform 0.2s ease',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '100%',
                height: '100px',
                backgroundColor: color + '15',
                borderRadius: '10px',
                padding: '10px',
                marginBottom: '10px',
                border: `1px solid ${color}30`,
                boxSizing: 'border-box'
              }}>
                <PostureIllustration type={posture.id} color={color} />
              </div>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'white',
                marginBottom: '6px'
              }}>{posture.name}</div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.5)'
              }}>
                <span style={{ color }}>{posture.difficulty}</span>
                <span>🔥{posture.heat}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 免责声明 */}
      <div style={{
        marginTop: '24px',
        padding: '12px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.3)',
          lineHeight: 1.5,
          margin: 0
        }}>
          ⚠️ 本内容仅供18岁以上成年情侣娱乐参考，请在双方自愿、安全、健康的前提下进行。如有不适请立即停止。
        </p>
      </div>

      {/* 详情弹窗 */}
      {selectedPosture && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px'
        }}
        onClick={() => setSelectedPosture(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              maxHeight: '88vh',
              backgroundColor: '#1C1C1E',
              borderRadius: '20px',
              padding: '20px',
              overflowY: 'auto',
              position: 'relative'
            }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedPosture(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={16} color="white" />
            </button>

            {/* 标题 */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '100%',
                height: '140px',
                backgroundColor: getDifficultyColor(selectedPosture.difficulty) + '15',
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '12px',
                border: `1px solid ${getDifficultyColor(selectedPosture.difficulty)}30`,
                boxSizing: 'border-box'
              }}>
                <PostureIllustration type={selectedPosture.id} color={getDifficultyColor(selectedPosture.difficulty)} />
              </div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                marginBottom: '10px'
              }}>{selectedPosture.name}</h2>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '11px',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  backgroundColor: getDifficultyColor(selectedPosture.difficulty) + '30',
                  color: getDifficultyColor(selectedPosture.difficulty)
                }}>
                  <Target size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  {selectedPosture.difficulty}
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255,152,0,0.2)',
                  color: '#FF9800'
                }}>
                  <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  {selectedPosture.duration}
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255,55,95,0.2)',
                  color: '#FF375F'
                }}>
                  <Flame size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  {selectedPosture.heat}星热度
                </span>
              </div>
            </div>

            {/* 简介 */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#FF375F',
                marginBottom: '6px'
              }}>📝 简介</div>
              <p style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.6,
                margin: 0
              }}>{selectedPosture.description}</p>
            </div>

            {/* 怎么做 */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#0A84FF',
                marginBottom: '6px'
              }}>🎯 怎么做</div>
              <p style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.6,
                margin: 0,
                padding: '10px',
                backgroundColor: 'rgba(10,132,255,0.1)',
                borderRadius: '10px'
              }}>{selectedPosture.howTo}</p>
            </div>

            {/* 小技巧 */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#FF9800',
                marginBottom: '6px'
              }}>💡 小技巧</div>
              <p style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.6,
                margin: 0,
                padding: '10px',
                backgroundColor: 'rgba(255,152,0,0.1)',
                borderRadius: '10px'
              }}>{selectedPosture.tips}</p>
            </div>

            {/* 适合人群 */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#4CAF50',
                marginBottom: '6px'
              }}>👥 适合人群</div>
              <p style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.6,
                margin: 0,
                padding: '10px',
                backgroundColor: 'rgba(76,175,80,0.1)',
                borderRadius: '10px'
              }}>{selectedPosture.suitable}</p>
            </div>

            {/* 为什么推荐 */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#E91E63',
                marginBottom: '6px'
              }}>💡 为什么推荐</div>
              <p style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.6,
                margin: 0,
                padding: '10px',
                backgroundColor: 'rgba(233,30,99,0.1)',
                borderRadius: '10px'
              }}>{selectedPosture.why}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
