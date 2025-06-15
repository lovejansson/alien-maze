

import { Art } from "./pim-art/index.js";
import Play from "./Play.js";

main();

function main() {

    const musicPlayer = document.querySelector("music-player");

    if (!musicPlayer) throw new Error("Missing DOM: music-player");

    const art = new Art({
        play: new Play(),
        pauseImage:"pause-screen",
        width: 640,
        height: 360,
        canvasId: "#art-canvas",
    });

    art.play();

    musicPlayer.addEventListener("play", () => {
        if(!art.isPlaying) art.isPlaying = true;
    });

    musicPlayer.addEventListener("pause", () => {
        if(art.isPlaying) art.isPlaying = false;
    });

}




