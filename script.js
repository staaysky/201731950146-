class GoGame {
    constructor() {
        this.canvas = document.getElementById('go-board');
        this.ctx = this.canvas.getContext('2d');
        this.boardSize = 19;
        this.cellSize = 40;
        this.padding = 20;
        this.board = [];
        this.currentPlayer = 'black';
        this.blackCaptures = 0;
        this.whiteCaptures = 0;
        this.history = [];
        this.lastMove = null;
        this.koPoint = null;
        
        this.init();
    }
    
    init() {
        // 初始化棋盘数组
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = null;
            }
        }
        
        this.setupEventListeners();
        this.drawBoard();
        this.updateUI();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('pass-btn').addEventListener('click', () => this.pass());
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
    }
    
    drawBoard() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制棋盘背景
        this.ctx.fillStyle = '#dcb35c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.boardSize; i++) {
            // 横线
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, this.padding + i * this.cellSize);
            this.ctx.lineTo(this.padding + (this.boardSize - 1) * this.cellSize, this.padding + i * this.cellSize);
            this.ctx.stroke();
            
            // 竖线
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding + i * this.cellSize, this.padding);
            this.ctx.lineTo(this.padding + i * this.cellSize, this.padding + (this.boardSize - 1) * this.cellSize);
            this.ctx.stroke();
        }
        
        // 绘制星位（天元和其他星位）
        const starPoints = [
            [3, 3], [3, 9], [3, 15],
            [9, 3], [9, 9], [9, 15],
            [15, 3], [15, 9], [15, 15]
        ];
        
        this.ctx.fillStyle = '#000000';
        for (const [x, y] of starPoints) {
            this.ctx.beginPath();
            this.ctx.arc(
                this.padding + x * this.cellSize,
                this.padding + y * this.cellSize,
                3,
                0,
                2 * Math.PI
            );
            this.ctx.fill();
        }
        
        // 绘制坐标标签
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // 数字标签（1-19）
        for (let i = 0; i < this.boardSize; i++) {
            this.ctx.fillText(
                (i + 1).toString(),
                5,
                this.padding + (this.boardSize - 1 - i) * this.cellSize
            );
            this.ctx.fillText(
                (i + 1).toString(),
                this.canvas.width - 5,
                this.padding + (this.boardSize - 1 - i) * this.cellSize
            );
        }
        
        // 字母标签（A-S）
        for (let i = 0; i < this.boardSize; i++) {
            const letter = String.fromCharCode(65 + i);
            this.ctx.fillText(
                letter,
                this.padding + i * this.cellSize,
                5
            );
            this.ctx.fillText(
                letter,
                this.padding + i * this.cellSize,
                this.canvas.height - 5
            );
        }
        
        // 重新绘制所有棋子
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j]) {
                    this.drawStone(i, j, this.board[i][j]);
                }
            }
        }
        
        // 标记最后一手
        if (this.lastMove) {
            this.markLastMove(this.lastMove.x, this.lastMove.y);
        }
    }
    
    drawStone(x, y, color) {
        const centerX = this.padding + x * this.cellSize;
        const centerY = this.padding + y * this.cellSize;
        const radius = this.cellSize * 0.4;
        
        // 绘制棋子阴影
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 3;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        // 绘制棋子
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        
        if (color === 'black') {
            const gradient = this.ctx.createRadialGradient(
                centerX - radius/3, centerY - radius/3, 0,
                centerX, centerY, radius
            );
            gradient.addColorStop(0, '#555555');
            gradient.addColorStop(1, '#000000');
            this.ctx.fillStyle = gradient;
        } else {
            const gradient = this.ctx.createRadialGradient(
                centerX - radius/3, centerY - radius/3, 0,
                centerX, centerY, radius
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#dddddd');
            this.ctx.fillStyle = gradient;
        }
        
        this.ctx.fill();
        
        // 重置阴影
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
    
    markLastMove(x, y) {
        const centerX = this.padding + x * this.cellSize;
        const centerY = this.padding + y * this.cellSize;
        
        this.ctx.strokeStyle = this.board[x][y] === 'black' ? '#ffffff' : '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
    
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 转换为棋盘坐标
        const boardX = Math.round((x - this.padding) / this.cellSize);
        const boardY = Math.round((y - this.padding) / this.cellSize);
        
        // 检查是否在有效范围内
        if (boardX < 0 || boardX >= this.boardSize || boardY < 0 || boardY >= this.boardSize) {
            return;
        }
        
        // 尝试放置棋子
        this.placeStone(boardX, boardY);
    }
    
    placeStone(x, y) {
        // 检查位置是否已有棋子
        if (this.board[x][y] !== null) {
            this.showMessage('该位置已有棋子！');
            return;
        }
        
        // 检查是否为劫（Ko）
        if (this.koPoint && this.koPoint.x === x && this.koPoint.y === y) {
            this.showMessage('劫争！不能立即回提');
            return;
        }
        
        // 保存当前状态到历史记录
        this.saveHistory();
        
        // 放置棋子
        this.board[x][y] = this.currentPlayer;
        
        // 检查并提取对手的死子
        const opponent = this.currentPlayer === 'black' ? 'white' : 'black';
        const capturedStones = this.checkCaptures(opponent);
        
        // 检查是否为自杀手
        if (this.isSuicide(x, y) && capturedStones.length === 0) {
            this.board[x][y] = null;
            this.showMessage('自杀手！不能这样下');
            this.history.pop(); // 移除刚添加的历史记录
            return;
        }
        
        // 更新提子数
        if (this.currentPlayer === 'black') {
            this.blackCaptures += capturedStones.length;
        } else {
            this.whiteCaptures += capturedStones.length;
        }
        
        // 检查劫的情况
        if (capturedStones.length === 1 && this.isKo(x, y, capturedStones[0])) {
            this.koPoint = capturedStones[0];
        } else {
            this.koPoint = null;
        }
        
        // 记录最后一手
        this.lastMove = { x, y };
        
        // 切换玩家
        this.currentPlayer = opponent;
        
        // 重绘棋盘
        this.drawBoard();
        
        // 更新UI
        this.updateUI();
        
        this.showMessage('');
    }
    
    checkCaptures(color) {
        const captured = [];
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === color) {
                    const group = this.getGroup(i, j);
                    if (!this.groupHasLiberty(group)) {
                        // 提取这个棋子组
                        for (const stone of group) {
                            this.board[stone.x][stone.y] = null;
                            captured.push(stone);
                        }
                    }
                }
            }
        }
        
        return captured;
    }
    
    getGroup(x, y) {
        const color = this.board[x][y];
        if (color === null) return [];
        
        const group = [];
        const visited = new Set();
        const stack = [{x, y}];
        
        while (stack.length > 0) {
            const {x: cx, y: cy} = stack.pop();
            const key = `${cx},${cy}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            if (this.board[cx][cy] === color) {
                group.push({x: cx, y: cy});
                
                // 添加相邻的同色棋子
                const neighbors = this.getNeighbors(cx, cy);
                for (const neighbor of neighbors) {
                    if (!visited.has(`${neighbor.x},${neighbor.y}`)) {
                        stack.push(neighbor);
                    }
                }
            }
        }
        
        return group;
    }
    
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize) {
                neighbors.push({x: nx, y: ny});
            }
        }
        
        return neighbors;
    }
    
    groupHasLiberty(group) {
        for (const stone of group) {
            const neighbors = this.getNeighbors(stone.x, stone.y);
            for (const neighbor of neighbors) {
                if (this.board[neighbor.x][neighbor.y] === null) {
                    return true;
                }
            }
        }
        return false;
    }
    
    isSuicide(x, y) {
        const group = this.getGroup(x, y);
        return !this.groupHasLiberty(group);
    }
    
    isKo(x, y, capturedStone) {
        // 简单的劫检测：如果只提了一个子，且被提的子周围都是对方的棋子
        const neighbors = this.getNeighbors(capturedStone.x, capturedStone.y);
        let opponentCount = 0;
        
        for (const neighbor of neighbors) {
            if (this.board[neighbor.x][neighbor.y] === this.currentPlayer) {
                opponentCount++;
            }
        }
        
        return opponentCount === neighbors.length;
    }
    
    pass() {
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.lastMove = null;
        this.koPoint = null;
        this.updateUI();
        this.showMessage(`${this.currentPlayer === 'black' ? '白棋' : '黑棋'}虚手`);
    }
    
    restart() {
        if (confirm('确定要重新开始游戏吗？')) {
            this.board = [];
            this.currentPlayer = 'black';
            this.blackCaptures = 0;
            this.whiteCaptures = 0;
            this.history = [];
            this.lastMove = null;
            this.koPoint = null;
            
            for (let i = 0; i < this.boardSize; i++) {
                this.board[i] = [];
                for (let j = 0; j < this.boardSize; j++) {
                    this.board[i][j] = null;
                }
            }
            
            this.drawBoard();
            this.updateUI();
            this.showMessage('游戏已重新开始');
        }
    }
    
    undo() {
        if (this.history.length === 0) {
            this.showMessage('没有可以悔棋的步骤');
            return;
        }
        
        const previousState = this.history.pop();
        this.board = previousState.board;
        this.currentPlayer = previousState.currentPlayer;
        this.blackCaptures = previousState.blackCaptures;
        this.whiteCaptures = previousState.whiteCaptures;
        this.lastMove = previousState.lastMove;
        this.koPoint = previousState.koPoint;
        
        this.drawBoard();
        this.updateUI();
        this.showMessage('悔棋成功');
    }
    
    saveHistory() {
        // 深拷贝当前状态
        const boardCopy = [];
        for (let i = 0; i < this.boardSize; i++) {
            boardCopy[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                boardCopy[i][j] = this.board[i][j];
            }
        }
        
        this.history.push({
            board: boardCopy,
            currentPlayer: this.currentPlayer,
            blackCaptures: this.blackCaptures,
            whiteCaptures: this.whiteCaptures,
            lastMove: this.lastMove ? {...this.lastMove} : null,
            koPoint: this.koPoint ? {...this.koPoint} : null
        });
    }
    
    updateUI() {
        document.getElementById('current-player').textContent = this.currentPlayer === 'black' ? '黑棋' : '白棋';
        document.getElementById('black-captures').textContent = this.blackCaptures;
        document.getElementById('white-captures').textContent = this.whiteCaptures;
    }
    
    showMessage(message) {
        document.getElementById('message-area').textContent = message;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new GoGame();
});