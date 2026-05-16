import { iconeUmori,mesi } from "./config.js";
import { setUmore } from "./fb_functions.js";
import fitty from 'https://cdn.skypack.dev/fitty';

let fittyOra = null;
export function renderOra(oggi) {
    const oraElement = document.getElementById("ora");
    const h = String(oggi.getHours()).padStart(2, '0');
    const m = String(oggi.getMinutes()).padStart(2, '0');
    const s = String(oggi.getSeconds()).padStart(2, '0');
    oraElement.textContent = `${h}:${m}:${s}`;
    if (oraElement.offsetParent === null) return;
    if (!fittyOra) {
        fittyOra = fitty('#ora', {
            minSize: 100,
            maxSize: 120,
            multiLine: false
        });
        return;
    }
    fittyOra[0].fit();
}

let fittyData = null;
let fittySanto = null;
export function renderData(giorno, numero, mese, santo) {
    const elDow = document.getElementById("dow");
    const elDayMese = document.getElementById("dayMese");
    const elSanto = document.getElementById("main_saint");
    elDow.textContent = giorno;
    elDayMese.textContent = `${numero} ${mese}`;
    elSanto.textContent = santo;
    if (elDayMese.offsetParent === null) return;
    if (!fittyData) {
        fittyData = fitty('#dayMese', {
            minSize: 35,
            maxSize: 70,
            multiLine: false
        });
    } else {
        fittyData[0].fit();
    }
    if (!fittySanto) {
        fittySanto = fitty('#main_saint', {
            minSize: 14,
            maxSize: 24,
            multiLine: true
        });
    } else {
        fittySanto[0].fit();
    }
}

export function renderMeteo(meteo) {
    const iconBox = document.getElementById("meteo_icon");
    const contentBox = document.getElementById("meteo_contenuto");
    if (iconBox.offsetParent === null) return;
    const iconImg = iconBox.querySelector("img");
    const iconText = iconBox.querySelector("span");
    if (iconImg) iconImg.src = meteo.icona;
    if (iconText) iconText.textContent = meteo.situazione;
    const tempNow = contentBox.querySelector(".temp-now");
    const tempMin = contentBox.querySelector(".temp-min");
    const tempMax = contentBox.querySelector(".temp-max");
    if (tempNow) tempNow.textContent = `${meteo.temp}°C`;
    if (tempMin) tempMin.textContent = `${meteo.tempMin}°C`;
    if (tempMax) tempMax.textContent = `${meteo.tempMax}°C`;
}

export function renderAppuntoCompleto(appunto, linkFoto) {
    const container = document.getElementById("appunti");

    const imgPreload = new Image();
    imgPreload.src = linkFoto;

    imgPreload.onload = () => {
        container.innerHTML = `
            <div class="appunto-wrapper">
                <div class="avatar-container">
                    <img src="${linkFoto}" class="avatar">
                </div>

                <div class="contenuto-appunto">
                    <span class="appunto-header">${appunto.nome} ricorda a tutti che:</span>
                    <div class="testo-appunto">${appunto.appunto}</div>
                </div>
            </div>
        `;
    };
}


let fittyNextEvento = null;
let fittyNextGiorno = null;
let nextInterval = null;

export function renderNext(eventiDelGiorno, isDay) {
    const el_next = document.getElementById("next-container");
    if (nextInterval) clearInterval(nextInterval);

    if (!eventiDelGiorno || eventiDelGiorno.length === 0) {
        el_next.innerHTML = "<span>Nessun evento</span>";
        return;
    }
    el_next.classList.toggle("happy_next-container", isDay);
    const auguri = isDay ? "FESTAAA!" : "";
    const elAuguri = document.getElementById("next-auguri");
    const elEvento = document.getElementById("next-evento");
    const elData = document.getElementById("next-data");
    let i = 0;
    const ruota = () => {
        const eventoCorrente = eventiDelGiorno[i];
        const mese = parseInt(eventoCorrente.dataEvento.toString().slice(4, 6), 10) - 1;
        const giorno = eventoCorrente.dataEvento.toString().slice(6, 8);
        elAuguri.textContent = auguri;
        elEvento.textContent = eventoCorrente.evento;
        elData.textContent = `${giorno} ${mesi[mese]}`;
        if (!fittyNextGiorno) {
            fittyNextGiorno = fitty('#next-data', {
                minSize: 15,
                maxSize: 24,
                multiLine: false
            });
        } else {
            fittyNextGiorno[0].fit();
        }

        if (!fittyNextEvento) {
            fittyNextEvento = fitty('#next-evento', {
                minSize: 12,
                maxSize: 28,
                multiLine: false
            });
        } else {
            fittyNextEvento[0].fit();
        }

        i = (i + 1) % eventiDelGiorno.length;
    };
    ruota();
    nextInterval = setInterval(ruota, 5000);
}


