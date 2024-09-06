const width = 10;
const height = 20;
const tetris = document.getElementById('tetris');
let squares = Array.from({ length: width * height }, () => document.createElement('div'));
squares.forEach(square => tetris.appendChild(square));

let currentPosition = 4;
let currentRotation = 0;
let score = 0;
let timerId;
let currentIndex = 0;

const scoreDisplay = document.createElement('div');
scoreDisplay.id = 'score';
scoreDisplay.innerHTML = "Score: 0";
document.body.insertBefore(scoreDisplay, tetris);

const tetrominoes = [
    // Iミノ
    {
        shape: [
            [1, width + 1, width * 2 + 1, width * 3 + 1],
            [width, width + 1, width + 2, width + 3]
        ]
    },
    // Oミノ
    {
        shape: [
            [0, 1, width, width + 1]
        ]
    },
    // Tミノ
    {
        shape: [
            [1, width, width + 1, width + 2],
            [1, width + 1, width + 2, width * 2 + 1],
            [width, width + 1, width + 2, width * 2 + 1],
            [1, width, width + 1, width * 2 + 1]
        ]
    },
    // Sミノ
    {
        shape: [
            [0, 1, width + 1, width + 2],
            [2, width + 1, width + 2, width * 2 + 1]
        ]
    },
    // Zミノ
    {
        shape: [
            [1, 2, width, width + 1],
            [1, width + 1, width + 2, width * 2 + 2]
        ]
    },
    // Jミノ
    {
        shape: [
            [0, width, width + 1, width + 2],
            [1, 2, width + 2, width * 2 + 2],
            [width, width + 1, width + 2, width * 2 + 2],
            [1, width + 1, width + 2, width * 2]
        ]
    },
    // Lミノ
    {
        shape: [
            [2, width, width + 1, width + 2],
            [1, width + 1, width * 2 + 1, width * 2 + 2],
            [width, width + 1, width + 2, width * 2],
            [0, 1, width + 1, width * 2 + 1]
        ]
    }
];

function generateMinos() {
  let minosBag = [];

  function refillBag() {
    minosBag = [...tetrominoes];
    minosBag = shuffle(minosBag);
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  if (minosBag.length === 0) {
    refillBag();
  }

  return minosBag.pop();
}

let current = tetrominoes[currentIndex].shape[currentRotation];

function draw() {
    current.forEach(index => {
        squares[currentPosition + index].classList.add('block');
    });
}

function undraw() {
    current.forEach(index => {
        squares[currentPosition + index].classList.remove('block');
    });
}

function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
}

function freeze() {
    if (current.some(index => 
        (currentPosition + index + width >= width * height) || 
        squares[currentPosition + index + width].classList.contains('filled'))) {

        current.forEach(index => squares[currentPosition + index].classList.add('filled'));

        if (checkGameOver()) {
            alert("ゲームオーバー");
            clearInterval(timerId);
            resetGame();
        } else {
            checkRow();
            generateNewTetromino();
        }
    }
}

function checkGameOver() {
    return current.some(index => (currentPosition + index < width * 2) && squares[currentPosition + index].classList.contains('filled'));
}

function generateNewTetromino() {
    currentIndex = (currentIndex + 1) % tetrominoes.length;
    currentRotation = 0;
    current = tetrominoes[currentIndex].shape[currentRotation];
    
    currentPosition = Math.floor(width / 2) - 1;
    
    if (checkGameOver()) {
        alert("ゲームオーバー");
        clearInterval(timerId);
        resetGame();
    } else {
        draw();
    }
}

function checkRow() {
    for (let i = 0; i < height; i++) {
        let row = Array.from({ length: width }, (_, j) => i * width + j);

        if (row.every(index => squares[index].classList.contains('filled'))) {
            score += 10;
            scoreDisplay.innerHTML = `Score: ${score}`;

            row.forEach(index => {
                squares[index].classList.add('fade-out');
            });

            setTimeout(() => {
                row.forEach(index => {
                    squares[index].classList.remove('filled', 'block', 'fade-out');
                    squares[index].style.backgroundColor = '';  
                });

                const removedSquares = squares.splice(i * width, width);
                squares = removedSquares.concat(squares);
                squares.forEach(cell => tetris.appendChild(cell));

            }, 500);  
        }
    }
}

function resetGame() {
    squares.forEach(square => {
        square.classList.remove('filled', 'block');
        square.style.backgroundColor = '';
    });

    score = 0;
    scoreDisplay.innerHTML = `Score: ${score}`;

    timerId = setInterval(moveDown, 1000);
    currentIndex = 0;
    currentRotation = 0;
    current = tetrominoes[currentIndex].shape[currentRotation];
    currentPosition = Math.floor(width / 2) - 1;
    draw();
}

function control(e) {
    if (e.keyCode === 37) {
        moveLeft();
    } else if (e.keyCode === 38) {
        rotate();
    } else if (e.keyCode === 39) {
        moveRight();
    } else if (e.keyCode === 40) {
        moveDown();
    }
}
document.addEventListener('keydown', control);

function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
    if (!isAtLeftEdge) currentPosition -= 1;
    if (current.some(index => squares[currentPosition + index].classList.contains('filled'))) {
        currentPosition += 1;
    }
    draw();
}

function moveRight() {
    undraw();
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
    if (!isAtRightEdge) currentPosition += 1;
    if (current.some(index => squares[currentPosition + index].classList.contains('filled'))) {
        currentPosition -= 1;
    }
    draw();
}

function rotate() {
    undraw();  
    const previousRotation = currentRotation;  
    currentRotation = (currentRotation + 1) % tetrominoes[currentIndex].shape.length;
    current = tetrominoes[currentIndex].shape[currentRotation];

    const isAtEdge = current.some(index => (currentPosition + index) % width === 0 || (currentPosition + index) % width === width - 1);

    if (isAtEdge || current.some(index => squares[currentPosition + index].classList.contains('filled'))) {
        currentRotation = previousRotation;
        current = tetrominoes[currentIndex].shape[currentRotation];
    }

    draw();
}

timerId = setInterval(moveDown, 1000);
draw();
