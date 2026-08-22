"use client";
import { useState, useEffect } from 'react';
import PostureCardApp from '@/components/posture-card/PostureCardApp';

export default function PosturePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // 检查localStorage中是否已有验证
    const auth = localStorage.getItem('posture_temp_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '529') {
      localStorage.setItem('posture_temp_auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('密码错误，请重试');
    }
  };

  if (isAuthenticated) {
    return <PostureCardApp />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '360px',
        backgroundColor: '#1C1C1E',
        borderRadius: '20px',
        padding: '32px 24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          margin: 0,
          marginBottom: '8px'
        }}>内容已加密</h2>
        <p style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.5)',
          margin: 0,
          marginBottom: '24px'
        }}>请输入访问密码</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            style={{
              width: '100%',
              height: '44px',
              padding: '0 14px',
              borderRadius: '10px',
              backgroundColor: '#2C2C2E',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '14px',
              marginBottom: '12px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
          {error && (
            <div style={{
              fontSize: '12px',
              color: '#FF453A',
              marginBottom: '12px'
            }}>{error}</div>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              height: '44px',
              borderRadius: '999px',
              backgroundColor: 'white',
              color: 'black',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            确认
          </button>
        </form>
      </div>
    </div>
  );
}
