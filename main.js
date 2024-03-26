import './style.css'
import tilemapJSON from "./vanilla_tilemap.json";
import AnimatedTile from './animatedTile';

app();

/**
 * @typedef Animation
 * @property {string} name 
 * @property {number[]} tiles 
 * @property {number} duration duration in ms 
 */

function app() {
    const canvas = document.querySelector("canvas");

    if (!canvas) throw "Missing DOM: canvas";

    canvas.width = tilemapJSON.width;
    canvas.height = tilemapJSON.height;

    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;

    // Draw static tilemap image
    const image = new Image();

    image.src = tilemapJSON.tilemap;

    image.addEventListener("load", () => {
        ctx.drawImage(image, 0, 0);
    });

    // Start animations

    for (let r = 0; r < tilemapJSON.animationmap.length; ++r) {
        for (let c = 0; c < tilemapJSON.animationmap[0].length; ++c) {

            if (tilemapJSON.animationmap[r][c] !== null) {

                const animation = tilemapJSON.animations[tilemapJSON.animationmap[r][c]];

                const animatedTile = new AnimatedTile(ctx, animation.tiles.map(t => tilemapJSON.tiles[t]), animation.duration, r, c);

                animatedTile.run();

            }
        }
    }

    // Start animation of sprite 
}



/**
 * Draws a tile on the canvas 
 * 
 * @param {number} row 
 * @param {number} col
 * @param {number} tile idx to tile in state.tiles
 */
function paintTile(ctx, row, col, tile) {
    const tileSize = 64;
    const image = new Image(tileSize, tileSize);
    image.src = tile;
    ctx.clearRect(col * tileSize + 0.5, row * tileSize + 0.5, tileSize, tileSize)
    ctx.drawImage(image, col * tileSize + 0.5, row * tileSize + 0.5, tileSize, tileSize);
}