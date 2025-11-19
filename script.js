class BadmintonGame {
    constructor() {
        this.gameArea = document.getElementById('game-area');
        this.player = document.getElementById('player');
        this.aiPlayer = document.getElementById('ai-player');
        this.shuttlecock = document.getElementById('shuttlecock');
        this.playerScoreElement = document.getElementById('player-score');
        this.aiScoreElement = document.getElementById('ai-score');
        this.gameMessage = document.getElementById('game-message');
        
        this.courtWidth = 800;
        this.courtHeight = 400;
        this.playerWidth = 60;
        this.playerHeight = 80;
        this.shuttlecockWidth = 15;
        this.shuttlecockHeight = 20;
        
        this.playerY = this.courtHeight / 2 - this.playerHeight / 2;
        this.aiY = this.courtHeight / 2 - this.playerHeight / 2;
        this.shuttlecockX = 150;
        this.shuttlecockY = this.courtHeight / 2;
        this.shuttlecockVX = 0;
        this.shuttlecockVY = 0;
        
        this.playerScore = 0;
        this.aiScore = 0;
        this.gameStarted = false;
        this.gamePaused = false;
        this.playerServing = true;
        this.canHit = true;
        
        this.keys = {};
        this.aiSpeed = 3;
        this.playerSpeed = 5;
        this.gravity = 0.3;
        this.maxShuttlecockSpeed = 8;
        this.hitCooldown = 500;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updatePositions();
        this.updateScore();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ' && this.gameStarted && !this.gamePaused && this.canHit) {
                e.preventDefault();
                this.playerHit();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        if (this.gameStarted) return;
        
        this.gameStarted = true;
        this.gamePaused = false;
        this.playerServing = true;
        this.resetShuttlecock();
        this.gameLoop();
        
        document.getElementById('start-btn').disabled = true;
        document.getElementById('pause-btn').disabled = false;
        
        this.showMessage('游戏开始！', 1500);
    }
    
    togglePause() {
        if (!this.gameStarted) return;
        
        this.gamePaused = !this.gamePaused;
        document.getElementById('pause-btn').textContent = this.gamePaused ? '继续' : '暂停';
        
        if (!this.gamePaused) {
            this.gameLoop();
        }
        
        this.showMessage(this.gamePaused ? '游戏暂停' : '继续游戏', 1000);
    }
    
    restartGame() {
        this.gameStarted = false;
        this.gamePaused = false;
        this.playerScore = 0;
        this.aiScore = 0;
        this.playerServing = true;
        this.canHit = true;
        
        this.playerY = this.courtHeight / 2 - this.playerHeight / 2;
        this.aiY = this.courtHeight / 2 - this.playerHeight / 2;
        this.resetShuttlecock();
        
        this.updatePositions();
        this.updateScore();
        
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('pause-btn').textContent = '暂停';
        
        this.showMessage('游戏重置', 1500);
    }
    
    resetShuttlecock() {
        if (this.playerServing) {
            this.shuttlecockX = 150;
            this.shuttlecockY = this.playerY + this.playerHeight / 2;
            this.shuttlecockVX = 0;
            this.shuttlecockVY = 0;
        } else {
            this.shuttlecockX = this.courtWidth - 150;
            this.shuttlecockY = this.aiY + this.playerHeight / 2;
            this.shuttlecockVX = 0;
            this.shuttlecockVY = 0;
        }
    }
    
    gameLoop() {
        if (!this.gameStarted || this.gamePaused) return;
        
        this.handleInput();
        this.updateAI();
        this.updateShuttlecock();
        this.checkCollisions();
        this.updatePositions();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    handleInput() {
        if (this.keys['w'] || this.keys['arrowup']) {
            this.playerY = Math.max(0, this.playerY - this.playerSpeed);
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.playerY = Math.min(this.courtHeight - this.playerHeight, this.playerY + this.playerSpeed);
        }
    }
    
    updateAI() {
        const aiCenter = this.aiY + this.playerHeight / 2;
        const shuttlecockCenter = this.shuttlecockY;
        
        if (this.shuttlecockX > this.courtWidth / 2) {
            if (aiCenter < shuttlecockCenter - 10) {
                this.aiY = Math.min(this.courtHeight - this.playerHeight, this.aiY + this.aiSpeed);
            } else if (aiCenter > shuttlecockCenter + 10) {
                this.aiY = Math.max(0, this.aiY - this.aiSpeed);
            }
            
            if (this.shuttlecockX > this.courtWidth - 150 && this.shuttlecockVX < 0 && this.canHit) {
                this.aiHit();
            }
        } else {
            const aiCenterTarget = this.courtHeight / 2;
            if (Math.abs(aiCenter - aiCenterTarget) > 5) {
                if (aiCenter < aiCenterTarget) {
                    this.aiY = Math.min(this.courtHeight - this.playerHeight, this.aiY + this.aiSpeed / 2);
                } else {
                    this.aiY = Math.max(0, this.aiY - this.aiSpeed / 2);
                }
            }
        }
    }
    
    updateShuttlecock() {
        if (this.shuttlecockVX === 0 && this.shuttlecockVY === 0) return;
        
        this.shuttlecockX += this.shuttlecockVX;
        this.shuttlecockY += this.shuttlecockVY;
        this.shuttlecockVY += this.gravity;
        
        const speed = Math.sqrt(this.shuttlecockVX * this.shuttlecockVX + this.shuttlecockVY * this.shuttlecockVY);
        if (speed > this.maxShuttlecockSpeed) {
            this.shuttlecockVX = (this.shuttlecockVX / speed) * this.maxShuttlecockSpeed;
            this.shuttlecockVY = (this.shuttlecockVY / speed) * this.maxShuttlecockSpeed;
        }
        
        if (this.shuttlecockY <= 0 || this.shuttlecockY >= this.courtHeight - this.shuttlecockHeight) {
            this.shuttlecockY = this.shuttlecockY <= 0 ? 0 : this.courtHeight - this.shuttlecockHeight;
            this.shuttlecockVY *= -0.7;
        }
    }
    
    checkCollisions() {
        const playerLeft = 100;
        const playerRight = playerLeft + this.playerWidth;
        const playerTop = this.playerY;
        const playerBottom = this.playerY + this.playerHeight;
        
        const aiLeft = this.courtWidth - 100 - this.playerWidth;
        const aiRight = aiLeft + this.playerWidth;
        const aiTop = this.aiY;
        const aiBottom = this.aiY + this.playerHeight;
        
        const shuttlecockLeft = this.shuttlecockX;
        const shuttlecockRight = this.shuttlecockX + this.shuttlecockWidth;
        const shuttlecockTop = this.shuttlecockY;
        const shuttlecockBottom = this.shuttlecockY + this.shuttlecockHeight;
        
        if (this.shuttlecockVX > 0) {
            if (shuttlecockRight >= aiLeft && shuttlecockLeft <= aiRight &&
                shuttlecockBottom >= aiTop && shuttlecockTop <= aiBottom &&
                shuttlecockX > this.courtWidth / 2) {
                if (this.canHit) {
                    this.shuttlecockVX *= -1.1;
                    this.shuttlecockVY = (this.shuttlecockY - (this.aiY + this.playerHeight / 2)) * 0.2;
                    this.canHit = false;
                    setTimeout(() => this.canHit = true, this.hitCooldown);
                }
            }
        } else if (this.shuttlecockVX < 0) {
            if (shuttlecockRight >= playerLeft && shuttlecockLeft <= playerRight &&
                shuttlecockBottom >= playerTop && shuttlecockTop <= playerBottom &&
                shuttlecockX < this.courtWidth / 2) {
                if (this.canHit) {
                    this.shuttlecockVX *= -1.1;
                    this.shuttlecockVY = (this.shuttlecockY - (this.playerY + this.playerHeight / 2)) * 0.2;
                    this.canHit = false;
                    setTimeout(() => this.canHit = true, this.hitCooldown);
                }
            }
        }
        
        if (shuttlecockLeft < 0 || shuttlecockRight > this.courtWidth) {
            if (shuttlecockLeft < 0) {
                this.aiScore++;
                this.showMessage('电脑得分！', 1500);
            } else {
                this.playerScore++;
                this.showMessage('玩家得分！', 1500);
            }
            
            this.updateScore();
            this.playerServing = shuttlecockLeft < 0;
            this.resetShuttlecock();
            
            if (this.playerScore >= 11 || this.aiScore >= 11) {
                this.endGame();
            }
        }
    }
    
    playerHit() {
        if (this.shuttlecockVX === 0 && this.shuttlecockVY === 0) {
            this.shuttlecockVX = 5;
            this.shuttlecockVY = -3;
            this.canHit = false;
            setTimeout(() => this.canHit = true, this.hitCooldown);
        } else if (this.shuttlecockX < this.courtWidth / 2 && this.shuttlecockVX < 0) {
            const hitPosition = (this.shuttlecockY - (this.playerY + this.playerHeight / 2)) / this.playerHeight;
            this.shuttlecockVX = 6;
            this.shuttlecockVY = hitPosition * 4;
            this.canHit = false;
            setTimeout(() => this.canHit = true, this.hitCooldown);
        }
        
        this.player.classList.add('hitting');
        setTimeout(() => this.player.classList.remove('hitting'), 300);
    }
    
    aiHit() {
        if (this.shuttlecockVX === 0 && this.shuttlecockVY === 0) {
            this.shuttlecockVX = -5;
            this.shuttlecockVY = -3;
            this.canHit = false;
            setTimeout(() => this.canHit = true, this.hitCooldown);
        } else {
            const hitPosition = (this.shuttlecockY - (this.aiY + this.playerHeight / 2)) / this.playerHeight;
            this.shuttlecockVX = -6;
            this.shuttlecockVY = hitPosition * 4;
            this.canHit = false;
            setTimeout(() => this.canHit = true, this.hitCooldown);
        }
        
        this.aiPlayer.classList.add('hitting');
        setTimeout(() => this.aiPlayer.classList.remove('hitting'), 300);
    }
    
    updatePositions() {
        this.player.style.top = this.playerY + 'px';
        this.aiPlayer.style.top = this.aiY + 'px';
        this.shuttlecock.style.left = this.shuttlecockX + 'px';
        this.shuttlecock.style.top = this.shuttlecockY + 'px';
    }
    
    updateScore() {
        this.playerScoreElement.textContent = this.playerScore;
        this.aiScoreElement.textContent = this.aiScore;
    }
    
    showMessage(text, duration = 2000) {
        this.gameMessage.textContent = text;
        this.gameMessage.classList.add('show');
        
        setTimeout(() => {
            this.gameMessage.classList.remove('show');
        }, duration);
    }
    
    endGame() {
        this.gameStarted = false;
        const winner = this.playerScore >= 11 ? '玩家' : '电脑';
        this.showMessage(`${winner}获胜！最终比分 ${this.playerScore}:${this.aiScore}`, 5000);
        
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BadmintonGame();
});