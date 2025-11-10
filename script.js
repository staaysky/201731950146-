class Gomoku {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.boardSize = 15;
        this.cellSize = 40;
        this.padding = 20;
        this.canvasSize = this.cellSize * (this.boardSize - 1) + this.padding * 2;
        
        this.canvas.width = this.canvasSize;
        this.canvas.height = this.canvasSize;
        
        this.board = [];
        this.currentPlayer = 1; // 1 for black, 2 for white
        this.gameOver = false;
        
        this.init();
    }
    
    init() {
        this.setupBoard();
        this.drawBoard();
        this.bindEvents();
        this.updateDisplay();
    }
    
    setupBoard() {
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(0));
        this.gameOver = false;
        this.currentPlayer = 1;
    }
    
    drawBoard() {
        // Clear canvas
        this.ctx.fillStyle = '#f4d03f';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        // Draw grid lines
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.boardSize; i++) {
            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, this.padding + i * this.cellSize);
            this.ctx.lineTo(this.canvasSize - this.padding, this.padding + i * this.cellSize);
            this.ctx.stroke();
            
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding + i * this.cellSize, this.padding);
            this.ctx.lineTo(this.padding + i * this.cellSize, this.canvasSize - this.padding);
            this.ctx.stroke();
        }
        
        // Draw star points
        const starPoints = [
            [3, 3], [3, 11], [11, 3], [11, 11], [7, 7]
        ];
        
        this.ctx.fillStyle = '#333';
        starPoints.forEach(([x, y]) => {
            this.ctx.beginPath();
            this.ctx.arc(
                this.padding + x * this.cellSize,
                this.padding + y * this.cellSize,
                4,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
        
        // Redraw pieces
        this.redrawPieces();
    }
    
    redrawPieces() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] !== 0) {
                    this.drawPiece(row, col, this.board[row][col]);
                }
            }
        }
    }
    
    drawPiece(row, col, player) {
        const x = this.padding + col * this.cellSize;
        const y = this.padding + row * this.cellSize;
        const radius = this.cellSize * 0.4;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (player === 1) {
            // Black piece
            const gradient = this.ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
            gradient.addColorStop(0, '#555');
            gradient.addColorStop(1, '#000');
            this.ctx.fillStyle = gradient;
        } else {
            // White piece
            const gradient = this.ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
            this.ctx.fillStyle = gradient;
        }
        
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    bindEvents() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
    }
    
    handleClick(event) {
        if (this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert to board coordinates
        const col = Math.round((x - this.padding) / this.cellSize);
        const row = Math.round((y - this.padding) / this.cellSize);
        
        // Check if position is valid
        if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
            if (this.board[row][col] === 0) {
                this.placePiece(row, col);
            }
        }
    }
    
    placePiece(row, col) {
        this.board[row][col] = this.currentPlayer;
        this.drawPiece(row, col, this.currentPlayer);
        
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            this.showWinner();
        } else {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            this.updateDisplay();
        }
    }
    
    checkWin(row, col) {
        const player = this.board[row][col];
        const directions = [
            [[0, 1], [0, -1]],   // Horizontal
            [[1, 0], [-1, 0]],   // Vertical
            [[1, 1], [-1, -1]],  // Diagonal \
            [[1, -1], [-1, 1]]   // Diagonal /
        ];
        
        for (const direction of directions) {
            let count = 1;
            
            for (const [dx, dy] of direction) {
                let newRow = row + dx;
                let newCol = col + dy;
                
                while (
                    newRow >= 0 && newRow < this.boardSize &&
                    newCol >= 0 && newCol < this.boardSize &&
                    this.board[newRow][newCol] === player
                ) {
                    count++;
                    newRow += dx;
                    newCol += dy;
                }
            }
            
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }
    
    showWinner() {
        const statusElement = document.getElementById('game-status');
        const winner = this.currentPlayer === 1 ? '黑棋' : '白棋';
        statusElement.textContent = `${winner} 获胜！`;
        statusElement.classList.add('winner');
    }
    
    updateDisplay() {
        const currentPlayerElement = document.getElementById('current-player');
        currentPlayerElement.textContent = this.currentPlayer === 1 ? '黑棋' : '白棋';
        
        const statusElement = document.getElementById('game-status');
        statusElement.textContent = '';
        statusElement.classList.remove('winner');
    }
    
    reset() {
        this.setupBoard();
        this.drawBoard();
        this.updateDisplay();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Gomoku();
});