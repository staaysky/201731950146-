class Fighter {
    constructor(id, x, y, controls) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.health = 100;
        this.energy = 100;
        this.controls = controls;
        this.isAttacking = false;
        this.isDefending = false;
        this.isSpecialAttacking = false;
        this.attackCooldown = 0;
        this.specialCooldown = 0;
        this.element = null;
        this.healthBar = null;
        this.energyBar = null;
    }

    reset() {
        this.health = 100;
        this.energy = 100;
        this.isAttacking = false;
        this.isDefending = false;
        this.isSpecialAttacking = false;
        this.attackCooldown = 0;
        this.specialCooldown = 0;
    }
}

class KingOfFighters {
    constructor() {
        this.gameStage = document.getElementById('game-stage');
        this.effectsLayer = document.getElementById('effects-layer');
        this.gameMessage = document.getElementById('game-message');
        
        this.stageWidth = this.gameStage.offsetWidth;
        this.stageHeight = this.gameStage.offsetHeight;
        
        this.player1 = new Fighter('player1', 100, 100, {
            left: 'a',
            right: 'd',
            up: 'w',
            down: 's',
            attack: ' ',
            defend: 'j',
            special: 'i'
        });
        
        this.player2 = new Fighter('player2', this.stageWidth - 180, 100, {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            up: 'ArrowUp',
            down: 'ArrowDown',
            attack: 'Enter',
            defend: 'l',
            special: 'o'
        });
        
        this.gameRunning = false;
        this.gamePaused = false;
        this.keys = {};
        
        this.init();
    }

    init() {
        this.setupCharacters();
        this.setupEventListeners();
        this.startGame();
    }

