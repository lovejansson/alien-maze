export default class AnimatedTile {

    /**
     * @type {CanvasRenderingContext2D}
     */
    _ctx;

    /**
     * @type {string[]}
     */
    _tiles;

    /**
     * @type {number}
     */
    _speed;

    /**
     * @type {number}
     */
    _lastElapsed;

    /**
     * @type { number }
     */
    _currentMillisecondsDiff;

    /**
     * @type { number }
     */
    _currentTileIdx;

    /**
     * @type { number }
     */
    _row;

    /**
     * @type { number }
     */
    _col;

    /**
     * 
     * @param {string[]} tiles 
     * @param {number} duration 
     */
    constructor(ctx, tiles, duration, row, col) {
        this._ctx = ctx;
        this._tiles = tiles;
        this._speed = Math.floor(duration / tiles.length);

        this._currentMillisecondsDiff = 0;
        this._currentTileIdx = 0;

        this._row = row;
        this._col = col;
    }

    run() {
        requestAnimationFrame((elapsed) => {

            if (this._lastElapsed === undefined) {
                this._lastElapsed = elapsed;
            } else {

                this._currentMillisecondsDiff += (elapsed - this._lastElapsed)
                this._lastElapsed = elapsed;

                // Switch tile every speed ms
                if (this._currentMillisecondsDiff >= this._speed) {

                    paintTile(this._ctx, this._row, this._col, this._tiles[this._currentTileIdx]);
                    this._currentTileIdx = this._currentTileIdx === this._tiles.length - 1 ? 0 : this._currentTileIdx += 1;
                    this._currentMillisecondsDiff = 0;
                }
            }

            this.run();
        });
    }

}

/**
 * Draws a tile on the canvas 
 * 
 * @param {number} row 
 * @param {number} col
 * @param {number} tile idx to tile in state.tiles
 */
function paintTile(ctx, row, col, tile) {
    const tileSize = 64;
    const image = new Image(tileSize, tileSize);
    image.src = tile;
    ctx.clearRect(col * tileSize + 0.5, row * tileSize + 0.5, tileSize, tileSize)
    ctx.drawImage(image, col * tileSize + 0.5, row * tileSize + 0.5, tileSize, tileSize);
}