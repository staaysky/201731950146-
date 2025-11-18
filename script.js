class FlyingChess {
    constructor() {
        this.boardSize = 15;
        this.board = [];
        this.currentPlayer = 'red';
        this.players = ['red', 'blue', 'yellow', 'green'];
        this.gameOver = false;
        this.diceValue = 0;
        this.canRollDice = true;
        this.selectablePieces = [];
        
        // 玩家棋子状态: 每个玩家有4个棋子
        this.pieces = {
            red: [
                { id: 'red1', position: -1, isHome: false, finished: false },
                { id: 'red2', position: -1, isHome: false, finished: false },
                { id: 'red3', position: -1, isHome: false, finished: false },
                { id: 'red4', position: -1, isHome: false, finished: false }
            ],
            blue: [
                { id: 'blue1', position: -1, isHome: false, finished: false },
                { id: 'blue2', position: -1, isHome: false, finished: false },
                { id: 'blue3', position: -1, isHome: false, finished: false },
                { id: 'blue4', position: -1, isHome: false, finished: false }
            ],
            yellow: [
                { id: 'yellow1', position: -1, isHome: false, finished: false },
                { id: 'yellow2', position: -1, isHome: false, finished: false },
                { id: 'yellow3', position: -1, isHome: false, finished: false },
                { id: 'yellow4', position: -1, isHome: false, finished: false }
            ],
            green: [
                { id: 'green1', position: -1, isHome: false, finished: false },
                { id: 'green2', position: -1, isHome: false, finished: false },
                { id: 'green3', position: -1, isHome: false, finished: false },
                { id: 'green4', position: -1, isHome: false, finished: false }
            ]
        };
        
        // 定义飞行棋路径
        this.definePaths();
        
        this.init();
    }

    init() {
        this.createBoard();
        this.renderBoard();
        this.attachEventListeners();
        this.updatePlayerDisplay();
        this.updateHomePieces();
    }

    definePaths() {
        // 定义每个颜色的起始位置和路径
        this.startPositions = {
            red: 0,
            blue: 13,
            yellow: 26,
            green: 39
        };
        
        // 定义主路径 (52个格子)
        this.mainPath = [];
        
        // 简化的路径定义 - 实际飞行棋路径更复杂
        // 这里创建一个环形路径
        for (let i = 0; i < 52; i++) {
            this.mainPath.push(this.getPositionFromIndex(i));
        }
        
        // 定义安全点
        this.safeSpots = [0, 8, 13, 21, 26, 34, 39, 47];
    }

    getPositionFromIndex(index) {
        // 将线性索引转换为棋盘坐标
        // 这里简化处理，实际飞行棋路径更复杂
        const positions = [
            // 红色路径
            {row: 6, col: 1}, {row: 5, col: 1}, {row: 4, col: 1}, {row: 3, col: 1}, {row: 2, col: 1}, {row: 1, col: 1},
            {row: 1, col: 2}, {row: 1, col: 3}, {row: 1, col: 4}, {row: 1, col: 5}, {row: 1, col: 6}, {row: 1, col: 7}, {row: 1, col: 8},
            // 蓝色路径
            {row: 1, col: 8}, {row: 1, col: 9}, {row: 1, col: 10}, {row: 1, col: 11}, {row: 1, col: 12}, {row: 1, col: 13},
            {row: 2, col: 13}, {row: 3, col: 13}, {row: 4, col: 13}, {row: 5, col: 13}, {row: 6, col: 13}, {row: 7, col: 13}, {row: 8, col: 13},
            // 黄色路径
            {row: 8, col: 13}, {row: 9, col: 13}, {row: 10, col: 13}, {row: 11, col: 13}, {row: 12, col: 13}, {row: 13, col: 13},
            {row: 13, col: 12}, {row: 13, col: 11}, {row: 13, col: 10}, {row: 13, col: 9}, {row: 13, col: 8}, {row: 13, col: 7}, {row: 13, col: 6},
            // 绿色路径
            {row: 13, col: 6}, {row: 13, col: 5}, {row: 13, col: 4}, {row: 13, col: 3}, {row: 13, col: 2}, {row: 13, col: 1},
            {row: 12, col: 1}, {row: 11, col: 1}, {row: 10, col: 1}, {row: 9, col: 1}, {row: 8, col: 1}, {row: 7, col: 1}, {row: 6, col: 1}
        ];
        
        return positions[index % positions.length];
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
                
                // 设置特殊格子
                this.setCellType(cell, row, col);
                
                // 检查是否有棋子在这个位置
                this.addPiecesToCell(cell, row, col);
                
                boardElement.appendChild(cell);
            }
        }
    }

    setCellType(cell, row, col) {
        // 设置起始位置
        if (row === 1 && col === 1) {
            cell.classList.add('red-start');
        } else if (row === 1 && col === 13) {
            cell.classList.add('blue-start');
        } else if (row === 13 && col === 13) {
            cell.classList.add('yellow-start');
        } else if (row === 13 && col === 1) {
            cell.classList.add('green-start');
        }
        
        // 设置安全点
        const isSafeSpot = this.safeSpots.some(index => {
            const pos = this.getPositionFromIndex(index);
            return pos.row === row && pos.col === col;
        });
        
        if (isSafeSpot) {
            cell.classList.add('safe');
        }
        
        // 设置路径
        const isPath = this.mainPath.some(pos => pos.row === row && pos.col === col);
        if (isPath) {
            cell.classList.add('path');
        }
    }

    addPiecesToCell(cell, row, col) {
        // 检查所有玩家的棋子是否在这个位置
        for (const player of this.players) {
            for (const piece of this.pieces[player]) {
                if (!piece.isHome && !piece.finished && piece.position >= 0) {
                    const pos = this.getPositionFromIndex(piece.position);
                    if (pos.row === row && pos.col === col) {
                        const pieceElement = document.createElement('div');
                        pieceElement.className = `piece ${player}`;
                        pieceElement.dataset.pieceId = piece.id;
                        
                        // 如果这个棋子可以被当前玩家移动，添加可选中样式
                        if (player === this.currentPlayer && this.selectablePieces.includes(piece.id)) {
                            pieceElement.classList.add('selectable');
                        }
                        
                        cell.appendChild(pieceElement);
                    }
                }
            }
        }
    }

    attachEventListeners() {
        // 掷骰子按钮
        document.getElementById('roll-dice').addEventListener('click', () => {
            if (this.canRollDice && !this.gameOver) {
                this.rollDice();
            }
        });
        
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
        
        // 棋盘点击事件
        document.getElementById('game-board').addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            const piece = e.target.closest('.piece');
            if (!piece) return;
            
            const pieceId = piece.dataset.pieceId;
            if (this.selectablePieces.includes(pieceId)) {
                this.movePiece(pieceId);
            }
        });
    }

    rollDice() {
        this.canRollDice = false;
        document.getElementById('roll-dice').disabled = true;
        
        // 添加旋转动画
        const diceDisplay = document.getElementById('dice-display');
        diceDisplay.classList.add('rolling');
        
        // 模拟掷骰子
        setTimeout(() => {
            this.diceValue = Math.floor(Math.random() * 6) + 1;
            diceDisplay.classList.remove('rolling');
            document.getElementById('dice-result').textContent = `点数: ${this.diceValue}`;
            
            // 查找可移动的棋子
            this.findMovablePieces();
            
            // 如果没有可移动的棋子，切换到下一个玩家
            if (this.selectablePieces.length === 0) {
                this.showMessage('没有可移动的棋子');
                setTimeout(() => {
                    this.nextPlayer();
                }, 1500);
            } else {
                this.showMessage('请选择要移动的棋子');
                this.renderBoard(); // 重新渲染以显示可选择的棋子
            }
        }, 500);
    }

    findMovablePieces() {
        this.selectablePieces = [];
        const currentPieces = this.pieces[this.currentPlayer];
        
        for (const piece of currentPieces) {
            // 棋子在家中，需要掷到6才能出发
            if (piece.isHome) {
                if (this.diceValue === 6) {
                    this.selectablePieces.push(piece.id);
                }
            } 
            // 棋子已经在路上
            else if (!piece.finished) {
                // 检查移动后是否超出终点
                const newPosition = (piece.position + this.diceValue) % 52;
                if (this.isValidMove(piece, newPosition)) {
                    this.selectablePieces.push(piece.id);
                }
            }
        }
    }

    isValidMove(piece, newPosition) {
        // 简化的移动验证
        // 实际游戏需要检查是否进入终点区域等
        return true;
    }

    movePiece(pieceId) {
        const piece = this.findPiece(pieceId);
        if (!piece) return;
        
        // 从家中出发
        if (piece.isHome && this.diceValue === 6) {
            piece.isHome = false;
            piece.position = this.startPositions[this.currentPlayer];
        } 
        // 在路上移动
        else if (!piece.finished) {
            piece.position = (piece.position + this.diceValue) % 52;
            
            // 检查是否到达终点（简化处理）
            if (piece.position === this.startPositions[this.currentPlayer] && this.getDistanceFromStart(piece) >= 50) {
                piece.finished = true;
                this.showMessage(`${this.currentPlayer}的棋子到达终点！`);
            }
            
            // 检查是否可以击落其他棋子
            this.checkCapture(piece);
        }
        
        // 清除可选棋子列表
        this.selectablePieces = [];
        
        // 重新渲染棋盘
        this.renderBoard();
        this.updateHomePieces();
        
        // 如果掷到6，可以再掷一次
        if (this.diceValue === 6) {
            this.canRollDice = true;
            document.getElementById('roll-dice').disabled = false;
            this.showMessage('掷到6，可以再掷一次！');
        } else {
            // 切换到下一个玩家
            setTimeout(() => {
                this.nextPlayer();
            }, 1000);
        }
        
        // 检查游戏是否结束
        this.checkGameEnd();
    }

    findPiece(pieceId) {
        for (const player of this.players) {
            for (const piece of this.pieces[player]) {
                if (piece.id === pieceId) {
                    return piece;
                }
            }
        }
        return null;
    }

    getDistanceFromStart(piece) {
        // 计算棋子从起始点移动的距离
        const startPos = this.startPositions[this.currentPlayer];
        let distance = piece.position - startPos;
        if (distance < 0) {
            distance += 52;
        }
        return distance;
    }

    checkCapture(movingPiece) {
        // 检查是否可以击落其他玩家的棋子
        const currentPos = this.getPositionFromIndex(movingPiece.position);
        
        // 检查是否是安全点
        const isSafeSpot = this.safeSpots.includes(movingPiece.position);
        if (isSafeSpot) return;
        
        // 检查其他玩家的棋子
        for (const player of this.players) {
            if (player === this.currentPlayer) continue;
            
            for (const piece of this.pieces[player]) {
                if (!piece.isHome && !piece.finished && piece.position === movingPiece.position) {
                    // 击落对方棋子，送回家中
                    piece.isHome = true;
                    piece.position = -1;
                    this.showMessage(`${this.currentPlayer}击落了${player}的棋子！`);
                }
            }
        }
    }

    nextPlayer() {
        const currentIndex = this.players.indexOf(this.currentPlayer);
        this.currentPlayer = this.players[(currentIndex + 1) % this.players.length];
        this.canRollDice = true;
        document.getElementById('roll-dice').disabled = false;
        document.getElementById('dice-result').textContent = '';
        this.updatePlayerDisplay();
        this.renderBoard();
    }

    updatePlayerDisplay() {
        const playerDisplay = document.getElementById('current-player');
        const playerNames = {
            red: '红色',
            blue: '蓝色',
            yellow: '黄色',
            green: '绿色'
        };
        playerDisplay.textContent = `当前玩家: ${playerNames[this.currentPlayer]}`;
    }

    updateHomePieces() {
        // 更新每个玩家的家中棋子显示
        for (const player of this.players) {
            const homeElement = document.getElementById(`${player}-home`);
            homeElement.innerHTML = '';
            
            for (const piece of this.pieces[player]) {
                if (piece.isHome) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `home-piece ${player}`;
                    homeElement.appendChild(pieceElement);
                }
            }
        }
    }

    checkGameEnd() {
        // 检查是否有玩家所有棋子都到达终点
        for (const player of this.players) {
            const allFinished = this.pieces[player].every(piece => piece.finished);
            if (allFinished) {
                this.gameOver = true;
                const playerNames = {
                    red: '红色',
                    blue: '蓝色',
                    yellow: '黄色',
                    green: '绿色'
                };
                this.showMessage(`🎉 ${playerNames[player]}玩家获胜！`);
                return;
            }
        }
    }

    showMessage(message) {
        // 移除已存在的消息
        const existingMessage = document.querySelector('.game-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
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
        // 重置游戏状态
        this.currentPlayer = 'red';
        this.gameOver = false;
        this.diceValue = 0;
        this.canRollDice = true;
        this.selectablePieces = [];
        
        // 重置所有棋子
        for (const player of this.players) {
            for (const piece of this.pieces[player]) {
                piece.position = -1;
                piece.isHome = false;
                piece.finished = false;
            }
        }
        
        // 重置UI
        document.getElementById('roll-dice').disabled = false;
        document.getElementById('dice-result').textContent = '';
        
        // 重新初始化
        this.updatePlayerDisplay();
        this.renderBoard();
        this.updateHomePieces();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new FlyingChess();
});