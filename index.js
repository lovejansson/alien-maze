

import { Art } from "./pim-art/index.js";
import Play from "./Play.js";
import Pause from "./Pause.js";

main();

function main() {

    const audioPlayer = document.querySelector("audio-player");

    if (!audioPlayer) throw new Error("Missing DOM: audio-player");

    const art = new Art({
        play: new Play(),
        pause: new Pause(),
        width: 640,
        height: 360,
        canvas: "#art-canvas",
        frameRate: 60
    });

    art.start();

    audioPlayer.addEventListener("play", async () => {
          await art.play();
    });

    audioPlayer.addEventListener("pause", async () => {
        await art.pause();

    });

    audioPlayer.addEventListener("volume", (e) => {
        art.audio.setVolume(e.detail.volume / 100)
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
        }  else if(data.action === "art-lost-focus") {
     
            if(document.activeElement !== null) document.activeElement.blur();
           
        }
    });

    function togglePlayPause() {
    if(audioPlayer.isOn) {
            audioPlayer.pause();
        } else {
            audioPlayer.play();
        }
    }
}




