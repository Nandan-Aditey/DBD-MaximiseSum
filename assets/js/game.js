document.addEventListener("DOMContentLoaded", function () {
    let numbers = [];
    let playerChoice = 1;
    let leftIndex = 0, rightIndex = 0;
    let playerScores = { 1: 0, 2: 0 };
    let currentPlayer = 1;
    let waiting = false;
    let disabledIndices = []; // Tracks indices that have been clicked

    // Generates a shuffled array of numbers 1..14
    function generateNumbers() {
        let sequence = Array.from({ length: 14 }, (_, i) => i + 1);
        for (let i = sequence.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
        }
        return sequence;
    }

    // Compute the DP table where dp[i][j] is the maximum score the current player can secure
    function computeDPTable(numbers) {
        let n = numbers.length;
        let dp = Array.from({ length: n }, () => Array(n).fill(0));

        // Base case: only one number available
        for (let i = 0; i < n; i++) {
            dp[i][i] = numbers[i];
        }

        // Fill DP table for subarrays of length 2 to n
        for (let length = 2; length <= n; length++) {
            for (let i = 0; i <= n - length; i++) {
                let j = i + length - 1;
                let pickLeft = numbers[i] + Math.min(dp[i + 2]?.[j] ?? 0, dp[i + 1]?.[j - 1] ?? 0);
                let pickRight = numbers[j] + Math.min(dp[i + 1]?.[j - 1] ?? 0, dp[i]?.[j - 2] ?? 0);
                dp[i][j] = Math.max(pickLeft, pickRight);
            }
        }
        return dp;
    }

    // Determine strategy based on odd-even sums
    function oddEvenStrategy(numbers) {
        let oddSum = numbers.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
        let evenSum = numbers.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0);
        return oddSum > evenSum ? 0 : 1;
    }

    // Start a new game
    window.startGame = function (player) {
        console.log("Game started as Player", player);
        numbers = generateNumbers();
        playerChoice = player;
        leftIndex = 0;
        rightIndex = numbers.length - 1;
        playerScores = { 1: 0, 2: 0 };
        currentPlayer = 1;
        waiting = false;
        disabledIndices = []; // Reset disabled state

        // Reset UI elements
        document.getElementById("result").innerHTML = "";
        document.getElementById("box-container").innerHTML = "";
        document.getElementById("confetti-container").style.display = "none";
        document.querySelector("body").style.background = "#f4f4f4";
        document.querySelector(".buttons").style.display = "none";

        displayBoxes();

        // If computer is Player 2, make the first move after 1 second
        if (playerChoice === 2) {
            setTimeout(computerMove, 1000);
        }
    };

    // Attach event listeners for the buttons
    document.getElementById("player1").addEventListener("click", function () {
        startGame(1);
    });

    document.getElementById("player2").addEventListener("click", function () {
        startGame(2);
    });

    // Render the boxes based on the current state
    function displayBoxes() {
        let container = document.getElementById("box-container");
        container.innerHTML = "";

        numbers.forEach((num, index) => {
            let box = document.createElement("div");
            box.classList.add("box");
            box.textContent = num;
            
            // If this box has been disabled, add the class; otherwise, if it's at an end, allow clicking
            if (disabledIndices.includes(index)) {
                box.classList.add("disabled");
            } else if (index === leftIndex || index === rightIndex) {
                box.addEventListener("click", () => handlePlayerMove(index));
            }

            container.appendChild(box);
        });

        updateScoreDisplay();
    }

    // Handle player's click on a box
    function handlePlayerMove(index) {
        if (waiting || (index !== leftIndex && index !== rightIndex)) return;

        // Mark the clicked box as disabled
        disabledIndices.push(index);
        let selectedBox = document.querySelectorAll(".box")[index];
        selectedBox.classList.add("disabled");

        playerScores[currentPlayer] += numbers[index];

        // Update boundaries
        if (index === leftIndex) leftIndex++;
        else rightIndex--;

        displayBoxes();
        updateScoreDisplay();

        currentPlayer = 3 - currentPlayer;
        waiting = true;

        if (leftIndex <= rightIndex) {
            setTimeout(computerMove, 1000);
        } else {
            showFinalResult();
        }
    }

    // Computer's move: uses DP strategy if playerChoice===1, else uses odd-even strategy
    function computerMove() {
        let choice;
        let dp = computeDPTable(numbers);
        let explanation = "";

        if (playerChoice === 1) {
            if (leftIndex === rightIndex) {
                explanation = "Since there is only one number (" + numbers[leftIndex] + ") left, I must pick it.";
                choice = numbers[leftIndex];
            } else if (dp[leftIndex + 1][rightIndex] < dp[leftIndex][rightIndex - 1]) {
                explanation = "Picking the leftmost number leaves you with a maximum remaining score of " 
                    + dp[leftIndex + 1][rightIndex] + " while the rightmost one leaves you with " 
                    + dp[leftIndex][rightIndex - 1] + ". So, I pick the leftmost number (" + numbers[leftIndex] + ").";
                choice = numbers[leftIndex];
            } else if (dp[leftIndex + 1][rightIndex] > dp[leftIndex][rightIndex - 1]) {
                explanation = "Picking the leftmost number leaves you with a maximum remaining score of " 
                    + dp[leftIndex + 1][rightIndex] + " while the rightmost one leaves you with " 
                    + dp[leftIndex][rightIndex - 1] + ". So, I pick the rightmost number (" + numbers[rightIndex] + ").";
                choice = numbers[rightIndex];
            } else {
                explanation = "Picking either the leftmost or rightmost number leaves you with a maximum remaining score of " 
                    + dp[leftIndex + 1][rightIndex] + ". So, I pick the leftmost number (" + numbers[leftIndex] + ").";
                choice = numbers[leftIndex];
            }
            // Optionally display the explanation (ensure addComputerMsg is defined)
            addComputerMsg(explanation);
        } else {
            let preferredParity = oddEvenStrategy(numbers);
            choice = (leftIndex % 2 === preferredParity) ? numbers[leftIndex] : numbers[rightIndex];
        }

        let moveIndex = (choice === numbers[leftIndex]) ? leftIndex : rightIndex;
        disabledIndices.push(moveIndex); // Mark the computer's move as disabled

        let selectedBox = document.querySelectorAll(".box")[moveIndex];
        selectedBox.classList.add("disabled");

        playerScores[currentPlayer] += choice;

        if (moveIndex === leftIndex) leftIndex++;
        else rightIndex--;

        displayBoxes();
        updateScoreDisplay();

        currentPlayer = 3 - currentPlayer;
        waiting = false;

        if (leftIndex > rightIndex) {
            showFinalResult();
        }
    }

    // Update the displayed scores
    function updateScoreDisplay() {
        document.getElementById("result").innerHTML = `
            <h3>Scores</h3>
            <p>Player 1: ${playerScores[1]}</p>
            <p>Player 2: ${playerScores[2]}</p>
        `;
    }

    // Display the final result
    function showFinalResult() {
        let winnerText =
            playerScores[1] > playerScores[2] ? "Player 1 Wins!" :
            playerScores[2] > playerScores[1] ? "Player 2 Wins!" :
            "It's a Tie!";

        document.getElementById("box-container").innerHTML = "";
        document.getElementById("result").innerHTML = `
            <h2>Game Over</h2>
            <p>Player 1 Score: ${playerScores[1]}</p>
            <p>Player 2 Score: ${playerScores[2]}</p>
            <h2>${winnerText}</h2>
        `;

        if (playerScores[playerChoice] > playerScores[3 - playerChoice]) {
            showConfetti();
        } else {
            document.body.style.background = "#333";
            document.getElementById("result").style.color = "white";
        }
    }

    // Show confetti animation for celebration
    function showConfetti() {
        let confettiContainer = document.getElementById("confetti-container");
        confettiContainer.innerHTML = "";
        confettiContainer.style.display = "block";

        for (let i = 0; i < 100; i++) {
            let confetti = document.createElement("div");
            confetti.classList.add("confetti");
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.animationDuration = `${Math.random() * 2 + 1}s`;
            confetti.style.backgroundColor = getRandomColor();
            confettiContainer.appendChild(confetti);
        }

        setTimeout(() => {
            confettiContainer.style.display = "none";
        }, 3000);
    }

    // Return a random color from a set of choices
    function getRandomColor() {
        let colors = ["gold", "red", "blue", "green", "purple", "pink", "orange"];
        return colors[Math.floor(Math.random() * colors.length)];
    }
});
