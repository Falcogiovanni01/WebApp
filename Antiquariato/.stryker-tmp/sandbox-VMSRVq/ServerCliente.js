// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3001;
const SALT_ROUNDS = 10;

// Nome della cartella contenente i file statici del client
const STATIC_DIR = path.join(__dirname, stryMutAct_9fa48("0") ? "" : (stryCov_9fa48("0"), 'Client'));

// Middleware nativi di Express
app.use(express.static(STATIC_DIR));
app.use(express.urlencoded(stryMutAct_9fa48("1") ? {} : (stryCov_9fa48("1"), {
  extended: stryMutAct_9fa48("2") ? false : (stryCov_9fa48("2"), true)
})));
app.use(express.json());
app.use(cookieParser());

// ============================================================
// FIX #1: Middleware di autenticazione basato SOLO sul cookie
// di sessione (stesso pattern già usato in ServerGestore.js).
// Da qui in poi, l'identità dell'utente per ogni operazione
// protetta viene letta da req.nomeAutenticato, mai da req.body.
// ============================================================
function requireClienteAuth(req, res, next) {
  if (stryMutAct_9fa48("3")) {
    {}
  } else {
    stryCov_9fa48("3");
    const nome = stryMutAct_9fa48("6") ? req.cookies || req.cookies.session : stryMutAct_9fa48("5") ? false : stryMutAct_9fa48("4") ? true : (stryCov_9fa48("4", "5", "6"), req.cookies && req.cookies.session);
    if (stryMutAct_9fa48("9") ? false : stryMutAct_9fa48("8") ? true : stryMutAct_9fa48("7") ? nome : (stryCov_9fa48("7", "8", "9"), !nome)) {
      if (stryMutAct_9fa48("10")) {
        {}
      } else {
        stryCov_9fa48("10");
        return res.status(401).json(stryMutAct_9fa48("11") ? {} : (stryCov_9fa48("11"), {
          message: stryMutAct_9fa48("12") ? "" : (stryCov_9fa48("12"), 'Sessione non valida: effettua il login')
        }));
      }
    }
    req.nomeAutenticato = nome;
    next();
  }
}

// ============================================================
// FIX #2: Mantenuto - Route esplicita per la home page cliente
// ============================================================
app.get(stryMutAct_9fa48("13") ? "" : (stryCov_9fa48("13"), '/'), (req, res) => {
  if (stryMutAct_9fa48("14")) {
    {}
  } else {
    stryCov_9fa48("14");
    res.sendFile(path.join(STATIC_DIR, stryMutAct_9fa48("15") ? "" : (stryCov_9fa48("15"), 'Cliente.html')));
  }
});

// Connessione MongoDB (utilizzato l'IP standard 127.0.0.1 per stabilità su ambienti Unix/Mac)
mongoose.connect(stryMutAct_9fa48("16") ? "" : (stryCov_9fa48("16"), 'mongodb://127.0.0.1:27017/Cliente')).then(stryMutAct_9fa48("17") ? () => undefined : (stryCov_9fa48("17"), () => console.log(stryMutAct_9fa48("18") ? "" : (stryCov_9fa48("18"), 'Connessione con MongoDB avvenuta con successo')))).catch(stryMutAct_9fa48("19") ? () => undefined : (stryCov_9fa48("19"), error => console.error(stryMutAct_9fa48("20") ? "" : (stryCov_9fa48("20"), 'ERRORE CONNESSIONE CON MONGODB NON RIUSCITA:'), error)));

// --- SCHEMAS E MODELLI ---

