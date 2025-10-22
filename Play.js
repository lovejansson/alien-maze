import AnimatedTile from './AnimatedTile.js';
import Alien from './Alien.js';
import MazePath from './MazePath.js';
import "./array.js";
import { createRoadGraph } from './maze.js';
import {BASE_URL} from "./config.js";
import { Scene } from "./pim-art/index.js";

export default class Play extends Scene {
    
    constructor() {
        super();
    }

    async init() {

        this.tilemap = await this.#loadTilemap();

        await this.#loadAssets();

        this.animatedTiles = this.#createAnimatedTiles();

        const roadGraph = createRoadGraph(this.tilemap.objectmap);
        const mazePath = new MazePath(roadGraph);
        mazePath.init();
        this.alien = new Alien(this, mazePath);
        this.alien.init();
        this.isInitialized = true;

    }

    start() {
        this.art.audio.play("background", true);
    }

    stop() {
        this.art.audio.stop("background");
    }

    update() {
        for(const animatedTile of this.animatedTiles) {
            animatedTile.update();
        }

         this.alien.update();
    }


    draw(ctx) {
        this.#drawStatic(ctx);

        for(const animatedTile of  this.animatedTiles) {
            animatedTile.draw(ctx);
        }

       

        this.alien.draw(ctx);
    }

    
    /**
     * Draws the static content of the tilemap on the canvas, including layers and animated tiles.
     * 
     * @param {CanvasRenderingContext2D} ctx The rendering context to draw the static tilemap.
     * @returns {Promise<void>} A promise that resolves when the static tilemap is drawn.
     */
    #drawStatic(ctx) {
        for (let i = 0; i < this.tilemap.tilemap.length; ++i) {
            const image = this.art.images.get(i.toString());
            ctx.drawImage(image, 0, 0);     
        }
    }

        
    #createAnimatedTiles() {

        const animatedTiles = [];

        for (const layer of this.tilemap.animationmap) {
            for (let r = 0; r < layer.tilemap.length; ++r) {
                for (let c = 0; c < layer.tilemap[r].length; ++c) {
                    const animationIdx = layer.tilemap[r][c];

                    if (animationIdx !== null) {

                        const animation = this.tilemap.animations[animationIdx];

                        if (animation) {

                            const animatedTile = new AnimatedTile(this, {x: c * this.tilemap.tileSize, y: r * this.tilemap.tileSize}, this.tilemap.tileSize, this.tilemap.tileSize,
                                 animation.frames.map((f, idx) => ({
                                duration: f.duration, image: `${animation.name}${idx}`
                            })));

                            animatedTiles.push(animatedTile);
                        } 
                    }
                }
            }
        }

        return animatedTiles;
    }


    async #loadTilemap() {
  
        try {
            const res = await fetch(`${BASE_URL}tilemap.json`);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const tilemap = await res.json();

            return tilemap;
        }
        catch (e) {
            console.error("Error loading tilemap:", e);
            throw e;
        }
}


    /**
     * @returns {Promise<void>} A promise that resolves when all assets have been loaded.
     */
    async #loadAssets() {

        this.art.images.add("alien-north", `${BASE_URL}assets/images/alien-north.png`);
        this.art.images.add("alien-east", `${BASE_URL}assets/images/alien-east.png`);
        this.art.images.add("alien-south", `${BASE_URL}assets/images/alien-south.png`);
        this.art.images.add("alien-west", `${BASE_URL}assets/images/alien-west.png`);

        for(const [idx, layer] of Object.entries(this.tilemap.tilemap)) {
             this.art.images.add(idx, layer);
        }

        for(const animation of this.tilemap.animations) {
            for(const [idx, frame] of Object.entries(animation.frames)){
                 this.art.images.add(`${animation.name}${idx}`, this.tilemap.tileSets[frame.tile.tilesetIdx].tiles[frame.tile.tileIdx]);
            }
        }

        await  this.art.images.load();

        this.art.audio.add("background", `${BASE_URL}assets/audio/background.wav`);

        await this.art.audio.load();
    }

}