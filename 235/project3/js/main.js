// Setup the app
"use strict";

const app = new PIXI.Application({
    width: GameManager.SCENE_WIDTH,
    height: GameManager.SCENE_HEIGHT,
    backgroundColor: 0x171717
});
document.getElementById("game").appendChild(app.view);

// Load sprites and other assets
app.loader.add([
    "media/pieces.png",
    "media/title.png",
    "media/gameover.png",
    "media/play-button-insane.png",
    "media/play-button-classic.png",
    "media/credits-button.png",
    "media/tutorial-button.png",
    "media/back-button.png",
    "media/next-button.png",
    "media/previous-button.png",
    "media/tutorial-background-1.png",
    "media/tutorial-background-2.png",
    "media/credits-background.png",
    "media/game-background.png"
]);
app.loader.onProgress.add(e => { console.log(`Loading Pixi.js Assets ... [${e.progress}%]`) });
app.loader.onComplete.add(setup);
app.loader.load();

// Change Pixi.js settings
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

PIXI.Sprite.prototype.bringToFront = function() {
    // Get this sprites parent
    let parent = this.parent;

    // If the parent is not undefined, then remove and add the sprite back to the list of children
    // This will put this sprite at the end of the children list, meaning it gets drawn last (and therefore is drawn on top of everything else)
    if (parent != undefined) {
        parent.removeChild(this);
        parent.addChild(this);
    }
}

PIXI.Sprite.prototype.bringInFrontOf = function(other) {
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
const HOVER_TINT = 0x666666;
const SELECT_TINT = 0xFF66FF;
const AVAIL_TINT = 0xFF6666;

let TEXT_STYLE = new PIXI.TextStyle({
    fill: 0xEDEDED,
    fontSize: 18,
    fontFamily: "5Pixel"
});

function setup() {
    GameManager.APPLICATION = app;

    GameManager.appSetup();

    GameManager.setGameState(GameManager.GameState.MENU);

    // Add the game loop to repeat as the application is running
    app.ticker.add(GameManager.update);
}