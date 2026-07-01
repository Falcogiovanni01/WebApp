const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = 3001;

// Nome della cartella contenente i file statici del client
const STATIC_DIR = path.join(__dirname, 'Client'); 

// Middleware nativi di Express
app.use(express.static(STATIC_DIR));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ============================================================
// FIX #2: Mantenuto - Route esplicita per la home page cliente
// ============================================================
app.get('/', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'Cliente.html'));
});

// Connessione MongoDB (utilizzato l'IP standard 127.0.0.1 per stabilità su ambienti Unix/Mac)
mongoose.connect('mongodb://127.0.0.1:27017/Cliente')
  .then(() => console.log('Connessione con MongoDB avvenuta con successo'))
  .catch((error) => console.error('ERRORE CONNESSIONE CON MONGODB NON RIUSCITA:', error));

// --- SCHEMAS E MODELLI ---

const ClienteSchema = new mongoose.Schema({
  nome: String,
  password: String,
  numero: String,
  carta: String
});
const Cliente = mongoose.model('Cliente', ClienteSchema);

const LoginSchema = new mongoose.Schema({
  nome: String,
  password: String
});
const LoginCliente = mongoose.model('LoginCliente', LoginSchema);

const CarrelloSchema = new mongoose.Schema({
  nome: String,
  codice: String,
  prezzo: String
});
const Carrello = mongoose.model('Carrello', CarrelloSchema);

const OrdineSchema = new mongoose.Schema({
  id: Number,
  utente: String,
  data: String,
  prezzo: Number,
  prodottiAcquistati: [
    {
      codice: String,
      prezzo: String,
      quantita: Number
    }
  ]
});
const Ordine = mongoose.model('Ordine', OrdineSchema);

const VendiOperaSchema = new mongoose.Schema({
  nomeCliente: String,
  numero: String,
  nome: String,
  descrizione: String,
  immagine1: [Buffer],
  immagine2: [Buffer],
  immagine3: [Buffer],
  immagine4: [Buffer],
  tecnica: String,
  dimensione: String,
  peso: String,
  altezza: String,
  prezzo: String
});
const VendiOpera = mongoose.model('VendiOpera', VendiOperaSchema);

const OffertaSchema = new mongoose.Schema({
  nomeCliente: String,
  nome: String,
  prezzo: String,
  stato: String
});
const Offerta = mongoose.model('Offerta', OffertaSchema);

// File Paths Relativi
const opereFilePath = path.join(__dirname, 'Opere.json');
const ordiniFilePath = path.join(__dirname, 'Ordini.json');
const vendiOpereFilePath = path.join(__dirname, 'VendiOpere.json');
const richiesteFilePath = path.join(__dirname, 'Richieste.json');
const statoFilePath = path.join(__dirname, 'stato.json');
const reportVenditeFilePath = path.join(__dirname, 'ReportVendite.json');

// --- HELPER FUNCTIONS ---

function simulateSendSMS(numeroUtente, smsMessage, messaggi) {
  console.log('Simulazione SMS inviato a', numeroUtente, 'con il messaggio:', smsMessage);
  console.log('Messaggi dettagliati:', messaggi);
}

function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper per aggiornare i file JSON in modo sicuro senza corrompere la sintassi degli array
function safeAppendToJsonFile(filePath, newItem) {
  let list = [];
  if (fs.existsSync(filePath)) {
    try {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      list = fileData ? JSON.parse(fileData) : [];
    } catch (e) {
      list = [];
    }
  }
  list.push(newItem);
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
}

// --- ROTTE API ---

