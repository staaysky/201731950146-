class FireboyAndWatergirl {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameWidth = 800;
        this.gameHeight = 600;
        
        this.currentLevel = 1;
        this.gameState = 'playing'; // playing, won, lost
        
        this.fireboy = null;
        this.watergirl = null;
        this.platforms = [];
        this.gems = [];
        this.doors = [];
        this.hazards = [];
        
        this.keys = {};
        this.gravity = 0.5;
        this.friction = 0.8;
        
        // 音效系统
        this.audioContext = null;
        this.sounds = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initAudio();
        this.loadLevel(this.currentLevel);
        this.gameLoop();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.log('音频系统初始化失败');
        }
    }

    createSounds() {
        // 创建简单的音效
        this.sounds.jump = () => this.playTone(200, 0.1);
        this.sounds.gem = () => this.playTone(800, 0.2);
        this.sounds.door = () => this.playTone(600, 0.3);
        this.sounds.hazard = () => this.playTone(100, 0.5);
    }

    playTone(frequency, duration) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            e.preventDefault();
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            e.preventDefault();
        });

        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    loadLevel(levelNum) {
        this.platforms = [];
        this.gems = [];
        this.doors = [];
        this.hazards = [];
        
        // 创建关卡数据
        if (levelNum === 1) {
            this.createLevel1();
        } else if (levelNum === 2) {
            this.createLevel2();
        } else {
            this.createLevel1();
        }
        
        this.updateUI();
    }

    createLevel1() {
        // 创建角色
        this.fireboy = new Character(100, 400, 'fire');
        this.watergirl = new Character(150, 400, 'water');
        
        // 地面
        this.platforms.push(new Platform(0, 550, 800, 50));
        
        // 平台
        this.platforms.push(new Platform(200, 450, 150, 20));
        this.platforms.push(new Platform(400, 350, 150, 20));
        this.platforms.push(new Platform(600, 250, 150, 20));
        
        // 墙壁
        this.platforms.push(new Platform(0, 0, 20, 600));
        this.platforms.push(new Platform(780, 0, 20, 600));
        
        // 宝石
        this.gems.push(new Gem(250, 400, 'fire'));
        this.gems.push(new Gem(450, 300, 'water'));
        this.gems.push(new Gem(650, 200, 'fire'));
        this.gems.push(new Gem(350, 300, 'water'));
        
        // 门
        this.doors.push(new Door(700, 200, 'fire'));
        this.doors.push(new Door(50, 500, 'water'));
        
        // 危险区域
        this.hazards.push(new Hazard(300, 530, 80, 20, 'water'));
        this.hazards.push(new Hazard(500, 330, 80, 20, 'fire'));
    }

    createLevel2() {
        // 创建角色
        this.fireboy = new Character(100, 400, 'fire');
        this.watergirl = new Character(150, 400, 'water');
        
        // 地面
        this.platforms.push(new Platform(0, 550, 800, 50));
        
        // 更复杂的平台布局
        this.platforms.push(new Platform(150, 450, 100, 20));
        this.platforms.push(new Platform(300, 380, 100, 20));
        this.platforms.push(new Platform(450, 320, 100, 20));
        this.platforms.push(new Platform(600, 250, 100, 20));
        
        // 墙壁
        this.platforms.push(new Platform(0, 0, 20, 600));
        this.platforms.push(new Platform(780, 0, 20, 600));
        
        // 宝石
        this.gems.push(new Gem(180, 400, 'fire'));
        this.gems.push(new Gem(330, 330, 'water'));
        this.gems.push(new Gem(480, 270, 'fire'));
        this.gems.push(new Gem(630, 200, 'water'));
        this.gems.push(new Gem(400, 150, 'fire'));
        
        // 门
        this.doors.push(new Door(650, 200, 'fire'));
        this.doors.push(new Door(50, 500, 'water'));
        
        // 更多危险区域
        this.hazards.push(new Hazard(250, 530, 60, 20, 'water'));
        this.hazards.push(new Hazard(400, 530, 60, 20, 'fire'));
        this.hazards.push(new Hazard(550, 530, 60, 20, 'water'));
    }

    update() {
        if (this.gameState !== 'playing') return;
        
        // 更新火人
        this.updateCharacter(this.fireboy, {
            left: 'arrowleft',
            right: 'arrowright',
            up: 'arrowup'
        });
        
        // 更新冰人
        this.updateCharacter(this.watergirl, {
            left: 'a',
            right: 'd',
            up: 'w'
        });
        
        // 检查碰撞
        this.checkCollisions();
        
        // 检查胜利条件
        this.checkWinCondition();
    }

    updateCharacter(character, controls) {
        // 水平移动
        if (this.keys[controls.left]) {
            character.vx = -character.speed;
        } else if (this.keys[controls.right]) {
            character.vx = character.speed;
        } else {
            character.vx *= this.friction;
        }
        
        // 跳跃
        if (this.keys[controls.up] && character.onGround) {
            character.vy = character.jumpPower;
            character.onGround = false;
            this.playSound('jump');
        }
        
        // 应用重力
        character.vy += this.gravity;
        
        // 更新位置
        character.x += character.vx;
        character.y += character.vy;
        
        // 重置着地状态
        character.onGround = false;
    }

    checkCollisions() {
        // 检查平台碰撞
        [this.fireboy, this.watergirl].forEach(character => {
            this.platforms.forEach(platform => {
                if (this.checkPlatformCollision(character, platform)) {
                    this.resolvePlatformCollision(character, platform);
                }
            });
        });
        
        // 检查宝石收集
        [this.fireboy, this.watergirl].forEach(character => {
            this.gems = this.gems.filter(gem => {
                if (this.checkGemCollision(character, gem)) {
                    if (gem.type === character.type) {
                        character.gemsCollected++;
                        this.updateUI();
                        this.playSound('gem');
                        return false; // 移除宝石
                    }
                }
                return true;
            });
        });
        
        // 检查危险区域
        [this.fireboy, this.watergirl].forEach(character => {
            this.hazards.forEach(hazard => {
                if (this.checkHazardCollision(character, hazard)) {
                    if (hazard.type === character.type) {
                        this.gameState = 'lost';
                        this.playSound('hazard');
                        this.showMessage('游戏结束！角色碰到了危险区域');
                    }
                }
            });
        });
    }

    checkPlatformCollision(character, platform) {
        return character.x < platform.x + platform.width &&
               character.x + character.width > platform.x &&
               character.y < platform.y + platform.height &&
               character.y + character.height > platform.y;
    }

    resolvePlatformCollision(character, platform) {
        const characterBottom = character.y + character.height;
        const characterRight = character.x + character.width;
        const platformBottom = platform.y + platform.height;
        const platformRight = platform.x + platform.width;
        
        const overlapLeft = characterRight - platform.x;
        const overlapRight = platformRight - character.x;
        const overlapTop = characterBottom - platform.y;
        const overlapBottom = platformBottom - character.y;
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap === overlapTop && character.vy > 0) {
            character.y = platform.y - character.height;
            character.vy = 0;
            character.onGround = true;
        } else if (minOverlap === overlapBottom && character.vy < 0) {
            character.y = platformBottom;
            character.vy = 0;
        } else if (minOverlap === overlapLeft) {
            character.x = platform.x - character.width;
            character.vx = 0;
        } else if (minOverlap === overlapRight) {
            character.x = platformRight;
            character.vx = 0;
        }
    }

    checkGemCollision(character, gem) {
        const distance = Math.sqrt(
            Math.pow(character.x + character.width/2 - gem.x, 2) +
            Math.pow(character.y + character.height/2 - gem.y, 2)
        );
        return distance < character.width/2 + gem.radius;
    }

    checkHazardCollision(character, hazard) {
        return character.x < hazard.x + hazard.width &&
               character.x + character.width > hazard.x &&
               character.y < hazard.y + hazard.height &&
               character.y + character.height > hazard.y;
    }

    checkWinCondition() {
        const fireboyAtDoor = this.doors.find(door => 
            door.type === 'fire' && 
            this.checkCharacterAtDoor(this.fireboy, door)
        );
        
        const watergirlAtDoor = this.doors.find(door => 
            door.type === 'water' && 
            this.checkCharacterAtDoor(this.watergirl, door)
        );
        
        if (fireboyAtDoor && watergirlAtDoor) {
            this.gameState = 'won';
            this.playSound('door');
            this.showMessage('恭喜通关！');
            setTimeout(() => {
                this.nextLevel();
            }, 2000);
        }
    }

    checkCharacterAtDoor(character, door) {
        return character.x < door.x + door.width &&
               character.x + character.width > door.x &&
               character.y < door.y + door.height &&
               character.y + character.height > door.y;
    }

    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel > 2) {
            this.currentLevel = 1; // 循环关卡
        }
        this.gameState = 'playing';
        this.loadLevel(this.currentLevel);
    }

    render() {
        // 清空画布
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        // 绘制平台
        this.platforms.forEach(platform => platform.render(this.ctx));
        
        // 绘制危险区域
        this.hazards.forEach(hazard => hazard.render(this.ctx));
        
        // 绘制宝石
        this.gems.forEach(gem => gem.render(this.ctx));
        
        // 绘制门
        this.doors.forEach(door => door.render(this.ctx));
        
        // 绘制角色
        this.fireboy.render(this.ctx);
        this.watergirl.render(this.ctx);
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    updateUI() {
        document.getElementById('level').textContent = this.currentLevel;
        document.getElementById('fire-gems').textContent = this.fireboy ? this.fireboy.gemsCollected : 0;
        document.getElementById('water-gems').textContent = this.watergirl ? this.watergirl.gemsCollected : 0;
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    showMessage(message) {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = message;
        messageElement.style.display = 'block';
        
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 2000);
    }

    restart() {
        this.gameState = 'playing';
        this.fireboy.gemsCollected = 0;
        this.watergirl.gemsCollected = 0;
        this.loadLevel(this.currentLevel);
    }
}