const ClienteSchema = new mongoose.Schema(stryMutAct_9fa48("21") ? {} : (stryCov_9fa48("21"), {
  nome: stryMutAct_9fa48("22") ? {} : (stryCov_9fa48("22"), {
    type: String,
    required: stryMutAct_9fa48("23") ? false : (stryCov_9fa48("23"), true),
    unique: stryMutAct_9fa48("24") ? false : (stryCov_9fa48("24"), true),
    trim: stryMutAct_9fa48("25") ? false : (stryCov_9fa48("25"), true)
  }),
  password: stryMutAct_9fa48("26") ? {} : (stryCov_9fa48("26"), {
    type: String,
    required: stryMutAct_9fa48("27") ? false : (stryCov_9fa48("27"), true)
  }),
  numero: stryMutAct_9fa48("28") ? {} : (stryCov_9fa48("28"), {
    type: String,
    required: stryMutAct_9fa48("29") ? false : (stryCov_9fa48("29"), true),
    unique: stryMutAct_9fa48("30") ? false : (stryCov_9fa48("30"), true),
    validate: stryMutAct_9fa48("31") ? {} : (stryCov_9fa48("31"), {
      validator: stryMutAct_9fa48("32") ? () => undefined : (stryCov_9fa48("32"), v => (stryMutAct_9fa48("36") ? /^\D{10}$/ : stryMutAct_9fa48("35") ? /^\d$/ : stryMutAct_9fa48("34") ? /^\d{10}/ : stryMutAct_9fa48("33") ? /\d{10}$/ : (stryCov_9fa48("33", "34", "35", "36"), /^\d{10}$/)).test(v)),
      message: stryMutAct_9fa48("37") ? () => undefined : (stryCov_9fa48("37"), props => stryMutAct_9fa48("38") ? `` : (stryCov_9fa48("38"), `Numero di telefono non valido ('${props.value}'): deve contenere esattamente 10 cifre.`))
    })
  }),
  carta: stryMutAct_9fa48("39") ? {} : (stryCov_9fa48("39"), {
    type: String,
    required: stryMutAct_9fa48("40") ? false : (stryCov_9fa48("40"), true),
    validate: stryMutAct_9fa48("41") ? {} : (stryCov_9fa48("41"), {
      validator: stryMutAct_9fa48("42") ? () => undefined : (stryCov_9fa48("42"), v => (stryMutAct_9fa48("46") ? /^\D{16}$/ : stryMutAct_9fa48("45") ? /^\d$/ : stryMutAct_9fa48("44") ? /^\d{16}/ : stryMutAct_9fa48("43") ? /\d{16}$/ : (stryCov_9fa48("43", "44", "45", "46"), /^\d{16}$/)).test(v)),
      message: stryMutAct_9fa48("47") ? () => undefined : (stryCov_9fa48("47"), props => stryMutAct_9fa48("48") ? `` : (stryCov_9fa48("48"), `Numero di carta non valido: deve contenere esattamente 16 cifre.`))
    })
  })
}));
const Cliente = mongoose.model(stryMutAct_9fa48("49") ? "" : (stryCov_9fa48("49"), 'Cliente'), ClienteSchema);
const CarrelloSchema = new mongoose.Schema(stryMutAct_9fa48("50") ? {} : (stryCov_9fa48("50"), {
  nome: String,
  codice: String,
  prezzo: String
}));
const Carrello = mongoose.model(stryMutAct_9fa48("51") ? "" : (stryCov_9fa48("51"), 'Carrello'), CarrelloSchema);
const OrdineSchema = new mongoose.Schema(stryMutAct_9fa48("52") ? {} : (stryCov_9fa48("52"), {
  id: Number,
  utente: String,
  data: String,
  prezzo: Number,
  prodottiAcquistati: stryMutAct_9fa48("53") ? [] : (stryCov_9fa48("53"), [stryMutAct_9fa48("54") ? {} : (stryCov_9fa48("54"), {
    codice: String,
    prezzo: String,
    quantita: Number
  })])
}));
const Ordine = mongoose.model(stryMutAct_9fa48("55") ? "" : (stryCov_9fa48("55"), 'Ordine'), OrdineSchema);
const VendiOperaSchema = new mongoose.Schema(stryMutAct_9fa48("56") ? {} : (stryCov_9fa48("56"), {
  nomeCliente: String,
  numero: String,
  nome: String,
  descrizione: String,
  immagine1: stryMutAct_9fa48("57") ? [] : (stryCov_9fa48("57"), [Buffer]),
  immagine2: stryMutAct_9fa48("58") ? [] : (stryCov_9fa48("58"), [Buffer]),
  immagine3: stryMutAct_9fa48("59") ? [] : (stryCov_9fa48("59"), [Buffer]),
  immagine4: stryMutAct_9fa48("60") ? [] : (stryCov_9fa48("60"), [Buffer]),
  tecnica: String,
  dimensione: String,
  peso: String,
  altezza: String,
  prezzo: String
}));
const VendiOpera = mongoose.model(stryMutAct_9fa48("61") ? "" : (stryCov_9fa48("61"), 'VendiOpera'), VendiOperaSchema);
const OffertaSchema = new mongoose.Schema(stryMutAct_9fa48("62") ? {} : (stryCov_9fa48("62"), {
  nomeCliente: String,
  nome: String,
  prezzo: String,
  stato: String
}));
const Offerta = mongoose.model(stryMutAct_9fa48("63") ? "" : (stryCov_9fa48("63"), 'Offerta'), OffertaSchema);

// File Paths Relativi
const opereFilePath = path.join(__dirname, stryMutAct_9fa48("64") ? "" : (stryCov_9fa48("64"), 'Opere.json'));
const ordiniFilePath = path.join(__dirname, stryMutAct_9fa48("65") ? "" : (stryCov_9fa48("65"), 'Ordini.json'));
const vendiOpereFilePath = path.join(__dirname, stryMutAct_9fa48("66") ? "" : (stryCov_9fa48("66"), 'VendiOpere.json'));
const richiesteFilePath = path.join(__dirname, stryMutAct_9fa48("67") ? "" : (stryCov_9fa48("67"), 'Richieste.json'));
const statoFilePath = path.join(__dirname, stryMutAct_9fa48("68") ? "" : (stryCov_9fa48("68"), 'stato.json'));
const reportVenditeFilePath = path.join(__dirname, stryMutAct_9fa48("69") ? "" : (stryCov_9fa48("69"), 'ReportVendite.json'));

// --- HELPER FUNCTIONS ---

