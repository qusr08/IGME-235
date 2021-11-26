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

class Map {
    static TILE_SIZE = 64; // The pixel size of each tile
    static GEN_LEVEL_WIDTH = 17; // The level width in tiles
    static GEN_LEVEL_HEIGHT = 9; // The level height in tiles
    static GEN_LEVEL_ITER = parseInt(this.TILE_SIZE / 1.5); // The minimum number of tiles for each level

    // Variables for the 4 cardinal directions (just to make checking directions more legible)
    static UP = [0, 1];
    static RIGHT = [1, 0];
    static DOWN = [0, -1];
    static LEFT = [-1, 0];

    static TILE_POSITIONS = Array.from(Array(this.GEN_LEVEL_WIDTH), () => new Array(this.GEN_LEVEL_HEIGHT));
    static BLACK_PIECES = [];
    static WHITE_PIECES = [];

    static generateLevel(gameScene) {
        console.log(`Level Generation Started [${this.GEN_LEVEL_WIDTH} x ${this.GEN_LEVEL_HEIGHT}]`);
        let genStartTime = Date.now();

        // Clear the previous level positions and pieces
        this.TILE_POSITIONS.forEach(e => e.forEach(f => gameScene.removeChild(f)));
        this.TILE_POSITIONS = Array.from(Array(this.GEN_LEVEL_WIDTH), () => new Array(this.GEN_LEVEL_HEIGHT));
        this.BLACK_PIECES.forEach(e => gameScene.removeChild(e));
        this.BLACK_PIECES = [];
        this.WHITE_PIECES.forEach(e => gameScene.removeChild(e));
        this.WHITE_PIECES = [];

        let levelPositions = [];
        let pos = [0, 0];

        console.log("Creating Tile Positions ...");

        for (let i = 0; i < this.GEN_LEVEL_ITER; i++) {
            // Append the position to the end of the array
            levelPositions.push(pos);

            let availableDirections = [];

            // Check each 4 directions for 2 things:
            // Make sure the next position would be within the level area
            // Make sure the tile hasn't already been set
            // If the direction meets both of those requirements, then it is added to the array
            let posUp = add2DArray(pos, this.UP);
            let posRight = add2DArray(pos, this.RIGHT);
            let posDown = add2DArray(pos, this.DOWN);
            let posLeft = add2DArray(pos, this.LEFT);

            if (posUp[1] < this.GEN_LEVEL_HEIGHT / 2 && !contains2DArrayValue(levelPositions, posUp)) {
                availableDirections.push(posUp);
            }
            if (posRight[0] < this.GEN_LEVEL_WIDTH / 2 && !contains2DArrayValue(levelPositions, posRight)) {
                availableDirections.push(posRight);
            }
            if (posDown[1] > -this.GEN_LEVEL_HEIGHT / 2 && !contains2DArrayValue(levelPositions, posDown)) {
                availableDirections.push(posDown);
            }
            if (posLeft[0] > -this.GEN_LEVEL_WIDTH / 2 && !contains2DArrayValue(levelPositions, posLeft)) {
                availableDirections.push(posLeft);
            }

            // If there are no available directions, the dumbass algorithm backed itself into a corner
            // This will be fixed when the level is smoothed though
            if (availableDirections.length == 0) {
                break;
            }

            // Generate a new direction for the walker to move in and alter the position
            pos = availableDirections[Math.floor(Math.random() * availableDirections.length)];
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

        console.log(`Placing Tiles ... [${levelPositions.length}]`);

        // Place tile sprites
        for (let i = 0; i < levelPositions.length; i++) {
            // Create the tile object
            let tile = new Tile(this.TILE_SIZE, ((levelPositions[i][0] + levelPositions[i][1]) % 2 == 0 ? 0xADBD8F : 0x6F8F72), levelPositions[i]);

            // Add the tile to its position in the array
            let tileArryPos = this.convertTileToArrayPos(levelPositions[i]);
            this.TILE_POSITIONS[tileArryPos[0]][tileArryPos[1]] = tile;

            gameScene.addChild(tile);
        }

        // Calculate the number of pieces to spawn based on the size of the map
        let numPieces = Math.ceil(levelPositions.length / this.GEN_LEVEL_ITER * 3);
        // A list of all the available positions for a piece to spawn
        let availablePositions = levelPositions;

        console.log(`Placing Pieces ... [${numPieces}]`);

        // Place random pieces on the chess board
        for (let i = 0; i < numPieces; i++) {
            // Get a random index from the available positions
            // Also remove the position of the piece from the available positions because we don't want 2 pieces spawning on the same square
            let index = Math.floor(Math.random() * availablePositions.length);
            let pieceTilePos = availablePositions[index];
            availablePositions.splice(index, 1);

            // Create piece object
            // Generate a random piece between a rook and a king (leaving out pawn)
            let pieceType = Math.floor(randRange(ChessPiece.PieceType.ROOK, ChessPiece.PieceType.KING + 1));
            let piece = new ChessPiece(pieceType, ChessPiece.PieceColor.BLACK, pieceTilePos);

            // Add the piece to its position in the array
            // Also make sure the tile beneath the piece has its "hasPiece" variable set to true
            let pieceArrayPos = this.convertTileToArrayPos(pieceTilePos);
            this.BLACK_PIECES.push(piece);

            gameScene.addChild(piece);
        }

        // Update available tiles for each piece on the board
        for (let i = 0; i < this.BLACK_PIECES.length; i++) {
            this.BLACK_PIECES[i].updateAvailableTiles();
        }

        console.log(`Level Generation Complete [${Date.now() - genStartTime}ms]`);
    }

    static convertArrayToScreenPos(arrayPos) {
        return this.convertTileToScreenPos(this.convertArrayToTilePos(arrayPos));
    }

    static convertTileToArrayPos(tilePos) {
        let x = tilePos[0] + Math.floor(this.GEN_LEVEL_WIDTH / 2);
        let y = tilePos[1] + Math.floor(this.GEN_LEVEL_HEIGHT / 2);

        return [x, y];
    }

    static convertArrayToTilePos(arrayPos) {
        let x = arrayPos[0] - Math.floor(this.GEN_LEVEL_WIDTH / 2);
        let y = arrayPos[1] - Math.floor(this.GEN_LEVEL_HEIGHT / 2);

        return [x, y];
    }

    static convertTileToScreenPos(tilePos) {
        let x = (SCENE_WIDTH / 2) + (tilePos[0] * this.TILE_SIZE);
        let y = (SCENE_HEIGHT / 2) + (tilePos[1] * this.TILE_SIZE);

        return [x, y];
    }

    static convertScreenToTilePos(screenPos) {
        let x = (screenPos[0] - (SCENE_WIDTH / 2)) / this.TILE_SIZE;
        let y = (screenPos[1] - (SCENE_HEIGHT / 2)) / this.TILE_SIZE;

        return [x, y];
    }

    static tileIsAvailable(tilePos) {
        // Check to make sure the tiles are within the bounds of the map
        if (Math.abs(tilePos[0]) >= this.GEN_LEVEL_WIDTH / 2 || Math.abs(tilePos[1]) >= this.GEN_LEVEL_HEIGHT / 2) {
            return false;
        }

        // Get the tile and make sure it exists and doesn't have a piece on it
        // If a tile meets that criteria, then it is available
        let tileArrayPos = this.convertTileToArrayPos(tilePos);
        let tile = this.TILE_POSITIONS[tileArrayPos[0]][tileArrayPos[1]];
        return (tile != undefined && !tile.hasPiece());
    }
}

class ChessPiece extends PIXI.Sprite {
    static PieceType = {
        PAWN: 0,
        ROOK: 1,
        KNIGHT: 2,
        BISHOP: 3,
        QUEEN: 4,
        KING: 5
    };

