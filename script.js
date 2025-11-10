class Gomoku {
    constructor() {
        this.boardSize = 15;
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.winningCells = [];
        
        this.init();
    }

    init() {
        this.createBoard();
        this.renderBoard();
        this.attachEventListeners();
        this.updatePlayerDisplay();
    }

    createBoard() {
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
    }

    renderBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.board[row][col]) {
                    const piece = document.createElement('div');
                    piece.className = `piece ${this.board[row][col]}`;
                    
                    if (this.winningCells.some(([r, c]) => r === row && c === col)) {
                        piece.classList.add('winning-piece');
                    }
                    
                    cell.appendChild(piece);
                    cell.classList.add('disabled');
                }
                
                boardElement.appendChild(cell);
            }
        }
    }

    attachEventListeners() {
        const boardElement = document.getElementById('game-board');
        boardElement.addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            const cell = e.target.closest('.cell');
            if (!cell || cell.classList.contains('disabled')) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            this.placePiece(row, col);
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    placePiece(row, col) {
        if (this.board[row][col] !== null) return;
        
        this.board[row][col] = this.currentPlayer;
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const piece = document.createElement('div');
        piece.className = `piece ${this.currentPlayer}`;
        cell.appendChild(piece);
        cell.classList.add('disabled');
        
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            this.highlightWinningPieces();
            this.showMessage(`${this.currentPlayer === 'black' ? '黑棋' : '白棋'} 获胜！`);
            return;
        }
        
        if (this.checkDraw()) {
            this.gameOver = true;
            this.showMessage('平局！');
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updatePlayerDisplay();
    }

    checkWin(row, col) {
        const directions = [
            [0, 1],   // 水平
            [1, 0],   // 垂直
            [1, 1],   // 对角线
            [1, -1]   // 反对角线
        ];
        
        for (const [dx, dy] of directions) {
            const cells = this.getLineCells(row, col, dx, dy);
            if (cells.length >= 5) {
                this.winningCells = cells;
                return true;
            }
        }
        
        return false;
    }

    getLineCells(row, col, dx, dy) {
        const player = this.board[row][col];
        const cells = [[row, col]];
        
        // 正向检查
        for (let i = 1; i < 5; i++) {
            const newRow = row + i * dx;
            const newCol = col + i * dy;
            
            if (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] === player) {
                cells.push([newRow, newCol]);
            } else {
                break;
            }
        }
        
        // 反向检查
        for (let i = 1; i < 5; i++) {
            const newRow = row - i * dx;
            const newCol = col - i * dy;
            
            if (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] === player) {
                cells.push([newRow, newCol]);
            } else {
                break;
            }
        }
        
        return cells;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }

    checkDraw() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    highlightWinningPieces() {
        this.renderBoard();
    }

    updatePlayerDisplay() {
        const playerDisplay = document.getElementById('current-player');
        playerDisplay.textContent = `当前玩家: ${this.currentPlayer === 'black' ? '黑棋' : '白棋'}`;
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
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.winningCells = [];
        this.createBoard();
        this.renderBoard();
        this.updatePlayerDisplay();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Gomoku();
});