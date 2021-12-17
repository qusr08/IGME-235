class Map {
    static TILE_SIZE = 64; // The pixel size of each tile
    static GEN_LEVEL_WIDTH = 17; // The level width in tiles
    static GEN_LEVEL_HEIGHT = 9; // The level height in tiles
    static LEVEL_BORDER = parseInt((GameManager.SCENE_HEIGHT - (Map.TILE_SIZE * Map.GEN_LEVEL_HEIGHT)) / 2); // The border of the map around the edge of the screen

    // The size of the level in pixels
    static LEVEL_SCREEN_WIDTH = (Map.LEVEL_BORDER * 2) + (Map.GEN_LEVEL_WIDTH * Map.TILE_SIZE);
    static LEVEL_SCREEN_HEIGHT = (Map.LEVEL_BORDER * 2) + (Map.GEN_LEVEL_HEIGHT * Map.TILE_SIZE);

    // Variables for the 4 cardinal directions (just to make directions more legible)
    static UP = [0, 1];
    static RIGHT = [1, 0];
    static DOWN = [0, -1];
    static LEFT = [-1, 0];

    static TILE_POSITIONS = Array.from(Array(Map.GEN_LEVEL_WIDTH), () => new Array(Map.GEN_LEVEL_HEIGHT));
    static TILE_LIST = [];

    static BLACK_PIECES = [];
    static WHITE_PIECES = [];

    static generateLevel(diffMod, scene) {
        console.log(diffMod);

        //console.log(`Level Generation Started [${Map.GEN_LEVEL_WIDTH} x ${Map.GEN_LEVEL_HEIGHT}]`);
        let genStartTime = Date.now();

        // Clear the previous level positions and pieces
        Map.TILE_POSITIONS.forEach(e => e.forEach(f => scene.removeChild(f)));
        Map.TILE_POSITIONS = Array.from(Array(Map.GEN_LEVEL_WIDTH), () => new Array(Map.GEN_LEVEL_HEIGHT));
        Map.BLACK_PIECES.forEach(e => scene.removeChild(e));
        Map.BLACK_PIECES = [];
        Map.WHITE_PIECES.forEach(e => scene.removeChild(e));
        Map.WHITE_PIECES = [];
        Map.TILE_LIST = [];

        let pos = [Math.floor(Map.GEN_LEVEL_WIDTH / 2), Math.floor(Map.GEN_LEVEL_HEIGHT / 2)];
        let genLevelIter = Math.min((Map.GEN_LEVEL_WIDTH * Map.GEN_LEVEL_HEIGHT * Math.log(diffMod)) / 16, (Map.GEN_LEVEL_WIDTH * Map.GEN_LEVEL_HEIGHT) / 3);

        //#region Creating Tile Positions
        //console.log("Creating Tile Positions ...");

        for (let i = 0; i < genLevelIter; i++) {
            // Append the position to the end of the array
            Map.TILE_LIST.push(pos);

            let availableDirections = [];

            // Check each 4 directions for 2 things:
            // Make sure the next position would be within the level area
            // Make sure the tile hasn't already been set
            // If the direction meets both of those requirements, then it is added to the array
            let posUp = Utils.add2DArray(pos, Map.UP);
            let posRight = Utils.add2DArray(pos, Map.RIGHT);
            let posDown = Utils.add2DArray(pos, Map.DOWN);
            let posLeft = Utils.add2DArray(pos, Map.LEFT);

            if (posUp[1] < Map.GEN_LEVEL_HEIGHT && !Utils.contains2DArrayValue(Map.TILE_LIST, posUp)) {
                availableDirections.push(posUp);
            }
            if (posRight[0] < Map.GEN_LEVEL_WIDTH && !Utils.contains2DArrayValue(Map.TILE_LIST, posRight)) {
                availableDirections.push(posRight);
            }
            if (posDown[1] >= 0 && !Utils.contains2DArrayValue(Map.TILE_LIST, posDown)) {
                availableDirections.push(posDown);
            }
            if (posLeft[0] >= 0 && !Utils.contains2DArrayValue(Map.TILE_LIST, posLeft)) {
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

        //#endregion

        //#region Smoothing Level
        //console.log("Smoothing Level ...");

        // Use this while loop to make sure the level is a certain size
        do {
            // Smooth the level and get rid of skinny corridors and holes
            let positionsToAdd = [];
            for (let i = 0; i < Map.TILE_LIST.length; i++) {
                for (let x = -1; x <= 1; x++) {
                    // Calcuate the current x position
                    let currX = Map.TILE_LIST[i][0] + x;

                    // If the current x position is out of bounds of the level, then go to the next x value
                    if (!Utils.inRange(currX, 0, Map.GEN_LEVEL_WIDTH - 1)) {
                        continue;
                    }

                    for (let y = -1; y <= 1; y++) {
                        // Calculate the current y position
                        let currY = Map.TILE_LIST[i][1] + y;

                        // If the current y position is out of bounds of the level, then go to the next y value
                        if (!Utils.inRange(currY, 0, Map.GEN_LEVEL_HEIGHT - 1)) {
                            continue;
                        }

                        // Calculate the current position
                        let currPosition = [currX, currY];
                        // If the current position is not in either the Map.TILE_LIST array or the positionsToAdd array, then it should be added to the level
                        if (!Utils.contains2DArrayValue(Map.TILE_LIST, currPosition) && !Utils.contains2DArrayValue(positionsToAdd, currPosition)) {
                            positionsToAdd.push(currPosition);
                        }
                    }
                }
            }

            // Afterwards, add all the positions in the positionsToAdd array to the Map.TILE_LIST array
            // This needs to be done this way because we don't want to directly modify the Map.TILE_LIST array as we are going through it. It will cause an infinite loop.
            for (let i = 0; i < positionsToAdd.length; i++) {
                Map.TILE_LIST.push(positionsToAdd[i]);
            }
        } while (Map.TILE_LIST.length < genLevelIter);
        //#endregion

        //#region Placing Tiles
        //console.log(`Placing Tiles ... [${Map.TILE_LIST.length}]`);

        // Place tile sprites
        for (let i = 0; i < Map.TILE_LIST.length; i++) {
            // Create the tile object
            let tilePos = Map.TILE_LIST[i];
            // let tile = new Tile(Map.TILE_SIZE, ((tilePos[0] + tilePos[1]) % 2 == 0 ? BOARD_COLOR_1 : BOARD_COLOR_2), tilePos);
            let tile = new Tile((tilePos[0] + tilePos[1]) % 2, tilePos, scene);

            // Add the tile to its position in the array
            Map.TILE_POSITIONS[tilePos[0]][tilePos[1]] = tile;
        }
        //#endregion

        //#region Placing Black Pieces
        // Calculate the number of pieces to spawn based on the size of the map
        // let numPieces = Math.ceil(Map.TILE_LIST.length / genLevelIter * 12);
        let numPieces = Math.ceil(Map.TILE_LIST.length / 6);
        // A list of all the available positions for a piece to spawn
        let availablePositions = [...Map.TILE_LIST];
        let availableTurns = [1, 2, 3, 4];

        //console.log(`Placing Black Pieces ... [${numPieces}]`);

        // Place random pieces on the chess board
        for (let i = 0; i < numPieces; i++) {
            // Get a random index from the available positions
            // Also remove the position of the piece from the available positions because we don't want 2 pieces spawning on the same square
            let tileIndex = Math.floor(Math.random() * availablePositions.length);
            let pieceTilePos = availablePositions[tileIndex];
            availablePositions.splice(tileIndex, 1);

            // Create piece object
            // Generate a random piece between a rook and a king (leaving out pawn)
            let pieceType = Math.floor(Utils.randRange(ChessPiece.PieceType.ROOK, ChessPiece.PieceType.KING + 1));
            let turnIndex = Math.floor(Utils.randRange(0, availableTurns.length));

            let pieceAbility = ChessPiece.PieceAbilityType.NONE;
            if (GameManager.DIFFICULTY_TYPE == GameManager.DifficultyType.INSANE && Math.random() < diffMod / 16) {
                pieceAbility = Math.floor(Utils.randRange(ChessPiece.PieceAbilityType.CRACKED, ChessPiece.PieceAbilityType.FAST + 1));
            }

            let piece = new BlackChessPiece(pieceType, availableTurns[turnIndex], pieceAbility, pieceTilePos, scene);

            availableTurns.splice(turnIndex, 1);
            if (availableTurns.length == 0) {
                availableTurns = [1, 2, 3, 4];
            }
        }
        //#endregion

        //#region Placing White Pieces
        //console.log(`Placing White Pieces ... [${GameManager.PARTY_PIECE_TYPES.length}]`);

        if (GameManager.PARTY_PIECE_TYPES.length == 0) {
            console.warn("There are no white pieces to place!");
        }

        // Place random pieces on the chess board
        for (let i = 0; i < GameManager.PARTY_PIECE_TYPES.length; i++) {
            // Get a random index from the available positions
            // Also remove the position of the piece from the available positions because we don't want 2 pieces spawning on the same square
            let index = Math.floor(Math.random() * availablePositions.length);
            let pieceTilePos = availablePositions[index];
            availablePositions.splice(index, 1);

            // Create piece object based on the party that the player currently has
            let piece = new WhiteChessPiece(GameManager.PARTY_PIECE_TYPES[i], pieceTilePos, scene);
        }
        //#endregion

        //console.log(`Level Generation Complete [${Date.now() - genStartTime}ms]`);
    }

    static convertTileToScreenPos(tilePos, atCenter = false) {
        let x = Map.LEVEL_BORDER + (tilePos[0] * Map.TILE_SIZE) + (atCenter ? (Map.TILE_SIZE / 2) : 0);
        let y = Map.LEVEL_BORDER + (tilePos[1] * Map.TILE_SIZE) + (atCenter ? (Map.TILE_SIZE / 2) : 0);

        return [x, y];
    }

    static convertScreenToTilePos(screenPos) {
        let x = (screenPos[0] - Map.LEVEL_BORDER) / Map.TILE_SIZE;
        let y = (screenPos[1] - Map.LEVEL_BORDER) / Map.TILE_SIZE;

        return [x, y];
    }

    static update() {
        // Update the z index of all tiles in the map
        for (let i = 0; i < Map.TILE_LIST.length; i++) {
            let tile = Map.getTile(Map.TILE_LIST[i]);
            if (tile != undefined) {
                tile.update();
            }
        }

        // Update all black piece available tiles
        for (let i = 0; i < Map.BLACK_PIECES.length; i++) {
            Map.BLACK_PIECES[i].update();
        }

        // Update all white piece available tiles
        for (let i = 0; i < Map.WHITE_PIECES.length; i++) {
            Map.WHITE_PIECES[i].update();
        }

        // If there is currently an active tile and that active tile has a piece on it, update the highlighted tiles so the new available tiles for each piece is updated on the screen
        GameManager.resetHighlightedTiles();
    }

    static isTilePosInBounds(tilePos) {
        // If the input tile pos is undefined, obviously there is no tile to get from its position :)
        if (tilePos == undefined) {
            return false;
        }

        // Check to make sure the tiles are within the bounds of the map
        if (!Utils.inRange(tilePos[0], 0, Map.GEN_LEVEL_WIDTH - 1) || !Utils.inRange(tilePos[1], 0, Map.GEN_LEVEL_HEIGHT - 1)) {
            return false;
        }

        return true;
    }

    static getTile(tilePos) {
        if (!Map.isTilePosInBounds(tilePos)) {
            return undefined;
        }

        return Map.TILE_POSITIONS[tilePos[0]][tilePos[1]];
    }

    static animateTilesOut(tiles) {
        for (let i = 0; i < tiles.length; i++) {
            let tile = Map.getTile(tiles[i].tilePos);
            if (tile != undefined) {
                let tileFromScreenPos = tile.screenPos;
                let tileToScreenPos = Utils.add2DArray(tile.screenPos, [0, Map.LEVEL_SCREEN_HEIGHT]);

                GameManager.addAnimatingSprite(new SpriteAnimation(tile, tileFromScreenPos, tileToScreenPos, 15, undefined, () => {
                    Map.TILE_LIST.splice(Map.TILE_LIST.indexOf(tile), 1);
                    Map.TILE_POSITIONS[tile.tilePos[0]][tile.tilePos[1]] = undefined;
                }, i * 4));
                if (tile.hasPiece()) {
                    let pieceToScreenPos = Map.convertTileToScreenPos(tile.tilePos, true);
                    let pieceFromScreenPos = Utils.add2DArray(pieceToScreenPos, [0, Map.LEVEL_SCREEN_HEIGHT]);
                    GameManager.addAnimatingSprite(new SpriteAnimation(tile.piece, pieceFromScreenPos, pieceToScreenPos, 15, undefined, () => {
                        tile.piece.destroy();
                        Map.update();
                    }, i * 4));
                }
            }
        }
    }

    static animateMapIn() {
        GameManager.resetHighlightedTiles();

        // for (let i = 0; i < Map.TILE_LIST.length; i++) {}

        let count = 0;
        for (let y = 0; y < Map.GEN_LEVEL_HEIGHT; y++) {
            for (let x = 0; x < Map.GEN_LEVEL_WIDTH; x++) {
                let tile = Map.getTile([x, y]);

                if (tile != undefined) {
                    let tileFromScreenPos = Utils.add2DArray(tile.screenPos, [0, Map.LEVEL_SCREEN_HEIGHT]);
                    let tileToScreenPos = tile.screenPos;

                    GameManager.addAnimatingSprite(new SpriteAnimation(tile, tileFromScreenPos, tileToScreenPos, 15, undefined, undefined, count));
                    if (tile.hasPiece()) {
                        let pieceToScreenPos = Map.convertTileToScreenPos(tile.tilePos, true);
                        let pieceFromScreenPos = Utils.add2DArray(pieceToScreenPos, [0, Map.LEVEL_SCREEN_HEIGHT]);
                        GameManager.addAnimatingSprite(new SpriteAnimation(tile.piece, pieceFromScreenPos, pieceToScreenPos, 15, undefined, undefined, count));
                    }

                    count += 4;
                }
            }
        }
    }

    static animateMapOut() {
        GameManager.resetHighlightedTiles();

        let count = 0;
        for (let y = Map.GEN_LEVEL_HEIGHT - 1; y >= 0; y--) {
            for (let x = 0; x < Map.GEN_LEVEL_WIDTH; x++) {
                let tile = Map.getTile([x, y]);

                if (tile != undefined) {
                    let tileFromScreenPos = tile.screenPos;
                    let tileToScreenPos = Utils.add2DArray(tile.screenPos, [0, Map.LEVEL_SCREEN_HEIGHT]);

                    GameManager.addAnimatingSprite(new SpriteAnimation(tile, tileFromScreenPos, tileToScreenPos, 15, undefined, undefined, count));
                    if (tile.hasPiece()) {
                        let pieceFromScreenPos = tile.piece.screenPos;
                        let pieceToScreenPos = Utils.add2DArray(tile.piece.screenPos, [0, Map.LEVEL_SCREEN_HEIGHT]);
                        GameManager.addAnimatingSprite(new SpriteAnimation(tile.piece, pieceFromScreenPos, pieceToScreenPos, 15, undefined, undefined, count));
                    }

                    count += 4;
                }
            }
        }
    }
}