// REGISTRAZIONE
app.post('/registrazione', async (req, res) => {
  try {
    const newCliente = new Cliente({
      nome: req.body.nome,
      password: req.body.password,
      numero: req.body.numero,
      carta: req.body.carta
    });
    await newCliente.save();
    console.log('Utente aggiunto nel DB');

    const newLogin = new LoginCliente({ nome: newCliente.nome, password: newCliente.password });
    await newLogin.save();

    const newCarrello = new Carrello({ nome: newCliente.nome });
    await newCarrello.save();

    const riepilogo = `UTENTE REGISTRATO nome:${newCliente.nome} password:${newCliente.password} numero:${newCliente.numero} carta:${newCliente.carta}`;
    res.json({ riepilogo });
  } catch (err) {
    console.error('Errore durante la registrazione:', err);
    res.status(500).json({ message: 'Errore durante la registrazione' });
  }
});
// ============================================================
// ROTTE DI AUTENTICAZIONE E GESTIONE SESSIONE
// ============================================================

// LOGIN
app.post('/login', async (req, res) => {
  const { nome, password } = req.body;
  try {
    const result = await LoginCliente.findOne({ nome, password });
    if (result) {
      console.log('Accesso effettuato da:', nome);

      // Scrittura del cookie di sessione (FSM Stato S2)
      res.cookie('session', nome, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 2 // Validità: 2 ore
      });

      res.json({ message: 'Accesso effettuato con successo', nome });
    } else {
      console.log('Credenziali non valide');
      res.status(401).json({ message: 'Credenziali non valide' });
    }
  } catch (err) {
    console.error('Errore durante il login:', err);
    res.status(500).json({ message: 'Errore durante il login' });
  }
});

// CHECK SESSION 
app.get('/checkSessionCliente', (req, res) => {
    const cookieHeader = req.headers.cookie;
    if (cookieHeader && cookieHeader.includes('session=')) { 
        res.json({ success: true, message: "Sessione client valida" });
    } else {
        res.status(401).json({ success: false, message: "Sessione non trovata" });
    }
});

// LOGOUT 
app.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ message: 'Logout effettuato con successo' });
});

// VISUALIZZA CATALOGO
app.get('/visualizza', (req, res) => {
  if (!fs.existsSync(opereFilePath)) return res.json([]);
  fs.readFile(opereFilePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Errore durante la lettura del catalogo:', err);
      return res.status(500).json({ message: 'Errore di lettura del catalogo' });
    }
    res.json(JSON.parse(data || '[]'));
  });
});

