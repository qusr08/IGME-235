class Tile extends PIXI.Sprite {
    static TileType = {
        DARK: 0,
        LIGHT: 1
    };

    constructor(tileType, tilePos, scene = undefined) {
        super(Tile._getSprite(tileType));

        this.scale.set(GameManager.SPRITE_SCALE);

        this.tilePos = tilePos;
        this.tileType = tileType;
        this.scene = scene;

        this.setPiece(undefined);
        this.setScreenPos(Map.convertTileToScreenPos(tilePos));

        // Add interaction
        this.interactive = true;
        this.mouseover = this._mouseEnter;
        this.mouseout = this._mouseExit;
        this.click = this._mouseClick;

        if (scene != undefined) {
            scene.addChild(this);
        }
    }

    setScreenPos(screenPos) {
        this.screenPos = screenPos;
        this.x = screenPos[0];
        this.y = screenPos[1];
    }

    static _getSprite(tileType) {
        switch (tileType) {
            case Tile.TileType.DARK:
                return Sprites.TILE_DARK_BASE;
            case Tile.TileType.LIGHT:
                return Sprites.TILE_LIGHT_BASE;
        }
    }

    hasPiece() {
        return (this.piece != undefined);
    }

    setPiece(piece) {
        if (piece != undefined && this.hasPiece()) {
            //console.log("> Piece taken!");

            this.piece.destroy();
        }

        this.piece = piece;
    }

    update() {
        // Make sure this tile sits above the tile behind it
        let behindTile = Map.getTile(Utils.add2DArray(this.tilePos, [0, -1]));
        this.bringInFrontOf(behindTile);

        // When a piece is set to this tile, have the piece be put in the spot right above the tile. This way the piece appears above the tile and behind all other tiles closer to the camera
        if (this.piece != undefined) {
            this.piece.bringInFrontOf(this);
        }
    }

    _mouseEnter(e) {
        // Set the tint of this current tile
        this.tint = HOVER_TINT;

        if (GameManager.TURNSTATE == GameManager.TurnState.PLAYER) {
            // If there is not a currently selected tile, check to see if there is a piece on this tile
            if (GameManager.ACTIVE_PIECE == undefined) {
                // If there is a piece, then highlight the piece's available moves
                if (this.hasPiece()) {
                    GameManager.setHighlightedTiles(this.piece.availableTiles);
                }
            } else {
                // If there is a selected tile, check to see if this tile is either the selected tile or a tile that the selected piece could move to
                if (this.piece == GameManager.ACTIVE_PIECE || GameManager.ACTIVE_PIECE.availableTiles.includes(this)) {
                    this.tint = SELECT_TINT;
                }
            }
        }
    }

    _mouseExit(e) {
        // Reset the tint of this current tile
        this.tint = 0xFFFFFF;

        if (GameManager.TURNSTATE == GameManager.TurnState.PLAYER) {
            // If there is not a currently selected tile, check to see if there is a piece on this tile
            if (GameManager.ACTIVE_PIECE == undefined) {
                // If there is a piece, then make sure to reset the tiles that involve is available moves since the mouse is now moving off of this tile
                if (this.hasPiece()) {
                    GameManager.resetHighlightedTiles();
                }
            } else {
                // If there is a selected tile, check to see if this tile is the selected tile or a available tile. Each case will result in a different color
                if (this.piece == GameManager.ACTIVE_PIECE) {
                    this.tint = SELECT_TINT;
                } else if (GameManager.ACTIVE_PIECE.availableTiles.includes(this)) {
                    this.tint = AVAIL_TINT;
                }
            }
        }
    }

    _mouseClick(e) {
        if (GameManager.TURNSTATE == GameManager.TurnState.PLAYER) {
            // If there is a piece currently being moved and the mouse is clicked on this tile
            if (GameManager.ACTIVE_PIECE != undefined && GameManager.ACTIVE_PIECE.isWhite) {
                // As long as this tile is included within the moving piece's available tiles, place the piece on this tile
                if (GameManager.ACTIVE_PIECE.availableTiles.includes(this)) {
                    // Reset the tinted tiles
                    GameManager.resetAllTiles();

                    // Move the piece to this tile
                    GameManager.ACTIVE_PIECE.setTilePos(this.tilePos);

                    // If the piece that was just moved was a white piece, then the player just used their turn
                    GameManager.setTurnState(GameManager.TurnState.ENEMY);

                    GameManager.setActivePiece(undefined);
                } else if (Map.getTile(GameManager.ACTIVE_PIECE.tilePos) == this) {
                    // Move the piece to this tile
                    GameManager.ACTIVE_PIECE.setTilePos(this.tilePos);

                    GameManager.setActivePiece(undefined);
                }
            } else if (this.hasPiece() && this.piece.isWhite) {
                // If this tile is clicked and there is a piece on it, and there is no currently moving piece, then set this tile's piece to the moving piece
                GameManager.setActivePiece(this.piece);
            }

            // Update the tinted tiles on the board
            this._mouseEnter();
        }
    }
}