function simulateSendSMS(numeroUtente, smsMessage, messaggi) {
  if (stryMutAct_9fa48("70")) {
    {}
  } else {
    stryCov_9fa48("70");
    console.log(stryMutAct_9fa48("71") ? "" : (stryCov_9fa48("71"), 'Simulazione SMS inviato a'), numeroUtente, stryMutAct_9fa48("72") ? "" : (stryCov_9fa48("72"), 'con il messaggio:'), smsMessage);
    console.log(stryMutAct_9fa48("73") ? "" : (stryCov_9fa48("73"), 'Messaggi dettagliati:'), messaggi);
  }
}
function getCurrentDate() {
  if (stryMutAct_9fa48("74")) {
    {}
  } else {
    stryCov_9fa48("74");
    const today = new Date();
    const year = today.getFullYear();
    const month = String(stryMutAct_9fa48("75") ? today.getMonth() - 1 : (stryCov_9fa48("75"), today.getMonth() + 1)).padStart(2, stryMutAct_9fa48("76") ? "" : (stryCov_9fa48("76"), '0'));
    const day = String(today.getDate()).padStart(2, stryMutAct_9fa48("77") ? "" : (stryCov_9fa48("77"), '0'));
    return stryMutAct_9fa48("78") ? `` : (stryCov_9fa48("78"), `${year}-${month}-${day}`);
  }
}

// Helper per aggiornare i file JSON in modo sicuro senza corrompere la sintassi degli array
function safeAppendToJsonFile(filePath, newItem) {
  if (stryMutAct_9fa48("79")) {
    {}
  } else {
    stryCov_9fa48("79");
    let list = stryMutAct_9fa48("80") ? ["Stryker was here"] : (stryCov_9fa48("80"), []);
    if (stryMutAct_9fa48("82") ? false : stryMutAct_9fa48("81") ? true : (stryCov_9fa48("81", "82"), fs.existsSync(filePath))) {
      if (stryMutAct_9fa48("83")) {
        {}
      } else {
        stryCov_9fa48("83");
        try {
          if (stryMutAct_9fa48("84")) {
            {}
          } else {
            stryCov_9fa48("84");
            const fileData = fs.readFileSync(filePath, stryMutAct_9fa48("85") ? "" : (stryCov_9fa48("85"), 'utf-8'));
            list = fileData ? JSON.parse(fileData) : stryMutAct_9fa48("86") ? ["Stryker was here"] : (stryCov_9fa48("86"), []);
          }
        } catch (e) {
          if (stryMutAct_9fa48("87")) {
            {}
          } else {
            stryCov_9fa48("87");
            list = stryMutAct_9fa48("88") ? ["Stryker was here"] : (stryCov_9fa48("88"), []);
          }
        }
      }
    }
    list.push(newItem);
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), stryMutAct_9fa48("89") ? "" : (stryCov_9fa48("89"), 'utf-8'));
  }
}

// --- ROTTE API ---

// REGISTRAZIONE
app.post(stryMutAct_9fa48("90") ? "" : (stryCov_9fa48("90"), '/registrazione'), async (req, res) => {
  if (stryMutAct_9fa48("91")) {
    {}
  } else {
    stryCov_9fa48("91");
    try {
      if (stryMutAct_9fa48("92")) {
        {}
      } else {
        stryCov_9fa48("92");
        // FIX #4: la password non viene più salvata in chiaro. bcryptjs è puro JS
        // (nessuna compilazione nativa richiesta), scelto apposta per restare
        // facilmente replicabile su qualunque macchina senza toolchain C++.
        const passwordHash = await bcrypt.hash(req.body.password, SALT_ROUNDS);
        const newCliente = new Cliente(stryMutAct_9fa48("93") ? {} : (stryCov_9fa48("93"), {
          nome: req.body.nome,
          password: passwordHash,
          numero: req.body.numero,
          carta: req.body.carta
        }));
        await newCliente.save();
        console.log(stryMutAct_9fa48("94") ? "" : (stryCov_9fa48("94"), 'Utente aggiunto nel DB'));

        // Non ripetiamo più la password (nemmeno l'hash) nella risposta al client.
        const riepilogo = stryMutAct_9fa48("95") ? `` : (stryCov_9fa48("95"), `UTENTE REGISTRATO nome:${newCliente.nome} numero:${newCliente.numero} carta:${newCliente.carta}`);
        res.json(stryMutAct_9fa48("96") ? {} : (stryCov_9fa48("96"), {
          riepilogo
        }));
      }
    } catch (err) {
      if (stryMutAct_9fa48("97")) {
        {}
      } else {
        stryCov_9fa48("97");
        console.error(stryMutAct_9fa48("98") ? "" : (stryCov_9fa48("98"), 'Errore durante la registrazione:'), err);

        // Violazione di un vincolo 'unique' (nome o numero già registrati)
        if (stryMutAct_9fa48("101") ? err.code !== 11000 : stryMutAct_9fa48("100") ? false : stryMutAct_9fa48("99") ? true : (stryCov_9fa48("99", "100", "101"), err.code === 11000)) {
          if (stryMutAct_9fa48("102")) {
            {}
          } else {
            stryCov_9fa48("102");
            const campo = stryMutAct_9fa48("105") ? Object.keys(err.keyPattern || err.keyValue || {})[0] && 'dato' : stryMutAct_9fa48("104") ? false : stryMutAct_9fa48("103") ? true : (stryCov_9fa48("103", "104", "105"), Object.keys(stryMutAct_9fa48("108") ? (err.keyPattern || err.keyValue) && {} : stryMutAct_9fa48("107") ? false : stryMutAct_9fa48("106") ? true : (stryCov_9fa48("106", "107", "108"), (stryMutAct_9fa48("110") ? err.keyPattern && err.keyValue : stryMutAct_9fa48("109") ? false : (stryCov_9fa48("109", "110"), err.keyPattern || err.keyValue)) || {}))[0] || (stryMutAct_9fa48("111") ? "" : (stryCov_9fa48("111"), 'dato')));
            const nomeCampo = (stryMutAct_9fa48("114") ? campo !== 'nome' : stryMutAct_9fa48("113") ? false : stryMutAct_9fa48("112") ? true : (stryCov_9fa48("112", "113", "114"), campo === (stryMutAct_9fa48("115") ? "" : (stryCov_9fa48("115"), 'nome')))) ? stryMutAct_9fa48("116") ? "" : (stryCov_9fa48("116"), 'nome utente') : (stryMutAct_9fa48("119") ? campo !== 'numero' : stryMutAct_9fa48("118") ? false : stryMutAct_9fa48("117") ? true : (stryCov_9fa48("117", "118", "119"), campo === (stryMutAct_9fa48("120") ? "" : (stryCov_9fa48("120"), 'numero')))) ? stryMutAct_9fa48("121") ? "" : (stryCov_9fa48("121"), 'numero di telefono') : campo;
            return res.status(409).json(stryMutAct_9fa48("122") ? {} : (stryCov_9fa48("122"), {
              message: stryMutAct_9fa48("123") ? `` : (stryCov_9fa48("123"), `Registrazione fallita: ${nomeCampo} già in uso.`)
            }));
          }
        }

        // Errore di validazione Mongoose (es. numero non a 10 cifre, carta non a 16 cifre)
        if (stryMutAct_9fa48("126") ? err.name !== 'ValidationError' : stryMutAct_9fa48("125") ? false : stryMutAct_9fa48("124") ? true : (stryCov_9fa48("124", "125", "126"), err.name === (stryMutAct_9fa48("127") ? "" : (stryCov_9fa48("127"), 'ValidationError')))) {
          if (stryMutAct_9fa48("128")) {
            {}
          } else {
            stryCov_9fa48("128");
            const primoErrore = Object.values(err.errors)[0];
            return res.status(400).json(stryMutAct_9fa48("129") ? {} : (stryCov_9fa48("129"), {
              message: primoErrore.message
            }));
          }
        }
        res.status(500).json(stryMutAct_9fa48("130") ? {} : (stryCov_9fa48("130"), {
          message: stryMutAct_9fa48("131") ? "" : (stryCov_9fa48("131"), 'Errore durante la registrazione')
        }));
      }
    }
  }
});
// ============================================================
// ROTTE DI AUTENTICAZIONE E GESTIONE SESSIONE
// ============================================================

