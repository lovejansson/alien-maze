import MazePath from './MazePath.js';
import { Sprite, Screen } from './pim-art/index.js';

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
     * @param {Screen} screen The screen on which the alien will be drawn.
     * @param {MazePath} mazePath The maze path the alien will follow.
     */
    constructor(screen, mazePath) {

        super(screen,  { x: 0, y: 0 }, screen.tilemap.tileSize, screen.tilemap.tileSize);

        this.#mazePath = mazePath;

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
        this.pos = { x: startCell.col * this.screen.tilemap.tileSize, y: startCell.row * this.screen.tilemap.tileSize };
    }

    /**
     * Updates the alien's state, including sprite frame and position.
     */
    update() {

      // Update position
        this.pos = this.#getNextPos();
        this.#currentPixelDiff++;

        if (this.#currentPixelDiff === this.screen.tilemap.tileSize) {
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
