class FireboyWatergirlGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentLevel = 1;
        this.gameState = 'playing';
        this.keys = {};
        
        // 游戏参数
        this.tileSize = 40;
        this.gravity = 0.5;
        this.jumpPower = 12;
        this.moveSpeed = 5;
        
        // 玩家
        this.fireboy = null;
        this.watergirl = null;
        
        // 关卡数据
        this.levels = this.createLevels();
        this.currentLevelData = null;
        this.tiles = [];
        this.gems = [];
        this.doors = [];
        
        this.init();
    }

    init() {
        this.loadLevel(this.currentLevel);
        this.setupEventListeners();
        this.gameLoop();
    }

    createLevels() {
        return [
            // 第一关
            {
                name: "森林入口",
                fireboyStart: { x: 100, y: 400 },
                watergirlStart: { x: 200, y: 400 },
                tiles: [
                    // 地面
                    { x: 0, y: 500, width: 800, height: 100, type: 'ground' },
                    // 平台
                    { x: 150, y: 400, width: 100, height: 20, type: 'ground' },
                    { x: 300, y: 350, width: 100, height: 20, type: 'ground' },
                    { x: 450, y: 300, width: 100, height: 20, type: 'ground' },
                    { x: 600, y: 250, width: 100, height: 20, type: 'ground' },
                ],
                gems: [
                    { x: 180, y: 360, type: 'fire', collected: false },
                    { x: 330, y: 310, type: 'water', collected: false },
                    { x: 480, y: 260, type: 'fire', collected: false },
                    { x: 630, y: 210, type: 'water', collected: false },
                ],
                hazards: [
                    { x: 250, y: 480, width: 50, height: 20, type: 'water' },
                    { x: 400, y: 480, width: 50, height: 20, type: 'lava' },
                ],
                doors: {
                    fire: { x: 700, y: 450, width: 40, height: 50 },
                    water: { x: 750, y: 450, width: 40, height: 50 }
                }
            },
            // 第二关
            {
                name: "水晶洞穴",
                fireboyStart: { x: 100, y: 400 },
                watergirlStart: { x: 150, y: 400 },
                tiles: [
                    { x: 0, y: 500, width: 800, height: 100, type: 'ground' },
                    { x: 200, y: 420, width: 80, height: 20, type: 'ground' },
                    { x: 350, y: 360, width: 80, height: 20, type: 'ground' },
                    { x: 500, y: 300, width: 80, height: 20, type: 'ground' },
                    { x: 650, y: 240, width: 80, height: 20, type: 'ground' },
                ],
                gems: [
                    { x: 230, y: 380, type: 'fire', collected: false },
                    { x: 380, y: 320, type: 'water', collected: false },
                    { x: 530, y: 260, type: 'fire', collected: false },
                    { x: 680, y: 200, type: 'water', collected: false },
                ],
                hazards: [
                    { x: 300, y: 480, width: 60, height: 20, type: 'water' },
                    { x: 450, y: 480, width: 60, height: 20, type: 'lava' },
                ],
                doors: {
                    fire: { x: 700, y: 450, width: 40, height: 50 },
                    water: { x: 750, y: 450, width: 40, height: 50 }
                }
            }
        ];
    }

    loadLevel(levelIndex) {
        if (levelIndex >= this.levels.length) {
            this.showMessage("恭喜通关！");
            this.gameState = 'won';
            return;
        }

        this.currentLevelData = this.levels[levelIndex];
        this.tiles = [...this.currentLevelData.tiles];
        this.gems = this.currentLevelData.gems.map(gem => ({...gem, collected: false}));
        this.doors = this.currentLevelData.doors;
        
        // 创建玩家
        this.fireboy = new Player(
            this.currentLevelData.fireboyStart.x,
            this.currentLevelData.fireboyStart.y,
            'fire',
            '#e74c3c'
        );
        
        this.watergirl = new Player(
            this.currentLevelData.watergirlStart.x,
            this.currentLevelData.watergirlStart.y,
            'water',
            '#3498db'
        );
        
        this.updateUI();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            e.preventDefault();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    update() {
        if (this.gameState !== 'playing') return;
        
        // 更新火人控制
        this.fireboy.update(this.keys, this.tiles, this.gravity, this.moveSpeed, this.jumpPower);
        
        // 更新冰人控制
        this.watergirl.update(this.keys, this.tiles, this.gravity, this.moveSpeed, this.jumpPower);
        
        // 检查宝石收集
        this.checkGemCollection();
        
        // 检查危险区域
        this.checkHazards();
        
        // 检查是否到达门
        this.checkDoors();
    }

    checkGemCollection() {
        this.gems.forEach(gem => {
            if (!gem.collected) {
                if (this.fireboy.collectsGem(gem, 'fire') || 
                    this.watergirl.collectsGem(gem, 'water')) {
                    gem.collected = true;
                    this.updateUI();
                }
            }
        });
    }

    checkHazards() {
        const hazards = this.currentLevelData.hazards || [];
        
        hazards.forEach(hazard => {
            if (this.fireboy.checkHazard(hazard)) {
                this.restart();
                this.showMessage("火人碰到危险！");
            }
            if (this.watergirl.checkHazard(hazard)) {
                this.restart();
                this.showMessage("冰人碰到危险！");
            }
        });
    }

    checkDoors() {
        const fireAtDoor = this.fireboy.atDoor(this.doors.fire);
        const waterAtDoor = this.watergirl.atDoor(this.doors.water);
        
        if (fireAtDoor && waterAtDoor) {
            const allFireGems = this.gems.filter(g => g.type === 'fire').every(g => g.collected);
            const allWaterGems = this.gems.filter(g => g.type === 'water').every(g => g.collected);
            
            if (allFireGems && allWaterGems) {
                this.nextLevel();
            } else {
                this.showMessage("需要收集所有宝石！");
            }
        }
    }

    render() {
        // 清空画布
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景网格
        this.drawGrid();
        
        // 绘制危险区域
        const hazards = this.currentLevelData.hazards || [];
        hazards.forEach(hazard => this.drawHazard(hazard));
        
        // 绘制平台
        this.tiles.forEach(tile => this.drawTile(tile));
        
        // 绘制宝石
        this.gems.forEach(gem => {
            if (!gem.collected) {
                this.drawGem(gem);
            }
        });
        
        // 绘制门
        this.drawDoor(this.doors.fire, '#e74c3c', '🔥');
        this.drawDoor(this.doors.water, '#3498db', '💎');
        
        // 绘制玩家
        this.fireboy.draw(this.ctx);
        this.watergirl.draw(this.ctx);
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.canvas.width; x += this.tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += this.tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawTile(tile) {
        const gradient = this.ctx.createLinearGradient(
            tile.x, tile.y, tile.x, tile.y + tile.height
        );
        gradient.addColorStop(0, '#8b7355');
        gradient.addColorStop(1, '#654321');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(tile.x, tile.y, tile.width, tile.height);
        
        // 添加边框
        this.ctx.strokeStyle = '#4a3c28';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(tile.x, tile.y, tile.width, tile.height);
    }

    drawGem(gem) {
        this.ctx.save();
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // 添加发光效果
        if (gem.type === 'fire') {
            this.ctx.shadowColor = '#e74c3c';
            this.ctx.fillText('🔥', gem.x, gem.y);
        } else {
            this.ctx.shadowColor = '#3498db';
            this.ctx.fillText('💎', gem.x, gem.y);
        }
        
        this.ctx.restore();
    }

    drawHazard(hazard) {
        if (hazard.type === 'water') {
            this.ctx.fillStyle = '#3498db';
        } else if (hazard.type === 'lava') {
            this.ctx.fillStyle = '#e74c3c';
        }
        
        this.ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
    }

    drawDoor(door, color, emoji) {
        // 门框
        this.ctx.fillStyle = color;
        this.ctx.fillRect(door.x, door.y, door.width, door.height);
        
        // 门图标
        this.ctx.save();
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(emoji, door.x + door.width/2, door.y + door.height/2);
        this.ctx.restore();
    }

    updateUI() {
        document.getElementById('current-level').textContent = this.currentLevel;
        
        const fireGems = this.gems.filter(g => g.type === 'fire');
        const waterGems = this.gems.filter(g => g.type === 'water');
        
        document.getElementById('ice-gem-count').textContent = 
            waterGems.filter(g => g.collected).length;
        document.getElementById('ice-gem-total').textContent = waterGems.length;
        
        document.getElementById('fire-gem-count').textContent = 
            fireGems.filter(g => g.collected).length;
        document.getElementById('fire-gem-total').textContent = fireGems.length;
    }

    nextLevel() {
        this.currentLevel++;
        this.loadLevel(this.currentLevel);
        this.showMessage(`进入第 ${this.currentLevel} 关！`);
    }

    restart() {
        this.loadLevel(this.currentLevel);
    }

    showMessage(text) {
        const existingMessage = document.querySelector('.game-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = 'game-message';
        messageElement.textContent = text;
        messageElement.style.display = 'block';
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.style.display = 'none';
            if (document.body.contains(messageElement)) {
                document.body.removeChild(messageElement);
            }
        }, 2000);
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

class Player {
    constructor(x, y, type, color) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.type = type;
        this.color = color;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
    }

    update(keys, tiles, gravity, moveSpeed, jumpPower) {
        // 水平移动
        if (this.type === 'fire') {
            if (keys['arrowleft']) this.velocityX = -moveSpeed;
            else if (keys['arrowright']) this.velocityX = moveSpeed;
            else this.velocityX *= 0.8;
            
            if (keys['arrowup'] && this.onGround) {
                this.velocityY = -jumpPower;
            }
        } else {
            if (keys['a']) this.velocityX = -moveSpeed;
            else if (keys['d']) this.velocityX = moveSpeed;
            else this.velocityX *= 0.8;
            
            if (keys['w'] && this.onGround) {
                this.velocityY = -jumpPower;
            }
        }
        
        // 应用重力
        this.velocityY += gravity;
        
        // 更新位置
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // 碰撞检测
        this.onGround = false;
        tiles.forEach(tile => {
            if (this.checkCollision(tile)) {
                this.resolveCollision(tile);
            }
        });
        
        // 边界检查
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > 800) this.x = 800 - this.width;
        if (this.y < 0) {
            this.y = 0;
            this.velocityY = 0;
        }
    }

    checkCollision(tile) {
        return this.x < tile.x + tile.width &&
               this.x + this.width > tile.x &&
               this.y < tile.y + tile.height &&
               this.y + this.height > tile.y;
    }

    resolveCollision(tile) {
        const overlapX = Math.min(this.x + this.width - tile.x, tile.x + tile.width - this.x);
        const overlapY = Math.min(this.y + this.height - tile.y, tile.y + tile.height - this.y);
        
        if (overlapX < overlapY) {
            if (this.x < tile.x) {
                this.x = tile.x - this.width;
            } else {
                this.x = tile.x + tile.width;
            }
            this.velocityX = 0;
        } else {
            if (this.y < tile.y) {
                this.y = tile.y - this.height;
                this.velocityY = 0;
                this.onGround = true;
            } else {
                this.y = tile.y + tile.height;
                this.velocityY = 0;
            }
        }
    }

    collectsGem(gem, gemType) {
        if (gem.type !== gemType) return false;
        
        const distance = Math.sqrt(
            Math.pow(this.x + this.width/2 - gem.x, 2) + 
            Math.pow(this.y + this.height/2 - gem.y, 2)
        );
        
        return distance < 25;
    }

    checkHazard(hazard) {
        if (this.type === 'fire' && hazard.type === 'lava') return false;
        if (this.type === 'water' && hazard.type === 'water') return false;
        
        return this.checkCollision(hazard);
    }

    atDoor(door) {
        return this.x < door.x + door.width &&
               this.x + this.width > door.x &&
               this.y < door.y + door.height &&
               this.y + this.height > door.y;
    }

    draw(ctx) {
        // 绘制角色
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 添加角色标识
        ctx.save();
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type === 'fire' ? '🔥' : '💎', 
                    this.x + this.width/2, this.y + this.height/2);
        ctx.restore();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new FireboyWatergirlGame();
});