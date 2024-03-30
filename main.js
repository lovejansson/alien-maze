import './style.css'
import tilemapJSON from "./vanilla_tilemap.json";
import AnimatedTile from './animatedTile';
import { getRandomRoadCell, bfs } from './maze';
import Sprite from "./sprite"

app();

/**
 * @typedef Animation
 * @property {string} name 
 * @property {number[]} tiles 
 * @property {number} duration duration in ms 
 */

function app() {
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

    image.addEventListener("load", () => {
        ctxTilemap.drawImage(image, 0, 0);
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

        const objectmap = tilemapJSON.objectmap;

        const roadGraph = createRoadGraph(objectmap);

        const sprite = new Sprite(ctxSprite, roadGraph, {
            north: ["/assets/sprite-back0.png", "/assets/sprite-back1.png", "/assets/sprite-back0.png", "/assets/sprite-back2.png"],
            east: ["/assets/sprite-right0.png", "/assets/sprite-right1.png", "/assets/sprite-right0.png", "/assets/sprite-right2.png"],
            south: ["/assets/sprite-front0.png", "/assets/sprite-front1.png", "/assets/sprite-front0.png", "/assets/sprite-front2.png"],
            west: ["/assets/sprite-left0.png", "/assets/sprite-left1.png", "/assets/sprite-left0.png", "/assets/sprite-left2.png"]
        });
        sprite.init();

        run();

        function run() {
            requestAnimationFrame((elapsed) => {
                console.log("RUNNING")
                sprite.update(elapsed);
                sprite.draw();
                run();
            });
        }
    });
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