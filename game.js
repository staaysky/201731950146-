// 游戏配置
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

// 游戏状态
let gameState = 'menu'; // menu, playing, paused, gameover
let score = 0;
let lives = 3;
let level = 1;
let soundEnabled = true;
let animationId;

// 粒子系统
class Particle {
    constructor(x, y, color, velocity) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.size = Math.random() * 3 + 1;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
        this.size *= 0.99;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

// 玩家飞机类
class Player {
    constructor() {
        this.width = 60;
        this.height = 80;
        this.x = GAME_WIDTH / 2 - this.width / 2;
        this.y = GAME_HEIGHT - this.height - 20;
        this.speed = 5;
        this.bullets = [];
        this.lastShot = 0;
        this.shotCooldown = 200;
        this.color = '#00ffff';
    }

    draw() {
        // 绘制赛博朋克风格的飞机
        ctx.save();
        
        // 飞机主体
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        
        // 机身
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width * 0.8, this.y + this.height * 0.3);
        ctx.lineTo(this.x + this.width * 0.8, this.y + this.height * 0.7);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x + this.width * 0.2, this.y + this.height * 0.7);
        ctx.lineTo(this.x + this.width * 0.2, this.y + this.height * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // 机翼
        ctx.fillStyle = '#ff00ff';
        ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height * 0.4);
        ctx.lineTo(this.x + this.width * 0.3, this.y + this.height * 0.5);
        ctx.lineTo(this.x + this.width * 0.3, this.y + this.height * 0.7);
        ctx.lineTo(this.x, this.y + this.height * 0.6);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + this.height * 0.4);
        ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.5);
        ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.7);
        ctx.lineTo(this.x + this.width, this.y + this.height * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // 引擎光晕
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x + this.width * 0.3, this.y + this.height, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + this.width * 0.7, this.y + this.height, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) {
            this.x -= this.speed;
        }
        if (direction === 'right' && this.x < GAME_WIDTH - this.width) {
            this.x += this.speed;
        }
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot > this.shotCooldown) {
            this.bullets.push(new Bullet(this.x + this.width / 2, this.y, -8, '#00ffff'));
            this.lastShot = now;
            createShootEffect(this.x + this.width / 2, this.y);
            soundSystem.playShoot();
        }
    }

    update() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.y > -10;
        });
    }
}

// 子弹类
class Bullet {
    constructor(x, y, velocityY, color = '#00ffff') {
        this.x = x;
        this.y = y;
        this.velocityY = velocityY;
        this.width = 4;
        this.height = 12;
        this.color = color;
    }

    update() {
        this.y += this.velocityY;
    }

    draw() {
        ctx.save();
        
        // 子弹光晕
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.width * 2);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.width * 2, this.y - this.height, this.width * 4, this.height * 3);
        
        // 子弹主体
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
        
        ctx.restore();
    }
}

// 敌机类
class Enemy {
    constructor(x, y) {
        this.width = 50;
        this.height = 60;
        this.x = x;
        this.y = y;
        this.speed = 2 + Math.random() * 2;
        this.color = '#ff00ff';
        this.bullets = [];
        this.lastShot = Date.now();
        this.shotCooldown = 2000 + Math.random() * 1000;
        this.movePattern = Math.random() > 0.5 ? 'straight' : 'zigzag';
        this.zigzagTimer = 0;
    }

    draw() {
        ctx.save();
        
        // 敌机主体
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        
        // 机身
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x + this.width * 0.8, this.y + this.height * 0.7);
        ctx.lineTo(this.x + this.width * 0.8, this.y + this.height * 0.3);
        ctx.lineTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width * 0.2, this.y + this.height * 0.3);
        ctx.lineTo(this.x + this.width * 0.2, this.y + this.height * 0.7);
        ctx.closePath();
        ctx.fill();
        
        // 机翼
        ctx.fillStyle = '#ff00aa';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height * 0.6);
        ctx.lineTo(this.x + this.width * 0.3, this.y + this.height * 0.5);
        ctx.lineTo(this.x + this.width * 0.3, this.y + this.height * 0.3);
        ctx.lineTo(this.x, this.y + this.height * 0.4);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + this.height * 0.6);
        ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.5);
        ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.3);
        ctx.lineTo(this.x + this.width, this.y + this.height * 0.4);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    update() {
        // 移动模式
        if (this.movePattern === 'straight') {
            this.y += this.speed;
        } else {
            this.y += this.speed;
            this.zigzagTimer += 0.05;
            this.x += Math.sin(this.zigzagTimer) * 2;
        }
        
        // 射击
        const now = Date.now();
        if (now - this.lastShot > this.shotCooldown) {
            enemy.bullets.push(new Bullet(this.x + this.width / 2, this.y + this.height, 4, '#ff00ff'));
            this.lastShot = now;
            soundSystem.playShoot();
        }
        
        // 更新子弹
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.y < GAME_HEIGHT + 10;
        });
    }
}

