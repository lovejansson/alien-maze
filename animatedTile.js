import AssetManager from "./AssetManager.js";
import { state } from "./main.js";

export default class AnimatedTile {

    /**
     * @type { {duration: number; assetName: string;}[]}
     * @description Array of animation frames, each containing a duration and an asset name.
     */
    _frames;

    /**
     * @type {Image[]}
     * @description Array of image objects representing the tiles for each frame in the animation.
     */
    _tiles;

    /**
     * @type {number | null}
     * @description The timestamp of the last elapsed time, used to calculate frame durations.
     */
    _lastElapsed;

    /**
     * @type {number}
     * @description Accumulated time in milliseconds since the last frame switch.
     */
    _currentMillisecondsDiff;

    /**
     * @type {number}
     * @description The index of the currently displayed frame in the animation.
     */
    _currentFrameIdx;

    /**
     * @type {number}
     * @description The row position of the tile on the grid.
     */
    _row;

    /**
     * @type {number}
     * @description The column position of the tile on the grid.
     */
    _col;

    /**
     * Creates an instance of AnimatedTile.
     * 
     * @param { {duration: number; assetName: string;}[]} frames Array of frames where each frame has a `duration` in ms and an `assetName` for the image to display.
     * @param {number} row The row position of the tile on the grid.
     * @param {number} col The column position of the tile on the grid.
     */
    constructor(frames, row, col) {
        this._tiles = [];
        this._frames = frames;
     
        this._lastElapsed = null;
        this._currentMillisecondsDiff = 0;
        this._currentFrameIdx = 0;

        this._row = row;
        this._col = col;
    }

    /**
     * Initializes the animation by loading the tile images for each frame.
     * 
     * @returns {void} This method does not return anything.
     */
    init() {
        const assetManager = AssetManager.getInstance();

        for (const frame of this._frames) {
            this._tiles.push(assetManager.get(frame.assetName));
        }
    }

    /**
     * Starts playing the animation for the tile.
     * The animation will loop through each frame based on the specified duration.
     * 
     * @param {CanvasRenderingContext2D} ctx The 2D rendering context for drawing the tile on the canvas.
     * @returns {void} This method uses `requestAnimationFrame` to repeatedly update the animation.
     */
    play(ctx) {
        requestAnimationFrame((elapsed) => {
            if (this._lastElapsed === undefined) {
                this._lastElapsed = elapsed;
            } else {
                this._currentMillisecondsDiff += (elapsed - this._lastElapsed);
                this._lastElapsed = elapsed;

                // Switch tile every frame duration
                if (this._currentMillisecondsDiff >= this._frames[this._currentFrameIdx].duration) {
                    const x = this._row * state.tileSize;
                    const y = this._col * state.tileSize;
                    ctx.clearRect(x, y, state.tileSize, state.tileSize); // Clear previous frame

                    // Draw the current frame
                    ctx.drawImage(this._tiles[this._currentFrameIdx], x, y, state.tileSize, state.tileSize);

                    // Move to the next frame or loop back to the first frame
                    this._currentFrameIdx = this._currentFrameIdx === this._tiles.length - 1 ? 0 : this._currentFrameIdx + 1;
                    this._currentMillisecondsDiff = 0;
                }
            }

            // Continue the animation
            this.play(ctx);
        });
    }
}
