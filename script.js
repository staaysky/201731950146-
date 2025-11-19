class GoGame {
    constructor() {
        this.boardSize = 19;
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.capturedStones = { black: 0, white: 0 };
        this.lastMove = null;
        this.koPosition = null;
        this.passCount = 0;
        this.isComputerOpponent = true;
        
        this.init();
    }

    init() {
        this.createBoard();
        this.renderBoard();
        this.attachEventListeners();
        this.updatePlayerDisplay();
        this.updateCapturedDisplay();
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

        document.getElementById('close-result-btn').addEventListener('click', () => {
            document.getElementById('game-result').style.display = 'none';
        });
    }

    placePiece(row, col) {
        if (this.board[row][col] !== null) return;
        
        // 检查是否违反劫争规则
        if (this.koPosition && this.koPosition[0] === row && this.koPosition[1] === col) {
            this.showMessage('违反劫争规则，不能立即回提！');
            return;
        }
        
        // 临时放置棋子
        this.board[row][col] = this.currentPlayer;
        
        // 检查并提取对手的死子
        const opponent = this.currentPlayer === 'black' ? 'white' : 'black';
        const capturedGroups = this.findCapturedGroups(opponent);
        let totalCaptured = 0;
        
        for (const group of capturedGroups) {
            totalCaptured += group.length;
            this.removeGroup(group);
        }
        
        // 检查自杀规则（如果没有提子且自己没有气）
        if (totalCaptured === 0 && this.getGroupLiberties(this.getGroup(row, col)).length === 0) {
            this.board[row][col] = null;
            this.showMessage('自杀手，此处不能落子！');
            return;
        }
        
        // 更新劫争位置
        this.koPosition = null;
        if (totalCaptured === 1 && capturedGroups.length === 1) {
            const capturedGroup = capturedGroups[0];
            if (capturedGroup.length === 1 && this.getGroup(row, col).length === 1) {
                this.koPosition = capturedGroup[0];
            }
        }
        
        this.capturedStones[this.currentPlayer] += totalCaptured;
        this.lastMove = [row, col];
        this.passCount = 0;
        
        this.renderBoard();
        this.updateCapturedDisplay();
        
        // 切换到电脑对手
        this.currentPlayer = opponent;
        this.updatePlayerDisplay();
        
        // 如果是电脑回合，自动下棋
        if (this.currentPlayer === 'white' && this.isComputerOpponent && !this.gameOver) {
            setTimeout(() => this.computerMove(), 500);
        }
    }

    computerMove() {
        if (this.gameOver) return;
        
        const validMoves = this.getValidMoves();
        if (validMoves.length === 0) {
            this.pass();
            return;
        }
        
        // 简单AI：随机选择一个合法位置
        const move = validMoves[Math.floor(Math.random() * validMoves.length)];
        this.placePiece(move[0], move[1]);
    }

    getValidMoves() {
        const validMoves = [];
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.isValidMove(row, col)) {
                    validMoves.push([row, col]);
                }
            }
        }
        
        return validMoves;
    }

    isValidMove(row, col) {
        if (this.board[row][col] !== null) return false;
        
        // 检查劫争
        if (this.koPosition && this.koPosition[0] === row && this.koPosition[1] === col) {
            return false;
        }
        
        // 临时放置棋子检查是否合法
        this.board[row][col] = this.currentPlayer;
        const opponent = this.currentPlayer === 'black' ? 'white' : 'black';
        
        // 检查能提多少子
        const capturedGroups = this.findCapturedGroups(opponent);
        let totalCaptured = 0;
        for (const group of capturedGroups) {
            totalCaptured += group.length;
        }
        
        // 检查自杀
        const isSuicide = totalCaptured === 0 && this.getGroupLiberties(this.getGroup(row, col)).length === 0;
        
        this.board[row][col] = null;
        
        return !isSuicide;
    }

    getGroup(row, col) {
        const color = this.board[row][col];
        if (!color) return [];
        
        const group = [];
        const visited = new Set();
        const stack = [[row, col]];
        
        while (stack.length > 0) {
            const [r, c] = stack.pop();
            const key = `${r},${c}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            if (this.board[r][c] === color) {
                group.push([r, c]);
                
                // 添加相邻的同色棋子
                const neighbors = this.getNeighbors(r, c);
                for (const [nr, nc] of neighbors) {
                    if (!visited.has(`${nr},${nc}`)) {
                        stack.push([nr, nc]);
                    }
                }
            }
        }
        
        return group;
    }

    getGroupLiberties(group) {
        const liberties = new Set();
        
        for (const [row, col] of group) {
            const neighbors = this.getNeighbors(row, col);
            for (const [nr, nc] of neighbors) {
                if (this.board[nr][nc] === null) {
                    liberties.add(`${nr},${nc}`);
                }
            }
        }
        
        return Array.from(liberties).map(key => {
            const [r, c] = key.split(',').map(Number);
            return [r, c];
        });
    }

    findCapturedGroups(color) {
        const capturedGroups = [];
        const visited = new Set();
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const key = `${row},${col}`;
                if (this.board[row][col] === color && !visited.has(key)) {
                    const group = this.getGroup(row, col);
                    group.forEach(([r, c]) => visited.add(`${r},${c}`));
                    
                    if (this.getGroupLiberties(group).length === 0) {
                        capturedGroups.push(group);
                    }
                }
            }
        }
        
        return capturedGroups;
    }

    removeGroup(group) {
        for (const [row, col] of group) {
            this.board[row][col] = null;
        }
    }

    getNeighbors(row, col) {
        const neighbors = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidPosition(newRow, newCol)) {
                neighbors.push([newRow, newCol]);
            }
        }
        
        return neighbors;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }

    pass() {
        this.passCount++;
        this.showMessage(`${this.currentPlayer === 'black' ? '黑棋' : '白棋'} 虚手`);
        
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updatePlayerDisplay();
        
        // 如果双方连续虚手，游戏结束
        if (this.passCount >= 2) {
            this.endGame();
        } else if (this.currentPlayer === 'white' && this.isComputerOpponent && !this.gameOver) {
            setTimeout(() => this.computerMove(), 500);
        }
    }

    endGame() {
        this.gameOver = true;
        const result = this.calculateScore();
        this.showResult(result);
    }

    calculateScore() {
        // 简化的目数计算
        const territory = this.calculateTerritory();
        const blackScore = territory.black + this.capturedStones.black;
        const whiteScore = territory.white + this.capturedStones.white + 6.5; // 贴目
        
        return {
            black: blackScore,
            white: whiteScore,
            territory: territory,
            captured: this.capturedStones,
            winner: blackScore > whiteScore ? 'black' : 'white'
        };
    }

    calculateTerritory() {
        const territory = { black: 0, white: 0 };
        const visited = new Set();
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const key = `${row},${col}`;
                if (this.board[row][col] === null && !visited.has(key)) {
                    const area = this.getEmptyArea(row, col, visited);
                    const owner = this.getAreaOwner(area);
                    
                    if (owner) {
                        territory[owner] += area.length;
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
            
            if (this.board[row][col] === null) {
                visited.add(key);
                area.push([row, col]);
                
                const neighbors = this.getNeighbors(row, col);
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
        const adjacentColors = new Set();
        
        for (const [row, col] of area) {
            const neighbors = this.getNeighbors(row, col);
            for (const [nr, nc] of neighbors) {
                if (this.board[nr][nc]) {
                    adjacentColors.add(this.board[nr][nc]);
                }
            }
        }
        
        if (adjacentColors.size === 1) {
            return Array.from(adjacentColors)[0];
        }
        
        return null; // 中立区域
    }

    showResult(result) {
        const resultElement = document.getElementById('game-result');
        const contentElement = document.getElementById('result-content');
        
        const winnerText = result.winner === 'black' ? '黑棋' : '白棋';
        const winnerScore = result.winner === 'black' ? result.black : result.white;
        const loserScore = result.winner === 'black' ? result.white : result.black;
        
        contentElement.innerHTML = `
            <div class="result-winner">${winnerText} 获胜！</div>
            <div class="score-details">
                <div>黑棋: ${result.black.toFixed(1)} 目</div>
                <div>白棋: ${result.white.toFixed(1)} 目</div>
                <div>胜${(winnerScore - loserScore).toFixed(1)} 目</div>
            </div>
            <div class="territory-details">
                <div>黑棋领地: ${result.territory.black} 目</div>
                <div>白棋领地: ${result.territory.white} 目</div>
            </div>
            <div class="capture-details">
                <div>黑棋提子: ${result.captured.black} 个</div>
                <div>白棋提子: ${result.captured.white} 个</div>
            </div>
        `;
        
        resultElement.style.display = 'block';
    }

    updatePlayerDisplay() {
        const playerDisplay = document.getElementById('current-player');
        playerDisplay.textContent = `当前玩家: ${this.currentPlayer === 'black' ? '黑棋' : '白棋'}`;
    }

    updateCapturedDisplay() {
        document.getElementById('black-captures').textContent = this.capturedStones.black;
        document.getElementById('white-captures').textContent = this.capturedStones.white;
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
        this.capturedStones = { black: 0, white: 0 };
        this.lastMove = null;
        this.koPosition = null;
        this.passCount = 0;
        
        this.createBoard();
        this.renderBoard();
        this.updatePlayerDisplay();
        this.updateCapturedDisplay();
        
        document.getElementById('game-result').style.display = 'none';
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new GoGame();
});