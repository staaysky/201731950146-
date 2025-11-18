class ChineseChess {
    constructor() {
        this.boardRows = 10;
        this.boardCols = 9;
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.gameOver = false;
        
        this.pieceTypes = {
            '帥': { type: 'general', color: 'red', moves: this.getGeneralMoves.bind(this) },
            '將': { type: 'general', color: 'black', moves: this.getGeneralMoves.bind(this) },
            '仕': { type: 'advisor', color: 'red', moves: this.getAdvisorMoves.bind(this) },
            '士': { type: 'advisor', color: 'black', moves: this.getAdvisorMoves.bind(this) },
            '相': { type: 'elephant', color: 'red', moves: this.getElephantMoves.bind(this) },
            '象': { type: 'elephant', color: 'black', moves: this.getElephantMoves.bind(this) },
            '馬': { type: 'horse', color: 'black', moves: this.getHorseMoves.bind(this) },
            '马': { type: 'horse', color: 'red', moves: this.getHorseMoves.bind(this) },
            '車': { type: 'chariot', color: 'black', moves: this.getChariotMoves.bind(this) },
            '车': { type: 'chariot', color: 'red', moves: this.getChariotMoves.bind(this) },
            '炮': { type: 'cannon', color: 'red', moves: this.getCannonMoves.bind(this) },
            '砲': { type: 'cannon', color: 'black', moves: this.getCannonMoves.bind(this) },
            '兵': { type: 'soldier', color: 'red', moves: this.getSoldierMoves.bind(this) },
            '卒': { type: 'soldier', color: 'black', moves: this.getSoldierMoves.bind(this) }
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
        this.board = Array(this.boardRows).fill(null).map(() => Array(this.boardCols).fill(null));
        
        // 初始化红方棋子
        this.board[9][0] = '车';
        this.board[9][1] = '马';
        this.board[9][2] = '相';
        this.board[9][3] = '仕';
        this.board[9][4] = '帥';
        this.board[9][5] = '仕';
        this.board[9][6] = '相';
        this.board[9][7] = '马';
        this.board[9][8] = '车';
        this.board[7][1] = '炮';
        this.board[7][7] = '炮';
        for (let i = 0; i < 9; i += 2) {
            this.board[6][i] = '兵';
        }
        
        // 初始化黑方棋子
        this.board[0][0] = '車';
        this.board[0][1] = '馬';
        this.board[0][2] = '象';
        this.board[0][3] = '士';
        this.board[0][4] = '將';
        this.board[0][5] = '士';
        this.board[0][6] = '象';
        this.board[0][7] = '馬';
        this.board[0][8] = '車';
        this.board[2][1] = '砲';
        this.board[2][7] = '砲';
        for (let i = 0; i < 9; i += 2) {
            this.board[3][i] = '卒';
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        
        // 绘制棋盘线
        const linesContainer = document.createElement('div');
        linesContainer.className = 'board-lines';
        
        // 横线
        for (let i = 0; i < 10; i++) {
            const line = document.createElement('div');
            line.className = 'horizontal-line';
            line.style.top = `${i * 60}px`;
            linesContainer.appendChild(line);
        }
        
        // 竖线
        for (let i = 0; i < 9; i++) {
            const line = document.createElement('div');
            line.className = 'vertical-line';
            line.style.left = `${i * 60}px`;
            
            // 中间的竖线在楚河汉界处断开
            if (i === 0 || i === 8) {
                line.style.height = '540px';
            } else {
                // 上半部分
                const topLine = document.createElement('div');
                topLine.className = 'vertical-line';
                topLine.style.left = `${i * 60}px`;
                topLine.style.height = '240px';
                linesContainer.appendChild(topLine);
                
                // 下半部分
                line.style.top = '300px';
                line.style.height = '240px';
            }
            linesContainer.appendChild(line);
        }
        
        // 楚河汉界
        const river = document.createElement('div');
        river.className = 'river';
        river.textContent = '楚河     汉界';
        linesContainer.appendChild(river);
        
        // 九宫格斜线
        this.drawPalaceLines(linesContainer);
        
        boardElement.appendChild(linesContainer);
        
        // 绘制棋子
        for (let row = 0; row < this.boardRows; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.left = `${col * 60}px`;
                cell.style.top = `${row * 60}px`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.board[row][col]) {
                    const piece = document.createElement('div');
                    const pieceInfo = this.pieceTypes[this.board[row][col]];
                    piece.className = `piece ${pieceInfo.color}-piece`;
                    piece.textContent = this.board[row][col];
                    cell.appendChild(piece);
                }
                
                boardElement.appendChild(cell);
            }
        }
    }

    drawPalaceLines(container) {
        // 上方九宫格
        const topPalaceLines = [
            { x1: 3, y1: 0, x2: 5, y2: 2 },
            { x1: 5, y1: 0, x2: 3, y2: 2 }
        ];
        
        // 下方九宫格
        const bottomPalaceLines = [
            { x1: 3, y1: 7, x2: 5, y2: 9 },
            { x1: 5, y1: 7, x2: 3, y2: 9 }
        ];
        
        [...topPalaceLines, ...bottomPalaceLines].forEach(line => {
            const lineElement = document.createElement('div');
            lineElement.className = 'palace-line';
            
            const x1 = line.x1 * 60;
            const y1 = line.y1 * 60;
            const x2 = line.x2 * 60;
            const y2 = line.y2 * 60;
            
            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            
            lineElement.style.width = `${length}px`;
            lineElement.style.left = `${x1}px`;
            lineElement.style.top = `${y1}px`;
            lineElement.style.transform = `rotate(${angle}deg)`;
            lineElement.style.transformOrigin = '0 0';
            
            container.appendChild(lineElement);
        });
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
            const [selectedRow, selectedCol] = this.selectedPiece;
            
            if (selectedRow === row && selectedCol === col) {
                // 取消选择
                this.clearSelection();
            } else if (this.isValidMove(selectedRow, selectedCol, row, col)) {
                // 执行移动
                this.movePiece(selectedRow, selectedCol, row, col);
            } else if (piece && this.pieceTypes[piece].color === this.currentPlayer) {
                // 选择新棋子
                this.selectPiece(row, col);
            } else {
                this.clearSelection();
            }
        } else if (piece && this.pieceTypes[piece].color === this.currentPlayer) {
            // 选择棋子
            this.selectPiece(row, col);
        }
    }

    selectPiece(row, col) {
        this.clearSelection();
        this.selectedPiece = [row, col];
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const piece = cell.querySelector('.piece');
        if (piece) {
            piece.classList.add('selected');
        }
        
        this.showValidMoves(row, col);
    }

    clearSelection() {
        if (this.selectedPiece) {
            const [selectedRow, selectedCol] = this.selectedPiece;
            const cell = document.querySelector(`[data-row="${selectedRow}"][data-col="${selectedCol}"]`);
            const piece = cell.querySelector('.piece');
            if (piece) {
                piece.classList.remove('selected');
            }
        }
        
        this.selectedPiece = null;
        
        // 清除有效移动标记
        document.querySelectorAll('.valid-move').forEach(cell => {
            cell.classList.remove('valid-move');
        });
    }

    showValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return;
        
        const validMoves = this.pieceTypes[piece].moves(row, col);
        
        validMoves.forEach(([moveRow, moveCol]) => {
            const cell = document.querySelector(`[data-row="${moveRow}"][data-col="${moveCol}"]`);
            if (cell) {
                cell.classList.add('valid-move');
            }
        });
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        const validMoves = this.pieceTypes[piece].moves(fromRow, fromCol);
        return validMoves.some(([row, col]) => row === toRow && col === toCol);
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const capturedPiece = this.board[toRow][toCol];
        
        // 执行移动
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        // 重新渲染棋盘
        this.renderBoard();
        
        // 检查游戏结束
        if (capturedPiece === '帥' || capturedPiece === '將') {
            this.gameOver = true;
            this.showMessage(`${this.currentPlayer === 'red' ? '红方' : '黑方'} 获胜！`);
            return;
        }
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.updatePlayerDisplay();
        
        this.selectedPiece = null;
    }

    getGeneralMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const color = this.pieceTypes[piece].color;
        
        // 将帅只能在九宫格内移动
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            
            // 检查是否在九宫格内
            if (color === 'red') {
                if (newRow >= 7 && newRow <= 9 && newCol >= 3 && newCol <= 5) {
                    if (this.isValidMovePosition(newRow, newCol, color)) {
                        moves.push([newRow, newCol]);
                    }
                }
            } else {
                if (newRow >= 0 && newRow <= 2 && newCol >= 3 && newCol <= 5) {
                    if (this.isValidMovePosition(newRow, newCol, color)) {
                        moves.push([newRow, newCol]);
                    }
                }
            }
        });
        
        return moves;
    }

    getAdvisorMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const color = this.pieceTypes[piece].color;
        
        // 士只能在九宫格内斜着走
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            
            // 检查是否在九宫格内
            if (color === 'red') {
                if (newRow >= 7 && newRow <= 9 && newCol >= 3 && newCol <= 5) {
                    if (this.isValidMovePosition(newRow, newCol, color)) {
                        moves.push([newRow, newCol]);
                    }
                }
            } else {
                if (newRow >= 0 && newRow <= 2 && newCol >= 3 && newCol <= 5) {
                    if (this.isValidMovePosition(newRow, newCol, color)) {
                        moves.push([newRow, newCol]);
                    }
                }
            }
        });
        
        return moves;
    }

    getElephantMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const color = this.pieceTypes[piece].color;
        
        // 相/象走田字，不能过河
        const directions = [[-2, -2], [-2, 2], [2, -2], [2, 2]];
        
        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            const midRow = row + dx / 2;
            const midCol = col + dy / 2;
            
            // 检查是否过河
            if (color === 'red') {
                if (newRow >= 5 && newRow <= 9 && newCol >= 0 && newCol <= 8) {
                    // 检查是否被阻挡（田字中心）
                    if (this.board[midRow][midCol] === null && this.isValidMovePosition(newRow, newCol, color)) {
                        moves.push([newRow, newCol]);
                    }
                }
            } else {
                if (newRow >= 0 && newRow <= 4 && newCol >= 0 && newCol <= 8) {
                    if (this.board[midRow][midCol] === null && this.isValidMovePosition(newRow, newCol, color)) {
                        moves.push([newRow, newCol]);
                    }
                }
            }
        });
        
        return moves;
    }

    getHorseMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const color = this.pieceTypes[piece].color;
        
        // 马走日字
        const directions = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            
            // 检查是否被阻挡
            let blocked = false;
            if (Math.abs(dx) === 2) {
                blocked = this.board[row + dx / 2][col] !== null;
            } else {
                blocked = this.board[row][col + dy / 2] !== null;
            }
            
            if (!blocked && this.isValidPosition(newRow, newCol) && this.isValidMovePosition(newRow, newCol, color)) {
                moves.push([newRow, newCol]);
            }
        });
        
        return moves;
    }

    getChariotMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const color = this.pieceTypes[piece].color;
        
        // 车走直线
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        directions.forEach(([dx, dy]) => {
            for (let i = 1; i < 10; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                
                if (!this.isValidPosition(newRow, newCol)) break;
                
                if (this.board[newRow][newCol] === null) {
                    moves.push([newRow, newCol]);
                } else {
                    if (this.pieceTypes[this.board[newRow][newCol]].color !== color) {
                        moves.push([newRow, newCol]);
                    }
                    break;
                }
            }
        });
        
        return moves;
    }

    getCannonMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const color = this.pieceTypes[piece].color;
        
        // 炮走直线，吃子需要跳过一个棋子
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        directions.forEach(([dx, dy]) => {
            let jumped = false;
            
            for (let i = 1; i < 10; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                
                if (!this.isValidPosition(newRow, newCol)) break;
                
                if (!jumped) {
                    if (this.board[newRow][newCol] === null) {
                        moves.push([newRow, newCol]);
                    } else {
                        jumped = true;
                    }
                } else {
                    if (this.board[newRow][newCol] !== null) {
                        if (this.pieceTypes[this.board[newRow][newCol]].color !== color) {
                            moves.push([newRow, newCol]);
                        }
                        break;
                    }
                }
            }
        });
        
        return moves;
    }

    getSoldierMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const color = this.pieceTypes[piece].color;
        
        if (color === 'red') {
            // 红兵向上走
            if (row > 0) {
                if (this.isValidMovePosition(row - 1, col, color)) {
                    moves.push([row - 1, col]);
                }
            }
            
            // 过河后可以左右走
            if (row <= 4) {
                if (col > 0 && this.isValidMovePosition(row, col - 1, color)) {
                    moves.push([row, col - 1]);
                }
                if (col < 8 && this.isValidMovePosition(row, col + 1, color)) {
                    moves.push([row, col + 1]);
                }
            }
        } else {
            // 黑卒向下走
            if (row < 9) {
                if (this.isValidMovePosition(row + 1, col, color)) {
                    moves.push([row + 1, col]);
                }
            }
            
            // 过河后可以左右走
            if (row >= 5) {
                if (col > 0 && this.isValidMovePosition(row, col - 1, color)) {
                    moves.push([row, col - 1]);
                }
                if (col < 8 && this.isValidMovePosition(row, col + 1, color)) {
                    moves.push([row, col + 1]);
                }
            }
        }
        
        return moves;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.boardRows && col >= 0 && col < this.boardCols;
    }

    isValidMovePosition(row, col, color) {
        if (!this.isValidPosition(row, col)) return false;
        
        const targetPiece = this.board[row][col];
        if (targetPiece === null) return true;
        
        return this.pieceTypes[targetPiece].color !== color;
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
        this.renderBoard();
        this.updatePlayerDisplay();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new ChineseChess();
});