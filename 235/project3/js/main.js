// Setup the app
"use strict";

const app = new PIXI.Application({
    width: 1280,
    height: 720
});
document.body.appendChild(app.view);

//#region Constants

const SCENE_WIDTH = app.view.width;
const SCENE_HEIGHT = app.view.height;

const TILE_SIZE = 64; // The pixel size of each tile
const GEN_LEVEL_WIDTH = 17; // The level width in tiles
const GEN_LEVEL_HEIGHT = 9; // The level height in tiles
const GEN_LEVEL_ITER = parseInt(64 / 1.5); // The minimum number of tiles for each level

// Variables for the 4 cardinal directions (just to make checking directions more legible)
const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;

//#endregion

let stage;
let gameScene;

let levelTiles = [];

// Load app
app.loader.add([]);
app.loader.onProgress.add(e => { console.log(`Loading : ${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

function setup() {
    stage = app.stage;
    gameScene = new PIXI.Container();
    stage.addChild(gameScene);

    generateLevel();

    app.view.onclick = generateLevel;
}

function game() {}

function generateLevel() {
    //#region Generate Level Positions

    // Clear the previous level positions
    levelTiles.forEach(e => gameScene.removeChild(e));
    levelTiles = [];

    let levelPositions = [];
    let pos = { x: 0, y: 0 };

    let genStartTime = Date.now();
    console.log("Creating Tile Positions...");

    for (let i = 0; i < GEN_LEVEL_ITER; i++) {
        // Append the position to the end of the array
        levelPositions.push([pos.x, pos.y]);

        let availableDirections = [];

        // Check each 4 directions for 2 things:
        // Make sure the next position would be within the level area
        // Make sure the tile hasn't already been set
        // If the direction meets both of those requirements, then it is added to the array
        if (pos.y + 1 < GEN_LEVEL_HEIGHT / 2 && !contains2DArrayValue(levelPositions, [pos.x, pos.y + 1])) {
            availableDirections.push(UP);
        }
        if (pos.x + 1 < GEN_LEVEL_WIDTH / 2 && !contains2DArrayValue(levelPositions, [pos.x + 1, pos.y])) {
            availableDirections.push(RIGHT);
        }
        if (pos.y - 1 > -GEN_LEVEL_HEIGHT / 2 && !contains2DArrayValue(levelPositions, [pos.x, pos.y - 1])) {
            availableDirections.push(DOWN);
        }
        if (pos.x - 1 > -GEN_LEVEL_WIDTH / 2 && !contains2DArrayValue(levelPositions, [pos.x - 1, pos.y])) {
            availableDirections.push(LEFT);
        }

        // If there are no available directions, the dumbass algorithm backed itself into a corner
        // This will be fixed when the level is smoothed though
        if (availableDirections.length == 0) {
            break;
        }

        // Generate a new direction for the walker to move in
        let direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];

        // Alter the position of the walker
        if (direction == UP) {
            pos.y += 1;
        } else if (direction == RIGHT) {
            pos.x += 1;
        } else if (direction == DOWN) {
            pos.y -= 1;
        } else if (direction == LEFT) {
            pos.x -= 1;
        }
    }

    console.log("Smoothing Level...");

    // Use this while loop to make sure the level is a certain size
    do {
        // Smooth the level and get rid of skinny corridors and holes
        let positionsToAdd = [];
        for (let i = 0; i < levelPositions.length; i++) {
            for (let x = -1; x <= 1; x++) {
                // Calcuate the current x position
                let currX = levelPositions[i][0] + x;

                // If the current x position is out of bounds of the level, then go to the next x value
                if (Math.abs(currX) > GEN_LEVEL_WIDTH / 2) {
                    continue;
                }

                for (let y = -1; y <= 1; y++) {
                    // Calculate the current y position
                    let currY = levelPositions[i][1] + y;

                    // If the current y position is out of bounds of the level, then go to the next y value
                    if (Math.abs(currY) > GEN_LEVEL_HEIGHT / 2) {
                        continue;
                    }

                    // Calculate the current position
                    let currPosition = [currX, currY];
                    // If the current position is not in either the levelPositions array or the positionsToAdd array, then it should be added to the level
                    if (!contains2DArrayValue(levelPositions, currPosition) && !contains2DArrayValue(positionsToAdd, currPosition)) {
                        positionsToAdd.push(currPosition);
                    }
                }
            }
        }

        // Afterwards, add all the positions in the positionsToAdd array to the levelPositions array
        // This needs to be done this way because we don't want to directly modify the levelPositions array as we are going through it. It will cause an infinite loop.
        for (let i = 0; i < positionsToAdd.length; i++) {
            levelPositions.push(positionsToAdd[i]);
        }
    } while (levelPositions.length < GEN_LEVEL_ITER);

    // for (let i = 1; i <= GEN_LEVEL_SMOOTHING_ITER; i++) {
    //     console.log(`Smoothing Level... [Stage 2, Iteration ${i}]`);

    //     for (let x = parseInt(-GEN_LEVEL_WIDTH / 2); x <= parseInt(GEN_LEVEL_WIDTH / 2); x++) {
    //         for (let y = parseInt(-GEN_LEVEL_HEIGHT / 2); y <= parseInt(GEN_LEVEL_HEIGHT / 2); y++) {
    //             // Count up surrounding tiles to the current tile
    //             let count = 0;
    //             //count += contains2DArrayValue(levelPositions, [x - 1, y + 1]);
    //             count += contains2DArrayValue(levelPositions, [x, y + 1]);
    //             //count += contains2DArrayValue(levelPositions, [x + 1, y + 1]);
    //             count += contains2DArrayValue(levelPositions, [x - 1, y]);
    //             count += contains2DArrayValue(levelPositions, [x + 1, y]);
    //             //count += contains2DArrayValue(levelPositions, [x - 1, y - 1]);
    //             count += contains2DArrayValue(levelPositions, [x, y - 1]);
    //             //count += contains2DArrayValue(levelPositions, [x + 1, y - 1]);

    //             // Get the current index in the levelPositions array
    //             // This is also used to determine if there is a tile at the current position
    //             let currTile = indexOf2DArrayValue(levelPositions, [x, y]);

    //             // If the current tile is not in the array and it is surrounded by 3 or more tiles, add it to the array
    //             // This is so the level is more smooth and doesn't have random pathways or holes
    //             if (currTile == -1) {
    //                 if (count > 2) {
    //                     levelPositions.push([x, y]);
    //                 }
    //             }
    //         }
    //     }
    // }

    //#endregion

    // Place tile sprites
    for (let i = 0; i < levelPositions.length; i++) {
        let size = 64;
        let x = (SCENE_WIDTH / 2) + (levelPositions[i][0] * size);
        let y = (SCENE_HEIGHT / 2) + (levelPositions[i][1] * size);
        let tile = new Tile(size, ((levelPositions[i][0] + levelPositions[i][1]) % 2 == 0 ? 0xADBD8F : 0x6F8F72), x, y);

        levelTiles.push(tile);
        gameScene.addChild(tile);
    }

    console.log(`Level Generation Complete [${Date.now() - genStartTime}ms]`);
}