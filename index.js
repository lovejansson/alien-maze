

import { Art } from "./pim-art/index.js";
import Play from "./Play.js";
import Pause from "./Pause.js";

main();

function main() {

    const musicPlayer = document.querySelector("music-player");

    if (!musicPlayer) throw new Error("Missing DOM: music-player");

    const art = new Art({
        play: new Play(),
        pause: new Pause(),
        width: 640,
        height: 360,
        canvas: "#art-canvas",
        frameRate: 60
    });

    art.play();

    musicPlayer.addEventListener("play", () => {
        if(!art.isPlaying) art.isPlaying = true;
    });

    musicPlayer.addEventListener("pause", () => {
        if(art.isPlaying) art.isPlaying = false;
    });

}




