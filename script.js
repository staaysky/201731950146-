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

class ChineseChess {
    constructor() {
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.selectedPosition = null;
        this.gameOver = false;
        
        this.initializeBoard();
        this.renderBoard();
        this.bindEvents();
    }

    initializeBoard() {
        // 初始化10x9的棋盘
        this.board = Array(10).fill(null).map(() => Array(9).fill(null));
        
        // 设置初始棋子位置
        // 黑方棋子
        this.board[0][0] = { type: '車', color: 'black' };
        this.board[0][1] = { type: '馬', color: 'black' };
        this.board[0][2] = { type: '相', color: 'black' };
        this.board[0][3] = { type: '仕', color: 'black' };
        this.board[0][4] = { type: '將', color: 'black' };
        this.board[0][5] = { type: '仕', color: 'black' };
        this.board[0][6] = { type: '相', color: 'black' };
        this.board[0][7] = { type: '馬', color: 'black' };
        this.board[0][8] = { type: '車', color: 'black' };
        
        this.board[2][1] = { type: '炮', color: 'black' };
        this.board[2][7] = { type: '炮', color: 'black' };
        
        for (let i = 0; i < 9; i += 2) {
            this.board[3][i] = { type: '卒', color: 'black' };
        }
        
        // 红方棋子
        this.board[9][0] = { type: '車', color: 'red' };
        this.board[9][1] = { type: '馬', color: 'red' };
        this.board[9][2] = { type: '象', color: 'red' };
        this.board[9][3] = { type: '士', color: 'red' };
        this.board[9][4] = { type: '帥', color: 'red' };
        this.board[9][5] = { type: '士', color: 'red' };
        this.board[9][6] = { type: '象', color: 'red' };
        this.board[9][7] = { type: '馬', color: 'red' };
        this.board[9][8] = { type: '車', color: 'red' };
        
        this.board[7][1] = { type: '炮', color: 'red' };
        this.board[7][7] = { type: '炮', color: 'red' };
        
        for (let i = 0; i < 9; i += 2) {
            this.board[6][i] = { type: '兵', color: 'red' };
        }
    }

