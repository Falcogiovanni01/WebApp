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
6. [Mutation analysis (Stryker)](#mutation-analysis-stryker)
7. [Mutation testing: nota metodologica](#mutation-testing-nota-metodologica)
8. [Analisi aggiuntive (facoltative)](#analisi-aggiuntive-facoltative)
9. [Semplificazioni consapevoli](#semplificazioni-consapevoli)
10. [Risoluzione problemi comuni](#risoluzione-problemi-comuni)

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

La copertura delle transizioni non è affidata alla sola lettura del codice: un'estensione JUnit 5
dedicata (`CoperturaFSMExtension`, pacchetto `it.unina.fsm`) accumula automaticamente, a runtime,
quali transizioni sono state esercitate con successo, e stampa a fine suite un report percentuale
confrontato con la lista di transizioni attese ricostruita dai diagrammi originali
(`CLIENT.svg`, `GESTORE.svg`).

Sull'approccio di test, la scelta è stata deliberatamente quella dell'integration testing end-to-end,
con un browser reale che interagisce con l'applicazione reale, invece di test unitari con oggetti
mock. Il motivo è semplice: un mock può mentire, un browser vero no. Testare contro il sistema
reale elimina il rischio di falsi positivi — test che passano su un doppio finto dell'applicazione
ma fallirebbero appena toccano il sistema vero.

Per lo stesso principio, alcuni dei test che verificano operazioni di scrittura (registrazione,
modifica e rimozione di un'opera, acquisto) non si fermano al controllo dell'interfaccia: aprono
una connessione diretta a MongoDB (driver `mongodb-driver-sync`, indipendente da quella usata dal
server Express) per verificare che il dato sia stato realmente persistito, non solo che
l'interfaccia abbia mostrato un messaggio di successo. Un test che controlla solo l'interfaccia non
si accorgerebbe di un'operazione che sembra riuscita ma fallisce silenziosamente sul server; questa
verifica aggiuntiva rafforza l'oracolo del test senza cambiare cosa viene esercitato.

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

Coerentemente con questa separazione, le credenziali del Gestore (`admin`/`admin`) sono una
costante scritta nel codice sorgente di `ServerGestore.js`, non un documento persistito su
database: non essendoci uno stato da preparare, non serve alcun provisioning automatico per questo
ruolo. Per il Cliente, dove le credenziali sono invece un documento reale in MongoDB, la suite di
test le crea da sola al primo avvio se non le trova già nel database (si veda la sezione
[Come eseguire i test automatizzati](#come-eseguire-i-test-automatizzati)).

---

## Struttura delle cartelle

```
WebApp/
└── Antiquariato/
    ├── ServerCliente.js
    ├── ServerGestore.js
    ├── package.json              # unico, condiviso da entrambi i server
    ├── node_modules/             # unico, condiviso
    ├── stryker.config.json       # configurazione mutation analysis (vedi sezione dedicata)
    ├── run-mutation-tests.sh     # script di supporto per Stryker
    ├── reports/mutation/         # output generato da Stryker (HTML + riepilogo testuale)
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
                ├── GestoreFSMTest.java
                └── fsm/
                    ├── Transizione.java
                    ├── Fsm.java
                    ├── CoperturaFSM.java
                    ├── TransizioniAttese.java
                    └── CoperturaFSMExtension.java
```

`ServerCliente.js` e `ServerGestore.js` vivono allo stesso livello e attingono entrambi dallo
stesso `package.json`/`node_modules` — non ci sono due progetti Node separati da installare, un
solo `npm install` copre entrambi.

---

## Prerequisiti

**Node.js**: va bene una versione LTS recente, 18.x o 20.x, per avviare ed eseguire l'applicazione
e i due server. Il progetto usa Express e Mongoose in modo standard, senza dipendenze che
richiedano versioni specifiche o funzionalità sperimentali. *(Questo requisito riguarda solo
l'esecuzione dei server e dei test; se si desidera rieseguire anche l'analisi di code coverage
facoltativa descritta più sotto, quello strumento ha un vincolo di versione più stringente, spiegato
nella sezione dedicata.)*

**Java (JDK)**: 11 come requisito minimo garantito nel `pom.xml` (`maven.compiler.source/target`),
ed è la versione su cui il progetto è stato sviluppato inizialmente. È stato verificato che anche
versioni molto più recenti (JDK 26) compilano ed eseguono correttamente la suite senza errori,
producendo solo un warning innocuo del compilatore (*"location of system modules is not set in
conjunction with -source 11"*) che suggerisce di usare `--release` al posto di `-source`/`-target`
— non blocca in alcun modo la build. Qualunque JDK 11+ installato va quindi bene.

**Maven**: si assume installato globalmente, con `mvn` disponibile nel `PATH` di sistema. Il
progetto non include un Maven Wrapper (`mvnw`): se il progetto è stato finora eseguito solo tramite
un IDE (Eclipse/IntelliJ), è probabile che Maven non sia ancora installato per l'uso da terminale.
Su macOS, il modo più rapido è tramite Homebrew:

```bash
brew install maven
mvn -version   # verifica installazione e versione del JDK agganciata
```

Il `pom.xml` include tra le dipendenze `mongodb-driver-sync` (usata da alcuni test per verificare
la persistenza dei dati direttamente su MongoDB, si veda il punto 3 dell'architettura): **la prima
esecuzione di `mvn test` richiede una connessione a Internet attiva**, necessaria a Maven per
scaricare questa dipendenza (e le altre) da Maven Central. Le esecuzioni successive useranno la
cache locale (`~/.m2`) e non necessitano più di connettività.

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

**Importante**: quando si esegue manualmente uno dei due server per esplorare l'applicazione (o per
lanciare `mvn test` a mano), assicurarsi di terminarlo (`Ctrl+C`) prima di lanciare la mutation
analysis descritta più sotto — Stryker avvia da solo un'istanza del server per ogni mutante
generato, e un'istanza residua sulla stessa porta impedirebbe l'avvio di quella mutata,
invalidando silenziosamente i risultati.

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
per essere leggibili come un resoconto delle transizioni della FSM, non come un elenco tecnico. A
fine esecuzione, in coda all'output, compare anche il report di copertura delle transizioni
generato da `CoperturaFSMExtension`, con la percentuale di archi della FSM effettivamente
esercitati da test superati.

Per eseguire solo un sottoinsieme mirato (ad esempio, per limitarsi ai test di autenticazione e
registrazione del Cliente, incluso l'uso durante la mutation analysis descritta di seguito), si può
restringere l'esecuzione alle singole classi `@Nested`:

```bash
mvn test -Dtest=ClienteFSMTest\$S0_S3_AccessoPubblico,ClienteFSMTest\$S3_Registrazione
```

---

## Mutation analysis (Stryker)

Oltre alla copertura delle transizioni FSM, il progetto include una **mutation analysis** del
backend Cliente: si verifica non solo che ogni transizione venga esercitata da un test, ma che i
test esistenti sappiano davvero accorgersi di un difetto introdotto nel codice applicativo — lo
stesso principio descritto a lezione per PIT/Pitclipse, applicato però a un tool equivalente per
l'ecosistema JavaScript, dato che l'applicazione è Node.js/Express e non Java.

### Perché Stryker e non PIT

PIT/Pitclipse (visti a lezione) mutano bytecode Java: non hanno nulla su cui operare in questo
progetto, perché l'unico codice Java presente è il livello di test (Selenium/JUnit), non
l'applicazione sotto test. Lo strumento equivalente per Node.js è **StrykerJS**
(`@stryker-mutator/core`), usato qui in modalità **command runner**: Stryker muta il file
applicativo indicato, poi delega la verifica a un comando esterno a sua scelta — nel nostro caso,
uno script che avvia il server mutato e lancia contro di esso la suite Selenium/JUnit reale,
usandola come oracolo.

### Scope scelto

Per restare coerenti con l'indicazione di concentrarsi sul lato Cliente e di non eccedere nello
scope del progetto, la mutation analysis è stata limitata a:

- **file mutato**: `ServerCliente.js` (l'intero file, non l'intero backend incluso il lato Gestore);
- **test usati come oracolo**: solo le classi `@Nested` `S0_S3_AccessoPubblico` e
  `S3_Registrazione` di `ClienteFSMTest` (autenticazione e registrazione), non l'intera suite —
  che includerebbe anche l'area privata, carrello e ordini, aumentando enormemente i tempi di
  esecuzione senza un beneficio proporzionale per questa dimostrazione.

Il motivo di questa scelta è anche pratico: con il command runner, Stryker non ha visibilità su
quali test coprano quale mutante (`coverageAnalysis: "off"` è obbligatorio in questa modalità),
quindi **l'intera suite selezionata viene rieseguita per ogni singolo mutante generato** — avvio
server, avvio browser, esecuzione Selenium compresi. Anche solo con un file e due gruppi di test,
l'esecuzione completa richiede alcuni minuti.

### File di supporto

- **`stryker.config.json`**: configura il testRunner `command`, il file da mutare
  (`ServerCliente.js`), la disattivazione della coverage analysis e i reporter (`html`,
  `clear-text`, `progress`).
- **`run-mutation-tests.sh`**: avvia `ServerCliente.js` in background, attende che risponda
  (`wait-on`), esegue `mvn test` limitato alle due classi `@Nested` sopra indicate dentro
  `Testing/antiquariato_test`, e termina il server al termine, propagando l'exit code di Maven a
  Stryker.

### Come riprodurla

Prerequisiti aggiuntivi rispetto alla suite Selenium ordinaria:

```bash
cd Antiquariato
npm install --save-dev @stryker-mutator/core wait-on
chmod +x run-mutation-tests.sh
```

`ServerCliente.js` (e l'intero contenuto di `Testing/antiquariato_test/`) devono essere **tracciati
da git** (`git ls-files | grep ServerCliente` deve restituire il file): Stryker copia il progetto
in una sandbox isolata per ogni mutante basandosi esclusivamente sui file tracciati, non su tutta
la cartella fisica.

Con MongoDB già in esecuzione e **nessuna istanza manuale di `ServerCliente.js` attiva sulla porta
3001** (verificabile con `lsof -i :3001`), si lancia dalla root `Antiquariato/`:

```bash
npx stryker run
```

Il riepilogo testuale compare a schermo a fine esecuzione; il report dettagliato, file per file e
mutante per mutante, viene generato in `reports/mutation/mutation.html`.

### Risultato ottenuto

Sul file `ServerCliente.js`, Stryker ha generato **307 mutanti**, di cui **302 uccisi e 5
sopravvissuti** (mutation score 98.37%). I 5 sopravvissuti, tutti riconducibili a due categorie:

1. **Assertion troppo generiche nei test negativi**: `testRegistrazioneCampiVuoti` verifica solo
   che il form resti visibile a fronte di un invio vuoto, senza isolare quale singolo campo
   provoca il blocco — due mutanti che disattivano `required` rispettivamente su `nome` e su
   `carta` sopravvivono, perché il test rileva comunque un form bloccato (per via degli altri campi
   ancora obbligatori), mascherando il fatto che quello specifico vincolo non viene più verificato
   in isolamento.
2. **Assenza di verifica sul contenuto della risposta di errore**: un mutante che svuota il corpo
   JSON della risposta 401 di sessione non valida sopravvive, perché nessun test asserisce il
   contenuto del messaggio d'errore, solo il comportamento a livello di interfaccia.
3. **Nessun input malformato testato per il numero di telefono**: un mutante che disattiva la
   regex di validazione del numero (sostituendola con un validatore che accetta sempre) sopravvive,
   perché nessun test invia un numero di telefono in un formato esplicitamente non valido.

Questi sopravvissuti non indicano un difetto applicativo, ma un limite di granularità della suite:
la copertura delle transizioni FSM (100% sul lato Cliente) garantisce che ogni stato venga
raggiunto, ma non garantisce che ogni singola regola di validazione dietro quello stato venga
verificata in isolamento — è esattamente il tipo di gap che la mutation analysis è pensata per far
emergere, e che una copertura di codice o di transizioni, da sola, non avrebbe mostrato.

---

## Mutation testing: nota metodologica

Il materiale del corso distingue esplicitamente due tecniche distinte, spesso confuse per il nome
simile:

- **mutation analysis**: si muta il codice applicativo, per verificare se i test *esistenti* se ne
  accorgono (quanto descritto sopra con Stryker);
- **mutation testing**: si muta il codice sorgente dei test *stessi* (aggiungendo, rimuovendo o
  scambiando righe, o incrociando i valori tra due test case), per generare nuovi test case.

A differenza della mutation analysis — per cui esistono tool maturi e diffusi sia in ambito Java
(PIT) sia JavaScript (Stryker) — non è stato individuato alcuno strumento equivalente, pronto
all'uso, che muti automaticamente il codice sorgente di test JUnit esistenti secondo gli operatori
descritti a lezione. Gli strumenti più vicini per nome (EvoSuite) risolvono in realtà un problema
diverso: generano test interamente nuovi analizzando il codice applicativo tramite algoritmo
genetico, senza prendere in input né mutare i test già scritti — e in ogni caso richiederebbero
codice applicativo Java, non compatibile con il backend Node.js di questo progetto.

Per questo motivo, il mutation testing in senso stretto è stato esplorato in questo progetto solo
a livello dimostrativo e manuale su un singolo test case (`testRegistrazioneSuccesso`), applicando
a mano tre degli operatori descritti a lezione (rimozione di una riga, scambio di due righe,
aggiunta di una riga) e un tentativo di crossover con `testLoginSuccesso`. La dimostrazione ha
confermato in pratica le criticità della tecnica già discusse a lezione: alcuni mutanti generano
test inapplicabili (rimozione del campo obbligatorio "numero di telefono", che rende la
registrazione fallimentare per un motivo indipendente dal test stesso), altri sono equivalenti
(scambio di due `sendKeys` indipendenti, senza alcun effetto osservabile), e il crossover, applicato
a due test brevi che condividono solo lo stato iniziale, degenera semplicemente negli stessi test
di partenza.

---

## Analisi aggiuntive (facoltative)

Oltre alla suite Selenium/JUnit e alla mutation analysis descritta sopra, il progetto è stato
affiancato da alcuni strumenti di analisi indipendenti, usati per la stesura della relazione.
**Nessuno di questi è necessario per eseguire o verificare il funzionamento dell'applicazione**:
sono documentati qui solo per chi desiderasse riprodurli.

### Code coverage lato server (nyc / Istanbul)

Misura quali righe e rami del codice di `ServerCliente.js`/`ServerGestore.js` vengono
effettivamente eseguiti mentre la suite Selenium gira. Richiede un'installazione locale
(`npm install --save-dev nyc`, dalla cartella `Antiquariato/`) e, soprattutto, **una versione LTS
di Node (consigliata la 20.x)**: versioni molto recenti di Node (osservata la 26.x) non sono
risultate compatibili con questo strumento nell'ambiente di sviluppo del progetto. Questo vincolo
riguarda unicamente `nyc`, non l'esecuzione ordinaria dei server né la mutation analysis con
Stryker, entrambe verificate funzionanti anche su Node 20.x/versioni più recenti.

```bash
cd Antiquariato
npx nyc node ServerCliente.js      # avviare il server sotto osservazione
# in un altro terminale: mvn test -Dtest=ClienteFSMTest
# tornare al terminale del server e premere Ctrl+C per generare il report
open coverage/index.html           # macOS; xdg-open su Linux, start su Windows
```

### Analisi statica del codice server (ESLint)

```bash
cd Antiquariato
npx eslint ServerCliente.js ServerGestore.js --format stylish
```

Richiede il file di configurazione `eslint.config.mjs` presente nella cartella, con
`languageOptions.globals` impostato su `globals.node` (non `globals.browser`), necessario perché
ESLint riconosca correttamente variabili globali di Node come `__dirname`.

### Analisi statica del markup client (htmlhint)

```bash
npx htmlhint Client/Cliente.html
npx htmlhint Gestore/Gestore.html
```

Nessuna installazione o configurazione preventiva necessaria: `npx` scarica lo strumento al volo
alla prima esecuzione.

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
- **La copertura di codice (nyc) non raggiunge il 100% dei rami**, per scelta: i rami non coperti
  residui riguardano quasi esclusivamente la gestione difensiva di fallimenti infrastrutturali (es.
  disconnessione del database), la cui verifica richiederebbe tecniche di mocking estranee
  all'approccio end-to-end scelto per questo progetto.
- **La mutation analysis è limitata al lato Cliente e a un solo file** (`ServerCliente.js`),
  verificato da un sottoinsieme mirato della suite (autenticazione e registrazione): un'estensione
  all'intero backend, o al lato Gestore, avrebbe moltiplicato i tempi di esecuzione (il command
  runner rilancia l'intera suite selezionata per ogni mutante) senza un beneficio dimostrativo
  proporzionale per lo scope di questo progetto.
- **Il mutation testing (mutazione del codice dei test) è stato dimostrato solo manualmente**, su
  un singolo test case, per l'assenza di tooling automatizzato maturo per questa tecnica specifica
  (si veda la sezione dedicata sopra).

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

**`mvn test` restituisce un errore di dipendenza non trovata al primo avvio**
Verifica la connessione a Internet: il `pom.xml` include `mongodb-driver-sync`, scaricata da Maven
Central al primo build. Le esecuzioni successive non richiedono più connettività, grazie alla cache
locale di Maven.

**`mvn: command not found`**
Maven non è installato a livello di sistema (probabile se il progetto è stato finora eseguito solo
tramite IDE). Su macOS: `brew install maven`, poi verifica con `mvn -version`.

**`npx stryker run` fallisce con `Cannot find module '.../sandbox-xxx/ServerCliente.js'`**
Il file non è tracciato da git: Stryker costruisce la sandbox solo a partire dai file tracciati.
Verifica con `git ls-files | grep ServerCliente` e, se non compare, aggiungilo con `git add`.

**`npx stryker run` fallisce con `EADDRINUSE: address already in use :::3001`**
C'è un'istanza di `ServerCliente.js` già in ascolto sulla porta 3001, avviata manualmente e non
terminata. Trovala con `lsof -i :3001` e terminala (`kill -9 <PID>`) prima di rilanciare Stryker:
lo script si occupa da solo di avviare e fermare il server per ogni mutante, non va tenuto attivo
manualmente in parallelo.

**`npx nyc node ServerCliente.js` produce un report vuoto o senza righe strumentate**
Quasi certamente un problema di versione di Node troppo recente (osservato con la 26.x). Passa a
una versione LTS (18.x o 20.x), ad esempio con `nvm use 20`, e ripeti il comando. Questo problema
riguarda solo l'analisi di code coverage facoltativa, non l'esecuzione ordinaria dei server, della
suite di test, o della mutation analysis con Stryker.