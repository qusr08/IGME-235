class GameManager {
    static GameState = {
        MENU: 0,
        GAME_SETUP: 1,
        GAME: 2,
        TUTORIAL: 3
    }

    static TurnState = {
        ENEMY: 0,
        WAITING: 1,
        PLAYER: 2,
        WIN: 3,
        LOSE: 4,
        PAUSED: 5
    }

    static GAMESTATE = GameManager.GameState.MENU;
    static TURNSTATE = GameManager.GameState.WAITING;
    static APPLICATION = undefined;
    static GAME_SCENE = undefined;
    static MENU_SCENE = undefined;
    static TUTORIAL_SCENE = undefined;

    static MOUSE_POSITION = [0, 0];
    static ANIMATING_PIECES = [];
    static ANIMATING_TILES = [];
    static PARTY_PIECE_TYPES = [];

    static ACTIVE_PIECE = undefined;
    static ACTIVE_TILE = undefined;
    static HIGHLIGHTED_TILES = [];

    static LEVEL_NUMBER = 1;
    static _LEVEL_NUMBER_TEXT = undefined;
    static _GAME_OVER_TEXT = undefined;

    static _PLAY_BUTTON = undefined;
    static _TUTORIAL_BUTTON = undefined;
    static _BACK_BUTTON = undefined;

    static _GAME_OVER_SPRITE = undefined;
    static _TITLE_SPRITE = undefined;
    static _TUTORIAL_SPRITE = undefined;

    static appSetup() {
        console.log("Setting up application ...");

        GameManager._LEVEL_NUMBER_TEXT = new PIXI.Text("Level ###");
        GameManager._LEVEL_NUMBER_TEXT.style = TEXT_STYLE;
        GameManager._LEVEL_NUMBER_TEXT.x = 10;
        GameManager._LEVEL_NUMBER_TEXT.y = 10;
        GameManager.GAME_SCENE.addChild(GameManager._LEVEL_NUMBER_TEXT);

        GameManager._GAME_OVER_TEXT = new PIXI.Text("### levels survived");
        GameManager._GAME_OVER_TEXT.style = TEXT_STYLE;
        GameManager._GAME_OVER_TEXT.anchor.set(0.5);
        GameManager._GAME_OVER_TEXT.x = Map.SCENE_WIDTH / 2;
        GameManager._GAME_OVER_TEXT.y = Map.SCENE_HEIGHT / 2;
        GameManager.GAME_SCENE.addChild(GameManager._GAME_OVER_TEXT);

        GameManager._PLAY_BUTTON = new PIXI.Sprite(Sprites.PLAY_BUTTON);
        GameManager._PLAY_BUTTON.scale.set(Map.TILE_SIZE / Sprites.TEXTURE_SIZE);
        GameManager._PLAY_BUTTON.anchor.set(0.5);
        GameManager._PLAY_BUTTON.interactive = true;
        GameManager._PLAY_BUTTON.buttonMode = true;
        GameManager._PLAY_BUTTON.on("pointerup", () => GameManager.setGameState(GameManager.GameState.GAME_SETUP));
        GameManager.MENU_SCENE.addChild(GameManager._PLAY_BUTTON);

        GameManager._PLAY_BUTTON = new PIXI.Sprite(Sprites.PLAY_BUTTON);
        GameManager._PLAY_BUTTON.scale.set(Map.TILE_SIZE / Sprites.TEXTURE_SIZE);
        GameManager._PLAY_BUTTON.anchor.set(0.5);
        GameManager._PLAY_BUTTON.interactive = true;
        GameManager._PLAY_BUTTON.buttonMode = true;
        GameManager._PLAY_BUTTON.on("pointerup", () => GameManager.setGameState(GameManager.GameState.GAME_SETUP));
        GameManager.MENU_SCENE.addChild(GameManager._PLAY_BUTTON);

        GameManager._GAME_OVER_SPRITE = Sprites.GAMEOVER;
        GameManager.GAME_SCENE.addChild(this._GAME_OVER_SPRITE);
        GameManager._TITLE_SPRITE = Sprites.TITLE;
        GameManager.MENU_SCENE.addChild(this._TITLE_SPRITE);
        GameManager._TUTORIAL_SPRITE = Sprites.TUTORIAL;
        GameManager.TUTORIAL_SCENE.addChild(this._TUTORIAL_SPRITE);
    }

    static gameSetup() {
        GameManager.PARTY_PIECE_TYPES = [ChessPiece.PieceType.QUEEN];
        GameManager.LEVEL_NUMBER = 1;
    }

    static update() {
        switch (GameManager.GAMESTATE) {
            case GameManager.GameState.MENU:
                break;
            case GameManager.GameState.GAME:
                // Update current moving piece position to follow mouse
                if (GameManager.ACTIVE_PIECE != undefined) {
                    GameManager.ACTIVE_PIECE.x = GameManager.MOUSE_POSITION[0];
                    GameManager.ACTIVE_PIECE.y = GameManager.MOUSE_POSITION[1];
                }

                switch (GameManager.TURNSTATE) {
                    case GameManager.TurnState.ENEMY:
                        break;
                    case GameManager.TurnState.WAITING:
                        if (GameManager.ANIMATING_PIECES.length == 0 && GameManager.ANIMATING_TILES.length == 0) {
                            GameManager.setTurnState(GameManager.TurnState.PLAYER);
                        }

                        break;
                    case GameManager.TurnState.PLAYER:
                        break;
                }

                break;
            case GameManager.GameState.TUTORIAL:
                break;
        }

        // Update all active piece animations
        // But make sure to only animate the pieces one at a time
        if (GameManager.ANIMATING_PIECES.length > 0) {
            let index = GameManager.ANIMATING_PIECES.length - 1;
            GameManager.ANIMATING_PIECES[index].update();

            if (GameManager.ANIMATING_PIECES[index].isCompleted) {
                GameManager.ANIMATING_PIECES.splice(index, 1);
            }
        }

        // Update all animating tiles
        for (let i = GameManager.ANIMATING_TILES.length - 1; i >= 0; i--) {
            GameManager.ANIMATING_TILES[i].update();

            if (GameManager.ANIMATING_TILES[i].isCompleted) {
                GameManager.ANIMATING_TILES.splice(i, 1);
            }

            if (GameManager.ANIMATING_TILES.length == 0) {
                if (GameManager.TURNSTATE == GameManager.TurnState.WIN) {
                    GameManager._incrementLevelNumber();
                    GameManager.setGameState(GameManager.GameState.GAME);
                } else if (GameManager.TURNSTATE == GameManager.TurnState.LOSE) {
                    GameManager.setGameState(GameManager.GameState.MENU);
                }
            }
        }
    }

    static _incrementLevelNumber() {
        GameManager.LEVEL_NUMBER += 1;
        GameManager._LEVEL_NUMBER_TEXT.text = `Level ${GameManager.LEVEL_NUMBER}`;
    }

    static setGameState(gameState) {
        GameManager.GAMESTATE = gameState;

        switch (GameManager.GAMESTATE) {
            case GameManager.GameState.MENU:
                break;
            case GameManager.GameState.GAME_SETUP:
                GameManager.gameSetup();

                GameManager.setGameState(GameManager.GameState.GAME);

                break;
            case GameManager.GameState.GAME:
                Map.generateLevel(GameManager.GAME_SCENE);
                Map.animateMapIn();

                GameManager.setTurnState(GameManager.TurnState.WAITING);

                break;
        }
    }

    static setTurnState(turnState) {
        GameManager.TURNSTATE = turnState;
        // Map.update();

        switch (GameManager.TURNSTATE) {
            case GameManager.TurnState.ENEMY:
                console.log("> Enemy's Turn!");

                // An array to track which spaces each piece is moving to 
                let enemyMoveToTiles = [];

                // Loop through all the black pieces to see which ones need to animate
                for (let i = 0; i < Map.BLACK_PIECES.length; i++) {
                    let currPiece = Map.BLACK_PIECES[i];
                    currPiece.subtractTurn();

                    // If the piece's turns until it moves is 0, then it should move this turn
                    if (currPiece.turns == 0 && currPiece.availableTiles.length > 0) {
                        let pieceToTilePos = undefined;

                        // Check to see if there is a tile with a white piece on it. If so, move to that tile
                        for (let j = 0; j < currPiece.availableTiles.length; j++) {
                            // Get a tile that is available to the current piece
                            let tile = currPiece.availableTiles[j];

                            // If that tile has a white piece on it, then move this current piece to that tile
                            if (tile.hasPiece() && tile.piece.isWhite && !enemyMoveToTiles.includes(tile.tilePos)) {
                                pieceToTilePos = tile.tilePos;

                                break;
                            }
                        }

                        // Get a random tile for that piece to move to if there is no white piece for this current piece to capture
                        if (pieceToTilePos == undefined) {
                            let tile = Utils.choose(currPiece.availableTiles);
                            if (tile != undefined && !enemyMoveToTiles.includes(tile.tilePos)) {
                                pieceToTilePos = tile.tilePos;
                            }
                        }

                        // Move the piece to that tile, as long as there is a tile for the piece to move to
                        // Also check to make sure another piece isn't moving to the same space
                        if (pieceToTilePos != undefined) {
                            enemyMoveToTiles.push(pieceToTilePos);

                            GameManager.addAnimatingPiece(new SpriteAnimation(currPiece, currPiece.screenPos, Map.convertTileToScreenPos(pieceToTilePos, true), 6, () => {
                                GameManager.setActivePiece(currPiece);
                                currPiece.setPieceInfoType(ChessPiece.PieceInfoType.NONE);
                            }, () => {
                                currPiece.setTilePos(pieceToTilePos, false);
                                GameManager.setActivePiece(undefined);
                                currPiece.setTurns(4);
                            }));
                        } else {
                            // If the piece can't move, then just reset it's turns
                            currPiece.setTurns(4);
                        }
                    }
                }

                GameManager.setTurnState(GameManager.TurnState.WAITING);

                break;
            case GameManager.TurnState.WAITING:

                break;
            case GameManager.TurnState.PLAYER:
                console.log("> Player's Turn!");

                // If all the black pieces are gone, you win
                if (Map.BLACK_PIECES.length == 0) {
                    GameManager.setTurnState(GameManager.TurnState.WIN);
                }

                // If all the white pieces are gone, you lose
                if (Map.WHITE_PIECES.length == 0) {
                    GameManager.setTurnState(GameManager.TurnState.LOSE);
                }

                break;
            case GameManager.TurnState.WIN:
                Map.animateMapOut();

                break;
            case GameManager.TurnState.LOSE:
                Map.animateMapOut();

                break;
            case GameManager.TurnState.PAUSED:

                break;
        }
    }

    static addAnimatingPiece(animation) {
        GameManager.ANIMATING_PIECES.push(animation);
    }

    static addAnimatingTile(animation) {
        GameManager.ANIMATING_TILES.push(animation);
    }

    static setHighlightedTiles(highlightedTiles) {
        GameManager.HIGHLIGHTED_TILES = highlightedTiles;

        for (let i = 0; i < GameManager.HIGHLIGHTED_TILES.length; i++) {
            GameManager.HIGHLIGHTED_TILES[i].tint = AVAIL_TINT;
        }
    }

    static resetHighlightedTiles() {
        for (let i = 0; i < GameManager.HIGHLIGHTED_TILES.length; i++) {
            GameManager.HIGHLIGHTED_TILES[i].tint = 0xFFFFFF;
        }

        GameManager.HIGHLIGHTED_TILES = [];
    }

    static setActivePiece(piece) {
        GameManager.ACTIVE_PIECE = piece;

        if (GameManager.ACTIVE_PIECE != undefined) {
            GameManager.ACTIVE_PIECE.bringToFront();
        }
    }

    static setActiveTile(tile) {
        // if (GameManager.ANIMATING_TILES.length > 0 || GameManager.ANIMATING_PIECES.length > 0) {
        //     GameManager.ACTIVE_TILE = undefined;
        // } else {
        // }
        GameManager.ACTIVE_TILE = tile;
    }
}