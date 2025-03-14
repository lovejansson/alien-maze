import MazePath from './MazePath';
import { state } from './main';
import AssetManager from './AssetManager';

/**
 * @typedef Direction 
 * @type {"north" | "east" | "south" | "west"}
 */

/**
 * @typedef Pos
 * @type {{x: number; y: number}}
 */

export default class Alien {

    /**
     * A collection of sprite tiles indexed by direction
     * @type {{[key: Direction]: Image[]}}
     * @private
     */
    _spriteTiles;

    /**
     * The current index of the sprite tile to be drawn.
     * @type {number}
     * @private
     */
    _currentTileIdx;

    /**
     * The current position of the alien in pixel coordinates
     * @type {Pos}
     * @private
     */
    _currentPos;

    /**
     * The last elapsed time used for time-based updates
     * @type {number}
     * @private
     */
    _lastElapsed;

    /**
     * The accumulated time difference for updating the sprite animation
     * @type {number}
     * @private
     */
    _currentMillisecondsDiff;

    /** 
     * The maze path that the alien follows
     * @type {MazePath}
     * @private
     */
    _mazePath;

    /**
     * The pixel difference the alien has moved within the current tile
     * @type {number}
     * @private
     */
    _currentPixelDiff;


    /**
     * Creates an instance of the Alien class.
     * @param {MazePath} mazePath The maze path the alien will follow.
     */
    constructor(mazePath) {
        this._mazePath = mazePath;
        this._spriteTiles = {};
        this._currentTileIdx = 0;
        this._currentMillisecondsDiff = 0;
        this._currentPixelDiff = 0;
    }

    /**
     * Initializes the alien's starting position and sprite assets.
     * @returns {Promise<void>}
     */
    async init() {
        const startCell = this._mazePath.getCurrentPathCell();
        this._currentPos = { x: startCell.col * state.tileSize, y: startCell.row * state.tileSize };
        await this._createSpriteAssets();
    }

    /**
     * Gets the sprite assets for the alien from the AssetManager and groups them by four directions (north, east, south, west).
     * @returns {Promise<void>}
     * @private
     */
    async _createSpriteAssets() {
        const assetManager = AssetManager.getInstance();

        this._spriteTiles = {
            north: [assetManager.get("alien-back0"), assetManager.get("alien-back1"), assetManager.get("alien-back0"), assetManager.get("alien-back2")],
            east: [assetManager.get("alien-right0"), assetManager.get("alien-right1"), assetManager.get("alien-right0"), assetManager.get("alien-right2")],
            south:[assetManager.get("alien-front0"), assetManager.get("alien-front1"), assetManager.get("alien-front0"), assetManager.get("alien-front2")],
            west: [assetManager.get("alien-left0"), assetManager.get("alien-left1"), assetManager.get("alien-left0"), assetManager.get("alien-left2")],
        };
    }

    /**
     * Gets the current position of the alien.
     * @returns {Pos} The current position of the alien.
     */
    get pos() {
        return this._currentPos;
    }

    /**
     * Updates the alien's state, including sprite frame and position.
     * @param {number} elapsed The time elapsed since the last update.
     */
    update(elapsed) {

        // Update time elapsed variables to be able to update tile image every 100 ms
        if (this._lastElapsed === undefined) {
            this._lastElapsed = elapsed;
        }

        this._currentMillisecondsDiff += (elapsed - this._lastElapsed);
        this._lastElapsed = elapsed;

        // Update tile index (sprite frame) every 100 ms
        if (this._currentMillisecondsDiff >= 100) {
            this._currentMillisecondsDiff = 0;
            this._currentTileIdx = this._currentTileIdx === 3 ? 0 : this._currentTileIdx += 1;
        }

        // Update position
        this._currentPos = this._getNextPos();
        this._currentPixelDiff++;

        if (this._currentPixelDiff === state.tileSize) {
            this._mazePath.next();
            this._currentPixelDiff = 0;
        } 
    }

    /**
     * Draws the alien at its current position with the correct sprite based on its direction and sprite frame.
     * @param {CanvasRenderingContext2D} ctx The canvas context to draw the alien.
     */
    draw(ctx) {
        const currentDirection = this._mazePath.getCurrentDirection();
        const x = this._currentPos.x;
        const y = this._currentPos.y - state.tileSize / 2;
        ctx.clearRect(x, y, state.tileSize, state.tileSize);
        ctx.drawImage(this._spriteTiles[currentDirection][this._currentTileIdx], x, y, state.tileSize, state.tileSize);
    }

    /**
     * Calculates and returns the next position of the alien based on its current direction.
     * @returns {Pos} The next position of the alien.
     * @private
     */
    _getNextPos() {
        const currentDirection = this._mazePath.getCurrentDirection();

        switch (currentDirection) {
            case "north":
                return { x: this._currentPos.x, y: this._currentPos.y - 1 };
            case "east":
                return { x: this._currentPos.x + 1, y: this._currentPos.y };
            case "south":
                return { x: this._currentPos.x, y: this._currentPos.y + 1 };
            case "west":
                return { x: this._currentPos.x - 1, y: this._currentPos.y };
        }
    }
}
