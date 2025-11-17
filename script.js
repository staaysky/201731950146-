class Tank {
    constructor(x, y, color, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.color = color;
        this.direction = 0; // 0: 上, 1: 右, 2: 下, 3: 左
        this.speed = 2;
        this.isPlayer = isPlayer;
        this.bullets = [];
        this.lastShot = 0;
        this.shotCooldown = 500;
        this.health = 1;
    }

    move(dx, dy, canvasWidth, canvasHeight) {
        const newX = this.x + dx * this.speed;
        const newY = this.y + dy * this.speed;
        
        if (newX >= 0 && newX <= canvasWidth - this.width) {
            this.x = newX;
        }
        if (newY >= 0 && newY <= canvasHeight - this.height) {
            this.y = newY;
        }
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot < this.shotCooldown) return null;
        
        this.lastShot = now;
        let bulletDx = 0, bulletDy = 0;
        
        switch(this.direction) {
            case 0: bulletDy = -1; break; // 上
            case 1: bulletDx = 1; break;  // 右
            case 2: bulletDy = 1; break;  // 下
            case 3: bulletDx = -1; break; // 左
        }
        
        const bulletX = this.x + this.width / 2 - 2;
        const bulletY = this.y + this.height / 2 - 2;
        
        return new Bullet(bulletX, bulletY, bulletDx, bulletDy, this.color);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.direction * Math.PI / 2);
        
        // 坦克主体
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // 坦克炮管
        ctx.fillStyle = '#333';
        ctx.fillRect(-3, -this.height / 2 - 10, 6, 15);
        
        // 坦克履带
        ctx.fillStyle = '#222';
        ctx.fillRect(-this.width / 2 - 3, -this.height / 2, 3, this.height);
        ctx.fillRect(this.width / 2, -this.height / 2, 3, this.height);
        
        ctx.restore();
    }
}

class Bullet {
    constructor(x, y, dx, dy, color) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 4;
        this.dx = dx;
        this.dy = dy;
        this.speed = 5;
        this.color = color;
        this.active = true;
    }

    update(canvasWidth, canvasHeight) {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
        
        if (this.x < 0 || this.x > canvasWidth || 
            this.y < 0 || this.y > canvasHeight) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class EnemyTank extends Tank {
    constructor(x, y) {
        super(x, y, '#e74c3c', false);
        this.moveTimer = 0;
        this.directionChangeTimer = 0;
        this.shootTimer = 0;
    }

    updateAI(canvasWidth, canvasHeight, playerTank) {
        this.moveTimer++;
        this.directionChangeTimer++;
        this.shootTimer++;
        
        // 随机改变方向
        if (this.directionChangeTimer > 60 + Math.random() * 60) {
            this.direction = Math.floor(Math.random() * 4);
            this.directionChangeTimer = 0;
        }
        
        // 根据方向移动
        let dx = 0, dy = 0;
        switch(this.direction) {
            case 0: dy = -1; break; // 上
            case 1: dx = 1; break;  // 右
            case 2: dy = 1; break;  // 下
            case 3: dx = -1; break; // 左
        }
        
        this.move(dx, dy, canvasWidth, canvasHeight);
        
        // 随机射击
        if (this.shootTimer > 100 + Math.random() * 50) {
            return this.shoot();
            this.shootTimer = 0;
        }
        
        return null;
    }
}

class TankBattleGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.playerTank = new Tank(400, 500, '#27ae60', true);
        this.enemyTanks = [];
        this.allBullets = [];
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.keys = {};
        
        this.init();
    }

    init() {
        this.spawnEnemyTanks();
        this.attachEventListeners();
        this.gameLoop();
    }

    spawnEnemyTanks() {
        for (let i = 0; i < 3; i++) {
            const x = 100 + i * 250;
            const y = 50;
            this.enemyTanks.push(new EnemyTank(x, y));
        }
    }

    attachEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    handleInput() {
        if (this.gameOver) return;
        
        let dx = 0, dy = 0;
        
        if (this.keys['w']) {
            dy = -1;
            this.playerTank.direction = 0;
        }
        if (this.keys['s']) {
            dy = 1;
            this.playerTank.direction = 2;
        }
        if (this.keys['a']) {
            dx = -1;
            this.playerTank.direction = 3;
        }
        if (this.keys['d']) {
            dx = 1;
            this.playerTank.direction = 1;
        }
        
        this.playerTank.move(dx, dy, this.canvas.width, this.canvas.height);
        
        if (this.keys[' ']) {
            const bullet = this.playerTank.shoot();
            if (bullet) {
                this.allBullets.push(bullet);
            }
        }
    }

    update() {
        if (this.gameOver) return;
        
        // 更新敌方坦克AI
        this.enemyTanks.forEach(enemy => {
            const bullet = enemy.updateAI(this.canvas.width, this.canvas.height, this.playerTank);
            if (bullet) {
                this.allBullets.push(bullet);
            }
        });
        
        // 更新所有子弹
        this.allBullets = this.allBullets.filter(bullet => {
            bullet.update(this.canvas.width, this.canvas.height);
            return bullet.active;
        });
        
        // 碰撞检测
        this.checkCollisions();
        
        // 更新UI
        this.updateUI();
    }

    checkCollisions() {
        // 玩家子弹与敌方坦克的碰撞
        this.playerTank.bullets.forEach((bullet, bulletIndex) => {
            this.enemyTanks.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    bullet.active = false;
                    enemy.health--;
                    if (enemy.health <= 0) {
                        this.enemyTanks.splice(enemyIndex, 1);
                        this.score += 100;
                    }
                }
            });
        });
        
        // 所有子弹与玩家的碰撞
        this.allBullets.forEach((bullet, index) => {
            if (bullet.color !== this.playerTank.color && this.isColliding(bullet, this.playerTank)) {
                bullet.active = false;
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.showMessage('游戏结束！');
                }
            }
        });
    }

    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格背景
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
        
        // 绘制玩家坦克
        this.playerTank.draw(this.ctx);
        
        // 绘制敌方坦克
        this.enemyTanks.forEach(enemy => enemy.draw(this.ctx));
        
        // 绘制所有子弹
        this.allBullets.forEach(bullet => bullet.draw(this.ctx));
    }

    updateUI() {
        document.getElementById('score').textContent = `得分: ${this.score}`;
        document.getElementById('lives').textContent = `生命: ${this.lives}`;
    }

    showMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'game-message';
        messageElement.textContent = message;
        messageElement.style.display = 'block';
        document.body.appendChild(messageElement);
    }

    restart() {
        this.playerTank = new Tank(400, 500, '#27ae60', true);
        this.enemyTanks = [];
        this.allBullets = [];
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.keys = {};
        
        const existingMessage = document.querySelector('.game-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        this.spawnEnemyTanks();
    }

    gameLoop() {
        this.handleInput();
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new TankBattleGame();
});