    setupCharacters() {
        this.player1.element = document.getElementById('player1');
        this.player2.element = document.getElementById('player2');
        this.player1.healthBar = document.getElementById('player1-health');
        this.player1.energyBar = document.getElementById('player1-energy');
        this.player2.healthBar = document.getElementById('player2-health');
        this.player2.energyBar = document.getElementById('player2-energy');
        
        this.updateCharacterPosition(this.player1);
        this.updateCharacterPosition(this.player2);
        this.updateHealthBars();
        this.updateEnergyBars();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            e.preventDefault();
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
    }

    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameLoop();
    }

    gameLoop() {
        if (!this.gameRunning) return;
        
        if (!this.gamePaused) {
            this.handleInput();
            this.updateCooldowns();
            this.updateEnergyBars();
            this.checkWinCondition();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }

    handleInput() {
        this.handlePlayerMovement(this.player1);
        this.handlePlayerMovement(this.player2);
        
        if (this.keys[this.player1.controls.attack]) {
            this.performAttack(this.player1, this.player2);
        }
        if (this.keys[this.player1.controls.defend]) {
            this.performDefend(this.player1);
        }
        if (this.keys[this.player1.controls.special]) {
            this.performSpecialAttack(this.player1, this.player2);
        }
        
        if (this.keys[this.player2.controls.attack]) {
            this.performAttack(this.player2, this.player1);
        }
        if (this.keys[this.player2.controls.defend]) {
            this.performDefend(this.player2);
        }
        if (this.keys[this.player2.controls.special]) {
            this.performSpecialAttack(this.player2, this.player1);
        }
    }

    handlePlayerMovement(player) {
        const speed = 5;
        let moved = false;
        
        if (this.keys[player.controls.left]) {
            player.x = Math.max(0, player.x - speed);
            moved = true;
        }
        if (this.keys[player.controls.right]) {
            player.x = Math.min(this.stageWidth - 80, player.x + speed);
            moved = true;
        }
        if (this.keys[player.controls.up]) {
            player.y = Math.max(0, player.y - speed);
            moved = true;
        }
        if (this.keys[player.controls.down]) {
            player.y = Math.min(this.stageHeight - 120, player.y + speed);
            moved = true;
        }
        
        if (moved) {
            this.updateCharacterPosition(player);
        }
    }

    performAttack(attacker, defender) {
        if (attacker.attackCooldown > 0 || attacker.isAttacking) return;
        
        attacker.isAttacking = true;
        attacker.attackCooldown = 30;
        attacker.element.classList.add('attacking');
        
        const distance = Math.abs(attacker.x - defender.x);
        if (distance < 100) {
            const damage = defender.isDefending ? 2 : 5;
            defender.health = Math.max(0, defender.health - damage);
            this.createHitEffect(defender.x + 40, defender.y + 60);
            this.updateHealthBars();
        }
        
        setTimeout(() => {
            attacker.isAttacking = false;
            attacker.element.classList.remove('attacking');
        }, 300);
    }

    performDefend(player) {
        if (player.energy < 1) return;
        
        player.isDefending = true;
        player.element.classList.add('defending');
        player.energy = Math.max(0, player.energy - 0.5);
    }

    performSpecialAttack(attacker, defender) {
        if (attacker.specialCooldown > 0 || attacker.energy < 20) return;
        
        attacker.isSpecialAttacking = true;
        attacker.specialCooldown = 180;
        attacker.energy -= 20;
        attacker.element.classList.add('special-attack');
        
        const distance = Math.abs(attacker.x - defender.x);
        if (distance < 150) {
            const damage = defender.isDefending ? 5 : 15;
            defender.health = Math.max(0, defender.health - damage);
            this.createSpecialEffect(defender.x + 40, defender.y + 60);
            this.updateHealthBars();
        }
        
        setTimeout(() => {
            attacker.isSpecialAttacking = false;
            attacker.element.classList.remove('special-attack');
        }, 800);
    }

    updateCooldowns() {
        if (this.player1.attackCooldown > 0) this.player1.attackCooldown--;
        if (this.player1.specialCooldown > 0) this.player1.specialCooldown--;
        if (this.player2.attackCooldown > 0) this.player2.attackCooldown--;
        if (this.player2.specialCooldown > 0) this.player2.specialCooldown--;
        
        if (!this.keys[this.player1.controls.defend]) {
            this.player1.isDefending = false;
            this.player1.element.classList.remove('defending');
        }
        if (!this.keys[this.player2.controls.defend]) {
            this.player2.isDefending = false;
            this.player2.element.classList.remove('defending');
        }
        
        this.player1.energy = Math.min(100, this.player1.energy + 0.1);
        this.player2.energy = Math.min(100, this.player2.energy + 0.1);
    }

    updateCharacterPosition(player) {
        player.element.style.left = player.x + 'px';
        player.element.style.bottom = player.y + 'px';
    }

    updateHealthBars() {
        this.player1.healthBar.style.width = this.player1.health + '%';
        this.player2.healthBar.style.width = this.player2.health + '%';
    }

    updateEnergyBars() {
        this.player1.energyBar.style.width = this.player1.energy + '%';
        this.player2.energyBar.style.width = this.player2.energy + '%';
    }

    createHitEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'hit-effect';
        effect.style.left = (x - 30) + 'px';
        effect.style.top = (y - 30) + 'px';
        this.effectsLayer.appendChild(effect);
        
        setTimeout(() => {
            this.effectsLayer.removeChild(effect);
        }, 500);
    }

    createSpecialEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'special-effect';
        effect.style.left = (x - 50) + 'px';
        effect.style.top = (y - 50) + 'px';
        this.effectsLayer.appendChild(effect);
        
        setTimeout(() => {
            this.effectsLayer.removeChild(effect);
        }, 1000);
    }

    checkWinCondition() {
        if (this.player1.health <= 0) {
            this.endGame('玩家2 获胜！');
        } else if (this.player2.health <= 0) {
            this.endGame('玩家1 获胜！');
        }
    }

    endGame(winner) {
        this.gameRunning = false;
        this.showMessage(winner);
    }

    showMessage(message) {
        this.gameMessage.textContent = message;
        this.gameMessage.style.display = 'block';
    }

    restart() {
        this.player1.reset();
        this.player2.reset();
        this.player1.x = 100;
        this.player2.x = this.stageWidth - 180;
        this.player1.y = 100;
        this.player2.y = 100;
        
        this.updateCharacterPosition(this.player1);
        this.updateCharacterPosition(this.player2);
        this.updateHealthBars();
        this.updateEnergyBars();
        
        this.gameMessage.style.display = 'none';
        this.gameRunning = true;
        this.gamePaused = false;
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pause-btn').textContent = this.gamePaused ? '继续' : '暂停';
        
        if (this.gamePaused) {
            this.showMessage('游戏暂停');
            setTimeout(() => {
                this.gameMessage.style.display = 'none';
            }, 1000);
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new KingOfFighters();
});