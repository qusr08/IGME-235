// Setup the app
"use strict";

const app = new PIXI.Application({
    width: 1280,
    height: 720,
    backgroundColor: 0x141414
});
document.body.appendChild(app.view);

let gameScene;

// Load sprites and other assets
app.loader.add([
    "media/pieces.png"
]);
app.loader.onProgress.add(e => { console.log(`Loading Pixi.js Assets ... [${e.progress}%]`) });
app.loader.onComplete.add(setup);
app.loader.load();

// Change Pixi.js settings
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const SCENE_WIDTH = app.view.width;
const SCENE_HEIGHT = app.view.height;

function setup() {
    gameScene = new PIXI.Container();
    app.stage.addChild(gameScene);

    // Load sprites on spritesheets into variables
    console.log("Loading Sprites ...");
    Sprites.loadSprites();

    Map.generateLevel(gameScene);

    // app.view.onclick = Map.generateLevel;

    gameScene.addChild(new ChessPiece(100, 100));
}

function game() {}