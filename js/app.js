const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png" />';
const BALL_IMG = '<img src="img/ball.png" />';
const GLUE_IMG = '🧴'

var gBoard;
var gGamerPos;
var gIntervalBall;
var gIntervalGlue;
var gBallsAdded = 0;
var gBallsCollected = 0;
var isGlued = false

function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
	isGlued = false
	gIntervalBall = setInterval(function () {
		renderBall()
		gBallsAdded++
		updateBallsAdded()
	}, 3000)

	gIntervalGlue = setInterval(renderGlue, 5000)
}




function checkVictory() {
	if (+gBallsCollected === +gBallsAdded + 2) {
		var elHide = document.querySelectorAll('.hide')
		for (var i = 0; i < elHide.length; i++) {
			elHide[i].style.display = 'none'
		}
		var elBtn = document.querySelector('.restart')
		elBtn.style.display = 'block'
	}
}

function restartGame() {

	var elHide = document.querySelectorAll('.hide')
	for (var i = 0; i < elHide.length; i++) {
		elHide[i].style.display = 'block'
	}
	var elBtn = document.querySelector('.restart')
	elBtn.style.display = 'none'

	gBallsCollected = 0
	updateBallsCollected()
	gBallsAdded = 0
	updateBallsAdded()

	initGame()

}

function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)


	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;
	board[0][6].type = FLOOR;
	board[5][0].type = FLOOR;
	board[5][11].type = FLOOR;
	board[9][6].type = FLOOR;


	// console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			// if (currCell.type === FLOOR) cellClass += ' floor';
			// else if (currCell.type === WALL) cellClass += ' wall';

			cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall';

			//TODO - Change To template string
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	// console.log('strHTML is:');
	// console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {

	if (isGlued) return

	if (i === -1) i = gBoard.length - 1;
	else if (i === gBoard.length) i = 0;
	else if (j === -1) j = gBoard[0].length - 1;
	else if (j === gBoard[0].length) j = 0;

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || (iAbsDiff === 11 && jAbsDiff === 0) || (iAbsDiff === 0 && jAbsDiff === 9)) {

		if (targetCell.gameElement === BALL) {
			console.log('Collecting!')
			gBallsCollected++
			updateBallsCollected()
			playSound()
			checkVictory()
		} else if (targetCell.gameElement === GLUE) {
			console.log('hi')
			isGlued = true
			setTimeout(function () {
				isGlued = false
			}, 3000);
		}



		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);

	}// else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
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

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function renderGlue() {
	var emptysCells = getEmptyCells()
	if (!emptysCells.length) return
	var currCellCoord = drawNum(emptysCells)

	gBoard[currCellCoord.i][currCellCoord.j].gameElement = GLUE;
	renderCell(currCellCoord, GLUE_IMG);
	setTimeout(clearGlue, 3000, currCellCoord)
}

function clearGlue(randCell) {
	if (gBoard[randCell.i][randCell.j].gameElement !== GAMER) {
		gBoard[randCell.i][randCell.j].gameElement = null;
		renderCell(randCell, '');
	}
}

function renderBall() {

	var emptysCells = getEmptyCells()
	var currCellCoord = drawNum(emptysCells)
	console.log('empty cell: ', currCellCoord)

	gBoard[currCellCoord.i][currCellCoord.j].gameElement = BALL;
	renderCell(currCellCoord, BALL_IMG);
}

function playSound() {
	var sound = new Audio("sound/ball.wav");
	sound.play();
}

function updateBallsAdded() {
	var elDiv = document.querySelector('.add-balls');
	elDiv.innerText = `Balls added: ${gBallsAdded}`
}

function updateBallsCollected() {
	var elDiv = document.querySelector('.collect-balls');
	elDiv.innerText = `Balls collected: ${gBallsCollected}`
}

function getEmptyCells() {
	var emptyCells = []
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var cell = gBoard[i][j];
			var coord = { i: i, j: j }
			if (cell.gameElement === null && cell.type === FLOOR) {
				emptyCells.push(coord)
			}
		}
	}
	return emptyCells
}

function drawNum(cells) {
	var idx = getRandomIntInclusive(0, cells.length - 1)
	return cells[idx]
}

//util.js:
function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}