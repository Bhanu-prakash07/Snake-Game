document.addEventListener('DOMContentLoaded', function() {
    const playerForm = document.getElementById('playerForm');
    const formContainer = document.querySelector('.form-container');
    const gameContainer = document.querySelector('.game-container');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreList = document.getElementById('scoreList');

    let playerName = '';
    let scoreHistory = JSON.parse(localStorage.getItem('scoreHistory')) || [];

    function updateScoreList() {
        scoreList.innerHTML = '';
        scoreHistory.slice(-5).reverse().forEach((score, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Game ${scoreHistory.length - index}: ${score}`;
            scoreList.appendChild(listItem);
        });
    }

    playerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        playerName = document.getElementById('name').value;
        formContainer.style.display = 'none';
        gameContainer.style.display = 'block';
        updateScoreList();
        startGame();
    });

    function startGame() {
        const gridSize = 20;
        const canvasSize = 400;
        const gameSpeed = 100;
        let snake = [{ x: 200, y: 200 }];
        let direction = 'right';
        let food = generateFood();
        let score = 0;

        function draw() {
            ctx.clearRect(0, 0, canvasSize, canvasSize);
            snake.forEach((segment, index) => {
                ctx.fillStyle = index === 0 ? 'darkgreen' : 'lime';
                ctx.beginPath();
                ctx.arc(segment.x + gridSize / 2, segment.y + gridSize / 2, gridSize / 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = 'darkgreen';
                ctx.stroke();
            });
            ctx.fillStyle = 'red';
            ctx.fillRect(food.x, food.y, gridSize, gridSize);
        }

        function update() {
            const head = { ...snake[0] };
            switch (direction) {
                case 'right':
                    head.x += gridSize;
                    break;
                case 'left':
                    head.x -= gridSize;
                    break;
                case 'up':
                    head.y -= gridSize;
                    break;
                case 'down':
                    head.y += gridSize;
                    break;
            }

            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                food = generateFood();
                score++;
                document.getElementById('score').textContent = score;
            } else {
                snake.pop();
            }

            if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize || snakeCollision()) {
                alert(`Game Over, ${playerName}! Your score: ${score}`);
                snake = [{ x: 200, y: 200 }];
                direction = 'right';
                food = generateFood();
                scoreHistory.push(score);
                if (scoreHistory.length > 5) scoreHistory.shift();
                localStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));
                updateScoreList();
                score = 0;
                document.getElementById('score').textContent = score;
            }
        }

        function snakeCollision() {
            for (let i = 1; i < snake.length; i++) {
                if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
                    return true;
                }
            }
            return false;
        }

        function generateFood() {
            let foodX, foodY;
            do {
                foodX = Math.floor(Math.random() * canvasSize / gridSize) * gridSize;
                foodY = Math.floor(Math.random() * canvasSize / gridSize) * gridSize;
            } while (snake.some(segment => segment.x === foodX && segment.y === foodY));

            return { x: foodX, y: foodY };
        }

        function changeDirection(event) {
            switch (event.keyCode) {
                case 37:
                    if (direction !== 'right') direction = 'left';
                    break;
                case 38:
                    if (direction !== 'down') direction = 'up';
                    break;
                case 39:
                    if (direction !== 'left') direction = 'right';
                    break;
                case 40:
                    if (direction !== 'up') direction = 'down';
                    break;
            }
        }

        document.addEventListener('keydown', changeDirection);

        function gameLoop() {
            update();
            draw();
            setTimeout(gameLoop, gameSpeed);
        }

        gameLoop();
    }
});
