class GameManager {
    static GameState = {
        MENU: 0,
        GAME_SETUP: 1,
        GAME: 2,
        TUTORIAL_1: 3,
        TUTORIAL_2: 4,
        CREDITS: 5
    };

    static TurnState = {
        ENEMY: 0,
        WAITING: 1,
        PLAYER: 2,
        WIN: 3,
        LOSE: 4
    };

    static DifficultyType = {
        CLASSIC: 0,
        INSANE: 1
    };

    // The size of the game window in pixel
    static SCENE_WIDTH = 1280;
    static SCENE_HEIGHT = 720;
    static SPRITE_SCALE = 4;

    static GAMESTATE = GameManager.GameState.MENU;
    static TURNSTATE = GameManager.GameState.WAITING;

    static APPLICATION = undefined;
    static GAME_SCENE = undefined;
    static MENU_SCENE = undefined;
    static TUTORIAL_SCENE = undefined;
    static CREDITS_SCENE = undefined;

    static MOUSE_POSITION = [0, 0];
    static DIFFICULTY_TYPE = GameManager.DifficultyType.CLASSIC;
    static DIFFICULTY_MOD = 1;

    static ANIMATING_PIECES = [];
    static ANIMATING_SPRITES = [];
    static _ANIMATION_CHECK_INDEX = 0;

    static LEVEL_NUMBER = 1;
    static PIECES_CAPTURED = 0;
    static TOTAL_MOVES = 0;
    static ACTIVE_PIECE = undefined;
    static PARTY_PIECE_TYPES = [];
    static HIGHLIGHTED_TILES = [];

    static MOVE_SOUND_EFFECTS = [];

    static _LEVEL_NUMBER_TEXT = undefined;
    static _TURN_INDICATOR_TEXT = undefined;
    static _PIECE_TIP_TEXT = undefined;
    static _GAME_OVER_TEXT = undefined;
    static _VERSION_TEXT = undefined;

    static _TITLE_SPRITE = undefined;
    static _PLAY_CLASSIC_BUTTON = undefined;
    static _PLAY_INSANE_BUTTON = undefined;
    static _MENU_BACKGROUND = undefined;
    static _GAME_BACKGROUND = undefined;

    static _TUTORIAL_BUTTON = undefined;
    static _TUTORIAL_NEXT_BUTTON = undefined;
    static _TUTORIAL_PREVIOUS_BUTTON = undefined;
    static _TUTORIAL_BACK_BUTTON = undefined;
    static _TUTORIAL_BACKGROUND_1 = undefined;
    static _TUTORIAL_BACKGROUND_2 = undefined;

    static _CREDITS_BUTTON = undefined;
    static _CREDITS_BACK_BUTTON = undefined;
    static _CREDITS_BACKGROUND = undefined;

    static _GAME_OVER_SPRITE = undefined;
    static _GAME_OVER_BACK_BUTTON = undefined;


