class Tile extends PIXI.Graphics {
    constructor(size, color = 0xFF0000, x = 0, y = 0) {
        super();

        this.beginFill(color);
        this.drawRect(-size / 2, -size / 2, size, size);
        this.endFill();

        this.pos = { x: x, y: y };
        this.x = x;
        this.y = y;
        this.size = size;
    }
}

class Sprites {
    static TEXTURE_SIZE = 16; // The size of each of the textures

    static WHITE_PAWN;
    static WHITE_ROOK;
    static WHITE_KNIGHT;
    static WHITE_BISHOP;
    static WHITE_QUEEN;
    static WHITE_KING;

    static BLACK_PAWN;
    static BLACK_ROOK;
    static BLACK_KNIGHT;
    static BLACK_BISHOP;
    static BLACK_QUEEN;
    static BLACK_KING;

    static loadSprites() {
        let spriteSheet = app.loader.resources["media/pieces.png"].texture;

        this.WHITE_PAWN = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(0, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE));
        this.WHITE_ROOK = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(this.TEXTURE_SIZE, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE));
        this.WHITE_KNIGHT = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(this.TEXTURE_SIZE * 2, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE));
        this.WHITE_BISHOP = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(this.TEXTURE_SIZE * 3, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE));
        this.WHITE_QUEEN = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(this.TEXTURE_SIZE * 4, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE));
        this.WHITE_KING = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(this.TEXTURE_SIZE * 5, 0, this.TEXTURE_SIZE, this.TEXTURE_SIZE));

        this.BLACK_PAWN = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(0, this.TEXTURE_SIZE, this.TEXTURE_SIZE, this.TEXTURE_SIZE));
        this.BLACK_ROOK = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(this.TEXTURE_SIZE, this.TEXTURE_SIZE, this.TEXTURE_SIZE, this.TEXTURE_SIZE));
        this.BLACK_KNIGHT = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(this.TEXTURE_SIZE * 2, this.TEXTURE_SIZE, this.TEXTURE_SIZE, this.TEXTURE_SIZE));
        this.BLACK_BISHOP = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(this.TEXTURE_SIZE * 3, this.TEXTURE_SIZE, this.TEXTURE_SIZE, this.TEXTURE_SIZE));
        this.BLACK_QUEEN = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(this.TEXTURE_SIZE * 4, this.TEXTURE_SIZE, this.TEXTURE_SIZE, this.TEXTURE_SIZE));
        this.BLACK_KING = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(this.TEXTURE_SIZE * 5, this.TEXTURE_SIZE, this.TEXTURE_SIZE, this.TEXTURE_SIZE));
    }
}

class ChessPiece extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(Sprites.WHITE_ROOK);

        this.anchor.set(0.5, 0.5);
        this.scale.set(4);

        this.x = x;
        this.y = y;
    }
}

class Map {
    static TILE_SIZE = 64; // The pixel size of each tile
    static GEN_LEVEL_WIDTH = 17; // The level width in tiles
    static GEN_LEVEL_HEIGHT = 9; // The level height in tiles
    static GEN_LEVEL_ITER = parseInt(this.TILE_SIZE / 1.5); // The minimum number of tiles for each level

    // Variables for the 4 cardinal directions (just to make checking directions more legible)
    static UP = 0;
    static RIGHT = 1;
    static DOWN = 2;
    static LEFT = 3;

    static LEVEL_TILES = [];

    static generateLevel(gameScene) {
        console.log("Level Generation Started");

        // Clear the previous level positions
        this.LEVEL_TILES.forEach(e => gameScene.removeChild(e));
        this.LEVEL_TILES = [];

        let levelPositions = [];
        let pos = { x: 0, y: 0 };

        let genStartTime = Date.now();
        console.log("Creating Tile Positions ...");

        for (let i = 0; i < this.GEN_LEVEL_ITER; i++) {
            // Append the position to the end of the array
            levelPositions.push([pos.x, pos.y]);

            let availableDirections = [];

            // Check each 4 directions for 2 things:
            // Make sure the next position would be within the level area
            // Make sure the tile hasn't already been set
            // If the direction meets both of those requirements, then it is added to the array
            if (pos.y + 1 < this.GEN_LEVEL_HEIGHT / 2 && !contains2DArrayValue(levelPositions, [pos.x, pos.y + 1])) {
                availableDirections.push(this.UP);
            }
            if (pos.x + 1 < this.GEN_LEVEL_WIDTH / 2 && !contains2DArrayValue(levelPositions, [pos.x + 1, pos.y])) {
                availableDirections.push(this.RIGHT);
            }
            if (pos.y - 1 > -this.GEN_LEVEL_HEIGHT / 2 && !contains2DArrayValue(levelPositions, [pos.x, pos.y - 1])) {
                availableDirections.push(this.DOWN);
            }
            if (pos.x - 1 > -this.GEN_LEVEL_WIDTH / 2 && !contains2DArrayValue(levelPositions, [pos.x - 1, pos.y])) {
                availableDirections.push(this.LEFT);
            }

            // If there are no available directions, the dumbass algorithm backed itself into a corner
            // This will be fixed when the level is smoothed though
            if (availableDirections.length == 0) {
                break;
            }

            // Generate a new direction for the walker to move in
            let direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];

            // Alter the position of the walker
            if (direction == this.UP) {
                pos.y += 1;
            } else if (direction == this.RIGHT) {
                pos.x += 1;
            } else if (direction == this.DOWN) {
                pos.y -= 1;
            } else if (direction == this.LEFT) {
                pos.x -= 1;
            }
        }

        console.log("Smoothing Level ...");

        // Use this while loop to make sure the level is a certain size
        do {
            // Smooth the level and get rid of skinny corridors and holes
            let positionsToAdd = [];
            for (let i = 0; i < levelPositions.length; i++) {
                for (let x = -1; x <= 1; x++) {
                    // Calcuate the current x position
                    let currX = levelPositions[i][0] + x;

                    // If the current x position is out of bounds of the level, then go to the next x value
                    if (Math.abs(currX) > this.GEN_LEVEL_WIDTH / 2) {
                        continue;
                    }

                    for (let y = -1; y <= 1; y++) {
                        // Calculate the current y position
                        let currY = levelPositions[i][1] + y;

                        // If the current y position is out of bounds of the level, then go to the next y value
                        if (Math.abs(currY) > this.GEN_LEVEL_HEIGHT / 2) {
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
        } while (levelPositions.length < this.GEN_LEVEL_ITER);

        // Place tile sprites
        for (let i = 0; i < levelPositions.length; i++) {
            let size = 64;
            let x = (SCENE_WIDTH / 2) + (levelPositions[i][0] * size);
            let y = (SCENE_HEIGHT / 2) + (levelPositions[i][1] * size);
            let tile = new Tile(size, ((levelPositions[i][0] + levelPositions[i][1]) % 2 == 0 ? 0xADBD8F : 0x6F8F72), x, y);

            this.LEVEL_TILES.push(tile);
            gameScene.addChild(tile);
        }

        console.log(`Level Generation Complete [${Date.now() - genStartTime}ms]`);
    }
}