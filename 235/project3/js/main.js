// Setup the app
"use strict";

const app = new PIXI.Application({
    width: Map.SCENE_WIDTH,
    height: Map.SCENE_HEIGHT,
    backgroundColor: 0x171717
});
document.body.appendChild(app.view);

let stage;
let gameScene;

let mousePosition = [];

let currMovingPiece = undefined;
let piecesToAnimate = [];

// Load sprites and other assets
app.loader.add([
    "media/pieces.png"
]);
app.loader.onProgress.add(e => { console.log(`Loading Pixi.js Assets ... [${e.progress}%]`) });
app.loader.onComplete.add(setup);
app.loader.load();

// Change Pixi.js settings
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

PIXI.Sprite.prototype.bringToFront = function() {
    if (this.parent) {
        var parent = this.parent;
        parent.removeChild(this);
        parent.addChild(this);
    }
}

// Colors
const BOARD_COLOR_1 = 0xADBD8F;
const BOARD_COLOR_2 = 0x6F8F72;
const HOVER_TINT = 0x666666;
const SELECT_TINT = 0xFFFF66;
const AVAIL_TINT = 0xFF6666;

function setup() {
    stage = app.stage;

    // Add interactions
    stage.interactive = true;
    stage.on("pointermove", (e) => {
        // Update mouse position variable
        let data = e.data.global;
        mousePosition = [data.x, data.y];
    });

    app.view.onclick = (e) => {}

    gameScene = new PIXI.Container();
    stage.addChild(gameScene);

    // Load sprites on spritesheets into variables
    console.log("Loading Sprites ...");
    Sprites.loadSprites();

    gameScene.addChild(new Panel(Map.LEVEL_SCREEN_WIDTH, 0, Map.SCENE_WIDTH - Map.LEVEL_SCREEN_WIDTH, Map.SCENE_HEIGHT, 0x444444));

    // Generate a level
    Map.generateLevel(gameScene);

    // Add the game loop to repeat as the application is running
    app.ticker.add(game);
}

function game() {
    if (currMovingPiece != undefined) {
        currMovingPiece.x = mousePosition[0];
        currMovingPiece.y = mousePosition[1];
    }
}