// 游戏对象
let player;
let enemies = [];
let particles = [];
let enemySpawnTimer = 0;
let enemySpawnInterval = 120;
let screenShake = 0;
let powerUps = [];
let powerUpSpawnTimer = 0;

// 创建射击效果
function createShootEffect(x, y) {
    for (let i = 0; i < 5; i++) {
        particles.push(new Particle(x, y, '#00ffff', {
            x: (Math.random() - 0.5) * 4,
            y: Math.random() * 2 + 1
        }));
    }
}

// 屏幕震动效果
function addScreenShake(intensity = 5) {
    screenShake = intensity;
}

// 创建爆炸效果
function createExplosion(x, y, color = '#ff00ff') {
    addScreenShake(3);
    for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const speed = Math.random() * 8 + 2;
        particles.push(new Particle(x, y, color, {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        }));
    }
    
    // 添加额外的火花效果
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(x, y, '#ffffff', {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10
        }));
    }
    
    soundSystem.playExplosion();
}

// 碰撞检测
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 键盘控制
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 处理输入
function handleInput() {
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.move('left');
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.move('right');
    }
    if (keys[' ']) {
        player.shoot();
    }
}

// 生成敌机
function spawnEnemy() {
    enemySpawnTimer++;
    if (enemySpawnTimer >= enemySpawnInterval) {
        const x = Math.random() * (GAME_WIDTH - 50);
        enemies.push(new Enemy(x, -60));
        enemySpawnTimer = 0;
        // 随着等级增加，生成速度加快
        enemySpawnInterval = Math.max(30, 120 - level * 10);
    }
}

// 道具类
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type; // 'rapidFire', 'shield', 'multiShot'
        this.speed = 2;
        this.angle = 0;
        this.collected = false;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);
        
        // 绘制道具外框
        ctx.strokeStyle = '#ffff00';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // 根据类型绘制不同图标
        ctx.fillStyle = '#ffff00';
        if (this.type === 'rapidFire') {
            // 快速射击图标
            ctx.fillRect(-2, -10, 4, 20);
            ctx.fillRect(-8, -6, 16, 3);
            ctx.fillRect(-8, 3, 16, 3);
        } else if (this.type === 'shield') {
            // 护盾图标
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(-10, 5);
            ctx.lineTo(10, 5);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'multiShot') {
            // 多重射击图标
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(-8 + i * 8, -10, 3, 15);
            }
        }
        
        ctx.restore();
        this.angle += 0.05;
    }

    update() {
        this.y += this.speed;
    }

    applyEffect(player) {
        if (this.type === 'rapidFire') {
            player.shotCooldown = 100;
            setTimeout(() => {
                if (player) player.shotCooldown = 200;
            }, 5000);
        } else if (this.type === 'shield') {
            // 护盾效果可以在这里实现
            lives = Math.min(lives + 1, 5);
            updateUI();
        } else if (this.type === 'multiShot') {
            // 多重射击效果可以在这里实现
        }
        soundSystem.playPowerUp();
    }
}

// 生成道具
function spawnPowerUp() {
    powerUpSpawnTimer++;
    if (powerUpSpawnTimer >= 600) { // 每10秒生成一个道具
        const x = Math.random() * (GAME_WIDTH - 30);
        const types = ['rapidFire', 'shield', 'multiShot'];
        const type = types[Math.floor(Math.random() * types.length)];
        powerUps.push(new PowerUp(x, -30, type));
        powerUpSpawnTimer = 0;
    }
}

