'use strict';
const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE';
const GAMER_IMG = '<img src="./img/gamer.png">';
const BALL_IMG = '<img src="./img/ball.png">';
const GLUE_IMG = '<img src="./img/glue.png">';
const BALLS_TO_WIN = 5;
var gBoard;
var gGamerPos;
var gAddBallInterval;
var gAddGlueInterval;
var gScore = 0;
var gisGlue = false;
var gGameOn = false;
var gBallCounter = 3;

function init() {
    gScore = 0;
    gBallCounter = 3;
    gBoard = buildBoard();
    setRandomPosition();
    renderBoard(gBoard);
    clearInterval(gAddBallInterval);
    clearInterval(gAddGlueInterval);
}

function restartGame() {
    var elH3 = document.querySelector('h3');
    elH3.style.display = 'none';
    init();
    gAddBallInterval = setInterval(addBallRandom, 1200);
    gAddGlueInterval = setInterval(addGlueRandom, 2000);
    var elScore = document.querySelector('h2 span');
    elScore.innerText = gScore;
    gGameOn = true;
}

function changeScore() {
    var elScore = document.querySelector('h2 span');
    elScore.innerText = gScore;
    var audio = new Audio('./sound/ballSound.mp3');
    audio.play();
    if (gScore === gBallCounter || gScore >= 120) {
        clearInterval(gAddBallInterval);
        clearInterval(gAddGlueInterval);
        var elH3 = document.querySelector('h3');
        elH3.style.display = 'block';
        var audio2 = new Audio('./sound/winer.mp3');
        audio2.play();
        gGameOn = false;
    }
}

function addBallRandom() {
    var posBall = randomEmptyCell();
    gBoard[posBall.i][posBall.j].gameElement = BALL;
    renderCell(posBall, BALL_IMG);
    gBallCounter++;
}

function randomEmptyCell() {
    var randomRow = getRandomInt(1, 9);
    var randomCol = getRandomInt(1, 11);
    while (1) {
        if (gBoard[randomRow][randomCol].gameElement === null) {
            return { i: randomRow, j: randomCol };
        }
        randomRow = getRandomInt(1, 8);
        randomCol = getRandomInt(1, 10);
    }
}

function buildBoard() {
    var board = createMat(10, 12);
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = { type: FLOOR, gameElement: null };
            if (i === 0 || i === board.length - 1 ||
                j === 0 || j === board[0].length - 1) {
                cell.type = WALL;
                if (i === 5 || j === 5) cell.type = FLOOR;
            }
            board[i][j] = cell;
        }
    }
    return board;
}

function setRandomPosition() {
    gGamerPos = randomEmptyCell();
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
    var ball = randomEmptyCell();
    gBoard[ball.i][ball.j].gameElement = BALL;
    ball = randomEmptyCell();
    gBoard[ball.i][ball.j].gameElement = BALL;
    ball = randomEmptyCell();
    gBoard[ball.i][ball.j].gameElement = BALL;

}

function renderBoard(board) {
    var elBoard = document.querySelector('.board');
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j });
            if (currCell.type === FLOOR) cellClass += ' floor';
            else if (currCell.type === WALL) cellClass += ' wall';
            strHTML += `\t<td class=" cell ${cellClass}" onclick="moveTo(${i},${j})" >\n`;

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG;
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG;
            } else if (currCell.gameElement === GLUE) {
                strHTML += GLUE_IMG;
            }
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    elBoard.innerHTML = strHTML;
}


// Move the player to a specific location
function moveTo(i, j) {
    if (gisGlue) return;
    if (!gGameOn) return;
    if (moveToUnderground(i, j)) return;

    var targetCell = gBoard[i][j];
    if (targetCell.type === WALL) return;

    // Calculate distance to make sure we are moving to a neighbor cell
    var iAbsDiff = Math.abs(i - gGamerPos.i);
    var jAbsDiff = Math.abs(j - gGamerPos.j);

    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
        if (targetCell.gameElement === BALL) {
            console.log('Collecting!');
            gScore++;
            changeScore();
        }
        var saveCell = targetCell.gameElement;
        // Move the gamer
        // MODEL
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
        targetCell.gameElement = GAMER;
        // DOM
        renderCell(gGamerPos, '');
        gGamerPos = { i: i, j: j };
        renderCell(gGamerPos, GAMER_IMG);

        if (saveCell === 'GLUE') {
            gisGlue = true;
            setTimeout(function() {
                gisGlue = false;
                console.log('you free');
            }, 4000);
        }
    } else console.log('TOO FAR', iAbsDiff, jAbsDiff)
}

function moveToUnderground(i, j) {
    if (i === -1 && j === 5) i = gBoard.length - 1;
    else if (i === gBoard.length && j === 5) i = 0;
    else if (i === 5 && j === -1) j = gBoard[0].length - 1;
    else if (i === 5 && j === gBoard[0].length) j = 0;
    else
        return false;

    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
    gBoard[i][j].gameElement = GAMER;

    // DOM
    renderCell(gGamerPos, '');
    gGamerPos = { i: i, j: j };
    renderCell(gGamerPos, GAMER_IMG);
    return true;
}

// Convert a location object {i, j} to a selector and render a value in that element

function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location);
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
    var i = gGamerPos.i;
    var j = gGamerPos.j;
    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1);
            break;
        case 'ArrowRight':
            moveTo(i, j + 1);
            break;
        case 'ArrowUp':
            moveTo(i - 1, j);
            break;
        case 'ArrowDown':
            moveTo(i + 1, j);
            break;
    }
}

function addGlueRandom() {
    var posGlue = randomEmptyCell();
    gBoard[posGlue.i][posGlue.j].gameElement = GLUE;
    renderCell(posGlue, GLUE_IMG);
    setTimeout(function() {
        if (gBoard[posGlue.i][posGlue.j].gameElement === GLUE) {
            gBoard[posGlue.i][posGlue.j].gameElement = null;
            renderCell(posGlue, '');
        }
    }, 5000)
}