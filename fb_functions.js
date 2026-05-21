import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";;
import { getDatabase, ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";


const firebaseConfig = {
    apiKey: "AIzaSyDZkzIdvG2WcBHLpd0ZfeyKh9o9PqAxwp4",
    authDomain: "tocchis-abbaf.firebaseapp.com",
    databaseURL: "https://tocchis-abbaf-default-rtdb.firebaseio.com",
    projectId: "tocchis-abbaf",
    storageBucket: "tocchis-abbaf.firebasestorage.app",
    messagingSenderId: "551515424099",
    appId: "1:551515424099:web:a0b7199199d8dcca83ff56"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

//Funzione per ascoltare gli appunti scritti sul db
export function ascoltoAppunti(callback) {
    const appuntiRef = ref(db, 'appunti'); 
    onValue(appuntiRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            //let listaAppunti = Object.values(data); 
            const listaAppunti = Object.entries(data).map(([nome, appunto]) => ({
                nome,
                appunto
            }));

            callback(listaAppunti);
        }
    });
}

//Funzione che ascolta il prossimo evento in categoria Next
export function ascoltoNext(callback){
    const nextRef = ref(db, 'next');
    onValue(nextRef, (snapshot)=>{
        const dataNext = snapshot.val();
        if (dataNext){
            let nextNext = Object.values(dataNext);
            callback(nextNext);
        }
    });
}

//Funzione che ascolta l'umore attuale dei membri
export function ascoltoUmori(callback){
    const umoreRef = ref(db, 'umori');
    onValue(umoreRef, (snapshot)=>{
        const dataUmore = snapshot.val();
        if (dataUmore){
            callback(dataUmore);
        }
    })
}

// Funzione per salvare l'umore di un singolo membro
export function setUmore(nome, nuovoIndice) {
    const updates = {};
    updates[`/umori/${nome}`] = nuovoIndice;
    return update(ref(db), updates);
}

// Funzione per il reset di massa (es. a mezzanotte)
export function resetTuttiUmori() {
    const db = getDatabase();
    const resetData = {
        "Dario": 0,
        "Anita": 0,
        "Agnese": 0,
        "Giacomo": 0
    };
    return update(ref(db, 'umori'), resetData);
}

export function getListFile(callback){
    const filesRef = ref(db, 'slideshow');
    get(filesRef).then(snapshot => {
        const dataFiles = snapshot.val();
        if (dataFiles){
            callback(Object.values(dataFiles));
        } else {
            callback([]);
        }
    });
}

export function getNightDay(callback) {
    const fileRef = ref(db, 'night/stato');
    get(fileRef).then(snap => callback(snap.val()));
}



export function setNightDay(valore) {
    return update(ref(db, 'night'), { stato: valore });
}



