'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/candy.png">'

// Model:
var gBoard
var gGamerPos
var gCounter
var gBallsInterval
var gGlueInterval
var gIsGlue
function onInitGame() {
    const elRestartBtn = document.querySelector('.restart-btn')
    elRestartBtn.classList.add('hidden')
    gCounter = 0
    gIsGlue = false
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    gBallsInterval = setInterval(newBallInRandomCell, 5000)
    gGlueInterval = setInterval(setGlue, 5000)
}

function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < 10; i++) {
        board[i] = []
        for (var j = 0; j < 12; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === 9 || j === 0 || j === 11) {
                board[i][j].type = WALL
            }
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[3][8].gameElement = BALL
    board[4][8].gameElement = BALL
    board[2][3].gameElement = GLUE
    board[0][5].type = FLOOR
    board[9][5].type = FLOOR
    board[5][0].type = FLOOR
    board[5][11].type = FLOOR
    return board
}


// Render the board to an HTML table
function renderBoard(board) {
    const elScore = document.querySelector('span')
    elScore.innerText = gCounter
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })
            // console.log('cellClass:', cellClass)

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'
            else if (currCell.type === GLUE) cellClass += ' GLUE'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            } else if (currCell.gameElement === GLUE) {
                strHTML += GLUE_IMG
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'

    }
    const elBoard = document.querySelector('.board')
    elBoard.classList.remove('hidden')
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    setPortal(i, j)
    const targetCell = gBoard[i][j]
    // if (gIsGlue) return
    if (targetCell.type === WALL) return
    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)
    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
        if (targetCell.gameElement === BALL) {
            var audio = new Audio('./sound/sound.wav')
            audio.play()
            const elScore = document.querySelector('span')
            gCounter++
            elScore.innerHTML = gCounter
        }
        // DONE: Move the gamer
        // REMOVING FROM
        // update Model
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update DOM
        renderCell(gGamerPos, '')

        // ADD TO
        // update Model
        targetCell.gameElement = GAMER
        gGamerPos = { i, j }
        // update DOM
        renderCell(gGamerPos, GAMER_IMG)

    }
    if (isGameOver()) {
        const elBoard = document.querySelector('.board')
        const elRestartBtn = document.querySelector('.restart-btn')
        elBoard.classList.add('hidden')
        elRestartBtn.classList.remove('hidden')
        clearInterval(gInterval)
    }
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
    // countNeighbors()
}

function setPortal(i, j) {
    if (i === 5 && j === 12 || i === 5 && j === -1) {
        if (j < 0) j = 11
        else j = 0
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        renderCell(gGamerPos, '')
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
        gGamerPos = { i, j }
        renderCell(gGamerPos, GAMER_IMG)
    }
    if (i === -1 && j === 5 || i === 10 && j === 5) {
        if (i < 0) i = 9
        else i = 0
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        renderCell(gGamerPos, '')
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
        gGamerPos = { i, j }
        renderCell(gGamerPos, GAMER_IMG)
    }
}
function countNeighbors() {
    var counter = 0
    for (var i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {
        if(i < 0 || i > gBoard.length -1) continue
        for (var j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {
            if(j < 0 || j > gBoard.length -1) continue
            if (gBoard[i][j].gameElement === BALL) {
                counter++
            }
        }
    }
}

function setGlue() {
    const emptyCells = getEmptyCells(gBoard)
    const randomCell = getRandomCell(emptyCells)
    const cell = gBoard[randomCell.i][randomCell.j]
    cell.gameElement = GLUE
    renderCell(randomCell, GLUE_IMG)
    setTimeout(() =>{
        if(cell.gameElement === GLUE){
            renderCell(randomCell, '')
            cell.gameElement = null
        }
        gIsGlue = false
    },3000)
}
// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j
    console.log('event.key:', event.key)

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}
// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}
function getEmptyCells(board) {
    const emptyCells = []
    for (var i = 1; i < 9; i++) {
        for (var j = 1; j < 11; j++) {
            if (board[i][j].gameElement === null && board[i][j].type === FLOOR) {
                emptyCells.push({ i, j })
            }
        }
    }
    return emptyCells
}

function getRandomCell(emptyCells) {
    var randomI = Math.floor(Math.random() * (emptyCells.length - 0) + 0);
    var randomJ = Math.floor(Math.random() * (emptyCells.length - 0) + 0);
    return { i: emptyCells[randomI].i, j: emptyCells[randomJ].j }
}
function newBallInRandomCell() {
    const emptyCells = getEmptyCells(gBoard)
    const randomCell = getRandomCell(emptyCells)
    const cell = gBoard[randomCell.i][randomCell.j]
    cell.gameElement = BALL
    renderCell(randomCell, BALL_IMG)
}
function isGameOver() {
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 11; j++) {
            if (gBoard[i][j].gameElement === BALL) {
                return false
            }
        }
    }
    return true
}