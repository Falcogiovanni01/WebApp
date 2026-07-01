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

    // --- S0: VERIFICA SESSIONE (Integrazione Server/Client) ---
    async function checkAuthState() {
        // Proviamo a vedere se il server riconosce il cookie
        try {
            const response = await fetch('/checkSessionCliente');
            const userData = localStorage.getItem('user'); // Usiamo localStorage!

            if (response.ok && userData) {
                // STATO: LOGGATO
                const user = JSON.parse(userData);
                authContainer.classList.add('hidden');
                appContainer.classList.remove('hidden');
                userInfo.classList.remove('hidden');
                welcomeMsg.textContent = `Ciao, ${user.nome}`;
                loadCatalog();
            } else {
                // STATO: NON LOGGATO
                authContainer.classList.remove('hidden');
                appContainer.classList.add('hidden');
                userInfo.classList.add('hidden');
            }
        } catch (err) {
            console.error("Errore verifica sessione:", err);
        }
    }

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
                // Salvo su localStorage, NON sessionStorage
                localStorage.setItem('user', JSON.stringify(data));
                checkAuthState();
            } else {
                alert("Credenziali errate");
            }
        } catch (error) { console.error("Errore Login:", error); }
    });

    // --- LOGOUT ---
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await fetch('/logout'); 
        localStorage.removeItem('user');
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
            loadCart(); // Ricarica 
        } catch (error) {
            console.error("Errore acquisto:", error);
        }
    });

   

    // --- INIZIALIZZAZIONE ---
    checkAuthState();
});