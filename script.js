class ChineseChess {
    constructor() {
        this.board = [];
        this.currentPlayer = 'red';
        this.gameOver = false;
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.capturedPieces = { red: [], black: [] };
        
        this.init();
    }

    init() {
        this.createBoard();
        this.setupPieces();
        this.renderBoard();
        this.attachEventListeners();
        this.updatePlayerDisplay();
    }

    createBoard() {
        this.board = Array(10).fill(null).map(() => Array(9).fill(null));
    }

    setupPieces() {
        // 红方棋子
        this.board[9][0] = { type: '車', color: 'red' };
        this.board[9][1] = { type: '馬', color: 'red' };
        this.board[9][2] = { type: '相', color: 'red' };
        this.board[9][3] = { type: '仕', color: 'red' };
        this.board[9][4] = { type: '帥', color: 'red' };
        this.board[9][5] = { type: '仕', color: 'red' };
        this.board[9][6] = { type: '相', color: 'red' };
        this.board[9][7] = { type: '馬', color: 'red' };
        this.board[9][8] = { type: '車', color: 'red' };
        
        this.board[7][1] = { type: '炮', color: 'red' };
        this.board[7][7] = { type: '炮', color: 'red' };
        
        for (let i = 0; i < 9; i += 2) {
            this.board[6][i] = { type: '兵', color: 'red' };
        }

        // 黑方棋子
        this.board[0][0] = { type: '車', color: 'black' };
        this.board[0][1] = { type: '馬', color: 'black' };
        this.board[0][2] = { type: '象', color: 'black' };
        this.board[0][3] = { type: '士', color: 'black' };
        this.board[0][4] = { type: '將', color: 'black' };
        this.board[0][5] = { type: '士', color: 'black' };
        this.board[0][6] = { type: '象', color: 'black' };
        this.board[0][7] = { type: '馬', color: 'black' };
        this.board[0][8] = { type: '車', color: 'black' };
        
        this.board[2][1] = { type: '砲', color: 'black' };
        this.board[2][7] = { type: '砲', color: 'black' };
        
        for (let i = 0; i < 9; i += 2) {
            this.board[3][i] = { type: '卒', color: 'black' };
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';

        // 绘制棋盘线
        this.drawBoardLines(boardElement);

        // 绘制楚河汉界
        const river = document.createElement('div');
        river.className = 'river';
        river.textContent = '楚河 汉界';
        boardElement.appendChild(river);

        // 绘制棋盘格子和棋子
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.left = `${col * 50}px`;
                cell.style.top = `${row * 50}px`;
                cell.dataset.row = row;
                cell.dataset.col = col;

                if (this.board[row][col]) {
                    const piece = document.createElement('div');
                    piece.className = `piece ${this.board[row][col].color}-piece`;
                    piece.textContent = this.board[row][col].type;
                    cell.appendChild(piece);
                }

                boardElement.appendChild(cell);
            }
        }
    }

    drawBoardLines(boardElement) {
        // 横线
        for (let i = 0; i < 10; i++) {
            const line = document.createElement('div');
            line.className = 'board-line horizontal-line';
            line.style.top = `${i * 50 + 25}px`;
            boardElement.appendChild(line);
        }

        // 竖线
        for (let i = 0; i < 9; i++) {
            const line = document.createElement('div');
            line.className = 'board-line vertical-line';
            line.style.left = `${i * 50 + 25}px`;
            boardElement.appendChild(line);
        }

        // 九宫格斜线
        // 上方九宫格
        this.drawPalaceDiagonals(boardElement, 0, 3);
        // 下方九宫格
        this.drawPalaceDiagonals(boardElement, 7, 3);
    }

    drawPalaceDiagonals(boardElement, startRow, startCol) {
        // 左上到右下
        const diagonal1 = document.createElement('div');
        diagonal1.className = 'palace-line';
        diagonal1.style.width = '141px';
        diagonal1.style.height = '1px';
        diagonal1.style.left = `${startCol * 50 + 25}px`;
        diagonal1.style.top = `${startRow * 50 + 25}px`;
        diagonal1.style.transform = 'rotate(45deg)';
        diagonal1.style.transformOrigin = '0 0';
        boardElement.appendChild(diagonal1);

        // 右上到左下
        const diagonal2 = document.createElement('div');
        diagonal2.className = 'palace-line';
        diagonal2.style.width = '141px';
        diagonal2.style.height = '1px';
        diagonal2.style.left = `${(startCol + 2) * 50 + 25}px`;
        diagonal2.style.top = `${startRow * 50 + 25}px`;
        diagonal2.style.transform = 'rotate(135deg)';
        diagonal2.style.transformOrigin = '0 0';
        boardElement.appendChild(diagonal2);
    }

    attachEventListeners() {
        const boardElement = document.getElementById('game-board');
        boardElement.addEventListener('click', (e) => {
            if (this.gameOver) return;

            const cell = e.target.closest('.cell');
            if (!cell) return;

            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);

            this.handleCellClick(row, col);
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    handleCellClick(row, col) {
        const piece = this.board[row][col];

        if (this.selectedPiece) {
            // 已选中棋子，尝试移动
            if (this.isValidMove(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
                this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
                this.clearSelection();
                
                // 检查游戏结束
                if (this.checkGameOver()) {
                    this.gameOver = true;
                    this.showMessage(`${this.currentPlayer === 'red' ? '红方' : '黑方'} 获胜！`);
                    return;
                }
                
                // 切换玩家
                this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
                this.updatePlayerDisplay();
            } else if (piece && piece.color === this.currentPlayer) {
                // 选择另一个己方棋子
                this.selectPiece(row, col);
            } else {
                // 点击无效位置，取消选择
                this.clearSelection();
            }
        } else if (piece && piece.color === this.currentPlayer) {
            // 选择棋子
            this.selectPiece(row, col);
        }
    }

    selectPiece(row, col) {
        this.clearSelection();
        this.selectedPiece = { row, col };
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('selected');
        
        this.showPossibleMoves(row, col);
    }

    clearSelection() {
        if (this.selectedPiece) {
            const selectedCell = document.querySelector(`[data-row="${this.selectedPiece.row}"][data-col="${this.selectedPiece.col}"]`);
            if (selectedCell) selectedCell.classList.remove('selected');
        }
        
        this.possibleMoves.forEach(([row, col]) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) cell.classList.remove('possible-move');
        });
        
        this.selectedPiece = null;
        this.possibleMoves = [];
    }

    showPossibleMoves(row, col) {
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.isValidMove(row, col, r, c)) {
                    this.possibleMoves.push([r, c]);
                    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    cell.classList.add('possible-move');
                }
            }
        }
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const capturedPiece = this.board[toRow][toCol];
        if (capturedPiece) {
            this.capturedPieces[capturedPiece.color].push(capturedPiece);
            this.updateCapturedPieces();
        }
        
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        this.renderBoard();
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && targetPiece.color === piece.color) return false;
        
        const pieceType = piece.type;
        const deltaRow = toRow - fromRow;
        const deltaCol = toCol - fromCol;
        
        switch (pieceType) {
            case '將':
            case '帥':
                return this.isValidGeneralMove(fromRow, fromCol, toRow, toCol, piece.color);
            case '士':
            case '仕':
                return this.isValidAdvisorMove(fromRow, fromCol, toRow, toCol, piece.color);
            case '象':
            case '相':
                return this.isValidElephantMove(fromRow, fromCol, toRow, toCol, piece.color);
            case '馬':
                return this.isValidHorseMove(fromRow, fromCol, toRow, toCol);
            case '車':
                return this.isValidChariotMove(fromRow, fromCol, toRow, toCol);
            case '砲':
            case '炮':
                return this.isValidCannonMove(fromRow, fromCol, toRow, toCol);
            case '卒':
            case '兵':
                return this.isValidSoldierMove(fromRow, fromCol, toRow, toCol, piece.color);
            default:
                return false;
        }
    }

    isValidGeneralMove(fromRow, fromCol, toRow, toCol, color) {
        // 九宫格限制
        if (color === 'red') {
            if (toRow < 7 || toCol < 3 || toCol > 5) return false;
        } else {
            if (toRow > 2 || toCol < 3 || toCol > 5) return false;
        }
        
        // 只能移动一格
        const deltaRow = Math.abs(toRow - fromRow);
        const deltaCol = Math.abs(toCol - fromCol);
        
        return (deltaRow === 1 && deltaCol === 0) || (deltaRow === 0 && deltaCol === 1);
    }

    isValidAdvisorMove(fromRow, fromCol, toRow, toCol, color) {
        // 九宫格限制
        if (color === 'red') {
            if (toRow < 7 || toCol < 3 || toCol > 5) return false;
        } else {
            if (toRow > 2 || toCol < 3 || toCol > 5) return false;
        }
        
        // 斜线移动一格
        const deltaRow = Math.abs(toRow - fromRow);
        const deltaCol = Math.abs(toCol - fromCol);
        
        return deltaRow === 1 && deltaCol === 1;
    }

    isValidElephantMove(fromRow, fromCol, toRow, toCol, color) {
        // 不能过河
        if (color === 'red') {
            if (toRow < 5) return false;
        } else {
            if (toRow > 4) return false;
        }
        
        // 走田字
        const deltaRow = Math.abs(toRow - fromRow);
        const deltaCol = Math.abs(toCol - fromCol);
        
        if (deltaRow !== 2 || deltaCol !== 2) return false;
        
        // 检查是否被阻挡
        const midRow = (fromRow + toRow) / 2;
        const midCol = (fromCol + toCol) / 2;
        
        return this.board[midRow][midCol] === null;
    }

    isValidHorseMove(fromRow, fromCol, toRow, toCol) {
        const deltaRow = Math.abs(toRow - fromRow);
        const deltaCol = Math.abs(toCol - fromCol);
        
        // 走日字
        if (!((deltaRow === 2 && deltaCol === 1) || (deltaRow === 1 && deltaCol === 2))) {
            return false;
        }
        
        // 检查是否被阻挡
        if (deltaRow === 2) {
            const midRow = fromRow + (toRow - fromRow) / 2;
            return this.board[midRow][fromCol] === null;
        } else {
            const midCol = fromCol + (toCol - fromCol) / 2;
            return this.board[fromRow][midCol] === null;
        }
    }

    isValidChariotMove(fromRow, fromCol, toRow, toCol) {
        // 必须直线移动
        if (fromRow !== toRow && fromCol !== toCol) return false;
        
        // 检查路径是否有阻挡
        if (fromRow === toRow) {
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let col = start; col < end; col++) {
                if (this.board[fromRow][col] !== null) return false;
            }
        } else {
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let row = start; row < end; row++) {
                if (this.board[row][fromCol] !== null) return false;
            }
        }
        
        return true;
    }

    isValidCannonMove(fromRow, fromCol, toRow, toCol) {
        // 必须直线移动
        if (fromRow !== toRow && fromCol !== toCol) return false;
        
        let pieceCount = 0;
        
        // 计算路径上的棋子数量
        if (fromRow === toRow) {
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let col = start; col < end; col++) {
                if (this.board[fromRow][col] !== null) pieceCount++;
            }
        } else {
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let row = start; row < end; row++) {
                if (this.board[row][fromCol] !== null) pieceCount++;
            }
        }
        
        // 移动：路径必须无障碍；吃子：必须跳过一个棋子
        const targetPiece = this.board[toRow][toCol];
        if (targetPiece) {
            return pieceCount === 1;
        } else {
            return pieceCount === 0;
        }
    }

    isValidSoldierMove(fromRow, fromCol, toRow, toCol, color) {
        const deltaRow = toRow - fromRow;
        const deltaCol = Math.abs(toCol - fromCol);
        
        if (color === 'red') {
            // 红兵向上走
            if (fromRow <= 4) {
                // 过河后可以左右移动
                return (deltaRow === -1 && deltaCol === 0) || 
                       (deltaRow === 0 && deltaCol === 1);
            } else {
                // 未过河只能向前
                return deltaRow === -1 && deltaCol === 0;
            }
        } else {
            // 黑卒向下走
            if (fromRow >= 5) {
                // 过河后可以左右移动
                return (deltaRow === 1 && deltaCol === 0) || 
                       (deltaRow === 0 && deltaCol === 1);
            } else {
                // 未过河只能向前
                return deltaRow === 1 && deltaCol === 0;
            }
        }
    }

    checkGameOver() {
        // 检查是否有将/帅被吃
        let redGeneral = false;
        let blackGeneral = false;
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    if (piece.type === '帥') redGeneral = true;
                    if (piece.type === '將') blackGeneral = true;
                }
            }
        }
        
        return !redGeneral || !blackGeneral;
    }

    updatePlayerDisplay() {
        const playerDisplay = document.getElementById('current-player');
        playerDisplay.textContent = `当前玩家: ${this.currentPlayer === 'red' ? '红方' : '黑方'}`;
    }

    updateCapturedPieces() {
        const redCaptured = document.querySelector('.captured-red');
        const blackCaptured = document.querySelector('.captured-black');
        
        redCaptured.innerHTML = '<h4>红方吃子:</h4>';
        blackCaptured.innerHTML = '<h4>黑方吃子:</h4>';
        
        this.capturedPieces.red.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'captured-piece black-piece';
            pieceElement.textContent = piece.type;
            redCaptured.appendChild(pieceElement);
        });
        
        this.capturedPieces.black.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'captured-piece red-piece';
            pieceElement.textContent = piece.type;
            blackCaptured.appendChild(pieceElement);
        });
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
        this.gameOver = false;
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.capturedPieces = { red: [], black: [] };
        
        this.createBoard();
        this.setupPieces();
        this.renderBoard();
        this.updatePlayerDisplay();
        this.updateCapturedPieces();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new ChineseChess();
});