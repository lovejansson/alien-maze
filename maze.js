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

                // Add all non visited neighbours to the queue
            } else if (!visited.has(`${n.row}:${n.col}`)) {
                prev.set(`${n.row}:${n.col}`, currentCell);
                queue.push(n);
                visited.add(`${n.row}:${n.col}`);
            }
        }
    }

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
 * 
 * @param {Map<string, {row, col}[]>} roadsGraph 
 * @returns {{row: number, col: number}}
 */
export function getRandomRoadCell(roadsGraph) {
    const cells = [...roadsGraph.keys()];
    
    const randomCell = cells.random().split(":");

    return { row: parseInt(randomCell[0]), col: parseInt(randomCell[1]) }
}