// LOGIN
app.post(stryMutAct_9fa48("132") ? "" : (stryCov_9fa48("132"), '/login'), async (req, res) => {
  if (stryMutAct_9fa48("133")) {
    {}
  } else {
    stryCov_9fa48("133");
    const {
      nome,
      password
    } = req.body;
    try {
      if (stryMutAct_9fa48("134")) {
        {}
      } else {
        stryCov_9fa48("134");
        // FIX #4: non possiamo più cercare {nome, password} in un colpo solo,
        // perché la password è ora un hash: cerchiamo prima l'utente per nome,
        // poi confrontiamo la password in chiaro ricevuta con l'hash salvato.
        // (LoginCliente è stata rimossa: Cliente è ora l'unica fonte di verità
        // per le credenziali, niente più rischio di disallineamento tra due tabelle.)
        const result = await Cliente.findOne(stryMutAct_9fa48("135") ? {} : (stryCov_9fa48("135"), {
          nome
        }));
        const credenzialiValide = stryMutAct_9fa48("138") ? result || (await bcrypt.compare(password, result.password)) : stryMutAct_9fa48("137") ? false : stryMutAct_9fa48("136") ? true : (stryCov_9fa48("136", "137", "138"), result && (await bcrypt.compare(password, result.password)));
        if (stryMutAct_9fa48("140") ? false : stryMutAct_9fa48("139") ? true : (stryCov_9fa48("139", "140"), credenzialiValide)) {
          if (stryMutAct_9fa48("141")) {
            {}
          } else {
            stryCov_9fa48("141");
            console.log(stryMutAct_9fa48("142") ? "" : (stryCov_9fa48("142"), 'Accesso effettuato da:'), nome);

            // Scrittura del cookie di sessione (FSM Stato S2)
            res.cookie(stryMutAct_9fa48("143") ? "" : (stryCov_9fa48("143"), 'session'), nome, stryMutAct_9fa48("144") ? {} : (stryCov_9fa48("144"), {
              httpOnly: stryMutAct_9fa48("145") ? false : (stryCov_9fa48("145"), true),
              maxAge: stryMutAct_9fa48("146") ? 1000 * 60 * 60 / 2 : (stryCov_9fa48("146"), (stryMutAct_9fa48("147") ? 1000 * 60 / 60 : (stryCov_9fa48("147"), (stryMutAct_9fa48("148") ? 1000 / 60 : (stryCov_9fa48("148"), 1000 * 60)) * 60)) * 2) // Validità: 2 ore
            }));
            res.json(stryMutAct_9fa48("149") ? {} : (stryCov_9fa48("149"), {
              message: stryMutAct_9fa48("150") ? "" : (stryCov_9fa48("150"), 'Accesso effettuato con successo'),
              nome
            }));
          }
        } else {
          if (stryMutAct_9fa48("151")) {
            {}
          } else {
            stryCov_9fa48("151");
            console.log(stryMutAct_9fa48("152") ? "" : (stryCov_9fa48("152"), 'Credenziali non valide'));
            res.status(401).json(stryMutAct_9fa48("153") ? {} : (stryCov_9fa48("153"), {
              message: stryMutAct_9fa48("154") ? "" : (stryCov_9fa48("154"), 'Credenziali non valide')
            }));
          }
        }
      }
    } catch (err) {
      if (stryMutAct_9fa48("155")) {
        {}
      } else {
        stryCov_9fa48("155");
        console.error(stryMutAct_9fa48("156") ? "" : (stryCov_9fa48("156"), 'Errore durante il login:'), err);
        res.status(500).json(stryMutAct_9fa48("157") ? {} : (stryCov_9fa48("157"), {
          message: stryMutAct_9fa48("158") ? "" : (stryCov_9fa48("158"), 'Errore durante il login')
        }));
      }
    }
  }
});

