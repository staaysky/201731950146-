class BadmintonGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 游戏状态
        this.gameStarted = false;
        this.gamePaused = false;
        this.playerScore = 0;
        this.computerScore = 0;
        
        // 火柴人玩家
        this.player = {
            x: 100,
            y: this.height / 2,
            width: 30,
            height: 60,
            speed: 5,
            jumpPower: 0,
            isJumping: false,
            armAngle: 0,
            isHitting: false
        };
        
        // 电脑火柴人
        this.computer = {
            x: this.width - 130,
            y: this.height / 2,
            width: 30,
            height: 60,
            speed: 3,
            armAngle: 0,
            isHitting: false
        };
        
        // 羽毛球
        this.shuttlecock = {
            x: this.width / 2,
            y: 100,
            vx: 0,
            vy: 0,
            radius: 8,
            gravity: 0.3,
            speed: 8,
            trail: []
        };
        
        // 球网
        this.net = {
            x: this.width / 2 - 5,
            y: this.height - 150,
            width: 10,
            height: 150
        };
        
        // 控制
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.attachEventListeners();
        this.resetBall();
        this.gameLoop();
    }
    
    attachEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (e.key === ' ') {
                e.preventDefault();
                if (!this.gameStarted) {
                    this.startGame();
                } else {
                    this.playerHit();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }
    
    startGame() {
        this.gameStarted = true;
        this.resetBall();
        this.shuttlecock.vx = this.shuttlecock.speed;
        this.shuttlecock.vy = -2;
        document.getElementById('game-status').textContent = '游戏进行中';
    }
    
    resetBall() {
        this.shuttlecock.x = this.width / 2;
        this.shuttlecock.y = 100;
        this.shuttlecock.vx = 0;
        this.shuttlecock.vy = 0;
        this.shuttlecock.trail = [];
    }
    
    playerHit() {
        if (!this.player.isHitting && this.canPlayerHit()) {
            this.player.isHitting = true;
            this.player.armAngle = -Math.PI / 4;
            
            // 计算击球角度和速度
            const dx = this.shuttlecock.x - this.player.x;
            const dy = this.shuttlecock.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 80) {
                const angle = Math.atan2(dy, dx);
                this.shuttlecock.vx = Math.cos(angle) * this.shuttlecock.speed;
                this.shuttlecock.vy = Math.sin(angle) * this.shuttlecock.speed - 3;
            }
            
            setTimeout(() => {
                this.player.isHitting = false;
                this.player.armAngle = 0;
            }, 200);
        }
    }
    
    canPlayerHit() {
        const dx = Math.abs(this.shuttlecock.x - this.player.x);
        const dy = Math.abs(this.shuttlecock.y - this.player.y);
        return dx < 80 && dy < 100;
    }
    
    update() {
        if (!this.gameStarted) return;
        
        // 玩家控制
        if (this.keys['ArrowUp'] && this.player.y > 50) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] && this.player.y < this.height - 100) {
            this.player.y += this.player.speed;
        }
        
        // 电脑AI
        this.updateComputer();
        
        // 更新羽毛球
        this.updateShuttlecock();
        
        // 检查得分
        this.checkScore();
        
        // 更新羽毛球轨迹
        this.shuttlecock.trail.push({x: this.shuttlecock.x, y: this.shuttlecock.y});
        if (this.shuttlecock.trail.length > 10) {
            this.shuttlecock.trail.shift();
        }
    }
    
    updateComputer() {
        const targetY = this.shuttlecock.y;
        const diff = targetY - this.computer.y;
        
        if (Math.abs(diff) > 5) {
            if (diff > 0 && this.computer.y < this.height - 100) {
                this.computer.y += this.computer.speed;
            } else if (diff < 0 && this.computer.y > 50) {
                this.computer.y -= this.computer.speed;
            }
        }
        
        // 电脑击球
        const dx = Math.abs(this.shuttlecock.x - this.computer.x);
        const dy = Math.abs(this.shuttlecock.y - this.computer.y);
        
        if (dx < 80 && dy < 100 && this.shuttlecock.vx < 0 && !this.computer.isHitting) {
            this.computer.isHitting = true;
            this.computer.armAngle = -Math.PI / 4;
            
            const angle = Math.atan2(
                this.shuttlecock.y - this.computer.y,
                this.shuttlecock.x - this.computer.x
            );
            this.shuttlecock.vx = Math.cos(angle) * this.shuttlecock.speed;
            this.shuttlecock.vy = Math.sin(angle) * this.shuttlecock.speed - 3;
            
            setTimeout(() => {
                this.computer.isHitting = false;
                this.computer.armAngle = 0;
            }, 200);
        }
    }
    
    updateShuttlecock() {
        this.shuttlecock.vy += this.shuttlecock.gravity;
        this.shuttlecock.x += this.shuttlecock.vx;
        this.shuttlecock.y += this.shuttlecock.vy;
        
        // 边界碰撞
        if (this.shuttlecock.y > this.height - 20) {
            this.shuttlecock.y = this.height - 20;
            this.shuttlecock.vy *= -0.6;
            this.shuttlecock.vx *= 0.8;
        }
        
        if (this.shuttlecock.y < 20) {
            this.shuttlecock.y = 20;
            this.shuttlecock.vy *= -0.6;
        }
        
        // 球网碰撞
        if (this.shuttlecock.x > this.net.x && 
            this.shuttlecock.x < this.net.x + this.net.width &&
            this.shuttlecock.y > this.net.y) {
            this.shuttlecock.vx *= -0.8;
            this.shuttlecock.x = this.shuttlecock.vx > 0 ? this.net.x + this.net.width : this.net.x;
        }
    }
    
    checkScore() {
        // 玩家得分
        if (this.shuttlecock.x > this.width - 20) {
            this.playerScore++;
            this.updateScore();
            this.resetBall();
            this.shuttlecock.vx = -this.shuttlecock.speed;
            this.shuttlecock.vy = -2;
        }
        
        // 电脑得分
        if (this.shuttlecock.x < 20) {
            this.computerScore++;
            this.updateScore();
            this.resetBall();
            this.shuttlecock.vx = this.shuttlecock.speed;
            this.shuttlecock.vy = -2;
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = `玩家: ${this.playerScore} | 电脑: ${this.computerScore}`;
        
        // 检查游戏结束
        if (this.playerScore >= 11 || this.computerScore >= 11) {
            this.gameStarted = false;
            const winner = this.playerScore >= 11 ? '玩家' : '电脑';
            document.getElementById('game-status').textContent = `${winner} 获胜！按空格键重新开始`;
        }
    }
    
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制球场
        this.drawCourt();
        
        // 绘制球网
        this.drawNet();
        
        // 绘制羽毛球轨迹
        this.drawTrail();
        
        // 绘制羽毛球
        this.drawShuttlecock();
        
        // 绘制火柴人
        this.drawStickFigure(this.player, '#4169e1');
        this.drawStickFigure(this.computer, '#dc143c');
    }
    
    drawCourt() {
        // 地面
        this.ctx.fillStyle = '#8fbc8f';
        this.ctx.fillRect(0, this.height - 20, this.width, 20);
        
        // 边界线
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height - 20);
        this.ctx.lineTo(this.width, this.height - 20);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawNet() {
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(this.net.x, this.net.y, this.net.width, this.net.height);
        
        // 网格
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.net.height; i += 10) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.net.x, this.net.y + i);
            this.ctx.lineTo(this.net.x + this.net.width, this.net.y + i);
            this.ctx.stroke();
        }
    }
    
    drawTrail() {
        this.shuttlecock.trail.forEach((point, index) => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${index * 0.1})`;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, this.shuttlecock.radius * (index * 0.1), 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawShuttlecock() {
        // 球体
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(this.shuttlecock.x, this.shuttlecock.y, this.shuttlecock.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 羽毛
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 / 4) * i + Date.now() * 0.005;
            this.ctx.beginPath();
            this.ctx.moveTo(this.shuttlecock.x, this.shuttlecock.y);
            this.ctx.lineTo(
                this.shuttlecock.x + Math.cos(angle) * 12,
                this.shuttlecock.y + Math.sin(angle) * 12
            );
            this.ctx.stroke();
        }
    }
    
    drawStickFigure(stickFigure, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        
        const x = stickFigure.x;
        const y = stickFigure.y;
        
        // 头
        this.ctx.beginPath();
        this.ctx.arc(x, y - 40, 8, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 身体
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 32);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
        // 左腿
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x - 10, y + 20);
        this.ctx.stroke();
        
        // 右腿
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 10, y + 20);
        this.ctx.stroke();
        
        // 手臂（击球动画）
        const armAngle = stickFigure.armAngle || 0;
        const isHitting = stickFigure.isHitting;
        
        if (isHitting) {
            // 击球手臂
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 20);
            this.ctx.lineTo(x + Math.cos(armAngle) * 25, y - 20 + Math.sin(armAngle) * 25);
            this.ctx.stroke();
            
            // 球拍
            this.ctx.fillStyle = '#8b4513';
            this.ctx.fillRect(
                x + Math.cos(armAngle) * 25 - 3,
                y - 20 + Math.sin(armAngle) * 25 - 15,
                6, 30
            );
        } else {
            // 普通手臂
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 20);
            this.ctx.lineTo(x - 15, y - 10);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 20);
            this.ctx.lineTo(x + 15, y - 10);
            this.ctx.stroke();
        }
    }
    
    restart() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.gameStarted = false;
        this.player.y = this.height / 2;
        this.computer.y = this.height / 2;
        this.updateScore();
        this.resetBall();
        document.getElementById('game-status').textContent = '按空格键开始游戏';
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new BadmintonGame();
});