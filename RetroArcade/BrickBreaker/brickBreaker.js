// board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

// bricks
let brickArray = [];
let brickWidth = 50;
let brickHeight = 10;
let brickColumns = 8;
let brickRows = 3; //add more as game bricks reset
let brickMaxRows = 10; //limit how many rows
let brickCount = 0;

// ball
let ballHeight = 10;
let ballWidth = 10;
let ballSpeedY = 2;
let ballSpeedX = 3;
let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    speedY: ballSpeedY,
    speedX: ballSpeedX,
}

// paddle
let paddleWidth = 80;
let paddleHeight = 10;
let paddleSpeed = 30;
let paddle = {
    x: boardWidth / 2 - paddleWidth / 2,
    y: boardHeight / 2 - boardHeight - 5,
    width: paddleWidth,
    height: paddleHeight,
    speed: paddleSpeed,
}

//starting brick corners top left
let brickX = 15;
let brickY = 45;

let score = 0;
let highScore = 0;
let gameOver = false;

// drawing objects
window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw initial paddle
    context.fillStyle = "skyblue";
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePaddle);

    //create bricks
    createBricks();
}

function createBricks() {
    brickArray = []; //clear brickArray
    for (let c = 0; c < brickColumns; c++) {
        for (let r = 0; r < brickRows; r++) {
            let brick = {
                x: brickX + c * brickWidth + c * 10, //c*10 space 10 pixels apart columns
                y: brickY + r * brickHeight + r * 10, //r*10 space 10 pixels apart rows
                width: brickWidth,
                height: brickHeight,
                break: false
            }
            brickArray.push(brick);
        }
    }
    brickCount = brickArray.length;
}

function movePaddle(e) {
    if (gameOver) {
        if (e.code == "Space") {
            resetGame();
            console.log("RESET");
        }
        return;
    }
    if (e.code == "ArrowLeft") {
        let nextpaddleX = paddle.x - paddle.speed;
        if (!outOfBounds(nextpaddleX)) {
            paddle.x = nextpaddleX;
        }
    }
    else if (e.code == "ArrowRight") {
        let nextpaddleX = paddle.x + paddle.speed;
        if (!outOfBounds(nextpaddleX)) {
            paddle.x = nextpaddleX;
        }
    }
}

function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + paddleWidth > boardWidth);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function topCollision(ball, brick) { //ball is above brick
    return detectCollision(ball, brick) && (ball.y + ball.height) >= brick.y;
}

function bottomCollision(ball, brick) { //ball is below brick
    return detectCollision(ball, brick) && (brick.y + brick.height) >= ball.y;
}

function leftCollision(ball, brick) { //ball is left of brick
    return detectCollision(ball, brick) && (ball.x + ball.width) >= brick.x;
}

function rightCollision(ball, brick) { //ball is right of brick
    return detectCollision(ball, brick) && (brick.x + brick.width) >= ball.x;
}

function getRandomColor() {
    // Generate random RGB values
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    return "rgb(" + r + "," + g + "," + b + ")";
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // paddle
    context.fillStyle = "white";
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // ball
    context.fillStyle = "white";
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    //bounce the ball off paddle
    if (topCollision(ball, paddle) || bottomCollision(ball, paddle)) {
        ball.speedY *= -1;   // flip y direction up or down
    } else if (leftCollision(ball, paddle) || rightCollision(ball, paddle)) {
        ball.speedX *= -1;   // flip x direction left or right
    }

    if (ball.y <= 0) {
        // if ball touches top of canvas
        ball.speedY *= -1; //reverse direction
    } else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
        // if ball touches left or right of canvas
        ball.speedX *= -1; //reverse direction
    } else if (ball.y + ball.height >= boardHeight) {
        // if ball touches bottom of canvas
        context.font = "20px sans-serif";
        context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
        gameOver = true;
        if (score > highScore) {
            highScore = score; // Update high score if current score is higher
        }
    }

    //bricks
    for (let i = 0; i < brickArray.length; i++) {
        let brick = brickArray[i];
        if (!brick.break) {
            let color = getRandomColor();
            context.fillStyle = color;
            if (topCollision(ball, brick) || bottomCollision(ball, brick)) {
                brick.break = true;     // brick is broken
                ball.speedY *= -1;   // flip y direction up or down
                score += 100;
                brickCount -= 1;
            } else if (leftCollision(ball, brick) || rightCollision(ball, brick)) {
                brick.break = true;     // brick is broken
                ball.speedX *= -1;   // flip x direction left or right
                score += 100;
                brickCount -= 1;
            }
            context.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
    }
    //next level
    if (brickCount == 0) {
        score += 100 * brickRows * brickColumns;
        brickRows = Math.min(brickRows + 1, brickMaxRows);
        createBricks();
    }

    //score
    context.font = "20px sans-serif";
    context.fillText("Score: " + score, 10, 25);

    //high score
    context.fillText("High Score: " + highScore, boardWidth - 200, 25); //tested to see where 5 digits would fit to the right
}

function resetGame() {
    gameOver = false;
    paddle = {
        x: boardWidth / 2 - paddleWidth / 2,
        y: boardHeight - paddleHeight - 5,
        width: paddleWidth,
        height: paddleHeight,
        speed: paddleSpeed
    }
    ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        speedX: ballSpeedX,
        speedY: ballSpeedY
    }
    brickArray = [];
    brickRows = 3;
    score = 0;
    createBricks();
}


