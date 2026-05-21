import {startDashboard } from "./dashboard.js";
import {updateDashboardSunMoon} from "./ui-manager.js";
import { startSlide } from "./slideshow.js";
import {aggiornaOrologioNotturno} from "./night_mode.js";
import {resetTuttiUmori, getNightDay, setNightDay} from "./fb_functions.js";

export function isNightTime() {
    return new Promise((resolve) => {
        const ora = new Date().getHours();
        const minuti = new Date().getMinutes();
        const totale = ora * 60 + minuti;

        // Fascia notte automatica
        if (totale >= 60 && totale < 330) {
            setNightDay("on");
            resolve(true);
            return;
        }

        // Fuori fascia → leggo manuale
        getNightDay((manuale) => {
            if (manuale === "on") {
                resolve(true);
            } else {
                setNightDay("off");
                resolve(false);
            }
        });
    });
}





/*
const isNightTime = () => {
    return false; 
};*/

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export async function startAll() {
    while (true) {

        const isNight = await isNightTime();

        if (isNight) {
            changeLayout("night");

            // ⭐ L’orologio viene aggiornato OGNI ciclo
            aggiornaOrologioNotturno();
            resetTuttiUmori();

            await sleep(60000);
            continue;
        }

        // DAY MODE
        changeLayout("dash");
        await safeRun(startDashboard, 20000);
        await sleep(120000);

        changeLayout("slide");
        await safeRun(startSlide, 60000);
    }
}



let sunMoonInterval = null;

function initSunMoon() {
    if (!sunMoonInterval) {
        updateDashboardSunMoon(); // primo aggiornamento immediato
        sunMoonInterval = setInterval(updateDashboardSunMoon, 900000); // ogni 15 min
    }
}

startAll();
initSunMoon();

export function changeLayout(stato){
    let el_dash = document.getElementById("dashboard");
    let el_slide = document.getElementById("slideshow");
    let el_night = document.getElementById("nightdiv");
    el_dash.style.display = "none";
    el_slide.style.display = "none";
    if(el_night) el_night.style.display = "none";

    if (stato === "slide") {
        el_slide.style.display = "block";
        document.body.style.backgroundColor = "";
        document.documentElement.style.setProperty('--bg-page', '');
    } else if (stato === "dash") {
        el_dash.style.display = "block";
        document.body.style.backgroundColor = "";
        document.documentElement.style.setProperty('--bg-page', '');
    } else if (stato === "night") {
        if(el_night) el_night.style.display = "flex";
        document.body.style.backgroundColor = "black";
    }
}
async function safeRun(fn, timeout = 20000) {
    return Promise.race([
        fn(),
        new Promise((_, reject) =>
            setTimeout(() => reject("timeout"), timeout)
        )
    ]).catch(err => console.warn("Errore o timeout in:", fn.name, err));
}
