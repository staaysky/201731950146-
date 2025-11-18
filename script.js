class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [
            {x: 10, y: 10}
        ];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameOver = false;
        
        this.init();
    }
    
    init() {
        this.generateFood();
        this.attachEventListeners();
        this.gameLoop();
    }
    
    attachEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    if (this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                    if (this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                    if (this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                    if (this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
            }
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }
    
    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }
    
    update() {
        if (this.gameOver) return;
        
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // 检查自身碰撞
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        });
        
        // 绘制食物
        this.ctx.fillStyle = '#FF5722';
        this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
    }
    
    gameLoop() {
        this.update();
        this.draw();
        
        setTimeout(() => {
            if (!this.gameOver) {
                this.gameLoop();
            }
        }, 100);
    }
    
    updateScore() {
        this.scoreElement.textContent = `得分: ${this.score}`;
    }
    
    endGame() {
        this.gameOver = true;
        this.showMessage(`游戏结束！得分: ${this.score}`);
    }
    
    showMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'game-message';
        messageElement.textContent = message;
        messageElement.style.display = 'block';
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.style.display = 'none';
            document.body.removeChild(messageElement);
        }, 3000);
    }
    
    restart() {
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameOver = false;
        this.updateScore();
        this.generateFood();
        this.gameLoop();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});