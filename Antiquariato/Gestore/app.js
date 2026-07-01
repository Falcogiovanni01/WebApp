/**
 * Antiquariato Gestore - App Client Logic
 * Versione completa e aggiornata con gestione sessione (FSM)
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log("App inizializzata correttamente.");

    // --- S0: VERIFICA SESSIONE ATTIVA ---
    try {
        const sessionCheck = await fetch('/checkSession');
        if (sessionCheck.ok) {
            // Stato S0 -> S2: Utente già autenticato, nascondi l'overlay
            document.getElementById('login-overlay').classList.add('hidden');
            console.log("Sessione ripristinata dal server.");
        }
    } catch (err) {
        console.log("Nessuna sessione attiva, resto nello stato S1 (Login).");
    }

    // --- 1. GESTIONE LOGIN ---
    const loginForm = document.getElementById('form-login-gestore');
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('user').value;
        const password = document.getElementById('pass').value;

        try {
            const res = await fetch('/loginGestore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                document.getElementById('login-overlay').classList.add('hidden');
            } else {
                alert("Credenziali errate!");
            }
        } catch (err) { alert("Errore di connessione al server."); }
    });

    // --- 1.5 GESTIONE LOGOUT ---
    document.getElementById('btn-logout-gestore')?.addEventListener('click', async () => {
        try {
            await fetch('/logoutGestore');
            document.getElementById('login-overlay').classList.remove('hidden');
            document.getElementById('form-login-gestore').reset();
            console.log("Logout effettuato, tornato alla schermata di accesso.");
        } catch (err) {
            console.error("Errore durante il logout:", err);
        }
    });

    // --- 2. GESTIONE TABS ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => {
                b.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600', 'font-bold');
                b.classList.add('text-slate-500', 'font-semibold');
            });
            tabContents.forEach(c => c.classList.add('hidden'));

            btn.classList.remove('text-slate-500', 'font-semibold');
            btn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600', 'font-bold');
            
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

    // --- 3. UTILITY FETCH ROBUSTA ---
    async function sendData(url, method, dataObj) {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataObj)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Errore del server");
        }
        
        return await response.json();
    }

    // --- 4. HANDLER FORMS ---
    document.getElementById('form-aggiungi')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const res = await sendData('/AggiungiOpera', 'POST', Object.fromEntries(new FormData(e.target)));
            alert(res.message);
            e.target.reset();
        } catch (err) { alert(err.message); }
    });

    document.getElementById('form-modifica')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const res = await sendData('/ModificaOpera', 'POST', Object.fromEntries(new FormData(e.target)));
            alert(res.message);
            e.target.reset();
        } catch (err) { alert(err.message); }
    });

    document.getElementById('form-rimuovi')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const res = await sendData('/RimuoviOpera', 'POST', Object.fromEntries(new FormData(e.target)));
            alert(res.message);
            e.target.reset();
        } catch (err) { alert(err.message); }
    });

    // --- 5. FETCH E DISPLAY TABELLA ---
    async function fetchAndDisplay(url) {
        const resultBox = document.getElementById('report-results');
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            resultBox.classList.remove('hidden');
            resultBox.innerHTML = data.length === 0 ? '<p class="p-4 text-slate-500">Nessun dato disponibile.</p>' : '';

            if (data.length > 0) {
                const table = document.createElement('table');
                table.className = 'w-full text-left border-collapse';
                
                const headers = Object.keys(data[0]).filter(k => k !== '_id');
                table.innerHTML = `<thead class="bg-slate-200"><tr>${headers.map(h => `<th class="p-2 border">${h.toUpperCase()}</th>`).join('')}</tr></thead>`;
                
                const tbody = document.createElement('tbody');
                data.forEach(item => {
                    const row = document.createElement('tr');
                    row.className = 'border-b hover:bg-slate-50';
                    row.innerHTML = headers.map(h => `<td class="p-2 border">${item[h] || '-'}</td>`).join('');
                    tbody.appendChild(row);
                });
                
                table.appendChild(tbody);
                resultBox.appendChild(table);
            }
        } catch (error) {
            console.error("Errore fetch dati:", error);
            resultBox.innerHTML = "<p class='text-red-500 p-4'>Errore nel recupero dati.</p>";
        }
    }

    document.getElementById('btn-vis-offerte')?.addEventListener('click', () => fetchAndDisplay('/visualizzaOpere'));
    document.getElementById('btn-rep-acquisti')?.addEventListener('click', () => fetchAndDisplay('/reportAcquisti'));
    document.getElementById('btn-rep-vendite')?.addEventListener('click', () => fetchAndDisplay('/reportVendite'));
});