// CHECK SESSION 
app.get(stryMutAct_9fa48("159") ? "" : (stryCov_9fa48("159"), '/checkSessionCliente'), (req, res) => {
  if (stryMutAct_9fa48("160")) {
    {}
  } else {
    stryCov_9fa48("160");
    const nome = stryMutAct_9fa48("163") ? req.cookies || req.cookies.session : stryMutAct_9fa48("162") ? false : stryMutAct_9fa48("161") ? true : (stryCov_9fa48("161", "162", "163"), req.cookies && req.cookies.session);
    if (stryMutAct_9fa48("165") ? false : stryMutAct_9fa48("164") ? true : (stryCov_9fa48("164", "165"), nome)) {
      if (stryMutAct_9fa48("166")) {
        {}
      } else {
        stryCov_9fa48("166");
        res.json(stryMutAct_9fa48("167") ? {} : (stryCov_9fa48("167"), {
          success: stryMutAct_9fa48("168") ? false : (stryCov_9fa48("168"), true),
          message: stryMutAct_9fa48("169") ? "" : (stryCov_9fa48("169"), "Sessione client valida"),
          nome
        }));
      }
    } else {
      if (stryMutAct_9fa48("170")) {
        {}
      } else {
        stryCov_9fa48("170");
        res.status(401).json(stryMutAct_9fa48("171") ? {} : (stryCov_9fa48("171"), {
          success: stryMutAct_9fa48("172") ? true : (stryCov_9fa48("172"), false),
          message: stryMutAct_9fa48("173") ? "" : (stryCov_9fa48("173"), "Sessione non trovata")
        }));
      }
    }
  }
});

// LOGOUT 
app.get(stryMutAct_9fa48("174") ? "" : (stryCov_9fa48("174"), '/logout'), (req, res) => {
  if (stryMutAct_9fa48("175")) {
    {}
  } else {
    stryCov_9fa48("175");
    res.clearCookie(stryMutAct_9fa48("176") ? "" : (stryCov_9fa48("176"), 'session'));
    res.json(stryMutAct_9fa48("177") ? {} : (stryCov_9fa48("177"), {
      message: stryMutAct_9fa48("178") ? "" : (stryCov_9fa48("178"), 'Logout effettuato con successo')
    }));
  }
});

// VISUALIZZA CATALOGO
app.get(stryMutAct_9fa48("179") ? "" : (stryCov_9fa48("179"), '/visualizza'), (req, res) => {
  if (stryMutAct_9fa48("180")) {
    {}
  } else {
    stryCov_9fa48("180");
    if (stryMutAct_9fa48("183") ? false : stryMutAct_9fa48("182") ? true : stryMutAct_9fa48("181") ? fs.existsSync(opereFilePath) : (stryCov_9fa48("181", "182", "183"), !fs.existsSync(opereFilePath))) return res.json(stryMutAct_9fa48("184") ? ["Stryker was here"] : (stryCov_9fa48("184"), []));
    fs.readFile(opereFilePath, stryMutAct_9fa48("185") ? "" : (stryCov_9fa48("185"), 'utf-8'), (err, data) => {
      if (stryMutAct_9fa48("186")) {
        {}
      } else {
        stryCov_9fa48("186");
        if (stryMutAct_9fa48("188") ? false : stryMutAct_9fa48("187") ? true : (stryCov_9fa48("187", "188"), err)) {
          if (stryMutAct_9fa48("189")) {
            {}
          } else {
            stryCov_9fa48("189");
            console.error(stryMutAct_9fa48("190") ? "" : (stryCov_9fa48("190"), 'Errore durante la lettura del catalogo:'), err);
            return res.status(500).json(stryMutAct_9fa48("191") ? {} : (stryCov_9fa48("191"), {
              message: stryMutAct_9fa48("192") ? "" : (stryCov_9fa48("192"), 'Errore di lettura del catalogo')
            }));
          }
        }
        res.json(JSON.parse(stryMutAct_9fa48("195") ? data && '[]' : stryMutAct_9fa48("194") ? false : stryMutAct_9fa48("193") ? true : (stryCov_9fa48("193", "194", "195"), data || (stryMutAct_9fa48("196") ? "" : (stryCov_9fa48("196"), '[]')))));
      }
    });
  }
});

