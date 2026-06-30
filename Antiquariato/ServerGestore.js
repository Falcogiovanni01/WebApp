const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Middleware nativi di Express (sostituiscono body-parser)
app.use(express.static(path.join(__dirname, 'Gestore')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'Gestore.html'));
});


// Connessione a MongoDB (usando l'IP standard per evitare ritardi di risoluzione DNS su alcuni sistemi)
mongoose.connect('mongodb://127.0.0.1:27017/Gestore')
    .then(() => console.log('Connessione con MongoDB avvenuta con successo'))
    .catch((err) => console.error('ERRORE CONNESSIONE CON MONGO DB NON RIUSCITA:', err));

// --- SCHEMAS E MODELLI ---

const OperaSchema = new mongoose.Schema({
    codice: String,
    nome: String,
    descrizione: String,
    prezzo: String,
    immagine1: [Buffer],
    immagine2: [Buffer],
    immagine3: [Buffer],
    immagine4: [Buffer],
    tecnica: String,
    dimensione: String,
    peso: String,
    altezza: String
});
const Opera = mongoose.model('Opera', OperaSchema);

const VendiOperaSchema = new mongoose.Schema({
    nomeCliente: String,
    nome: String,
    prezzoVendita: String
});
const VendiOpera = mongoose.model('VendiOpera', VendiOperaSchema);

// File Paths relativi e sicuri
const opereFilePath = path.join(__dirname, 'Opere.json');
const richiesteFilePath = path.join(__dirname, 'Richieste.json');
const ordiniFilePath = path.join(__dirname, 'Ordini.json');
const statoFilePath = path.join(__dirname, 'stato.json');
const reportVenditeFilePath = path.join(__dirname, 'ReportVendite.json');

// --- UTILITIES ---

function logAction(action, details) {
    const logEntry = `${new Date().toISOString()} - ${action}: ${JSON.stringify(details)}\n`;
    fs.appendFile(path.join(__dirname, 'log.txt'), logEntry, (err) => {
        if (err) console.error('Errore durante la scrittura del log:', err);
    });
}

// --- ROTTE API ---

app.get('/AggiuntaOpera', (req, res) => {
    res.send('Endpoint temporaneo per lo sviluppo.');
});

// Aggiungi Opera
app.post('/AggiungiOpera', async (req, res) => {
    try {
        console.log('Ricevuto:', req.body);
        const newOpera = new Opera({ ...req.body });
        await newOpera.save();
        console.log('Opera aggiunta nel DB');

        // Aggiornamento sicuro del file JSON locale
        let opere = [];
        if (fs.existsSync(opereFilePath)) {
            const leggiFile = fs.readFileSync(opereFilePath, 'utf-8');
            opere = leggiFile ? JSON.parse(leggiFile) : [];
        }
        opere.push(newOpera);
        fs.writeFileSync(opereFilePath, JSON.stringify(opere, null, 2), 'utf-8');
        console.log('Opera salvata nel file JSON');

        res.json({ message: 'Opera registrata con successo', codice: newOpera.codice });
    } catch (error) {
        console.error("Errore nell'inserimento dell'opera:", error);
        res.status(500).json({ message: "Errore interno durante il salvataggio" });
    }
});

// Modifica Opera
app.post('/ModificaOpera', async (req, res) => {
    try {
        const conditions = { codice: req.body.codice, nome: req.body.nome };
        const update = { $set: { ...req.body } };
        
        const result = await Opera.findOne(conditions);
        if (!result) {
            console.log('Elemento non presente');
            return res.status(404).json({ message: 'Elemento non presente' });
        }

        const updateResult = await Opera.updateOne(conditions, update);
        if (updateResult.modifiedCount > 0) {
            console.log('Aggiornamento avvenuto con successo');
            return res.json({ message: 'Riepilogo opera aggiornata:', data: req.body });
        } else {
            return res.json({ message: 'Elemento presente ma non modificato' });
        }
    } catch (error) {
        console.error('Errore durante la modifica:', error);
        res.status(500).json({ message: "Errore durante l'operazione" });
    }
});

// Rimuovi Opera
app.post('/RimuoviOpera', async (req, res) => {
    try {
        const conditions = { codice: req.body.codice, nome: req.body.nome };
        const result = await Opera.findOne(conditions);
        
        if (!result) {
            console.log('Elemento non presente');
            return res.status(404).json({ message: 'Elemento non presente' });
        }

        const deleteResult = await Opera.deleteOne(conditions);
        if (deleteResult.deletedCount > 0) {
            console.log('Eliminazione avvenuta con successo');
            res.json({ message: 'Riepilogo opera eliminata:', data: result });
        } else {
            res.json({ message: "Errore durante l'eliminazione" });
        }
    } catch (error) {
        console.error('Errore durante la rimozione:', error);
        res.status(500).json({ message: "Errore durante l'operazione" });
    }
});

