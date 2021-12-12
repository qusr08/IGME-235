// Setup the app
"use strict";

const app = new PIXI.Application({
    width: Map.SCENE_WIDTH,
    height: Map.SCENE_HEIGHT,
    backgroundColor: 0x171717
});
document.getElementById("game").appendChild(app.view);

let stage;
let gameScene;
let menuScene;
let tutorialScene;

// Load sprites and other assets
app.loader.add([
    "media/pieces.png",
    "media/title.png",
    "media/gameover.png",
    "media/play.png",
    "media/tutorial.png",
    "media/back.png"
]);
app.loader.onProgress.add(e => { console.log(`Loading Pixi.js Assets ... [${e.progress}%]`) });
app.loader.onComplete.add(setup);
app.loader.load();

// Change Pixi.js settings
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

PIXI.Sprite.prototype.bringToFront = function () {
    // Get this sprites parent
    let parent = this.parent;

    // If the parent is not undefined, then remove and add the sprite back to the list of children
    // This will put this sprite at the end of the children list, meaning it gets drawn last (and therefore is drawn on top of everything else)
    if (parent != undefined) {
        parent.removeChild(this);
        parent.addChild(this);
    }
}

PIXI.Sprite.prototype.bringInFrontOf = function (other) {
    if (other == undefined) {
        return;
    }

    // Get this sprites parent and the parent of the sprite that you want to set it in front of
    let parent = this.parent;
    let otherParent = other.parent;

    // If both parents are not undefined, then we can adjust the draw order of the sprites
    if (parent != undefined && parent == otherParent) {
        // Get the index in the array of children
        let otherChildIndex = parent.getChildIndex(other);

        // Remove this sprite from its current parent and move it to the other sprites parent
        // Make sure to insert it at the right array value
        // Inserting the child at the one more than the index of the other sprite will put it after the other sprite, meaning it will be drawn in front of it
        if (otherChildIndex + 1 >= parent.children.length) {
            this.bringToFront();
        } else {
            parent.setChildIndex(this, otherChildIndex + 1);
        }
    }
}

// Colors
const BOARD_COLOR_1 = 0xADBD8F;
const BOARD_COLOR_2 = 0x6F8F72;
const HOVER_TINT = 0x666666;
const SELECT_TINT = 0xFF66FF;
const AVAIL_TINT = 0xFF6666;
const TEXT_COLOR = 0xEDEDED;

let TEXT_STYLE = new PIXI.TextStyle({
    fill: 0xEDEDED,
    fontSize: 18,
    fontFamily: "5Pixel",
    strokeThickness: 4
});

function setup() {
    stage = app.stage;

    // Add interactions
    stage.interactive = true;
    stage.on("pointermove", (e) => {
        // Update mouse position variable
        let data = e.data.global;
        GameManager.MOUSE_POSITION = [data.x, data.y];
    });

    gameScene = new PIXI.Container();
    menuScene = new PIXI.Container();
    tutorialScene = new PIXI.Container();
    stage.addChild(gameScene);
    stage.addChild(menuScene);
    stage.addChild(tutorialScene);

    GameManager.APPLICATION = app;
    GameManager.GAME_SCENE = gameScene;

    // Load sprites on spritesheets into variables
    console.log("Loading Sprites ...");
    Sprites.loadSprites();

    GameManager.appSetup();

    GameManager.setGameState(GameManager.GameState.GAME_SETUP);

    // Add the game loop to repeat as the application is running
    app.ticker.add(GameManager.update);
}