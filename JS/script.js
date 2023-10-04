window.addEventListener("load", function () {
  class MemoryCardGame {
    // Constructor to initialize game elements and variables.
    constructor(
      gameBody,
      imageBoxes,
      nameBox,
      attemptsNumberBox,
      timeBox,
      wrongTriesBox,
      time
    ) {
      this.gameBody = gameBody;
      this.imageBoxes = imageBoxes;
      this.nameBox = nameBox;
      this.attemptsNumberBox = attemptsNumberBox;
      this.timeBox = timeBox;
      this.wrongTriesBox = wrongTriesBox;
      this.time = time;
      this.playerName;
      this.wrongTriesNum;
      this.timeIntervalMethod;
      this.numberOfCorrectChoose;
      this.numberOfAttempts;
      this.flippingTime = 400;
    }

    // This method is called when starting the game or when loading saved session data.
    firstStart() {
      if (
        window.sessionStorage.getItem("attempts-number") &&
        window.sessionStorage.getItem("player-name")
      ) {
        // If session data exists, prompt if continue with the same name or start new game.
        this.dataExistPopup();
      } else {
        // If no session data exists, prompt the user to start a new game.
        this.newStartPopup();
      }
    }

    dataExistPopup() {
      // Create the main popup div
      let mainPopup = this.createDivWithClass("prompt-user-popup");

      // Create a button to replay with the same name
      let startWithSameNameBtn = this.createButtonWithClass(
        "Play With Same Name",
        "play-with-same-name"
      );

      // Create a button to start a new game with a different name
      let startWithNewNameBtn = this.createButtonWithClass(
        "Play With New Name",
        "play-with-new-name"
      );

      // Add click event listeners to the replay and new play buttons
      startWithSameNameBtn.addEventListener("click", () => {
        mainPopup.remove();
        this.startGame();
      });

      startWithNewNameBtn.addEventListener("click", () => {
        mainPopup.remove();
        this.newStartPopup();
      });

      // Append the buttons to main popup
      mainPopup.appendChild(startWithSameNameBtn);
      mainPopup.appendChild(startWithNewNameBtn);

      // Append the main popup to the document body
      document.body.appendChild(mainPopup);
    }

    // This method is called to display a popup for entering the player's name and starting the game.
    newStartPopup() {
      window.sessionStorage.clear(); // Clear any existing session storage data.

      // Create the main popup div
      const mainPop = this.createDivWithClass("start-popup");

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
          window.sessionStorage.setItem("player-name", playerName); // Store player name in session storage.
          window.sessionStorage.setItem("attempts-number", 0); // Store the round count in session storage.
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

    startGame() {
      this.hideOverlay();
      this.resetGameVariables();
      this.clearGameBoard();
      this.clearMatchedImgBoxes();

      imageBoxes = this.shuffle(Array.from(this.imageBoxes));

      this.addClickListeners();

      this.stopClickingForDuration(6600);

      this.delayedStartGame();
    }

    // Method to hide the game overlay.
    hideOverlay() {
      document.body.querySelector(".over-lay").style.display = "none";
    }

    // Method to reset game-related variables.
    resetGameVariables() {
      this.wrongTriesNum = 0;
      this.timeIntervalMethod = null;
      this.numberOfCorrectChoose = 0;
      this.playerName = window.sessionStorage.getItem("player-name");
      this.numberOfAttempts = window.sessionStorage.getItem("attempts-number");
      window.sessionStorage.setItem("attempts-number", ++this.numberOfAttempts);
      // Display the player name and attempts number.
      this.nameBox.textContent = this.playerName;
      this.attemptsNumberBox.textContent = this.numberOfAttempts;
      this.wrongTriesBox.textContent = this.wrongTriesNum;
      this.timeBox.textContent = `00:00`;
    }

    // Method to clear the game board.
    clearGameBoard() {
      this.gameBody.innerHTML = "";
    }

    clearMatchedImgBoxes() {
      imageBoxes.forEach((imgBox) => {
        if (imgBox.classList.contains("has-match")) {
          imgBox.classList.remove("has-match");
        }
        if (imgBox.classList.contains("is-flipped")) {
          imgBox.classList.remove("is-flipped");
        }
      });
    }

    // Method to add click event listeners to image boxes.
    addClickListeners() {
      imageBoxes.forEach((imgBox) => {
        imgBox.addEventListener("click", () => {
          this.handleCardClick(imgBox);
        });
        this.gameBody.appendChild(imgBox);
      });
    }

    // This method is called when a card is clicked.
    handleCardClick(imgBox) {
      imgBox.classList.add("is-flipped"); // Flip the clicked card.

      let allFlippedBlocks = imageBoxes.filter((flippedBlock) =>
        flippedBlock.classList.contains("is-flipped")
      );

      // If Theres Two Selected Blocks
      if (allFlippedBlocks.length === 2) {
        // Stop Clicking Function
        this.stopClickingForDuration(this.flippingTime + 301);

        // Check Matched Block Function
        this.checkMatchedBlocks(allFlippedBlocks[0], allFlippedBlocks[1]);
      } else {
        // If it's the first card clicked and play a click sound.
        document.querySelector("#click-sound").play();
      }
    }

    // This method checks if two clicked cards match and handles the logic accordingly.
    checkMatchedBlocks(first, second) {
      let winSound = document.querySelector("#win-sound");
      let loseSound = document.querySelector("#lose-sound");

      if (
        first.getAttribute("data-technology") ===
        second.getAttribute("data-technology")
      ) {
        // If the data types of the two cards match, it's a successful match.
        winSound.play(); // Play a win sound.
        first.classList.remove("is-flipped"); // Remove the flipped state from the first card.
        second.classList.remove("is-flipped"); // Remove the flipped state from the second card.
        first.classList.add("has-match"); // Add a class to mark the first card as matched.
        second.classList.add("has-match"); // Add a class to mark the second card as matched.

        if (++this.numberOfCorrectChoose === this.imageBoxes.length / 2) {
          // If all pairs have been matched, the player wins.
          this.checkForWin();
        }
      } else {
        // If the data types don't match, it's not a successful match.
        this.wrongTriesBox.textContent = ++this.wrongTriesNum; // Increment and display the wrong tries count.

        setTimeout(() => {
          first.classList.remove("is-flipped"); // Remove the flipped state from the first card.
          second.classList.remove("is-flipped"); // Remove the flipped state from the second card.
        }, this.flippingTime + 300); // Wait for a short duration before unflipping the cards.
        loseSound.play(); // Play a lose sound.
      }
    }

    stopClickingForDuration(duration) {
      this.gameBody.classList.add("no-clicking");
      setTimeout(() => {
        this.gameBody.classList.remove("no-clicking");
      }, duration);
    }

    // Method to start the game with delayed card flipping.
    delayedStartGame() {
      this.delayedFlipAndUnflip(() => {
        this.startTime(this.time);
      });
    }

    // Method to perform delayed card flipping and unflipping.
    delayedFlipAndUnflip(callback) {
      const startingSound = document.querySelector("#starting-sound");
      const delayBetweenFlips = 120;
      const flipDuration = 3000;

      setTimeout(() => {
        let currentIndex = 0;

        const flipNextBox = () => {
          if (currentIndex < imageBoxes.length) {
            let currentBox = imageBoxes[currentIndex];
            setTimeout(() => {
              currentBox.classList.add("is-flipped");
              // startingSound.pause();
              startingSound.currentTime = 0;
              startingSound.play();
              currentIndex++;
              flipNextBox();
            }, delayBetweenFlips);
          } else {
            setTimeout(() => {
              imageBoxes.forEach((box) => {
                box.classList.remove("is-flipped");
              });
              if (typeof callback === "function") {
                callback();
              }
            }, flipDuration);
          }
        };

        flipNextBox();
      }, this.flippingTime + 300);
    }

    startTime(time) {
      let durations = time;
      let minutes, seconds;

      // Set up an interval to update the timer every 1000 milliseconds (1 second)
      this.timeIntervalMethod = setInterval(() => {
        minutes = parseInt(durations / 60);
        seconds = parseInt(durations % 60);

        // Ensure minutes and seconds are displayed with leading zeros if they are less than 10
        minutes = minutes < 10 ? `0${minutes}` : minutes;
        seconds = seconds < 10 ? `0${seconds}` : seconds;

        this.timeBox.textContent = `${minutes}:${seconds}`;

        // Check if time has reached zero (time's up)
        if (--durations < 0) {
          this.checkForWin(); // Call a function to check if the player has won
        }
      }, 1000); // The interval runs every 1000 milliseconds (1 second)
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
        stateDiv.innerHTML = `Congratulations <span>[ ${window.sessionStorage.getItem(
          "player-name"
        )} ]</span> You Won In The <span>[ ${window.sessionStorage.getItem(
          "attempts-number"
        )} ]</span> Round`;
      } else {
        // If the 'flag' parameter is false, the player has lost
        stateDiv.innerHTML = `GameOver <span>[ ${window.sessionStorage.getItem(
          "player-name"
        )} ]</span> You Lose In The <span>[ ${window.sessionStorage.getItem(
          "attempts-number"
        )} ]</span> Round`;
      }

      // Create a div for buttons
      let btnDiv = this.createDivWithClass("btnDiv");

      // Create a button to prompt the user to play new game
      let anotherAttemptBtn = this.createButtonWithClass(
        "Another Attempt",
        "another-attempt-btn"
      );

      // Add click event listeners to the replay and new play buttons
      anotherAttemptBtn.addEventListener("click", () => {
        mainPopup.remove();
        window.location.reload();
      });

      // Append the buttons to the button div
      btnDiv.appendChild(anotherAttemptBtn);

      // Append the message div and button div to the main popup
      mainPopup.appendChild(stateDiv);
      mainPopup.appendChild(btnDiv);

      // Append the main popup to the document body
      document.body.appendChild(mainPopup);
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
  let attemptsNumberBox = document.querySelector(".name .attempts-number");
  let wrongTriesBox = document.querySelector(
    ".wrong-tries .wrong-tries-number"
  );
  let time = 90;

  new MemoryCardGame(
    gameBody,
    imageBoxes,
    nameBox,
    attemptsNumberBox,
    timeBox,
    wrongTriesBox,
    time
  ).firstStart();
});
