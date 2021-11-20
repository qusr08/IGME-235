/*jshint esversion: 6 */

let gameDiv;
let gameTime;
let gameScore;
let gameQuestionNumber;
let gameQuestion;
let gameAnswerButtons;

let menuDiv;

let menuHighscore;

let menuCategory;
let menuCategoryButtons;
let menuCategoryButtonsList = [];

let menuDifficulty;
let menuDifficultyButtons;
let menuDifficultyButtonsList = [];

let categoryDict = [];

let selectedCategoryList = [];
let selectedDifficulty;
let correctAnswerIndex;
let selectedAnswerIndex;

let score;
let time;
let highscore;
let questionNumber;

window.onload = () => {
    // Get all html elements
    gameDiv = document.getElementById("game");
    menuDiv = document.getElementById("menu");

    menuDifficulty = document.getElementById("difficulty");
    menuDifficultyButtons = document.getElementById("difficulty-buttons");
    menuCategory = document.getElementById("category");
    menuCategoryButtons = document.getElementById("category-buttons");
    menuHighscore = document.getElementById("highscore");

    gameTime = document.getElementById("time");
    gameScore = document.getElementById("score");
    gameQuestionNumber = document.getElementById("question-number");
    gameQuestion = document.getElementById("question");
    gameAnswerButtons = document.getElementById("answers").children;

    // Load categories from the api
    loadContent();
};

function loadContent() {
    let xhr = new XMLHttpRequest();

    xhr.onload = (e) => {
        // Parse all of the JSON data into an object
        let xhr = e.target;
        let obj = JSON.parse(xhr.responseText).trivia_categories;

        // Loop through each category and save the id of it to a dictionary
        for (let i = 0; i < obj.length; i++) {
            let name = obj[i].name.toLowerCase().replace("entertainment: ", "").replace("science: ", "");
            let id = obj[i].id;
            categoryDict.push({ name: name, id: id });

            // Create html element for the category buttons
            let categoryButton = document.createElement("a");
            categoryButton.classList.add("button");
            categoryButton.href = `javascript:toggleCategory(${i})`;
            categoryButton.innerHTML = name.capitalize();

            // Add it to the list of category buttons
            menuCategoryButtons.appendChild(categoryButton);
            menuCategoryButtonsList.push(categoryButton);
        }

        // Add difficulty buttons to a list
        for (let i = 0; i < menuDifficultyButtons.children.length; i++) {
            menuDifficultyButtonsList.push(menuDifficultyButtons.children[i]);
        }

        setup();
    };

    xhr.open("GET", `https://opentdb.com/api_category.php`);
    xhr.send();
}

function setup() {
    // Set defaults when the page loads
    setDifficulty(1);
    toggleCategory(0);
    setGameState("menu");

    // Load the highscore from localStorage (if it exists)
    let localHighscore = Number(localStorage.getItem("highscore"));
    if (localHighscore != null) {
        setHighscore(localHighscore);
    } else {
        setHighscore(0);
    }
}

// Toggle whether or not a category can appear in the game
function toggleCategory(categoryIndex) {
    // Get the index in the currently active category arrays 
    let index = selectedCategoryList.indexOf(Number(categoryIndex));
    categoryIndex = Number(categoryIndex);

    // If the index is -1, then add it to the list
    // If the index is not -1, then remove it from the list
    // This makes it so each of the categories are toggled
    if (index != -1) {
        // Make sure at least 1 category is selected at all times
        if (selectedCategoryList.length > 1) {
            selectedCategoryList.splice(index, 1);
            menuCategoryButtonsList[categoryIndex].classList.remove("selected-button");
        }
    } else {
        selectedCategoryList.push(categoryIndex);
        menuCategoryButtonsList[categoryIndex].classList.add("selected-button");
    }

    menuCategory.innerHTML = `Category <em>[${selectedCategoryList.length} selected]</em>`;
}

