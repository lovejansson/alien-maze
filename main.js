import './style.css';
import tilemapJSON from "./tilemap.json";
import AnimatedTile from './AnimatedTile';
import Alien from './Alien';
import MazePath from './MazePath';
import "./array";
import { createRoadGraph } from './maze';
import AssetManager from './AssetManager';

export const state  = {
    width: 0,
    height: 0,
    tileSize: 0,
}


const baseUrl = import.meta.env.BASE_URL;

main();

/**
 * Main function that initializes the game, loads assets, and starts the animation loop.
 * 
 * @async
 * @returns {Promise<void>} A promise that resolves when the game is initialized.
 */
async function main() {
    /**
     * @type {HTMLCanvasElement}
     */
    const canvasTilemap = document.getElementById("tilemap-static");

    /**
     * @type {HTMLCanvasElement}
     */
    const canvasDynamic = document.getElementById("tilemap-dynamic");

    if (!canvasTilemap || !canvasDynamic) throw new Error("Missing DOM: canvas");

    canvasTilemap.width = tilemapJSON.width;
    canvasTilemap.height = tilemapJSON.height;
    canvasDynamic.width = tilemapJSON.width;
    canvasDynamic.height = tilemapJSON.height;

    state.width = tilemapJSON.width;
    state.height = tilemapJSON.height;
    state.tileSize = tilemapJSON.tileSize;

    const ctxStatic = canvasTilemap.getContext("2d");
    const ctxDynamic = canvasDynamic.getContext("2d");

    if (!ctxStatic || !ctxDynamic) throw new Error("Canvas rendering context is null");

    ctxStatic.imageSmoothingEnabled = false;
    ctxDynamic.imageSmoothingEnabled = false;

    await initAssets();

    drawStaticTilemap(ctxStatic);

    const roadGraph = createRoadGraph(tilemapJSON.objectmap);
    const mazePath = new MazePath(roadGraph);
    mazePath.init();

    const alien = new Alien(mazePath);
    alien.init();

    play();

    /**
     * Game loop that continually updates and draws the game state.
     * 
     * @returns {void}
     */
    function play() {
        requestAnimationFrame((elapsed) => {
            ctxDynamic.clearRect(0, 0, tilemapJSON.width, tilemapJSON.height);
            alien.update(elapsed);
            alien.draw(ctxDynamic);
            play();
        });
    }
}

/**
 * Initializes and loads all assets using the AssetManager.
 * Registers image sources and waits for all assets to be loaded before continuing.
 * 
 * @async
 * @returns {Promise<void>} A promise that resolves when all assets have been loaded.
 */
async function initAssets() {
    const assetManager = AssetManager.getInstance();

    // Register alien assets
    assetManager.register("alien-back0", `${baseUrl}assets/alien-back0.png`);
    assetManager.register("alien-back1", `${baseUrl}assets/alien-back1.png`);
    assetManager.register("alien-back2", `${baseUrl}assets/alien-back2.png`);
    assetManager.register("alien-front0", `${baseUrl}assets/alien-front0.png`);
    assetManager.register("alien-front1", `${baseUrl}assets/alien-front1.png`);
    assetManager.register("alien-front2", `${baseUrl}assets/alien-front2.png`);
    assetManager.register("alien-right0", `${baseUrl}assets/alien-right0.png`);
    assetManager.register("alien-right1", `${baseUrl}assets/alien-right1.png`);
    assetManager.register("alien-right2", `${baseUrl}assets/alien-right2.png`);
    assetManager.register("alien-left0", `${baseUrl}assets/alien-left0.png`);
    assetManager.register("alien-left1", `${baseUrl}assets/alien-left1.png`);
    assetManager.register("alien-left2", `${baseUrl}assets/alien-left2.png`);

    // Register tilemap static layers
    for(const [idx, layer] of Object.entries(tilemapJSON.tilemap)) {
        assetManager.register(idx, layer);
    }

    // Register animation frames
    for(const animation of tilemapJSON.animations) {
        for(const [idx, frame] of Object.entries(animation.frames)){
            assetManager.register(`${animation.name}${idx}`, tilemapJSON.tileSets[frame.tile.tilesetIdx].tiles[frame.tile.tileIdx]);
        }
    }

    // Load all assets
    await assetManager.load();
}

/**
 * Draws the static content of the tilemap on the canvas, including layers and animated tiles.
 * 
 * @param {CanvasRenderingContext2D} ctx The rendering context to draw the static tilemap.
 * @returns {Promise<void>} A promise that resolves when the static tilemap is drawn.
 */
async function drawStaticTilemap(ctx) {
    const assetManager = AssetManager.getInstance();

    // Draw static tilemap layers
    for (let i = 0; i < tilemapJSON.tilemap.length; ++i) {
        const image = assetManager.get(i.toString());
        ctx.drawImage(image, 0, 0);     
    }

    // Start animation for animated tiles
    for (const layer of tilemapJSON.animationmap) {
        for (let r = 0; r < layer.tilemap.length; ++r) {
            for (let c = 0; c < layer.tilemap[r].length; ++c) {
                const animationIdx = layer.tilemap[r][c];

                if (animationIdx !== null) {
                    const animation = tilemapJSON.animations[animationIdx];

                    if (animation) {
                        const animatedTile = new AnimatedTile(animation.frames.map((f, idx) => ({
                            duration: f.duration, assetName: `${animation.name}${idx}`
                        })), r, c);
                        animatedTile.init();
                        animatedTile.play(ctx);
                    }
                }
            }
        }
    }
}
