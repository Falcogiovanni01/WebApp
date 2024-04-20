const express = require('express') ; 
const bodyParser=require('body-parser') ; 
const fs=require('fs') ; 
const app = express() ; 
const http= require('http') ; 
const path=require('path'); 
//const Opera = require('C:\\Users\\39320\\Desktop\\advanced programming computer\\GIT\\Antiquariato\\Opera.js') ;




http.createServer(app).listen(3001) ; 
console.log("Server in ascolto sulla porta 3001") ; 

app.use(express.static(__dirname+"/Client")); 

app.use(bodyParser.urlencoded({extended:true})) ; 

const mongoose=require('mongoose') ; 

mongoose.connect('mongodb://localhost:27017/Cliente') ; 
const db = mongoose.connection ; 

db.on('error',(error)=>{
    console.log("ERRORE CONNESSION CON MONGO DB NON RIUSCITA") ; 
}) ; 

db.once('open',()=>
{
    console.log("connessione con MongoDB avvenuta con successo") ; 
})

const ClienteSchema= new mongoose.Schema({
nome:String,
password:String,
numero:String,
carta:String
})

const Cliente= mongoose.model('Cliente',ClienteSchema) ; 


const   LoginSchema = new mongoose.Schema({
    nome:String ,
    password:String   
 }) ; 
 
 const LoginCliente = mongoose.model('LoginCliente', LoginSchema) ; 


 const CarrelloSchema = new mongoose.Schema({
    nome:String,
    codice:String,
    prezzo:String
 })
 const Carrello= mongoose.model('Carrello',CarrelloSchema);

const OrdineSchema = new mongoose.Schema({
id:Number,
utente:String,
data:String,
prezzo:Number,
prodottiAcquistati:[
    {
        codice:String,
        prezzo:String,
        quantita:Number 
    }
]
})

const Ordine = mongoose.model('Ordine',OrdineSchema) ; 

const VendiOperaSchema = new mongoose.Schema({
nomeCliente:String,
numero:String,
nome:String,
descrizione:String,
immagine1:[Buffer], 
immagine2:[Buffer],
immagine3:[Buffer],
immagine4:[Buffer],
tecnica:String,
dimensione:String,
peso:String,
altezza:String,
prezzo:String,
})
const VendiOpera = mongoose.model('VendiOpera',VendiOperaSchema); 


const OffertaSchema = new mongoose.Schema({
nomeCliente:String,
nome:String,
prezzo:String,
stato:String
}) ;

