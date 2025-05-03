import MazePath from './MazePath';
import { state } from './main';
import { AnimationManager } from './AnimationManager';

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
     * The current position of the alien in pixel coordinates
     * @type {Pos}
     * @private
     */
    _currentPos;

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
     * @type {AnimationManager}
     * @private
     */
    _animations;


    /**
     * Creates an instance of the Alien class.
     * @param {MazePath} mazePath The maze path the alien will follow.
     */
    constructor(mazePath) {
        this._mazePath = mazePath;
        this._currentTileIdx = 0;
        this._currentPixelDiff = 0;

        this.width = state.tileSize;
        this.height = state.tileSize;

        this._animations = new AnimationManager(this);

        this._animations.create("alien-north", {loop: true, frames: "alien-north", numberOfFrames: 4});
        this._animations.create("alien-south", {loop: true, frames: "alien-south", numberOfFrames: 4});
        this._animations.create("alien-west", {loop: true, frames: "alien-west", numberOfFrames: 4});
        this._animations.create("alien-east", {loop: true, frames: "alien-east", numberOfFrames: 4});
    }

    /**
     * Initializes the alien's starting position and sprite assets.
     * @returns {Promise<void>}
     */
    async init() {
        const startCell = this._mazePath.getCurrentPathCell();
        this._currentPos = { x: startCell.col * state.tileSize, y: startCell.row * state.tileSize };
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
     */
    update() {
        // Update position
        this._currentPos = this._getNextPos();
        this._currentPixelDiff++;

        if (this._currentPixelDiff === state.tileSize) {
            this._mazePath.next();
            this._currentPixelDiff = 0;
        } 

        // Update sprite animation
        const currentDirection = this._mazePath.getCurrentDirection();
    
        if(!this._animations.isPlaying(`alien-${currentDirection}`)) {
            
            this._animations.play(`alien-${currentDirection}`)
        } else {
            this._animations.update();
        }
    }

    /**
     * Draws the alien at its current position with the correct sprite based on its direction and sprite frame.
     * @param {CanvasRenderingContext2D} ctx The canvas context to draw the alien.
     */
    draw(ctx) {

        const x = this._currentPos.x;
        const y = this._currentPos.y - state.tileSize / 2;
        ctx.clearRect(x, y, state.tileSize, state.tileSize);
        this._animations.draw(ctx, {x,y});
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
