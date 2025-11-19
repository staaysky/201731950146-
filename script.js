class StickmanBadminton {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 游戏状态
        this.gameRunning = true;
        this.playerScore = 0;
        this.aiScore = 0;
        
        // 玩家火柴人
        this.player = {
            x: 100,
            y: this.height - 100,
            width: 30,
            height: 60,
            speed: 5,
            jumping: false,
            jumpVelocity: 0,
            hitting: false,
            hitCooldown: 0
        };
        
        // AI火柴人
        this.ai = {
            x: this.width - 130,
            y: this.height - 100,
            width: 30,
            height: 60,
            speed: 3,
            jumping: false,
            jumpVelocity: 0,
            hitting: false,
            hitCooldown: 0
        };
        
        // 羽毛球
        this.shuttlecock = {
            x: this.width / 2,
            y: 100,
            vx: 3,
            vy: 0,
            radius: 8,
            gravity: 0.3,
            maxSpeed: 8
        };
        
        // 球网
        this.net = {
            x: this.width / 2 - 5,
            y: this.height - 150,
            width: 10,
            height: 100
        };
        
        // 控制键状态
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.attachEventListeners();
        this.gameLoop();
    }
    
    attachEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // 空格键击球
            if (e.key === ' ') {
                e.preventDefault();
                this.playerHit();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }
    
    playerHit() {
        if (this.player.hitCooldown > 0) return;
        
        const distance = Math.sqrt(
            Math.pow(this.shuttlecock.x - (this.player.x + this.player.width/2), 2) + 
            Math.pow(this.shuttlecock.y - (this.player.y + this.player.height/2), 2)
        );
        
        if (distance < 50) {
            this.shuttlecock.vx = Math.abs(this.shuttlecock.vx) + 2;
            this.shuttlecock.vy = -8 - Math.random() * 4;
            this.player.hitCooldown = 30;
            this.player.hitting = true;
            
            // 限制最大速度
            if (this.shuttlecock.vx > this.shuttlecock.maxSpeed) {
                this.shuttlecock.vx = this.shuttlecock.maxSpeed;
            }
        }
    }
    
    aiHit() {
        if (this.ai.hitCooldown > 0) return;
        
        const distance = Math.sqrt(
            Math.pow(this.shuttlecock.x - (this.ai.x + this.ai.width/2), 2) + 
            Math.pow(this.shuttlecock.y - (this.ai.y + this.ai.height/2), 2)
        );
        
        if (distance < 50) {
            this.shuttlecock.vx = -Math.abs(this.shuttlecock.vx) - 2;
            this.shuttlecock.vy = -8 - Math.random() * 4;
            this.ai.hitCooldown = 30;
            this.ai.hitting = true;
            
            // 限制最大速度
            if (Math.abs(this.shuttlecock.vx) > this.shuttlecock.maxSpeed) {
                this.shuttlecock.vx = -this.shuttlecock.maxSpeed;
            }
        }
    }
    
    updatePlayer() {
        // 左右移动
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.player.x += this.player.speed;
        }
        
        // 跳跃
        if ((this.keys['w'] || this.keys['arrowup']) && !this.player.jumping) {
            this.player.jumping = true;
            this.player.jumpVelocity = -12;
        }
        
        // 应用重力
        if (this.player.jumping) {
            this.player.y += this.player.jumpVelocity;
            this.player.jumpVelocity += 0.8;
            
            // 落地检测
            if (this.player.y >= this.height - 100) {
                this.player.y = this.height - 100;
                this.player.jumping = false;
                this.player.jumpVelocity = 0;
            }
        }
        
        // 边界限制
        this.player.x = Math.max(0, Math.min(this.width/2 - this.player.width - 10, this.player.x));
        
        // 冷却时间递减
        if (this.player.hitCooldown > 0) {
            this.player.hitCooldown--;
            if (this.player.hitCooldown === 0) {
                this.player.hitting = false;
            }
        }
    }
    
    updateAI() {
        // AI移动逻辑
        const targetX = this.shuttlecock.x - this.ai.width/2;
        const diff = targetX - this.ai.x;
        
        if (Math.abs(diff) > 5) {
            if (diff > 0) {
                this.ai.x += Math.min(this.ai.speed, diff);
            } else {
                this.ai.x -= Math.min(this.ai.speed, -diff);
            }
        }
        
        // AI跳跃逻辑
        if (this.shuttlecock.y < this.ai.y + 50 && 
            this.shuttlecock.x > this.width/2 && 
            !this.ai.jumping) {
            this.ai.jumping = true;
            this.ai.jumpVelocity = -10;
        }
        
        // 应用重力
        if (this.ai.jumping) {
            this.ai.y += this.ai.jumpVelocity;
            this.ai.jumpVelocity += 0.8;
            
            // 落地检测
            if (this.ai.y >= this.height - 100) {
                this.ai.y = this.height - 100;
                this.ai.jumping = false;
                this.ai.jumpVelocity = 0;
            }
        }
        
        // 边界限制
        this.ai.x = Math.max(this.width/2 + 10, Math.min(this.width - this.ai.width, this.ai.x));
        
        // AI自动击球
        if (this.shuttlecock.x > this.width/2 && this.shuttlecock.vx > 0) {
            this.aiHit();
        }
        
        // 冷却时间递减
        if (this.ai.hitCooldown > 0) {
            this.ai.hitCooldown--;
            if (this.ai.hitCooldown === 0) {
                this.ai.hitting = false;
            }
        }
    }
    
    updateShuttlecock() {
        // 更新位置
        this.shuttlecock.x += this.shuttlecock.vx;
        this.shuttlecock.y += this.shuttlecock.vy;
        
        // 应用重力
        this.shuttlecock.vy += this.shuttlecock.gravity;
        
        // 地面弹跳
        if (this.shuttlecock.y > this.height - 20) {
            this.shuttlecock.y = this.height - 20;
            this.shuttlecock.vy *= -0.7;
            this.shuttlecock.vx *= 0.9;
        }
        
        // 墙壁反弹
        if (this.shuttlecock.x < this.shuttlecock.radius || 
            this.shuttlecock.x > this.width - this.shuttlecock.radius) {
            this.shuttlecock.vx *= -1;
            this.shuttlecock.x = Math.max(this.shuttlecock.radius, 
                Math.min(this.width - this.shuttlecock.radius, this.shuttlecock.x));
        }
        
        // 球网碰撞检测
        if (this.shuttlecock.x > this.net.x && 
            this.shuttlecock.x < this.net.x + this.net.width &&
            this.shuttlecock.y > this.net.y) {
            this.shuttlecock.vx *= -1;
        }
        
        // 得分检测
        if (this.shuttlecock.y > this.height - 20) {
            if (this.shuttlecock.x < this.width/2) {
                this.aiScore++;
                this.updateScore();
                this.resetShuttlecock();
            } else {
                this.playerScore++;
                this.updateScore();
                this.resetShuttlecock();
            }
        }
    }
    
    resetShuttlecock() {
        this.shuttlecock.x = this.width / 2;
        this.shuttlecock.y = 100;
        this.shuttlecock.vx = (Math.random() > 0.5 ? 1 : -1) * 3;
        this.shuttlecock.vy = 0;
    }
    
    updateScore() {
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('ai-score').textContent = this.aiScore;
        
        // 检查游戏结束
        if (this.playerScore >= 11 || this.aiScore >= 11) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        const winner = this.playerScore >= 11 ? '玩家' : '电脑';
        this.showMessage(`${winner} 获胜！`);
    }
    
    showMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'game-message';
        messageElement.textContent = message;
        messageElement.style.display = 'block';
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.style.display = 'none';
            document.body.removeChild(messageElement);
        }, 3000);
    }
    
    restart() {
        this.playerScore = 0;
        this.aiScore = 0;
        this.gameRunning = true;
        this.updateScore();
        this.resetShuttlecock();
        this.player.x = 100;
        this.player.y = this.height - 100;
        this.ai.x = this.width - 130;
        this.ai.y = this.height - 100;
    }
    
    drawStickman(x, y, isHitting) {
        const ctx = this.ctx;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        // 头
        ctx.beginPath();
        ctx.arc(x + 15, y + 10, 8, 0, Math.PI * 2);
        ctx.stroke();
        
        // 身体
        ctx.beginPath();
        ctx.moveTo(x + 15, y + 18);
        ctx.lineTo(x + 15, y + 40);
        ctx.stroke();
        
        // 手臂
        ctx.beginPath();
        if (isHitting) {
            // 击球动作
            ctx.moveTo(x + 15, y + 25);
            ctx.lineTo(x + 25, y + 15);
            ctx.lineTo(x + 35, y + 5);
            
            // 球拍
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x + 35, y + 5);
            ctx.lineTo(x + 40, y - 5);
            ctx.stroke();
            
            // 拍面
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(x + 42, y - 8, 8, 12, 0, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // 正常手臂
            ctx.moveTo(x + 15, y + 25);
            ctx.lineTo(x + 5, y + 35);
            ctx.moveTo(x + 15, y + 25);
            ctx.lineTo(x + 25, y + 35);
        }
        ctx.stroke();
        
        // 腿
        ctx.beginPath();
        ctx.moveTo(x + 15, y + 40);
        ctx.lineTo(x + 8, y + 55);
        ctx.moveTo(x + 15, y + 40);
        ctx.lineTo(x + 22, y + 55);
        ctx.stroke();
    }
    
    drawShuttlecock() {
        const ctx = this.ctx;
        
        // 球头
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.shuttlecock.x, this.shuttlecock.y, this.shuttlecock.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 羽毛
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const featherX = this.shuttlecock.x + Math.cos(angle) * (this.shuttlecock.radius + 3);
            const featherY = this.shuttlecock.y + Math.sin(angle) * (this.shuttlecock.radius + 3);
            
            ctx.beginPath();
            ctx.moveTo(this.shuttlecock.x, this.shuttlecock.y);
            ctx.lineTo(featherX, featherY);
            ctx.stroke();
        }
    }
    
    drawNet() {
        const ctx = this.ctx;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.net.x, this.net.y, this.net.width, this.net.height);
        
        // 网格纹理
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.net.height; i += 10) {
            ctx.beginPath();
            ctx.moveTo(this.net.x, this.net.y + i);
            ctx.lineTo(this.net.x + this.net.width, this.net.y + i);
            ctx.stroke();
        }
        
        // 网顶横杆
        ctx.fillStyle = '#555';
        ctx.fillRect(this.net.x - 2, this.net.y - 3, this.net.width + 4, 3);
    }
    
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制球场背景
        this.drawCourt();
        
        // 绘制球场线
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.width/2, 0);
        this.ctx.lineTo(this.width/2, this.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 绘制球网
        this.drawNet();
        
        // 绘制火柴人
        this.drawStickman(this.player.x, this.player.y, this.player.hitting);
        this.drawStickman(this.ai.x, this.ai.y, this.ai.hitting);
        
        // 绘制羽毛球
        this.drawShuttlecock();
        
        // 绘制得分提示
        if (!this.gameRunning) {
            this.drawWinMessage();
        }
    }
    
    drawCourt() {
        const ctx = this.ctx;
        
        // 绘制球场边界
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, this.width - 40, this.height - 40);
        
        // 绘制发球线
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, 150);
        ctx.lineTo(this.width/2 - 5, 150);
        ctx.moveTo(this.width/2 + 5, 150);
        ctx.lineTo(this.width - 20, 150);
        ctx.stroke();
    }
    
    drawWinMessage() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        const winner = this.playerScore >= 11 ? '玩家获胜！' : '电脑获胜！';
        ctx.fillText(winner, this.width/2, this.height/2);
        
        ctx.font = '24px Arial';
        ctx.fillText('点击"重新开始"继续游戏', this.width/2, this.height/2 + 50);
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.updatePlayer();
            this.updateAI();
            this.updateShuttlecock();
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new StickmanBadminton();
});