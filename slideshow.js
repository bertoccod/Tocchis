import { getListFile } from "./fb_functions.js";
import {numFotoSlide} from "./config.js";
import { caricaFoto } from "./ui-manager.js";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function startSlide() {
    return new Promise((resolve) => {

        getListFile(async (files) => {

            const numeroFiles = files.length;
            if (numeroFiles === 0) {
                resolve();
                return;
            }

            // Estrazione casuale
            const numeriEstratti = new Set();
            const maxFoto = Math.min(numFotoSlide, numeroFiles);

            while (numeriEstratti.size < maxFoto) {
                numeriEstratti.add(Math.floor(Math.random() * numeroFiles));
            }

            const indiciFinali = Array.from(numeriEstratti);

            // Mostra le foto una alla volta
            for (let indice of indiciFinali) {
                const file = files[indice];
                caricaFoto(file.url, file.orientamento);

                if (file.orientamento === "verticale") {
                    await sleep(12000);
                } else {
                    await sleep(10000);
                }
            }

            resolve();
        });
    });
}

    


