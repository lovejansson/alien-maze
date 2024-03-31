import { getRandomRoadCell, bfs } from './maze';

/**
 * @typedef Direction 
 * @type {"north" | "east" | "south" | "west"}
 */

/**
 * @typedef Cell
 * @type {{row: number, col: number}}
 */

export default class MazePath {
    /**
     * @type {Map<string, Cell[]>}
     */
    _roadGraph;

    /**
     * @type {Cell[]}
     */
    _currentPath;

    /**
     * @type {number}
     */
    _currentPathIdx;

    /**
     * 
     * @param {Map<string, Cell[]>} roadGraph 
     */
    constructor(roadGraph) {
        this._roadGraph = roadGraph;
    }

    init() {
        this._createNewPath();
    }

    /**
     * Advances to the next cell in the current path, creating a new path if we are at the end cell.
     */
    next() {
        // Create new path
        if (this._currentPathIdx === this._currentPath.length - 1) {
            this._createNewPath();
        } else {
            this._currentPathIdx++;
        }
    }

    isGoalCell() {
        return this._currentPathIdx === this._currentPath.length - 1;
    }

    /**
     * @returns {Cell | undefined}
     */
    getNextPathCell() {
        return this._currentPath[this._currentPathIdx + 1];
    }

    /**
     * @returns {Cell}
     */
    getCurrentPathCell() {
        return this._currentPath[this._currentPathIdx];
    }

    /**
     * 
     * @returns {Direction}
     */
    getCurrentDirection() {
        const currentPathTile = this._currentPath[this._currentPathIdx];

        if (this._currentPathIdx === this._currentPath.length - 1) {
            const prevPathTile = this._currentPath[this._currentPathIdx - 1];

            return this._getDirection(prevPathTile, currentPathTile);

        } else {
            const nextPathTile = this._currentPath[this._currentPathIdx + 1];
            return this._getDirection(currentPathTile, nextPathTile);
        }
    }


    _createNewPath() {
        const startCell = this._currentPathIdx !== undefined ? this._currentPath[this._currentPathIdx] : getRandomRoadCell(this._roadGraph);
        const endCell = getRandomRoadCell(this._roadGraph);

        this._currentPath = bfs(startCell, endCell, this._roadGraph);
        this._currentPathIdx = 0;

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