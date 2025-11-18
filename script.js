class PlaneWarGame {
    constructor() {
        this.gameArea = document.getElementById('game-area');
        this.playerPlane = document.getElementById('player-plane');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.playerX = 175;
        this.bullets = [];
        this.enemies = [];
        this.explosions = [];
        
        this.gameLoop = null;
        this.enemySpawnInterval = null;
        this.bulletInterval = null;
        
        this.init();
    }

    init() {
        this.createStars();
        this.attachEventListeners();
        this.startGame();
    }

    createStars() {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars';
        
        for (let i = 0; i < 20; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 400 + 'px';
            star.style.top = Math.random() * 600 + 'px';
            star.style.animationDelay = Math.random() * 3 + 's';
            starsContainer.appendChild(star);
        }
        
        this.gameArea.appendChild(starsContainer);
    }

    attachEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            if (e.key === 'ArrowLeft' && this.playerX > 0) {
                this.playerX -= 20;
                this.updatePlayerPosition();
            } else if (e.key === 'ArrowRight' && this.playerX < 350) {
                this.playerX += 20;
                this.updatePlayerPosition();
            }
        });

        // 鼠标控制
        this.gameArea.addEventListener('mousemove', (e) => {
            if (this.gameOver) return;
            
            const rect = this.gameArea.getBoundingClientRect();
            const x = e.clientX - rect.left;
            this.playerX = Math.max(0, Math.min(350, x - 25));
            this.updatePlayerPosition();
        });

        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('restart-btn-2').addEventListener('click', () => {
            this.restart();
        });
    }

    updatePlayerPosition() {
        this.playerPlane.style.left = this.playerX + 'px';
    }

    startGame() {
        this.gameOver = false;
        this.score = 0;
        this.lives = 3;
        this.playerX = 175;
        this.updatePlayerPosition();
        this.updateUI();
        
        // 游戏主循环
        this.gameLoop = setInterval(() => {
            this.update();
        }, 1000 / 60);
        
        // 生成敌机
        this.enemySpawnInterval = setInterval(() => {
            this.spawnEnemy();
        }, 1500);
        
        // 自动发射子弹
        this.bulletInterval = setInterval(() => {
            this.shootBullet();
        }, 500);
    }

    update() {
        this.updateBullets();
        this.updateEnemies();
        this.updateExplosions();
        this.checkCollisions();
    }

    spawnEnemy() {
        if (this.gameOver) return;
        
        const enemy = document.createElement('div');
        enemy.className = 'enemy-plane';
        enemy.style.left = Math.random() * 360 + 'px';
        enemy.style.top = '-40px';
        
        this.gameArea.appendChild(enemy);
        this.enemies.push({
            element: enemy,
            x: parseFloat(enemy.style.left),
            y: -40,
            speed: 2 + Math.random() * 2
        });
    }

    shootBullet() {
        if (this.gameOver) return;
        
        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        bullet.style.left = (this.playerX + 23) + 'px';
        bullet.style.bottom = '60px';
        
        this.gameArea.appendChild(bullet);
        this.bullets.push({
            element: bullet,
            x: this.playerX + 23,
            y: 540,
            speed: 8
        });
    }

    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            bullet.element.style.bottom = (600 - bullet.y) + 'px';
            
            if (bullet.y < -15) {
                this.gameArea.removeChild(bullet.element);
                return false;
            }
            
            return true;
        });
    }

    updateEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            enemy.element.style.top = enemy.y + 'px';
            
            if (enemy.y > 640) {
                this.gameArea.removeChild(enemy.element);
                this.lives--;
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.endGame();
                }
                
                return false;
            }
            
            return true;
        });
    }

    updateExplosions() {
        this.explosions = this.explosions.filter(explosion => {
            explosion.life--;
            
            if (explosion.life <= 0) {
                this.gameArea.removeChild(explosion.element);
                return false;
            }
            
            return true;
        });
    }

    checkCollisions() {
        // 检查子弹与敌机的碰撞
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (this.isColliding(
                    bullet.x, bullet.y, 4, 15,
                    enemy.x, enemy.y, 40, 40
                )) {
                    // 创建爆炸效果
                    this.createExplosion(enemy.x + 20, enemy.y + 20);
                    
                    // 移除子弹和敌机
                    this.gameArea.removeChild(bullet.element);
                    this.gameArea.removeChild(enemy.element);
                    
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    
                    // 增加分数
                    this.score += 10;
                    this.updateUI();
                    
                    break;
                }
            }
        }
        
        // 检查玩家与敌机的碰撞
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (this.isColliding(
                this.playerX, 540, 50, 50,
                enemy.x, enemy.y, 40, 40
            )) {
                // 创建爆炸效果
                this.createExplosion(enemy.x + 20, enemy.y + 20);
                
                // 移除敌机
                this.gameArea.removeChild(enemy.element);
                this.enemies.splice(i, 1);
                
                // 减少生命值
                this.lives--;
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.endGame();
                }
                
                break;
            }
        }
    }

    isColliding(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 &&
               x1 + w1 > x2 &&
               y1 < y2 + h2 &&
               y1 + h1 > y2;
    }

    createExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = (x - 30) + 'px';
        explosion.style.top = (y - 30) + 'px';
        
        this.gameArea.appendChild(explosion);
        this.explosions.push({
            element: explosion,
            life: 30
        });
    }

    updateUI() {
        this.scoreElement.textContent = `得分: ${this.score}`;
        this.livesElement.textContent = `生命: ${this.lives}`;
    }

    endGame() {
        this.gameOver = true;
        
        clearInterval(this.gameLoop);
        clearInterval(this.enemySpawnInterval);
        clearInterval(this.bulletInterval);
        
        this.finalScoreElement.textContent = `最终得分: ${this.score}`;
        this.gameOverElement.style.display = 'flex';
    }

    restart() {
        // 清理游戏元素
        this.bullets.forEach(bullet => {
            if (bullet.element.parentNode) {
                this.gameArea.removeChild(bullet.element);
            }
        });
        
        this.enemies.forEach(enemy => {
            if (enemy.element.parentNode) {
                this.gameArea.removeChild(enemy.element);
            }
        });
        
        this.explosions.forEach(explosion => {
            if (explosion.element.parentNode) {
                this.gameArea.removeChild(explosion.element);
            }
        });
        
        this.bullets = [];
        this.enemies = [];
        this.explosions = [];
        
        // 隐藏游戏结束界面
        this.gameOverElement.style.display = 'none';
        
        // 重新开始游戏
        this.startGame();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new PlaneWarGame();
});