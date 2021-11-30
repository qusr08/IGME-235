// Setup the app
"use strict";

const app = new PIXI.Application({
    width: Map.SCENE_WIDTH,
    height: Map.SCENE_HEIGHT,
    backgroundColor: 0x141414
});
document.body.appendChild(app.view);

let stage;
let gameScene;

let mousePosition = [];

// Load sprites and other assets
app.loader.add([
    "media/pieces.png"
]);
app.loader.onProgress.add(e => { console.log(`Loading Pixi.js Assets ... [${e.progress}%]`) });
app.loader.onComplete.add(setup);
app.loader.load();

// Change Pixi.js settings
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

function setup() {
    stage = app.stage;

    // Add interactions
    stage.interactive = true;
    stage.on("pointermove", (e) => {
        // Update mouse position variable
        let data = e.data.global;
        mousePosition = [data.x, data.y];
    });

    gameScene = new PIXI.Container();
    stage.addChild(gameScene);

    // Load sprites on spritesheets into variables
    console.log("Loading Sprites ...");
    Sprites.loadSprites();

    new Box(Map.LEVEL_SCREEN_WIDTH, 0, Map.SCENE_WIDTH - Map.LEVEL_SCREEN_WIDTH, Map.SCENE_HEIGHT, 0xFFFFFF, gameScene);

    // Generate a level
    Map.generateLevel(gameScene);

    // Add the game loop to repeat as the application is running
    app.ticker.add(game);
}

function game() {

}