function setGameState(gamestate) {
    // Set divs based on what the current gamestate is
    // By default it is the menu state
    gameDiv.style.display = gamestate == "game" ? "" : "none";
    menuDiv.style.display = gamestate == "menu" ? "" : "none";

    if (gamestate == "game") {
        // Reset game variables
        setScore(0);
        setTime(60);
        setQuestionNumber(0);

        let startTime = time;
        let difficultyModifier = selectedDifficulty;
        let answerTime = 0;
        correctAnswerIndex = -1;
        selectedAnswerIndex = -1;

        let gameLoop = window.setInterval(() => {
            // If the correct answer index is -1, then a question has not been selected
            // To fix this, get another question from the api and update the html elements
            if (correctAnswerIndex == -1) {
                getQuestion();
                startTime = time;
            } else {
                // If the selected answer is not equal to -1, then the player has selected an answer choice to the question
                if (answerTime == 0 && selectedAnswerIndex != -1) {
                    // Check to see if the answer choice that the player selected is the same as the correct one
                    let isCorrect = (selectedAnswerIndex == correctAnswerIndex);

                    // If the player is correct, then add points and time
                    // If the player is wrong, then remove time
                    if (isCorrect) {
                        // I want the player to get more points the faster they answer a question, so I mapped the time it takes the player to answer to a function
                        let timeBonus = (1 - ((time - startTime) / 20)) * 50;
                        if (timeBonus < 0) {
                            timeBonus = 0;
                        }

                        addScore((timeBonus + 50) * difficultyModifier);
                        addTime(5 * (3 - difficultyModifier));
                    } else {
                        addTime(-5 * (difficultyModifier + 1));
                    }

                    setQuestion(isCorrect ? "Correct! :)" : "Incorrect! :(");
                    answerTime = time;
                }

                if (answerTime != 0 && answerTime - time > 0.5) {
                    // Reset the selected answer choices, which will prompt a new question to appear
                    correctAnswerIndex = -1;
                    selectedAnswerIndex = -1;
                    answerTime = 0;
                }
            }

            // Keep subtracting time from the clock
            addTime(-0.1);

            // If the time reaches 0, the player loses
            if (time <= 0) {
                // If the player got a new highscore, then set the highscore on the menu page equal to that
                if (score > highscore) {
                    setHighscore(score);
                }

                setGameState("menu");
                window.clearInterval(gameLoop);
            }
        }, 100);
    }
}

function getQuestion() {
    correctAnswerIndex = -2;

    let xhr = new XMLHttpRequest();

    xhr.onload = (e) => {
        // Parse all of the JSON data into an object
        let xhr = e.target;
        let obj = JSON.parse(xhr.responseText).results[0];

        // Get the answer choices in a random order
        let answerChoices = [];
        answerChoices.push(obj.correct_answer);
        for (let i = 0; i < obj.incorrect_answers.length; i++) {
            answerChoices.push(obj.incorrect_answers[i]);
        }
        answerChoices.shuffle();

        // Get the index of the correct answer choice
        correctAnswerIndex = answerChoices.indexOf(obj.correct_answer);

        // Set the question and answer html elements
        setQuestion(obj.question);
        setQuestionNumber(questionNumber + 1);
        for (let i = 0; i < answerChoices.length; i++) {
            gameAnswerButtons[i].innerHTML = answerChoices[i];
        }
    };

    let randomCategory = selectedCategoryList[Math.floor(Math.random() * selectedCategoryList.length)];
    let categoryId = categoryDict[randomCategory].id;

    xhr.open("GET", `https://opentdb.com/api.php?amount=1&category=${categoryId}&difficulty=${getDifficultyName()}&type=multiple`);
    xhr.send();
}

function selectAnswer(index) {
    selectedAnswerIndex = index;
}

function setDifficulty(difficulty) {
    if (menuCategoryButtonsList[selectedDifficulty] != undefined) {
        menuDifficultyButtonsList[selectedDifficulty].classList.remove("selected-button");
    }

    selectedDifficulty = Number(difficulty);
    menuDifficultyButtonsList[selectedDifficulty].classList.add("selected-button");

    menuDifficulty.innerHTML = `Difficulty <em>[x${difficulty + 1} score]</em>`;
}

function getDifficultyName() {
    switch (selectedDifficulty) {
        case 0:
            return "easy";
        case 1:
            return "medium";
        case 2:
            return "hard";
        default:
            return "";
    }
}

function setScore(value) {
    score = value;
    gameScore.innerHTML = `Score: ${value.toFixed(0)}`;
}

function addScore(value) {
    setScore(score + value);
}

function setTime(value) {
    time = value;
    gameTime.innerHTML = `Time Remaining: ${value.toFixed(1)} s`;
}

function addTime(value) {
    setTime(time + value);
}

function setHighscore(value) {
    highscore = value;
    menuHighscore.innerHTML = `Highscore: ${value.toFixed(0)}`;

    // Save the value to localStorage
    localStorage.setItem("highscore", highscore);
}

function setQuestionNumber(number) {
    questionNumber = number;
    gameQuestionNumber.innerHTML = `Question #${number.toFixed(0)}`;
}

function setQuestion(question) {
    gameQuestion.innerHTML = question;
}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
        let words = this.split(" ");
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }

        return words.join(" ");
    },
    enumerable: false
});

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
Object.defineProperty(Array.prototype, 'shuffle', {
    value: function() {
        let currentIndex = this.length,
            randomIndex;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [this[currentIndex], this[randomIndex]] = [
                this[randomIndex], this[currentIndex]
            ];
        }
    },
    enumerable: false
});