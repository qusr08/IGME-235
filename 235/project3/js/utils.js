class Utils {
    static contains2DArrayValue(array, value) {
        return Utils.indexOf2DArrayValue(array, value) != -1;
    }

    static indexOf2DArrayValue(array, value) {
        for (let i = 0; i < array.length; i++) {
            if (array[i][0] == value[0] && array[i][1] == value[1]) {
                return i;
            }
        }

        return -1;
    }

    static add2DArray(array1, array2) {
        return [array1[0] + array2[0], array1[1] + array2[1]];
    }

    static subtract2DArray(array1, array2) {
        // In the form "array1 - array2"
        return [array1[0] - array2[0], array1[1] - array2[1]];
    }

    static divide2DArrayByValue(array, value) {
        return [array[0] / value, array[1] / value];
    }

    static multiply2DArrayByValue(array, value) {
        return [array[0] * value, array[1] * value];
    }

    static equal2DArray(array1, array2) {
        return (array1[0] == array2[0] && array1[1] == array2[1]);
    }

    static randRange(min, max) {
        return (Math.random() * (max - min)) + min;
    }

    static inRange(value, min, max) {
        return (value >= min && value <= max);
    }

    static getDistanceSquared2DArray(array1, array2) {
        return Math.pow(array1[0] - array2[0], 2) + Math.pow(array1[1] - array2[1], 2);
    }

    static getMagnitude2DArray(array) {
        return Math.sqrt(Math.pow(array[0], 2) + Math.pow(array[1], 2));
    }

    static choose(array) {
        return array[Math.floor(Utils.randRange(0, array.length))];
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

    static TILE_DARK_BASE;
    static TILE_LIGHT_BASE;

    static NUMBER_1;
    static NUMBER_2;
    static NUMBER_3;
    static NUMBER_4;

    static LOCKED;
    static CRACKED;
    static CLONE;
    static FAST;

    static PLAY_INSANE_BUTTON;
    static PLAY_CLASSIC_BUTTON;
    static CREDITS_BUTTON;
    static TUTORIAL_BUTTON;
    static BACK_BUTTON;
    static NEXT_BUTTON;
    static PREVIOUS_BUTTON;

    static TITLE;
    static GAMEOVER;

    static TUTORIAL_BACKGROUND_1;
    static TUTORIAL_BACKGROUND_2;
    static CREDITS_BACKGROUND;
    static GAME_BACKGROUND;

    static loadSprites() {
        let spriteSheet = app.loader.resources["media/pieces.png"].texture;

        Sprites.WHITE_PAWN = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(0, 0, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.WHITE_ROOK = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE, 0, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.WHITE_KNIGHT = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 2, 0, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.WHITE_BISHOP = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 3, 0, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.WHITE_QUEEN = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 4, 0, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.WHITE_KING = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 5, 0, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));

        Sprites.BLACK_PAWN = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(0, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.BLACK_ROOK = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.BLACK_KNIGHT = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 2, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.BLACK_BISHOP = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 3, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.BLACK_QUEEN = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 4, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.BLACK_KING = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 5, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));

        Sprites.TILE_DARK_BASE = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(0, Sprites.TEXTURE_SIZE * 2, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE * 1.25));
        Sprites.TILE_LIGHT_BASE = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE * 2, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE * 1.25));

        Sprites.NUMBER_1 = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 2, Sprites.TEXTURE_SIZE * 2, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.NUMBER_2 = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 3, Sprites.TEXTURE_SIZE * 2, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.NUMBER_3 = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 2, Sprites.TEXTURE_SIZE * 3, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.NUMBER_4 = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 3, Sprites.TEXTURE_SIZE * 3, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));

        Sprites.LOCKED = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 4, Sprites.TEXTURE_SIZE * 2, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.CRACKED = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 5, Sprites.TEXTURE_SIZE * 2, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.CLONE = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 4, Sprites.TEXTURE_SIZE * 3, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));
        Sprites.FAST = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(Sprites.TEXTURE_SIZE * 5, Sprites.TEXTURE_SIZE * 3, Sprites.TEXTURE_SIZE, Sprites.TEXTURE_SIZE));

        Sprites.PLAY_INSANE_BUTTON = app.loader.resources["media/play-button-insane.png"].texture;
        Sprites.PLAY_CLASSIC_BUTTON = app.loader.resources["media/play-button-classic.png"].texture;
        Sprites.CREDITS_BUTTON = app.loader.resources["media/credits-button.png"].texture;
        Sprites.TUTORIAL_BUTTON = app.loader.resources["media/tutorial-button.png"].texture;
        Sprites.BACK_BUTTON = app.loader.resources["media/back-button.png"].texture;
        Sprites.NEXT_BUTTON = app.loader.resources["media/next-button.png"].texture;
        Sprites.PREVIOUS_BUTTON = app.loader.resources["media/previous-button.png"].texture;

        Sprites.TITLE = app.loader.resources["media/title.png"].texture;
        Sprites.GAMEOVER = app.loader.resources["media/gameover.png"].texture;
        Sprites.TUTORIAL_BACKGROUND_1 = app.loader.resources["media/tutorial-background-1.png"].texture;
        Sprites.TUTORIAL_BACKGROUND_2 = app.loader.resources["media/tutorial-background-2.png"].texture;
        Sprites.CREDITS_BACKGROUND = app.loader.resources["media/credits-background.png"].texture;
        Sprites.GAME_BACKGROUND = app.loader.resources["media/game-background.png"].texture;
    }
}

