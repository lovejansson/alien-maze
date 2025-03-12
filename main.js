import './style.css'
import tilemapJSON from "./vanilla_tilemap.json";
import AnimatedTile from './AnimatedTile';
import Alien from './Alien';
import MazePath from './MazePath';
import MoonRock from './MoonRock';
import { getRandomRoadCell } from './maze';
import "./array"

app();

/**
 * @typedef Animation
 * @property {string} name 
 * @property {number[]} tiles 
 * @property {number} duration duration in ms 
 */

async function app() {

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

    const ctxStatic = canvasTilemap.getContext("2d");
    const ctxDynamic = canvasDynamic.getContext("2d");

    if (!ctxStatic || !ctxDynamic) throw new Error("Canvas rendering context is null");

    ctxStatic.imageSmoothingEnabled = false;
    ctxDynamic.imageSmoothingEnabled = false;

    drawStaticTilemap(ctxStatic);

    const roadGraph = createRoadGraph(tilemapJSON.objectmap);

    const mazePath = new MazePath(roadGraph);

    mazePath.init();

     await drawMoonRocks(ctxStatic, roadGraph);

    const alienAssets = await loadAlienAssets()

    const alien = new Alien(ctxDynamic, mazePath, alienAssets);

    alien.init();

    play();

    function play() {

        requestAnimationFrame((elapsed) => {
            ctxDynamic.clearRect(0, 0, tilemapJSON.width, tilemapJSON.height);
            alien.update(elapsed);
         
         
       
            alien.draw();


            play();
        });
    }
   
}


/**
 * Draws random moon rocks in the maze.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Map} roadGraph
 */
async function drawMoonRocks(ctx, roadGraph) {

    const moonRockAssets = await loadAssets(["/assets/rock0.png", "/assets/rock1.png", "/assets/rock2.png", "/assets/rock3.png"]);

    for (let i = 0; i < 25; ++i) {

        const randomImage = moonRockAssets.random();
        
        const pos = getRandomRoadCell(roadGraph);

        const moonRock = new MoonRock(ctx, { x: pos.col * 64, y: pos.row * 64 }, randomImage);


        moonRock.draw()
    
    }

   
}

/**
 * Draws all the static content on the canvas.
 * @param {CanvasRenderingContext2D} ctx 
 */
function drawStaticTilemap(ctx){

  const image = new Image();
  image.src = tilemapJSON.tilemap;

  image.addEventListener("load", async() => {

        // Draw the image on canvas
        ctx.drawImage(image, 0, 0);
        
        // Start stars animations 
        for (let r = 0; r < tilemapJSON.animationmap.length; ++r) {
            for (let c = 0; c < tilemapJSON.animationmap[0].length; ++c) {

                if (tilemapJSON.animationmap[r][c] !== null) {

                    const animation = tilemapJSON.animations[tilemapJSON.animationmap[r][c]];

                    const animationImages = await loadAssets(animation.tiles.map(t => tilemapJSON.tiles[t]))

                    const animatedTile = new AnimatedTile(ctx, animationImages, animation.duration, r, c);

                    animatedTile.play();
                }
            }
        }
    });
}


async function loadAlienAssets() {
    const assets = {
        north: ["/assets/alien-back0.png", "/assets/alien-back1.png", "/assets/alien-back0.png", "/assets/alien-back2.png"],
        east: ["/assets/alien-right0.png", "/assets/alien-right1.png", "/assets/alien-right0.png", "/assets/alien-right2.png"],
        south: ["/assets/alien-front0.png", "/assets/alien-front1.png", "/assets/alien-front0.png", "/assets/alien-front2.png"],
        west: ["/assets/alien-left0.png", "/assets/alien-left1.png", "/assets/alien-left0.png", "/assets/alien-left2.png"]
    };

    const images = {
        north: [],
        east: [],
        south: [],
        west: []
    }

    for (const dir in assets) {
        images[dir] = await loadAssets(assets[dir]); 
    }

    return images;
}


/**
 * Loads assets from path and returns images.
 * @param {string[]} assets 
 */
async function loadAssets(assets) {

    const images = [];

    for (const asset of assets) {

        images.push(new Promise((resolve, reject) => {
            const image = new Image();
            image.src = asset;

            image.addEventListener("load", () => {
                resolve(image);
            });

            image.addEventListener("error", () => {
                reject();
            });
        }));
    }

    return await Promise.all(images);
}


function createRoadGraph(objectmap) {
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

function getRoadCellNeighbours(objectmap, r, c) {
    const n = [];

    if (r !== 0 && objectmap[r - 1][c] && objectmap[r - 1][c].name === "road") {
        n.push({ row: r - 1, col: c })
    }

    if (r !== objectmap.length - 1 && objectmap[r + 1][c] && objectmap[r + 1][c].name === "road") {
        n.push({ row: r + 1, col: c })
    }

    if (c !== 0 && objectmap[r][c - 1] && objectmap[r][c - 1].name === "road") {
        n.push({ row: r, col: c - 1 })
    }

    if (c !== objectmap[0].length && objectmap[r][c + 1] && objectmap[r][c + 1].name === "road") {
        n.push({ row: r, col: c + 1 })
    }
    return n;
}