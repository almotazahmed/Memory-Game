// MemoryCardGame class represents the main game logic and UI interactions.
class MemoryCardGame {
  // Constructor to initialize game elements and variables.
  constructor(
    gameBody,
    imageBoxes,
    nameBox,
    tempsNumberBox,
    timeBox,
    wrongTriesBox,
    time
  ) {
    this.gameBody = gameBody;
    this.imageBoxes = imageBoxes;
    this.nameBox = nameBox;
    this.tempsNumberBox = tempsNumberBox;
    this.timeBox = timeBox;
    this.wrongTriesBox = wrongTriesBox;
    this.time = time;
    this.playerName = "";
    this.wrongTriesNum = 0;
    this.timeIntervalMethod = null;
    this.firstClickedImgBox = null;
    this.numberOfCorrectChoose = 0;
    this.numberOfTemps = 0;
    this.flippingTime = 800;
  }

  // Method to start the game.
  startGame() {
    this.hideOverlay();
    this.clearGameBoard();
    this.resetGameVariables();
    this.updateRoundCounter();
    let shuffledImageBoxes = this.shuffleImageBoxes();

    this.addClickListeners(shuffledImageBoxes);

    this.stopClickingForDuration(4000);

    this.delayedStartGame(shuffledImageBoxes);
  }

  // Method to hide the game overlay.
  hideOverlay() {
    document.body.querySelector(".over-lay").style.display = "none";
  }

  // Method to reset game-related variables.
  resetGameVariables() {
    this.wrongTriesNum = 0;
    this.wrongTriesBox = this.wrongTriesNum;
    this.timeIntervalMethod = null;
    this.firstClickedImgBox = null;
    this.numberOfCorrectChoose = 0;
    console.log(this.wrongTriesNum);
    console.log(this.wrongTriesBox);
    console.log(this.timeIntervalMethod);
    console.log(this.firstClickedImgBox);
    console.log(this.numberOfCorrectChoose);
  }

  // Method to update and display the round counter.
  updateRoundCounter() {
    window.sessionStorage.setItem("attempts-number", ++this.numberOfTemps);
    this.tempsNumberBox.textContent = this.numberOfTemps;
  }

  // Method to clear the game board.
  clearGameBoard() {
    this.gameBody.innerHTML = "";
  }

  // Method to shuffle the image boxes.
  shuffleImageBoxes() {
    const shuffledImageBoxes = this.shuffle(Array.from(this.imageBoxes));
    return shuffledImageBoxes;
  }

  // This method shuffles the elements in an array using the Fisher-Yates algorithm.
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      // Generate a random index between 0 and i (inclusive).
      let j = Math.floor(Math.random() * (i + 1));

