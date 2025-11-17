class ChineseChess {
    constructor() {
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.gameOver = false;
        this.validMoves = [];
        
        this.init();
    }

    init() {
        this.createBoard();
        this.renderBoard();
        this.attachEventListeners();
        this.updatePlayerDisplay();
    }

    createBoard() {
        // 初始化10x9的棋盘
        this.board = Array(10).fill(null).map(() => Array(9).fill(null));
        
        // 放置红方棋子
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
        this.board[6][0] = { type: '兵', color: 'red' };
        this.board[6][2] = { type: '兵', color: 'red' };
        this.board[6][4] = { type: '兵', color: 'red' };
        this.board[6][6] = { type: '兵', color: 'red' };
        this.board[6][8] = { type: '兵', color: 'red' };
        
        // 放置黑方棋子
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
        this.board[3][0] = { type: '卒', color: 'black' };
        this.board[3][2] = { type: '卒', color: 'black' };
        this.board[3][4] = { type: '卒', color: 'black' };
        this.board[3][6] = { type: '卒', color: 'black' };
        this.board[3][8] = { type: '卒', color: 'black' };
    }

    renderBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        
        // 创建棋盘线条
        const linesContainer = document.createElement('div');
        linesContainer.className = 'board-lines';
        
        // 横线
        for (let i = 0; i < 10; i++) {
            const line = document.createElement('div');
            line.className = 'horizontal-line';
            line.style.top = `${i * 50}px`;
            linesContainer.appendChild(line);
        }
        
        // 竖线
        for (let i = 0; i < 9; i++) {
            const line = document.createElement('div');
            line.className = 'vertical-line';
            line.style.left = `${i * 50}px`;
            
            // 边线完整，中间线在楚河汉界处断开
            if (i === 0 || i === 8) {
                line.style.height = '450px';
            } else {
                // 上半部分
                const topLine = document.createElement('div');
                topLine.className = 'vertical-line';
                topLine.style.left = '0px';
                topLine.style.top = '0px';
                topLine.style.height = '200px';
                linesContainer.appendChild(topLine);
                
                // 下半部分
                const bottomLine = document.createElement('div');
                bottomLine.className = 'vertical-line';
                bottomLine.style.left = '0px';
                bottomLine.style.top = '250px';
                bottomLine.style.height = '200px';
                linesContainer.appendChild(bottomLine);
                continue;
            }
            
            linesContainer.appendChild(line);
        }
        
        // 九宫格斜线
        this.renderPalaceDiagonals(linesContainer);
        
        // 楚河汉界
        const river = document.createElement('div');
        river.className = 'river';
        river.innerHTML = '<span>楚河 &nbsp;&nbsp;&nbsp;&nbsp; 汉界</span>';
        linesContainer.appendChild(river);
        
        boardElement.appendChild(linesContainer);
        
        // 创建棋盘位置和棋子
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const position = document.createElement('div');
                position.className = 'position';
                position.style.left = `${col * 50}px`;
                position.style.top = `${row * 50}px`;
                position.dataset.row = row;
                position.dataset.col = col;
                
                if (this.board[row][col]) {
                    const piece = this.createPieceElement(this.board[row][col]);
                    position.appendChild(piece);
                }
                
                boardElement.appendChild(position);
            }
        }
    }

    renderPalaceDiagonals(container) {
        // 上方九宫格斜线
        const topLeftTop = document.createElement('div');
        topLeftTop.className = 'palace-line';
        topLeftTop.style.left = '150px';
        topLeftTop.style.top = '0px';
        topLeftTop.style.width = '100px';
        topLeftTop.style.height = '1px';
        topLeftTop.style.transform = 'rotate(45deg)';
        topLeftTop.style.transformOrigin = '0 0';
        container.appendChild(topLeftTop);
        
        const topRightTop = document.createElement('div');
        topRightTop.className = 'palace-line';
        topRightTop.style.left = '250px';
        topRightTop.style.top = '0px';
        topRightTop.style.width = '100px';
        topRightTop.style.height = '1px';
        topRightTop.style.transform = 'rotate(135deg)';
        topRightTop.style.transformOrigin = '0 0';
        container.appendChild(topRightTop);
        
        // 下方九宫格斜线
        const bottomLeftTop = document.createElement('div');
        bottomLeftTop.className = 'palace-line';
        bottomLeftTop.style.left = '150px';
        bottomLeftTop.style.top = '350px';
        bottomLeftTop.style.width = '100px';
        bottomLeftTop.style.height = '1px';
        bottomLeftTop.style.transform = 'rotate(135deg)';
        bottomLeftTop.style.transformOrigin = '0 0';
        container.appendChild(bottomLeftTop);
        
        const bottomRightTop = document.createElement('div');
        bottomRightTop.className = 'palace-line';
        bottomRightTop.style.left = '250px';
        bottomRightTop.style.top = '350px';
        bottomRightTop.style.width = '100px';
        bottomRightTop.style.height = '1px';
        bottomRightTop.style.transform = 'rotate(45deg)';
        bottomRightTop.style.transformOrigin = '0 0';
        container.appendChild(bottomRightTop);
    }

    createPieceElement(piece) {
        const pieceElement = document.createElement('div');
        pieceElement.className = `piece ${piece.color}-piece`;
        pieceElement.textContent = piece.type;
        return pieceElement;
    }

    attachEventListeners() {
        const boardElement = document.getElementById('game-board');
        boardElement.addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            const position = e.target.closest('.position');
            if (!position) return;
            
            const row = parseInt(position.dataset.row);
            const col = parseInt(position.dataset.col);
            
            this.handlePositionClick(row, col);
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    handlePositionClick(row, col) {
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
                // 选择新的己方棋子
                this.selectPiece(row, col);
            } else {
                // 无效移动，清除选择
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
        
        const position = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        position.classList.add('selected');
        
        // 显示有效移动位置
        this.showValidMoves(row, col);
        
        // 更新选中棋子信息
        const piece = this.board[row][col];
        const infoElement = document.getElementById('selected-piece-info');
        infoElement.textContent = `选中: ${piece.color === 'red' ? '红方' : '黑方'} ${piece.type}`;
    }

    clearSelection() {
        if (this.selectedPiece) {
            const position = document.querySelector(`[data-row="${this.selectedPiece.row}"][data-col="${this.selectedPiece.col}"]`);
            if (position) position.classList.remove('selected');
        }
        
        // 清除有效移动位置标记
        document.querySelectorAll('.valid-move').forEach(pos => {
            pos.classList.remove('valid-move');
        });
        
        this.selectedPiece = null;
        this.validMoves = [];
        
        // 清除选中棋子信息
        const infoElement = document.getElementById('selected-piece-info');
        infoElement.textContent = '';
    }

    showValidMoves(fromRow, fromCol) {
        this.validMoves = [];
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.isValidMove(fromRow, fromCol, row, col)) {
                    this.validMoves.push({ row, col });
                    const position = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    position.classList.add('valid-move');
                }
            }
        }
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        // 检查目标位置是否在棋盘内
        if (toRow < 0 || toRow >= 10 || toCol < 0 || toCol >= 9) {
            return false;
        }
        
        // 不能原地不动
        if (fromRow === toRow && fromCol === toCol) {
            return false;
        }
        
        const piece = this.board[fromRow][fromCol];
        const targetPiece = this.board[toRow][toCol];
        
        // 不能吃自己的棋子
        if (targetPiece && targetPiece.color === piece.color) {
            return false;
        }
        
        // 根据棋子类型检查移动规则
        switch (piece.type) {
            case '車':
                return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
            case '馬':
                return this.isValidKnightMove(fromRow, fromCol, toRow, toCol);
            case '相':
            case '象':
                return this.isValidElephantMove(fromRow, fromCol, toRow, toCol, piece.color);
            case '仕':
            case '士':
                return this.isValidAdvisorMove(fromRow, fromCol, toRow, toCol, piece.color);
            case '帥':
            case '將':
                return this.isValidKingMove(fromRow, fromCol, toRow, toCol, piece.color);
            case '炮':
            case '砲':
                return this.isValidCannonMove(fromRow, fromCol, toRow, toCol);
            case '兵':
            case '卒':
                return this.isValidPawnMove(fromRow, fromCol, toRow, toCol, piece.color);
            default:
                return false;
        }
    }

    isValidRookMove(fromRow, fromCol, toRow, toCol) {
        // 車只能直线移动
        if (fromRow !== toRow && fromCol !== toCol) {
            return false;
        }
        
        // 检查路径上是否有障碍物
        if (fromRow === toRow) {
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let col = start; col < end; col++) {
                if (this.board[fromRow][col]) {
                    return false;
                }
            }
        } else {
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let row = start; row < end; row++) {
                if (this.board[row][fromCol]) {
                    return false;
                }
            }
        }
        
        return true;
    }

    isValidKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // 馬走日字
        if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
            return false;
        }
        
        // 检查马脚
        if (rowDiff === 2) {
            const blockRow = fromRow + (toRow - fromRow) / 2;
            if (this.board[blockRow][fromCol]) {
                return false;
            }
        } else {
            const blockCol = fromCol + (toCol - fromCol) / 2;
            if (this.board[fromRow][blockCol]) {
                return false;
            }
        }
        
        return true;
    }

    isValidElephantMove(fromRow, fromCol, toRow, toCol, color) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // 相/象走田字
        if (rowDiff !== 2 || colDiff !== 2) {
            return false;
        }
        
        // 不能过河
        if (color === 'red' && toRow < 5) {
            return false;
        }
        if (color === 'black' && toRow > 4) {
            return false;
        }
        
        // 检查象眼
        const midRow = (fromRow + toRow) / 2;
        const midCol = (fromCol + toCol) / 2;
        if (this.board[midRow][midCol]) {
            return false;
        }
        
        return true;
    }

    isValidAdvisorMove(fromRow, fromCol, toRow, toCol, color) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // 仕/士走斜线一格
        if (rowDiff !== 1 || colDiff !== 1) {
            return false;
        }
        
        // 必须在九宫格内
        if (color === 'red') {
            if (toRow < 7 || toCol < 3 || toCol > 5) {
                return false;
            }
        } else {
            if (toRow > 2 || toCol < 3 || toCol > 5) {
                return false;
            }
        }
        
        return true;
    }

    isValidKingMove(fromRow, fromCol, toRow, toCol, color) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // 帥/將只能走一格
        if (rowDiff + colDiff !== 1) {
            return false;
        }
        
        // 必须在九宫格内
        if (color === 'red') {
            if (toRow < 7 || toCol < 3 || toCol > 5) {
                return false;
            }
        } else {
            if (toRow > 2 || toCol < 3 || toCol > 5) {
                return false;
            }
        }
        
        // 检查将帅对面
        if (fromCol === toCol) {
            let hasObstacle = false;
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            
            for (let row = start; row < end; row++) {
                if (this.board[row][fromCol]) {
                    hasObstacle = true;
                    break;
                }
            }
            
            if (!hasObstacle) {
                const targetPiece = this.board[toRow][toCol];
                if (targetPiece && (targetPiece.type === '帥' || targetPiece.type === '將')) {
                    return false; // 将帅对面，不能直接吃
                }
            }
        }
        
        return true;
    }

    isValidCannonMove(fromRow, fromCol, toRow, toCol) {
        // 炮只能直线移动
        if (fromRow !== toRow && fromCol !== toCol) {
            return false;
        }
        
        let pieceCount = 0;
        
        if (fromRow === toRow) {
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let col = start; col < end; col++) {
                if (this.board[fromRow][col]) {
                    pieceCount++;
                }
            }
        } else {
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let row = start; row < end; row++) {
                if (this.board[row][fromCol]) {
                    pieceCount++;
                }
            }
        }
        
        const targetPiece = this.board[toRow][toCol];
        
        // 移动：路径上不能有棋子
        // 吃子：路径上必须有一个棋子（炮架）
        if (targetPiece) {
            return pieceCount === 1;
        } else {
            return pieceCount === 0;
        }
    }

    isValidPawnMove(fromRow, fromCol, toRow, toCol, color) {
        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);
        
        if (color === 'red') {
            // 红兵向上走
            if (rowDiff > 0) {
                return false; // 不能后退
            }
            
            if (fromRow > 4) {
                // 未过河，只能前进一格
                return rowDiff === -1 && colDiff === 0;
            } else {
                // 过河后可以前进或左右移动一格
                return (rowDiff === -1 && colDiff === 0) || 
                       (rowDiff === 0 && colDiff === 1);
            }
        } else {
            // 黑卒向下走
            if (rowDiff < 0) {
                return false; // 不能后退
            }
            
            if (fromRow < 5) {
                // 未过河，只能前进一格
                return rowDiff === 1 && colDiff === 0;
            } else {
                // 过河后可以前进或左右移动一格
                return (rowDiff === 1 && colDiff === 0) || 
                       (rowDiff === 0 && colDiff === 1);
            }
        }
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const capturedPiece = this.board[toRow][toCol];
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        this.renderBoard();
        
        if (capturedPiece) {
            this.showMessage(`吃掉了${capturedPiece.color === 'red' ? '红方' : '黑方'}的${capturedPiece.type}`);
        }
    }

    checkGameOver() {
        // 检查是否有将/帅被吃
        let redKingExists = false;
        let blackKingExists = false;
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    if (piece.type === '帥') redKingExists = true;
                    if (piece.type === '將') blackKingExists = true;
                }
            }
        }
        
        return !redKingExists || !blackKingExists;
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
        }, 2000);
    }

    restart() {
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.gameOver = false;
        this.validMoves = [];
        this.createBoard();
        this.renderBoard();
        this.updatePlayerDisplay();
        
        const infoElement = document.getElementById('selected-piece-info');
        infoElement.textContent = '';
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new ChineseChess();
});