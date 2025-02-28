document.addEventListener("DOMContentLoaded", function () {
    let numbers = [];
    let playerChoice = 1;
    let leftIndex = 0, rightIndex = 0;
    let playerScores = { 1: 0, 2: 0 };
    let currentPlayer = 1;
    let waiting = false;

    function generateNumbers() {
        let sequence = Array.from({ length: 14 }, (_, i) => i + 1);
        for (let i = sequence.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
        }
        return sequence;
    }

    function computeDPTable(numbers) {
        let n = numbers.length;
        let dp = Array.from({ length: n }, () => Array(n).fill(0));

        for (let i = 0; i < n; i++) dp[i][i] = numbers[i];

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

    function oddEvenStrategy(numbers) {
        let oddSum = numbers.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
        let evenSum = numbers.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0);
        return oddSum > evenSum ? 0 : 1;
    }


    window.startGame = function (player) {

        console.log("Game started as Player", player);  // <-- Debugging Log

        numbers = generateNumbers();
        playerChoice = player;
        leftIndex = 0;
        rightIndex = numbers.length - 1;
        playerScores = { 1: 0, 2: 0 };
        currentPlayer = 1;
        waiting = false;

        document.getElementById("result").innerHTML = "";
        document.getElementById("box-container").innerHTML = "";
        document.getElementById("confetti-container").style.display = "none";
        document.querySelector("body").style.background = "#f4f4f4";
        document.querySelector(".buttons").style.display = "none";

        displayBoxes();

        if (playerChoice === 2) {
            setTimeout(computerMove, 1000);
        }
    };

    document.getElementById("player1").addEventListener("click", function () {
        startGame(1);
    });
    
    document.getElementById("player2").addEventListener("click", function () {
        startGame(2);
    });
    

    function displayBoxes() {
        let container = document.getElementById("box-container");
        container.innerHTML = "";

        numbers.forEach((num, index) => {
            let box = document.createElement("div");
            box.classList.add("box");
            box.textContent = num;

            if (index === leftIndex || index === rightIndex) {
                box.addEventListener("click", () => handlePlayerMove(index));
            }

            container.appendChild(box);
        });

        updateScoreDisplay();
    }

    function handlePlayerMove(index) {
        if (waiting || (index !== leftIndex && index !== rightIndex)) return;

        let selectedBox = document.querySelectorAll(".box")[index];
        selectedBox.classList.add("disabled");

        playerScores[currentPlayer] += numbers[index];

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

    function computerMove() {
        let choice;
        if (playerChoice === 1) {
            let dp = computeDPTable(numbers);
            let leftScore = dp[leftIndex + 1]?.[rightIndex] ?? 0;
            let rightScore = dp[leftIndex]?.[rightIndex - 1] ?? 0;
            choice = leftScore <= rightScore ? numbers[rightIndex] : numbers[leftIndex];
        } else {
            let preferredParity = oddEvenStrategy(numbers);
            choice = (leftIndex % 2 === preferredParity) ? numbers[leftIndex] : numbers[rightIndex];
        }

        let moveIndex = (choice === numbers[leftIndex]) ? leftIndex : rightIndex;
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

    function updateScoreDisplay() {
        document.getElementById("result").innerHTML = `
            <h3>Scores</h3>
            <p>Player 1: ${playerScores[1]}</p>
            <p>Player 2: ${playerScores[2]}</p>
        `;
    }

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

    function getRandomColor() {
        let colors = ["gold", "red", "blue", "green", "purple", "pink", "orange"];
        return colors[Math.floor(Math.random() * colors.length)];
    }
});
