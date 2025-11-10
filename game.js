class CyberPunkGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.gameState = 'idle'; // idle, playing, paused, gameover
        this.score = 0;
        this.lives = 3;
        
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.stars = [];
        
        this.keys = {};
        this.lastShot = 0;
        this.shotCooldown = 200;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createStarfield();
        this.createPlayer();
        this.updateUI();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ' && this.gameState === 'playing') {
                e.preventDefault();
                this.playerShoot();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    createStarfield() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2,
                speed: Math.random() * 2 + 0.5,
                brightness: Math.random()
            });
        }
    }
    
    createPlayer() {
        this.player = new Player(this.width / 2, this.height - 80, this);
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.createPlayer();
        this.updateUI();
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('gameOverScreen').style.display = 'none';
        
        this.gameLoop();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseBtn').textContent = 'RESUME';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseBtn').textContent = 'PAUSE';
            this.gameLoop();
        }
    }
    
    restartGame() {
        this.startGame();
    }
    
    gameOver() {
        this.gameState = 'gameover';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').style.display = 'block';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }
    
    playerShoot() {
        const now = Date.now();
        if (now - this.lastShot > this.shotCooldown) {
            this.bullets.push(new Bullet(this.player.x, this.player.y - 20, 0, -10, 'player', this));
            this.lastShot = now;
            
            // 添加射击粒子效果
            this.createParticles(this.player.x, this.player.y - 20, '#00ffff', 3);
        }
    }
    
    spawnEnemy() {
        if (Math.random() < 0.02 && this.enemies.length < 10) {
            const x = Math.random() * (this.width - 40) + 20;
            const type = Math.random() < 0.7 ? 'basic' : 'advanced';
            this.enemies.push(new Enemy(x, -30, type, this));
        }
    }
    
    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color, this));
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }
    
    handleInput() {
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.moveLeft();
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.moveRight();
        }
        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.player.moveUp();
        }
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.player.moveDown();
        }
    }
    
    checkCollisions() {
        // 子弹与敌机碰撞
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (bullet.owner === 'player') {
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];
                    if (this.isColliding(bullet, enemy)) {
                        this.createParticles(enemy.x, enemy.y, '#ff00ff', 10);
                        this.enemies.splice(j, 1);
                        this.bullets.splice(i, 1);
                        this.score += enemy.points;
                        this.updateUI();
                        break;
                    }
                }
            }
        }
        
        // 敌机子弹与玩家碰撞
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (bullet.owner === 'enemy' && this.isColliding(bullet, this.player)) {
                this.createParticles(this.player.x, this.player.y, '#ff0000', 15);
                this.bullets.splice(i, 1);
                this.lives--;
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
                break;
            }
        }
        
        // 敌机与玩家碰撞
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (this.isColliding(enemy, this.player)) {
                this.createParticles(this.player.x, this.player.y, '#ff0000', 20);
                this.createParticles(enemy.x, enemy.y, '#ff00ff', 15);
                this.enemies.splice(i, 1);
                this.lives--;
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
                break;
            }
        }
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.handleInput();
        this.spawnEnemy();
        
        // 更新星空背景
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        });
        
        // 更新游戏对象
        this.player.update();
        this.enemies.forEach(enemy => enemy.update());
        this.bullets.forEach(bullet => bullet.update());
        this.particles.forEach(particle => particle.update());
        
        // 清理离开屏幕的对象
        this.enemies = this.enemies.filter(enemy => enemy.y < this.height + 50);
        this.bullets = this.bullets.filter(bullet => 
            bullet.y > -10 && bullet.y < this.height + 10
        );
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        this.checkCollisions();
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制星空
        this.stars.forEach(star => {
            this.ctx.fillStyle = `rgba(0, 255, 255, ${star.brightness})`;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        
        // 绘制游戏对象
        this.player.render(this.ctx);
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.particles.forEach(particle => particle.render(this.ctx));
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

class Player {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 5;
        this.game = game;
    }
    
    moveLeft() {
        this.x = Math.max(0, this.x - this.speed);
    }
    
    moveRight() {
        this.x = Math.min(this.game.width - this.width, this.x + this.speed);
    }
    
    moveUp() {
        this.y = Math.max(0, this.y - this.speed);
    }
    
    moveDown() {
        this.y = Math.min(this.game.height - this.height, this.y + this.speed);
    }
    
    update() {
        // 玩家更新逻辑
    }
    
    render(ctx) {
        // 绘制赛博朋克风格的飞机
        ctx.fillStyle = '#00ffff';
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        
        // 飞机主体
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height - 10);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 飞机引擎光晕
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + this.width / 2 - 3, this.y + this.height - 5, 6, 8);
        ctx.shadowBlur = 0;
        
        // 飞机装饰线条
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + 15);
        ctx.lineTo(this.x + this.width - 10, this.y + 15);
        ctx.stroke();
    }
}

class Enemy {
    constructor(x, y, type, game) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.game = game;
        this.width = type === 'basic' ? 30 : 40;
        this.height = type === 'basic' ? 30 : 40;
        this.speed = type === 'basic' ? 2 : 1.5;
        this.points = type === 'basic' ? 10 : 25;
        this.lastShot = Date.now();
        this.shotCooldown = type === 'basic' ? 3000 : 2000;
        this.movePattern = Math.random() < 0.5 ? 'straight' : 'zigzag';
        this.zigzagTimer = 0;
    }
    
    update() {
        this.y += this.speed;
        
        if (this.movePattern === 'zigzag') {
            this.zigzagTimer += 0.1;
            this.x += Math.sin(this.zigzagTimer) * 2;
        }
        
        // 敌机射击
        const now = Date.now();
        if (now - this.lastShot > this.shotCooldown && this.y > 0 && this.y < this.game.height - 100) {
            this.game.bullets.push(new Bullet(this.x + this.width / 2, this.y + this.height, 0, 5, 'enemy', this.game));
            this.lastShot = now;
        }
    }
    
    render(ctx) {
        const color = this.type === 'basic' ? '#ff00ff' : '#ff6600';
        
        ctx.fillStyle = color;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        
        // 敌机主体
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y + 10);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 敌机引擎
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + this.width / 2 - 2, this.y, 4, 6);
        ctx.shadowBlur = 0;
    }
}

class Bullet {
    constructor(x, y, vx, vy, owner, game) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.owner = owner;
        this.width = 4;
        this.height = 10;
        this.game = game;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    render(ctx) {
        const color = this.owner === 'player' ? '#00ffff' : '#ff00ff';
        
        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class Particle {
    constructor(x, y, color, game) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.color = color;
        this.life = 30;
        this.game = game;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.life--;
    }
    
    render(ctx) {
        const alpha = this.life / 30;
        ctx.fillStyle = this.color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        ctx.fillRect(this.x, this.y, 3, 3);
    }
}

// 初始化游戏
window.addEventListener('load', () => {
    const game = new CyberPunkGame();
});