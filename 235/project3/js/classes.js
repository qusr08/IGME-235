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
    constructor () {
        
    }
}