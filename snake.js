class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.restartBtn = document.getElementById('restartBtn');
        
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [
            {x: 10, y: 10}
        ];
        this.direction = {x: 0, y: 0};
        this.food = this.generateFood();
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = 100;
        
        this.init();
    }
    
    init() {
        this.highScoreElement.textContent = this.highScore;
        
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        this.draw();
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.direction = {x: 1, y: 0};
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.gameLoop();
        }
    }
    
    togglePause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            this.pauseBtn.textContent = this.gamePaused ? '继续' : '暂停';
            if (!this.gamePaused) {
                this.gameLoop();
            }
        }
    }
    
    restartGame() {
        this.snake = [{x: 10, y: 10}];
        this.direction = {x: 0, y: 0};
        this.food = this.generateFood();
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.gameRunning = false;
        this.gamePaused = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';
        this.draw();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.update();
        this.draw();
        
        setTimeout(() => this.gameLoop(), this.gameSpeed);
    }
    
    update() {
        const head = {...this.snake[0]};
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.food = this.generateFood();
            
            if (this.score % 50 === 0) {
                this.gameSpeed = Math.max(50, this.gameSpeed - 10);
            }
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#4CAF50';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#2E7D32';
            } else {
                this.ctx.fillStyle = '#4CAF50';
            }
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, 
                            this.gridSize - 2, this.gridSize - 2);
        });
        
        this.ctx.fillStyle = '#FF5722';
        this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, 
                        this.gridSize - 2, this.gridSize - 2);
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        return newFood;
    }
    
    checkCollision(head) {
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        switch(e.key) {
            case 'ArrowUp':
                if (this.direction.y === 0) {
                    this.direction = {x: 0, y: -1};
                }
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) {
                    this.direction = {x: 0, y: 1};
                }
                break;
            case 'ArrowLeft':
                if (this.direction.x === 0) {
                    this.direction = {x: -1, y: 0};
                }
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) {
                    this.direction = {x: 1, y: 0};
                }
                break;
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
        }
        
        this.showGameOverMessage();
    }
    
    showGameOverMessage() {
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <h2>游戏结束!</h2>
            <p>最终得分: ${this.score}</p>
            ${this.score === this.highScore ? '<p>🎉 新纪录!</p>' : ''}
            <button onclick="game.restartGame(); this.parentElement.remove();">再玩一次</button>
        `;
        document.body.appendChild(gameOverDiv);
    }
}

const game = new SnakeGame();