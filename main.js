import './style.css'
import tilemapJSON from "./vanilla_tilemap.json";
import AnimatedTile from './animatedTile';
import Sprite from "./sprite"
import MazePath from './MazePath';
import * as array from "./array"
import MoonRock from './MoonRock';
import { getRandomRoadCell } from './maze';

app();

/**
 * @typedef Animation
 * @property {string} name 
 * @property {number[]} tiles 
 * @property {number} duration duration in ms 
 */

async function app() {
    const canvasTilemap = document.getElementById("tilemap-static");
    const canvasSprite = document.getElementById("sprite");

    if (!canvasTilemap || !canvasSprite) throw "Missing DOM: canvas";

    canvasTilemap.width = tilemapJSON.width;
    canvasTilemap.height = tilemapJSON.height;
    canvasSprite.width = tilemapJSON.width;
    canvasSprite.height = tilemapJSON.height;

    const ctxTilemap = canvasTilemap.getContext("2d");
    const ctxSprite = canvasSprite.getContext("2d");

    ctxTilemap.imageSmoothingEnabled = false;
    ctxSprite.imageSmoothingEnabled = false;

    // Draw static tilemap image
    const image = new Image();

    image.src = tilemapJSON.tilemap;

    image.addEventListener("load", async() => {
        ctxTilemap.drawImage(image, 0, 0);
        // Start animations

        for (let r = 0; r < tilemapJSON.animationmap.length; ++r) {
            for (let c = 0; c < tilemapJSON.animationmap[0].length; ++c) {

                if (tilemapJSON.animationmap[r][c] !== null) {

                    const animation = tilemapJSON.animations[tilemapJSON.animationmap[r][c]];

                    const animationImages = await loadAnimationAssets(animation.tiles.map(t => tilemapJSON.tiles[t]))

                    const animatedTile = new AnimatedTile(ctxTilemap, animationImages, animation.duration, r, c);

                    animatedTile.run();

                }
            }
        }

        console.dir(tilemapJSON.animationmap);

        const objectmap = tilemapJSON.objectmap;

        const roadGraph = createRoadGraph(objectmap);

        const mazePath = new MazePath(roadGraph);

        mazePath.init();

        const spriteAssets = await loadSpriteAssets()

        const sprite = new Sprite(ctxSprite, mazePath, spriteAssets);

        sprite.init();

        let moonRocks = [];

        let collectedMoonRocks = 0;

        const countDiv = document.getElementById("count");

        if (!countDiv) throw "Missing DOM: count div"

        const moonRockAssets = await loadMoonRockAssets();


        for (let i = 0; i < 50; ++i) {
            const randomImage = moonRockAssets.random();
            const pos = getRandomRoadCell(roadGraph);

            const moonRock = new MoonRock(ctxSprite, { x: pos.col * 64, y: pos.row * 64 }, randomImage);
            moonRocks.push(moonRock);

        }

        run();

        function run() {
            requestAnimationFrame((elapsed) => {
                ctxSprite.clearRect(0, 0, tilemapJSON.width, tilemapJSON.height);
                sprite.update(elapsed);

                const { countRemoved, updatedMoonRocks } = moonRocks.reduce((acc, curr) => {
                    if (isColliding(sprite.pos, curr.pos)) {
                        acc.countRemoved++;

                    } else {
                        acc.updatedMoonRocks.push(curr);
                    }

                    return acc;

                }, { countRemoved: 0, updatedMoonRocks: [] });

                for (let i = 0; i < countRemoved; ++i) {
                    const randomImage = moonRockAssets.random();
                    const pos = getRandomRoadCell(roadGraph);
                    const moonRock = new MoonRock(ctxSprite, { x: pos.col * 64, y: pos.row * 64 }, randomImage);
                    moonRocks.push(moonRock);

                }

                moonRocks = updatedMoonRocks;

                collectedMoonRocks += countRemoved;

                countDiv.children.item(1).textContent = collectedMoonRocks;

                for (const moonRock of moonRocks) {
                    moonRock.draw();
                }

                sprite.draw();

                run();
            });
        }
    });
}

async function loadAnimationAssets(assets) {
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

async function loadSpriteAssets() {
    const assets = {
        north: ["/assets/sprite-back0.png", "/assets/sprite-back1.png", "/assets/sprite-back0.png", "/assets/sprite-back2.png"],
        east: ["/assets/sprite-right0.png", "/assets/sprite-right1.png", "/assets/sprite-right0.png", "/assets/sprite-right2.png"],
        south: ["/assets/sprite-front0.png", "/assets/sprite-front1.png", "/assets/sprite-front0.png", "/assets/sprite-front2.png"],
        west: ["/assets/sprite-left0.png", "/assets/sprite-left1.png", "/assets/sprite-left0.png", "/assets/sprite-left2.png"]
    };

    const images = {
        north: [],
        east: [],
        south: [],
        west: []
    }

    for (const dir in assets) {
        for (const asset of assets[dir]) {
            const image = await new Promise((resolve, reject) => {
                const image = new Image();
                image.src = asset;

                image.addEventListener("load", () => {
                    resolve(image);
                });

                image.addEventListener("error", () => {
                    reject()
                });
            });

            images[dir].push(image);
        }
    }

    return images;
}

/**
 * 
 * @returns {Promise<Image[]>}
 */
async function loadMoonRockAssets() {
    const assets = ["/assets/rock0.png", "/assets/rock1.png", "/assets/rock2.png", "/assets/rock3.png"];
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

/**
 * 
 * @param {{x: number, y: number}} pos1 
 * @param {x: number, y: number} pos2 
 * @returns {boolean}
 */
function isColliding(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) < 42 && Math.abs(pos1.y - pos2.y) < 42
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