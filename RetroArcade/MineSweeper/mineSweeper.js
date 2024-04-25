let board = [];
let rows = 0;
let columns = 0;
let minesCount = 0;
let minesLocation = [];
let tilesClicked = 0;
let flagEnabled = false;
let gameOver = false;

window.onload = function () {
    document.getElementById("easy-button").addEventListener("click", function() {
        createBoard("easy");
    });

    document.getElementById("medium-button").addEventListener("click", function() {
        createBoard("medium");
    });

    document.getElementById("hard-button").addEventListener("click", function() {
        createBoard("hard");
    });

    document.getElementById("flag-button").addEventListener("click", setFlag);
}

function createBoard(difficulty) {
    clearBoard();
    switch (difficulty) {
        case "easy":
            createEasy();
            break;
        case "medium":
            createMedium();
            break;
        case "hard":
            createHard();
            break;
        default:
            createEasy(); // Default to easy board
    }
}

function clearBoard() {
    // Clear the board
    document.getElementById("board").innerHTML = "";
    // Reset other game variables if needed
    board = [];
    minesLocation = [];
    tilesClicked = 0;
    flagEnabled = false;
    gameOver = false;
}

function createEasy() {
    rows = 8;
    columns = 8;
    minesCount = 5;
    document.getElementById("mines-count").innerText = minesCount;
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            document.getElementById("board").appendChild(tile);
            row.push(tile);
        }
        board.push(row);
    }
    addMines();
}

function createMedium() {
    rows = 10;
    columns = 10;
    minesCount = 15;
    document.getElementById("mines-count").innerText = minesCount;
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div2");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            document.getElementById("board").appendChild(tile);
            row.push(tile);
        }
        board.push(row);
    }
    addMines();
}

function createHard() {
    rows = 12;
    columns = 12;
    minesCount = 25;
    document.getElementById("mines-count").innerText = minesCount;
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div3");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            document.getElementById("board").appendChild(tile);
            row.push(tile);
        }
        board.push(row);
    }
    addMines();
}

function setFlag() {
    if (flagEnabled) {
        flagEnabled = false;
        document.getElementById("flag-button").style.backgroundColor = "lightgrey";
    } else {
        flagEnabled = true;
        document.getElementById("flag-button").style.backgroundColor = "darkgrey";
    }
}

function clickTile() {
    let tile = this;
    if (flagEnabled) {
        // Flag mode
        if (tile.innerText === "") {
            tile.innerText = "🚩";
        } else if (tile.innerText === "🚩") {
            tile.innerText = "";
        }
        return;
    }
    if (minesLocation.includes(tile.id)) {
        alert("Game Over!");
        gameOver = true;
        revealMines();
        return;
    }

    // Calculate number of surrounding bombs
    let bombCount = getSurroundingBombCount(tile);

    // Apply appropriate class based on bomb count
    if (bombCount > 0) {
        tile.classList.add(bombCount);
        tile.classList.add("tileClicked");
        tile.innerText = bombCount;
    } else {
        // If no surrounding bombs, recursively reveal adjacent tiles
        revealEmptyTiles(tile);
    }

    // Increment tiles clicked count
    tilesClicked++;

    // Check if all non-mine tiles are clicked (win condition)
    if (tilesClicked === rows * columns - minesCount && !gameOver) {
        gameOver = true;
        revealMines();
        alert("Congratulations! You Win!");
    }
}



function getSurroundingBombCount(tile) {
    let count = 0;
    let id = tile.id.split("-");
    let row = parseInt(id[0]);
    let col = parseInt(id[1]);

    // Loop through surrounding tiles
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            // Check if within bounds of the board
            if (i >= 0 && i < rows && j >= 0 && j < columns) {
                // Check if the tile contains a bomb
                let position = i + "-" + j;
                if (minesLocation.includes(position)) {
                    count++;
                }
            }
        }
    }

    return count;
}

function revealMines() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            if (minesLocation.includes(tile.id)) {
                tile.innerText = "💣";
                tile.style.backgroundColor = "red";
            }
        }
    }
}

function revealEmptyTiles(tile) {
    let id = tile.id.split("-");
    let row = parseInt(id[0]);
    let col = parseInt(id[1]);

    // Mark the current tile as clicked
    tile.classList.add("tileClicked");

    // Loop through surrounding tiles
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            // Check if within bounds of the board
            if (i >= 0 && i < rows && j >= 0 && j < columns) {
                let adjacentTile = document.getElementById(i + "-" + j);
                // Check if the adjacent tile is not already clicked
                if (!adjacentTile.classList.contains("tileClicked")) {
                    let bombCount = getSurroundingBombCount(adjacentTile);
                    if (bombCount === 0 && !minesLocation.includes(adjacentTile.id)) {
                        // If the adjacent tile has no surrounding bombs and is not a mine, recursively reveal it
                        revealEmptyTiles(adjacentTile);
                        adjacentTile.classList.add("tileClicked");
                        tilesClicked++;
                    } else if (!minesLocation.includes(adjacentTile.id)) {
                        // If the adjacent tile has surrounding bombs and is not a mine, reveal it and show the bomb count
                        adjacentTile.classList.add(bombCount);
                        adjacentTile.classList.add("tileClicked");
                        adjacentTile.innerText = bombCount;
                        // Increment tiles clicked count
                        tilesClicked++;
                    }
                }
            }
        }
    }
}


function addMines() {
    // Clear previous mine locations
    minesLocation = [];

    // Generate random mine locations
    while (minesLocation.length < minesCount) {
        let row = Math.floor(Math.random() * rows);
        let column = Math.floor(Math.random() * columns);
        let position = row + "-" + column;
        // Check if the position is not already a mine
        if (!minesLocation.includes(position)) {
            // Add the mine to the list
            minesLocation.push(position);
        }
    }
}


