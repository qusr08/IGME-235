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

    static PieceInfoType = {
        NONE: 0,
        ONE: 1,
        TWO: 2,
        THREE: 3,
        FOUR: 4,
        LOCKED: 5
    };

    constructor(pieceType, pieceColor, tilePos = undefined, scene = undefined) {
        super(ChessPiece._getSprite(pieceType, pieceColor));

        this.anchor.set(0.5);
        this.scale.set(Map.TILE_SIZE / Sprites.TEXTURE_SIZE);

        this.scene = scene;
        this.pieceType = pieceType;
        this.pieceColor = pieceColor;
        this.availableTiles = [];
        this.isInitialized = false;
        this.isWhite = (this.pieceColor == ChessPiece.PieceColor.WHITE);

        this.pieceInfoSprite = new PIXI.Sprite(undefined);
        this.pieceInfoSprite.scale.set(Map.TILE_SIZE / (Sprites.TEXTURE_SIZE * 6));
        this.pieceInfoSprite.anchor.set(1);

        this.setPieceInfoType(ChessPiece.PieceInfoType.NONE);

        if (scene != undefined) {
            scene.addChild(this);
            this.addChild(this.pieceInfoSprite);
        }

        if (this.isWhite) {
            Map.WHITE_PIECES.push(this);
        } else {
            Map.BLACK_PIECES.push(this);
        }

        this.setTilePos(tilePos);
    }

    setPieceInfoType(pieceInfoType) {
        this.pieceInfoType = pieceInfoType;

        // Update the info sprite
        this.pieceInfoSprite.texture = ChessPiece._getInfoSprite(this.pieceInfoType);
    }

    static _getInfoSprite(pieceInfoType) {
        switch (pieceInfoType) {
            case ChessPiece.PieceInfoType.ONE:
                return Sprites.NUMBER_1;
            case ChessPiece.PieceInfoType.TWO:
                return Sprites.NUMBER_2;
            case ChessPiece.PieceInfoType.THREE:
                return Sprites.NUMBER_3;
            case ChessPiece.PieceInfoType.FOUR:
                return Sprites.NUMBER_4;
            case ChessPiece.PieceInfoType.LOCKED:
                return Sprites.LOCK;
            default:
                return undefined;
        }
    }

    static _getSprite(pieceType, pieceColor) {
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
    }

    update() {
        // If this piece isn't initialized, meaning it's tile position hasn't been set yet, the don't update the available tiles
        if (!this.isInitialized) {
            return;
        }

        // Clear the currently available tiles
        this.availableTiles = [];

        // Add the current tile the piece is standing on
        this._tryAddTile(this.tilePos);

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
                this._tryAddTile(Utils.add2DArray(this.tilePos, [1, 2]));
                this._tryAddTile(Utils.add2DArray(this.tilePos, [-1, 2]));
                this._tryAddTile(Utils.add2DArray(this.tilePos, [2, 1]));
                this._tryAddTile(Utils.add2DArray(this.tilePos, [2, -1]));
                this._tryAddTile(Utils.add2DArray(this.tilePos, [1, -2]));
                this._tryAddTile(Utils.add2DArray(this.tilePos, [-1, -2]));
                this._tryAddTile(Utils.add2DArray(this.tilePos, [-2, 1]));
                this._tryAddTile(Utils.add2DArray(this.tilePos, [-2, -1]));

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
                this._tryAddTile(Utils.add2DArray(this.tilePos, [1, 1]));
                this._tryAddTile(Utils.add2DArray(this.tilePos, [1, 0]));
                this._tryAddTile(Utils.add2DArray(this.tilePos, [1, -1]));
                this._tryAddTile(Utils.add2DArray(this.tilePos, [0, -1]));
                this._tryAddTile(Utils.add2DArray(this.tilePos, [-1, -1]));
                this._tryAddTile(Utils.add2DArray(this.tilePos, [-1, 0]));
                this._tryAddTile(Utils.add2DArray(this.tilePos, [-1, 1]));
                this._tryAddTile(Utils.add2DArray(this.tilePos, [0, 1]));

                break;
        }
    }

    setTilePos(tilePos, setScreenPos = true) {
        if (this.tilePos != undefined) {
            let currTile = Map.getTile(this.tilePos);
            if (currTile != undefined) {
                currTile.setPiece(undefined);
            }
        }

        if (tilePos != undefined) {
            let toTile = Map.getTile(tilePos);
            if (toTile != undefined) {
                toTile.setPiece(this);
            }

            this.tilePos = tilePos;
            this.isInitialized = true;

            // Update the piece's screen position
            if (setScreenPos) {
                this.setScreenPos(Map.convertTileToScreenPos(tilePos, true));
            }

            // Update available positions for each piece
            Map.update();
        }
    }

    setScreenPos(screenPos) {
        this.screenPos = screenPos;
        this.x = screenPos[0];
        this.y = screenPos[1];
    }

    _addTilesInLine(additiveArray) {
        let tempTilePos = this.tilePos;
        do {
            tempTilePos = Utils.add2DArray(tempTilePos, additiveArray);
        } while (this._tryAddTile(tempTilePos));
    }

    _tryAddTile(tilePos) {
        // Get the tile object
        let tile = Map.getTile(tilePos);

        // If the tile is available, meaning it doesnt have a piece on it and it isnt undefined, then add it to the available tiles array for this piece
        // Also, if the piece that it is on currently has an opposing piece on it, that counts as an available tile but nothing past that
        if (tile != undefined) {
            if (!tile.hasPiece()) {
                // Add the tile to the array
                this.availableTiles.push(tile);

                return true;
            } else if (tile.piece.pieceColor != this.pieceColor) {
                // Add the tile to the array
                this.availableTiles.push(tile);

                return false;
            }
        }

        return false;
    }
}

class BlackChessPiece extends ChessPiece {
    constructor(pieceType, turns, tilePos = undefined, scene = undefined) {
        super(pieceType, ChessPiece.PieceColor.BLACK, tilePos, scene);

        this.setTurns(turns);
    }

    subtractTurn() {
        this.setTurns(this.turns - 1);
    }

    setTurns(turns) {
        this.turns = turns;
        this.setPieceInfoType(turns);
    }

    destroy() {
        this.scene.removeChild(this);
        this.scene.removeChild(this.pieceInfoSprite);

        Map.BLACK_PIECES.splice(Map.BLACK_PIECES.indexOf(this), 1);
    }
}

class WhiteChessPiece extends ChessPiece {
    constructor(pieceType, tilePos = undefined, scene = undefined) {
        super(pieceType, ChessPiece.PieceColor.WHITE, tilePos, scene);
    }

    destroy() {
        this.scene.removeChild(this);
        this.scene.removeChild(this.pieceInfoSprite);

        Map.WHITE_PIECES.splice(Map.WHITE_PIECES.indexOf(this), 1);
    }
}