const Offerta =mongoose.model('Offerta',OffertaSchema); 



        app.post("/registrazione",function(req,res){

        console.log(req.body) ; 

        var newCliente = new Cliente({"nome":req.body.nome,"password":req.body.password,"numero":req.body.numero,"carta":req.body.carta}) ; 

        newCliente.save()  
        .then(result=>{
        console.log("utente aggiunto") ; 

        })
        .catch(err=>{
            console.log("Errore durante la registrazione") ; 
        })

        var riepilogo=" UTENTE REGISTRATO "+"nome:"+newCliente.nome +"  password:"+newCliente.password+" "+"numero:"+newCliente.numero+" "+"carta:"+newCliente.carta ; 
        res.json({riepilogo}) ; 
        var newLogin = new LoginCliente({"nome":newCliente.nome ,"password":newCliente.password}) ; 
        newLogin.save().then(result=>{
            console.log("Registrazione avvenuta");

        }) .catch(err=>{
            console.log("Errore durante il salvataggio",err) ; 
        }) ; 
        var newCarello= new Carrello({"nome":newCliente.nome}) ; 
        newCarello.save().then(result=>{
            console.log("Registrazione avvenuta");

        }) .catch(err=>{
        console.log("Errore durante il salvataggio",err) ; 
        }) ; 
        }) ; 



        app.post('/login', function (req, res) {
            const nome = req.body.nome;    
            const password = req.body.password;
            // Effettua la query al database per cercare un cliente con le credenziali fornite
        LoginCliente.findOne({ nome: nome,password: password })
        .then(result => {
            if (result) {
                console.log("Accesso effettuato da:", nome, password);
                res.json({ message: "Accesso effettuato con successo", nome: nome });
            } else {
                console.log("Credenziali non valide");
                res.status(401).json({ message: "Credenziali non valide" });
            }
        })
        .catch(err => {
            console.error("Errore durante la query al database", err);
            res.status(500).json({ message: "Errore durante il login" });
        });


        });

        // Aggiungi questa route al tuo codice server
        app.get('/visualizza', async function(req, res) {
        const filePath= 'C:\\Users\\39320\\Desktop\\advanced programming computer\\GIT\\Antiquariato\\Opere.json';
        fs.readFile(filePath,'utf-8',(err,data)=>{
            if(err)
            {
                console.error("errore durante la lettura del file",err) ; 
                res.status(500).json({message:"errore"}) ; 
            }else
            {
                const jsonData= JSON.parse(data) ;
                res.json(jsonData) ; 
            }
        }) ; 
        });


        // AGGIUNGI OPERA AL CARRELLO : 
        app.post('/aggiungiCarrello', async function(req,res){
        console.log(req.body) ;
            // PRIMA DI SALVARE L'ELEMENTO DEVO PESCARE IL PREZZO, DOVE STA? NEL FILE OPERE.JSON : 
            const filePath= 'C:\\Users\\39320\\Desktop\\advanced programming computer\\GIT\\Antiquariato\\Opere.json';
            const leggiFile= fs.readFileSync(filePath,'utf-8') ; 
            const opere=JSON.parse(leggiFile) ; 

                //CERCO L'OPERA COL CODICE CORRISPONDENTE E PRENDO IL PREZZO : 

                const prezzoCorrispondente = opere.find(opera=>opera.codice===req.body.codice) ;
                prezzoOpera=0 ; 
                if(prezzoCorrispondente)
                {
                    prezzoOpera=parseFloat(prezzoCorrispondente.prezzo)

                }

        var newCarrello=new Carrello({"nome":req.body.nome,"codice":req.body.codice,"prezzo":prezzoOpera}) ; 
        newCarrello.save()
        .then(result=>{
        console.log("registrazione avvenuta") ; 

        var riepilogo=" Elemento aggiunto nel carello "+"nome:"+newCarrello.nome +"  codice:"+newCarrello.codice+"  prezzo"+newCarrello.prezzo ; 
        res.json({riepilogo}) ; 
        }).catch(err=>{
        console.log("errore",err) ;
        res.status(500).json({message: "Errore durante l'aggiunta nel carrello"}) ;  
        })  ;

        }) ; 

        //RIMOZIONE DAL CARELLO : 
        app.post('/rimuoviCarrello',async function(req,res){
            try{
            var condition={
                nome:req.body.nome ,
                codice:req.body.codice
            } ; 

            const result = await Carrello.findOne({nome:condition.nome,codice:condition.codice}) ; 
            if (result) {
                console.log("Elemento trovato. Eliminazione in corso");
                
                const deleteResult = await Carrello.deleteOne(condition);

                if (deleteResult.deletedCount > 0) {
                    console.log("Eliminazione opera avvenuta con successo", deleteResult);
                    res.json({
                        message: "Riepilogo opera eliminata:",
                        nome:req.body.nome ,
                        codice:req.body.codice
                                });
                } else {
                    console.log("Nessun documento eliminato");
                    res.json({ message: "Nessuna opera  col codice corrispondente trovata per l'eliminazione" });
                }
            } else {
                console.log("Elemento non presente");
                res.json({ message: "Elemento non presente" });
            }
        }catch (error) {
            console.error("Errore durante l'operazione", error);
            res.status(500).json({ message: "Errore durante l'operazione" });
        }


        }) ; 

        app.post('/visualizzaCarrello',function(req,res){
        try
        {  const nomeUtente = req.body.nome;    
            const password = req.body.password;
            // Effettua la query al database per cercare un cliente con le credenziali fornite
        LoginCliente.findOne({ nome: nomeUtente,password: password })
        .then(result => {
            if (result) {
                console.log("Accesso effettuato da:", nomeUtente, password);
            // res.json({ message: "Accesso effettuato con successo", nome: nome });
                Carrello.find({nome:nomeUtente})
                .then(carrello=>{
                        if(carrello.length>0)
                        {
                            console.log("carrello utente trovato:",carrello) ; 
                            res.json({carrello:carrello}) ; 
                        }else
                        {
                            console.log("il carrello è vuoto");
                            res.json({message:"il carrello dell'utente è vuoto"}) ; 

                        }
                    })
                    .catch(err=>{
                        console.error("errore durante la query",err) ;
                        res.status(500).json({message:"errore durante la visualizzazione del carrello"}) 
                    })
            
            
            } else {
                console.log("Credenziali non valide");
                res.status(401).json({ message: "Credenziali non valide" });
            }
        })
        .catch(err => {
            console.error("Errore durante la query al database", err);
            res.status(500).json({ message: "Errore durante il login" });
        });
        }catch (error) {
            console.error("Errore durante la gestione della richiesta", error);
            res.status(500).json({ message: "Errore durante la gestione della richiesta" });
        }

        }) ; 


        function simulateSendSMS(numeroUtente, smsMessage,messaggi) {
            console.log("Simulazione SMS inviato a", numeroUtente, "con il messaggio:", smsMessage);
            console.log("Messaggi dettagliati:", messaggi);
        }
        function getCurrentDate() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        }
        /**DEVO PER FORZA LEGGERE DAL FILE E PESCARE IL PREZZO DELL'OPERA */
        app.post('/acquista', async (req, res) => {
            try {
                const nomeUtente = req.body.nome;
                const password = req.body.password;
                // FACCIO "L'ACCESSO " perchè ? perchè tale cliente acquista
                const result = await Cliente.findOne({ nome: nomeUtente, password: password });
        
                if (result) {
                    console.log("Accesso effettuato da:", nomeUtente, password);
                    const numeroUtente = result.numero;
                        // ORA TROVIAMO GLI ELEMENTI DEL CARRELLO 
                    const carrello = await Carrello.find({ nome: nomeUtente });
        
                    if (carrello.length > 0) {  // promisen metodo che può essere utilizzato per eseguire più promesse contemporaneamente. 
                        const prodottiAcquisiti = await Promise.all(carrello.map(async (operaCarrello) => {
                            // PESCO DAL CARRELLO IL CODICE E IL PREZZO
                            const operaDettagli = await Carrello.findOne({ codice: operaCarrello.codice });
        
                            if (operaDettagli) {
                                return {
                                    codice: operaDettagli.codice,
                                    prezzo: operaDettagli.prezzo,
                                    quantita: 1 // DI DEFAULT NE METTO 1 PERCHè NON HO INSERITO LE QUANTITA' DEI RELATIVI PRODOTTI .
                                };
                            }
                        }));
        
                        // Calcola la somma dei prezzi convertiti
                        let somma = 0;
                        for (const prodotto of prodottiAcquisiti) {
                            const prezzoConvertito = Math.floor(Number(prodotto.prezzo)); // SE SALVI UN ELEMENTO SENZA PREZZO NON FUNZIONA , NON SO PERCHè ! NON FARà = 0+... MA RESTITUIRA' DIRETTAMENTE NAN
                            somma += prezzoConvertito;
                            console.log("converti =", prezzoConvertito);
                        }
                             // era perchè non mi faceva la somma  console.log("esterno ciclo somma =", somma);
                               const ordineEffettuato = new Ordine({
                            id: Math.random() * 100,
                            utente: nomeUtente,
                            data: getCurrentDate(),
                            prezzo: somma.toFixed(2),
                            prodottiAcquistati: prodottiAcquisiti
                        });
        
                        const resultOrdine = await ordineEffettuato.save();
                        console.log("Ordine registrato con successo");
                        // FA TUTTI GLI ELEMENTI DI UN ARRAY ! 
                        const messaggi = [];
                        for (let i = 0; i < prodottiAcquisiti.length; i++) {
                            const opera = prodottiAcquisiti[i];
                            messaggi.push(`Hai acquistato l'opera con codice: ${opera.codice} al prezzo di ${opera.prezzo}`);
                        }

                        const alertMessage = 'Grazie per aver acquistato da noi. Il tuo ordine è stato confermato.';
                        simulateSendSMS(result.numero, alertMessage, messaggi);
        
                        res.json({ message: alertMessage, ordine: resultOrdine });
                        // PER CONCLUDERE SCRIVIAMO TUTTO SU UN FILE : 
                        let ordini=[] ; 
                        ordini.push(ordineEffettuato);

                        // Scrivi l'array aggiornato nel file Ordini.json
                        fs.appendFileSync('Ordini.json', JSON.stringify(ordini, null, 2));
                
                    } else {
                        console.log("Il carrello è vuoto");
                        res.json({ message: "Il carrello dell'utente è vuoto" });
                    }
                } else {
                    console.log("Credenziali non valide");
                    res.status(401).json({ message: "Credenziali non valide" });
                }
            } catch (error) {
                console.error("Errore durante la gestione della richiesta", error);
                res.status(500).json({ message: "Errore durante la gestione della richiesta" });
            }
        });
        


            
        const filePath=path.join(__dirname,'/VendiOpere.json') ; 
        // STESSO RAGIONAMENTO DI PRIMA , SCRIVO TUTTO SU UN FILE ! PERCHè? Perchè la duplice connessione con l'altro database mi crea ERRORI !!
            app.post('/VendiOpera',function(req,res){

                    console.log(req.body); 
                    
                    var newOpera= new VendiOpera({"nomeCliente":req.body.nomeCliente,"numero":req.body.numero,"nome":req.body.nome,"descrizione":req.body.descrizione,"immagine1":req.body.immagine1,"immagine2":req.body.immagine2 , "immagine3":req.body.immagine3,"immagine4":req.body.immagine4,"tecnica":req.body.tecnica,"dimensione":req.body.dimensione,"peso":req.body.peso,"altezza":req.body.altezza,"prezzo":req.body.prezzo}) ;
                    
                        newOpera.save() 
                        .then(result=>{
                            console.log("opera aggiunta") ; 
                        })
                        .catch(err=>{
                            console.log("Errore durante la registrazione") ; 
                        })
                        var riepilogo = "OPERA REGISTRATA \n "+" \n nomeCliente: "+ newOpera.nomeCliente +" \n numero: "+newOpera.numero+  
                        "\n "+ "nome :"+ newOpera.nome + " \n "+ "descrizione:"+ newOpera.descrizione
                        +" \n "+ "immagine1:"+ newOpera.immagine1 +
                        "\n "+"immagine2:"+ newOpera.immagine2 +" \n "+"immagine3:"+ newOpera.immagine3 +
                        "\n "+"immagine4:"+ newOpera.immagine4 +"\n "+"tecnica:"+ newOpera.tecnica+"\n  "+
                        " dimensione: "+ newOpera.dimensione +" \n  "+" peso: "+ newOpera.peso +" \n "+ " altezza: "+ newOpera.altezza+"\n "+" prezzo:"+ newOpera.prezzo ; 
                        //logAction('Aggiunta opera',req.body) ; 
                        res.json({riepilogo}) ; 

                    

                        try{
                            let leggifile= fs.readFileSync(filePath,'utf-8') ; 
                            
                        let opere=[];
                        if(leggifile)
                        {
                            opere=JSON.parse(leggifile) ; 
                        } 
                        opere.push(newOpera) ; 
                    
                            fs.appendFileSync(filePath, JSON.stringify(opere, null, 2), 'utf-8');
                            console.log("Opera aggiunta con successo");
                           
                        } catch (error) {
                            console.error("Errore durante la scrittura del file:", error);
                            
                        }
                    
                    });
                    
                    

                    app.get("/visualizzaOfferta",function(req,res){
                    const visualizzaOpereFilePath = path.join(__dirname, '/Richieste.json');
                
                    try {
                        const leggiFile = fs.readFileSync(visualizzaOpereFilePath, 'utf-8');
                        const opere = JSON.parse(leggiFile);
                        res.json(opere);
                    } catch (error) {
                        console.error("Errore durante la lettura del file:", error);
                        res.status(500).json({ message: "Errore durante l'operazione di lettura del file" });
                    }
                
                });
                


                app.post("/accettaOfferta",function(req,res){
                    const OffertaFilePath = path.join(__dirname, '/stato.json');
                
                    //RISCRIVO TUTTO SU UN FILE CHE POI LEGGERò dal lato gestore per sapere com'è andata!
                    console.log(req.body); 
                    let statoValido;
                    // GIUSTO PER RENDERE LA COSA CARINA
                    switch (req.body.stato) {
                        case "accetto":
                        case "proponi":
                        case "rifiuta":
                            statoValido = req.body.stato;
                            break;
                        default:
                            statoValido = "VALORE NON VALIDO"; 
                            return res.status(400).json({ message: "Lo stato fornito non è valido" });
                            break;
                    }
                
                    var newOfferta= new Offerta({"nomeCliente":req.body.nomeCliente,"nome":req.body.nome,"prezzo":req.body.prezzo,"stato":req.body.stato}) ;
                    
                        newOfferta.save() 
                        .then(result=>{
                            console.log("opera aggiunta") ; 
                        })
                        .catch(err=>{
                            console.log("Errore durante la registrazione") ; 
                        })
                        var riepilogo = "OPERA REGISTRATA \n "+" \n nomeCliente: "+ newOfferta.nomeCliente +  
                        "\n "+ "nome :"+ newOfferta.nome + " \n "+" prezzo:"+ newOfferta.prezzo+" \n "+"stato: "+ newOfferta.stato ; 
                        // QUI PER IL REPORT SCRIVO TUTTO SU UN FILE : 
                        if(newOfferta.stato=="accetto")
                        { const ReportFilePath = path.join(__dirname, '/ReportVendite.json');
                            //const leggiFile = fs.readFileSync(ReportFilePath, 'utf-8');
                        // const ordini = JSON.parse(leggiFile);

                         let VenditeEffettuate= []
                         VenditeEffettuate.push(newOfferta) ; 
                         fs.appendFileSync(ReportFilePath,JSON.stringify(VenditeEffettuate,null,2),"utf-8") ; 
                         }
                        res.json({riepilogo}) ;
                        try{
                            let leggifile= fs.readFileSync( OffertaFilePath,'utf-8') ; 
                            
                        let opere=[];
                        if(leggifile)
                        {
                            opere=JSON.parse(leggifile) ; 
                        } 
                        opere.push(newOfferta) ; 
                    
                            fs.writeFileSync( OffertaFilePath, JSON.stringify(opere, null, 2), 'utf-8');
                            console.log("Opera aggiunta con successo");
                            
                        } catch (error) {
                            console.error("Errore durante la scrittura del file:", error);
                        }
                }) ; 


            
                