// AGGIUNGI OPERA AL CARRELLO
// AGGIUNGI OPERA AL CARRELLO
app.post(stryMutAct_9fa48("197") ? "" : (stryCov_9fa48("197"), '/aggiungiCarrello'), requireClienteAuth, async (req, res) => {
  if (stryMutAct_9fa48("198")) {
    {}
  } else {
    stryCov_9fa48("198");
    try {
      if (stryMutAct_9fa48("199")) {
        {}
      } else {
        stryCov_9fa48("199");
        let opere = stryMutAct_9fa48("200") ? ["Stryker was here"] : (stryCov_9fa48("200"), []);
        if (stryMutAct_9fa48("202") ? false : stryMutAct_9fa48("201") ? true : (stryCov_9fa48("201", "202"), fs.existsSync(opereFilePath))) {
          if (stryMutAct_9fa48("203")) {
            {}
          } else {
            stryCov_9fa48("203");
            opere = JSON.parse(stryMutAct_9fa48("206") ? fs.readFileSync(opereFilePath, 'utf-8') && '[]' : stryMutAct_9fa48("205") ? false : stryMutAct_9fa48("204") ? true : (stryCov_9fa48("204", "205", "206"), fs.readFileSync(opereFilePath, stryMutAct_9fa48("207") ? "" : (stryCov_9fa48("207"), 'utf-8')) || (stryMutAct_9fa48("208") ? "" : (stryCov_9fa48("208"), '[]'))));
          }
        }
        // Recupera il prezzo corrispondente dal catalogo JSON
        const prezzoCorrispondente = opere.find(stryMutAct_9fa48("209") ? () => undefined : (stryCov_9fa48("209"), opera => stryMutAct_9fa48("212") ? opera.codice !== req.body.codice : stryMutAct_9fa48("211") ? false : stryMutAct_9fa48("210") ? true : (stryCov_9fa48("210", "211", "212"), opera.codice === req.body.codice)));
        const prezzoOpera = prezzoCorrispondente ? parseFloat(prezzoCorrispondente.prezzo) : 0;

        // Salva l'elemento nel carrello MongoDB dell'utente autenticato (dal cookie, non dal body)
        const newCarrello = new Carrello(stryMutAct_9fa48("213") ? {} : (stryCov_9fa48("213"), {
          nome: req.nomeAutenticato,
          codice: req.body.codice,
          prezzo: prezzoOpera
        }));
        await newCarrello.save();
        res.json(stryMutAct_9fa48("214") ? {} : (stryCov_9fa48("214"), {
          message: stryMutAct_9fa48("215") ? "" : (stryCov_9fa48("215"), "Opera aggiunta al carrello con successo!")
        }));
      }
    } catch (err) {
      if (stryMutAct_9fa48("216")) {
        {}
      } else {
        stryCov_9fa48("216");
        console.error(stryMutAct_9fa48("217") ? "" : (stryCov_9fa48("217"), "Errore aggiunta carrello:"), err);
        res.status(500).json(stryMutAct_9fa48("218") ? {} : (stryCov_9fa48("218"), {
          message: stryMutAct_9fa48("219") ? "" : (stryCov_9fa48("219"), "Errore durante l'aggiunta nel carrello")
        }));
      }
    }
  }
});
// ACQUISTA
app.post(stryMutAct_9fa48("220") ? "" : (stryCov_9fa48("220"), '/acquista'), requireClienteAuth, async (req, res) => {
  if (stryMutAct_9fa48("221")) {
    {}
  } else {
    stryCov_9fa48("221");
    try {
      if (stryMutAct_9fa48("222")) {
        {}
      } else {
        stryCov_9fa48("222");
        const nomeUtente = req.nomeAutenticato;
        // Non serve più ri-verificare nome+password: il cookie di sessione
        // ha già dimostrato l'identità. Recuperiamo solo il profilo (es. per il numero SMS).
        const result = await Cliente.findOne(stryMutAct_9fa48("223") ? {} : (stryCov_9fa48("223"), {
          nome: nomeUtente
        }));
        if (stryMutAct_9fa48("226") ? false : stryMutAct_9fa48("225") ? true : stryMutAct_9fa48("224") ? result : (stryCov_9fa48("224", "225", "226"), !result)) {
          if (stryMutAct_9fa48("227")) {
            {}
          } else {
            stryCov_9fa48("227");
            return res.status(404).json(stryMutAct_9fa48("228") ? {} : (stryCov_9fa48("228"), {
              message: stryMutAct_9fa48("229") ? "" : (stryCov_9fa48("229"), 'Utente non trovato')
            }));
          }
        }
        const carrello = await Carrello.find(stryMutAct_9fa48("230") ? {} : (stryCov_9fa48("230"), {
          nome: nomeUtente
        }));
        if (stryMutAct_9fa48("233") ? carrello.length !== 0 : stryMutAct_9fa48("232") ? false : stryMutAct_9fa48("231") ? true : (stryCov_9fa48("231", "232", "233"), carrello.length === 0)) {
          if (stryMutAct_9fa48("234")) {
            {}
          } else {
            stryCov_9fa48("234");
            return res.json(stryMutAct_9fa48("235") ? {} : (stryCov_9fa48("235"), {
              message: stryMutAct_9fa48("236") ? "" : (stryCov_9fa48("236"), "Il carrello dell'utente è vuoto")
            }));
          }
        }
        const prodottiAcquisiti = await Promise.all(carrello.map(async operaCarrello => {
          if (stryMutAct_9fa48("237")) {
            {}
          } else {
            stryCov_9fa48("237");
            const operaDettagli = await Carrello.findOne(stryMutAct_9fa48("238") ? {} : (stryCov_9fa48("238"), {
              codice: operaCarrello.codice
            }));
            return operaDettagli ? stryMutAct_9fa48("239") ? {} : (stryCov_9fa48("239"), {
              codice: operaDettagli.codice,
              prezzo: operaDettagli.prezzo,
              quantita: 1
            }) : null;
          }
        }));
        const validi = stryMutAct_9fa48("240") ? prodottiAcquisiti : (stryCov_9fa48("240"), prodottiAcquisiti.filter(Boolean));
        let somma = 0;
        validi.forEach(p => {
          if (stryMutAct_9fa48("241")) {
            {}
          } else {
            stryCov_9fa48("241");
            stryMutAct_9fa48("242") ? somma -= Math.floor(Number(p.prezzo || 0)) : (stryCov_9fa48("242"), somma += Math.floor(Number(stryMutAct_9fa48("245") ? p.prezzo && 0 : stryMutAct_9fa48("244") ? false : stryMutAct_9fa48("243") ? true : (stryCov_9fa48("243", "244", "245"), p.prezzo || 0))));
          }
        });
        const ordineEffettuato = new Ordine(stryMutAct_9fa48("246") ? {} : (stryCov_9fa48("246"), {
          id: Math.floor(stryMutAct_9fa48("247") ? Math.random() / 100000 : (stryCov_9fa48("247"), Math.random() * 100000)),
          utente: nomeUtente,
          data: getCurrentDate(),
          prezzo: somma.toFixed(2),
          prodottiAcquistati: validi
        }));
        const resultOrdine = await ordineEffettuato.save();
        const messaggi = validi.map(stryMutAct_9fa48("248") ? () => undefined : (stryCov_9fa48("248"), opera => stryMutAct_9fa48("249") ? `` : (stryCov_9fa48("249"), `Hai acquistato l'opera con codice: ${opera.codice} al prezzo di ${opera.prezzo}`)));
        const alertMessage = stryMutAct_9fa48("250") ? "" : (stryCov_9fa48("250"), 'Grazie per aver acquistato da noi. Il tuo ordine è stato confermato.');
        simulateSendSMS(result.numero, alertMessage, messaggi);

        // Salvataggio sicuro nel file JSON strutturato
        safeAppendToJsonFile(ordiniFilePath, ordineEffettuato);

        // Svuota il carrello dell'utente dopo l'acquisto
        await Carrello.deleteMany(stryMutAct_9fa48("251") ? {} : (stryCov_9fa48("251"), {
          nome: nomeUtente
        }));

        // --- NUOVA LOGICA: RIMOZIONE DAL CATALOGO ---
        if (stryMutAct_9fa48("253") ? false : stryMutAct_9fa48("252") ? true : (stryCov_9fa48("252", "253"), fs.existsSync(opereFilePath))) {
          if (stryMutAct_9fa48("254")) {
            {}
          } else {
            stryCov_9fa48("254");
            let catalogo = JSON.parse(stryMutAct_9fa48("257") ? fs.readFileSync(opereFilePath, 'utf-8') && '[]' : stryMutAct_9fa48("256") ? false : stryMutAct_9fa48("255") ? true : (stryCov_9fa48("255", "256", "257"), fs.readFileSync(opereFilePath, stryMutAct_9fa48("258") ? "" : (stryCov_9fa48("258"), 'utf-8')) || (stryMutAct_9fa48("259") ? "" : (stryCov_9fa48("259"), '[]'))));

            // Estrai tutti i codici dei prodotti acquistati
            const codiciAcquistati = validi.map(stryMutAct_9fa48("260") ? () => undefined : (stryCov_9fa48("260"), p => p.codice));

            // Filtra il catalogo mantenendo solo le opere NON acquistate
            const catalogoAggiornato = stryMutAct_9fa48("261") ? catalogo : (stryCov_9fa48("261"), catalogo.filter(stryMutAct_9fa48("262") ? () => undefined : (stryCov_9fa48("262"), opera => stryMutAct_9fa48("263") ? codiciAcquistati.includes(opera.codice) : (stryCov_9fa48("263"), !codiciAcquistati.includes(opera.codice)))));

            // Riscrivi il catalogo aggiornato
            fs.writeFileSync(opereFilePath, JSON.stringify(catalogoAggiornato, null, 2), stryMutAct_9fa48("264") ? "" : (stryCov_9fa48("264"), 'utf-8'));
            console.log(stryMutAct_9fa48("265") ? `` : (stryCov_9fa48("265"), `Opere rimosse dal catalogo: ${codiciAcquistati.join(stryMutAct_9fa48("266") ? "" : (stryCov_9fa48("266"), ', '))}`));
          }
        }
        // ---------------------------------------------

        res.json(stryMutAct_9fa48("267") ? {} : (stryCov_9fa48("267"), {
          message: alertMessage,
          ordine: resultOrdine
        }));
      }
    } catch (error) {
      if (stryMutAct_9fa48("268")) {
        {}
      } else {
        stryCov_9fa48("268");
        console.error(stryMutAct_9fa48("269") ? "" : (stryCov_9fa48("269"), "Errore durante l'acquisto:"), error);
        res.status(500).json(stryMutAct_9fa48("270") ? {} : (stryCov_9fa48("270"), {
          message: stryMutAct_9fa48("271") ? "" : (stryCov_9fa48("271"), 'Errore durante la gestione della richiesta')
        }));
      }
    }
  }
});

