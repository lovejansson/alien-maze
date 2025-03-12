/**
 * Draws a tile with image on the canvas 
 * 
 * @param {CanvasRenderingContext2D} ctx the rendering context to draw in
 * @param {number} x 
 * @param {number} y 
 * @param {Image} tile image to draw
 */
export function paintTile(ctx, x, y, tile) {
    const tileSize = 64;
    ctx.clearRect(x, y, tileSize, tileSize)
    ctx.drawImage(tile, x, y, tileSize, tileSize);

}