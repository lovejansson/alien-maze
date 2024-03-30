/**
 * Draws a tile with image on the canvas 
 * 
 * @param {CanvasRenderingContext2D} ctx the rendering context to draw in
 * @param {number} x 
 * @param {number} y 
 * @param {string} tile image to draw
 */
export function paintTile(ctx, x, y, tile) {
    const tileSize = 64;
    const image = new Image(tileSize, tileSize);
    image.src = tile;
    ctx.clearRect(x, y, tileSize, tileSize)
    ctx.drawImage(image, x, y, tileSize, tileSize);
}

/**
 * Draws a tile with color on the canvas 
 * 
 * @param {CanvasRenderingContext2D} ctx the rendering context to draw in
 * @param {number} x 
 * @param {number} y 
 * @param {string} color 
 */
export function paintTileColor(ctx, x, y, color) {
    const tileSize = 64;
    ctx.fillStyle = color;

    ctx.fillRect(x, y, tileSize, tileSize);
}

export function clearTile(ctx, x, y) {
    ctx.clearRect(x, y, 64, 64)
}