    static PieceColor = {
        WHITE: 0,
        BLACK: 6
    };

    constructor(pieceType, pieceColor, tilePos) {
        let sprite = e => {
            switch (pieceType + pieceColor) {
                case 0: return Sprites.WHITE_PAWN;
                case 1: return Sprites.WHITE_ROOK;
                case 2: return Sprites.WHITE_KNIGHT;
                case 3: return Sprites.WHITE_BISHOP;
                case 4: return Sprites.WHITE_QUEEN;
                case 5: return Sprites.WHITE_KING;
                case 6: return Sprites.BLACK_PAWN;
                case 7: return Sprites.BLACK_ROOK;
                case 8: return Sprites.BLACK_KNIGHT;
                case 9: return Sprites.BLACK_BISHOP;
                case 10: return Sprites.BLACK_QUEEN;
                case 11: return Sprites.BLACK_KING;
                default: return Sprites.WHITE_PAWN;
            }
        };
        super(sprite());

        this.anchor.set(0.5, 0.5);
        this.scale.set(Map.TILE_SIZE / Sprites.TEXTURE_SIZE);

        this.pieceType = pieceType;
        this.pieceColor = pieceColor;
        this.availableTiles = [];
        this.tilePos = tilePos;

        // Set the tile that this piece is on to 
        let arrayPos = Map.convertTileToArrayPos(tilePos);
        Map.TILE_POSITIONS[arrayPos[0]][arrayPos[1]].piece = this;

        let screenPos = Map.convertTileToScreenPos(tilePos);
        this.x = screenPos[0];
        this.y = screenPos[1];
    }