class SpriteAnimation {
    constructor(sprite, fromScreenPos, toScreenPos, speed, onStart = undefined, onComplete = undefined, delay = 0) {
        this.sprite = sprite;

        this.fromScreenPos = fromScreenPos;
        this.currScreenPos = fromScreenPos;
        this.toScreenPos = toScreenPos;

        this.sprite.setScreenPos(fromScreenPos);

        this.delay = delay;
        this.frameCount = 0;

        this.isCompleted = false;
        this.isStarted = false;
        this.onStart = onStart;
        this.onComplete = onComplete;

        // https://math.stackexchange.com/questions/1347328/how-to-scale-a-2d-vector-and-keep-direction
        // Get the velocity that the sprite will travel at
        let direction = Utils.subtract2DArray(toScreenPos, this.fromScreenPos);
        let unitDirection = Utils.divide2DArrayByValue(direction, Utils.getMagnitude2DArray(direction));
        this.velocity = Utils.multiply2DArrayByValue(unitDirection, speed);
    }

    update() {
        // Wait a specified amount of frames before running the animation
        this.frameCount += 1;
        if (this.frameCount > this.delay) {
            // If this is the first time the update method is executed, run whatever code should be run before the animation begins
            if (!this.isStarted) {
                if (this.onStart != undefined) {
                    this.onStart();
                }
                this.isStarted = true;
            }

            // As long as the animation is not completed, continue to update the position of the sprite
            if (!this.isCompleted) {
                // Get the next screen position for the sprite based on the velocity
                let nextScreenPos = Utils.add2DArray(this.currScreenPos, this.velocity);

                // https://gamedev.stackexchange.com/questions/18615/how-do-i-linearly-interpolate-between-two-vectors
                // Get the percentage that the animation is done based on its position
                let percentage = Utils.getMagnitude2DArray(Utils.subtract2DArray(nextScreenPos, this.fromScreenPos)) / Utils.getMagnitude2DArray(Utils.subtract2DArray(this.toScreenPos, this.fromScreenPos));

                // If the percentage is greater than or equal to 1, then the animation has finished
                if (percentage >= 1) {
                    // Set the sprite's position to the ending position
                    this.sprite.setScreenPos(this.toScreenPos);

                    // Set the animation to completed
                    // The animation will eventually be removed from the list of animations in the main game loop
                    this.currScreenPos = this.toScreenPos;
                    if (!this.isCompleted) {
                        if (this.onComplete != undefined) {
                            this.onComplete();
                        }
                        this.isCompleted = true;
                    }
                } else {
                    // If the percentage is still less than one, the animation is still going
                    // So, set the position of the sprite to the next position it is going to go to
                    this.sprite.setScreenPos(nextScreenPos);

                    this.currScreenPos = nextScreenPos;
                }
            }
        }
    }
}