/**
 * Performs a Breadth-First Search (BFS) to find the shortest path from the start cell to the end cell in a graph.
 * 
 * @param {{row: number, col: number}} startCell The starting cell in the maze.
 * @param {{row: number, col: number}} endCell The destination cell in the maze.
 * @param {Map<string, {row: number, col: number}[]>} graph A graph represented as a map, where each key is a cell identifier (e.g., "row:col") and the value is an array of neighboring cells.
 * @returns {{row: number, col: number}[]} The shortest path from the start cell to the end cell, as an array of cells.
 */
export function bfs(startCell, endCell, graph) {
    const visited = new Set(); // each value is a MazeCell row:col that has been visited
    const prev = new Map(); // each key stores a MazeCell which is the previous cell from that cell.
    const queue = []; // each index is a {MazeCell} used during iteration to get the next current cell to process.

    let currentCell;

    queue.push(startCell);
    prev.set(`${startCell.row}:${startCell.col}`, null);
    visited.add(`${startCell.row}:${startCell.col}`);

    while (queue.length > 0) {

        currentCell = queue.shift();

        const neighbours = graph.get(`${currentCell.row}:${currentCell.col}`);

        for (const n of neighbours) {

            // Found end cell so we create the path to it
            if (n.row === endCell.row && n.col === endCell.col) {

                prev.set(`${n.row}:${n.col}`, currentCell);
                return reconstructPath(prev, endCell);

                // Add all non-visited neighbours to the queue
            } else if (!visited.has(`${n.row}:${n.col}`)) {
                prev.set(`${n.row}:${n.col}`, currentCell);
                queue.push(n);
                visited.add(`${n.row}:${n.col}`);
            }
        }
    }

    /**
     * Reconstructs the path from the start cell to the end cell using the 'prev' map.
     * @param {Map<string, {row: number, col: number}>} prev A map of cells with their previous cell in the path.
     * @param {{row: number, col: number}} endCell The end cell from which the path is reconstructed.
     * @returns {{row: number, col: number}[]} An array representing the path from the start cell to the end cell.
     */
    function reconstructPath(prev, endCell) {
        const path = [];
        let currentCell = endCell;

        while (currentCell) {
            path.push(currentCell);
            currentCell = prev.get(`${currentCell.row}:${currentCell.col}`);
        }

        return path.reverse();
    }
}

/**
 * Gets a random cell from the maze, which is represented by the roadsGraph.
 * 
 * @param {Map<string, {row: number, col: number}[]>} roadsGraph A graph representing the maze, where each key is a cell identifier (e.g., "row:col") and the value is an array of neighboring cells.
 * @returns {{row: number, col: number}} A randomly chosen road cell from the maze.
 */
export function getRandomRoadCell(roadsGraph) {
    const cells = [...roadsGraph.keys()];
    
    const randomCell = cells.random().split(":");

    return { row: parseInt(randomCell[0]), col: parseInt(randomCell[1]) };
}

/**
 * Creates a roads graph which contains all cells mapped to their neighbors.
 * 
 * @param {Array<Array<object>>} objectmap A 2D array representing the maze, where each object may have a 'name' property indicating whether it's a road.
 * @returns {Map<string, {row: number, col: number}[]>} A map where each key is a road cell identifier (e.g., "row:col") and the value is an array of neighboring road cells.
 */
export function createRoadGraph(objectmap) {
    const graph = new Map();

    for (let r = 0; r < objectmap.length; ++r) {
        for (let c = 0; c < objectmap[0].length; ++c) {
            if (objectmap[r][c] && objectmap[r][c].name === "road") {
                const connectedNeighbours = getRoadCellNeighbours(objectmap, r, c);
                graph.set(`${r}:${c}`, connectedNeighbours);
            }
        }
    }

    return graph;
}

/**
 * Gets all neighbors for a road cell that are also road cells.
 * 
 * @param {Array<Array<object>>} objectmap A 2D array representing the maze, where each object may have a 'name' property indicating whether it's a road.
 * @param {number} r The row index of the current cell.
 * @param {number} c The column index of the current cell.
 * @returns {{row: number, col: number}[]} An array of neighboring road cells.
 */
export function getRoadCellNeighbours(objectmap, r, c) {
    const n = [];

    if (r !== 0 && objectmap[r - 1][c] && objectmap[r - 1][c].name === "road") {
        n.push({ row: r - 1, col: c });
    }

    if (r !== objectmap.length - 1 && objectmap[r + 1][c] && objectmap[r + 1][c].name === "road") {
        n.push({ row: r + 1, col: c });
    }

    if (c !== 0 && objectmap[r][c - 1] && objectmap[r][c - 1].name === "road") {
        n.push({ row: r, col: c - 1 });
    }

    if (c !== objectmap[0].length && objectmap[r][c + 1] && objectmap[r][c + 1].name === "road") {
        n.push({ row: r, col: c + 1 });
    }

    return n;
}
