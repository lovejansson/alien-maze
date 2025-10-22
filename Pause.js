import "./array.js";
import {BASE_URL} from "./config.js";
import { Scene } from "./pim-art/index.js";

export default class Pause extends Scene {
    
    constructor() {
        super();
    }

    async init() {
        this.art.images.add("thumbnail", `${BASE_URL}assets/images/thumbnail.png`);
        await this.art.images.load();
        this.isInitialized = true;

    }

    draw(ctx) {
        ctx.drawImage( this.art.images.get("thumbnail"), 0, 0, this.art.width, this.art.height);
    }

}