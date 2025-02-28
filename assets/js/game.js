document.addEventListener("DOMContentLoaded", function () {
    let numbers = [];
    let playerChoice = 1;
    let leftIndex = 0, rightIndex = 0;
    let playerScores = { 1: 0, 2: 0 };
    let currentPlayer = 1;
    let waiting = false;
    let disabledIndices = [];

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

        for (let i = 0; i < n; i++) {
            dp[i][i] = numbers[i];
        }

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
        console.log("Game started as Player", player);
        numbers = generateNumbers();
        playerChoice = player;
        leftIndex = 0;
        rightIndex = numbers.length - 1;
        playerScores = { 1: 0, 2: 0 };
        currentPlayer = 1;
        waiting = false;
        disabledIndices = [];

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
        } else {
            let preferredParity = oddEvenStrategy(numbers);
            choice = (leftIndex % 2 === preferredParity) ? numbers[leftIndex] : numbers[rightIndex];
        }

        let moveIndex = (choice === numbers[leftIndex]) ? leftIndex : rightIndex;
        disabledIndices.push(moveIndex);

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

    function getRandomColor() {
        let colors = ["gold", "red", "blue", "green", "purple", "pink", "orange"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function addComputerMsg(msg) {
        let txt = "<div class=\"emsg cmsg\">" + msg + "</div>";
        console.log(txt);
        let e = document.getElementById("explainc");
        e.insertAdjacentHTML('beforeend', txt);
        e.lastElementChild.scrollIntoView();
    }
    
    function addPlayerMsg(msg) {
        let txt = "<div class=\"emsg ymsg\">" + msg + "</div>";
        console.log(txt);
        let e = document.getElementById("explainc");
        e.insertAdjacentHTML('beforeend', txt);
        e.lastElementChild.scrollIntoView();
    }
    
    function addInfoMsg(msg) {
        let txt = "<div class=\"einfo\">" + msg + "</div>";
        let e = document.getElementById("explainc");
        e.insertAdjacentHTML('beforeend', txt);
        e.lastElementChild.scrollIntoView();
    }
});
