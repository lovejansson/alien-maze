import MazePath from './MazePath.js';
import { Sprite, Scene } from './pim-art/index.js';

/**
 * @typedef Direction 
 * @type {"north" | "east" | "south" | "west"}
 */

export default class Alien extends Sprite {

    /** 
     * @type {MazePath}
     */
    #mazePath;

    /**
     * @type {number}
     */
    #currentPixelDiff;

   
    /**
     * @param {Scene} scene The scene on which the alien will be drawn.
     * @param {MazePath} mazePath The maze path the alien will follow.
     */
    constructor(scene, mazePath) {
    
        super(scene,  { x: 0, y: 0 }, scene.tilemap.tileSize, scene.tilemap.tileSize);

        this.#mazePath = mazePath;
    this.id = "a"
        this.#currentPixelDiff = 0;

        this.animations.create("alien-north", {loop: true, frameRate: 100, frames: "alien-north", numberOfFrames: 4, type: "spritesheet"});
        this.animations.create("alien-south", {loop: true, frameRate: 100, frames: "alien-south", numberOfFrames: 4,type: "spritesheet"});
        this.animations.create("alien-west", {loop: true, frameRate: 100, frames: "alien-west", numberOfFrames: 4,type: "spritesheet"});
        this.animations.create("alien-east", {loop: true, frameRate: 100, frames: "alien-east", numberOfFrames: 4,type: "spritesheet"});
    }

    /**
     * Initializes the alien's starting position and sprite assets.
     * @returns {Promise<void>}
     */
    async init() {
        const startCell = this.#mazePath.getCurrentPathCell();
        this.pos = { x: startCell.col * this.scene.tilemap.tileSize, y: startCell.row * this.scene.tilemap.tileSize };
    }

    /**
     * Updates the alien's state, including sprite frame and position.
     */
    update() {

      // Update position
        this.pos = this.#getNextPos();
        this.#currentPixelDiff++;

        if (this.#currentPixelDiff === this.scene.tilemap.tileSize) {
            this.#mazePath.next();
            this.#currentPixelDiff = 0;
        } 

        // Update sprite animation
        const currentDirection = this.#mazePath.getCurrentDirection();
    
        if(!this.animations.isPlaying(`alien-${currentDirection}`)) {
            
            this.animations.play(`alien-${currentDirection}`)
        } else {
            this.animations.update();
        }

    }

    /**
     * Calculates and returns the next position of the alien based on its current direction.
     * @returns {Pos} The next position of the alien.
     * @private
     */
    #getNextPos() {
        
        const currentDirection = this.#mazePath.getCurrentDirection();

        switch (currentDirection) {
            case "north":
                return { x: this.pos.x, y: this.pos.y - 1 };
            case "east":
                return { x: this.pos.x + 1, y: this.pos.y };
            case "south":
                return { x: this.pos.x, y: this.pos.y + 1 };
            case "west":
                return { x: this.pos.x - 1, y: this.pos.y };
        }
    }
}
