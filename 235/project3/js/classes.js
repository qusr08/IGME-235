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
    // The size of the game window in pixel
    static SCENE_WIDTH = 1280;
    static SCENE_HEIGHT = 720;

    static TILE_SIZE = 64; // The pixel size of each tile
    static GEN_LEVEL_WIDTH = 11; // The level width in tiles
    static GEN_LEVEL_HEIGHT = 9; // The level height in tiles
    static GEN_LEVEL_ITER = parseInt((this.GEN_LEVEL_WIDTH * this.GEN_LEVEL_HEIGHT) / 3); // The minimum number of tiles for each level
    static LEVEL_BORDER = parseInt((this.SCENE_HEIGHT - (this.TILE_SIZE * this.GEN_LEVEL_HEIGHT)) / 2); // The border of the map around the edge of the screen

    // The size of the level in pixels
    static LEVEL_SCREEN_WIDTH = (this.LEVEL_BORDER * 2) + (this.GEN_LEVEL_WIDTH * this.TILE_SIZE);
    static LEVEL_SCREEN_HEIGHT = (this.LEVEL_BORDER * 2) + (this.GEN_LEVEL_HEIGHT * this.TILE_SIZE);

    // Variables for the 4 cardinal directions (just to make directions more legible)
    static UP = [0, 1];
    static RIGHT = [1, 0];
    static DOWN = [0, -1];
    static LEFT = [-1, 0];

    static TILE_POSITIONS = Array.from(Array(this.GEN_LEVEL_WIDTH), () => new Array(this.GEN_LEVEL_HEIGHT));
    static PIECES = [];

    static generateLevel(scene) {
        console.log(`Level Generation Started [${this.GEN_LEVEL_WIDTH} x ${this.GEN_LEVEL_HEIGHT}]`);
        let genStartTime = Date.now();

        // Clear the previous level positions and pieces
        this.TILE_POSITIONS.forEach(e => e.forEach(f => scene.removeChild(f)));
        this.TILE_POSITIONS = Array.from(Array(this.GEN_LEVEL_WIDTH), () => new Array(this.GEN_LEVEL_HEIGHT));
        this.PIECES.forEach(e => scene.removeChild(e));
        this.PIECES = [];

        let levelPositions = [];
        let pos = [Math.floor(Map.GEN_LEVEL_WIDTH / 2), Math.floor(Map.GEN_LEVEL_HEIGHT / 2)];

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

            if (posUp[1] < this.GEN_LEVEL_HEIGHT && !contains2DArrayValue(levelPositions, posUp)) {
                availableDirections.push(posUp);
            }
            if (posRight[0] < this.GEN_LEVEL_WIDTH && !contains2DArrayValue(levelPositions, posRight)) {
                availableDirections.push(posRight);
            }
            if (posDown[1] >= 0 && !contains2DArrayValue(levelPositions, posDown)) {
                availableDirections.push(posDown);
            }
            if (posLeft[0] >= 0 && !contains2DArrayValue(levelPositions, posLeft)) {
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
                    if (!inRange(currX, 0, this.GEN_LEVEL_WIDTH - 1)) {
                        continue;
                    }

                    for (let y = -1; y <= 1; y++) {
                        // Calculate the current y position
                        let currY = levelPositions[i][1] + y;

                        // If the current y position is out of bounds of the level, then go to the next y value
                        if (!inRange(currY, 0, this.GEN_LEVEL_HEIGHT - 1)) {
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
            let tilePos = levelPositions[i];
            let tile = new Tile(this.TILE_SIZE, ((tilePos[0] + tilePos[1]) % 2 == 0 ? BOARD_COLOR_1 : BOARD_COLOR_2), tilePos);

            // Add the tile to its position in the array
            this.TILE_POSITIONS[tilePos[0]][tilePos[1]] = tile;

            scene.addChild(tile);
        }

        // Calculate the number of pieces to spawn based on the size of the map
        let numPieces = Math.ceil(levelPositions.length / this.GEN_LEVEL_ITER * 3);
        // A list of all the available positions for a piece to spawn
        let availablePositions = levelPositions;

        console.log(`Placing Black Pieces ... [${numPieces}]`);

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

            // Make sure the tile beneath the piece has its "hasPiece" variable set to true
            this.PIECES.push(piece);

            scene.addChild(piece);
        }

        // Update available tiles for each piece on the board
        for (let i = 0; i < this.PIECES.length; i++) {
            this.PIECES[i].updateAvailableTiles();
        }

        console.log(`Level Generation Complete [${Date.now() - genStartTime}ms]`);
    }

    static convertTileToScreenPos(tilePos) {
        let x = this.LEVEL_BORDER + (tilePos[0] * this.TILE_SIZE);
        let y = this.LEVEL_BORDER + (tilePos[1] * this.TILE_SIZE);

        return [x, y];
    }

    static convertScreenToTilePos(screenPos) {
        let x = (screenPos[0] - this.LEVEL_BORDER) / this.TILE_SIZE;
        let y = (screenPos[1] - this.LEVEL_BORDER) / this.TILE_SIZE;

        return [x, y];
    }

    static tileIsAvailable(tilePos) {
        // Check to make sure the tiles are within the bounds of the map
        if (!inRange(tilePos[0], 0, this.GEN_LEVEL_WIDTH - 1) || !inRange(tilePos[1], 0, this.GEN_LEVEL_HEIGHT - 1)) {
            return false;
        }

        // Get the tile and make sure it exists and doesn't have a piece on it
        // If a tile meets that criteria, then it is available
        let tile = this.TILE_POSITIONS[tilePos[0]][tilePos[1]];
        return (tile != undefined && !tile.hasPiece());
    }

    static updatePiecePositions() {
        for (let i = 0; i < this.PIECES.length; i++) {
            this.PIECES[i].updateAvailableTiles();
        }
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

    static PIECE_MOVE_SPEED = 5; // How many pixels the piece moves per frame

    constructor(pieceType, pieceColor, tilePos) {
        let sprite = e => {
            switch (pieceType + pieceColor) {
                case 0:
                    return Sprites.WHITE_PAWN;
                case 1:
                    return Sprites.WHITE_ROOK;
                case 2:
                    return Sprites.WHITE_KNIGHT;
                case 3:
                    return Sprites.WHITE_BISHOP;
                case 4:
                    return Sprites.WHITE_QUEEN;
                case 5:
                    return Sprites.WHITE_KING;
                case 6:
                    return Sprites.BLACK_PAWN;
                case 7:
                    return Sprites.BLACK_ROOK;
                case 8:
                    return Sprites.BLACK_KNIGHT;
                case 9:
                    return Sprites.BLACK_BISHOP;
                case 10:
                    return Sprites.BLACK_QUEEN;
                case 11:
                    return Sprites.BLACK_KING;
                default:
                    return Sprites.WHITE_PAWN;
            }
        };
        super(sprite());

        this.anchor.set(0.5);
        this.scale.set(Map.TILE_SIZE / Sprites.TEXTURE_SIZE);

        this.pieceType = pieceType;
        this.pieceColor = pieceColor;
        this.availableTiles = [];
        this.tilePos = tilePos;
        this.toTilePos = tilePos;

        this.moveToTile(tilePos);
    }

    updateAvailableTiles() {
        // Clear the currently available tiles
        this.availableTiles = [];

        // Based on the piece type, add board tiles to a list of possible tiles that the piece can move to
        switch (this.pieceType) {
            case ChessPiece.PieceType.PAWN:
                break;
            case ChessPiece.PieceType.ROOK:
                this._addTilesInLine(Map.UP);
                this._addTilesInLine(Map.RIGHT);
                this._addTilesInLine(Map.DOWN);
                this._addTilesInLine(Map.LEFT);

                break;
            case ChessPiece.PieceType.KNIGHT:
                this._tryAddTile(add2DArray(this.tilePos, [1, 2]));
                this._tryAddTile(add2DArray(this.tilePos, [-1, 2]));
                this._tryAddTile(add2DArray(this.tilePos, [2, 1]));
                this._tryAddTile(add2DArray(this.tilePos, [2, -1]));
                this._tryAddTile(add2DArray(this.tilePos, [1, -2]));
                this._tryAddTile(add2DArray(this.tilePos, [-1, -2]));
                this._tryAddTile(add2DArray(this.tilePos, [-2, 1]));
                this._tryAddTile(add2DArray(this.tilePos, [-2, -1]));

                break;
            case ChessPiece.PieceType.BISHOP:
                this._addTilesInLine([1, 1]);
                this._addTilesInLine([1, -1]);
                this._addTilesInLine([-1, -1]);
                this._addTilesInLine([-1, 1]);

                break;
            case ChessPiece.PieceType.QUEEN:
                this._addTilesInLine(Map.UP);
                this._addTilesInLine(Map.RIGHT);
                this._addTilesInLine(Map.DOWN);
                this._addTilesInLine(Map.LEFT);

                this._addTilesInLine([1, 1]);
                this._addTilesInLine([1, -1]);
                this._addTilesInLine([-1, -1]);
                this._addTilesInLine([-1, 1]);

                break;
            case ChessPiece.PieceType.KING:
                this._tryAddTile(add2DArray(this.tilePos, [1, 1]));
                this._tryAddTile(add2DArray(this.tilePos, [1, 0]));
                this._tryAddTile(add2DArray(this.tilePos, [1, -1]));
                this._tryAddTile(add2DArray(this.tilePos, [0, -1]));
                this._tryAddTile(add2DArray(this.tilePos, [-1, -1]));
                this._tryAddTile(add2DArray(this.tilePos, [-1, 0]));
                this._tryAddTile(add2DArray(this.tilePos, [-1, 1]));
                this._tryAddTile(add2DArray(this.tilePos, [0, 1]));

                break;
        }
    }

    moveToTile(toTilePos, doAnimation = false) {
        this.toTilePos = toTilePos;

        if (doAnimation) {
            piecesToAnimate.push(this);
        } else {
            this.getTile().piece = undefined;
            this.tilePos = toTilePos;
            this.getTile().piece = this;

            let screenPos = Map.convertTileToScreenPos(this.tilePos);
            this.x = screenPos[0] + (Map.TILE_SIZE / 2);
            this.y = screenPos[1] + (Map.TILE_SIZE / 2);
        }
    }

    animate() {

    }

    getTile() {
        return Map.TILE_POSITIONS[this.tilePos[0]][this.tilePos[1]];
    }

    _addTilesInLine(additiveArray) {
        let tempTilePos = this.tilePos;
        do {
            tempTilePos = add2DArray(tempTilePos, additiveArray);
        } while (this._tryAddTile(tempTilePos));
    }

    _tryAddTile(tilePos) {
        // If the tile is available, meaning it doesnt have a piece on it and it isnt undefined, then add it to the available tiles array for this piece
        if (Map.tileIsAvailable(tilePos)) {
            // Get the tile object
            let tile = Map.TILE_POSITIONS[tilePos[0]][tilePos[1]];

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
        this.drawRect(0, 0, size, size);
        this.endFill();

        // Add interaction
        this.interactive = true;
        this.mouseover = this._mouseEnter;
        this.mouseout = this._mouseExit;
        this.click = this._mouseClick;
    }

    hasPiece() {
        return (this.piece != undefined);
    }

    _mouseEnter(e) {
        // Set the tint of this current tile
        this.tint = 0x666666;

        // If there is not a currently selected tile, check to see if there is a piece on this tile
        if (currMovingPiece == undefined) {
            // If there is a piece, then highlight the piece's available moves
            if (this.hasPiece()) {
                this._setTilesTint(this.piece.availableTiles, AVAIL_TINT);
            }
        } else {
            // If there is a selected tile, check to see if this tile is either the selected tile or a tile that the selected piece could move to
            if (this.piece == currMovingPiece || currMovingPiece.availableTiles.includes(this)) {
                this.tint = SELECT_TINT;
            }
        }
    }

    _mouseExit(e) {
        // Reset the tint of this current tile
        this.tint = 0xFFFFFF;

        // If there is not a currently selected tile, check to see if there is a piece on this tile
        if (currMovingPiece == undefined) {
            // If there is a piece, then make sure to reset the tiles that involve is available moves since the mouse is now moving off of this tile
            if (this.hasPiece()) {
                this._setTilesTint(this.piece.availableTiles, 0xFFFFFF);
            }
        } else {
            // If there is a selected tile, check to see if this tile is the selected tile or a available tile. Each case will result in a different color
            if (this.piece == currMovingPiece) {
                this.tint = SELECT_TINT;
            } else if (currMovingPiece.availableTiles.includes(this)) {
                this.tint = AVAIL_TINT;
            }
        }
    }

    _mouseClick(e) {
        if (currMovingPiece != undefined) {
            if (currMovingPiece.availableTiles.includes(this)) {
                this._setTilesTint(currMovingPiece.availableTiles, 0xFFFFFF);
                currMovingPiece.getTile().tint = 0xFFFFFF;

                currMovingPiece.moveToTile(this.tilePos);

                Map.updatePiecePositions();

                currMovingPiece = undefined;
            } else if (currMovingPiece.getTile() == this) {
                currMovingPiece.moveToTile(this.tilePos);

                currMovingPiece = undefined;
            }
        } else if (this.piece != undefined) {
            currMovingPiece = this.piece;
            currMovingPiece.bringToFront();
        }

        this._mouseEnter();

        // // When the mouse clicks, and there is a piece on this tile, then make this tile the currently selected tile
        // if (this.piece != undefined) {
        //     // If there was already a selected tile, then make sure to reset the hightlighted tiles for that piece
        //     if (Tile._SELECTED_TILE != undefined) {
        //         this._setTilesTint(Tile._SELECTED_TILE.piece.availableTiles, 0xFFFFFF);
        //         Tile._SELECTED_TILE.tint = 0xFFFFFF;
        //     }

        //     // Set the selected tile to this tile
        //     Tile._SELECTED_TILE = this;

        //     // Highlight the currently selected piece's avaiable moves
        //     this._setTilesTint(Tile._SELECTED_TILE.piece.availableTiles, AVAIL_TINT);
        //     this.tint = SELECT_TINT;
        // } else if (Tile._SELECTED_TILE != undefined) {
        //     // If the mouse clicks and there is a currently selected tile but no piece on this tile, then reset the selected tile
        //     this._setTilesTint(Tile._SELECTED_TILE.piece.availableTiles, 0xFFFFFF);
        //     Tile._SELECTED_TILE.tint = 0xFFFFFF;

        //     Tile._SELECTED_TILE = undefined;
        // }
    }

    _setTilesTint(tiles, tint) {
        for (let i = 0; i < tiles.length; i++) {
            tiles[i].tint = tint;
        }
    }
}

class Panel extends PIXI.Graphics {
    constructor(x, y, width, height, color) {
        super();

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.beginFill(color);
        this.drawRect(0, 0, width, height);
        this.endFill();
    }
}