// 更新游戏
function updateGame() {
    if (gameState !== 'playing') return;
    
    handleInput();
    player.update();
    
    // 生成敌机
    spawnEnemy();
    
    // 生成道具
    spawnPowerUp();
    
    // 更新敌机
    enemies = enemies.filter(enemy => {
        enemy.update();
        
        // 检测敌机与玩家子弹的碰撞
        for (let i = enemy.bullets.length - 1; i >= 0; i--) {
            const bullet = enemy.bullets[i];
            if (checkCollision(
                {x: bullet.x - bullet.width/2, y: bullet.y, width: bullet.width, height: bullet.height},
                {x: player.x, y: player.y, width: player.width, height: player.height}
            )) {
                enemy.bullets.splice(i, 1);
                lives--;
                createExplosion(player.x + player.width/2, player.y + player.height/2, '#00ffff');
                soundSystem.playHit();
                updateUI();
                if (lives <= 0) {
                    gameOver();
                }
                continue;
            }
        }
        
        // 检测玩家子弹与敌机的碰撞
        for (let i = player.bullets.length - 1; i >= 0; i--) {
            const bullet = player.bullets[i];
            if (checkCollision(
                {x: bullet.x - bullet.width/2, y: bullet.y, width: bullet.width, height: bullet.height},
                {x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height}
            )) {
                player.bullets.splice(i, 1);
                createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                score += 100;
                updateUI();
                
                // 升级检测
                if (score >= level * 1000) {
                    level++;
                    soundSystem.playPowerUp();
                    updateUI();
                }
                
                return false; // 移除敌机
            }
        }
        
        // 检测敌机与玩家的碰撞
        if (checkCollision(enemy, player)) {
            createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            createExplosion(player.x + player.width/2, player.y + player.height/2, '#00ffff');
            lives--;
            updateUI();
            if (lives <= 0) {
                gameOver();
            }
            return false; // 移除敌机
        }
        
        return enemy.y < GAME_HEIGHT + 60; // 保留屏幕内的敌机
    });
    
    // 更新道具
    powerUps = powerUps.filter(powerUp => {
        powerUp.update();
        
        // 检测道具与玩家的碰撞
        if (checkCollision(powerUp, player)) {
            powerUp.applyEffect(player);
            return false;
        }
        
        return powerUp.y < GAME_HEIGHT + 30;
    });
    
    // 更新粒子
    particles = particles.filter(particle => {
        particle.update();
        return particle.alpha > 0;
    });
}

// 背景星星
class Star {
    constructor() {
        this.x = Math.random() * GAME_WIDTH;
        this.y = Math.random() * GAME_HEIGHT;
        this.size = Math.random() * 2;
        this.speed = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.8 + 0.2;
    }

    update() {
        this.y += this.speed;
        if (this.y > GAME_HEIGHT) {
            this.y = -10;
            this.x = Math.random() * GAME_WIDTH;
        }
    }

    draw() {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

// 创建星星
const stars = [];
for (let i = 0; i < 50; i++) {
    stars.push(new Star());
}

// 绘制背景
function drawBackground() {
    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#0a0a2a');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // 绘制星星
    stars.forEach(star => {
        star.update();
        star.draw();
    });
    
    // 添加网格效果
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < GAME_WIDTH; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, GAME_HEIGHT);
        ctx.stroke();
    }
    for (let i = 0; i < GAME_HEIGHT; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(GAME_WIDTH, i);
        ctx.stroke();
    }
}

// 渲染游戏
function render() {
    // 清空画布
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // 应用屏幕震动
    if (screenShake > 0) {
        ctx.save();
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        ctx.translate(shakeX, shakeY);
        screenShake *= 0.9;
        if (screenShake < 0.1) screenShake = 0;
    }
    
    // 绘制背景
    drawBackground();
    
    // 绘制游戏对象
    if (player) {
        player.draw();
        
        // 绘制玩家子弹
        player.bullets.forEach(bullet => bullet.draw());
    }
    
    // 绘制敌机
    enemies.forEach(enemy => {
        enemy.draw();
        enemy.bullets.forEach(bullet => bullet.draw());
    });
    
    // 绘制道具
    powerUps.forEach(powerUp => powerUp.draw());
    
    // 绘制粒子效果
    particles.forEach(particle => particle.draw());
    
    if (screenShake > 0) {
        ctx.restore();
    }
}

// 游戏循环
function gameLoop() {
    updateGame();
    render();
    
    if (gameState === 'playing') {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// 更新UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

// 开始游戏
function startGame() {
    soundSystem.init();
    gameState = 'playing';
    score = 0;
    lives = 3;
    level = 1;
    enemies = [];
    particles = [];
    powerUps = [];
    enemySpawnTimer = 0;
    enemySpawnInterval = 120;
    powerUpSpawnTimer = 0;
    screenShake = 0;
    
    player = new Player();
    
    updateUI();
    document.getElementById('gameOverScreen').style.display = 'none';
    
    gameLoop();
}

// 暂停游戏
function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        cancelAnimationFrame(animationId);
    } else if (gameState === 'paused') {
        gameState = 'playing';
        gameLoop();
    }
}

// 游戏结束
function gameOver() {
    gameState = 'gameover';
    cancelAnimationFrame(animationId);
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'block';
}

// 初始化游戏
function init() {
    // 绑定按钮事件
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', pauseGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);
    document.getElementById('soundBtn').addEventListener('click', () => {
        soundSystem.toggle();
        soundEnabled = soundSystem.enabled;
        document.getElementById('soundBtn').textContent = `音效: ${soundEnabled ? '开' : '关'}`;
    });
    
    // 初始渲染
    render();
}

// 音效系统
class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playShoot() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playExplosion() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    playHit() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    playPowerUp() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    toggle() {
        this.enabled = !this.enabled;
    }
}

const soundSystem = new SoundSystem();

// 启动游戏
init();