// AGGIUNGI OPERA AL CARRELLO
// AGGIUNGI OPERA AL CARRELLO
app.post('/aggiungiCarrello', async (req, res) => {
  try {
    let opere = [];
    if (fs.existsSync(opereFilePath)) {
      opere = JSON.parse(fs.readFileSync(opereFilePath, 'utf-8') || '[]');
    }
    // Recupera il prezzo corrispondente dal catalogo JSON
    const prezzoCorrispondente = opere.find((opera) => opera.codice === req.body.codice);
    const prezzoOpera = prezzoCorrispondente ? parseFloat(prezzoCorrispondente.prezzo) : 0;

    // Salva l'elemento nel carrello MongoDB dell'utente
    const newCarrello = new Carrello({ 
      nome: req.body.nome, 
      codice: req.body.codice, 
      prezzo: prezzoOpera 
    });
    await newCarrello.save();

    res.json({ message: "Opera aggiunta al carrello con successo!" });
  } catch (err) {
    console.error("Errore aggiunta carrello:", err);
    res.status(500).json({ message: "Errore durante l'aggiunta nel carrello" });
  }
});
// ACQUISTA
app.post('/acquista', async (req, res) => {
  try {
    const { nome: nomeUtente, password } = req.body;
    const result = await Cliente.findOne({ nome: nomeUtente, password });

    if (!result) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    const carrello = await Carrello.find({ nome: nomeUtente });
    if (carrello.length === 0) {
      return res.json({ message: "Il carrello dell'utente è vuoto" });
    }

    const prodottiAcquisiti = await Promise.all(
      carrello.map(async (operaCarrello) => {
        const operaDettagli = await Carrello.findOne({ codice: operaCarrello.codice });
        return operaDettagli
          ? { codice: operaDettagli.codice, prezzo: operaDettagli.prezzo, quantita: 1 }
          : null;
      })
    );

    const validi = prodottiAcquisiti.filter(Boolean);
    let somma = 0;
    validi.forEach(p => { somma += Math.floor(Number(p.prezzo || 0)); });

    const ordineEffettuato = new Ordine({
      id: Math.floor(Math.random() * 100000),
      utente: nomeUtente,
      data: getCurrentDate(),
      prezzo: somma.toFixed(2),
      prodottiAcquistati: validi
    });

    const resultOrdine = await ordineEffettuato.save();

    const messaggi = validi.map((opera) => `Hai acquistato l'opera con codice: ${opera.codice} al prezzo di ${opera.prezzo}`);
    const alertMessage = 'Grazie per aver acquistato da noi. Il tuo ordine è stato confermato.';
    simulateSendSMS(result.numero, alertMessage, messaggi);

    // Salvataggio sicuro nel file JSON strutturato
    safeAppendToJsonFile(ordiniFilePath, ordineEffettuato);

    // Svuota il carrello dell'utente dopo l'acquisto
    await Carrello.deleteMany({ nome: nomeUtente });

    // --- NUOVA LOGICA: RIMOZIONE DAL CATALOGO ---
    if (fs.existsSync(opereFilePath)) {
        let catalogo = JSON.parse(fs.readFileSync(opereFilePath, 'utf-8') || '[]');
        
        // Estrai tutti i codici dei prodotti acquistati
        const codiciAcquistati = validi.map(p => p.codice);
        
        // Filtra il catalogo mantenendo solo le opere NON acquistate
        const catalogoAggiornato = catalogo.filter(opera => !codiciAcquistati.includes(opera.codice));
        
        // Riscrivi il catalogo aggiornato
        fs.writeFileSync(opereFilePath, JSON.stringify(catalogoAggiornato, null, 2), 'utf-8');
        console.log(`Opere rimosse dal catalogo: ${codiciAcquistati.join(', ')}`);
    }
    // ---------------------------------------------

    res.json({ message: alertMessage, ordine: resultOrdine });
  } catch (error) {
    console.error("Errore durante l'acquisto:", error);
    res.status(500).json({ message: 'Errore durante la gestione della richiesta' });
  }
});

// RIMUOVI DAL CARRELLO
app.post('/rimuoviCarrello', async (req, res) => {
  try {
    const condition = { nome: req.body.nome, codice: req.body.codice };
    const result = await Carrello.findOne(condition);

    if (result) {
      await Carrello.deleteOne(condition);
      res.json({ message: 'Riepilogo opera eliminata:', nome: req.body.nome, codice: req.body.codice });
    } else {
      res.status(404).json({ message: 'Elemento non presente nel carrello' });
    }
  } catch (error) {
    console.error("Errore rimozione carrello:", error);
    res.status(500).json({ message: "Errore durante l'operazione" });
  }
});

// VISUALIZZA CARRELLO
app.post('/visualizzaCarrello', async (req, res) => {
  try {
    const { nome: nomeUtente, password } = req.body;
    const result = await LoginCliente.findOne({ nome: nomeUtente, password });

    if (!result) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    const carrello = await Carrello.find({ nome: nomeUtente });
    if (carrello.length > 0) {
      res.json({ carrello });
    } else {
      res.json({ message: "Il carrello dell'utente è vuoto" });
    }
  } catch (error) {
    console.error('Errore visualizzazione carrello:', error);
    res.status(500).json({ message: 'Errore durante la gestione della richiesta' });
  }
});