    updateAvailableTiles() {
        // Clear the currently available tiles
        this.availableTiles = [];

        switch (this.pieceType) {
            case ChessPiece.PieceType.PAWN:
                break;
            case ChessPiece.PieceType.ROOK:
                this.#addTilesInLine(Map.UP);
                this.#addTilesInLine(Map.RIGHT);
                this.#addTilesInLine(Map.DOWN);
                this.#addTilesInLine(Map.LEFT);

                break;
            case ChessPiece.PieceType.KNIGHT:
                this.#tryAddTile(add2DArray(this.tilePos, [1, 2]));
                this.#tryAddTile(add2DArray(this.tilePos, [-1, 2]));
                this.#tryAddTile(add2DArray(this.tilePos, [2, 1]));
                this.#tryAddTile(add2DArray(this.tilePos, [2, -1]));
                this.#tryAddTile(add2DArray(this.tilePos, [1, -2]));
                this.#tryAddTile(add2DArray(this.tilePos, [-1, -2]));
                this.#tryAddTile(add2DArray(this.tilePos, [-2, 1]));
                this.#tryAddTile(add2DArray(this.tilePos, [-2, -1]));

                break;
            case ChessPiece.PieceType.BISHOP:
                this.#addTilesInLine([1, 1]);
                this.#addTilesInLine([1, -1]);
                this.#addTilesInLine([-1, -1]);
                this.#addTilesInLine([-1, 1]);

                break;
            case ChessPiece.PieceType.QUEEN:
                this.#addTilesInLine(Map.UP);
                this.#addTilesInLine(Map.RIGHT);
                this.#addTilesInLine(Map.DOWN);
                this.#addTilesInLine(Map.LEFT);

                this.#addTilesInLine([1, 1]);
                this.#addTilesInLine([1, -1]);
                this.#addTilesInLine([-1, -1]);
                this.#addTilesInLine([-1, 1]);

                break;
            case ChessPiece.PieceType.KING:
                this.#tryAddTile(add2DArray(this.tilePos, [1, 1]));
                this.#tryAddTile(add2DArray(this.tilePos, [1, 0]));
                this.#tryAddTile(add2DArray(this.tilePos, [1, -1]));
                this.#tryAddTile(add2DArray(this.tilePos, [0, -1]));
                this.#tryAddTile(add2DArray(this.tilePos, [-1, -1]));
                this.#tryAddTile(add2DArray(this.tilePos, [-1, 0]));
                this.#tryAddTile(add2DArray(this.tilePos, [-1, 1]));
                this.#tryAddTile(add2DArray(this.tilePos, [0, 1]));

                break;
        }
    }

    moveToTile (tilePos) {
        
    }

    #addTilesInLine(additiveArray) {
        let tempTilePos = this.tilePos;
        do {
            tempTilePos = add2DArray(tempTilePos, additiveArray);
        } while (this.#tryAddTile(tempTilePos));
    }

    #tryAddTile(tilePos) {
        // If the tile is available, meaning it doesnt have a piece on it and it isnt undefined, then add it to the available tiles array for this piece
        if (Map.tileIsAvailable(tilePos)) {
            // Get the tile object
            let tileArrayPos = Map.convertTileToArrayPos(tilePos);
            let tile = Map.TILE_POSITIONS[tileArrayPos[0]][tileArrayPos[1]];

            // Add the tile to the array
            this.availableTiles.push(tile);

            return true;
        }

        return false;
    }
}

class Tile extends PIXI.Graphics {
    constructor(size, color, tilePos) {
        super();

        this.tilePos = tilePos;
        this.color = color;
        this.piece = undefined;

        let screenPos = Map.convertTileToScreenPos(tilePos);
        this.x = screenPos[0];
        this.y = screenPos[1];

        this.beginFill(color);
        this.drawRect(-size / 2, -size / 2, size, size);
        this.endFill();

        // Add interaction
        this.interactive = true;
        this.mouseover = (e) => {
            if (this.hasPiece()) {
                for (let i = 0; i < this.piece.availableTiles.length; i++) {
                    this.piece.availableTiles[i].tint = 0xFF6666;
                }
            }

            this.tint = 0x666666;
        }
        this.mouseout = (e) => {
            if (this.hasPiece()) {
                for (let i = 0; i < this.piece.availableTiles.length; i++) {
                    this.piece.availableTiles[i].tint = 0xFFFFFF;
                }
            }

            this.tint = 0xFFFFFF;
        }
    }

    hasPiece() {
        return (this.piece != undefined);
    }
}