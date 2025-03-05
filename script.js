document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('board');
    const ctx = canvas.getContext('2d');
    const statusElement = document.getElementById('status');
    const restartButton = document.getElementById('restart');

    // 游戏配置
    const boardSize = 15; // 15x15 棋盘
    const cellSize = canvas.width / boardSize;
    const pieceRadius = cellSize * 0.4;

    // 游戏状态
    let gameBoard = createEmptyBoard();
    let currentPlayer = 'black'; // 'black' 或 'white'
    let gameOver = false;
    let winner = null;

    // 初始化游戏
    initGame();

    // 事件监听器
    canvas.addEventListener('click', handleCanvasClick);
    restartButton.addEventListener('click', restartGame);

    // 函数定义
    function initGame() {
        drawBoard();
        updateStatus();
    }

    function createEmptyBoard() {
        return Array(boardSize).fill().map(() => Array(boardSize).fill(null));
    }

    function drawBoard() {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制棋盘背景
        ctx.fillStyle = '#e6c88c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制网格线
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        for (let i = 0; i < boardSize; i++) {
            // 横线
            ctx.beginPath();
            ctx.moveTo(cellSize / 2, i * cellSize + cellSize / 2);
            ctx.lineTo(canvas.width - cellSize / 2, i * cellSize + cellSize / 2);
            ctx.stroke();

            // 竖线
            ctx.beginPath();
            ctx.moveTo(i * cellSize + cellSize / 2, cellSize / 2);
            ctx.lineTo(i * cellSize + cellSize / 2, canvas.height - cellSize / 2);
            ctx.stroke();
        }

        // 绘制天元和星位
        const starPoints = [
            [3, 3], [3, 7], [3, 11],
            [7, 3], [7, 7], [7, 11],
            [11, 3], [11, 7], [11, 11]
        ];

        ctx.fillStyle = '#000';
        starPoints.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // 绘制棋子
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                const piece = gameBoard[y][x];
                if (piece) {
                    drawPiece(x, y, piece);
                }
            }
        }
    }

    function drawPiece(x, y, color) {
        const centerX = x * cellSize + cellSize / 2;
        const centerY = y * cellSize + cellSize / 2;

        // 绘制阴影
        ctx.beginPath();
        ctx.arc(centerX + 2, centerY + 2, pieceRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // 绘制棋子
        ctx.beginPath();
        ctx.arc(centerX, centerY, pieceRadius, 0, Math.PI * 2);

        // 创建径向渐变
        const gradient = ctx.createRadialGradient(
            centerX - pieceRadius / 3, centerY - pieceRadius / 3, pieceRadius / 10,
            centerX, centerY, pieceRadius
        );

        if (color === 'black') {
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
        } else {
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ccc');
        }

        ctx.fillStyle = gradient;
        ctx.fill();

        // 绘制边缘
        ctx.strokeStyle = color === 'black' ? '#000' : '#999';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function handleCanvasClick(event) {
        if (gameOver) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // 计算点击的格子坐标
        const gridX = Math.floor(x / cellSize);
        const gridY = Math.floor(y / cellSize);

        // 检查是否有效点击
        if (gridX >= 0 && gridX < boardSize && gridY >= 0 && gridY < boardSize) {
            // 检查格子是否为空
            if (!gameBoard[gridY][gridX]) {
                // 放置棋子
                gameBoard[gridY][gridX] = currentPlayer;
                drawBoard();

                // 检查是否获胜
                if (checkWin(gridX, gridY)) {
                    gameOver = true;
                    winner = currentPlayer;
                    updateStatus();
                    return;
                }

                // 切换玩家
                currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
                updateStatus();
            }
        }
    }

    function checkWin(x, y) {
        const directions = [
            [1, 0],  // 水平
            [0, 1],  // 垂直
            [1, 1],  // 对角线 /
            [1, -1]  // 对角线 \
        ];

        const color = gameBoard[y][x];

        for (const [dx, dy] of directions) {
            let count = 1;  // 当前位置已经有一个棋子

            // 正方向检查
            for (let i = 1; i < 5; i++) {
                const newX = x + dx * i;
                const newY = y + dy * i;

                if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize && 
                    gameBoard[newY][newX] === color) {
                    count++;
                } else {
                    break;
                }
            }

            // 反方向检查
            for (let i = 1; i < 5; i++) {
                const newX = x - dx * i;
                const newY = y - dy * i;

                if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize && 
                    gameBoard[newY][newX] === color) {
                    count++;
                } else {
                    break;
                }
            }

            if (count >= 5) {
                return true;
            }
        }

        return false;
    }

    function updateStatus() {
        if (gameOver) {
            statusElement.textContent = `游戏结束! ${winner === 'black' ? '黑子' : '白子'}获胜!`;
        } else {
            statusElement.textContent = `当前玩家: ${currentPlayer === 'black' ? '黑子' : '白子'}`;
        }
    }

    function restartGame() {
        gameBoard = createEmptyBoard();
        currentPlayer = 'black';
        gameOver = false;
        winner = null;
        drawBoard();
        updateStatus();
    }
});