/**
 * Antiquariato Cliente - App Client Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
    // --- SELETTORI DOM ---
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('main-app-container');
    const userInfo = document.getElementById('user-info');
    const welcomeMsg = document.getElementById('welcome-msg');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    // --- S0: VERIFICA SESSIONE (FIX #1: unica fonte di verità = cookie lato server) ---
    async function checkAuthState() {
        try {
            const response = await fetch('/checkSessionCliente');

            if (response.ok) {
                // STATO: LOGGATO — il server ha validato il cookie e ci dice chi siamo
                const data = await response.json();
                authContainer.classList.add('hidden');
                appContainer.classList.remove('hidden');
                userInfo.classList.remove('hidden');
                welcomeMsg.textContent = `Ciao, ${data.nome}`;
                loadCatalog();
            } else {
                // STATO: NON LOGGATO (nessun cookie valido)
                authContainer.classList.remove('hidden');
                appContainer.classList.add('hidden');
                userInfo.classList.add('hidden');
            }
        } catch (err) {
            console.error("Errore verifica sessione:", err);
        }
    }

       // --- SWITCH LOGIN / REGISTRAZIONE ---
    document.getElementById('link-show-register').addEventListener('click', (e) => {
        e.preventDefault();
        formLogin.classList.add('hidden');
        formRegister.classList.remove('hidden');
    });

    document.getElementById('link-show-login').addEventListener('click', (e) => {
        e.preventDefault();
        formRegister.classList.add('hidden');
        formLogin.classList.remove('hidden');
    });

       // --- NAVIGAZIONE TAB ---
    const tabButtons = document.querySelectorAll('.client-tab');
    const tabContents = document.querySelectorAll('.client-content');
 
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => {
                b.classList.remove('text-blue-700', 'border-b-2', 'border-blue-600', 'font-bold');
                b.classList.add('text-slate-500', 'font-semibold');
            });
            tabContents.forEach(c => c.classList.add('hidden'));
 
            btn.classList.remove('text-slate-500', 'font-semibold');
            btn.classList.add('text-blue-700', 'border-b-2', 'border-blue-600', 'font-bold');
 
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
 
            if (targetId === 'tab-carrello') loadCart();
            if (targetId === 'tab-catalogo') loadCatalog();
        });
    });

    // --- LOGIN ---
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(data).toString()
            });
            if (response.ok) {
                // FIX #1: non salviamo più nome/password in localStorage.
                // L'unica prova di identità è il cookie httpOnly impostato dal server;
                // checkAuthState() lo interroga direttamente per sapere chi è loggato.
                checkAuthState();
            } else {
                alert("Credenziali errate");
            }
        } catch (error) { console.error("Errore Login:", error); }
    });

    // --- REGISTRAZIONE ---
    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());

        try {
            const response = await fetch('/registrazione', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(data).toString()
            });
            
            if (response.ok) {
                alert("Registrazione completata! Ora puoi effettuare il login.");
                document.getElementById('link-show-login').click(); 
                formRegister.reset(); // Pulisce i campi del form
            } else {
                const result = await response.json();
                alert(result.message || "Errore durante la registrazione.");
            }
        } catch (error) {
            console.error("Errore Registrazione:", error);
            alert("Errore di connessione al server.");
        }
    });

    // --- LOGOUT ---
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await fetch('/logout'); // il server cancella il cookie di sessione
        checkAuthState();
    });

    // Carica Catalogo
    async function loadCatalog() {
        try {
            const response = await fetch('/visualizza');
            const opere = await response.json();
            const grid = document.getElementById('catalog-grid');
            grid.innerHTML = ''; // Pulisci griglia

            opere.forEach(opera => {
                const card = document.createElement('div');
                card.className = 'border p-4 rounded shadow hover:shadow-lg bg-white flex flex-col justify-between';
                card.innerHTML = `
                    <div>
                        <h3 class="font-bold text-lg">${opera.nome}</h3>
                        <p class="text-sm text-slate-500 mb-2">Cod: ${opera.codice}</p>
                        <p class="text-sm mb-4">${opera.descrizione || 'Nessuna descrizione'}</p>
                    </div>
                    <div>
                        <p class="font-bold text-blue-600 text-xl mb-3">€ ${opera.prezzo}</p>
                        <button onclick="addToCart('${opera.codice}')" class="w-full bg-blue-100 text-blue-700 py-2 rounded hover:bg-blue-200 font-semibold transition">
                            Aggiungi al Carrello
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });
        } catch (error) {
            console.error("Errore caricamento catalogo:", error);
        }
    }

    // Aggiungi al Carrello (Messa nel window per poterla chiamare dall'onclick dell'HTML generato)
    window.addToCart = async function(codice) {
        try {
            const response = await fetch('/aggiungiCarrello', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ codice: codice }).toString()
            });
            if (response.ok) {
                alert("Opera aggiunta al carrello!");
            } else {
                const err = await response.json();
                alert(err.message || "Sessione scaduta: effettua di nuovo il login.");
            }
        } catch (error) {
            console.error("Errore carrello:", error);
        }
    };

    // Carica Carrello
    async function loadCart() {
        const cartList = document.getElementById('cart-list');
        const btnAcquista = document.getElementById('btn-acquista');
        
        try {
            const response = await fetch('/visualizzaCarrello', {
                method: 'POST'
            });
            const result = await response.json();
            
            cartList.innerHTML = '';
            
            if (result.carrello && result.carrello.length > 0) {
                result.carrello.forEach(item => {
                    cartList.innerHTML += `
                        <div class="flex justify-between items-center p-4 border rounded bg-slate-50">
                            <div>
                                <p class="font-bold">Codice Opera: ${item.codice}</p>
                                <p class="text-blue-600">Prezzo: € ${item.prezzo}</p>
                            </div>
                            <button onclick="removeFromCart('${item.codice}')" class="text-red-500 hover:text-red-700 font-bold">Rimuovi</button>
                        </div>
                    `;
                });
                btnAcquista.classList.remove('hidden');
            } else {
                cartList.innerHTML = '<p class="text-slate-500">Il tuo carrello è vuoto.</p>';
                btnAcquista.classList.add('hidden');
            }
        } catch (error) {
            console.error("Errore visualizzazione carrello:", error);
        }
    }

    // Rimuovi dal Carrello
    window.removeFromCart = async function(codice) {
        try {
            await fetch('/rimuoviCarrello', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ codice: codice }).toString()
            });
            loadCart(); // Ricarica la vista
        } catch (error) {
            console.error("Errore rimozione:", error);
        }
    };

    // Procedi all'acquisto
    document.getElementById('btn-acquista').addEventListener('click', async () => {
        try {
            const response = await fetch('/acquista', {
                method: 'POST'
            });
            const result = await response.json();
            alert(result.message || "Acquisto confermato!");
            loadCart(); // Ricarica 
        } catch (error) {
            console.error("Errore acquisto:", error);
        }
    });

   

    // --- INIZIALIZZAZIONE ---
    checkAuthState();
});