// ACQUISTA
app.post('/acquista', async (req, res) => {
  try {
    const { nome: nomeUtente, password } = req.body;
    const result = await Cliente.findOne({ nome: nomeUtente, password });

    if (!result) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    const carrello = await Carrello.find({ nome: nomeUtente });
    if (carrello.length === 0) {
      return res.json({ message: "Il carrello dell'utente è vuoto" });
    }

    const prodottiAcquisiti = await Promise.all(
      carrello.map(async (operaCarrello) => {
        const operaDettagli = await Carrello.findOne({ codice: operaCarrello.codice });
        return operaDettagli
          ? { codice: operaDettagli.codice, prezzo: operaDettagli.prezzo, quantita: 1 }
          : null;
      })
    );

    const validi = prodottiAcquisiti.filter(Boolean);
    let somma = 0;
    validi.forEach(p => { somma += Math.floor(Number(p.prezzo || 0)); });

    const ordineEffettuato = new Ordine({
      id: Math.floor(Math.random() * 100000),
      utente: nomeUtente,
      data: getCurrentDate(),
      prezzo: somma.toFixed(2),
      prodottiAcquistati: validi
    });

    const resultOrdine = await ordineEffettuato.save();

    const messaggi = validi.map((opera) => `Hai acquistato l'opera con codice: ${opera.codice} al prezzo di ${opera.prezzo}`);
    const alertMessage = 'Grazie per aver acquistato da noi. Il tuo ordine è stato confermato.';
    simulateSendSMS(result.numero, alertMessage, messaggi);

    // Salvataggio sicuro nel file JSON strutturato
    safeAppendToJsonFile(ordiniFilePath, ordineEffettuato);

    // Svuota il carrello dell'utente dopo l'acquisto
    await Carrello.deleteMany({ nome: nomeUtente });

    res.json({ message: alertMessage, ordine: resultOrdine });
  } catch (error) {
    console.error('Errore durante l acquisto:', error);
    res.status(500).json({ message: 'Errore durante la gestione della richiesta' });
  }
});

// // VENDI OPERA (Proposta cliente)
// app.post('/VendiOpera', async (req, res) => {
//   try {
//     const newOpera = new VendiOpera(req.body);
//     await newOpera.save();

//     safeAppendToJsonFile(vendiOpereFilePath, newOpera);
//     res.json({ riepilogo: `OPERA REGISTRATA nomeCliente:${newOpera.nomeCliente} nome:${newOpera.nome} prezzo:${newOpera.prezzo}` });
//   } catch (error) {
//     console.error('Errore durante la proposta di vendita:', error);
//     res.status(500).json({ message: 'Errore durante la registrazione' });
//   }
// });

// // VISUALIZZA OFFERTA
// app.get('/visualizzaOfferta', (req, res) => {
//   try {
//     if (!fs.existsSync(richiesteFilePath)) return res.json([]);
//     const opere = JSON.parse(fs.readFileSync(richiesteFilePath, 'utf-8') || '[]');
//     res.json(opere);
//   } catch (error) {
//     console.error('Errore lettura offerte:', error);
//     res.status(500).json({ message: "Errore durante l'operazione di lettura del file" });
//   }
// });

// // ACCETTA OFFERTA
// app.post('/accettaOfferta', async (req, res) => {
//   const statiValidi = ['accetto', 'proponi', 'rifiuta'];
//   if (!statiValidi.includes(req.body.stato)) {
//     return res.status(400).json({ message: 'Lo stato fornito non è valido' });
//   }

//   try {
//     const newOfferta = new Offerta(req.body);
//     await newOfferta.save();

//     if (newOfferta.stato === 'accetto') {
//       safeAppendToJsonFile(reportVenditeFilePath, newOfferta);
//     }

//     safeAppendToJsonFile(statoFilePath, newOfferta);
//     res.json({ riepilogo: `OFFERTA REGISTRATA nomeCliente:${newOfferta.nomeCliente} nome:${newOfferta.nome} prezzo:${newOfferta.prezzo} stato:${newOfferta.stato}` });
//   } catch (error) {
//     console.error('Errore accettazione offerta:', error);
//     res.status(500).json({ message: 'Errore durante la registrazione' });
//   }
// });

// Avvio nativo dell'applicazione Express
app.listen(PORT, () => {
  console.log(`Server Cliente in ascolto sulla porta ${PORT}`);
});