// RIMUOVI DAL CARRELLO
app.post(stryMutAct_9fa48("272") ? "" : (stryCov_9fa48("272"), '/rimuoviCarrello'), requireClienteAuth, async (req, res) => {
  if (stryMutAct_9fa48("273")) {
    {}
  } else {
    stryCov_9fa48("273");
    try {
      if (stryMutAct_9fa48("274")) {
        {}
      } else {
        stryCov_9fa48("274");
        const condition = stryMutAct_9fa48("275") ? {} : (stryCov_9fa48("275"), {
          nome: req.nomeAutenticato,
          codice: req.body.codice
        });
        const result = await Carrello.findOne(condition);
        if (stryMutAct_9fa48("277") ? false : stryMutAct_9fa48("276") ? true : (stryCov_9fa48("276", "277"), result)) {
          if (stryMutAct_9fa48("278")) {
            {}
          } else {
            stryCov_9fa48("278");
            await Carrello.deleteOne(condition);
            res.json(stryMutAct_9fa48("279") ? {} : (stryCov_9fa48("279"), {
              message: stryMutAct_9fa48("280") ? "" : (stryCov_9fa48("280"), 'Riepilogo opera eliminata:'),
              nome: req.nomeAutenticato,
              codice: req.body.codice
            }));
          }
        } else {
          if (stryMutAct_9fa48("281")) {
            {}
          } else {
            stryCov_9fa48("281");
            res.status(404).json(stryMutAct_9fa48("282") ? {} : (stryCov_9fa48("282"), {
              message: stryMutAct_9fa48("283") ? "" : (stryCov_9fa48("283"), 'Elemento non presente nel carrello')
            }));
          }
        }
      }
    } catch (error) {
      if (stryMutAct_9fa48("284")) {
        {}
      } else {
        stryCov_9fa48("284");
        console.error(stryMutAct_9fa48("285") ? "" : (stryCov_9fa48("285"), "Errore rimozione carrello:"), error);
        res.status(500).json(stryMutAct_9fa48("286") ? {} : (stryCov_9fa48("286"), {
          message: stryMutAct_9fa48("287") ? "" : (stryCov_9fa48("287"), "Errore durante l'operazione")
        }));
      }
    }
  }
});

