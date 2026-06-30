const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');

const app = express();

// ============================================================
// FIX #1: Nome cartella corretto (case-sensitive su Mac/Linux)
// Sostituisci 'client' qui sotto con il nome ESATTO della tua cartella
// ============================================================
const STATIC_DIR = path.join(__dirname, 'Client'); 

app.use(express.static(STATIC_DIR));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // utile se in futuro mandi JSON dal client invece di urlencoded

// ============================================================
// FIX #2: Route esplicita per la home, perché il file si chiama
// client.html e non index.html (Express serve solo index.html in automatico)
// ============================================================
app.get('/', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'Cliente.html'));
});

// ============================================================
// Connessione MongoDB - resta locale per ora come da richiesta precedente
// (se passi ad Atlas, sostituisci questa stringa con quella di Atlas)
// ============================================================
mongoose.connect('mongodb://localhost:27017/Cliente')
  .then(() => console.log('Connessione con MongoDB avvenuta con successo'))
  .catch((error) => console.log('ERRORE CONNESSIONE CON MONGODB NON RIUSCITA', error));

const db = mongoose.connection;
db.on('error', (error) => {
  console.log('Errore di connessione MongoDB:', error);
});

// ============================================================
// Schemi (invariati rispetto all'originale)
// ============================================================
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

// ============================================================
// ROUTES
// ============================================================

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
    console.log('Utente aggiunto');

    const newLogin = new LoginCliente({ nome: newCliente.nome, password: newCliente.password });
    await newLogin.save();

    const newCarrello = new Carrello({ nome: newCliente.nome });
    await newCarrello.save();

    const riepilogo = `UTENTE REGISTRATO nome:${newCliente.nome} password:${newCliente.password} numero:${newCliente.numero} carta:${newCliente.carta}`;
    res.json({ riepilogo });
  } catch (err) {
    console.log('Errore durante la registrazione', err);
    res.status(500).json({ message: 'Errore durante la registrazione' });
  }
});

// LOGIN - qui dovrebbe nascere il cookie di sessione (vedi nota sotto)
app.post('/login', async (req, res) => {
  const { nome, password } = req.body;
  try {
    const result = await LoginCliente.findOne({ nome, password });
    if (result) {
      console.log('Accesso effettuato da:', nome);

      // ============================================================
      // FIX #3: il cookie di sessione ora viene SCRITTO davvero
      // ============================================================
      res.cookie('session', nome, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 2 // 2 ore
      });

      res.json({ message: 'Accesso effettuato con successo', nome });
    } else {
      console.log('Credenziali non valide');
      res.status(401).json({ message: 'Credenziali non valide' });
    }
  } catch (err) {
    console.error('Errore durante la query al database', err);
    res.status(500).json({ message: 'Errore durante il login' });
  }
});

// LOGOUT - aggiunto, mancava nell'originale
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ message: 'Logout effettuato' });
});

// VISUALIZZA CATALOGO
app.get('/visualizza', (req, res) => {
  const filePath = path.join(__dirname, 'Opere.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Errore durante la lettura del file', err);
      return res.status(500).json({ message: 'errore' });
    }
    res.json(JSON.parse(data));
  });
});

// AGGIUNGI OPERA AL CARRELLO
app.post('/aggiungiCarrello', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'Opere.json');
    const opere = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const prezzoCorrispondente = opere.find((opera) => opera.codice === req.body.codice);
    const prezzoOpera = prezzoCorrispondente ? parseFloat(prezzoCorrispondente.prezzo) : 0;

    const newCarrello = new Carrello({ nome: req.body.nome, codice: req.body.codice, prezzo: prezzoOpera });
    await newCarrello.save();

    const riepilogo = `Elemento aggiunto nel carrello nome:${newCarrello.nome} codice:${newCarrello.codice} prezzo:${newCarrello.prezzo}`;
    res.json({ riepilogo });
  } catch (err) {
    console.log('Errore', err);
    res.status(500).json({ message: "Errore durante l'aggiunta nel carrello" });
  }
});