      // Swap the elements at positions i and j in the array.
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array; // Return the shuffled array.
  }

  // Method to add click event listeners to image boxes.
  addClickListeners(imageBoxes) {
    imageBoxes.forEach((imgBox) => {
      imgBox.classList.remove("has-match");
      console.log(imgBox);
      imgBox.addEventListener("click", this.handleCardClick.bind(this, imgBox));
      this.gameBody.appendChild(imgBox);
    });
  }

  // Method to prevent clicking on the game board for a specified duration.
  stopClickingForDuration(duration) {
    this.gameBody.classList.add("no-clicking");
    setTimeout(() => {
      this.gameBody.classList.remove("no-clicking");
    }, duration);
  }

  // Method to start the game with delayed card flipping.
  delayedStartGame(imageBoxes) {
    this.delayedFlipAndUnflip(imageBoxes, () => {
      this.startTime(this.time);
    });
  }

  // Method to perform delayed card flipping and unflipping.
  delayedFlipAndUnflip(imageBoxes, callback) {
    const startingSound = document.querySelector("#starting-sound");
    const delayBetweenFlips = 100;
    const flipDuration = 3000;

    setTimeout(() => {
      let currentIndex = 0;

      const flipNextBox = () => {
        if (currentIndex < imageBoxes.length) {
          const currentBox = imageBoxes[currentIndex];
          setTimeout(() => {
            this.flipBox(currentBox, startingSound);
            currentIndex++;
            flipNextBox();
          }, delayBetweenFlips);
        } else {
          setTimeout(() => {
            this.unflipAllBoxes(imageBoxes);
            this.callCallback(callback);
          }, flipDuration);
        }
      };

      flipNextBox();
    }, this.flippingTime - 300);
  }

  // Method to flip a card and play a sound.
  flipBox(box, startingSound) {
    box.classList.add("is-flipped");
    startingSound.play();
  }

  // Method to unflip all cards.
  unflipAllBoxes(boxes) {
    boxes.forEach((box) => {
      box.classList.remove("is-flipped");
    });
  }

  // Method to call a callback function if it's a function.
  callCallback(callback) {
    if (typeof callback === "function") {
      callback();
    }
  }

  startTime(time) {
    let durations = time;
    let minutes, seconds;

    // Set up an interval to update the timer every 1000 milliseconds (1 second)
    this.timeIntervalMethod = setInterval(() => {
      // Calculate minutes and seconds from the remaining time
      minutes = parseInt(durations / 60);
      seconds = parseInt(durations % 60);

      // Ensure minutes and seconds are displayed with leading zeros if they are less than 10
      minutes = minutes < 10 ? `0${minutes}` : minutes;
      seconds = seconds < 10 ? `0${seconds}` : seconds;

      // Update the time display in the UI with the formatted time
      this.timeBox.textContent = `${minutes}:${seconds}`;

      // Check if time has reached zero (time's up)
      if (--durations < 0) {
        this.checkForWin(); // Call a function to check if the player has won
      }
    }, 1000); // The interval runs every 1000 milliseconds (1 second)
  }

  // This method is called when a card is clicked.
  handleCardClick(imgBox) {
    imgBox.classList.add("is-flipped"); // Flip the clicked card.

    if (this.firstClickedImgBox) {
      // If there's already a card flipped (firstClickedImgBox is not null), stop further clicks for a short duration and check for a match.
      this.stopClicking(this.flippingTime);
      this.checkMatchedBlocks(this.firstClickedImgBox, imgBox);
    } else {
      // If it's the first card clicked, store it in firstClickedImgBox and play a click sound.
      this.firstClickedImgBox = imgBox;
      document.querySelector("#click-sound").play();
    }
  }

  // This method stops further clicks on the game area for a specified duration.
  stopClicking(duration) {
    this.gameBody.classList.add("no-clicking"); // Add a class to prevent clicking.

    setTimeout(() => {
      this.gameBody.classList.remove("no-clicking"); // Remove the class after the specified duration.
    }, duration);
  }

  // This method checks if two clicked cards match and handles the logic accordingly.
  checkMatchedBlocks(first, second) {
    let winSound = document.querySelector("#win-sound");
    let loseSound = document.querySelector("#lose-sound");

    if (
      first.getAttribute(" data-technology") ===
      second.getAttribute(" data-technology")
    ) {
      // If the data types of the two cards match, it's a successful match.
      winSound.play(); // Play a win sound.
      first.classList.remove("is-flipped"); // Remove the flipped state from the first card.
      second.classList.remove("is-flipped"); // Remove the flipped state from the second card.
      first.classList.add("has-match"); // Add a class to mark the first card as matched.
      second.classList.add("has-match"); // Add a class to mark the second card as matched.
      this.firstClickedImgBox = null; // Reset the first clicked card for the next turn.

      if (++this.numberOfCorrectChoose === this.imageBoxes.length / 2) {
        // If all pairs have been matched, the player wins.
        this.checkForWin();
      }
    } else {
      console.log(this.wrongTriesNum++);
      // If the data types don't match, it's not a successful match.
      this.wrongTriesBox.textContent = this.wrongTriesNum; // Increment and display the wrong tries count.

      setTimeout(() => {
        first.classList.remove("is-flipped"); // Unflip the first card.
        second.classList.remove("is-flipped"); // Unflip the second card.
      }, this.flippingTime - 300); // Wait for a short duration before unflipping the cards.
      loseSound.play(); // Play a lose sound.
    }
  }

  // This method is called to check if the player has won the game.
  checkForWin() {
    clearInterval(this.timeIntervalMethod); // Stop the game timer.
    document.body.querySelector(".over-lay").style.display = "block"; // Display the game over overlay.

    if (this.numberOfCorrectChoose === this.imageBoxes.length / 2) {
      // If the number of correct matches equals half of the total card pairs, the player has won.
      this.finishPlayPopup(true); // Display a game over popup with a win message.
    } else {
      // If not all pairs have been matched, the player has lost.
      this.finishPlayPopup(false); // Display a game over popup with a lose message.
    }
  }

  // This method displays a popup to inform the player about the game outcome (win or lose) and provides options to replay.
  finishPlayPopup(flag) {
    // Create the main popup div
    let mainPopup = this.createDivWithClass("finish-popup");

    // Create the div for displaying the game outcome message
    let stateDiv = this.createDivWithClass("state-div");

    if (flag) {
      // If the 'flag' parameter is true, the player has won
      stateDiv.innerHTML = `Congratulations <span>[ ${this.playerName} ]</span> You Won In The <span>[ ${this.numberOfTemps} ]</span> Round`;
    } else {
      // If the 'flag' parameter is false, the player has lost
      stateDiv.innerHTML = `GameOver <span>[ ${this.playerName} ]</span> You Lose In The <span>[ ${this.numberOfTemps} ]</span> Round`;
    }

    // Create a div for buttons
    let btnDiv = this.createDivWithClass("btnDiv");

    // Create a button to replay with the same name
    let startWithSameNameBtn = this.createButtonWithClass(
      "Replay",
      "start-with-same-name"
    );

    // Create a button to start a new game with a different name
    let startWithNewNameBtn = this.createButtonWithClass(
      "New Play",
      "start-with-new-name"
    );

    // Add click event listeners to the replay and new play buttons
    startWithSameNameBtn.addEventListener("click", () => {
      mainPopup.remove();
      this.startGame();
    });

    startWithNewNameBtn.addEventListener("click", () => {
      mainPopup.remove();
      this.startPopup();
    });

    // Append the buttons to the button div
    btnDiv.appendChild(startWithSameNameBtn);
    btnDiv.appendChild(startWithNewNameBtn);

    // Append the message div and button div to the main popup
    mainPopup.appendChild(stateDiv);
    mainPopup.appendChild(btnDiv);

    // Append the main popup to the document body
    document.body.appendChild(mainPopup);
  }

  // This method is called when starting the game or when loading saved session data.
  firstStart() {
    if (
      window.sessionStorage.getItem("attempts-number") &&
      window.sessionStorage.getItem("player-name")
    ) {
      // If session data exists (player name and round count), load it.
      this.numberOfTemps = window.sessionStorage.getItem("attempts-number");
      this.tempsNumberBox.textContent = this.numberOfTemps;
      this.playerName = window.sessionStorage.getItem("player-name");
      this.nameBox.textContent = this.playerName;
      this.finishPlayPopup(false); // Display a popup indicating a game continuation.
    } else {
      // If no session data exists, prompt the user to start a new game.
      this.startPopup();
    }
  }

  // This method is called to display a popup for entering the player's name and starting the game.
  startPopup() {
    window.sessionStorage.clear(); // Clear any existing session storage data.

    // Create the main popup div
    const mainPop = document.createElement("div");
    mainPop.classList.add("start-popup");

    // Create the popup text div and set its content
    const popupTxtDiv = this.createDivWithClass("popup-text");
    popupTxtDiv.textContent = "Enter Your Name To Start:";

    // Create the input div
    const inputDiv = this.createDivWithClass("input-div");

    // Create the input field
    const inputField = this.createInputWithClass("text", "name-input");

    // Create the Start button
    const btn = this.createButtonWithClass("Start", "name-btn");

    // Add a click event listener to the Start button
    btn.addEventListener("click", () => {
      const playerName = inputField.value.trim();
      if (!playerName) {
        // If the player's name is empty, add a border to the input field and focus it.
        inputField.style.border = "2px solid black";
        inputField.focus();
      } else {
        // If a valid player name is entered:
        this.playerName = playerName; // Store the player's name.
        this.nameBox.textContent = this.playerName; // Update the displayed player's name.
        this.numberOfTemps = 0; // Reset the number of rounds.
        window.sessionStorage.setItem("player-name", playerName); // Store player name in session storage.
        window.sessionStorage.setItem("attempts-number", this.numberOfTemps); // Store the round count in session storage.
        mainPop.remove(); // Remove the popup from the DOM.
        this.startGame(); // Start the game.
      }
    });

    // Append elements to the main popup
    inputDiv.appendChild(inputField);
    inputDiv.appendChild(btn);
    mainPop.appendChild(popupTxtDiv);
    mainPop.appendChild(inputDiv);

    // Append the main popup to the document body
    document.body.appendChild(mainPop);
  }

  // Helper function to create a div with a given class
  createDivWithClass(className) {
    const div = document.createElement("div");
    div.classList.add(className);
    return div;
  }

  // Helper function to create an input with a given type and class
  createInputWithClass(type, className) {
    const input = document.createElement("input");
    input.type = type;
    input.classList.add(className);
    return input;
  }

  // Helper function to create a button with a given text and class
  createButtonWithClass(text, className) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.classList.add(className);
    return btn;
  }
}

let gameBody = document.querySelector(".game-body");
let imageBoxes = document.querySelectorAll(".game-body .img-box");
let timeBox = document.querySelector(".time");
let nameBox = document.querySelector(".name .user-name");
let tempsNumberBox = document.querySelector(".name .temps-number");
let wrongTriesBox = document.querySelector(".wrong-tries .wrong-tries-number");
let time = 120;

console.log(gameBody);
console.log(imageBoxes);
console.log(timeBox);
console.log(nameBox);
console.log(tempsNumberBox);
console.log(wrongTriesBox);
console.log(time);

new MemoryCardGame(
  gameBody,
  imageBoxes,
  nameBox,
  tempsNumberBox,
  timeBox,
  wrongTriesBox,
  time
).firstStart();
