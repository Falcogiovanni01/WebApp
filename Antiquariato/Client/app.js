document.addEventListener('DOMContentLoaded', () => {

    // --- SELETTORI DOM ---
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('main-app-container');
    const userInfo = document.getElementById('user-info');
    const welcomeMsg = document.getElementById('welcome-msg');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    
    // --- GESTIONE STATO (Macchina a Stati) ---
    function checkAuthState() {
        const userData = sessionStorage.getItem('user');
        if (userData) {
            // STATO: LOGGATO
            const user = JSON.parse(userData);
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            userInfo.classList.remove('hidden');
            welcomeMsg.textContent = `Ciao, ${user.nome}`;
            loadCatalog(); // Carica i dati appena entra
        } else {
            // STATO: OSPITE (NON LOGGATO)
            authContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
            userInfo.classList.add('hidden');
        }
    }

    // --- NAVIGAZIONE TABS CLIENTE ---
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

            // Azioni specifiche per tab
            if(targetId === 'tab-carrello') loadCart();
            if(targetId === 'tab-catalogo') loadCatalog();
        });
    });

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

    // --- CHIAMATE API (FETCH) ---
    
    // Login
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(data).toString()
            });
            const result = await response.json();
            
            if (response.ok) {
                // Salvo i dati in sessione (nome e password servono al server per il carrello)
                sessionStorage.setItem('user', JSON.stringify(data));
                checkAuthState();
            } else {
                alert(result.message || "Credenziali errate");
            }
        } catch (error) {
            console.error("Errore Login:", error);
        }
    });

    // Registrazione
    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());

        try {
            const response = await fetch('/registrazione', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(data).toString()
            });
            const result = await response.json();
            alert("Registrazione completata! Ora puoi effettuare il login.");
            document.getElementById('link-show-login').click(); // Torna al login
        } catch (error) {
            console.error("Errore Registrazione:", error);
        }
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        sessionStorage.removeItem('user');
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
        const user = JSON.parse(sessionStorage.getItem('user'));
        try {
            const response = await fetch('/aggiungiCarrello', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ nome: user.nome, codice: codice }).toString()
            });
            const res = await response.json();
            alert("Opera aggiunta al carrello!");
        } catch (error) {
            console.error("Errore carrello:", error);
        }
    };

    // Carica Carrello
    async function loadCart() {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const cartList = document.getElementById('cart-list');
        const btnAcquista = document.getElementById('btn-acquista');
        
        try {
            const response = await fetch('/visualizzaCarrello', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ nome: user.nome, password: user.password }).toString()
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
        const user = JSON.parse(sessionStorage.getItem('user'));
        try {
            await fetch('/rimuoviCarrello', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ nome: user.nome, codice: codice }).toString()
            });
            loadCart(); // Ricarica la vista
        } catch (error) {
            console.error("Errore rimozione:", error);
        }
    };

    // Procedi all'acquisto
    document.getElementById('btn-acquista').addEventListener('click', async () => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        try {
            const response = await fetch('/acquista', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ nome: user.nome, password: user.password }).toString()
            });
            const result = await response.json();
            alert(result.message || "Acquisto confermato!");
            loadCart(); // Ricarica (dovrebbe essere vuoto se gestito dal server)
        } catch (error) {
            console.error("Errore acquisto:", error);
        }
    });

    // Proponi Vendita
    document.getElementById('form-vendi').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = JSON.parse(sessionStorage.getItem('user'));
        const data = Object.fromEntries(new FormData(e.target).entries());
        data.nomeCliente = user.nome; // Inietto il nome dell'utente loggato

        try {
            const response = await fetch('/VendiOpera', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            alert(result.riepilogo || "Proposta inviata con successo!");
            e.target.reset();
        } catch (error) {
            console.error("Errore proposta vendita:", error);
        }
    });

    // --- INIZIALIZZAZIONE ---
    checkAuthState();
});