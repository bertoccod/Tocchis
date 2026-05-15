import {ascoltoAppunti, ascoltoNext, ascoltoUmori} from "./fb_functions.js";
import { renderAppuntoCompleto, renderOra, renderData, renderNext, renderUmori,agganciaListenerUmori,renderMeteo,updateDashboardSunMoon} from './ui-manager.js';
import { tempoTimerAppunti, dayOfWeek, mesi } from './config.js';
import { codiciMeteo, codiciIcone, codiciSvgMeteo } from "./config.js";

export async function startDashboard() {
    gestioneOra();
    gestioneData();
    getMeteo();
    gestioneAppunti();
    gestioneNext();
    umore();
}

let oraInterval = null;
export function gestioneOra(){
    if (oraInterval) return; // evita duplicati
    const aggiorna = () => {
        const oggi = new Date();
        renderOra(oggi);
    };
    aggiorna();
    oraInterval = setInterval(aggiorna, 1000);
}

let ultimoGiornoSanto = null;
let ultimoSanto = null;
async function gestioneData(){
    const oggi = new Date();
    const giornoCorrente = oggi.getDate();
    if (ultimoGiornoSanto === giornoCorrente && ultimoSanto) {
        renderData(
            dayOfWeek[oggi.getDay()],
            oggi.getDate(),
            mesi[oggi.getMonth()],
            ultimoSanto
        );
        return;
    }
    try {
        const res = await fetch('https://www.santodelgiorno.it/santi.json');
        const dati = await res.json();
        const santo = dati.find(s => s.default == "1") || dati[0];
        ultimoGiornoSanto = giornoCorrente;
        ultimoSanto = santo.nome;
        renderData(
            dayOfWeek[oggi.getDay()],
            oggi.getDate(),
            mesi[oggi.getMonth()],
            santo.nome
        );
    } catch (err) {
        console.warn("Errore santo del giorno:", err);
        renderData(
            dayOfWeek[oggi.getDay()],
            oggi.getDate(),
            mesi[oggi.getMonth()],
            "—"
        );
    }
}

let ultimoMeteo = null;
let ultimoAggiornamentoMeteo = 0;
async function getMeteo(){
    const ora = Date.now();
    if (ultimoMeteo && (ora - ultimoAggiornamentoMeteo < 10 * 60 * 1000)) {
        renderMeteo(ultimoMeteo);
        return;
    }
    const lat = 45.229832755906486;
    const lon = 7.7897068826093046;
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        const dati = await response.json();
        const meteoAttuale = {
            situazione: codiciMeteo[dati.current.weather_code] || "Condizioni Variabili",
            icona: codiciSvgMeteo[dati.current.weather_code] || "ph ph-empty",
            temp: dati.current.temperature_2m,
            tempMax: dati.daily.temperature_2m_max[0],
            tempMin: dati.daily.temperature_2m_min[0],
            alba: dati.daily.sunrise[0].split("T")[1],
            tramonto: dati.daily.sunset[0].split("T")[1]
        };
        ultimoMeteo = meteoAttuale;
        ultimoAggiornamentoMeteo = ora;
        renderMeteo(meteoAttuale);
    } catch (error) {
        console.warn("Errore meteo:", error);
        if (ultimoMeteo) {
            renderMeteo(ultimoMeteo);
        } else {
            renderMeteo({
                situazione: "N/D",
                icona: "ph ph-empty",
                temp: "--",
                tempMax: "--",
                tempMin: "--",
                alba: "--:--",
                tramonto: "--:--"
            });
        }
    }
}

let appuntiInitialized = false;
let timerAppunti = null;
let indiceCorrente = 0;
let fotoProfilo = [];
export async function gestioneAppunti(){
    if (appuntiInitialized) return;
    appuntiInitialized = true;
    const resFotoProfilo = await fetch("data/profile.json");
    fotoProfilo = await resFotoProfilo.json();
    ascoltoAppunti((nuoviAppunti) => {
        if (timerAppunti) clearInterval(timerAppunti);
        indiceCorrente = 0;
        const ruota = () => {
            const appunto = nuoviAppunti[indiceCorrente];
            const linkFoto = fotoProfilo.find(f => f.nome === appunto.nome)?.link;
            renderAppuntoCompleto(appunto, linkFoto);
            indiceCorrente = (indiceCorrente + 1) % nuoviAppunti.length;
        };
        ruota();
        timerAppunti = setInterval(ruota, tempoTimerAppunti);
    });
}


let nextInitialized = false;

export async function gestioneNext() {
    if (nextInitialized) return;
    nextInitialized = true;
    ascoltoNext((nuovoNext) => {
        const now = new Date();
        const oggiAnno = now.getFullYear();
        const oggiMese = now.getMonth() + 1;
        const oggiGiorno = now.getDate();
        const oggi = oggiAnno * 10000 + oggiMese * 100 + oggiGiorno;
        const eventiConAnno = nuovoNext.map(evento => {
            let annoEvento = oggiAnno;
            if (evento.mese < oggiMese ||
               (evento.mese === oggiMese && evento.giorno < oggiGiorno)) {
                annoEvento++;
            }
            return {
                ...evento,
                dataEvento: annoEvento * 10000 + evento.mese * 100 + evento.giorno
            };
        });
        eventiConAnno.sort((a, b) => a.dataEvento - b.dataEvento);
        const eventiFuturi = eventiConAnno.filter(e => e.dataEvento >= oggi);
        if (eventiFuturi.length === 0) return;
        const dataTrovata = eventiFuturi[0].dataEvento;
        const eventiDelGiorno = eventiFuturi.filter(e => e.dataEvento === dataTrovata);
        const isDay = (dataTrovata === oggi);
        renderNext(eventiDelGiorno, isDay);
    });
}

let umoriInitialized = false;
export async function umore(){
    if (umoriInitialized) return;
    umoriInitialized = true;
    ascoltoUmori((umori)=>{
        renderUmori(umori);
    });
    agganciaListenerUmori(); // lo agganci UNA SOLA VOLTA
}




