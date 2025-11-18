class PlaneWarGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.stars = [];
        
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.gameOver = false;
        
        this.keys = {};
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 60;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createStars();
        this.createPlayer();
        this.updateUI();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ' && this.gameRunning) {
                this.playerShoot();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    createStars() {
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2,
                speed: Math.random() * 0.5 + 0.5
            });
        }
    }
    
    createPlayer() {
        this.player = {
            x: this.width / 2 - 20,
            y: this.height - 80,
            width: 40,
            height: 40,
            speed: 5,
            color: '#00ff00'
        };
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameOver = false;
        this.score = 0;
        this.lives = 3;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.enemySpawnTimer = 0;
        
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('game-over').classList.add('hidden');
        
        this.updateUI();
        this.gameLoop();
    }
    
    restartGame() {
        this.startGame();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.updateStars();
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updateParticles();
        this.spawnEnemies();
        this.checkCollisions();
        this.updateUI();
        
        if (this.lives <= 0) {
            this.endGame();
        }
    }
    
    updateStars() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        });
    }
    
    updatePlayer() {
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        if (this.keys['ArrowUp'] && this.player.y > 0) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] && this.player.y < this.height - this.player.height) {
            this.player.y += this.player.speed;
        }
    }
    
    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -10;
        });
    }
    
    updateEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            
            if (enemy.type === 'zigzag') {
                enemy.x += Math.sin(enemy.y * 0.05) * 2;
            }
            
            return enemy.y < this.height + 50;
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.size *= 0.98;
            return particle.life > 0;
        });
    }
    
    spawnEnemies() {
        this.enemySpawnTimer++;
        
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.enemySpawnTimer = 0;
            
            const types = ['normal', 'fast', 'zigzag'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            let enemy = {
                x: Math.random() * (this.width - 40),
                y: -40,
                width: 40,
                height: 40,
                type: type,
                color: this.getEnemyColor(type)
            };
            
            switch (type) {
                case 'normal':
                    enemy.speed = 2;
                    enemy.health = 1;
                    enemy.points = 10;
                    break;
                case 'fast':
                    enemy.speed = 4;
                    enemy.health = 1;
                    enemy.points = 20;
                    break;
                case 'zigzag':
                    enemy.speed = 1.5;
                    enemy.health = 2;
                    enemy.points = 30;
                    break;
            }
            
            this.enemies.push(enemy);
        }
        
        // 随着分数增加，敌机生成速度加快
        if (this.score > 100 && this.enemySpawnInterval > 30) {
            this.enemySpawnInterval = 60 - Math.floor(this.score / 100) * 5;
        }
    }
    
    getEnemyColor(type) {
        switch (type) {
            case 'normal': return '#ff0000';
            case 'fast': return '#ff00ff';
            case 'zigzag': return '#ffff00';
            default: return '#ff0000';
        }
    }
    
    playerShoot() {
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 8,
            color: '#00ffff'
        });
    }
    
    checkCollisions() {
        // 子弹与敌机碰撞
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    enemy.health--;
                    
                    if (enemy.health <= 0) {
                        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        this.score += enemy.points;
                        this.enemies.splice(enemyIndex, 1);
                    }
                    
                    this.bullets.splice(bulletIndex, 1);
                }
            });
        });
        
        // 敌机与玩家碰撞
        this.enemies.forEach((enemy, index) => {
            if (this.isColliding(enemy, this.player)) {
                this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                this.enemies.splice(index, 1);
                this.lives--;
            }
        });
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 5 + 2,
                color: `hsl(${Math.random() * 60}, 100%, 50%)`,
                life: 30
            });
        }
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#000033';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制星星背景
        this.drawStars();
        
        // 绘制玩家
        if (this.player) {
            this.drawPlane(this.player);
        }
        
        // 绘制敌机
        this.enemies.forEach(enemy => {
            this.drawPlane(enemy);
        });
        
        // 绘制子弹
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // 绘制粒子效果
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawStars() {
        this.ctx.fillStyle = '#ffffff';
        this.stars.forEach(star => {
            this.ctx.globalAlpha = star.size / 2;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawPlane(plane) {
        this.ctx.fillStyle = plane.color;
        
        // 简单的飞机形状
        this.ctx.beginPath();
        this.ctx.moveTo(plane.x + plane.width / 2, plane.y);
        this.ctx.lineTo(plane.x, plane.y + plane.height);
        this.ctx.lineTo(plane.x + plane.width / 4, plane.y + plane.height * 0.7);
        this.ctx.lineTo(plane.x + plane.width / 2, plane.y + plane.height * 0.8);
        this.ctx.lineTo(plane.x + plane.width * 3 / 4, plane.y + plane.height * 0.7);
        this.ctx.lineTo(plane.x + plane.width, plane.y + plane.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 绘制飞机细节
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(plane.x + plane.width / 2 - 2, plane.y + plane.height * 0.3, 4, 10);
    }
    
    updateUI() {
        document.getElementById('score').textContent = `得分: ${this.score}`;
        document.getElementById('lives').textContent = `生命: ${this.lives}`;
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new PlaneWarGame();
});