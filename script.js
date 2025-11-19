class Fighter {
    constructor(x, y, color, isPlayer = true) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 80;
        this.color = color;
        this.isPlayer = isPlayer;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = 15;
        this.health = 100;
        this.maxHealth = 100;
        this.isJumping = false;
        this.isAttacking = false;
        this.isBlocking = false;
        this.attackCooldown = 0;
        this.attackRange = 70;
        this.attackDamage = 10;
        this.facing = isPlayer ? 1 : -1; // 1为右，-1为左
    }

    update(opponent, canvas) {
        // 重力
        if (this.y < canvas.height - this.height - 50) {
            this.velocityY += 0.8;
        } else {
            this.velocityY = 0;
            this.isJumping = false;
            this.y = canvas.height - this.height - 50;
        }

        // 更新位置
        this.x += this.velocityX;
        this.y += this.velocityY;

        // 边界检测
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));

        // 地面检测
        if (this.y > canvas.height - this.height - 50) {
            this.y = canvas.height - this.height - 50;
            this.velocityY = 0;
            this.isJumping = false;
        }

        // 摩擦力
        this.velocityX *= 0.9;

        // 冷却时间
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        // 面向对手
        if (opponent) {
            this.facing = opponent.x > this.x ? 1 : -1;
        }
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = -this.jumpPower;
            this.isJumping = true;
        }
    }

    moveLeft() {
        this.velocityX = -this.speed;
    }

    moveRight() {
        this.velocityX = this.speed;
    }

    attack(opponent) {
        if (this.attackCooldown <= 0 && !this.isAttacking) {
            this.isAttacking = true;
            this.attackCooldown = 30;
            
            // 检测攻击是否命中
            const distance = Math.abs(this.x - opponent.x);
            if (distance < this.attackRange && 
                Math.abs(this.y - opponent.y) < this.height) {
                if (!opponent.isBlocking) {
                    opponent.takeDamage(this.attackDamage);
                }
            }
            
            setTimeout(() => {
                this.isAttacking = false;
            }, 200);
        }
    }

    block() {
        this.isBlocking = true;
    }

    stopBlocking() {
        this.isBlocking = false;
    }

    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
    }

    draw(ctx) {
        ctx.save();
        
        // 绘制角色
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制头部
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y - 10, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制眼睛
        ctx.fillStyle = 'white';
        const eyeOffset = this.facing * 5;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 + eyeOffset, this.y - 10, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制攻击效果
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            const attackX = this.x + (this.facing > 0 ? this.width : -30);
            ctx.fillRect(attackX, this.y + 20, 30, 20);
        }
        
        // 绘制防御效果
        if (this.isBlocking) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        }
        
        ctx.restore();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOver = false;
        this.timer = 60;
        this.timerInterval = null;
        
        this.player = new Fighter(100, 200, '#ff6b35', true);
        this.opponent = new Fighter(600, 200, '#4169e1', false);
        
        this.keys = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startTimer();
        this.gameLoop();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ' || e.key.toLowerCase() === 'j') {
                this.player.attack(this.opponent);
            }
            
            if (e.key.toLowerCase() === 'k' || e.key === 'Shift') {
                this.player.block();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            
            if (e.key.toLowerCase() === 'k' || e.key === 'Shift') {
                this.player.stopBlocking();
            }
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    handleInput() {
        if (this.gameOver) return;

        // 玩家移动控制
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.moveLeft();
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.player.moveRight();
        }
        if (this.keys['w'] || this.keys['arrowup']) {
            this.player.jump();
        }

        // AI控制
        this.aiControl();
    }

    aiControl() {
        const distance = Math.abs(this.player.x - this.opponent.x);
        
        // 随机行为
        if (Math.random() < 0.02) {
            if (distance > 100) {
                // 接近玩家
                if (this.player.x < this.opponent.x) {
                    this.opponent.moveLeft();
                } else {
                    this.opponent.moveRight();
                }
            } else if (distance < 60) {
                // 保持距离
                if (this.player.x < this.opponent.x) {
                    this.opponent.moveRight();
                } else {
                    this.opponent.moveLeft();
                }
            }
        }
        
        // 随机跳跃
        if (Math.random() < 0.01 && !this.opponent.isJumping) {
            this.opponent.jump();
        }
        
        // 随机攻击
        if (Math.random() < 0.03 && distance < 80) {
            this.opponent.attack(this.player);
        }
        
        // 随机防御
        if (Math.random() < 0.02) {
            if (Math.random() < 0.5) {
                this.opponent.block();
            } else {
                this.opponent.stopBlocking();
            }
        }
    }

    update() {
        if (this.gameOver) return;

        this.handleInput();
        
        this.player.update(this.opponent, this.canvas);
        this.opponent.update(this.player, this.canvas);
        
        this.updateHealthBars();
        this.checkGameOver();
    }

    updateHealthBars() {
        const player1Health = document.getElementById('player1-health');
        const player2Health = document.getElementById('player2-health');
        
        player1Health.style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
        player2Health.style.width = `${(this.opponent.health / this.opponent.maxHealth) * 100}%`;
    }

    checkGameOver() {
        if (this.player.health <= 0 || this.opponent.health <= 0 || this.timer <= 0) {
            this.gameOver = true;
            this.stopTimer();
            
            let message = '';
            if (this.player.health <= 0) {
                message = '电脑获胜！';
            } else if (this.opponent.health <= 0) {
                message = '玩家获胜！';
            } else {
                message = '时间到！';
                if (this.player.health > this.opponent.health) {
                    message += ' 玩家获胜！';
                } else if (this.opponent.health > this.player.health) {
                    message += ' 电脑获胜！';
                } else {
                    message += ' 平局！';
                }
            }
            
            this.showMessage(message);
        }
    }

    showMessage(message) {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = message;
        messageElement.style.display = 'block';
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.gameOver) {
                this.timer--;
                document.getElementById('timer').textContent = this.timer;
                
                if (this.timer <= 0) {
                    this.checkGameOver();
                }
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#98fb98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制地面
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        
        // 绘制角色
        this.player.draw(this.ctx);
        this.opponent.draw(this.ctx);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    restart() {
        this.gameOver = false;
        this.timer = 60;
        this.player = new Fighter(100, 200, '#ff6b35', true);
        this.opponent = new Fighter(600, 200, '#4169e1', false);
        
        document.getElementById('game-message').style.display = 'none';
        document.getElementById('timer').textContent = this.timer;
        
        this.stopTimer();
        this.startTimer();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});