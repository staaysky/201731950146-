class GoGame {
    constructor() {
        this.boardSize = 19;
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.capturedBlack = 0;
        this.capturedWhite = 0;
        this.koPoint = null;
        this.passCount = 0;
        this.lastMove = null;
        
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
        boardElement.style.gridTemplateColumns = `repeat(${this.boardSize}, 30px)`;
        boardElement.style.gridTemplateRows = `repeat(${this.boardSize}, 30px)`;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.board[row][col]) {
                    const piece = document.createElement('div');
                    piece.className = `piece ${this.board[row][col]}`;
                    
                    if (this.lastMove && this.lastMove[0] === row && this.lastMove[1] === col) {
                        piece.classList.add('last-move');
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
            if (this.gameOver || this.currentPlayer === 'white') return;
            
            const cell = e.target.closest('.cell');
            if (!cell || cell.classList.contains('disabled')) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            this.placePiece(row, col);
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });

        document.getElementById('pass-btn').addEventListener('click', () => {
            this.pass();
        });

        document.getElementById('end-game-btn').addEventListener('click', () => {
            this.endGame();
        });
    }

    placePiece(row, col) {
        if (this.board[row][col] !== null) return;
        
        // 检查是否是劫争点
        if (this.koPoint && this.koPoint[0] === row && this.koPoint[1] === col) {
            this.showMessage('不能立即回提劫！');
            return;
        }
        
        // 临时放置棋子
        this.board[row][col] = this.currentPlayer;
        
        // 检查并移除被吃的对方棋子
        const opponent = this.currentPlayer === 'black' ? 'white' : 'black';
        const capturedGroups = this.getCapturedGroups(opponent);
        
        // 检查自杀规则
        if (capturedGroups.length === 0 && this.getGroup(row, col).liberties === 0) {
            this.board[row][col] = null;
            this.showMessage('自杀手，无效！');
            return;
        }
        
        // 执行吃子
        let totalCaptured = 0;
        for (const group of capturedGroups) {
            totalCaptured += group.stones.length;
            for (const [r, c] of group.stones) {
                this.board[r][c] = null;
            }
        }
        
        // 更新吃子数
        if (this.currentPlayer === 'black') {
            this.capturedWhite += totalCaptured;
        } else {
            this.capturedBlack += totalCaptured;
        }
        
        // 检查劫争
        this.koPoint = null;
        if (totalCaptured === 1 && capturedGroups.length === 1) {
            const capturedGroup = capturedGroups[0];
            if (capturedGroup.stones.length === 1 && this.getGroup(row, col).stones.length === 1) {
                this.koPoint = capturedGroup.stones[0];
            }
        }
        
        this.lastMove = [row, col];
        this.passCount = 0;
        
        this.renderBoard();
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updatePlayerDisplay();
        
        // 如果是电脑回合，自动下棋
        if (this.currentPlayer === 'white') {
            setTimeout(() => this.computerMove(), 500);
        }
    }

    getGroup(row, col) {
        const color = this.board[row][col];
        if (!color) return null;
        
        const group = { stones: [], liberties: new Set() };
        const visited = new Set();
        const stack = [[row, col]];
        
        while (stack.length > 0) {
            const [r, c] = stack.pop();
            const key = `${r},${c}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            if (this.board[r][c] === color) {
                group.stones.push([r, c]);
                
                // 检查四个方向
                const neighbors = [
                    [r-1, c], [r+1, c], [r, c-1], [r, c+1]
                ];
                
                for (const [nr, nc] of neighbors) {
                    if (this.isValidPosition(nr, nc)) {
                        if (this.board[nr][nc] === color && !visited.has(`${nr},${nc}`)) {
                            stack.push([nr, nc]);
                        } else if (this.board[nr][nc] === null) {
                            group.liberties.add(`${nr},${nc}`);
                        }
                    }
                }
            }
        }
        
        group.liberties = group.liberties.size;
        return group;
    }

    getCapturedGroups(color) {
        const capturedGroups = [];
        const visited = new Set();
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === color && !visited.has(`${row},${col}`)) {
                    const group = this.getGroup(row, col);
                    for (const [r, c] of group.stones) {
                        visited.add(`${r},${c}`);
                    }
                    
                    if (group.liberties === 0) {
                        capturedGroups.push(group);
                    }
                }
            }
        }
        
        return capturedGroups;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }

    computerMove() {
        if (this.gameOver) return;
        
        const validMoves = [];
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    // 简单的AI：检查这个位置是否有效
                    if (this.isValidMove(row, col, 'white')) {
                        let score = Math.random();
                        
                        // 优先考虑吃子
                        this.board[row][col] = 'white';
                        const capturedBlack = this.getCapturedGroups('black');
                        score += capturedBlack.length * 10;
                        
                        // 避免被吃
                        this.board[row][col] = 'black';
                        const capturedWhite = this.getCapturedGroups('white');
                        score -= capturedWhite.length * 8;
                        
                        this.board[row][col] = null;
                        
                        validMoves.push({ row, col, score });
                    }
                }
            }
        }
        
        if (validMoves.length > 0) {
            validMoves.sort((a, b) => b.score - a.score);
            const bestMove = validMoves[0];
            this.placePiece(bestMove.row, bestMove.col);
        } else {
            this.pass();
        }
    }

    isValidMove(row, col, color) {
        // 检查劫争
        if (this.koPoint && this.koPoint[0] === row && this.koPoint[1] === col) {
            return false;
        }
        
        // 临时放置棋子
        this.board[row][col] = color;
        
        // 检查是否会被吃
        const group = this.getGroup(row, col);
        const capturedGroups = this.getCapturedGroups(color === 'black' ? 'white' : 'black');
        
        // 恢复棋盘
        this.board[row][col] = null;
        
        // 如果会被吃且不能吃掉对方，则是无效手
        if (group.liberties === 0 && capturedGroups.length === 0) {
            return false;
        }
        
        return true;
    }

    pass() {
        this.passCount++;
        this.showMessage(`${this.currentPlayer === 'black' ? '黑棋' : '白棋'} 虚手`);
        
        if (this.passCount >= 2) {
            this.endGame();
        } else {
            this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
            this.updatePlayerDisplay();
            
            if (this.currentPlayer === 'white') {
                setTimeout(() => this.computerMove(), 500);
            }
        }
    }

    endGame() {
        this.gameOver = true;
        const scores = this.calculateScores();
        
        document.getElementById('game-status').textContent = '游戏结束';
        document.getElementById('score-board').style.display = 'block';
        document.getElementById('black-score').textContent = `黑棋目数: ${scores.black}`;
        document.getElementById('white-score').textContent = `白棋目数: ${scores.white}`;
        
        let winner = '';
        if (scores.black > scores.white) {
            winner = '黑棋获胜！';
        } else if (scores.white > scores.black) {
            winner = '白棋获胜！';
        } else {
            winner = '平局！';
        }
        
        document.getElementById('winner').textContent = winner;
    }

    calculateScores() {
        const territory = this.calculateTerritory();
        const blackScore = territory.black + this.capturedWhite;
        const whiteScore = territory.white + this.capturedBlack + 6.5; // 贴目
        
        return {
            black: blackScore,
            white: whiteScore
        };
    }

    calculateTerritory() {
        const territory = { black: 0, white: 0 };
        const visited = new Set();
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null && !visited.has(`${row},${col}`)) {
                    const area = this.getEmptyArea(row, col, visited);
                    const owner = this.getAreaOwner(area);
                    
                    if (owner === 'black') {
                        territory.black += area.length;
                    } else if (owner === 'white') {
                        territory.white += area.length;
                    }
                }
            }
        }
        
        return territory;
    }

    getEmptyArea(startRow, startCol, visited) {
        const area = [];
        const stack = [[startRow, startCol]];
        
        while (stack.length > 0) {
            const [row, col] = stack.pop();
            const key = `${row},${col}`;
            
            if (visited.has(key)) continue;
            
            if (this.isValidPosition(row, col) && this.board[row][col] === null) {
                visited.add(key);
                area.push([row, col]);
                
                const neighbors = [
                    [row-1, col], [row+1, col], [row, col-1], [row, col+1]
                ];
                
                for (const [nr, nc] of neighbors) {
                    if (!visited.has(`${nr},${nc}`)) {
                        stack.push([nr, nc]);
                    }
                }
            }
        }
        
        return area;
    }

    getAreaOwner(area) {
        const borders = new Set();
        
        for (const [row, col] of area) {
            const neighbors = [
                [row-1, col], [row+1, col], [row, col-1], [row, col+1]
            ];
            
            for (const [nr, nc] of neighbors) {
                if (this.isValidPosition(nr, nc) && this.board[nr][nc] !== null) {
                    borders.add(this.board[nr][nc]);
                }
            }
        }
        
        if (borders.size === 1) {
            return [...borders][0];
        }
        
        return null; // 中立区域
    }

    updatePlayerDisplay() {
        const playerDisplay = document.getElementById('current-player');
        playerDisplay.textContent = `当前玩家: ${this.currentPlayer === 'black' ? '黑棋(您)' : '白棋(电脑)'}`;
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
        }, 2000);
    }

    restart() {
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.capturedBlack = 0;
        this.capturedWhite = 0;
        this.koPoint = null;
        this.passCount = 0;
        this.lastMove = null;
        
        this.createBoard();
        this.renderBoard();
        this.updatePlayerDisplay();
        
        document.getElementById('game-status').textContent = '游戏进行中';
        document.getElementById('score-board').style.display = 'none';
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new GoGame();
});