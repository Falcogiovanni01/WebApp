# Galleria d'Antiquariato — Progetto Software Testing

Questo progetto realizza un'applicazione full-stack per la gestione di una galleria d'antiquariato
online, pensata come due applicazioni indipendenti — una per il **Cliente** e una per il
**Gestore** — ciascuna modellata esplicitamente come una Macchina a Stati Finiti (FSM) e verificata
tramite una suite di test end-to-end automatizzati con Selenium e JUnit 5. Quello che segue non è
solo un elenco di comandi da lanciare: è anche il racconto delle scelte fatte lungo il percorso, e
del perché sono state fatte così.

---

## Indice

1. [Architettura del progetto: analisi delle scelte](#architettura-del-progetto-analisi-delle-scelte)
2. [Struttura delle cartelle](#struttura-delle-cartelle)
3. [Prerequisiti](#prerequisiti)
4. [Come avviare il progetto in locale](#come-avviare-il-progetto-in-locale)
5. [Come eseguire i test automatizzati](#come-eseguire-i-test-automatizzati)
6. [Semplificazioni consapevoli](#semplificazioni-consapevoli)
7. [Risoluzione problemi comuni](#risoluzione-problemi-comuni)

---

## Architettura del progetto: analisi delle scelte

Il progetto adotta un'architettura full-stack basata su Node.js/Express, pensata fin dall'inizio
per rispondere a tre esigenze della traccia: modularità del codice, persistenza dei dati e
testabilità automatizzata delle transizioni di stato.

### 1. Perché Node.js/Express come backend?

Node.js con il framework Express è stato scelto per la natura stessa dell'applicazione: molta I/O,
molta manipolazione di oggetti JSON, poche operazioni computazionalmente pesanti. Il modello non
bloccante e basato su eventi di Node si adatta bene a questo profilo, e Express — proprio perché
minimalista — ha permesso di costruire una struttura modulare senza fronzoli, separando in modo
netto il server Gestore dal server Cliente e mantenendo il codice leggibile e facile da mantenere.

### 2. Perché MongoDB (NoSQL) + JSON per la reportistica?

La persistenza principale è su MongoDB tramite Mongoose, con un'esportazione parallela su file
JSON per tutto ciò che riguarda lo storico e i report. Due motivi distinti dietro questa scelta:

MongoDB si presta bene a un catalogo di opere la cui struttura può cambiare o arricchirsi nel
tempo — uno schema flessibile è più comodo di uno schema relazionale rigido quando i campi di
un'opera d'arte possono variare da un pezzo all'altro. I file JSON, invece, non sono un ripiego ma
una scelta architetturale precisa: separano il database operativo (dinamico, la fonte di verità
per lo stato corrente) dallo storico degli ordini (statico, di sola lettura). Anche in caso di
problemi sul database, lo storico delle operazioni essenziali resta comunque disponibile e
consultabile.

### 3. Perché Selenium + JUnit, organizzati attorno alla FSM?

La traccia chiedeva esplicitamente di verificare le transizioni di stato dell'applicazione, e
questo ha guidato direttamente la struttura della suite di test: le classi `@Nested` di JUnit
rispecchiano uno a uno gli stati dei due diagrammi FSM (ad esempio `S2_S4_AreaPrivata` copre
proprio la transizione Catalogo ↔ Carrello), e ogni `@DisplayName` riporta il nome della
transizione testata. Il risultato è che l'output di `mvn test` si legge quasi come un resoconto
diretto dell'automa, non come un elenco anonimo di asserzioni.

Sull'approccio di test, la scelta è stata deliberatamente quella dell'integration testing end-to-end,
con un browser reale che interagisce con l'applicazione reale, invece di test unitari con oggetti
mock. Il motivo è semplice: un mock può mentire, un browser vero no. Testare contro il sistema
reale elimina il rischio di falsi positivi — test che passano su un doppio finto dell'applicazione
ma fallirebbero appena toccano il sistema vero.

### 4. Gestione della sessione: solo cookie, verificato lato server

La sessione dell'utente è gestita interamente tramite un cookie `httpOnly`, verificato dal server a
ogni richiesta verso un'area protetta — login, carrello, acquisto. Il cookie `httpOnly` non è
leggibile né manipolabile da JavaScript lato client, ed è l'unica fonte di verità sia per decidere
cosa mostrare in interfaccia sia per autorizzare le operazioni sul backend. Se il cookie manca o
non è valido, ogni endpoint protetto risponde `401` e il client riporta l'utente allo stato di
login, senza eccezioni. Deliberatamente non si usa `localStorage` per l'autenticazione: uno storage
lato client è per definizione fuori dal controllo del server, e non può essere l'unica barriera a
protezione di una risorsa privata.

### 5. Perché due server distinti, Gestore e Cliente?

I due ruoli vivono in due processi Express separati — `ServerGestore.js` sulla porta `3000`,
`ServerCliente.js` sulla porta `3001` — ciascuno con il proprio database Mongo dedicato. La
separazione rispecchia una separazione di privilegi che ha senso anche nel mondo reale: chi gestisce
la galleria non deve condividere le stesse API né lo stesso spazio di sessione di chi acquista.
Tenere i due processi su porte diverse evita anche conflitti tra i cookie di sessione dei due ruoli.

---

## Struttura delle cartelle

```
WebApp/
└── Antiquariato/
    ├── ServerCliente.js
    ├── ServerGestore.js
    ├── package.json          # unico, condiviso da entrambi i server
    ├── node_modules/         # unico, condiviso
    ├── Client/
    │   ├── Cliente.html
    │   ├── app.js
    │   └── Cliente.css
    ├── Gestore/
    │   ├── Gestore.html
    │   └── app.js
    └── Testing/
        └── antiquariato_test/
            ├── pom.xml
            └── src/test/java/it/unina/
                ├── ClienteFSMTest.java
                └── GestoreFSMTest.java
```

`ServerCliente.js` e `ServerGestore.js` vivono allo stesso livello e attingono entrambi dallo
stesso `package.json`/`node_modules` — non ci sono due progetti Node separati da installare, un
solo `npm install` copre entrambi.

---

## Prerequisiti

**Node.js**: va bene una versione LTS recente, 18.x o 20.x. Il progetto usa Express e Mongoose in
modo standard, senza dipendenze che richiedano versioni specifiche o funzionalità sperimentali.

**Java (JDK)**: 11 come requisito minimo garantito — è la versione su cui il progetto è stato
sviluppato e testato (l'ambiente di riferimento gira su Java 11.0.30). Versioni successive, come
17 o 21, sono supportate retroattivamente senza problemi, ma se vuoi essere certo che tutto giri
esattamente come previsto, 11 è la scelta più sicura.

**Maven**: si assume installato globalmente, con `mvn` disponibile nel `PATH` di sistema. Il
progetto non include un Maven Wrapper (`mvnw`).

**MongoDB**: un'installazione locale classica, con `mongod` in ascolto come servizio in background
sulla porta di default (`mongodb://127.0.0.1:27017`). Non serve Docker, e non c'è una versione
minima stringente da rispettare — qualunque versione Community recente (6.x o 7.x) va bene. Se vuoi
ispezionare i dati a occhio mentre lavori, MongoDB Compass è comodo ma resta facoltativo.

**Google Chrome**: basta averlo installato. I test usano Selenium 4.x (nello specifico 4.21.0),
che include Selenium Manager — il componente che scarica e aggancia da solo il ChromeDriver giusto
in base alla versione di Chrome presente sulla macchina. Non serve scaricare nulla a mano.

---

## Come avviare il progetto in locale

Il primo passo è assicurarsi che MongoDB sia in esecuzione:

```bash
mongod
```

(oppure avvialo come servizio di sistema, se è così che l'hai installato). I due database,
`Cliente` e `Gestore`, vengono creati automaticamente al primo avvio dei rispettivi server: non
serve prepararli a mano in anticipo.

Poi, dalla cartella `Antiquariato/` (dove si trova il `package.json`), si installano le dipendenze
una sola volta:

```bash
npm install
```

A questo punto si avviano i due server, ciascuno nel proprio terminale:

```bash
# Terminale 1 — server Cliente, porta 3001
node ServerCliente.js

# Terminale 2 — server Gestore, porta 3000
node ServerGestore.js
```

Se tutto è filato liscio, in entrambi i terminali comparirà il messaggio di connessione a MongoDB
avvenuta con successo. Da qui, l'applicazione è raggiungibile su:

- **Cliente** — [http://localhost:3001](http://localhost:3001)
- **Gestore** — [http://localhost:3000](http://localhost:3000), credenziali `admin` / `admin`

Un'ultima cosa prima di esplorare l'app come cliente: **il catalogo parte vuoto**. Se il database è
stato appena creato (o droppato), non c'è nessuna opera da vedere né da acquistare finché non ne
inserisci qualcuna dal pannello Gestore — scheda **Aggiungi**, 2-3 opere bastano per avere un
catalogo su cui lavorare. Ogni opera aggiunta viene salvata sia su MongoDB sia su `Opere.json`, e
compare subito nel catalogo lato Cliente.

---

## Come eseguire i test automatizzati

I test sono end-to-end veri, non usano mock: servono **entrambi i server avviati e MongoDB
raggiungibile** prima di lanciarli. Dalla cartella `Testing/antiquariato_test`:

```bash
mvn test
```

Un paio di cose che è meglio sapere prima di premere invio. Sul lato Cliente, non c'è bisogno di
preparare nulla a mano per l'utente di test: la suite lo crea da sola al primo avvio se non lo
trova già nel database, quindi funziona anche partendo da un database completamente vuoto.

Il catalogo, invece, **va popolato manualmente prima di lanciare i test del Cliente**: i test che
riguardano il carrello e l'acquisto hanno bisogno di trovare almeno un'opera da poter aggiungere.
Se lanci `mvn test` su un database appena droppato senza prima aver inserito nulla dal pannello
Gestore, quei test falliranno — non per un bug, ma perché non c'è materialmente nulla su cui
lavorare. La sequenza corretta è: avvia `ServerGestore.js`, entra su `http://localhost:3000`,
inserisci 2-3 opere, e solo dopo lancia i test del Cliente, che le troveranno pronte nel catalogo.

I test durante l'esecuzione aprono una finestra vera di Google Chrome pilotata da Selenium: meglio
non chiuderla né interagirci manualmente mentre la suite gira. E se vuoi seguire cosa sta
verificando ogni singolo test man mano che scorre l'output, i `@DisplayName` sono scritti apposta
per essere leggibili come un resoconto delle transizioni della FSM, non come un elenco tecnico.

---

## Semplificazioni consapevoli

Alcune scelte in questo progetto sono semplificazioni deliberate, coerenti con lo scope di un
progetto d'esame — le documentiamo qui apertamente, perché una scelta dichiarata vale molto più di
una svista scoperta da qualcun altro:

- **Le credenziali del Gestore sono hardcoded** (`admin`/`admin`) direttamente nel codice, non
  salvate su database. Trattandosi di un singolo ruolo amministrativo, non si è ritenuto necessario
  costruire un sistema di gestione utenti multipli solo per questa figura.
- **Il valore del cookie di sessione non è firmato**: contiene direttamente lo username in chiaro
  per il Cliente, o la stringa `admin` per il Gestore. Il server verifica che un cookie valido sia
  presente per autorizzare le richieste, ma non ne firma né cifra il contenuto. In un contesto di
  produzione reale si userebbe un token di sessione opaco e firmato (o una libreria dedicata come
  `express-session`); qui si è scelta la semplicità che il contesto del progetto richiedeva
  esplicitamente.
- **Non esiste uno script di seeding automatico** che ripopoli il catalogo da un file JSON verso
  MongoDB: il catalogo si costruisce interamente tramite il pannello Gestore, che scrive
  contestualmente su MongoDB e su `Opere.json`.

---

## Risoluzione problemi comuni

**"Errore durante la registrazione" o un conflitto inatteso durante i test**
`nome` e `numero` (il numero di telefono) hanno un vincolo di unicità nel database. Se hai già
registrato a mano un utente con lo stesso username o lo stesso numero usato nei test, elimina il
documento corrispondente dalla collection `clientes` prima di rilanciare `mvn test`.

**I test di login falliscono con "Credenziali non valide" anche se l'utente esiste**
Controlla che la password salvata nel database sia davvero un hash bcrypt (inizia con `$2a$` o
`$2b$`). Se hai account creati prima dell'introduzione dell'hashing, quelle credenziali non sono
più valide: elimina il documento e registrati di nuovo dal form.

**`ElementNotInteractableException` o `TimeoutException` durante `mvn test`**
Verifica che non sia rimasta appesa un'istanza precedente dei server Node (porte 3000/3001 già
occupate), e che MongoDB sia effettivamente raggiungibile su `127.0.0.1:27017`.

**I test del carrello falliscono senza un motivo apparente**
Controlla di aver popolato il catalogo con almeno un'opera dal pannello Gestore prima di lanciare i
test del Cliente — è il caso più comune, non un difetto del codice.