export function renderUmori(umori){
    let el_umore = document.getElementById("umori-container");
    let html="";
    for (const [nome, idUmoreAttuale] of Object.entries(umori)) {
        const emojiAttuale = iconeUmori.find(e => e.id === idUmoreAttuale);
        const testoUmore = emojiAttuale ? emojiAttuale.nome : "Non impostato";
        html+=`
            <div class = "quadrante" data-membro="${nome}">
                <span class="membro-label">${nome}</span>
                <div class="emozioni-list">
                    ${iconeUmori.map(emoji => `
                        <button class="umore-btn" data-membro="${nome}" data-id="${emoji.id}">
                        <img 
                            src="${emoji.path}" 
                            alt="${emoji.nome}"
                            data-id="${emoji.id}"
                            class="umore-icon ${emoji.id === idUmoreAttuale ? 'active' : ''}"
                        >
                        </button>
                        `).join('')}
                </div>
                <span class="stato-testo">${testoUmore}</span>
            </div>
        `;
    }
    el_umore.innerHTML=html;
}

export function agganciaListenerUmori() {
    const el_umore = document.getElementById("umore");
    el_umore.onclick = (e) => {
        const btn = e.target.closest('.umore-btn');
        if (btn) {
            const nome = btn.dataset.membro;
            const idUmore = parseInt(btn.dataset.id);
            setUmore(nome,idUmore);
        }
    };
}



// Funzione per aggiornare slider giorno/notte
let sunMoonInterval = null;

export async function updateDashboardSunMoon() {
    const player = document.getElementById('sunMoonPlayer');
    const infoBox = document.getElementById('sun-info');

    const lat = 45.2272;
    const lng = 7.7852;
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status !== "OK") throw new Error("API Status not OK");

        const sunriseDate = new Date(data.results.sunrise);
        const sunsetDate = new Date(data.results.sunset);
        const nowDate = new Date();

        const now = nowDate.getHours() * 60 + nowDate.getMinutes();
        const sunrise = sunriseDate.getHours() * 60 + sunriseDate.getMinutes();
        const sunset = sunsetDate.getHours() * 60 + sunsetDate.getMinutes();

        const anim = player.getLottie();
        if (!anim) return;

        const totalFrames = anim.totalFrames;
        let targetFrame;

        if (now >= sunrise && now < sunset) {
            const dayProgress = (now - sunrise) / (sunset - sunrise);
            targetFrame = (totalFrames / 2) * dayProgress;
        } else {
            let nightProgress;
            if (now >= sunset) {
                nightProgress = (now - sunset) / (1440 - sunset + sunrise);
            } else {
                nightProgress = (1440 - sunset + now) / (1440 - sunset + sunrise);
            }
            targetFrame = (totalFrames / 2) + ((totalFrames / 2) * nightProgress);
        }

        anim.goToAndStop(targetFrame, true);

        if (infoBox) {
            const sRise = sunriseDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit'});
            const sSet = sunsetDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            infoBox.innerHTML = `
                <div style="margin-right:10px"><img src="./assets/icons/temperature/sunrise.svg"/>${sRise}</div>
                <div><img src="./assets/icons/temperature/sunset.svg"/>${sSet}</div>
            `;
        }

    } catch (error) {
        console.error("Errore aggiornamento SunMoon:", error);
        const anim = player.getLottie();
        if (anim) {
            const h = new Date().getHours();
            anim.goToAndStop(h > 20 || h < 6 ? anim.totalFrames - 1 : 0, true);
        }
    }
}


//SLIDESHOW
let current = "A";

export function caricaFoto(filename, orientamento) {
    const fotoA = document.getElementById("fotoA");
    const fotoB = document.getElementById("fotoB");

    const visibile = current === "A" ? fotoA : fotoB;
    const nascosta = current === "A" ? fotoB : fotoA;

    // Nascondo quella nascosta
    nascosta.classList.add("hidden");

    // Reset classi
    nascosta.classList.remove("pan-image", "foto-horizontal");
    nascosta.style.animation = "none";
    nascosta.style.transform = "none";

    // Carico la nuova immagine sulla nascosta
    nascosta.src = filename;

    nascosta.onload = () => {
        // Applico la classe corretta SOLO ora
        if (orientamento === "verticale") {
            nascosta.classList.add("pan-image");
        } else {
            nascosta.classList.add("foto-horizontal");
        }

        // Mostro la nuova
        nascosta.classList.remove("hidden");

        // Nascondo la vecchia
        visibile.classList.add("hidden");

        // Switch buffer
        current = current === "A" ? "B" : "A";
    };
}





