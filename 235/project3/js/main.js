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

let mousePosition = [];

let currMovingPiece = undefined;
let piecesToAnimate = [];
let enemyMoveTurns = [];
let party = [];
let win = false;
let lose = false;

// Flags
let createdLevel = false;
let isPlayersTurn = false;

// Load sprites and other assets
app.loader.add([
    "media/pieces.png"
]);
app.loader.onProgress.add(e => { console.log(`Loading Pixi.js Assets ... [${e.progress}%]`) });
app.loader.onComplete.add(setup);
app.loader.load();

// Change Pixi.js settings
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

PIXI.Sprite.prototype.bringToFront = function () {
    if (this.parent) {
        let parent = this.parent;
        parent.removeChild(this);
        parent.addChild(this);
    }
}

// Colors
const BOARD_COLOR_1 = 0xADBD8F;
const BOARD_COLOR_2 = 0x6F8F72;
const HOVER_TINT = 0x666666;
const SELECT_TINT = 0xFF66FF;
const AVAIL_TINT = 0xFF6666;
const TEXT_COLOR = 0xEDEDED;

function setup() {
    stage = app.stage;

    // Add interactions
    stage.interactive = true;
    stage.on("pointermove", (e) => {
        // Update mouse position variable
        let data = e.data.global;
        mousePosition = [data.x, data.y];

        // Update current moving piece position to follow mouse
        if (currMovingPiece != undefined) {
            currMovingPiece.x = mousePosition[0];
            currMovingPiece.y = mousePosition[1];
        }
    });

    app.view.onclick = (e) => {

    }

    gameScene = new PIXI.Container();
    stage.addChild(gameScene);

    // Load sprites on spritesheets into variables
    console.log("Loading Sprites ...");
    Sprites.loadSprites();

    party.push(new ChessPiece(ChessPiece.PieceType.QUEEN, ChessPiece.PieceColor.WHITE, [-1, -1], gameScene));
    // gameScene.addChild(new Panel(Map.LEVEL_SCREEN_WIDTH, 0, Map.SCENE_WIDTH - Map.LEVEL_SCREEN_WIDTH, Map.SCENE_HEIGHT, 0x444444));

    // Add the game loop to repeat as the application is running
    app.ticker.add(levelStart);
}

function levelStart() {
    // Generate a level
    if (!createdLevel) {
        Map.generateLevel(gameScene);

        createdLevel = true;
    }

    if (party.length == 0) {
        app.ticker.remove(levelStart);
        app.ticker.add(game);

        isPlayersTurn = true;

        console.log("!!! Player's Turn!");
    } else {
        if (currMovingPiece == undefined) {
            currMovingPiece = party[0];
            currMovingPiece.bringToFront();
        }
    }
}

function game() {
    // for (let i = piecesToAnimate.length - 1; i >= 0; i--) {
    //     // This animate method returns true when the piece is still animating and false when it finishes
    //     // So, when this piece is finished animating, remove it from the list
    //     if (!piecesToAnimate[i].animate()) {
    //         piecesToAnimate.splice(i, 1);
    //     }
    // }

    if (!isPlayersTurn) {
        let pieceToMove = Map.BLACK_PIECES[Math.floor(randRange(0, Map.BLACK_PIECES.length))];
        if (pieceToMove != undefined) {
            console.log("!!! Enemy's Turn!");

            let pieceToTilePos = pieceToMove.availableTiles[Math.floor(randRange(0, pieceToMove.availableTiles.length))].tilePos;

            pieceToMove.moveToTile(pieceToTilePos);

            isPlayersTurn = true;

            console.log("!!! Player's Turn!");
        }
    }
}