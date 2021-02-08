document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', control)
    const grid = document.querySelector('.grid')
    let squares = Array.from(document.querySelectorAll('.grid div'))
    const scoreDisplay = document.querySelector('#score')
    const levelDisplay = document.querySelector('#level')
    const startBtn = document.querySelector('#start-button')
    const width = 10
    let nextRandom = Math.floor(Math.random() * 7)
    let timerId
    let score = 0
    let level = 1
    let lineCounter = 0
    let speed = 1000
    let backgroundMusic = new backgroundSound("./sounds/Something In The Style Of Nekrassow.mp3")
    let gameOverMusic = new sound("./sounds/Game Over Music 1.mp3")
    let bonusSound = new sound("./sounds/Whoap 3.mp3")
    const colors = [
        'orange',
        'red',
        'purple',
        'green',
        'blue',
        'pink',
        'yellow'
    ]

    // The Tetrominoes
    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ]
    const ilTetromino = [
        [0, width + 1, width * 2 + 1, 1],
        [2, width, width + 1, width + 2],
        [1, width + 1, width * 2 + 1, width * 2 + 2],
        [width, width + 1, width + 2, width * 2]
    ]
    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ]
    const izTetromino = [
        [width, width + 1, width * 2 + 1, width * 2 + 2],
        [2, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width * 2 + 1, width * 2 + 2],
        [2, width + 1, width + 2, width * 2 + 1]
    ]
    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ]
    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ]
    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ]

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino, ilTetromino, izTetromino]

    let currentPosition = 4
    let currentRotation = 0

    //select random Tetromino and first rotation
    let random = Math.floor(Math.random() * theTetrominoes.length)
    let current = theTetrominoes[random][currentRotation]

    //assign keyCodes to functions
    function control(e) {
        if (e.keyCode === 32) {
            startPause()
        }
        if (timerId) {
            if (e.keyCode === 37) {
                moveLeft()
            } else if (e.keyCode === 38) {
                rotate()
            } else if (e.keyCode === 39) {
                moveRight()
            } else if (e.keyCode === 40) {
                moveDown()
            }
        }
    }

    //draw Tetromino
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino')
            squares[currentPosition + index].style.backgroundColor = colors[random]
        })
    }

    //undraw
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino')
            squares[currentPosition + index].style.backgroundColor = ''
        })
    }

    //move down
    function moveDown() {
        undraw()
        currentPosition += width
        draw()
        freeze()
    }

    //freeze
    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'))
            //start new
            random = nextRandom
            nextRandom = Math.floor(Math.random() * theTetrominoes.length)
            current = theTetrominoes[random][currentRotation]
            currentPosition = 4
            addScore()
            draw()
            displayShape()
            gameOver()
        }
    }

    //move left, unnless is at the edge or blocked
    function moveLeft() {
        undraw()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

        if (!isAtLeftEdge) {
            currentPosition -= 1
        }
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1
        }
        draw()
    }
    //move right
    function moveRight() {
        undraw()
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)

        if (!isAtRightEdge) {
            currentPosition += 1
        }
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1
        }
        draw()
    }
    //rotate
    function rotate() {
        undraw()
        currentRotation++
        if (currentRotation === current.length) {
            currentRotation = 0
        }
        current = theTetrominoes[random][currentRotation]
        checkRotatedPosition()
        draw()
    }
    //rotation check near the edge
    function isAtRight() {
        return current.some(index => (currentPosition + index + 1) % width === 0)
    }

    function isAtLeft() {
        return current.some(index => (currentPosition + index) % width === 0)
    }

    function checkRotatedPosition(P) {
        P = P || currentPosition
        if ((P + 1) % width < 4) {
            if (isAtRight()) {
                currentPosition += 1
                checkRotatedPosition(P)
            }
        }
        else if (P % width > 5) {
            if (isAtLeft()) {
                currentPosition -= 1
                checkRotatedPosition(P)
            }
        }
    }

    //show next tetromino
    const displaySquares = document.querySelectorAll('.mini-grid div')
    const displayWidth = 4
    let displayIndex = 0
    //Tetromino without rotation
    const upNextTetrominoes = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2], //lTetromino
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //zTetromino
        [1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
        [0, 1, displayWidth, displayWidth + 1], //oTetromino
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], //iTetromino
        [0, displayWidth + 1, displayWidth * 2 + 1, 1], //ilTetromino
        [displayWidth, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 2 + 2] //izTetromino
    ]

    //display the shape in the mini-grid display
    function displayShape() {
        //remove any trace of a tetromino form the entire grid
        displaySquares.forEach(square => {
            square.classList.remove('tetromino')
            square.style.backgroundColor = ''
        })
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino')
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
        })
    }

    //add button functionality
    startBtn.addEventListener('click', () => {
        startPause()
    })

    function startPause() {
        if (timerId) {
            clearInterval(timerId)
            timerId = null
            backgroundMusic.stop()
        } else {
            draw()
            timerId = setInterval(moveDown, speed)
            displayShape()
            backgroundMusic.play()
        }
    }

    //score counter
    function addScore() {
        let count = 0
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]
            if (row.every(index => squares[index].classList.contains('taken'))) {
                row.forEach(index => {
                    squares[index].classList.remove('taken')
                    squares[index].classList.remove('tetromino')
                    squares[index].style.backgroundColor = ''
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
                count++
            }
        }
        if (count === 1) {
            score += 10
            lineCounter += 1
            bonusSound.play()
        } else if (count === 2) {
            score += 30
            lineCounter += 2
            bonusSound.play()
        } else if (count === 3) {
            score += 90
            lineCounter += 3
            bonusSound.play()
        } else if (count === 4) {
            score += 270
            lineCounter += 4
            bonusSound.play()
        }
        scoreDisplay.innerHTML = score
        levelCounter()

    }
    //level
    function levelCounter() {
        if (lineCounter > 10) {
            level++
            levelDisplay.innerHTML = level
            lineCounter = 0
            setSpeed()
        }

    }
    //set speed
    function setSpeed() {
        speed - 100
        timerId = setInterval(moveDown, speed)
    }

    //game over
    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            backgroundMusic.stop()
            gameOverMusic.play()
            clearInterval(timerId)
            random = null
            nextRandom = null
            setTimeout(function () { alert("GAME OVER\nYour score: " + score + "\nRefresh for new game") }, 500)
        }
    }
    //sound object constuctors
    function sound(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.play = function () {
            this.sound.play();
        }
        this.stop = function () {
            this.sound.pause();
        }
    }
    function backgroundSound(src) {
        this.backgroundSound = document.createElement("audio");
        this.backgroundSound.src = src;
        this.backgroundSound.setAttribute("preload", "auto");
        this.backgroundSound.setAttribute("controls", "none");
        this.backgroundSound.setAttribute("loop", "autoplay")
        this.backgroundSound.style.display = "none";
        document.body.appendChild(this.backgroundSound);
        this.play = function () {
            this.backgroundSound.play();
        }
        this.stop = function () {
            this.backgroundSound.pause();
        }
    }
})