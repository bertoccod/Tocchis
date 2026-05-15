export function aggiornaOrologioNotturno() {
    const oraAttuale = new Date();
    const h = String(oraAttuale.getHours()).padStart(2, '0');
    const m = String(oraAttuale.getMinutes()).padStart(2, '0');
    
    const displayOra = document.getElementById("night-clock");
    if (displayOra) {
        displayOra.innerText = `${h}:${m}`;
    }
}