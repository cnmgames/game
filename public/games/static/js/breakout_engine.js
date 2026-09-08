/* ==================== 打砖块 - 纯逻辑引擎（经典单人，平台无关） ====================
 * 经典单人打砖块：底部挡板左右移动接球，球反弹击碎顶部砖块，掉球扣命。
 * 不依赖 DOM / canvas / 键盘事件，只做纯状态 + 规则，可独立单测。
 *
 * 视图层（games/breakout.js）负责：Canvas 渲染、键盘输入、RAF 循环、DOM 显示。
 * 单机双人同屏 = 左右两个场地各跑一个引擎；联机对抗 = 各自一个场地，只同步比分/存活。
 *
 * update(keys) 接收按键状态 { left, right }，返回「事件」对象：
 *   { type: 'none' }                                无特殊事件
 *   { type: 'brick_hit', score }                    击碎一块砖
 *   { type: 'win', score, lives }                   清空全部砖块
 *   { type: 'ball_lost', lives }                    球掉落但仍有生命（已重置并回到 idle）
 *   { type: 'lose', score, lives }                  生命耗尽
 */
class BreakoutEngine {
    constructor(width = 480, height = 440) {
        this.WIDTH = width;
        this.HEIGHT = height;
        this.paddleWidth = 80;
        this.paddleHeight = 12;
        this.paddleSpeed = 6;
        this.ballRadius = 6;
        this.ballSpeed = 4.5;
        this.brickRows = 5;
        this.brickCols = 8;
        this.brickHeight = 18;
        this.brickPadding = 4;
        this.brickOffsetTop = 40;
        this.reset();
    }

    /* ---------- 状态 ---------- */
    reset() {
        this.score = 0;
        this.lives = 3;
        this.state = 'idle'; // idle | playing | win | lose
        this.ball = { x: 0, y: 0, vx: 0, vy: 0, radius: this.ballRadius, speed: this.ballSpeed };
        this.paddle = { x: 0, y: 0, width: this.paddleWidth, height: this.paddleHeight, speed: this.paddleSpeed };
        this.bricks = [];
        this.totalBricks = 0;
    }

    initBricks() {
        this.bricks = [];
        const brickWidth = (this.WIDTH - (this.brickCols + 1) * this.brickPadding) / this.brickCols;
        const colors = ['#E75480', '#FF6B6B', '#FF9800', '#4CAF50', '#2196F3'];
        for (let r = 0; r < this.brickRows; r++) {
            for (let c = 0; c < this.brickCols; c++) {
                this.bricks.push({
                    x: c * (brickWidth + this.brickPadding) + this.brickPadding,
                    y: this.brickOffsetTop + r * (this.brickHeight + this.brickPadding),
                    width: brickWidth,
                    height: this.brickHeight,
                    color: colors[r % colors.length],
                    alive: true,
                });
                this.totalBricks++;
            }
        }
    }

    resetPaddle() {
        this.paddle.x = this.WIDTH / 2 - this.paddle.width / 2;
        this.paddle.y = this.HEIGHT - 30;
    }

    resetBall() {
        this.ball.x = this.paddle.x + this.paddle.width / 2;
        this.ball.y = this.paddle.y - this.ball.radius - 1;
        const angle = Math.PI / 4;  // 向上偏右 45 度
        this.ball.vx = this.ball.speed * Math.sin(angle);
        this.ball.vy = -this.ball.speed * Math.cos(angle);
    }

    /* ---------- 单帧更新 ---------- */
    update(keys) {
        if (this.state !== 'playing') return { type: 'none' };

        // 挡板左右移动
        if (keys.left) this.paddle.x -= this.paddle.speed;
        if (keys.right) this.paddle.x += this.paddle.speed;
        this.paddle.x = Math.max(0, Math.min(this.WIDTH - this.paddle.width, this.paddle.x));

        // 球移动
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // 墙壁碰撞（左/右/上）
        if (this.ball.x - this.ball.radius <= 0) {
            this.ball.x = this.ball.radius;
            this.ball.vx = Math.abs(this.ball.vx);
        }
        if (this.ball.x + this.ball.radius >= this.WIDTH) {
            this.ball.x = this.WIDTH - this.ball.radius;
            this.ball.vx = -Math.abs(this.ball.vx);
        }
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.y = this.ball.radius;
            this.ball.vy = Math.abs(this.ball.vy);
        }

        // 挡板碰撞（球下落时）
        if (this.ball.vy > 0 &&
            this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.y + this.ball.radius <= this.paddle.y + this.paddle.height &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddle.width) {
            this.ball.y = this.paddle.y - this.ball.radius;
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            const angle = (hitPos - 0.5) * Math.PI * 0.8;  // -72° ~ +72°
            this.ball.vx = this.ball.speed * Math.sin(angle);
            this.ball.vy = -this.ball.speed * Math.cos(angle);
        }

        // 球掉落（底部）→ 扣生命
        if (this.ball.y - this.ball.radius >= this.HEIGHT) {
            this.lives--;
            if (this.lives <= 0) {
                this.state = 'lose';
                return { type: 'lose', score: this.score, lives: this.lives };
            }
            this.resetBall();
            this.resetPaddle();
            this.state = 'idle';
            return { type: 'ball_lost', lives: this.lives };
        }

        // 砖块碰撞（只处理第一块命中的砖）
        for (const brick of this.bricks) {
            if (!brick.alive) continue;
            if (this.ball.x + this.ball.radius > brick.x &&
                this.ball.x - this.ball.radius < brick.x + brick.width &&
                this.ball.y + this.ball.radius > brick.y &&
                this.ball.y - this.ball.radius < brick.y + brick.height) {
                brick.alive = false;
                this.score += 10;
                this.totalBricks--;

                // 判定碰撞方向
                const overlapLeft = (this.ball.x + this.ball.radius) - brick.x;
                const overlapRight = (brick.x + brick.width) - (this.ball.x - this.ball.radius);
                const overlapTop = (this.ball.y + this.ball.radius) - brick.y;
                const overlapBottom = (brick.y + brick.height) - (this.ball.y - this.ball.radius);
                const minX = Math.min(overlapLeft, overlapRight);
                const minY = Math.min(overlapTop, overlapBottom);
                if (minX < minY) this.ball.vx = -this.ball.vx;
                else this.ball.vy = -this.ball.vy;

                if (this.totalBricks <= 0) {
                    this.state = 'win';
                    return { type: 'win', score: this.score, lives: this.lives };
                }
                return { type: 'brick_hit', score: this.score };
            }
        }

        return { type: 'none' };
    }
}

export default BreakoutEngine;
