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
     * A map representing the road graph where each key is a cell identifier and the value is an array of neighboring cells.
     * @type {Map<string, Cell[]>}
     * @private
     */
    _roadGraph;

    /**
     * The current path that the maze pathfinding algorithm is following.
     * @type {Cell[]}
     * @private
     */
    _currentPath;

    /**
     * The current index in the path that the maze pathfinding algorithm is at.
     * @type {number}
     * @private
     */
    _currentPathIdx;

    /**
     * Creates an instance of the MazePath class.
     * @param {Map<string, Cell[]>} roadGraph The road graph representing the maze.
     */
    constructor(roadGraph) {
        this._roadGraph = roadGraph;
    }

    /**
     * Initializes the maze path by creating a new path.
     */
    init() {
        this._createNewPath();
    }

    /**
     * Advances to the next cell in the current path. If the end of the path is reached, a new path is generated.
     */
    next() {
        this._currentPathIdx++;

        if (this._currentPathIdx === this._currentPath.length - 1) {
            this._createNewPath();
        }
    }

    /**
     * Gets the current cell in the path.
     * @returns {Cell} The current path cell.
     */
    getCurrentPathCell() {
        return this._currentPath[this._currentPathIdx];
    }

    /**
     * Gets the current direction the path is moving in based on the current, next, or previous cell.
     * @returns {Direction} The direction of movement ("north", "east", "south", "west").
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

    /**
     * Creates a new path by selecting a random start and end cell and calculating the shortest path between them using BFS.
     * @private
     */
    _createNewPath() {
        const startCell = this._currentPathIdx !== undefined ? this._currentPath[this._currentPathIdx] : getRandomRoadCell(this._roadGraph);
        const endCell = getRandomRoadCell(this._roadGraph);
        this._currentPath = bfs(startCell, endCell, this._roadGraph);
        this._currentPathIdx = 0;
    }

    /**
     * Calculates the direction between two cells based on their row and column difference.
     * @param {Cell} from The starting cell.
     * @param {Cell} to The destination cell.
     * @returns {Direction} The direction of movement ("north", "east", "south", "west").
     * @private
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
