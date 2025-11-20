// 游戏变量
let canvas, ctx;
let player, enemies = [], bullets = [], explosions = [];
let score = 0;
let lives = 3;
let gameRunning = false;
let enemySpawnRate = 60; // 敌机生成频率
let frameCount = 0;
let keys = {};

// 子弹类
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 15;
        this.speed = 7;
    }

    update() {
        this.y -= this.speed;
    }

    draw() {
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 添加子弹特效
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - 1, this.y, 2, this.height);
    }
}

// 玩家飞机类
class Player {
    constructor() {
        this.width = 50;
        this.height = 40;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.speed = 5;
        this.shootCooldown = 0;
    }

    update() {
        // 移动控制
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
        if (keys['ArrowUp'] && this.y > 0) {
            this.y -= this.speed;
        }
        if (keys['ArrowDown'] && this.y < canvas.height - this.height) {
            this.y += this.speed;
        }

        // 射击控制
        if (keys[' '] && this.shootCooldown <= 0) {
            bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y));
            this.shootCooldown = 15; // 射击冷却时间
        }

        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
    }

    draw() {
        // 绘制飞机主体
        ctx.fillStyle = '#3498db';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制飞机细节
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(this.x + 10, this.y - 10, 30, 15); // 机头
        
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x + 20, this.y + this.height, 10, 8); // 引擎火焰
    }
}

// 敌机类
class Enemy {
    constructor() {
        this.width = 40;
        this.height = 30;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 2 + Math.random() * 2;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        // 绘制敌机
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制敌机细节
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(this.x + 15, this.y - 8, 10, 10); // 机头
    }
}

// 爆炸效果类
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 10;
        this.life = 20;
    }

    update() {
        this.size += 1;
        this.life--;
    }

    draw() {
        const alpha = this.life / 20;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ff9800';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// 初始化游戏
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    player = new Player();

    // 事件监听
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);
}

// 开始游戏
function startGame() {
    gameRunning = true;
    score = 0;
    lives = 3;
    enemies = [];
    bullets = [];
    explosions = [];
    frameCount = 0;
    
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    updateScore();
    gameLoop();
}

// 游戏循环
function gameLoop() {
    if (!gameRunning) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景星星效果
    drawBackground();
    
    // 更新和绘制玩家
    player.update();
    player.draw();
    
    // 生成敌机
    if (frameCount % enemySpawnRate === 0) {
        enemies.push(new Enemy());
    }
    
    // 更新和绘制子弹
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        bullets[i].draw();
        
        // 移除超出屏幕的子弹
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            continue;
        }
    }
    
    // 更新和绘制敌机
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        enemies[i].draw();
        
        // 检查敌机是否超出屏幕
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            lives--;
            updateLives();
            continue;
        }
        
        // 检查敌机与玩家碰撞
        if (checkCollision(player, enemies[i])) {
            explosions.push(new Explosion(enemies[i].x + enemies[i].width/2, enemies[i].y + enemies[i].height/2));
            enemies.splice(i, 1);
            lives--;
            updateLives();
            continue;
        }
        
        // 检查子弹与敌机碰撞
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[j], enemies[i])) {
                explosions.push(new Explosion(enemies[i].x + enemies[i].width/2, enemies[i].y + enemies[i].height/2));
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                updateScore();
                break;
            }
        }
    }
    
    // 更新和绘制爆炸效果
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].update();
        explosions[i].draw();
        
        if (explosions[i].life <= 0) {
            explosions.splice(i, 1);
        }
    }
    
    frameCount++;
    
    // 检查游戏结束
    if (lives <= 0) {
        gameOver();
        return;
    }
    
    requestAnimationFrame(gameLoop);
}

// 绘制背景星星效果
function drawBackground() {
    // 简单的星空背景效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (frameCount + i * 13) % (canvas.height * 2);
        ctx.fillRect(x, y % canvas.height, 1, 1);
    }
}

// 检查碰撞
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// 更新分数显示
function updateScore() {
    document.getElementById('score').textContent = `得分: ${score}`;
}

// 更新生命值显示
function updateLives() {
    document.getElementById('lives').textContent = `生命: ${lives}`;
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// 启动游戏
window.onload = init;