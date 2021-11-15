// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application({
    width: 600,
    height: 600
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// pre-load the images
app.loader.
add([
    "images/spaceship.png",
    "images/explosions.png"
]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// aliases
let stage;

// game variables
let startScene;
let gameScene, ship, scoreLabel, lifeLabel, gameOverScoreLabel, shootSound, hitSound, fireballSound;
let gameOverScene;

let circles = [];
let bullets = [];
let aliens = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;

function setup() {
    stage = app.stage;
    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();

    // #5 - Create ship
    ship = new Ship();
    gameScene.addChild(ship);

    // #6 - Load Sounds
    shootSound = new Howl({
        src: ['sounds/shoot.wav']
    });

    hitSound = new Howl({
        src: ['sounds/hit.mp3']
    });

    fireballSound = new Howl({
        src: ['sounds/fireball.mp3']
    });

    // #7 - Load sprite sheet
    explosionTextures = loadSpriteSheet();

    // #8 - Start update loop
    app.ticker.add(gameLoop);

    // #9 - Start listening for click events on the canvas
    app.view.onclick = fireBullet;

    // Now our `startScene` is visible
    // Clicking the button calls startGame()
}

function gameLoop() {
    if (paused) {
        return;
    }

    // #1 - Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) {
        dt = 1 / 12;
    }

    // #2 - Move Ship
    let mousePosition = app.renderer.plugins.interaction.mouse.global;
    let amt = 6 * dt;

    // Lerp the position values to have the ship smoothly move
    let newX = lerp(ship.x, mousePosition.x, amt);
    let newY = lerp(ship.y, mousePosition.y, amt);

    // Keep the ship on the screen
    let w2 = ship.width / 2;
    let h2 = ship.height / 2;
    ship.x = clamp(newX, w2, sceneWidth - w2);
    ship.y = clamp(newY, h2, sceneHeight - h2);

    // #3 - Move Circles
    for (let c of circles) {
        if (c.x <= c.radius || c.x >= sceneWidth - c.radius) {
            c.reflectX();
        }
        if (c.y <= c.radius || c.y >= sceneHeight - c.radius) {
            c.reflectY();
        }

        c.move(dt);
    }

    // #4 - Move Bullets
    for (let b of bullets) {
        b.move(dt);
    }

    // #5 - Check for Collisions
    for (let c of circles) {
        for (let b of bullets) {
            if (rectsIntersect(c, b)) {
                fireballSound.play();
                createExplosion(c.x, c.y, 64, 64);
                gameScene.removeChild(c);
                c.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
            }

            if (b.y < -10) {
                b.isAlive = false;
            }
        }

        if (c.isAlive && rectsIntersect(c, ship)) {
            hitSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            decreaseLifeBy(20);
        }
    }

    // #6 - Now do some clean up
    bullets = bullets.filter(b => b.isAlive);
    circles = circles.filter(c => c.isAlive);
    explosions = explosions.filter(e => e.playing);

    // #7 - Is game over?
    if (life <= 0) {
        end();

        return;
    }

    // #8 - Load next level
    if (circles.length == 0) {
        levelNum++;
        loadLevel();
    }
}

function createLabelsAndButtons() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        FontFamily: "Futura"
    });

    //#region  Start Scene

    //Make top start label
    let startLabel1 = new PIXI.Text("Circle Blast!");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel1.x = 50;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    // Make the middle start label
    let startLabel2 = new PIXI.Text("Are you worthy?");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Futura",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel2.x = 185;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    // Make start game button
    let startButton = new PIXI.Text("Enter, if you dare!");
    startButton.style = buttonStyle;
    startButton.x = 100;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on("pointerover", e => e.target.alpha = 0.7);
    startButton.on("pointerout", e => e.currentTarget.alpha = 1);
    startScene.addChild(startButton);

    //#endregion

    //#region Game Scene

    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    // Make score label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    // Make life label
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 25;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    //#endregion

    //#region Game Over Scene

    // Make game over text
    let gameOverText = new PIXI.Text("Game Over! :(");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 100;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    // Make final score label
    gameOverScoreLabel = new PIXI.Text(`Final score: ${score}`);
    gameOverScoreLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 40,
        fontFamily: "Futura",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverScoreLabel.x = 165;
    gameOverScoreLabel.y = 300;
    gameOverScene.addChild(gameOverScoreLabel);

    // Make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 165;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame);
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7);
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(playAgainButton);

    //#endregion
}

function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;

    levelNum = 1;
    score = 0;
    life = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    ship.x = 300;
    ship.y = 550;
    loadLevel();
}

function increaseScoreBy(value) {
    score += value;
    scoreLabel.text = `Score: ${score}`;
}

function decreaseLifeBy(value) {
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Life: ${life}%`;
}

function createCircles(numCircles) {
    for (let i = 0; i < numCircles; i++) {
        let c = new Circle(10, 0xFFFF00);
        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = Math.random() * (sceneHeight - 400) + 25;
        circles.push(c);
        gameScene.addChild(c);
    }
}

function loadLevel() {
    createCircles(levelNum * 5);
    paused = false;
}

function end() {
    paused = true;

    // Clear out level
    circles.forEach(c => gameScene.removeChild(c));
    circles = [];
    bullets.forEach(b => gameScene.removeChild(b));
    bullets = [];
    explosions.forEach(e => gameScene.removeChild(e));
    explosions = [];

    gameOverScene.visible = true;
    gameScene.visible = false;

    gameOverScoreLabel.text = `Final score: ${score}`;
}

function fireBullet(e) {
    if (paused) {
        return;
    }

    let amount = (levelNum > 1) ? 3 : 1;
    let spacing = 8;

    for (let i = parseInt(-amount / 2); i <= parseInt(amount / 2); i++) {
        let b = new Bullet(0xFFFFFF, ship.x + (i * spacing), ship.y);
        bullets.push(b);
        gameScene.addChild(b);
    }
    shootSound.play();
}

function loadSpriteSheet() {
    let spriteSheet = PIXI.BaseTexture.from("images/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];

    for (let i = 0; i < numFrames; i++) {
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i * width, 64, width, height));
        textures.push(frame);
    }

    return textures;
}

function createExplosion(x, y, frameWidth, frameHeight) {
    let w2 = frameWidth / 2;
    let h2 = frameHeight / 2;
    let expl = new PIXI.AnimatedSprite(explosionTextures);

    expl.x = x - w2;
    expl.y = y - w2;
    expl.animationSpeed = 1 / 7;
    expl.loop = false;
    expl.onComplete = e => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);

    expl.play();
}