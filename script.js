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
        this.gameRunning = false;
        this.playerX = 50;
        this.bullets = [];
        this.enemies = [];
        this.explosions = [];
        this.clouds = [];
        this.keys = {};
        
        this.enemySpawnInterval = 2000;
        this.enemySpeed = 2;
        this.bulletSpeed = 8;
        this.playerSpeed = 5;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startGame();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.shootBullet();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('restart-game-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }

    startGame() {
        this.gameRunning = true;
        this.gameOverElement.style.display = 'none';
        this.updateDisplay();
        this.createClouds();
        this.gameLoop();
        this.spawnEnemies();
    }

    createClouds() {
        for (let i = 0; i < 3; i++) {
            this.createCloud();
        }
    }

    createCloud() {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        const size = Math.random() * 40 + 30;
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size * 0.6}px`;
        cloud.style.left = `${Math.random() * 100}%`;
        cloud.style.top = `${Math.random() * 50}%`;
        
        cloud.style.setProperty('--cloud-size', `${size * 0.7}px`);
        cloud.style.setProperty('--cloud-left', `${size * 0.3}px`);
        cloud.style.setProperty('--cloud-top', `${size * 0.2}px`);
        
        this.gameArea.appendChild(cloud);
        this.clouds.push({
            element: cloud,
            x: parseFloat(cloud.style.left),
            y: parseFloat(cloud.style.top),
            speed: Math.random() * 0.5 + 0.2
        });
    }

    gameLoop() {
        if (!this.gameRunning) return;
        
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updateClouds();
        this.updateExplosions();
        this.checkCollisions();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    updatePlayer() {
        if (this.keys['ArrowLeft'] && this.playerX > 5) {
            this.playerX -= this.playerSpeed;
        }
        if (this.keys['ArrowRight'] && this.playerX < 95) {
            this.playerX += this.playerSpeed;
        }
        
        this.playerPlane.style.left = `${this.playerX}%`;
    }

    shootBullet() {
        if (!this.gameRunning) return;
        
        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        const playerRect = this.playerPlane.getBoundingClientRect();
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        
        bullet.style.left = `${playerRect.left - gameAreaRect.left + playerRect.width / 2 - 2}px`;
        bullet.style.top = `${playerRect.top - gameAreaRect.top - 15}px`;
        
        this.gameArea.appendChild(bullet);
        this.bullets.push({
            element: bullet,
            x: parseFloat(bullet.style.left),
            y: parseFloat(bullet.style.top)
        });
    }

    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= this.bulletSpeed;
            bullet.element.style.top = `${bullet.y}px`;
            
            if (bullet.y < -20) {
                bullet.element.remove();
                return false;
            }
            return true;
        });
    }

    spawnEnemies() {
        if (!this.gameRunning) return;
        
        const enemy = document.createElement('div');
        enemy.className = 'enemy-plane';
        const x = Math.random() * 90 + 5;
        
        enemy.style.left = `${x}%`;
        enemy.style.top = '-50px';
        
        this.gameArea.appendChild(enemy);
        this.enemies.push({
            element: enemy,
            x: x,
            y: -50
        });
        
        setTimeout(() => this.spawnEnemies(), this.enemySpawnInterval);
    }

    updateEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += this.enemySpeed;
            enemy.element.style.top = `${enemy.y}px`;
            
            if (enemy.y > window.innerHeight) {
                enemy.element.remove();
                return false;
            }
            return true;
        });
    }

    updateClouds() {
        this.clouds.forEach(cloud => {
            cloud.y += cloud.speed;
            cloud.element.style.top = `${cloud.y}%`;
            
            if (cloud.y > 100) {
                cloud.y = -10;
                cloud.x = Math.random() * 100;
                cloud.element.style.left = `${cloud.x}%`;
            }
        });
    }

    createExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = `${x}px`;
        explosion.style.top = `${y}px`;
        
        this.gameArea.appendChild(explosion);
        this.explosions.push({
            element: explosion,
            timer: 30
        });
    }

    updateExplosions() {
        this.explosions = this.explosions.filter(explosion => {
            explosion.timer--;
            if (explosion.timer <= 0) {
                explosion.element.remove();
                return false;
            }
            return true;
        });
    }

    checkCollisions() {
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy, 30, 40)) {
                    this.createExplosion(enemy.x, enemy.y);
                    bullet.element.remove();
                    enemy.element.remove();
                    this.bullets.splice(bulletIndex, 1);
                    this.enemies.splice(enemyIndex, 1);
                    this.score += 10;
                    this.updateDisplay();
                }
            });
        });

        this.enemies.forEach((enemy, enemyIndex) => {
            const playerRect = this.playerPlane.getBoundingClientRect();
            const gameAreaRect = this.gameArea.getBoundingClientRect();
            const playerX = playerRect.left - gameAreaRect.left;
            const playerY = playerRect.top - gameAreaRect.top;
            
            if (this.isColliding(
                {x: enemy.x, y: enemy.y},
                {x: playerX, y: playerY},
                40, 50
            )) {
                this.createExplosion(enemy.x, enemy.y);
                enemy.element.remove();
                this.enemies.splice(enemyIndex, 1);
                this.lives--;
                this.updateDisplay();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });
    }

    isColliding(obj1, obj2, threshold1, threshold2) {
        const distance = Math.sqrt(
            Math.pow(obj1.x - obj2.x, 2) + 
            Math.pow(obj1.y - obj2.y, 2)
        );
        return distance < (threshold1 + threshold2) / 2;
    }

    updateDisplay() {
        this.scoreElement.textContent = `得分: ${this.score}`;
        this.livesElement.textContent = `生命: ${this.lives}`;
    }

    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = `最终得分: ${this.score}`;
        this.gameOverElement.style.display = 'flex';
    }

    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.playerX = 50;
        this.bullets.forEach(bullet => bullet.element.remove());
        this.enemies.forEach(enemy => enemy.element.remove());
        this.explosions.forEach(explosion => explosion.element.remove());
        this.bullets = [];
        this.enemies = [];
        this.explosions = [];
        this.keys = {};
        
        this.updateDisplay();
        this.startGame();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new PlaneWarGame();
});