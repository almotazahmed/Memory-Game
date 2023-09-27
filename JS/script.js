class MemoryCardGame {
  constructor(gameBody, imageBoxes, timeBox, time) {
    this.gameBody = gameBody;
    this.imageBoxes = imageBoxes;
    this.timeBox = timeBox;
    this.time = time;
    this.timeoutMethod = null;
  }

  startGame() {
    this.startTime(this.time);
    this.gameBody.innerHTML = "";
    const shuffledImageBoxes = this.shuffle(Array.from(this.imageBoxes));

    shuffledImageBoxes.forEach((imgBox) => {
      imgBox.addEventListener("click", (ev) => {
        this.handleCardClick(imgBox);
      });
      this.gameBody.appendChild(imgBox);
    });

    this.stopClicking(4000);

    setTimeout(() => {
      shuffledImageBoxes.forEach((box) => {
        box.classList.add("is-flipped");
      });

      setTimeout(() => {
        shuffledImageBoxes.forEach((box) => {
          box.classList.remove("is-flipped");
        });
      }, 3000);
    }, 1000);
  }

  handleCardClick(imgBox) {
    imgBox.classList.add("is-flipped");

    let allFlippedBlocks = Array.from(this.imageBoxes).filter((flippedBlock) =>
      flippedBlock.classList.contains("is-flipped")
    );

    if (allFlippedBlocks.length === 2) {
      this.stopClicking(1000);
      this.checkMatchedBlocks(allFlippedBlocks[0], allFlippedBlocks[1]);
    }
  }

  stopClicking(duration) {
    this.gameBody.classList.add("no-clicking");

    setTimeout(() => {
      this.gameBody.classList.remove("no-clicking");
    }, duration);
  }

  checkMatchedBlocks(first, second) {
    let winSound = document.querySelector("#win-sound");
    let loseSound = document.querySelector("#lose-sound");
    if (first.getAttribute("data-type") === second.getAttribute("data-type")) {
      winSound.play();
      first.classList.remove("is-flipped");
      second.classList.remove("is-flipped");
      first.classList.add("has-match");
      second.classList.add("has-match");
    } else {
      setTimeout(() => {
        first.classList.remove("is-flipped");
        second.classList.remove("is-flipped");
      }, 1000);
      loseSound.play();
    }
  }

  checkForWin() {
    // Check if the player has won the game
  }

  restartGame() {
    // Restart the game and reset the timer
    clearInterval(this.timeoutMethod); // Clear the interval when restarting
    this.startGame(); // Start a new game
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  startTime(time) {
    let minutes, seconds;
    this.timeoutMethod = setInterval(() => {
      minutes = parseInt(time / 60);
      seconds = parseInt(time % 60);

      minutes = minutes < 10 ? `0${minutes}` : minutes;
      seconds = seconds < 10 ? `0${seconds}` : seconds;

      this.timeBox.textContent = `${minutes}:${seconds}`;

      if (--time < 0) {
        console.log("finish");
        clearInterval(this.timeoutMethod); // Stop the interval when time is up
      }
    }, 1000);
  }

  startPopup() {
    let mainPop = document.createElement("div");
    mainPop.classList.add("start-popup");
    mainPop.textContent = "Start Game";
    document.body.appendChild(mainPop);
    let overLay = document.body.querySelector(".over-lay");
    mainPop.addEventListener("click", () => {
      mainPop.remove();
      overLay.remove();
      this.startGame();
    });
  }
}

let gameBody = document.querySelector(".game-body");
let imageBoxes = document.querySelectorAll(".game-body .img-box");
let timeBox = document.querySelector(".time");
let time = 15;

const game = new MemoryCardGame(gameBody, imageBoxes, timeBox, time);
game.startPopup();
