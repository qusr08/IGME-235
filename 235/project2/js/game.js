let menuDiv;
let menuDifficulty;
let menuCategory;
let menuHighscore;

let categoryId;
let correctAnswerIndex;
let selectedAnswerIndex;

let gameDiv;
let gameTime;
let gameScore;
let gameQuestionNumber;
let gameQuestion;
let gameAnswerButtons;

window.onload = () => {
    // Get all html elements
    gameDiv = document.getElementById("game");
    menuDiv = document.getElementById("menu");

    menuDifficulty = document.getElementById("difficulty");
    menuCategory = document.getElementById("category");
    menuHighscore = document.getElementById("highscore");

    gameTime = document.getElementById("time");
    gameScore = document.getElementById("score");
    gameQuestionNumber = document.getElementById("question-number");
    gameQuestion = document.getElementById("question");
    gameAnswerButtons = document.getElementById("answers").children;

    // Set defaults when the page loads
    setDifficulty("medium");
    setCategory("general knowledge");
    setHighscore(0);
    setGameState("menu");
}

function setCategory(category) {
    let xhr = new XMLHttpRequest();

    xhr.onload = (e) => {
        // Parse all of the JSON data into an object
        let xhr = e.target;
        let obj = JSON.parse(xhr.responseText).trivia_categories;

        // Look up the category id based on the input category name
        for (let i = 0; i < obj.length; i++) {
            if (obj[i].name.toLowerCase() == category.toLowerCase()) {
                categoryId = obj[i].id;
                break;
            }
        }

        menuCategory.innerHTML = `Category: ${category.capitalize()}`;
    };

    xhr.open("GET", `https://opentdb.com/api_category.php`);
    xhr.send();
}

function getCategoryName() {
    return menuCategory.innerHTML.split(" ")[1].toLowerCase();
}

function setDifficulty(difficulty) {
    menuDifficulty.innerHTML = `Difficulty: ${difficulty.capitalize()}`;
}

function getDifficulty() {
    return menuDifficulty.innerHTML.split(" ")[1].toLowerCase();
}

function setScore(score) {
    gameScore.innerHTML = `Score: ${score.toFixed(0)}`;
}

function getScore() {
    return Number(gameScore.innerHTML.split(" ")[1]);
}

function setTime(time) {
    gameTime.innerHTML = `Time Remaining: ${time.toFixed(1)} s`;
}

function getTime() {
    return Number(gameTime.innerHTML.split(" ")[2]);
}

function setHighscore(highscore) {
    menuHighscore.innerHTML = `Highscore: ${highscore.toFixed(0)}`;

    // do something with localStorage idfk
}

function getHighscore() {
    return Number(menuHighscore.innerHTML.split(" ")[1]);
}

function setQuestionNumber(number) {
    gameQuestionNumber.innerHTML = `Question #${number.toFixed(0)}`;
}

function getQuestionNumber() {
    return Number(gameQuestionNumber.innerHTML.split("#")[1]);
}

function setQuestion(question) {
    gameQuestion.innerHTML = question;
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
        let difficultyModifier = (getDifficulty() == "easy") ? 1 : ((getDifficulty() == "medium") ? 2 : 3);
        correctAnswerIndex = -1;
        selectedAnswerIndex = -1;

        let gameLoop = window.setInterval(() => {
            // If the correct answer index is -1, then a question has not been selected
            // To fix this, get another question from the api and update the html elements
            if (correctAnswerIndex == -1) {
                getQuestion();

                startTime = getTime();
            } else {
                // If the selected answer is not equal to -1, then the player has selected an answer choice to the question
                if (selectedAnswerIndex != -1) {
                    // Check to see if the answer choice that the player selected is the same as the correct one
                    let isCorrect = (selectedAnswerIndex == correctAnswerIndex);

                    // If the player is correct, then add points and time
                    // If the player is wrong, then remove time
                    if (isCorrect) {
                        // I want the player to get more points the faster they answer a question, so I mapped the time it takes the player to answer to a function
                        // Score function is AMe^(-x), where M is the difficulty modifier, A is some value to make the score bigger, and x is the time since the question appeared
                        setScore(getScore() + (50 * difficultyModifier * Math.exp(getTime() - startTime)));
                        setTime(getTime() + 5);
                    } else {
                        setTime(getTime() - 5);
                    }

                    // Reset the selected answer choices, which will prompt a new question to appear
                    correctAnswerIndex = -1;
                    selectedAnswerIndex = -1;
                }
            }

            // Keep subtracting time from the clock
            setTime(getTime() - 0.1);

            // If the time reaches 0, the player loses
            if (getTime() <= 0) {
                // If the player got a new highscore, then set the highscore on the menu page equal to that
                if (getScore() > getHighscore()) {
                    setHighscore(getScore());
                }

                setGameState("menu");
                window.clearInterval(gameLoop);
            }
        }, 100);
    }
}

function getQuestion() {
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
        setQuestionNumber(getQuestionNumber() + 1);
        for (let i = 0; i < answerChoices.length; i++) {
            gameAnswerButtons[i].innerHTML = answerChoices[i];
        }
    };

    xhr.open("GET", `https://opentdb.com/api.php?amount=1&category=${categoryId}&difficulty=${getDifficulty()}&type=multiple`);
    xhr.send();
}

function selectAnswer(index) {
    selectedAnswerIndex = index;
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
})