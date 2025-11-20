// 游戏变量
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const ballsRemainingElement = document.getElementById('balls-remaining');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// 游戏状态
let gameRunning = false;
let score = 0;
let ballsRemaining = 15;

// 球桌边界
const table = {
    x: 20,
    y: 20,
    width: canvas.width - 40,
    height: canvas.height - 40
};

// 球类定义
class Ball {
    constructor(x, y, radius, color, number = null) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.number = number;
        this.vx = 0; // 水平速度
        this.vy = 0; // 垂直速度
        this.friction = 0.98; // 摩擦系数
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 如果有号码，绘制号码
        if (this.number !== null) {
            ctx.fillStyle = 'white';
            ctx.font = `${this.radius}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.number.toString(), this.x, this.y);
        }
    }

    update() {
        // 应用摩擦力
        this.vx *= this.friction;
        this.vy *= this.friction;

        // 如果速度很小，停止球
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
        if (Math.abs(this.vy) < 0.1) this.vy = 0;

        // 更新位置
        this.x += this.vx;
        this.y += this.vy;

        // 碰撞检测 - 左右边界
        if (this.x - this.radius < table.x) {
            this.x = table.x + this.radius;
            this.vx = -this.vx * 0.8; // 反弹并减少速度
        } else if (this.x + this.radius > table.x + table.width) {
            this.x = table.x + table.width - this.radius;
            this.vx = -this.vx * 0.8;
        }

        // 碰撞检测 - 上下边界
        if (this.y - this.radius < table.y) {
            this.y = table.y + this.radius;
            this.vy = -this.vy * 0.8;
        } else if (this.y + this.radius > table.y + table.height) {
            this.y = table.y + table.height - this.radius;
            this.vy = -this.vy * 0.8;
        }
    }

    isMoving() {
        return Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1;
    }
}

// 球杆类
class Cue {
    constructor(ball) {
        this.ball = ball;
        this.angle = 0;
        this.power = 0;
        this.visible = false;
    }

    draw() {
        if (!this.visible) return;

        const startX = this.ball.x;
        const startY = this.ball.y;
        const length = 100 + this.power * 2; // 球杆长度随力度变化
        const endX = startX - Math.cos(this.angle) * length;
        const endY = startY - Math.sin(this.angle) * length;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#D2B48C';
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    update(mouseX, mouseY) {
        if (!this.ball) return;
        
        // 计算球杆的角度
        this.angle = Math.atan2(mouseY - this.ball.y, mouseX - this.ball.x);
        
        // 计算力度（当鼠标按下时）
        this.power = Math.min(100, Math.sqrt(Math.pow(mouseX - this.ball.x, 2) + Math.pow(mouseY - this.ball.y, 2)) / 3);
    }
}

// 创建球
let balls = [];
let cueBall;
let cue;

// 初始化游戏
function initGame() {
    balls = [];
    score = 0;
    ballsRemaining = 15;
    
    // 创建白球（母球）
    cueBall = new Ball(table.x + table.width / 4, table.y + table.height / 2, 10, 'white');
    
    // 创建其他球（三角形排列）
    const colors = [
        'yellow', 'blue', 'red', 'purple', 'orange', 'green', 'maroon',
        'black', 'yellow', 'blue', 'red', 'purple', 'orange', 'green', 'maroon'
    ];
    
    const startX = table.x + (table.width * 3) / 4;
    const startY = table.y + table.height / 2;
    const spacing = 22; // 球之间的间距
    
    let ballIndex = 0;
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col <= row; col++) {
            if (ballIndex < 15) {
                const x = startX + row * spacing * Math.cos(Math.PI/6);
                const y = startY + (col - row/2) * spacing;
                
                balls.push(new Ball(x, y, 10, colors[ballIndex], ballIndex + 1));
                ballIndex++;
            }
        }
    }
    
    cue = new Cue(cueBall);
    
    updateScore();
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = score;
    ballsRemainingElement.textContent = ballsRemaining;
}

// 检查球的碰撞
function checkCollisions() {
    // 检查白球与其他球的碰撞
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        const dx = cueBall.x - ball.x;
        const dy = cueBall.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < cueBall.radius + ball.radius) {
            // 发生碰撞，计算反弹方向
            const angle = Math.atan2(dy, dx);
            const targetX = cueBall.x + Math.cos(angle) * (cueBall.radius + ball.radius);
            const targetY = cueBall.y + Math.sin(angle) * (cueBall.radius + ball.radius);
            
            // 分配碰撞后的速度
            const speed = Math.sqrt(cueBall.vx * cueBall.vx + cueBall.vy * cueBall.vy);
            const direction = Math.atan2(ball.y - cueBall.y, ball.x - cueBall.x);
            
            // 传递速度给被撞球
            ball.vx = Math.cos(direction) * speed * 0.8;
            ball.vy = Math.sin(direction) * speed * 0.8;
            
            // 白球的速度减少
            cueBall.vx *= 0.3;
            cueBall.vy *= 0.3;
            
            // 分离球以防止重叠
            const overlap = (cueBall.radius + ball.radius - distance) / 2;
            cueBall.x += Math.cos(angle) * overlap;
            cueBall.y += Math.sin(angle) * overlap;
            ball.x -= Math.cos(angle) * overlap;
            ball.y -= Math.sin(angle) * overlap;
            
            // 增加分数
            score += 10;
            updateScore();
        }
    }
    
    // 检查球与球之间的碰撞
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const ball1 = balls[i];
            const ball2 = balls[j];
            const dx = ball1.x - ball2.x;
            const dy = ball1.y - ball2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < ball1.radius + ball2.radius) {
                // 发生碰撞，计算反弹方向
                const angle = Math.atan2(dy, dx);
                const targetX = ball1.x + Math.cos(angle) * (ball1.radius + ball2.radius);
                const targetY = ball1.y + Math.sin(angle) * (ball1.radius + ball2.radius);
                
                // 计算碰撞后的速度
                const v1 = Math.sqrt(ball1.vx * ball1.vx + ball1.vy * ball1.vy);
                const v2 = Math.sqrt(ball2.vx * ball2.vx + ball2.vy * ball2.vy);
                
                const dir1 = Math.atan2(ball1.vy, ball1.vx);
                const dir2 = Math.atan2(ball2.vy, ball2.vx);
                
                // 交换速度分量（简化版弹性碰撞）
                const swap1X = v1 * Math.cos(dir1 - angle);
                const swap1Y = v1 * Math.sin(dir1 - angle);
                const swap2X = v2 * Math.cos(dir2 - angle);
                const swap2Y = v2 * Math.sin(dir2 - angle);
                
                const finalX1 = Math.cos(angle) * swap2X + Math.cos(angle + Math.PI/2) * swap1Y;
                const finalY1 = Math.sin(angle) * swap2X + Math.sin(angle + Math.PI/2) * swap1Y;
                const finalX2 = Math.cos(angle) * swap1X + Math.cos(angle + Math.PI/2) * swap2Y;
                const finalY2 = Math.sin(angle) * swap1X + Math.sin(angle + Math.PI/2) * swap2Y;
                
                ball1.vx = finalX1;
                ball1.vy = finalY1;
                ball2.vx = finalX2;
                ball2.vy = finalY2;
                
                // 分离球以防止重叠
                const overlap = (ball1.radius + ball2.radius - distance) / 2;
                ball1.x += Math.cos(angle) * overlap;
                ball1.y += Math.sin(angle) * overlap;
                ball2.x -= Math.cos(angle) * overlap;
                ball2.y -= Math.sin(angle) * overlap;
            }
        }
    }
}

// 检查球是否入袋
function checkPockets() {
    // 简化版：检查球是否出界
    if (cueBall.x < table.x || cueBall.x > table.x + table.width || 
        cueBall.y < table.y || cueBall.y > table.y + table.height) {
        // 重置白球位置
        cueBall.x = table.x + table.width / 4;
        cueBall.y = table.y + table.height / 2;
        cueBall.vx = 0;
        cueBall.vy = 0;
    }
    
    // 检查其他球是否出界（视为入袋）
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        if (ball.x < table.x || ball.x > table.x + table.width || 
            ball.y < table.y || ball.y > table.y + table.height) {
            // 移除球
            balls.splice(i, 1);
            ballsRemaining--;
            score += 50; // 入袋加分
            updateScore();
        }
    }
}

// 游戏主循环
function gameLoop() {
    if (!gameRunning) return;
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制球桌
    drawTable();
    
    // 更新和绘制球
    cueBall.update();
    balls.forEach(ball => ball.update());
    
    // 绘制所有球
    cueBall.draw();
    balls.forEach(ball => ball.draw());
    
    // 检查碰撞
    checkCollisions();
    
    // 检查球是否入袋
    checkPockets();
    
    // 绘制球杆
    cue.draw();
    
    // 检查游戏是否结束
    if (balls.length === 0) {
        gameRunning = false;
        alert(`恭喜！你得到了 ${score} 分！`);
    } else if (balls.every(ball => !ball.isMoving()) && !cueBall.isMoving()) {
        // 所有球都停止移动，隐藏球杆
        cue.visible = false;
    }
    
    requestAnimationFrame(gameLoop);
}

// 事件监听器
let mouseDown = false;
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousedown', (e) => {
    if (!gameRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 检查是否点击了白球
    const dx = x - cueBall.x;
    const dy = y - cueBall.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < cueBall.radius) {
        mouseDown = true;
        cue.visible = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!gameRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    if (mouseDown && cue.visible) {
        cue.update(mouseX, mouseY);
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (!gameRunning || !mouseDown) return;
    
    mouseDown = false;
    
    // 应用力度到白球
    if (cue.visible) {
        cueBall.vx = Math.cos(cue.angle) * cue.power;
        cueBall.vy = Math.sin(cue.angle) * cue.power;
        cue.visible = false;
    }
});

canvas.addEventListener('mouseleave', () => {
    mouseDown = false;
    cue.visible = false;
});

// 按钮事件
startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        gameLoop();
    }
});

resetBtn.addEventListener('click', () => {
    gameRunning = false;
    initGame();
    drawTable();
});

// 绘制初始桌台
function drawTable() {
    // 绘制球桌边框
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 6;
    ctx.strokeRect(table.x - 3, table.y - 3, table.width + 6, table.height + 6);
    
    // 绘制球桌内部
    ctx.fillStyle = '#3CB371';
    ctx.fillRect(table.x, table.y, table.width, table.height);
    
    // 绘制球袋（角上和边上）
    ctx.fillStyle = 'black';
    // 四个角落
    ctx.beginPath();
    ctx.arc(table.x, table.y, 10, 0, Math.PI * 2); // 左上
    ctx.arc(table.x + table.width, table.y, 10, 0, Math.PI * 2); // 右上
    ctx.arc(table.x, table.y + table.height, 10, 0, Math.PI * 2); // 左下
    ctx.arc(table.x + table.width, table.y + table.height, 10, 0, Math.PI * 2); // 右下
    // 边上中间
    ctx.arc(table.x + table.width/2, table.y, 10, 0, Math.PI * 2); // 上中
    ctx.arc(table.x + table.width/2, table.y + table.height, 10, 0, Math.PI * 2); // 下中
    ctx.fill();
}

// 初始化游戏
initGame();
drawTable();