class StickmanBadmintonGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = false;
        this.playerScore = 0;
        this.aiScore = 0;
        this.maxScore = 11;
        
        // 游戏对象
        this.player = {
            x: 100,
            y: 200,
            width: 30,
            height: 60,
            speed: 5,
            canHit: true,
            hitCooldown: 0
        };
        
        this.ai = {
            x: 700,
            y: 200,
            width: 30,
            height: 60,
            speed: 3,
            canHit: true,
            hitCooldown: 0
        };
        
        this.shuttlecock = {
            x: 400,
            y: 100,
            radius: 8,
            velocityX: 0,
            velocityY: 0,
            gravity: 0.3,
            maxSpeed: 8,
            trail: []
        };
        
        this.court = {
            netHeight: 100,
            netY: 300
        };
        
        this.keys = {};
        this.particles = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.resetGame();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.resetShuttlecock();
            this.hideMessage();
        }
    }
    
    restartGame() {
        this.playerScore = 0;
        this.aiScore = 0;
        this.updateScoreDisplay();
        this.resetGame();
        this.startGame();
    }
    
    resetGame() {
        this.player.y = 200;
        this.ai.y = 200;
        this.resetShuttlecock();
        this.gameRunning = false;
        this.particles = [];
    }
    
    resetShuttlecock() {
        this.shuttlecock.x = 400;
        this.shuttlecock.y = 100;
        this.shuttlecock.velocityX = (Math.random() > 0.5 ? 1 : -1) * 3;
        this.shuttlecock.velocityY = 2;
        this.shuttlecock.trail = [];
    }
    
    updatePlayer() {
        // 玩家移动
        if (this.keys['w'] && this.player.y > 50) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['s'] && this.player.y < this.canvas.height - this.player.height - 50) {
            this.player.y += this.player.speed;
        }
        
        // 击球冷却
        if (this.player.hitCooldown > 0) {
            this.player.hitCooldown--;
        }
        
        // 空格键击球
        if (this.keys[' '] && this.player.hitCooldown === 0) {
            this.tryPlayerHit();
        }
    }
    
    tryPlayerHit() {
        const distance = Math.sqrt(
            Math.pow(this.shuttlecock.x - (this.player.x + this.player.width / 2), 2) +
            Math.pow(this.shuttlecock.y - (this.player.y + this.player.height / 2), 2)
        );
        
        if (distance < 50 && this.shuttlecock.x < this.canvas.width / 2) {
            this.player.hitCooldown = 30;
            this.shuttlecock.velocityX = 6;
            this.shuttlecock.velocityY = -5 - Math.random() * 3;
            
            // 添加击球特效
            this.createHitEffect(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        }
    }
    
    updateAI() {
        // AI移动逻辑
        const aiCenter = this.ai.y + this.ai.height / 2;
        const shuttlecockY = this.shuttlecock.y;
        
        // 只有当羽毛球在AI一侧时才移动
        if (this.shuttlecock.x > this.canvas.width / 2) {
            if (aiCenter < shuttlecockY - 10) {
                this.ai.y = Math.min(this.ai.y + this.ai.speed, this.canvas.height - this.ai.height - 50);
            } else if (aiCenter > shuttlecockY + 10) {
                this.ai.y = Math.max(this.ai.y - this.ai.speed, 50);
            }
            
            // AI击球
            if (this.ai.hitCooldown === 0) {
                const distance = Math.sqrt(
                    Math.pow(this.shuttlecock.x - (this.ai.x + this.ai.width / 2), 2) +
                    Math.pow(this.shuttlecock.y - (this.ai.y + this.ai.height / 2), 2)
                );
                
                if (distance < 50) {
                    this.ai.hitCooldown = 30;
                    this.shuttlecock.velocityX = -6;
                    this.shuttlecock.velocityY = -5 - Math.random() * 3;
                    
                    // 添加击球特效
                    this.createHitEffect(this.ai.x + this.ai.width / 2, this.ai.y + this.ai.height / 2);
                }
            }
        }
        
        // AI击球冷却
        if (this.ai.hitCooldown > 0) {
            this.ai.hitCooldown--;
        }
    }
    
    updateShuttlecock() {
        if (!this.gameRunning) return;
        
        // 更新轨迹
        this.shuttlecock.trail.push({ x: this.shuttlecock.x, y: this.shuttlecock.y });
        if (this.shuttlecock.trail.length > 10) {
            this.shuttlecock.trail.shift();
        }
        
        // 应用重力
        this.shuttlecock.velocityY += this.shuttlecock.gravity;
        
        // 限制最大速度
        const speed = Math.sqrt(this.shuttlecock.velocityX ** 2 + this.shuttlecock.velocityY ** 2);
        if (speed > this.shuttlecock.maxSpeed) {
            this.shuttlecock.velocityX = (this.shuttlecock.velocityX / speed) * this.shuttlecock.maxSpeed;
            this.shuttlecock.velocityY = (this.shuttlecock.velocityY / speed) * this.shuttlecock.maxSpeed;
        }
        
        // 更新位置
        this.shuttlecock.x += this.shuttlecock.velocityX;
        this.shuttlecock.y += this.shuttlecock.velocityY;
        
        // 边界碰撞
        if (this.shuttlecock.y > this.canvas.height - 20) {
            this.shuttlecock.y = this.canvas.height - 20;
            this.shuttlecock.velocityY *= -0.6; // 弹跳衰减
        }
        
        if (this.shuttlecock.y < 20) {
            this.shuttlecock.y = 20;
            this.shuttlecock.velocityY *= -0.8;
        }
        
        // 网的碰撞检测
        if (Math.abs(this.shuttlecock.x - this.canvas.width / 2) < 10 && 
            this.shuttlecock.y > this.court.netY) {
            this.shuttlecock.velocityX *= -0.8;
            this.shuttlecock.x = this.canvas.width / 2 + (this.shuttlecock.velocityX > 0 ? 10 : -10);
        }
        
        // 得分检测
        if (this.shuttlecock.x < 0) {
            this.aiScore++;
            this.updateScoreDisplay();
            this.checkGameEnd();
            this.resetShuttlecock();
        } else if (this.shuttlecock.x > this.canvas.width) {
            this.playerScore++;
            this.updateScoreDisplay();
            this.checkGameEnd();
            this.resetShuttlecock();
        }
    }
    
    createHitEffect(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 20,
                color: `hsl(${Math.random() * 60 + 30}, 100%, 50%)`
            });
        }
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });
    }
    
    drawStickman(x, y, isPlayer) {
        const ctx = this.ctx;
        ctx.strokeStyle = isPlayer ? '#FF6B6B' : '#4ECDC4';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        // 头
        ctx.beginPath();
        ctx.arc(x, y - 40, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // 身体
        ctx.beginPath();
        ctx.moveTo(x, y - 30);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // 手臂
        const armAngle = isPlayer && this.keys[' '] ? -0.5 : 0.2;
        ctx.beginPath();
        ctx.moveTo(x, y - 20);
        ctx.lineTo(x - 15, y - 10 + Math.sin(armAngle) * 5);
        ctx.moveTo(x, y - 20);
        ctx.lineTo(x + 15, y - 10 + Math.sin(-armAngle) * 5);
        ctx.stroke();
        
        // 腿
        const legAnimation = Math.sin(Date.now() * 0.01) * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 10, y + 20 + legAnimation);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 10, y + 20 - legAnimation);
        ctx.stroke();
        
        // 球拍
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x + (isPlayer ? 15 : -15), y - 10);
        ctx.lineTo(x + (isPlayer ? 25 : -25), y - 20);
        ctx.stroke();
        
        // 拍面
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x + (isPlayer ? 30 : -30), y - 25, 12, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    drawShuttlecock() {
        const ctx = this.ctx;
        
        // 绘制轨迹
        this.shuttlecock.trail.forEach((point, index) => {
            ctx.globalAlpha = index / this.shuttlecock.trail.length * 0.5;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.shuttlecock.radius * (index / this.shuttlecock.trail.length), 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        
        // 绘制羽毛球
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.shuttlecock.x, this.shuttlecock.y, this.shuttlecock.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 羽毛
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 / 4) * i + Date.now() * 0.01;
            ctx.beginPath();
            ctx.moveTo(this.shuttlecock.x, this.shuttlecock.y);
            ctx.lineTo(
                this.shuttlecock.x + Math.cos(angle) * 15,
                this.shuttlecock.y + Math.sin(angle) * 15
            );
            ctx.stroke();
        }
    }
    
    drawCourt() {
        const ctx = this.ctx;
        
        // 地面
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        
        // 球场线
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        
        // 边界线
        ctx.strokeRect(20, this.canvas.height - 50, this.canvas.width - 40, -300);
        
        // 中线
        ctx.beginPath();
        ctx.moveTo(this.canvas.width / 2, this.canvas.height - 50);
        ctx.lineTo(this.canvas.width / 2, this.canvas.height - 350);
        ctx.stroke();
        
        // 网
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.canvas.width / 2 - 1, this.canvas.height - 50);
        ctx.lineTo(this.canvas.width / 2 - 1, this.court.netY);
        ctx.lineTo(this.canvas.width / 2 + 1, this.court.netY);
        ctx.lineTo(this.canvas.width / 2 + 1, this.canvas.height - 50);
        ctx.stroke();
        
        // 网格
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
            const y = this.canvas.height - 50 - i * 10;
            ctx.beginPath();
            ctx.moveTo(this.canvas.width / 2 - 1, y);
            ctx.lineTo(this.canvas.width / 2 + 1, y);
            ctx.stroke();
        }
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life / 20;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制球场
        this.drawCourt();
        
        // 绘制火柴人
        this.drawStickman(this.player.x, this.player.y + this.player.height / 2, true);
        this.drawStickman(this.ai.x, this.ai.y + this.ai.height / 2, false);
        
        // 绘制羽毛球
        this.drawShuttlecock();
        
        // 绘制粒子特效
        this.drawParticles();
        
        // 如果游戏未开始，显示提示
        if (!this.gameRunning) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('点击"开始游戏"开始比赛！', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    updateScoreDisplay() {
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('ai-score').textContent = this.aiScore;
    }
    
    checkGameEnd() {
        if (this.playerScore >= this.maxScore) {
            this.gameRunning = false;
            this.showMessage('恭喜你赢了！🎉');
        } else if (this.aiScore >= this.maxScore) {
            this.gameRunning = false;
            this.showMessage('电脑获胜！再试一次吧！');
        }
    }
    
    showMessage(text) {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = text;
        messageElement.style.display = 'block';
    }
    
    hideMessage() {
        const messageElement = document.getElementById('game-message');
        messageElement.style.display = 'none';
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.updatePlayer();
            this.updateAI();
            this.updateShuttlecock();
            this.updateParticles();
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new StickmanBadmintonGame();
});