class ChineseChess {
    constructor() {
        this.boardSize = 10;
        this.boardCols = 9;
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.selectedCell = null;
        this.gameOver = false;
        this.capturedPieces = {
            red: [],
            black: []
        };
        
        this.pieces = {
            red: {
                '帥': 'general', '仕': 'advisor', '相': 'elephant',
                '傌': 'horse', '俥': 'chariot', '炮': 'cannon', '兵': 'soldier'
            },
            black: {
                '將': 'general', '士': 'advisor', '象': 'elephant',
                '馬': 'horse', '車': 'chariot', '砲': 'cannon', '卒': 'soldier'
            }
        };
        
        this.init();
    }

    init() {
        this.createBoard();
        this.renderBoard();
        this.attachEventListeners();
        this.updatePlayerDisplay();
    }

    createBoard() {
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardCols).fill(null));
        
        // 初始化红方棋子
        this.board[9][0] = { type: 'chariot', color: 'red', text: '俥' };
        this.board[9][1] = { type: 'horse', color: 'red', text: '傌' };
        this.board[9][2] = { type: 'elephant', color: 'red', text: '相' };
        this.board[9][3] = { type: 'advisor', color: 'red', text: '仕' };
        this.board[9][4] = { type: 'general', color: 'red', text: '帥' };
        this.board[9][5] = { type: 'advisor', color: 'red', text: '仕' };
        this.board[9][6] = { type: 'elephant', color: 'red', text: '相' };
        this.board[9][7] = { type: 'horse', color: 'red', text: '傌' };
        this.board[9][8] = { type: 'chariot', color: 'red', text: '俥' };
        
        this.board[7][1] = { type: 'cannon', color: 'red', text: '炮' };
        this.board[7][7] = { type: 'cannon', color: 'red', text: '炮' };
        
        for (let i = 0; i < this.boardCols; i += 2) {
            this.board[6][i] = { type: 'soldier', color: 'red', text: '兵' };
        }
        
        // 初始化黑方棋子
        this.board[0][0] = { type: 'chariot', color: 'black', text: '車' };
        this.board[0][1] = { type: 'horse', color: 'black', text: '馬' };
        this.board[0][2] = { type: 'elephant', color: 'black', text: '象' };
        this.board[0][3] = { type: 'advisor', color: 'black', text: '士' };
        this.board[0][4] = { type: 'general', color: 'black', text: '將' };
        this.board[0][5] = { type: 'advisor', color: 'black', text: '士' };
        this.board[0][6] = { type: 'elephant', color: 'black', text: '象' };
        this.board[0][7] = { type: 'horse', color: 'black', text: '馬' };
        this.board[0][8] = { type: 'chariot', color: 'black', text: '車' };
        
        this.board[2][1] = { type: 'cannon', color: 'black', text: '砲' };
        this.board[2][7] = { type: 'cannon', color: 'black', text: '砲' };
        
        for (let i = 0; i < this.boardCols; i += 2) {
            this.board[3][i] = { type: 'soldier', color: 'black', text: '卒' };
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        
        // 绘制棋盘网格
        const grid = document.createElement('div');
        grid.className = 'board-grid';
        
        // 横线
        for (let i = 0; i < this.boardSize; i++) {
            const line = document.createElement('div');
            line.className = 'horizontal-line';
            line.style.top = `${i * 50}px`;
            grid.appendChild(line);
        }
        
        // 竖线
        for (let i = 0; i < this.boardCols; i++) {
            const line = document.createElement('div');
            line.className = 'vertical-line';
            line.style.left = `${i * 50}px`;
            
            // 楚河汉界处的竖线断开
            if (i === 0 || i === this.boardCols - 1) {
                line.style.height = '450px';
            } else {
                line.style.height = '200px';
                const bottomLine = document.createElement('div');
                bottomLine.className = 'vertical-line';
                bottomLine.style.left = `${i * 50}px`;
                bottomLine.style.top = '250px';
                bottomLine.style.height = '200px';
                grid.appendChild(bottomLine);
            }
            
            grid.appendChild(line);
        }
        
        // 楚河汉界
        const river = document.createElement('div');
        river.className = 'river';
        river.textContent = '楚河     汉界';
        grid.appendChild(river);
        
        // 九宫格斜线
        this.drawPalaceLines(grid);
        
        boardElement.appendChild(grid);
        
        // 绘制棋子
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.left = `${col * 50}px`;
                cell.style.top = `${row * 50}px`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.board[row][col]) {
                    const piece = this.createPieceElement(this.board[row][col]);
                    cell.appendChild(piece);
                }
                
                boardElement.appendChild(cell);
            }
        }
    }

    drawPalaceLines(grid) {
        // 上方九宫格
        const topPalace1 = document.createElement('div');
        topPalace1.className = 'palace-line';
        topPalace1.style.left = '150px';
        topPalace1.style.top = '0px';
        topPalace1.style.width = '141px';
        topPalace1.style.height = '1px';
        topPalace1.style.transform = 'rotate(45deg)';
        topPalace1.style.transformOrigin = '0 0';
        grid.appendChild(topPalace1);
        
        const topPalace2 = document.createElement('div');
        topPalace2.className = 'palace-line';
        topPalace2.style.left = '200px';
        topPalace2.style.top = '0px';
        topPalace2.style.width = '141px';
        topPalace2.style.height = '1px';
        topPalace2.style.transform = 'rotate(-45deg)';
        topPalace2.style.transformOrigin = '0 0';
        grid.appendChild(topPalace2);
        
        // 下方九宫格
        const bottomPalace1 = document.createElement('div');
        bottomPalace1.className = 'palace-line';
        bottomPalace1.style.left = '150px';
        bottomPalace1.style.top = '350px';
        bottomPalace1.style.width = '141px';
        bottomPalace1.style.height = '1px';
        bottomPalace1.style.transform = 'rotate(45deg)';
        bottomPalace1.style.transformOrigin = '0 0';
        grid.appendChild(bottomPalace1);
        
        const bottomPalace2 = document.createElement('div');
        bottomPalace2.className = 'palace-line';
        bottomPalace2.style.left = '200px';
        bottomPalace2.style.top = '350px';
        bottomPalace2.style.width = '141px';
        bottomPalace2.style.height = '1px';
        bottomPalace2.style.transform = 'rotate(-45deg)';
        bottomPalace2.style.transformOrigin = '0 0';
        grid.appendChild(bottomPalace2);
    }

    createPieceElement(piece) {
        const pieceElement = document.createElement('div');
        pieceElement.className = `piece ${piece.color}-piece`;
        pieceElement.textContent = piece.text;
        return pieceElement;
    }

    attachEventListeners() {
        const boardElement = document.getElementById('game-board');
        boardElement.addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            this.handleCellClick(row, col, cell);
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    handleCellClick(row, col, cellElement) {
        const piece = this.board[row][col];
        
        if (this.selectedPiece) {
            // 如果已选中棋子，尝试移动
            if (this.isValidMove(this.selectedCell.row, this.selectedCell.col, row, col)) {
                this.movePiece(this.selectedCell.row, this.selectedCell.col, row, col);
                this.clearSelection();
                
                // 检查游戏是否结束
                if (this.checkGameOver()) {
                    this.gameOver = true;
                    this.showMessage(`${this.currentPlayer === 'red' ? '红方' : '黑方'} 获胜！`);
                    return;
                }
                
                // 切换玩家
                this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
                this.updatePlayerDisplay();
            } else if (piece && piece.color === this.currentPlayer) {
                // 选择新的己方棋子
                this.selectPiece(row, col, cellElement);
            } else {
                // 无效移动，清除选择
                this.clearSelection();
            }
        } else if (piece && piece.color === this.currentPlayer) {
            // 选择棋子
            this.selectPiece(row, col, cellElement);
        }
    }

    selectPiece(row, col, cellElement) {
        this.clearSelection();
        this.selectedPiece = this.board[row][col];
        this.selectedCell = { row, col };
        cellElement.classList.add('selected');
        this.highlightValidMoves(row, col);
    }

    clearSelection() {
        document.querySelectorAll('.selected').forEach(cell => {
            cell.classList.remove('selected');
        });
        document.querySelectorAll('.valid-move').forEach(cell => {
            cell.classList.remove('valid-move');
        });
        this.selectedPiece = null;
        this.selectedCell = null;
    }

    highlightValidMoves(fromRow, fromCol) {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                if (this.isValidMove(fromRow, fromCol, row, col)) {
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    if (cell) cell.classList.add('valid-move');
                }
            }
        }
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && targetPiece.color === piece.color) return false;
        
        switch (piece.type) {
            case 'general':
                return this.isValidGeneralMove(fromRow, fromCol, toRow, toCol);
            case 'advisor':
                return this.isValidAdvisorMove(fromRow, fromCol, toRow, toCol, piece.color);
            case 'elephant':
                return this.isValidElephantMove(fromRow, fromCol, toRow, toCol, piece.color);
            case 'horse':
                return this.isValidHorseMove(fromRow, fromCol, toRow, toCol);
            case 'chariot':
                return this.isValidChariotMove(fromRow, fromCol, toRow, toCol);
            case 'cannon':
                return this.isValidCannonMove(fromRow, fromCol, toRow, toCol);
            case 'soldier':
                return this.isValidSoldierMove(fromRow, fromCol, toRow, toCol, piece.color);
            default:
                return false;
        }
    }

    isValidGeneralMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // 只能走一步
        if (rowDiff + colDiff !== 1) return false;
        
        // 必须在九宫格内
        if (toCol < 3 || toCol > 5) return false;
        if (this.board[fromRow][fromCol].color === 'red') {
            if (toRow < 7) return false;
        } else {
            if (toRow > 2) return false;
        }
        
        return true;
    }

    isValidAdvisorMove(fromRow, fromCol, toRow, toCol, color) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // 只能斜着走一步
        if (rowDiff !== 1 || colDiff !== 1) return false;
        
        // 必须在九宫格内
        if (toCol < 3 || toCol > 5) return false;
        if (color === 'red') {
            if (toRow < 7) return false;
        } else {
            if (toRow > 2) return false;
        }
        
        return true;
    }

    isValidElephantMove(fromRow, fromCol, toRow, toCol, color) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // 必须走田字
        if (rowDiff !== 2 || colDiff !== 2) return false;
        
        // 不能过河
        if (color === 'red') {
            if (toRow < 5) return false;
        } else {
            if (toRow > 4) return false;
        }
        
        // 检查是否被阻挡（象眼）
        const midRow = (fromRow + toRow) / 2;
        const midCol = (fromCol + toCol) / 2;
        if (this.board[midRow][midCol]) return false;
        
        return true;
    }

    isValidHorseMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // 必须走日字
        if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
            return false;
        }
        
        // 检查是否被阻挡（马腿）
        if (rowDiff === 2) {
            const midRow = (fromRow + toRow) / 2;
            if (this.board[midRow][fromCol]) return false;
        } else {
            const midCol = (fromCol + toCol) / 2;
            if (this.board[fromRow][midCol]) return false;
        }
        
        return true;
    }

    isValidChariotMove(fromRow, fromCol, toRow, toCol) {
        // 必须走直线
        if (fromRow !== toRow && fromCol !== toCol) return false;
        
        // 检查路径上是否有阻挡
        if (fromRow === toRow) {
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let col = start; col < end; col++) {
                if (this.board[fromRow][col]) return false;
            }
        } else {
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let row = start; row < end; row++) {
                if (this.board[row][fromCol]) return false;
            }
        }
        
        return true;
    }

    isValidCannonMove(fromRow, fromCol, toRow, toCol) {
        // 必须走直线
        if (fromRow !== toRow && fromCol !== toCol) return false;
        
        let pieceCount = 0;
        
        // 计算路径上的棋子数量
        if (fromRow === toRow) {
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let col = start; col < end; col++) {
                if (this.board[fromRow][col]) pieceCount++;
            }
        } else {
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let row = start; row < end; row++) {
                if (this.board[row][fromCol]) pieceCount++;
            }
        }
        
        const targetPiece = this.board[toRow][toCol];
        
        // 如果目标位置有棋子，必须隔一个棋子打
        if (targetPiece) {
            return pieceCount === 1;
        } else {
            // 如果目标位置没有棋子，路径必须畅通
            return pieceCount === 0;
        }
    }

    isValidSoldierMove(fromRow, fromCol, toRow, toCol, color) {
        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);
        
        if (color === 'red') {
            // 红兵向上走
            if (rowDiff > 0) return false; // 不能后退
            if (rowDiff < -1) return false; // 一次只能走一步
            
            // 过河前只能前进
            if (fromRow > 4) {
                if (colDiff > 0) return false; // 不能横走
            } else {
                // 过河后可以横走，但不能后退
                if (rowDiff === 0 && colDiff !== 1) return false;
            }
        } else {
            // 黑卒向下走
            if (rowDiff < 0) return false; // 不能后退
            if (rowDiff > 1) return false; // 一次只能走一步
            
            // 过河前只能前进
            if (fromRow < 5) {
                if (colDiff > 0) return false; // 不能横走
            } else {
                // 过河后可以横走，但不能后退
                if (rowDiff === 0 && colDiff !== 1) return false;
            }
        }
        
        return true;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const capturedPiece = this.board[toRow][toCol];
        
        if (capturedPiece) {
            this.capturedPieces[this.currentPlayer].push(capturedPiece);
            this.updateCapturedPieces();
        }
        
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        this.renderBoard();
    }

    updateCapturedPieces() {
        const redCapturedElement = document.getElementById('red-captured-pieces');
        const blackCapturedElement = document.getElementById('black-captured-pieces');
        
        redCapturedElement.innerHTML = '';
        blackCapturedElement.innerHTML = '';
        
        this.capturedPieces.red.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'captured-piece black-piece';
            pieceElement.textContent = piece.text;
            redCapturedElement.appendChild(pieceElement);
        });
        
        this.capturedPieces.black.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'captured-piece red-piece';
            pieceElement.textContent = piece.text;
            blackCapturedElement.appendChild(pieceElement);
        });
    }

    checkGameOver() {
        // 检查是否有将/帅被吃掉
        let redGeneralExists = false;
        let blackGeneralExists = false;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'general') {
                    if (piece.color === 'red') redGeneralExists = true;
                    if (piece.color === 'black') blackGeneralExists = true;
                }
            }
        }
        
        return !redGeneralExists || !blackGeneralExists;
    }

    updatePlayerDisplay() {
        const playerDisplay = document.getElementById('current-player');
        playerDisplay.textContent = `当前玩家: ${this.currentPlayer === 'red' ? '红方' : '黑方'}`;
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
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.selectedCell = null;
        this.gameOver = false;
        this.capturedPieces = {
            red: [],
            black: []
        };
        
        this.createBoard();
        this.renderBoard();
        this.updatePlayerDisplay();
        this.updateCapturedPieces();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new ChineseChess();
});