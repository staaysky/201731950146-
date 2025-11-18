class ChineseChess {
    constructor() {
        this.boardRows = 10;
        this.boardCols = 9;
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.gameOver = false;
        
        this.pieceTypes = {
            '帅': { red: '帅', black: '将' },
            '仕': { red: '仕', black: '士' },
            '相': { red: '相', black: '象' },
            '马': { red: '马', black: '马' },
            '车': { red: '车', black: '车' },
            '炮': { red: '炮', black: '炮' },
            '兵': { red: '兵', black: '卒' }
        };
        
        this.init();
    }

    init() {
        this.createBoard();
        this.setupInitialPosition();
        this.renderBoard();
        this.attachEventListeners();
        this.updatePlayerDisplay();
    }

    createBoard() {
        this.board = Array(this.boardRows).fill(null).map(() => Array(this.boardCols).fill(null));
    }

    setupInitialPosition() {
        // 红方棋子（下方）
        this.board[9][0] = { type: '车', color: 'red' };
        this.board[9][1] = { type: '马', color: 'red' };
        this.board[9][2] = { type: '相', color: 'red' };
        this.board[9][3] = { type: '仕', color: 'red' };
        this.board[9][4] = { type: '帅', color: 'red' };
        this.board[9][5] = { type: '仕', color: 'red' };
        this.board[9][6] = { type: '相', color: 'red' };
        this.board[9][7] = { type: '马', color: 'red' };
        this.board[9][8] = { type: '车', color: 'red' };
        
        this.board[7][1] = { type: '炮', color: 'red' };
        this.board[7][7] = { type: '炮', color: 'red' };
        
        for (let col = 0; col < 9; col += 2) {
            this.board[6][col] = { type: '兵', color: 'red' };
        }
        
        // 黑方棋子（上方）
        this.board[0][0] = { type: '车', color: 'black' };
        this.board[0][1] = { type: '马', color: 'black' };
        this.board[0][2] = { type: '相', color: 'black' };
        this.board[0][3] = { type: '仕', color: 'black' };
        this.board[0][4] = { type: '帅', color: 'black' };
        this.board[0][5] = { type: '仕', color: 'black' };
        this.board[0][6] = { type: '相', color: 'black' };
        this.board[0][7] = { type: '马', color: 'black' };
        this.board[0][8] = { type: '车', color: 'black' };
        
        this.board[2][1] = { type: '炮', color: 'black' };
        this.board[2][7] = { type: '炮', color: 'black' };
        
        for (let col = 0; col < 9; col += 2) {
            this.board[3][col] = { type: '兵', color: 'black' };
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        
        // 创建棋盘网格线
        const gridElement = document.createElement('div');
        gridElement.className = 'board-grid';
        
        // 横线
        for (let row = 0; row < 10; row++) {
            const line = document.createElement('div');
            line.className = 'horizontal-line';
            line.style.top = `${row * 48}px`;
            gridElement.appendChild(line);
        }
        
        // 竖线
        for (let col = 0; col < 9; col++) {
            const line = document.createElement('div');
            line.className = 'vertical-line';
            line.style.left = `${col * 48}px`;
            
            // 楚河汉界处断开
            if (col === 0 || col === 8) {
                line.style.height = '440px';
            } else {
                // 创建上半部分
                const topLine = document.createElement('div');
                topLine.className = 'vertical-line';
                topLine.style.left = `${col * 48}px`;
                topLine.style.height = '200px';
                gridElement.appendChild(topLine);
                
                // 创建下半部分
                const bottomLine = document.createElement('div');
                bottomLine.className = 'vertical-line';
                bottomLine.style.left = `${col * 48}px`;
                bottomLine.style.top = '240px';
                bottomLine.style.height = '200px';
                gridElement.appendChild(bottomLine);
                continue;
            }
            
            gridElement.appendChild(line);
        }
        
        // 九宫格斜线
        this.addPalaceDiagonals(gridElement);
        
        // 楚河汉界文字
        const river = document.createElement('div');
        river.className = 'river';
        river.innerHTML = '<span>楚河 &nbsp;&nbsp;&nbsp;&nbsp; 汉界</span>';
        gridElement.appendChild(river);
        
        boardElement.appendChild(gridElement);
        
        // 创建棋子和交互格子
        for (let row = 0; row < this.boardRows; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.left = `${col * 48}px`;
                cell.style.top = `${row * 48}px`;
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

    addPalaceDiagonals(gridElement) {
        // 上方九宫格
        const topLeftTop = document.createElement('div');
        topLeftTop.className = 'palace-line';
        topLeftTop.style.left = '192px';
        topLeftTop.style.top = '0px';
        topLeftTop.style.width = '144px';
        topLeftTop.style.height = '1px';
        topLeftTop.style.transform = 'rotate(45deg)';
        topLeftTop.style.transformOrigin = '0 0';
        gridElement.appendChild(topLeftTop);
        
        const topRightTop = document.createElement('div');
        topRightTop.className = 'palace-line';
        topRightTop.style.left = '288px';
        topRightTop.style.top = '0px';
        topRightTop.style.width = '144px';
        topRightTop.style.height = '1px';
        topRightTop.style.transform = 'rotate(135deg)';
        topRightTop.style.transformOrigin = '0 0';
        gridElement.appendChild(topRightTop);
        
        // 下方九宫格
        const bottomLeftTop = document.createElement('div');
        bottomLeftTop.className = 'palace-line';
        bottomLeftTop.style.left = '192px';
        bottomLeftTop.style.top = '384px';
        bottomLeftTop.style.width = '144px';
        bottomLeftTop.style.height = '1px';
        bottomLeftTop.style.transform = 'rotate(45deg)';
        bottomLeftTop.style.transformOrigin = '0 0';
        gridElement.appendChild(bottomLeftTop);
        
        const bottomRightTop = document.createElement('div');
        bottomRightTop.className = 'palace-line';
        bottomRightTop.style.left = '288px';
        bottomRightTop.style.top = '384px';
        bottomRightTop.style.width = '144px';
        bottomRightTop.style.height = '1px';
        bottomRightTop.style.transform = 'rotate(135deg)';
        bottomRightTop.style.transformOrigin = '0 0';
        gridElement.appendChild(bottomRightTop);
    }

    createPieceElement(piece) {
        const pieceElement = document.createElement('div');
        pieceElement.className = `piece ${piece.color}-piece`;
        pieceElement.textContent = this.pieceTypes[piece.type][piece.color];
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
            
            this.handleCellClick(row, col);
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    handleCellClick(row, col) {
        if (this.selectedPiece) {
            // 尝试移动棋子
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
            } else {
                // 如果点击的是己方棋子，重新选择
                if (this.board[row][col] && this.board[row][col].color === this.currentPlayer) {
                    this.selectPiece(row, col);
                } else {
                    this.clearSelection();
                }
            }
        } else {
            // 选择棋子
            if (this.board[row][col] && this.board[row][col].color === this.currentPlayer) {
                this.selectPiece(row, col);
            }
        }
    }

    selectPiece(row, col) {
        this.clearSelection();
        this.selectedPiece = { row, col };
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('selected');
        
        // 显示可能的移动位置
        this.showValidMoves(row, col);
    }

    clearSelection() {
        if (this.selectedPiece) {
            const selectedCell = document.querySelector(`[data-row="${this.selectedPiece.row}"][data-col="${this.selectedPiece.col}"]`);
            if (selectedCell) {
                selectedCell.classList.remove('selected');
            }
        }
        
        // 清除所有有效移动标记
        document.querySelectorAll('.valid-move').forEach(cell => {
            cell.classList.remove('valid-move');
        });
        
        this.selectedPiece = null;
    }

    showValidMoves(fromRow, fromCol) {
        for (let row = 0; row < this.boardRows; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                if (this.isValidMove(fromRow, fromCol, row, col)) {
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    if (cell) {
                        cell.classList.add('valid-move');
                    }
                }
            }
        }
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        // 不能移动到相同位置
        if (fromRow === toRow && fromCol === toCol) return false;
        
        // 不能吃己方棋子
        if (this.board[toRow][toCol] && this.board[toRow][toCol].color === this.currentPlayer) {
            return false;
        }
        
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        switch (piece.type) {
            case '帅':
                return this.isValidGeneralMove(fromRow, fromCol, toRow, toCol);
            case '仕':
                return this.isValidAdvisorMove(fromRow, fromCol, toRow, toCol);
            case '相':
                return this.isValidElephantMove(fromRow, fromCol, toRow, toCol);
            case '马':
                return this.isValidHorseMove(fromRow, fromCol, toRow, toCol);
            case '车':
                return this.isValidChariotMove(fromRow, fromCol, toRow, toCol);
            case '炮':
                return this.isValidCannonMove(fromRow, fromCol, toRow, toCol);
            case '兵':
                return this.isValidSoldierMove(fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }

    isValidGeneralMove(fromRow, fromCol, toRow, toCol) {
        // 帅/将只能在九宫格内移动
        const palaceRows = this.currentPlayer === 'red' ? [7, 8, 9] : [0, 1, 2];
        const palaceCols = [3, 4, 5];
        
        if (!palaceRows.includes(toRow) || !palaceCols.includes(toCol)) {
            return false;
        }
        
        // 只能移动一格
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    isValidAdvisorMove(fromRow, fromCol, toRow, toCol) {
        // 仕/士只能在九宫格内斜走
        const palaceRows = this.currentPlayer === 'red' ? [7, 8, 9] : [0, 1, 2];
        const palaceCols = [3, 4, 5];
        
        if (!palaceRows.includes(toRow) || !palaceCols.includes(toCol)) {
            return false;
        }
        
        // 只能斜走一格
        return Math.abs(toRow - fromRow) === 1 && Math.abs(toCol - fromCol) === 1;
    }

    isValidElephantMove(fromRow, fromCol, toRow, toCol) {
        // 相/象不能过河
        const riverRow = this.currentPlayer === 'red' ? 5 : 4;
        if ((this.currentPlayer === 'red' && toRow < riverRow) || 
            (this.currentPlayer === 'black' && toRow > riverRow)) {
            return false;
        }
        
        // 走"田"字
        if (Math.abs(toRow - fromRow) !== 2 || Math.abs(toCol - fromCol) !== 2) {
            return false;
        }
        
        // 检查是否被阻挡（田字中心）
        const midRow = (fromRow + toRow) / 2;
        const midCol = (fromCol + toCol) / 2;
        
        return this.board[midRow][midCol] === null;
    }

    isValidHorseMove(fromRow, fromCol, toRow, toCol) {
        // 马走"日"字
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
            return false;
        }
        
        // 检查是否被阻挡
        if (rowDiff === 2) {
            const midRow = (fromRow + toRow) / 2;
            return this.board[midRow][fromCol] === null;
        } else {
            const midCol = (fromCol + toCol) / 2;
            return this.board[fromRow][midCol] === null;
        }
    }

    isValidChariotMove(fromRow, fromCol, toRow, toCol) {
        // 车走直线
        if (fromRow !== toRow && fromCol !== toCol) {
            return false;
        }
        
        // 检查路径上是否有阻挡
        if (fromRow === toRow) {
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let col = start; col < end; col++) {
                if (this.board[fromRow][col] !== null) {
                    return false;
                }
            }
        } else {
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let row = start; row < end; row++) {
                if (this.board[row][fromCol] !== null) {
                    return false;
                }
            }
        }
        
        return true;
    }

    isValidCannonMove(fromRow, fromCol, toRow, toCol) {
        // 炮走直线
        if (fromRow !== toRow && fromCol !== toCol) {
            return false;
        }
        
        let pieceCount = 0;
        
        // 计算路径上的棋子数量
        if (fromRow === toRow) {
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let col = start; col < end; col++) {
                if (this.board[fromRow][col] !== null) {
                    pieceCount++;
                }
            }
        } else {
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let row = start; row < end; row++) {
                if (this.board[row][fromCol] !== null) {
                    pieceCount++;
                }
            }
        }
        
        // 如果目标位置有敌方棋子，需要跳过一个棋子
        if (this.board[toRow][toCol]) {
            return pieceCount === 1;
        } else {
            // 如果目标位置为空，路径必须畅通
            return pieceCount === 0;
        }
    }

    isValidSoldierMove(fromRow, fromCol, toRow, toCol) {
        const forward = this.currentPlayer === 'red' ? -1 : 1;
        const riverRow = this.currentPlayer === 'red' ? 4 : 5;
        const crossedRiver = this.currentPlayer === 'red' ? fromRow <= riverRow : fromRow >= riverRow;
        
        // 只能前进一格
        if (toRow === fromRow + forward && toCol === fromCol) {
            return true;
        }
        
        // 过河后可以左右移动
        if (crossedRiver && toRow === fromRow && Math.abs(toCol - fromCol) === 1) {
            return true;
        }
        
        return false;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const capturedPiece = this.board[toRow][toCol];
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        this.renderBoard();
        
        if (capturedPiece && capturedPiece.type === '帅') {
            return true; // 游戏结束
        }
        
        return false;
    }

    checkGameOver() {
        // 检查是否有帅/将被吃
        let redGeneral = false;
        let blackGeneral = false;
        
        for (let row = 0; row < this.boardRows; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                if (this.board[row][col] && this.board[row][col].type === '帅') {
                    if (this.board[row][col].color === 'red') {
                        redGeneral = true;
                    } else {
                        blackGeneral = true;
                    }
                }
            }
        }
        
        return !redGeneral || !blackGeneral;
    }

    updatePlayerDisplay() {
        const playerDisplay = document.getElementById('current-player');
        playerDisplay.textContent = `当前回合: ${this.currentPlayer === 'red' ? '红方' : '黑方'}`;
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
        this.gameOver = false;
        this.createBoard();
        this.setupInitialPosition();
        this.renderBoard();
        this.updatePlayerDisplay();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new ChineseChess();
});