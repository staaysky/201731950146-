class FlyingChess {
    constructor() {
        this.boardSize = 15;
        this.board = [];
        this.currentPlayer = 'red';
        this.players = ['red', 'yellow', 'blue', 'green'];
        this.diceValue = 0;
        this.gameOver = false;
        this.pieces = {};
        this.boardPath = [];
        this.homePositions = {};
        this.safePositions = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
        this.isRolling = false;
        
        this.init();
    }

    init() {
        this.createBoard();
        this.initializePieces();
        this.renderBoard();
        this.attachEventListeners();
        this.updatePlayerDisplay();
        this.updatePiecesCount();
    }

    createBoard() {
        // 创建飞行棋路径 (简化版，52个格子的环形路径)
        this.boardPath = [];
        
        // 上边 (13个格子)
        for (let i = 0; i < 13; i++) {
            this.boardPath.push({ x: 6 + i, y: 0 });
        }
        
        // 右边 (13个格子)
        for (let i = 1; i < 13; i++) {
            this.boardPath.push({ x: 18, y: i });
        }
        
        // 下边 (13个格子)
        for (let i = 17; i >= 5; i--) {
            this.boardPath.push({ x: i, y: 12 });
        }
        
        // 左边 (13个格子)
        for (let i = 11; i >= 1; i--) {
            this.boardPath.push({ x: 5, y: i });
        }
        
        // 设置起始位置
        this.homePositions = {
            red: { x: 1, y: 1 },      // 左上角
            yellow: { x: 16, y: 1 },   // 右上角
            blue: { x: 16, y: 10 },    // 右下角
            green: { x: 1, y: 10 }     // 左下角
        };
    }

    initializePieces() {
        this.pieces = {};
        this.players.forEach(player => {
            this.pieces[player] = [];
            for (let i = 0; i < 4; i++) {
                this.pieces[player].push({
                    id: `${player}-${i}`,
                    position: -1, // -1 表示在家中
                    isHome: true,
                    isFinished: false
                });
            }
        });
    }

    renderBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        
        // 渲染路径格子
        this.boardPath.forEach((pos, index) => {
            const cell = document.createElement('div');
            cell.className = 'board-cell path';
            cell.style.left = `${pos.x * 30}px`;
            cell.style.top = `${pos.y * 40}px`;
            cell.dataset.index = index;
            
            if (this.safePositions.has(index)) {
                cell.classList.add('safe');
            }
            
            // 起始位置特殊标记
            if (index === 0 || index === 13 || index === 26 || index === 39) {
                cell.classList.add('start');
            }
            
            boardElement.appendChild(cell);
        });
        
        // 渲染棋子
        this.renderPieces();
    }

    renderPieces() {
        // 先移除所有现有棋子
        document.querySelectorAll('.piece').forEach(piece => piece.remove());
        
        this.players.forEach(player => {
            this.pieces[player].forEach(piece => {
                if (piece.isFinished) return;
                
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece ${player}`;
                pieceElement.id = piece.id;
                
                if (piece.isHome) {
                    // 在家中
                    const homePos = this.homePositions[player];
                    pieceElement.style.left = `${homePos.x * 30 + 5}px`;
                    pieceElement.style.top = `${homePos.y * 40 + 10}px`;
                } else {
                    // 在路径上
                    const pathPos = this.boardPath[piece.position];
                    pieceElement.style.left = `${pathPos.x * 30 + 5}px`;
                    pieceElement.style.top = `${pathPos.y * 40 + 5}px`;
                }
                
                document.getElementById('game-board').appendChild(pieceElement);
            });
        });
    }

    attachEventListeners() {
        document.getElementById('roll-dice-btn').addEventListener('click', () => {
            this.rollDice();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });

        // 棋子点击事件
        document.getElementById('game-board').addEventListener('click', (e) => {
            if (this.gameOver || this.diceValue === 0) return;
            
            const piece = e.target.closest('.piece');
            if (!piece) return;
            
            const pieceId = piece.id;
            const [player, index] = pieceId.split('-');
            
            if (player !== this.currentPlayer) return;
            
            this.movePiece(player, parseInt(index));
        });
    }

    rollDice() {
        if (this.isRolling || this.gameOver) return;
        
        this.isRolling = true;
        const diceElement = document.querySelector('.dice');
        if (!diceElement) {
            this.createDiceElement();
        }
        
        const rollBtn = document.getElementById('roll-dice-btn');
        rollBtn.disabled = true;
        
        // 添加滚动动画
        document.querySelector('.dice').classList.add('rolling');
        
        // 模拟骰子滚动
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            this.diceValue = Math.floor(Math.random() * 6) + 1;
            document.getElementById('dice-result').innerHTML = 
                `<div class="dice-container"><div class="dice">${this.diceValue}</div></div>`;
            rollCount++;
            
            if (rollCount > 10) {
                clearInterval(rollInterval);
                document.querySelector('.dice').classList.remove('rolling');
                this.isRolling = false;
                rollBtn.disabled = false;
                this.checkMovablePieces();
            }
        }, 100);
    }

    createDiceElement() {
        document.getElementById('dice-result').innerHTML = 
            '<div class="dice-container"><div class="dice">-</div></div>';
    }

    checkMovablePieces() {
        const playerPieces = this.pieces[this.currentPlayer];
        let hasMovablePieces = false;
        
        playerPieces.forEach((piece, index) => {
            if (piece.isFinished) return;
            
            // 检查是否可以移动
            if (piece.isHome && this.diceValue === 6) {
                // 可以从家中出发
                hasMovablePieces = true;
                this.highlightPiece(`${this.currentPlayer}-${index}`);
            } else if (!piece.isHome) {
                // 可以在路径上移动
                hasMovablePieces = true;
                this.highlightPiece(`${this.currentPlayer}-${index}`);
            }
        });
        
        if (!hasMovablePieces) {
            // 没有可移动的棋子，切换玩家
            setTimeout(() => {
                this.nextPlayer();
            }, 1000);
        }
    }

    highlightPiece(pieceId) {
        const piece = document.getElementById(pieceId);
        if (piece) {
            piece.classList.add('movable');
        }
    }

    movePiece(player, pieceIndex) {
        const piece = this.pieces[player][pieceIndex];
        
        // 移除高亮
        document.querySelectorAll('.movable').forEach(p => p.classList.remove('movable'));
        
        if (piece.isHome) {
            if (this.diceValue === 6) {
                // 从家中出发
                const startIndex = this.getStartPosition(player);
                piece.position = startIndex;
                piece.isHome = false;
                this.renderPieces();
                this.checkCollision(player, pieceIndex);
                
                // 掷出6可以再掷一次
                this.diceValue = 0;
                document.getElementById('dice-result').innerHTML = '<div class="dice-container"><div class="dice">-</div></div>';
            }
        } else {
            // 在路径上移动
            const newPosition = piece.position + this.diceValue;
            
            if (newPosition >= 52) {
                // 到达终点
                piece.isFinished = true;
                this.renderPieces();
                this.updatePiecesCount();
                this.checkWin(player);
            } else {
                piece.position = newPosition;
                this.renderPieces();
                this.checkCollision(player, pieceIndex);
                
                // 如果掷出6，可以再掷一次
                if (this.diceValue === 6) {
                    this.diceValue = 0;
                    document.getElementById('dice-result').innerHTML = '<div class="dice-container"><div class="dice">-</div></div>';
                } else {
                    this.nextPlayer();
                }
            }
        }
    }

    getStartPosition(player) {
        const startPositions = {
            red: 0,
            yellow: 13,
            blue: 26,
            green: 39
        };
        return startPositions[player];
    }

    checkCollision(player, pieceIndex) {
        const piece = this.pieces[player][pieceIndex];
        const position = piece.position;
        
        // 检查是否有其他玩家的棋子在同一位置
        this.players.forEach(otherPlayer => {
            if (otherPlayer === player) return;
            
            this.pieces[otherPlayer].forEach((otherPiece, otherIndex) => {
                if (!otherPiece.isHome && !otherPiece.isFinished && otherPiece.position === position) {
                    // 如果不是安全点，将对方棋子送回家
                    if (!this.safePositions.has(position)) {
                        otherPiece.isHome = true;
                        otherPiece.position = -1;
                        this.showMessage(`${this.getPlayerName(otherPlayer)}的棋子被送回家！`);
                        this.renderPieces();
                    }
                }
            });
        });
    }

    getPlayerName(player) {
        const names = {
            red: '红色',
            yellow: '黄色',
            blue: '蓝色',
            green: '绿色'
        };
        return names[player];
    }

    nextPlayer() {
        const currentIndex = this.players.indexOf(this.currentPlayer);
        this.currentPlayer = this.players[(currentIndex + 1) % 4];
        this.diceValue = 0;
        document.getElementById('dice-result').innerHTML = '<div class="dice-container"><div class="dice">-</div></div>';
        this.updatePlayerDisplay();
    }

    updatePlayerDisplay() {
        const playerDisplay = document.getElementById('current-player');
        playerDisplay.textContent = `当前玩家: ${this.getPlayerName(this.currentPlayer)}`;
        playerDisplay.style.color = this.currentPlayer;
    }

    updatePiecesCount() {
        this.players.forEach(player => {
            const activePieces = this.pieces[player].filter(p => !p.isFinished).length;
            document.getElementById(`${player}-pieces`).textContent = activePieces;
        });
    }

    checkWin(player) {
        const allFinished = this.pieces[player].every(piece => piece.isFinished);
        if (allFinished) {
            this.gameOver = true;
            this.showMessage(`${this.getPlayerName(player)}玩家获胜！`);
        }
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
        this.currentPlayer = 'red';
        this.diceValue = 0;
        this.gameOver = false;
        this.isRolling = false;
        this.initializePieces();
        this.renderBoard();
        this.updatePlayerDisplay();
        this.updatePiecesCount();
        document.getElementById('dice-result').innerHTML = '<div class="dice-container"><div class="dice">-</div></div>';
        document.getElementById('roll-dice-btn').disabled = false;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new FlyingChess();
});