    static appSetup() {
        //console.log("Setting up application ...");

        // Add interactions
        GameManager.APPLICATION.stage.interactive = true;
        GameManager.APPLICATION.stage.on("pointermove", (e) => {
            // Update mouse position variable
            let data = e.data.global;
            GameManager.MOUSE_POSITION = [data.x, data.y];
        });

        GameManager.GAME_SCENE = GameManager._createScene();
        GameManager.MENU_SCENE = GameManager._createScene();
        GameManager.TUTORIAL_SCENE = GameManager._createScene();
        GameManager.CREDITS_SCENE = GameManager._createScene();

        // Load sprites on spritesheets into variables
        //console.log("Loading Sprites ...");
        Sprites.loadSprites();

        GameManager._TUTORIAL_BACKGROUND_1 = GameManager._createSprite(Sprites.TUTORIAL_BACKGROUND_1, 1, [0, 0], [0, 0], GameManager.TUTORIAL_SCENE);
        GameManager._TUTORIAL_BACKGROUND_2 = GameManager._createSprite(Sprites.TUTORIAL_BACKGROUND_2, 1, [0, 0], [0, 0], GameManager.TUTORIAL_SCENE);
        GameManager._CREDITS_BACKGROUND = GameManager._createSprite(Sprites.CREDITS_BACKGROUND, 1, [0, 0], [0, 0], GameManager.CREDITS_SCENE);
        GameManager._MENU_BACKGROUND = GameManager._createSprite(Sprites.GAME_BACKGROUND, 1, [0, 0], [0, 0], GameManager.MENU_SCENE);
        GameManager._GAME_BACKGROUND = GameManager._createSprite(Sprites.GAME_BACKGROUND, 1, [0, 0], [0, 0], GameManager.GAME_SCENE);

        GameManager._GAME_OVER_SPRITE = GameManager._createSprite(Sprites.GAMEOVER, 2 * GameManager.SPRITE_SCALE, [0.5, 0.5], [GameManager.SCENE_WIDTH / 2, GameManager.SCENE_HEIGHT / 4], GameManager.GAME_SCENE);
        GameManager._TITLE_SPRITE = GameManager._createSprite(Sprites.TITLE, 2 * GameManager.SPRITE_SCALE, [0.5, 0.5], [GameManager.SCENE_WIDTH / 2, GameManager.SCENE_HEIGHT / 4], GameManager.MENU_SCENE);

        GameManager._LEVEL_NUMBER_TEXT = GameManager._createText("", [0, 0], [10, 10], GameManager.GAME_SCENE);
        GameManager._TURN_INDICATOR_TEXT = GameManager._createText("", [0.5, 0], [GameManager.SCENE_WIDTH / 2, 10], GameManager.GAME_SCENE);
        // GameManager._PIECE_TIP_TEXT
        GameManager._GAME_OVER_TEXT = GameManager._createText("", [0.5, 0.5], [GameManager.SCENE_WIDTH / 2, GameManager.SCENE_HEIGHT / 2], GameManager.GAME_SCENE);
        GameManager._VERSION_TEXT = GameManager._createText("made by frank alfano   |   v1.1.2", [0.5, 1], [GameManager.SCENE_WIDTH / 2, GameManager.SCENE_HEIGHT - 10], GameManager.MENU_SCENE);

        GameManager._PLAY_CLASSIC_BUTTON = GameManager._createButton(Sprites.PLAY_CLASSIC_BUTTON, GameManager.SPRITE_SCALE, [0.5, 0.5], [GameManager.SCENE_WIDTH / 3, GameManager.SCENE_HEIGHT / 2], GameManager.MENU_SCENE, () => {
            GameManager.setDifficultyType(GameManager.DifficultyType.CLASSIC);
            GameManager.setGameState(GameManager.GameState.GAME_SETUP);
        });
        GameManager._PLAY_INSANE_BUTTON = GameManager._createButton(Sprites.PLAY_INSANE_BUTTON, GameManager.SPRITE_SCALE, [0.5, 0.5], [GameManager.SCENE_WIDTH / 3 * 2, GameManager.SCENE_HEIGHT / 2], GameManager.MENU_SCENE, () => {
            GameManager.setDifficultyType(GameManager.DifficultyType.INSANE);
            GameManager.setGameState(GameManager.GameState.GAME_SETUP);
        });
        GameManager._TUTORIAL_BUTTON = GameManager._createButton(Sprites.TUTORIAL_BUTTON, GameManager.SPRITE_SCALE, [0.5, 0.5], [GameManager.SCENE_WIDTH / 3, GameManager.SCENE_HEIGHT / 4 * 3], GameManager.MENU_SCENE, () => {
            GameManager.setGameState(GameManager.GameState.TUTORIAL_1);
            GameManager._TUTORIAL_BACKGROUND_1.visible = true;
            GameManager._TUTORIAL_BACKGROUND_2.visible = false;
        });
        GameManager._CREDITS_BUTTON = GameManager._createButton(Sprites.CREDITS_BUTTON, GameManager.SPRITE_SCALE, [0.5, 0.5], [GameManager.SCENE_WIDTH / 3 * 2, GameManager.SCENE_HEIGHT / 4 * 3], GameManager.MENU_SCENE, () => { GameManager.setGameState(GameManager.GameState.CREDITS); });

        GameManager._TUTORIAL_NEXT_BUTTON = GameManager._createButton(Sprites.NEXT_BUTTON, GameManager.SPRITE_SCALE, [0.5, 0], [GameManager.SCENE_WIDTH / 3 * 2, 10], GameManager.TUTORIAL_SCENE, () => {
            GameManager._TUTORIAL_BACKGROUND_1.visible = false;
            GameManager._TUTORIAL_BACKGROUND_2.visible = true;
        });
        GameManager._TUTORIAL_PREVIOUS_BUTTON = GameManager._createButton(Sprites.PREVIOUS_BUTTON, GameManager.SPRITE_SCALE, [0.5, 0], [GameManager.SCENE_WIDTH / 3, 10], GameManager.TUTORIAL_SCENE, () => {
            GameManager._TUTORIAL_BACKGROUND_1.visible = true;
            GameManager._TUTORIAL_BACKGROUND_2.visible = false;
        });

        GameManager._TUTORIAL_BACK_BUTTON = GameManager._createButton(Sprites.BACK_BUTTON, GameManager.SPRITE_SCALE, [0, 0], [10, 10], GameManager.TUTORIAL_SCENE, () => { GameManager.setGameState(GameManager.GameState.MENU); });
        GameManager._CREDITS_BACK_BUTTON = GameManager._createButton(Sprites.BACK_BUTTON, GameManager.SPRITE_SCALE, [0, 0], [10, 10], GameManager.CREDITS_SCENE, () => { GameManager.setGameState(GameManager.GameState.MENU); });
        GameManager._GAME_OVER_BACK_BUTTON = GameManager._createButton(Sprites.BACK_BUTTON, GameManager.SPRITE_SCALE, [0.5, 0.5], [GameManager.SCENE_WIDTH / 2, GameManager.SCENE_HEIGHT / 3 * 2], GameManager.GAME_SCENE, () => { GameManager.setGameState(GameManager.GameState.MENU); });

        GameManager.MOVE_SOUND_EFFECTS.push(new Howl({ src: ["media/move-sound-1.wav"] }));
        GameManager.MOVE_SOUND_EFFECTS.push(new Howl({ src: ["media/move-sound-2.wav"] }));
        GameManager.MOVE_SOUND_EFFECTS.push(new Howl({ src: ["media/move-sound-3.wav"] }));
    }

