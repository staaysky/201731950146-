class Gomoku {
    constructor() {
        this.boardSize = 15;
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = [];
        this.winningCells = [];
        
        this.init();
    }
    
    init() {
        this.setupBoard();
        this.renderBoard();
        this.bindEvents();
        this.updateUI();
    }
    
    setupBoard() {
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = [];
        this.winningCells = [];
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
                    cell.classList.add(this.board[row][col]);
                }
                
                boardElement.appendChild(cell);
            }
        }
    }
    
    bindEvents() {
        document.getElementById('game-board').addEventListener('click', (e) => {
            if (e.target.classList.contains('cell') && !this.gameOver) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.makeMove(row, col);
            }
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undo();
        });
    }
    
    makeMove(row, col) {
        if (this.board[row][col] || this.gameOver) {
            return;
        }
        
        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({ row, col, player: this.currentPlayer });
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add(this.currentPlayer);
        
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            this.highlightWinningCells();
            this.showWinner();
        } else if (this.checkDraw()) {
            this.gameOver = true;
            this.showDraw();
        } else {
            this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
            this.updateUI();
        }
        
        this.updateUndoButton();
    }
    
    checkWin(row, col) {
        const directions = [
            [0, 1],   // 水平
            [1, 0],   // 垂直
            [1, 1],   // 对角线1
            [1, -1]   // 对角线2
        ];
        
        for (const [dx, dy] of directions) {
            const cells = this.getConsecutiveCells(row, col, dx, dy);
            if (cells.length >= 5) {
                this.winningCells = cells;
                return true;
            }
        }
        
        return false;
    }
    
    getConsecutiveCells(row, col, dx, dy) {
        const player = this.board[row][col];
        const cells = [{row, col}];
        
        // 向正方向检查
        for (let i = 1; i < 5; i++) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;
            
            if (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] === player) {
                cells.push({row: newRow, col: newCol});
            } else {
                break;
            }
        }
        
        // 向负方向检查
        for (let i = 1; i < 5; i++) {
            const newRow = row - dx * i;
            const newCol = col - dy * i;
            
            if (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] === player) {
                cells.push({row: newRow, col: newCol});
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
                if (!this.board[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    highlightWinningCells() {
        for (const {row, col} of this.winningCells) {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('winning');
        }
    }
    
    showWinner() {
        const winner = this.currentPlayer === 'black' ? '黑子' : '白子';
        document.getElementById('game-status').textContent = `${winner} 获胜！`;
        document.getElementById('game-status').style.color = '#ff5722';
    }
    
    showDraw() {
        document.getElementById('game-status').textContent = '平局！';
        document.getElementById('game-status').style.color = '#ff9800';
    }
    
    updateUI() {
        const playerText = this.currentPlayer === 'black' ? '黑子' : '白子';
        document.getElementById('current-player').textContent = `当前玩家: ${playerText}`;
        
        if (!this.gameOver) {
            document.getElementById('game-status').textContent = '游戏进行中';
            document.getElementById('game-status').style.color = '#4CAF50';
        }
        
        this.updateUndoButton();
    }
    
    updateUndoButton() {
        const undoBtn = document.getElementById('undo-btn');
        undoBtn.disabled = this.moveHistory.length === 0 || this.gameOver;
    }
    
    undo() {
        if (this.moveHistory.length === 0 || this.gameOver) {
            return;
        }
        
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.row][lastMove.col] = null;
        
        const cell = document.querySelector(`[data-row="${lastMove.row}"][data-col="${lastMove.col}"]`);
        cell.classList.remove(lastMove.player);
        
        this.currentPlayer = lastMove.player;
        this.updateUI();
    }
    
    restart() {
        this.setupBoard();
        this.renderBoard();
        this.updateUI();
        
        // 移除所有获胜高亮
        document.querySelectorAll('.cell.winning').forEach(cell => {
            cell.classList.remove('winning');
        });
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Gomoku();
});