import AnimatedTile from './AnimatedTile.js';
import Alien from './Alien.js';
import MazePath from './MazePath.js';
import "./array.js";
import { createRoadGraph } from './maze.js';
import ImagesManager from './ImagesManager.js';
import AudioPlayer from './AudioPlayer.js';

export const state  = {
    width: 0,
    height: 0,
    tileSize: 0,
}

export const imagesManager = new ImagesManager();
export const audioPlayer = new AudioPlayer();

// "/alien-maze/" is the base URL for production
// "/" is the base URL for development
const baseUrl = "/";
let isPlaying = false;

let tilemapJSON = null;

main();

/**
 * Main function that initializes the game, loads assets, and starts the animation loop.
 * 
 * @async
 * @returns {Promise<void>} A promise that resolves when the game is initialized.
 */
async function main() {

    // Test parsiong html to replace the base URL with "/alien-maze/"

    const indexHTML = await fetch("index.html"); 

    if (!indexHTML.ok) {
        throw new Error(`HTTP error! status: ${indexHTML.status}`);
    }


    const indexHTMLText = await indexHTML.text();

    const finds = indexHTMLText.match(/href="(\/{1})(.*)"/g);
    console.log(finds);
   
    // Replace the base URL in the HTML text
    const updatedHTMLText = indexHTMLText.replace(/href="(\/)(.*)"/, `href="/alien-maze/$2"`).replace(/src="(\/)(.*)"/, `src="/alien-maze/$2"`);
    
    console.log(updatedHTMLText);

    const app = document.getElementById("app");

    /**
     * @type {HTMLCanvasElement}
     */
    const canvasTilemap = document.getElementById("tilemap-static");

    /**
     * @type {HTMLCanvasElement}
     */
    const canvasDynamic = document.getElementById("tilemap-dynamic");

    const musicPlayer = document.querySelector("music-player");

    if(!app) throw new Error("Missing DOM: app");

    if (!canvasTilemap || !canvasDynamic) throw new Error("Missing DOM: canvas");

    if (!musicPlayer) throw new Error("Missing DOM: music player");

    tilemapJSON = await loadTilemap();
    if (!tilemapJSON) throw new Error("Tilemap JSON is null");

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

    const animatedTiles = createAnimatedTiles();

    musicPlayer.addEventListener("play", () => {
        if(!isPlaying) isPlaying = true;
    });

    musicPlayer.addEventListener("pause", () => {
        if(isPlaying) isPlaying = false;
    });

    const startImage = imagesManager.get("start");

    play();


    /**
     * Game loop that continually updates and draws the game state.
     * 
     * @returns {void}
     */
    function play() {

            requestAnimationFrame((elapsed) => {
                ctxDynamic.clearRect(0, 0, tilemapJSON.width, tilemapJSON.height);

                if(isPlaying) {
                   
                    for(const animatedTile of animatedTiles) {
                        animatedTile.update(elapsed);
                        animatedTile.draw(ctxDynamic);
                    }

                    alien.update();
                    alien.draw(ctxDynamic);

                    if(!musicPlayer.isOn()) {
                        musicPlayer.play();
                    }
                }else {
                    if(musicPlayer.isOn()) {
                        musicPlayer.pause();
                    }

                    ctxDynamic.drawImage(startImage, 0, 0, tilemapJSON.width, tilemapJSON.height);
                }
                play();
            });
         
    }
}

async function loadTilemap() {
  
    try {
        const response = await fetch(`${baseUrl}tilemap.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tilemapJSON = await response.json();
        return tilemapJSON;
    }
    catch (error) {
        console.error("Error loading tilemap:", error);
        throw error;
    }
}

/**
 * Initializes and loads all assets using the ImagesManager.
 * Registers image sources and waits for all assets to be loaded before continuing.
 * 
 * @async
 * @returns {Promise<void>} A promise that resolves when all assets have been loaded.
 */
async function initAssets() {

    // Register alien assets
    imagesManager.add("alien-north", `${baseUrl}images/alien-north.png`);
    imagesManager.add("alien-east", `${baseUrl}images/alien-east.png`);
    imagesManager.add("alien-south", `${baseUrl}images/alien-south.png`);
    imagesManager.add("alien-west", `${baseUrl}images/alien-west.png`);
    imagesManager.add("start", `${baseUrl}images/thumbnail.png`);

    // Register tilemap static layers
    for(const [idx, layer] of Object.entries(tilemapJSON.tilemap)) {
        imagesManager.add(idx, layer);
    }

    // Register animation frames
    for(const animation of tilemapJSON.animations) {
        for(const [idx, frame] of Object.entries(animation.frames)){
            imagesManager.add(`${animation.name}${idx}`, tilemapJSON.tileSets[frame.tile.tilesetIdx].tiles[frame.tile.tileIdx]);
        }
    }

    // Load all assets
    await imagesManager.load();
}

function createAnimatedTiles() {

    const animatedTiles = [];
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
                        animatedTiles.push(animatedTile);
                    }
                }
            }
        }
    }

    return animatedTiles;
}

/**
 * Draws the static content of the tilemap on the canvas, including layers and animated tiles.
 * 
 * @param {CanvasRenderingContext2D} ctx The rendering context to draw the static tilemap.
 * @returns {Promise<void>} A promise that resolves when the static tilemap is drawn.
 */
async function drawStaticTilemap(ctx) {
    // Draw static tilemap layers
    for (let i = 0; i < tilemapJSON.tilemap.length; ++i) {
        const image = imagesManager.get(i.toString());
        ctx.drawImage(image, 0, 0);     
    }
}