    renderBoard() {
        const chessboard = document.getElementById('chessboard');
        chessboard.innerHTML = '';
        
        // 绘制棋盘线条
        this.drawBoardLines(chessboard);
        
        // 绘制棋子
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col]) {
                    this.createPieceElement(chessboard, row, col, this.board[row][col]);
                }
            }
        }
    }

    drawBoardLines(chessboard) {
        // 横线
        for (let i = 0; i < 10; i++) {
            const line = document.createElement('div');
            line.className = 'horizontal-line';
            line.style.top = `${i * 60}px`;
            chessboard.appendChild(line);
        }
        
        // 竖线
        for (let i = 0; i < 9; i++) {
            const line = document.createElement('div');
            line.className = 'vertical-line';
            line.style.left = `${i * 60}px`;
            
            // 楚河汉界处断开
            if (i === 0 || i === 8) {
                line.style.height = '540px';
            } else {
                // 上半部分
                const topLine = document.createElement('div');
                topLine.className = 'vertical-line';
                topLine.style.left = `${i * 60}px`;
                topLine.style.height = '270px';
                chessboard.appendChild(topLine);
                
                // 下半部分
                line.style.top = '270px';
                line.style.height = '270px';
            }
            chessboard.appendChild(line);
        }
        
        // 楚河汉界
        const river = document.createElement('div');
        river.className = 'river';
        chessboard.appendChild(river);
        
        const riverText = document.createElement('div');
        riverText.className = 'river-text';
        riverText.textContent = '楚河 汉界';
        chessboard.appendChild(riverText);
        
        // 九宫格斜线
        this.drawPalaceDiagonals(chessboard);
    }

    drawPalaceDiagonals(chessboard) {
        // 上方九宫格
        const topLeftDiagonal = document.createElement('div');
        topLeftDiagonal.style.position = 'absolute';
        topLeftDiagonal.style.top = '0px';
        topLeftDiagonal.style.left = '180px';
        topLeftDiagonal.style.width = '120px';
        topLeftDiagonal.style.height = '1px';
        topLeftDiagonal.style.backgroundColor = '#8b4513';
        topLeftDiagonal.style.transform = 'rotate(45deg)';
        topLeftDiagonal.style.transformOrigin = '0 0';
        chessboard.appendChild(topLeftDiagonal);
        
        const topRightDiagonal = document.createElement('div');
        topRightDiagonal.style.position = 'absolute';
        topRightDiagonal.style.top = '0px';
        topRightDiagonal.style.left = '300px';
        topRightDiagonal.style.width = '120px';
        topRightDiagonal.style.height = '1px';
        topRightDiagonal.style.backgroundColor = '#8b4513';
        topRightDiagonal.style.transform = 'rotate(-45deg)';
        topRightDiagonal.style.transformOrigin = '0 0';
        chessboard.appendChild(topRightDiagonal);
        
        // 下方九宫格
        const bottomLeftDiagonal = document.createElement('div');
        bottomLeftDiagonal.style.position = 'absolute';
        bottomLeftDiagonal.style.top = '480px';
        bottomLeftDiagonal.style.left = '180px';
        bottomLeftDiagonal.style.width = '120px';
        bottomLeftDiagonal.style.height = '1px';
        bottomLeftDiagonal.style.backgroundColor = '#8b4513';
        bottomLeftDiagonal.style.transform = 'rotate(45deg)';
        bottomLeftDiagonal.style.transformOrigin = '0 0';
        chessboard.appendChild(bottomLeftDiagonal);
        
        const bottomRightDiagonal = document.createElement('div');
        bottomRightDiagonal.style.position = 'absolute';
        bottomRightDiagonal.style.top = '480px';
        bottomRightDiagonal.style.left = '300px';
        bottomRightDiagonal.style.width = '120px';
        bottomRightDiagonal.style.height = '1px';
        bottomRightDiagonal.style.backgroundColor = '#8b4513';
        bottomRightDiagonal.style.transform = 'rotate(-45deg)';
        bottomRightDiagonal.style.transformOrigin = '0 0';
        chessboard.appendChild(bottomRightDiagonal);
    }

    createPieceElement(chessboard, row, col, piece) {
        const pieceElement = document.createElement('div');
        pieceElement.className = `chess-piece ${piece.color}-piece`;
        pieceElement.textContent = piece.type;
        pieceElement.style.left = `${col * 60 + 5}px`;
        pieceElement.style.top = `${row * 60 + 5}px`;
        pieceElement.dataset.row = row;
        pieceElement.dataset.col = col;
        
        pieceElement.addEventListener('click', () => this.handlePieceClick(row, col));
        
        chessboard.appendChild(pieceElement);
    }

    handlePieceClick(row, col) {
        if (this.gameOver) return;
        
        const piece = this.board[row][col];
        
        if (this.selectedPiece === null) {
            // 选择棋子
            if (piece && piece.color === this.currentPlayer) {
                this.selectedPiece = piece;
                this.selectedPosition = { row, col };
                this.highlightSelectedPiece(row, col);
                this.showValidMoves(row, col);
            }
        } else {
            // 移动棋子
            if (this.isValidMove(this.selectedPosition.row, this.selectedPosition.col, row, col)) {
                this.movePiece(this.selectedPosition.row, this.selectedPosition.col, row, col);
                this.switchPlayer();
            }
            
            // 清除选择
            this.clearSelection();
        }
    }

    highlightSelectedPiece(row, col) {
        const pieces = document.querySelectorAll('.chess-piece');
        pieces.forEach(piece => {
            if (parseInt(piece.dataset.row) === row && parseInt(piece.dataset.col) === col) {
                piece.classList.add('selected');
            }
        });
    }

    showValidMoves(row, col) {
        // 清除之前的有效移动提示
        document.querySelectorAll('.valid-move').forEach(dot => dot.remove());
        
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.isValidMove(row, col, r, c)) {
                    const dot = document.createElement('div');
                    dot.className = 'valid-move';
                    dot.style.left = `${c * 60 + 20}px`;
                    dot.style.top = `${r * 60 + 20}px`;
                    document.getElementById('chessboard').appendChild(dot);
                }
            }
        }
    }

    clearSelection() {
        this.selectedPiece = null;
        this.selectedPosition = null;
        
        document.querySelectorAll('.selected').forEach(piece => {
            piece.classList.remove('selected');
        });
        
        document.querySelectorAll('.valid-move').forEach(dot => dot.remove());
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const targetPiece = this.board[toRow][toCol];
        
        // 不能吃自己的棋子
        if (targetPiece && targetPiece.color === piece.color) {
            return false;
        }
        
        // 根据棋子类型判断移动规则
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
            case '將':
            case '帥':
                return this.isValidKingMove(fromRow, fromCol, toRow, toCol, piece.color);
            case '炮':
                return this.isValidCannonMove(fromRow, fromCol, toRow, toCol);
            case '卒':
            case '兵':
                return this.isValidPawnMove(fromRow, fromCol, toRow, toCol, piece.color);
            default:
                return false;
        }
    }

    isValidRookMove(fromRow, fromCol, toRow, toCol) {
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
        
        if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
            return false;
        }
        
        // 检查马腿
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
        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && (targetPiece.type === '將' || targetPiece.type === '帥')) {
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
                    return true;
                }
            }
        }
        
        return true;
    }

    isValidCannonMove(fromRow, fromCol, toRow, toCol) {
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
        if (targetPiece) {
            return pieceCount === 1; // 吃子需要隔一个棋子
        } else {
            return pieceCount === 0; // 移动不能有障碍物
        }
    }

    isValidPawnMove(fromRow, fromCol, toRow, toCol, color) {
        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);
        
        if (color === 'red') {
            // 红兵向上走
            if (rowDiff > 0) {
                return false;
            }
            
            if (fromRow > 4) {
                // 未过河，只能向前
                return rowDiff === -1 && colDiff === 0;
            } else {
                // 过河后可以向前或左右
                return (rowDiff === -1 && colDiff === 0) || 
                       (rowDiff === 0 && colDiff === 1);
            }
        } else {
            // 黑卒向下走
            if (rowDiff < 0) {
                return false;
            }
            
            if (fromRow < 5) {
                // 未过河，只能向前
                return rowDiff === 1 && colDiff === 0;
            } else {
                // 过河后可以向前或左右
                return (rowDiff === 1 && colDiff === 0) || 
                       (rowDiff === 0 && colDiff === 1);
            }
        }
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const capturedPiece = this.board[toRow][toCol];
        
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        // 检查是否吃掉了将/帅
        if (capturedPiece && (capturedPiece.type === '將' || capturedPiece.type === '帥')) {
            this.gameOver = true;
            setTimeout(() => {
                alert(`${this.currentPlayer === 'red' ? '红方' : '黑方'}获胜！`);
            }, 100);
        }
        
        this.renderBoard();
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        document.getElementById('current-player').textContent = 
            `当前玩家: ${this.currentPlayer === 'red' ? '红方' : '黑方'}`;
    }

    bindEvents() {
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    restart() {
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.selectedPosition = null;
        this.gameOver = false;
        
        document.getElementById('current-player').textContent = '当前玩家: 红方';
        
        this.initializeBoard();
        this.renderBoard();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new ChineseChess();
});