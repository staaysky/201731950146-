class TankGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.playerTank = null;
        this.enemyTanks = [];
        this.bullets = [];
        this.obstacles = [];
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.keys = {};
        
        this.init();
    }

    init() {
        this.createPlayerTank();
        this.createEnemyTanks();
        this.createObstacles();
        this.attachEventListeners();
        this.gameLoop();
    }

    createPlayerTank() {
        this.playerTank = {
            x: this.width / 2 - 20,
            y: this.height - 80,
            width: 40,
            height: 40,
            speed: 3,
            direction: 'up',
            color: '#27ae60',
            isPlayer: true
        };
    }

    createEnemyTanks() {
        for (let i = 0; i < 3; i++) {
            this.enemyTanks.push({
                x: 100 + i * 200,
                y: 50,
                width: 40,
                height: 40,
                speed: 1.5,
                direction: 'down',
                color: '#e74c3c',
                isPlayer: false,
                lastShot: 0,
                moveTimer: 0
            });
        }
    }

    createObstacles() {
        // 创建一些障碍物
        for (let i = 0; i < 8; i++) {
            this.obstacles.push({
                x: Math.random() * (this.width - 60) + 30,
                y: Math.random() * (this.height - 200) + 100,
                width: 60,
                height: 20,
                color: '#7f8c8d'
            });
        }
    }

    attachEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ') {
                e.preventDefault();
                this.playerShoot();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    playerShoot() {
        if (this.gameOver) return;
        
        const bullet = {
            x: this.playerTank.x + this.playerTank.width / 2 - 3,
            y: this.playerTank.y,
            width: 6,
            height: 10,
            speed: 6,
            direction: this.playerTank.direction,
            isPlayer: true
        };

        // 根据方向调整子弹起始位置
        switch (this.playerTank.direction) {
            case 'up':
                bullet.y = this.playerTank.y - bullet.height;
                bullet.x = this.playerTank.x + this.playerTank.width / 2 - bullet.width / 2;
                break;
            case 'down':
                bullet.y = this.playerTank.y + this.playerTank.height;
                bullet.x = this.playerTank.x + this.playerTank.width / 2 - bullet.width / 2;
                break;
            case 'left':
                bullet.x = this.playerTank.x - bullet.width;
                bullet.y = this.playerTank.y + this.playerTank.height / 2 - bullet.height / 2;
                break;
            case 'right':
                bullet.x = this.playerTank.x + this.playerTank.width;
                bullet.y = this.playerTank.y + this.playerTank.height / 2 - bullet.height / 2;
                break;
        }

        this.bullets.push(bullet);
    }

    enemyShoot(tank) {
        const bullet = {
            x: tank.x + tank.width / 2 - 3,
            y: tank.y + tank.height,
            width: 6,
            height: 10,
            speed: 4,
            direction: tank.direction,
            isPlayer: false
        };

        // 根据方向调整子弹起始位置
        switch (tank.direction) {
            case 'up':
                bullet.y = tank.y - bullet.height;
                bullet.x = tank.x + tank.width / 2 - bullet.width / 2;
                break;
            case 'down':
                bullet.y = tank.y + tank.height;
                bullet.x = tank.x + tank.width / 2 - bullet.width / 2;
                break;
            case 'left':
                bullet.x = tank.x - bullet.width;
                bullet.y = tank.y + tank.height / 2 - bullet.height / 2;
                break;
            case 'right':
                bullet.x = tank.x + tank.width;
                bullet.y = tank.y + tank.height / 2 - bullet.height / 2;
                break;
        }

        this.bullets.push(bullet);
    }

    update() {
        if (this.gameOver) return;

        // 更新玩家坦克
        this.updatePlayerTank();

        // 更新敌方坦克
        this.updateEnemyTanks();

        // 更新子弹
        this.updateBullets();

        // 检查碰撞
        this.checkCollisions();

        // 更新UI
        this.updateUI();
    }

    updatePlayerTank() {
        const tank = this.playerTank;
        let newX = tank.x;
        let newY = tank.y;

        if (this.keys['w']) {
            newY -= tank.speed;
            tank.direction = 'up';
        }
        if (this.keys['s']) {
            newY += tank.speed;
            tank.direction = 'down';
        }
        if (this.keys['a']) {
            newX -= tank.speed;
            tank.direction = 'left';
        }
        if (this.keys['d']) {
            newX += tank.speed;
            tank.direction = 'right';
        }

        // 边界检查
        if (newX >= 0 && newX <= this.width - tank.width) {
            tank.x = newX;
        }
        if (newY >= 0 && newY <= this.height - tank.height) {
            tank.y = newY;
        }

        // 障碍物碰撞检查
        for (const obstacle of this.obstacles) {
            if (this.checkTankObstacleCollision(tank, obstacle)) {
                tank.x = newX === tank.x ? tank.x : tank.x;
                tank.y = newY === tank.y ? tank.y : tank.y;
            }
        }
    }

    updateEnemyTanks() {
        const currentTime = Date.now();
        
        for (const tank of this.enemyTanks) {
            // 移动逻辑
            tank.moveTimer++;
            if (tank.moveTimer > 60) {
                tank.moveTimer = 0;
                // 随机改变方向
                const directions = ['up', 'down', 'left', 'right'];
                tank.direction = directions[Math.floor(Math.random() * directions.length)];
            }

            // 根据方向移动
            let newX = tank.x;
            let newY = tank.y;

            switch (tank.direction) {
                case 'up':
                    newY -= tank.speed;
                    break;
                case 'down':
                    newY += tank.speed;
                    break;
                case 'left':
                    newX -= tank.speed;
                    break;
                case 'right':
                    newX += tank.speed;
                    break;
            }

            // 边界检查
            if (newX >= 0 && newX <= this.width - tank.width) {
                tank.x = newX;
            } else {
                tank.direction = tank.direction === 'left' ? 'right' : 'left';
            }

            if (newY >= 0 && newY <= this.height - tank.height) {
                tank.y = newY;
            } else {
                tank.direction = tank.direction === 'up' ? 'down' : 'up';
            }

            // 随机射击
            if (currentTime - tank.lastShot > 2000 && Math.random() < 0.02) {
                this.enemyShoot(tank);
                tank.lastShot = currentTime;
            }
        }
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            switch (bullet.direction) {
                case 'up':
                    bullet.y -= bullet.speed;
                    break;
                case 'down':
                    bullet.y += bullet.speed;
                    break;
                case 'left':
                    bullet.x -= bullet.speed;
                    break;
                case 'right':
                    bullet.x += bullet.speed;
                    break;
            }

            // 移除超出边界的子弹
            if (bullet.x < 0 || bullet.x > this.width || 
                bullet.y < 0 || bullet.y > this.height) {
                this.bullets.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        // 子弹与坦克碰撞
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            // 检查与玩家坦克碰撞
            if (!bullet.isPlayer && this.checkBulletTankCollision(bullet, this.playerTank)) {
                this.lives--;
                this.bullets.splice(i, 1);
                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.showMessage('游戏结束！');
                }
                continue;
            }

            // 检查与敌方坦克碰撞
            for (let j = this.enemyTanks.length - 1; j >= 0; j--) {
                const tank = this.enemyTanks[j];
                if (bullet.isPlayer && this.checkBulletTankCollision(bullet, tank)) {
                    this.score += 100;
                    this.enemyTanks.splice(j, 1);
                    this.bullets.splice(i, 1);
                    
                    // 添加新的敌方坦克
                    if (this.enemyTanks.length < 3) {
                        this.createEnemyTanks();
                    }
                    break;
                }
            }

            // 检查与障碍物碰撞
            for (const obstacle of this.obstacles) {
                if (this.checkBulletObstacleCollision(bullet, obstacle)) {
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }
    }

    checkBulletTankCollision(bullet, tank) {
        return bullet.x < tank.x + tank.width &&
               bullet.x + bullet.width > tank.x &&
               bullet.y < tank.y + tank.height &&
               bullet.y + bullet.height > tank.y;
    }

    checkTankObstacleCollision(tank, obstacle) {
        return tank.x < obstacle.x + obstacle.width &&
               tank.x + tank.width > obstacle.x &&
               tank.y < obstacle.y + obstacle.height &&
               tank.y + tank.height > obstacle.y;
    }

    checkBulletObstacleCollision(bullet, obstacle) {
        return bullet.x < obstacle.x + obstacle.width &&
               bullet.x + bullet.width > obstacle.x &&
               bullet.y < obstacle.y + obstacle.height &&
               bullet.y + bullet.height > obstacle.y;
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 绘制障碍物
        for (const obstacle of this.obstacles) {
            this.ctx.fillStyle = obstacle.color;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }

        // 绘制玩家坦克
        this.drawTank(this.playerTank);

        // 绘制敌方坦克
        for (const tank of this.enemyTanks) {
            this.drawTank(tank);
        }

        // 绘制子弹
        for (const bullet of this.bullets) {
            this.ctx.fillStyle = bullet.isPlayer ? '#f39c12' : '#e74c3c';
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    }

    drawTank(tank) {
        this.ctx.save();
        this.ctx.translate(tank.x + tank.width / 2, tank.y + tank.height / 2);

        // 根据方向旋转
        let rotation = 0;
        switch (tank.direction) {
            case 'up':
                rotation = 0;
                break;
            case 'right':
                rotation = Math.PI / 2;
                break;
            case 'down':
                rotation = Math.PI;
                break;
            case 'left':
                rotation = -Math.PI / 2;
                break;
        }
        this.ctx.rotate(rotation);

        // 绘制坦克主体
        this.ctx.fillStyle = tank.color;
        this.ctx.fillRect(-tank.width / 2, -tank.height / 2, tank.width, tank.height);

        // 绘制坦克炮管
        this.ctx.fillStyle = tank.color;
        this.ctx.fillRect(-3, -tank.height / 2 - 10, 6, 10);

        this.ctx.restore();
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
        this.playerTank = null;
        this.enemyTanks = [];
        this.bullets = [];
        this.obstacles = [];
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.keys = {};
        
        // 移除游戏结束消息
        const messageElement = document.querySelector('.game-message');
        if (messageElement) {
            document.body.removeChild(messageElement);
        }
        
        this.init();
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new TankGame();
});