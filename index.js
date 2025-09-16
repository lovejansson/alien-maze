

import { Art } from "./pim-art/index.js";
import Play from "./Play.js";
import Pause from "./Pause.js";

main();

function main() {

    const musicPlayerEl = document.querySelector("music-player");

    if (!musicPlayerEl) throw new Error("Missing DOM: music-player");

    const art = new Art({
        play: new Play(),
        pause: new Pause(),
        width: 640,
        height: 360,
        canvas: "#art-canvas",
        frameRate: 60
    });

    art.play();

    musicPlayerEl.addEventListener("play", () => {
        if(!art.isPlaying) art.isPlaying = true;
    });

    musicPlayerEl.addEventListener("pause", () => {
        if(art.isPlaying) art.isPlaying = false;
    });

    addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        togglePlayPause();
    } else if(e.key === "f" || e.key === "F") {
        art.enterFullScreen();
    }
    });

    /**
     * Communication from parent document (pimpixels): 
     * 
     * F/f keydown events is relayed here via message "enter-fullscreen".
     * Space keydown events is relayed here via message "toggle-play-pause".
     * 
     */
    addEventListener("message", (event) => {
        const data = event.data;
        if(data.action === "toggle-play-pause"){
            togglePlayPause();
        } else if (data.action === "enter-fullscreen") {
            art.enterFullScreen();
        }
    });

    function togglePlayPause() {
    if(musicPlayerEl.isOn()) {
            musicPlayerEl.pause();
        } else {
            musicPlayerEl.play();
        }
    }

}