// 角色类
class Character {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.type = type; // 'fire' or 'water'
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpPower = 12;
        this.onGround = false;
        this.gemsCollected = 0;
    }

    render(ctx) {
        if (this.type === 'fire') {
            // 绘制火人（红色）
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 火焰效果
            ctx.fillStyle = '#ffa500';
            ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, 10);
        } else {
            // 绘制冰人（蓝色）
            ctx.fillStyle = '#4ecdc4';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 冰晶效果
            ctx.fillStyle = '#87ceeb';
            ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, 10);
        }
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + 5, this.y + 10, 5, 5);
        ctx.fillRect(this.x + 20, this.y + 10, 5, 5);
    }
}

// 平台类
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    render(ctx) {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 添加纹理
        ctx.strokeStyle = '#654321';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

// 宝石类
class Gem {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.type = type; // 'fire' or 'water'
        this.collected = false;
    }

    render(ctx) {
        if (this.collected) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        if (this.type === 'fire') {
            ctx.fillStyle = '#ff6b6b';
        } else {
            ctx.fillStyle = '#4ecdc4';
        }
        
        ctx.fill();
        
        // 光泽效果
        ctx.beginPath();
        ctx.arc(this.x - 5, this.y - 5, this.radius / 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
    }
}

// 门类
class Door {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.type = type; // 'fire' or 'water'
    }

    render(ctx) {
        if (this.type === 'fire') {
            ctx.fillStyle = '#ff4444';
        } else {
            ctx.fillStyle = '#4444ff';
        }
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 门框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // 门把手
        ctx.beginPath();
        ctx.arc(this.x + this.width - 10, this.y + this.height / 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd700';
        ctx.fill();
    }
}

// 危险区域类
class Hazard {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'fire' or 'water'
    }

    render(ctx) {
        if (this.type === 'fire') {
            // 火危险区域
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 火焰动画效果
            ctx.fillStyle = '#ff6b6b';
            for (let i = 0; i < 3; i++) {
                const flameX = this.x + (i + 1) * (this.width / 4);
                const flameHeight = 10 + Math.sin(Date.now() / 200 + i) * 5;
                ctx.fillRect(flameX - 5, this.y - flameHeight, 10, flameHeight);
            }
        } else {
            // 水危险区域
            ctx.fillStyle = 'rgba(0, 100, 255, 0.5)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 水波纹效果
            ctx.strokeStyle = '#4ecdc4';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const waveOffset = Math.sin(Date.now() / 300) * 5;
            ctx.moveTo(this.x, this.y + waveOffset);
            ctx.lineTo(this.x + this.width, this.y + waveOffset);
            ctx.stroke();
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new FireboyAndWatergirl();
});