const width = 10;
const height = 20;
const tetris = document.getElementById('tetris');
let squares = Array.from({ length: width * height }, () => document.createElement('div'));
squares.forEach(square => tetris.appendChild(square));

let currentPosition = 4;
let currentRotation = 0;
let score = 0;
let timerId;
let currentIndex = 0;  // 現在のテトリミノのインデックス

const scoreDisplay = document.createElement('div');
scoreDisplay.id = 'score';
scoreDisplay.innerHTML = "Score: 0";
document.body.insertBefore(scoreDisplay, tetris);

const tetrominoes = [
    // Iミノ
    {
        shape: [
            [1, width + 1, width * 2 + 1, width * 3 + 1], // I
            [width, width + 1, width + 2, width + 3]
        ]
    },
    // Oミノ
    {
        shape: [
            [0, 1, width, width + 1] // O
        ]
    },
    // Tミノ
    {
        shape: [
            [1, width, width + 1, width + 2], // T
            [1, width + 1, width + 2, width * 2 + 1],
            [width, width + 1, width + 2, width * 2 + 1],
            [1, width, width + 1, width * 2 + 1]
        ]
    },
    // Sミノ
    {
        shape: [
            [0, 1, width + 1, width + 2], // S
            [2, width + 1, width + 2, width * 2 + 1]
        ]
    },
    // Zミノ
    {
        shape: [
            [1, 2, width, width + 1], // Z
            [1, width + 1, width + 2, width * 2 + 2]
        ]
    },
    // Jミノ
    {
        shape: [
            [0, width, width + 1, width + 2], // J
            [1, 2, width + 2, width * 2 + 2],
            [width, width + 1, width + 2, width * 2 + 2],
            [1, width + 1, width + 2, width * 2]
        ]
    },
    // Lミノ
    {
        shape: [
            [2, width, width + 1, width + 2], // L
            [1, width + 1, width * 2 + 1, width * 2 + 2],
            [width, width + 1, width + 2, width * 2],
            [0, 1, width + 1, width * 2 + 1]
        ]
    }
];

// テトリミノを順番に取得
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
    undraw();  // 現在のミノを消す
    currentPosition += width;  // ミノの位置を1段下げる
    draw();  // 新しい位置にミノを描画
    freeze();  // 底に到達した場合の処理
}

function freeze() {
    if (current.some(index => 
        (currentPosition + index + width >= width * height) || 
        squares[currentPosition + index + width].classList.contains('filled'))) {

        current.forEach(index => squares[currentPosition + index].classList.add('filled'));

        checkRow();

        // 次のテトリミノを取得
        currentIndex = (currentIndex + 1) % tetrominoes.length;  // %で配列の長さに収める
        currentRotation = 0;  // 常に新しいミノの回転を0に初期化
        current = tetrominoes[currentIndex].shape[currentRotation];
        currentPosition = 4;

        // ゲームオーバー判定
        if (current.some(index => squares[currentPosition + index].classList.contains('filled'))) {
            alert("ゲームオーバー");
            clearInterval(timerId);
            resetGame();
        } else {
            draw();
        }
    }
}

function checkRow() {
    for (let i = 0; i < height; i++) {
        let row = Array.from({ length: width }, (_, j) => i * width + j);

        if (row.every(index => squares[index].classList.contains('filled'))) {
            score += 10;
            scoreDisplay.innerHTML = `Score: ${score}`;

            row.forEach(index => {
                squares[index].classList.add('fade-out');  // 拡大・色変化・回転・フェードアウトを適用
            });

            setTimeout(() => {
                row.forEach(index => {
                    squares[index].classList.remove('filled', 'block', 'fade-out');
                    squares[index].style.backgroundColor = '';
                    squares[index].style.transform = '';  // 変形をリセット
                });

                const removedSquares = squares.splice(i * width, width);
                squares = removedSquares.concat(squares);
                squares.forEach(cell => tetris.appendChild(cell));

            }, 500);  // エフェクト完了後に行を削除
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

    timerId = setInterval(moveDown, 1000);  // タイマーを再起動
    currentIndex = 0;
    currentRotation = 0;
    current = tetrominoes[currentIndex].shape[currentRotation];
    currentPosition = 4;
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
    currentRotation++;
    if (currentRotation === tetrominoes[currentIndex].shape.length) {
        currentRotation = 0;
    }
    current = tetrominoes[currentIndex].shape[currentRotation];

    const isAtRightEdge = current.some(index => (currentPosition + index) % width >= width - 1);
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);

    if (isAtRightEdge) {
        currentPosition -= 1;
    } else if (isAtLeftEdge) {
        currentPosition += 1;
    }

    if (current.some(index => squares[currentPosition + index].classList.contains('filled'))) {
        currentRotation = previousRotation;
        current = tetrominoes[currentIndex].shape[currentRotation];
    }

    draw();
}

timerId = setInterval(moveDown, 1000);  // ゲーム開始時にミノを落とすタイマーを設定
draw();
