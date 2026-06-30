/**
 * Antiquariato Gestore - App Client Logic
 * Modernized: Vanilla JS, Fetch API, Async/Await
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- GESTIONE TABS ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Rimuovi lo stato attivo da tutti i bottoni e nascondi i contenuti
            tabButtons.forEach(b => {
                b.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600', 'font-bold');
                b.classList.add('text-slate-500', 'font-semibold');
            });
            tabContents.forEach(c => c.classList.add('hidden'));

            // Attiva il bottone cliccato e mostra il suo contenuto
            btn.classList.remove('text-slate-500', 'font-semibold');
            btn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600', 'font-bold');
            
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

    // --- UTILITY FETCH ---
    // Sostituisce il vecchio $.ajax
    async function sendData(url, method, dataObj) {
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataObj)
            });
            return await response.json();
        } catch (error) {
            console.error(`Errore in ${method} su ${url}:`, error);
            alert("Si è verificato un errore di connessione col server.");
            throw error;
        }
    }

    // --- FORM SUBMIT HANDLERS ---

    // 1. Aggiungi Opera
    document.getElementById('form-aggiungi').addEventListener('submit', async (e) => {
        e.preventDefault(); // Equivalente a return false
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const res = await sendData('/AggiungiOpera', 'POST', data);
        console.log("Esito Aggiunta:", res);
        alert(res.message || res.riepilogo || "Operazione completata");
        e.target.reset(); // Svuota il form
    });

    // 2. Modifica Opera
    document.getElementById('form-modifica').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const res = await sendData('/ModificaOpera', 'POST', data);
        console.log("Esito Modifica:", res);
        alert(res.message || "Operazione completata");
        e.target.reset();
    });

    // 3. Rimuovi Opera
    document.getElementById('form-rimuovi').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const res = await sendData('/RimuoviOpera', 'POST', data);
        console.log("Esito Rimozione:", res);
        alert(res.message || "Operazione completata");
        e.target.reset();
    });

    // --- BOTTONI REPORT E VISUALIZZAZIONI ---
    const resultBox = document.getElementById('report-results');

    async function fetchAndDisplay(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            resultBox.classList.remove('hidden');
            resultBox.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        } catch (error) {
            console.error("Errore fetch dati:", error);
            resultBox.innerHTML = "<span class='text-red-500'>Errore nel recupero dati.</span>";
        }
    }

    document.getElementById('btn-vis-offerte')?.addEventListener('click', () => fetchAndDisplay('/visualizzaOpere'));
    document.getElementById('btn-rep-acquisti')?.addEventListener('click', () => fetchAndDisplay('/reportAcquisti'));
    document.getElementById('btn-rep-vendite')?.addEventListener('click', () => fetchAndDisplay('/reportVendite'));
});