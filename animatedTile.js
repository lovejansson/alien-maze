import { Sprite } from "./pim-art/index.js";

export default class AnimatedTile extends Sprite {

    /**
     * @param {Screen} screen
     * @param {{ x: number, y: number }} pos
     * @param {number} width
     * @param {number} height
     * @param { {duration: number; image: string;}[]} frames
     */
    constructor(screen,pos, width, height, frames) {
        super(screen, pos, width, height);
        this.animations.create("animated-tile", {loop: true, frames, type: "frames"});
        this.animations.play("animated-tile");
    }

    update() {
        this.animations.update();
    }
}