// RIMUOVI DAL CARRELLO
app.post('/rimuoviCarrello', async (req, res) => {
  try {
    const condition = { nome: req.body.nome, codice: req.body.codice };
    const result = await Carrello.findOne(condition);

    if (result) {
      const deleteResult = await Carrello.deleteOne(condition);
      if (deleteResult.deletedCount > 0) {
        res.json({ message: 'Riepilogo opera eliminata:', nome: req.body.nome, codice: req.body.codice });
      } else {
        res.json({ message: 'Nessuna opera col codice corrispondente trovata per l\'eliminazione' });
      }
    } else {
      res.json({ message: 'Elemento non presente' });
    }
  } catch (error) {
    console.error("Errore durante l'operazione", error);
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
      res.json({ message: "il carrello dell'utente è vuoto" });
    }
  } catch (error) {
    console.error('Errore durante la gestione della richiesta', error);
    res.status(500).json({ message: 'Errore durante la gestione della richiesta' });
  }
});

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
      return res.json({ message: 'Il carrello dell\'utente è vuoto' });
    }

    const prodottiAcquisiti = await Promise.all(
      carrello.map(async (operaCarrello) => {
        const operaDettagli = await Carrello.findOne({ codice: operaCarrello.codice });
        return operaDettagli
          ? { codice: operaDettagli.codice, prezzo: operaDettagli.prezzo, quantita: 1 }
          : null;
      })
    );

    let somma = 0;
    for (const prodotto of prodottiAcquisiti) {
      if (prodotto) somma += Math.floor(Number(prodotto.prezzo));
    }

    const ordineEffettuato = new Ordine({
      id: Math.random() * 100,
      utente: nomeUtente,
      data: getCurrentDate(),
      prezzo: somma.toFixed(2),
      prodottiAcquistati: prodottiAcquisiti.filter(Boolean)
    });

    const resultOrdine = await ordineEffettuato.save();

    const messaggi = prodottiAcquisiti
      .filter(Boolean)
      .map((opera) => `Hai acquistato l'opera con codice: ${opera.codice} al prezzo di ${opera.prezzo}`);

    const alertMessage = 'Grazie per aver acquistato da noi. Il tuo ordine è stato confermato.';
    simulateSendSMS(result.numero, alertMessage, messaggi);

    res.json({ message: alertMessage, ordine: resultOrdine });

    fs.appendFileSync('Ordini.json', JSON.stringify([ordineEffettuato], null, 2));
  } catch (error) {
    console.error('Errore durante la gestione della richiesta', error);
    res.status(500).json({ message: 'Errore durante la gestione della richiesta' });
  }
});

// VENDI OPERA
const vendiOpereFilePath = path.join(__dirname, 'VendiOpere.json');
app.post('/VendiOpera', async (req, res) => {
  try {
    const newOpera = new VendiOpera(req.body);
    await newOpera.save();

    const riepilogo = `OPERA REGISTRATA nomeCliente:${newOpera.nomeCliente} nome:${newOpera.nome} prezzo:${newOpera.prezzo}`;
    res.json({ riepilogo });

    let opere = [];
    if (fs.existsSync(vendiOpereFilePath)) {
      const leggifile = fs.readFileSync(vendiOpereFilePath, 'utf-8');
      if (leggifile) opere = JSON.parse(leggifile);
    }
    opere.push(newOpera);
    fs.writeFileSync(vendiOpereFilePath, JSON.stringify(opere, null, 2), 'utf-8');
  } catch (error) {
    console.error('Errore durante la registrazione/scrittura', error);
    res.status(500).json({ message: 'Errore durante la registrazione' });
  }
});

// VISUALIZZA OFFERTA
app.get('/visualizzaOfferta', (req, res) => {
  const visualizzaOpereFilePath = path.join(__dirname, 'Richieste.json');
  try {
    const opere = JSON.parse(fs.readFileSync(visualizzaOpereFilePath, 'utf-8'));
    res.json(opere);
  } catch (error) {
    console.error('Errore durante la lettura del file:', error);
    res.status(500).json({ message: "Errore durante l'operazione di lettura del file" });
  }
});

// ACCETTA OFFERTA
app.post('/accettaOfferta', async (req, res) => {
  const offertaFilePath = path.join(__dirname, 'stato.json');

  const statiValidi = ['accetto', 'proponi', 'rifiuta'];
  if (!statiValidi.includes(req.body.stato)) {
    return res.status(400).json({ message: 'Lo stato fornito non è valido' });
  }

  try {
    const newOfferta = new Offerta(req.body);
    await newOfferta.save();

    const riepilogo = `OFFERTA REGISTRATA nomeCliente:${newOfferta.nomeCliente} nome:${newOfferta.nome} prezzo:${newOfferta.prezzo} stato:${newOfferta.stato}`;

    if (newOfferta.stato === 'accetto') {
      const reportFilePath = path.join(__dirname, 'ReportVendite.json');
      fs.appendFileSync(reportFilePath, JSON.stringify([newOfferta], null, 2), 'utf-8');
    }

    res.json({ riepilogo });

    let opere = [];
    if (fs.existsSync(offertaFilePath)) {
      const leggifile = fs.readFileSync(offertaFilePath, 'utf-8');
      if (leggifile) opere = JSON.parse(leggifile);
    }
    opere.push(newOfferta);
    fs.writeFileSync(offertaFilePath, JSON.stringify(opere, null, 2), 'utf-8');
  } catch (error) {
    console.error('Errore durante la registrazione/scrittura', error);
    res.status(500).json({ message: 'Errore durante la registrazione' });
  }
});

// ============================================================
// Avvio server - una sola volta, alla fine del file
// ============================================================
const PORT = 3001;
http.createServer(app).listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});