// VISUALIZZA CARRELLO
app.post(stryMutAct_9fa48("288") ? "" : (stryCov_9fa48("288"), '/visualizzaCarrello'), requireClienteAuth, async (req, res) => {
  if (stryMutAct_9fa48("289")) {
    {}
  } else {
    stryCov_9fa48("289");
    try {
      if (stryMutAct_9fa48("290")) {
        {}
      } else {
        stryCov_9fa48("290");
        const nomeUtente = req.nomeAutenticato;
        const carrello = await Carrello.find(stryMutAct_9fa48("291") ? {} : (stryCov_9fa48("291"), {
          nome: nomeUtente
        }));
        if (stryMutAct_9fa48("295") ? carrello.length <= 0 : stryMutAct_9fa48("294") ? carrello.length >= 0 : stryMutAct_9fa48("293") ? false : stryMutAct_9fa48("292") ? true : (stryCov_9fa48("292", "293", "294", "295"), carrello.length > 0)) {
          if (stryMutAct_9fa48("296")) {
            {}
          } else {
            stryCov_9fa48("296");
            res.json(stryMutAct_9fa48("297") ? {} : (stryCov_9fa48("297"), {
              carrello
            }));
          }
        } else {
          if (stryMutAct_9fa48("298")) {
            {}
          } else {
            stryCov_9fa48("298");
            res.json(stryMutAct_9fa48("299") ? {} : (stryCov_9fa48("299"), {
              message: stryMutAct_9fa48("300") ? "" : (stryCov_9fa48("300"), "Il carrello dell'utente è vuoto")
            }));
          }
        }
      }
    } catch (error) {
      if (stryMutAct_9fa48("301")) {
        {}
      } else {
        stryCov_9fa48("301");
        console.error(stryMutAct_9fa48("302") ? "" : (stryCov_9fa48("302"), 'Errore visualizzazione carrello:'), error);
        res.status(500).json(stryMutAct_9fa48("303") ? {} : (stryCov_9fa48("303"), {
          message: stryMutAct_9fa48("304") ? "" : (stryCov_9fa48("304"), 'Errore durante la gestione della richiesta')
        }));
      }
    }
  }
});

// ACQUISTA

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
  if (stryMutAct_9fa48("305")) {
    {}
  } else {
    stryCov_9fa48("305");
    console.log(stryMutAct_9fa48("306") ? `` : (stryCov_9fa48("306"), `Server Cliente in ascolto sulla porta ${PORT}`));
  }
});