// Visualizza Opere inserite dai Clienti
app.get('/visualizzaOpere', (req, res) => {
    try {
        if (!fs.existsSync(richiesteFilePath)) return res.json([]);
        const leggiFile = fs.readFileSync(richiesteFilePath, 'utf-8');
        const opere = leggiFile ? JSON.parse(leggiFile) : [];
        res.json(opere);
    } catch (error) {
        console.error('Errore lettura richieste:', error);
        res.status(500).json({ message: 'Errore di lettura' });
    }
});

// Report Acquisti Effettuati dai Clienti (Risolto bug di riferimento oggetti)
app.get('/reportAcquisti', (req, res) => {
    try {
        if (!fs.existsSync(ordiniFilePath)) return res.json([]);
        const leggiFile = fs.readFileSync(ordiniFilePath, 'utf-8');
        const ordini = leggiFile ? JSON.parse(leggiFile) : [];

        // Aggregazione corretta tramite mappa per evitare duplicazioni e sovrascritture di puntatori
        const aggregazione = {};
        ordini.forEach((ordine) => {
            const utente = ordine.utente;
            const prezzo = Math.floor(Number(ordine.prezzo || 0));

            if (!aggregazione[utente]) {
                aggregazione[utente] = { utente: utente, somma: 0, numeroSpese: 0 };
            }
            aggregazione[utente].somma += prezzo;
            aggregazione[utente].numeroSpese += 1;
        });

        res.json(Object.values(aggregazione));
    } catch (error) {
        console.error('Errore elaborazione report acquisti:', error);
        res.status(500).json({ message: 'Errore di elaborazione' });
    }
});

// Gestione Proposta di Vendita del Cliente
app.post('/VendiOpera', async (req, res) => {
    try {
        console.log(req.body);
        const newOpera = new VendiOpera({
            nomeCliente: req.body.nomeCliente,
            nome: req.body.nome,
            prezzoVendita: req.body.prezzoVendita
        });
        await newOpera.save();

        let richieste = [];
        if (fs.existsSync(richiesteFilePath)) {
            const leggiFile = fs.readFileSync(richiesteFilePath, 'utf-8');
            richieste = leggiFile ? JSON.parse(leggiFile) : [];
        }
        richieste.push(newOpera);
        fs.writeFileSync(richiesteFilePath, JSON.stringify(richieste, null, 2), 'utf-8');

        res.json({ message: 'Richiesta inoltrata', riepilogo: req.body });
    } catch (error) {
        console.error('Errore inoltro vendita:', error);
        res.status(500).json({ message: 'Errore di salvataggio' });
    }
});

// Visualizza Scelte ed Esiti degli Stati
app.get('/visualizzaSceltaClient', (req, res) => {
    try {
        if (!fs.existsSync(statoFilePath)) return res.json([]);
        const leggiFile = fs.readFileSync(statoFilePath, 'utf-8');
        const opere = leggiFile ? JSON.parse(leggiFile) : [];
        res.json(opere);
    } catch (error) {
        console.error('Errore lettura stati:', error);
        res.status(500).json({ message: 'Errore di lettura' });
    }
});

// Report delle Vendite Accettate (Risolto bug di riferimento e proprietà non corrispondenti)
app.get('/reportVendite', (req, res) => {
    try {
        if (!fs.existsSync(reportVenditeFilePath)) return res.json([]);
        const leggiFile = fs.readFileSync(reportVenditeFilePath, 'utf-8');
        const vendite = leggiFile ? JSON.parse(leggiFile) : [];

        const aggregazione = {};
        vendite.forEach((vendita) => {
            // Mappatura coerente con i campi di Offerta salvati dal client (nomeCliente e prezzo)
            const utente = vendita.nomeCliente || 'Sconosciuto';
            const prezzo = Math.floor(Number(vendita.prezzo || 0));

            if (!aggregazione[utente]) {
                aggregazione[utente] = { nome: utente, somma: 0, numeroVendite: 0 };
            }
            aggregazione[utente].somma += prezzo;
            aggregazione[utente].numeroVendite += 1;
        });

        res.json(Object.values(aggregazione));
    } catch (error) {
        console.error('Errore elaborazione report vendite:', error);
        res.status(500).json({ message: 'Errore di elaborazione' });
    }
});

// Avvio nativo del server Express
app.listen(PORT, () => {
    console.log(`Server Gestore in ascolto sulla porta ${PORT}`);
});