    static gameSetup() {
        GameManager.PARTY_PIECE_TYPES = [ChessPiece.PieceType.QUEEN];

        GameManager.LEVEL_NUMBER = 0;
        GameManager.PIECES_CAPTURED = 0;
        GameManager.TOTAL_MOVES = 0;

        GameManager._incrementLevelNumber();
    }

    static update() {
        switch (GameManager.GAMESTATE) {
            case GameManager.GameState.GAME:
                // Update current moving piece position to follow mouse
                if (GameManager.ACTIVE_PIECE != undefined) {
                    GameManager.ACTIVE_PIECE.x = GameManager.MOUSE_POSITION[0];
                    GameManager.ACTIVE_PIECE.y = GameManager.MOUSE_POSITION[1];
                }

                switch (GameManager.TURNSTATE) {
                    case GameManager.TurnState.WAITING:
                        if (GameManager.ANIMATING_PIECES.length == 0 && GameManager.ANIMATING_SPRITES.length == 0) {
                            if (GameManager._ANIMATION_CHECK_INDEX >= Map.BLACK_PIECES.length) {
                                GameManager.setTurnState(GameManager.TurnState.PLAYER);
                            } else {
                                GameManager.setTurnState(GameManager.TurnState.ENEMY);
                            }
                        }

                        break;
                }

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
        for (let i = GameManager.ANIMATING_SPRITES.length - 1; i >= 0; i--) {
            GameManager.ANIMATING_SPRITES[i].update();

            if (GameManager.ANIMATING_SPRITES[i].isCompleted) {
                GameManager.ANIMATING_SPRITES.splice(i, 1);
            }

            if (GameManager.ANIMATING_SPRITES.length == 0) {
                if (GameManager.TURNSTATE == GameManager.TurnState.WIN) {
                    GameManager._incrementLevelNumber();
                    GameManager.setGameState(GameManager.GameState.GAME);
                }
            }
        }
    }

    static setDifficultyType(difficultyType) {
        GameManager.DIFFICULTY_TYPE = difficultyType;

        switch (difficultyType) {
            case GameManager.DifficultyType.CLASSIC:
                GameManager.DIFFICULTY_MOD = 1;

                break;
            case GameManager.DifficultyType.INSANE:
                GameManager.DIFFICULTY_MOD = 5;

                break;
        }
    }

    static setGameState(gameState) {
        GameManager.GAMESTATE = gameState;

        GameManager._updateUIElements();

        switch (GameManager.GAMESTATE) {
            case GameManager.GameState.GAME_SETUP:
                GameManager.gameSetup();

                GameManager.setGameState(GameManager.GameState.GAME);

                break;
            case GameManager.GameState.GAME:
                Map.generateLevel(GameManager.DIFFICULTY_MOD, GameManager.GAME_SCENE);
                Map.animateMapIn();

                GameManager._ANIMATION_CHECK_INDEX = Map.BLACK_PIECES.length;
                GameManager.setTurnState(GameManager.TurnState.WAITING);

                break;
        }
    }

    static setTurnState(turnState) {
        GameManager.TURNSTATE = turnState;

        Map.update();
        GameManager._updateUIElements();

        switch (GameManager.TURNSTATE) {
            case GameManager.TurnState.ENEMY:
                //console.log("> Enemy's Turn!");

                GameManager._TURN_INDICATOR_TEXT.text = "Enemy's Turn";

                for (; GameManager._ANIMATION_CHECK_INDEX < Map.BLACK_PIECES.length; GameManager._ANIMATION_CHECK_INDEX++) {
                    let currPiece = Map.BLACK_PIECES[GameManager._ANIMATION_CHECK_INDEX];
                    currPiece.subtractTurn();

                    // If the piece's turns until it moves is 0, then it should move this turn
                    if (currPiece.turns == 0) {
                        if (currPiece.availableTiles.length > 0) {
                            let pieceToTilePos = undefined;

                            // Check to see if there is a tile with a white piece on it. If so, move to that tile
                            for (let i = 0; i < currPiece.availableTiles.length; i++) {
                                // Get a tile that is available to the current piece
                                let tile = currPiece.availableTiles[i];

                                // If that tile has a white piece on it, then move this current piece to that tile
                                if (tile.hasPiece() && tile.piece.isWhite) {
                                    pieceToTilePos = tile.tilePos;

                                    break;
                                }
                            }

                            // Get a random tile for that piece to move to if there is no white piece for this current piece to capture
                            if (pieceToTilePos == undefined) {
                                let tile = Utils.choose(currPiece.availableTiles);
                                if (tile != undefined) {
                                    pieceToTilePos = tile.tilePos;
                                }
                            }

                            // Move the piece to that tile, as long as there is a tile for the piece to move to
                            // Also check to make sure another piece isn't moving to the same space
                            if (pieceToTilePos != undefined) {
                                GameManager.addAnimatingPiece(new SpriteAnimation(currPiece, currPiece.screenPos, Map.convertTileToScreenPos(pieceToTilePos, true), 6, () => {
                                    GameManager.setActivePiece(currPiece);
                                    currPiece.setPieceTurnType(ChessPiece.PieceTurnType.NONE);
                                }, () => {
                                    currPiece.setTilePos(pieceToTilePos, false);
                                    GameManager.setActivePiece(undefined);
                                    currPiece.setTurns(4);
                                }));

                                GameManager._ANIMATION_CHECK_INDEX++;
                                break;
                            }
                        }

                        // If the piece can't move, then keep it's turns at 1 until it can
                        currPiece.setTurns(1);
                    }
                }

                GameManager.setTurnState(GameManager.TurnState.WAITING);

                break;
            case GameManager.TurnState.PLAYER:
                // console.log("> Player's Turn!");
                GameManager._TURN_INDICATOR_TEXT.text = "Player's Turn";

                // If all the black pieces are gone, you win
                if (Map.BLACK_PIECES.length == 0) {
                    GameManager.setTurnState(GameManager.TurnState.WIN);
                }

                // If all the white pieces are gone, you lose
                if (Map.WHITE_PIECES.length == 0) {
                    GameManager.setTurnState(GameManager.TurnState.LOSE);
                }

                GameManager._ANIMATION_CHECK_INDEX = 0;

                break;
            case GameManager.TurnState.WIN:
                Map.animateMapOut();

                break;
            case GameManager.TurnState.LOSE:
                GameManager._GAME_OVER_SPRITE.bringToFront();
                GameManager._GAME_OVER_BACK_BUTTON.bringToFront();
                GameManager._GAME_OVER_TEXT.bringToFront();
                GameManager._GAME_OVER_TEXT.text = `${GameManager.LEVEL_NUMBER - 1} levels survived`;

                Map.animateMapOut();

                break;
        }
    }

    static addAnimatingPiece(animation) {
        GameManager.ANIMATING_PIECES.push(animation);
    }

    static addAnimatingSprite(animation) {
        GameManager.ANIMATING_SPRITES.push(animation);
    }

    static setHighlightedTiles(highlightedTiles) {
        GameManager.resetHighlightedTiles();

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

    static resetAllTiles() {
        for (let i = Map.TILE_LIST.length - 1; i >= 0; i--) {
            let tile = Map.getTile(Map.TILE_LIST[i]);
            if (tile != undefined) {
                tile.tint = 0xFFFFFF;
            }
        }
    }

    static setActivePiece(piece) {
        GameManager.ACTIVE_PIECE = piece;

        if (GameManager.ACTIVE_PIECE != undefined) {
            GameManager.ACTIVE_PIECE.bringToFront();

            if (GameManager.ACTIVE_PIECE.isWhite) {
                GameManager.setHighlightedTiles(GameManager.ACTIVE_PIECE.availableTiles);
            }
        }
    }

    static _incrementLevelNumber() {
        GameManager.LEVEL_NUMBER++;
        GameManager._LEVEL_NUMBER_TEXT.text = `Level ${GameManager.LEVEL_NUMBER}`;

        GameManager.DIFFICULTY_MOD += 0.5;
    }

    static _updateUIElements() {
        GameManager.GAME_SCENE.visible = (GameManager.GAMESTATE == GameManager.GameState.GAME_SETUP || GameManager.GAMESTATE == GameManager.GameState.GAME);
        GameManager.MENU_SCENE.visible = (GameManager.GAMESTATE == GameManager.GameState.MENU);
        GameManager.TUTORIAL_SCENE.visible = (GameManager.GAMESTATE == GameManager.GameState.TUTORIAL_1 || GameManager.GAMESTATE == GameManager.GameState.TUTORIAL_2);
        GameManager.CREDITS_SCENE.visible = (GameManager.GAMESTATE == GameManager.GameState.CREDITS);

        GameManager._LEVEL_NUMBER_TEXT.visible = (GameManager.TURNSTATE != GameManager.TurnState.LOSE);
        GameManager._TURN_INDICATOR_TEXT.visible = (GameManager.TURNSTATE != GameManager.TurnState.LOSE);

        GameManager._GAME_OVER_SPRITE.visible = (GameManager.TURNSTATE == GameManager.TurnState.LOSE);
        GameManager._GAME_OVER_TEXT.visible = (GameManager.TURNSTATE == GameManager.TurnState.LOSE);
        GameManager._GAME_OVER_BACK_BUTTON.visible = (GameManager.TURNSTATE == GameManager.TurnState.LOSE);
    }

    static _createSprite(image, scale, anchor, screenPos, scene) {
        let sprite = new PIXI.Sprite(image);
        sprite.scale.set(scale);
        sprite.anchor.set(anchor[0], anchor[1]);
        sprite.x = screenPos[0];
        sprite.y = screenPos[1];

        scene.addChild(sprite);

        return sprite;
    }

    static _createButton(image, scale, anchor, screenPos, scene, onPointerUp = undefined, onPointerOver = undefined, onPointerOut = undefined) {
        let button = GameManager._createSprite(image, scale, anchor, screenPos, scene);
        button.interactive = true;
        button.buttonMode = true;

        button.on("pointerup", onPointerUp);
        button.on("pointerover", (onPointerOver == undefined) ? () => { button.scale.set(1.25 * scale); } : onPointerOver);
        button.on("pointerout", (onPointerOut == undefined) ? () => { button.scale.set(scale); } : onPointerOut);

        return button;
    }

    static _createText(string, anchor, screenPos, scene) {
        let text = new PIXI.Text(string);
        text.style = TEXT_STYLE;
        text.anchor.set(anchor[0], anchor[1]);
        text.x = screenPos[0];
        text.y = screenPos[1];
        scene.addChild(text);

        return text;
    }

    static _createScene() {
        let scene = new PIXI.Container();
        GameManager.APPLICATION.stage.addChild(scene);

        return scene;
    }
}