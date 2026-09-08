import EventBus from '../event_bus.js';

/* ==================== 飘动背景 ==================== */
class FloatingBackground {
    constructor() {
        this.canvas = document.getElementById('floating-bg');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this._specialStar = null;
        this._mouse = { x: -100, y: -100 };
        this._hovering = false;
        this.frameCount = 0;
        this.animId = null;

        this._resize();
        window.addEventListener('resize', () => this._resize());

        // 鼠标跟踪：监听 window（canvas 是 pointer-events:none，收不到事件）
        this._onMouseMove = (e) => {
            this._mouse.x = e.clientX;
            this._mouse.y = e.clientY;
        };
        this._onClick = (e) => {
            // 直接用点击坐标同步判断是否命中星芒，不依赖帧循环里的 _hovering。
            // 触屏设备无真正的 mousemove，合成事件时序下 _hovering 在首次点击时
            // 尚未更新，导致需双击才触发；而移动端双击是缩放手势，二者冲突。
            // 改为按坐标命中即可单击触发彩蛋。
            const s = this._specialStar;
            if (!s) return;
            const dx = e.clientX - s.x;
            const dy = e.clientY - s.y;
            if (Math.sqrt(dx * dx + dy * dy) < s.size * 1.5) {
                EventBus.emit('easter_egg:trigger');
            }
        };
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('click', this._onClick);

        this._initParticles();
        this._animate();
    }

    _resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.w = this.canvas.width;
        this.h = this.canvas.height;
    }

    _initParticles() {
        const colors = [
            '#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB',
            '#B5EAD7', '#C7CEEA', '#F8B4D9', '#FFD93D',
            '#A0E7E5', '#FF8A80', '#B388FF', '#FFE082',
        ];
        // 普通粒子：更多、更显眼
        for (let i = 0; i < 60; i++) {
            this.particles.push({
                x: Math.random() * this.w,
                y: Math.random() * this.h,
                size: 10 + Math.random() * 24,
                speed: 0.3 + Math.random() * 0.9,
                opacity: 0.07 + Math.random() * 0.12,
                wobbleAmp: 0.3 + Math.random() * 1.2,
                wobbleSpeed: 0.01 + Math.random() * 0.03,
                wobbleOffset: Math.random() * Math.PI * 2,
                shape: ['heart', 'circle', 'diamond', 'star'][Math.floor(Math.random() * 4)],
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        // 特殊金色星芒：混入粒子中，作为彩蛋入口
        this._specialStar = {
            x: Math.random() * this.w * 0.8 + this.w * 0.1,
            y: Math.random() * this.h * 0.6 + this.h * 0.2,
            size: 18,
            speed: 0.35,
            opacity: 0.15,
            wobbleAmp: 0.6,
            wobbleSpeed: 0.015,
            wobbleOffset: Math.random() * Math.PI * 2,
            glowPhase: 0,
        };
    }

    _animate() {
        this.frameCount++;
        this.ctx.clearRect(0, 0, this.w, this.h);

        // 绘制普通粒子
        for (const p of this.particles) {
            p.y -= p.speed;
            p.x += Math.sin(this.frameCount * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp;

            if (p.y < -p.size || p.x < -p.size || p.x > this.w + p.size) {
                p.y = this.h + 10 + Math.random() * 60;
                p.x = Math.random() * this.w;
            }

            this.ctx.save();
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fillStyle = p.color;
            this.ctx.translate(p.x, p.y);
            this._drawShape(p.shape, p.size);
            this.ctx.restore();
        }

        // 绘制特殊金色星芒
        if (this._specialStar) {
            const s = this._specialStar;
            s.y -= s.speed;
            s.x += Math.sin(this.frameCount * s.wobbleSpeed + s.wobbleOffset) * s.wobbleAmp;
            s.glowPhase += 0.02;

            if (s.y < -s.size || s.x < -s.size || s.x > this.w + s.size) {
                s.y = this.h + 10 + Math.random() * 60;
                s.x = Math.random() * this.w;
            }

            // 检测鼠标悬停
            const dx = this._mouse.x - s.x;
            const dy = this._mouse.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            this._hovering = dist < s.size * 1.5;

            // 光晕
            const glowAlpha = this._hovering
                ? 0.25 + Math.sin(s.glowPhase) * 0.1
                : 0.1 + Math.sin(s.glowPhase) * 0.05;

            this.ctx.save();
            this.ctx.globalAlpha = glowAlpha;
            this.ctx.fillStyle = '#FFD700';
            this.ctx.translate(s.x, s.y);
            this.ctx.beginPath();
            this.ctx.arc(0, 0, s.size * 1.2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            // 星芒主体
            const starAlpha = this._hovering
                ? 0.35 + Math.sin(s.glowPhase) * 0.15
                : 0.18 + Math.sin(s.glowPhase) * 0.06;

            this.ctx.save();
            this.ctx.globalAlpha = starAlpha;
            this.ctx.fillStyle = '#FFD700';
            this.ctx.translate(s.x, s.y);
            this._drawStar(s.size);
            this.ctx.restore();

            // 悬停时光标提示（设置在 body，canvas 无法接收事件）
            document.body.style.cursor = this._hovering ? 'pointer' : 'default';
        }

        this.animId = requestAnimationFrame(() => this._animate());
    }

    _drawShape(shape, size) {
        switch (shape) {
            case 'heart':
                this.ctx.beginPath();
                this.ctx.moveTo(0, size * 0.3);
                this.ctx.bezierCurveTo(-size * 0.5, -size * 0.3, -size * 0.5, -size * 0.8, 0, -size * 0.3);
                this.ctx.bezierCurveTo(size * 0.5, -size * 0.8, size * 0.5, -size * 0.3, 0, size * 0.3);
                this.ctx.fill();
                break;
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'diamond':
                this.ctx.beginPath();
                this.ctx.moveTo(0, -size * 0.4);
                this.ctx.lineTo(size * 0.3, 0);
                this.ctx.lineTo(0, size * 0.4);
                this.ctx.lineTo(-size * 0.3, 0);
                this.ctx.closePath();
                this.ctx.fill();
                break;
            case 'star':
                this._drawStar(size);
                break;
        }
    }

    _drawStar(size) {
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? size * 0.4 : size * 0.18;
            this.ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FloatingBackground();
});