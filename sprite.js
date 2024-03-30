import { getRandomRoadCell, bfs } from './maze';
import { paintTile } from './canvas';
import * as array from "./array"

export default class Sprite {

    /**
     * @typedef Direction 
     * @type {"north" | "east" | "south" | "west"}
     */

    /**
     * @typedef Cell
     * @type {{row: number, col: number}}
     */

    /**
     * @type {CanvasRenderingContext2D}
     */
    _ctx;

    /**
     * @type {Map<string, Cell[]>}
     */
    _roadGraph;

    /**
     * @type {{[Direction]: string[]}}
     */
    _tiles;

    /**
     * @type {number}
     */
    _currentImageIdx;

    /**
     * @type {{x: number, y: number}}
     */
    _currentPos;

    /**
     * @type {Cell[]}
     */
    _currentPath;

    /**
     * @type {number}
     */
    _currentPathIdx;

    /**
     * @type {Direction}
     */
    _currentDirection;

    /**
     * @type {Direction}
     */
    _prevDirection;

    /**
     * @type {number}
     */
    _currentTileIdx;

    /**
     * @type {number}
     */
    _lastElapsed;

    /**
     * @type { number }
     */
    _currentMillisecondsDiff;


    /**
     * 
     * @param {Map<string, Cell[]>} roadGraph 
     */
    constructor(ctx, roadGraph, tiles) {
        this._roadGraph = roadGraph;
        this._tiles = tiles;
        this._ctx = ctx;
        this._currentTileIdx = 0;
        this._currentMillisecondsDiff = 0;
    }

    init() {
        this._createNewPath();
    }

    update(elapsed) {

        if (this._lastElapsed === undefined) {
            this._lastElapsed = elapsed;
        }

        this._currentMillisecondsDiff += (elapsed - this._lastElapsed)
        this._prevDirection = this._currentDirection;

        this._lastElapsed = elapsed;

        const currentPathTile = this._currentPath[this._currentPathIdx];
        const nextPathTile = this._currentPath[this._currentPathIdx + 1];

        const endX = nextPathTile ? nextPathTile.col * 64 : ["east", "west"].includes(this._currentDirection) ? (currentPathTile.col + 1) * 64 : currentPathTile.col * 64;
        const endY = nextPathTile ? nextPathTile.row * 64 : ["north", "south"].includes(this._currentDirection) ? (currentPathTile.row + 1) * 64 : currentPathTile.row * 64;

        // Pick next tile in path 
        if (["east", "west"].includes(this._currentDirection) && this._currentPos.x === endX || ["north", "south"].includes(this._currentDirection) && this._currentPos.y === endY) {
            // Create new path
            if (this._currentPathIdx === this._currentPath.length - 1) {
                this._createNewPath();
            } else {
                this._currentPathIdx++;
                this._currentPos = this._getNextPos();

                this._currentDirection = this._getCurrentDirection();

            }

        } else {
            this._currentPos = this._getNextPos();
            this._currentDirection = this._getCurrentDirection();
        }

        if (this._currentMillisecondsDiff >= 100) {
            this._currentMillisecondsDiff = 0;
            this._currentTileIdx = this._currentTileIdx === 3 ? 0 : this._currentTileIdx += 1;

        }

    }

    draw() {
        this._ctx.clearRect(0, 0, 3000, 2000);

        paintTile(this._ctx, this._currentPos.x, this._currentPos.y - 16, this._tiles[this._currentDirection][this._currentTileIdx]);
    }

    _createNewPath() {
        const startCell = this._currentPathIdx !== undefined ? this._currentPath[this._currentPathIdx] : getRandomRoadCell(this._roadGraph);
        const endCell = getRandomRoadCell(this._roadGraph);

        this._currentPath = bfs(startCell, endCell, this._roadGraph);
        this._currentPathIdx = 0;
        this._currentPos = { x: startCell.col * 64, y: startCell.row * 64 };
        this._currentDirection = this._getCurrentDirection();
        this._prevDirection = this._currentDirection;

    }

    /**
     * Compares next and previous tiles in the path to calculate the next position of the sprite
     * @returns {{x: number, y: number}}
     */
    _getNextPos() {
        const currentPathTile = this._currentPath[this._currentPathIdx];

        if (this._currentPathIdx === this._currentPath.length - 1) {
            const prevPathTile = this._currentPath[this._currentPathIdx - 1];

            const posDiff = this._getPosDiff(prevPathTile, currentPathTile);
            return { x: this._currentPos.x + posDiff.x, y: this._currentPos.y + posDiff.y }

        } else {
            const nextPathTile = this._currentPath[this._currentPathIdx + 1];

            const posDiff = this._getPosDiff(currentPathTile, nextPathTile);
            return { x: this._currentPos.x + posDiff.x, y: this._currentPos.y + posDiff.y }
        }

    }

    _getCurrentDirection() {
        const currentPathTile = this._currentPath[this._currentPathIdx];

        if (this._currentPathIdx === this._currentPath.length - 1) {
            const prevPathTile = this._currentPath[this._currentPathIdx - 1];

            return this._getDirection(prevPathTile, currentPathTile);

        } else {
            const nextPathTile = this._currentPath[this._currentPathIdx + 1];
            return this._getDirection(currentPathTile, nextPathTile);
        }
    }

    /**
     * Calculates position difference by comparing current cell and next cell 
     * @param {Cell} from 
     * @param {Cell} to 
     * @returns 
     */
    _getPosDiff(from, to) {
        const speed = 1;

        // Examples:
        // If to.col > from.col the difference in x will be 1 * 1 = 1
        // If to.row < from.row the difference in y will be -1 * 1 = 1
        // The difference between from and to will be maximum since all of the cells in the path is after eachother
        return {
            x: (to.col - from.col) * speed,
            y: (to.row - from.row) * speed
        };
    }

    /**
     * 
     * @param {Cell} from 
     * @param {Cell} to 
     * @returns {Direction}
     */
    _getDirection(from, to) {
        const rowDiff = to.row - from.row;
        const colDiff = to.col - from.col;

        if (rowDiff === 0) {
            if (colDiff > 0) {
                return "east";
            }

            return "west";
        }

        if (rowDiff > 0) {
            return "south";
        }

        return "north";
    }

}