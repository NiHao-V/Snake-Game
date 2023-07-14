class SnakeGame {
    constructor() {
        this.boardSize = 10;
        this.speed = 500; // 2 клетки в секунду
        this.snake = [{ x: 4, y: 2 }, { x: 3, y: 2 }]; // Змейка изначально состоит из 2 клеток
        this.apple = this.generateApple();
        this.direction = 'right';
        this.score = 0;
        this.bestScore = localStorage.getItem('bestScore') || 0;
        this.gameOver = false;
        this.gameLoop = null;
        this.snakeColor = 'rgb(52, 52, 52)';
    }

    init() {
        this.renderBoard();
        this.renderSnake();
        this.renderApple();
        this.updateScore();
        this.updateBestScore();

        const startButton = document.getElementById('start-button');
        startButton.addEventListener('click', () => {
            startButton.style.display = 'none';
            this.startGame();
        });

        const colorSelect = document.getElementById('snake-color-select');
        colorSelect.addEventListener('change', () => {
            const selectedColor = colorSelect.value;
            this.setSnakeColor(selectedColor);
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'ArrowUp' && this.direction !== 'down') {
                this.direction = 'up';
            } else if (event.key === 'ArrowDown' && this.direction !== 'up') {
                this.direction = 'down';
            } else if (event.key === 'ArrowLeft' && this.direction !== 'right') {
                this.direction = 'left';
            } else if (event.key === 'ArrowRight' && this.direction !== 'left') {
                this.direction = 'right';
            }
        });

        const restartButton = document.getElementById('restart-button');
        restartButton.addEventListener('click', () => {
            this.restartGame();
        });

        const resetButton = document.getElementById('reset-button');
        resetButton.addEventListener('click', () => {
            this.resetBestScore();
        });
    }

    renderBoard() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${row}-${col}`;
                board.appendChild(cell);
            }
        }
    }

    setSnakeColor(color) {
        this.snakeColor = color;
        this.renderSnake(); // Перерисовываем змею с новым цветом
    }

    renderSnake() {
        const board = document.getElementById('game-board');

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.getElementById(`cell-${row}-${col}`);
                cell.className = 'cell';

                const snakePart = this.snake.find(part => part.x === col && part.y === row);
                if (snakePart) {
                    cell.classList.add('snake');
                    cell.style.background = this.snakeColor;

                    if (snakePart === this.snake[0]) {
                        cell.classList.add('snake-head');
                        const eyeLeft = document.createElement('div');
                        eyeLeft.className = 'eye left';
                        const eyeRight = document.createElement('div');
                        eyeRight.className = 'eye right';
                        cell.appendChild(eyeLeft);
                        cell.appendChild(eyeRight);
                    }
                } else if (this.apple.x === col && this.apple.y === row) {
                    cell.classList.add('apple');
                } else {
                    cell.classList.remove('snake');
                    cell.style.background = ''; // Удаляем цвет змеи
                }
            }
        }
    }

    clearSnake() {
        const snakeCells = document.querySelectorAll('.snake');
        snakeCells.forEach(cell => {
            cell.classList.remove('snake');
            cell.style.background = ''; // Удаляем цвет змеи
        });
    }

    renderApple() {
        const appleCell = document.getElementById(`cell-${this.apple.y}-${this.apple.x}`);
        appleCell.classList.add('apple');
    }

    clearApple() {
        const appleCell = document.querySelector('.apple');
        appleCell.classList.remove('apple');
    }

    updateScore() {
        const scoreElement = document.getElementById('current-score');
        scoreElement.textContent = this.score;
    }

    updateBestScore() {
        const bestScoreElement = document.getElementById('best-score');
        bestScoreElement.textContent = this.bestScore;
    }

    startGame() {
        this.score = 0;
        this.gameOver = false;
        this.snake = [
            { x: 5, y: 5 }, // Голова змейки
            { x: 4, y: 5 } // Тело змейки
        ];
        this.clearSnake();
        this.clearApple();
        this.apple = this.generateApple();
        this.renderSnake();
        this.renderApple();
        this.gameLoop = setInterval(() => {
            this.moveSnake();
            this.checkCollision();
            this.checkAppleCollision();
            this.renderSnake();
        }, this.speed);
    }

    moveSnake() {
        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }

        const previousHeadCell = document.getElementById(`cell-${this.snake[0].y}-${this.snake[0].x}`);
        const previousHeadEyes = previousHeadCell.querySelectorAll('.eye');
        previousHeadEyes.forEach(eye => eye.remove());

        this.snake.unshift(head);
        const isEatingApple = this.checkAppleCollision();

        if (!isEatingApple) {
            const tail = this.snake.pop();
            const tailCell = document.getElementById(`cell-${tail.y}-${tail.x}`);
            tailCell.classList.remove('snake');
            tailCell.style.background = ''; // Удалить цвет хвоста змеи
        }
    }

    checkCollision() {
        const head = this.snake[0];

        // Проверка столкновения с самой змейкой
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver = true;
                this.stopGame();
                return;
            }
        }

        // Проверка столкновения со стенкой
        if (head.x < 0 || head.x >= this.boardSize || head.y < 0 || head.y >= this.boardSize) {
            this.gameOver = true;
            this.stopGame();
            return;
        }
    }

    checkAppleCollision() {
        const head = this.snake[0];

        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.score++;
            this.updateScore();
            this.clearApple();
            this.apple = this.generateApple();
            this.renderApple();
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => {
                this.moveSnake();
                this.checkCollision();
                this.checkAppleCollision();
                this.renderSnake();
            }, this.speed);
            return true;
        }

        return false;
    }

    generateApple() {
        let appleX, appleY;
        let isOnSnake;

        do {
            appleX = Math.floor(Math.random() * this.boardSize);
            appleY = Math.floor(Math.random() * this.boardSize);
            isOnSnake = this.snake.some(cell => cell.x === appleX && cell.y === appleY);
        } while (isOnSnake);

        return { x: appleX, y: appleY };
    }

    stopGame() {
        clearInterval(this.gameLoop);
        this.showRestartButton();
    }

    showRestartButton() {
        const restartButton = document.getElementById('restart-button');
        restartButton.style.display = 'block';
    }

    resetBestScore() {
        this.bestScore = 0;
        localStorage.setItem('bestScore', this.bestScore);
        this.updateBestScore();
    }

    restartGame() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
            this.updateBestScore();
        }

        this.clearSnake();
        this.clearApple();
        this.snake = [
            { x: 4, y: 2 },
            { x: 3, y: 2 }
        ];
        this.direction = 'right';
        this.score = 0;
        this.updateScore();
        this.apple = this.generateApple();
        this.renderApple();
        this.startGame();
        const restartButton = document.getElementById('restart-button');
        restartButton.style.display = 'none';
    }
}

const game = new SnakeGame();
game.init();  
