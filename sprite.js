import { paintTile } from './canvas';
import * as array from "./array"
import MazePath from './MazePath';

export default class Sprite {

    /**
     * @type {CanvasRenderingContext2D}
     */
    _ctx;

    /**
     * @type {{[Direction]: Image[]}}
     */
    _tiles;

    /**
     * @type {number}
     */
    _currentTileIdx;


    /**
     * @type {{x: number, y: number}}
     */
    _currentPos;


    /**
     * @type {number}
     */
    _lastElapsed;

    /**
     * @type { number }
     */
    _currentMillisecondsDiff;

    /** 
     * @type {MazePath}
     */
    _mazePath;

    /**
     * @type {number}
     */
    _numberOfMoonRocks;


    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {MazePath} mazePath
     * @param {{[Direction]: string[]}} tiles  
     */
    constructor(ctx, mazePath, tiles) {
        this._ctx = ctx;
        this._mazePath = mazePath;
        this._tiles = tiles;
        this._currentTileIdx = 0;
        this._currentMillisecondsDiff = 0;
    }

    init() {
        const startCell = this._mazePath.getCurrentPathCell();
        this._currentPos = { x: startCell.col * 64, y: startCell.row * 64 };
    }

    /**
     * @returns {{x: number, y: number}}
     */
    get pos() {
        return this._currentPos;
    }

    update(elapsed) {

        // Update time elapsed variables to be able to update tile image every 100 ms

        if (this._lastElapsed === undefined) {
            this._lastElapsed = elapsed;
        }

        this._currentMillisecondsDiff += (elapsed - this._lastElapsed)
        this._lastElapsed = elapsed;

        // Update tile index (animation frame)

        if (this._currentMillisecondsDiff >= 100) {
            this._currentMillisecondsDiff = 0;
            this._currentTileIdx = this._currentTileIdx === 3 ? 0 : this._currentTileIdx += 1;
        }


        // Update position of sprite 

        const currentPathTile = this._mazePath.getCurrentPathCell();
        const nextPathTile = this._mazePath.getNextPathCell();
        const currentDirection = this._mazePath.getCurrentDirection();

        const endX = nextPathTile ? nextPathTile.col * 64 : ["east", "west"].includes(currentDirection) ? (currentPathTile.col + 1) * 64 : currentPathTile.col * 64;
        const endY = nextPathTile ? nextPathTile.row * 64 : ["north", "south"].includes(currentDirection) ? (currentPathTile.row + 1) * 64 : currentPathTile.row * 64;

        // Pick next tile in path 
        if (["east", "west"].includes(currentDirection) && this._currentPos.x === endX || ["north", "south"].includes(currentDirection) && this._currentPos.y === endY) {

            this._mazePath.next();
            this._currentPos = { x: this._mazePath.getCurrentPathCell().col * 64, y: this._mazePath.getCurrentPathCell().row * 64 };

        } else {
            this._currentPos = this._getNextPos();
        }

    }

    draw() {
        const currentDirection = this._mazePath.getCurrentDirection();

        paintTile(this._ctx, this._currentPos.x, this._currentPos.y - 16, this._tiles[currentDirection][this._currentTileIdx]);
    }

    /**
     * Get next position of sprite
     * @returns {{x: number, y: number}}
     */
    _getNextPos() {
        const currentDirection = this._mazePath.getCurrentDirection();

        switch (currentDirection) {
            case "north":
                return { x: this._currentPos.x, y: this._currentPos.y - 1 }
            case "east":
                return { x: this._currentPos.x + 1, y: this._currentPos.y }
            case "south":
                return { x: this._currentPos.x, y: this._currentPos.y + 1 }
            case "west":
                return { x: this._currentPos.x - 1, y: this._currentPos.y }
        }
    }
}