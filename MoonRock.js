import { paintTile } from './canvas';

export default class MoonRock {

    /**
     * @type {CanvasRenderingContext2D}
     */
    _ctx;

    /**
     * @type {Image}
     */
    _tileAsset;

    /**
     * @type {{x: number, y: number}}
     */
    _pos;


    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {{x: number, y: number}} pos 
     * @param {string} tileAsset 
     */
    constructor(ctx, pos, tileAsset) {
        this._ctx = ctx;
        this._pos = pos;
        this._tileAsset = tileAsset;
    }

    /**
     * @returns {{x: number, y: number}}
     */
    get pos() {
        return this._pos;
    }

    update() {
        // Nothing to update here
    }

    draw() {
        console.log("DRAW")
        const tileSize = 64;
        this._ctx.drawImage(this._tileAsset, this._pos.x, this._pos.y, tileSize, tileSize);
    }

}