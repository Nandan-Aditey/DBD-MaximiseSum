const boardLength = 14;

let numbers = [];
let playerChoice = 1;
let leftIndex = 0, rightIndex = boardLength - 1;
let playerScores = {1: 0, 2: 0};
let currentPlayer = 1;
let waiting = false;
let strategy = 0;

function startGame(player) {
    playerChoice = player;
    leftIndex = 0;
    rightIndex = boardLength - 1;
    playerScores = {1: 0, 2: 0};
    currentPlayer = 1;
    waiting = false;
    document.getElementById("result").innerHTML = "";
    document.getElementById("box-container").innerHTML = "";
    document.getElementById("confetti-container").style.display = "none";
    document.body.style.background = "#f4f4f4";
    document.querySelector('.buttons').style.display = 'none';

    // Generate random numbers for the game board
    numbers = generateRandomBoard(boardLength);
    strategy = determineStrategy(numbers);

    displayBoxes();
    addInfoMsg("The game has started.");

    if (playerChoice === 2) {
        waiting = true;
        setTimeout(computerMove, 1000);
    }
}

function generateRandomBoard(length) {
    let nums = [];
    for (let i = 0; i < length; i++) {
        nums.push(Math.floor(Math.random() * 20) + 1);
    }
    return nums;
}

function determineStrategy(nums) {
    let os = 0, es = 0;
    for (let i = 0; i < nums.length; i++) {
        if ((i + 1) % 2 === 0) es += nums[i];
        else os += nums[i];
    }
    return os > es ? "odd" : "even";
}

function displayBoxes() {
    let container = document.getElementById('box-container');
    container.innerHTML = '';

    numbers.forEach((num, index) => {
        let box = document.createElement('div');
        box.classList.add('box');
        box.innerHTML = num + `<div class="index">${index + 1}</div>`;
        box.dataset.index = index;

        if (index === leftIndex || index === rightIndex) {
            box.addEventListener('click', () => handlePlayerMove(index));
        }

        container.appendChild(box);
    });

    updateScoreDisplay();
}

function handlePlayerMove(index) {
    if (waiting || (index !== leftIndex && index !== rightIndex)) return;

    let selectedBox = document.querySelector(`.box[data-index='${index}']`);
    selectedBox.classList.add('disabled');

    playerScores[currentPlayer] += numbers[index];

    if (index === leftIndex) leftIndex++;
    else rightIndex--;

    updateClickableBoxes();
    updateScoreDisplay();
    addPlayerMsg(`I pick ${numbers[index]}.`);

    currentPlayer = 3 - currentPlayer;
    waiting = true;

    if (leftIndex <= rightIndex) {
        setTimeout(computerMove, 1000);
    } else {
        showFinalResult();
    }
}

function computerMove() {
    let choice = (strategy === "odd") ? pickBestMove(true) : pickBestMove(false);
    let moveIndex = numbers.indexOf(choice);

    let selectedBox = document.querySelector(`.box[data-index='${moveIndex}']`);
    selectedBox.classList.add('disabled');

    playerScores[currentPlayer] += choice;

    if (moveIndex === leftIndex) leftIndex++;
    else rightIndex--;

    updateClickableBoxes();
    updateScoreDisplay();
    addComputerMsg(`I pick ${choice}.`);

    currentPlayer = 3 - currentPlayer;
    waiting = false;

    if (leftIndex > rightIndex) {
        showFinalResult();
    }
}

function pickBestMove(oddPreferred) {
    let leftValue = numbers[leftIndex];
    let rightValue = numbers[rightIndex];

    if (oddPreferred) {
        return (leftIndex % 2 === 1) ? leftValue : rightValue;
    } else {
        return (leftIndex % 2 === 0) ? leftValue : rightValue;
    }
}

function updateScoreDisplay() {
    document.getElementById('result').innerHTML = `
        <h3>Scores</h3>
        <p>Player 1: ${playerScores[1]}</p>
        <p>Player 2: ${playerScores[2]}</p>
    `;
}

function showFinalResult() {
    let winnerText = playerScores[1] > playerScores[2] ? "Player 1 Wins!" :
                    playerScores[2] > playerScores[1] ? "Player 2 Wins!" :
                    "It's a Tie!";

    addInfoMsg("The game is over. " + winnerText + "<br><br>");
    document.getElementById('box-container').innerHTML = "";
    document.getElementById('result').innerHTML = `
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
        document.getElementById("title").style.color = "white";
    }
}

function addComputerMsg(msg) {
    let txt = `<div class="emsg cmsg">${msg}</div>`;
    let e = document.getElementById("explainc");
    e.insertAdjacentHTML('beforeend', txt);
    e.lastElementChild.scrollIntoView();
}

function addPlayerMsg(msg) {
    let txt = `<div class="emsg ymsg">${msg}</div>`;
    let e = document.getElementById("explainc");
    e.insertAdjacentHTML('beforeend', txt);
    e.lastElementChild.scrollIntoView();
}

function addInfoMsg(msg) {
    let txt = `<div class="einfo">${msg}</div>`;
    let e = document.getElementById("explainc");
    e.insertAdjacentHTML('beforeend', txt);
    e.lastElementChild.scrollIntoView();
}

function toggleExplanation() {
    let x = document.getElementById("explain");
    let y = document.getElementById("eshowbtn");
    x.style.display = (x.style.display === "none" || x.style.display === "") ? "flex" : "none";
    y.style.display = (y.style.display === "none") ? "block" : "none";
}
