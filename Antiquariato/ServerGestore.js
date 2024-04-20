const express = require('express') ; 
const bodyParser=require('body-parser') ; 
const fs=require('fs') ; 
const app = express() ; 
const http= require('http') ; 
const path=require('path'); 
const axios = require('axios') ; 
//const Opera=require('C:\\Users\\39320\\Desktop\\advanced programming computer\\GIT\\Antiquariato\\Opera.js') ;
http.createServer(app).listen(3000); 
console.log("Server in ascolto sulla porta 3000") ; // PER VISUALIZZARLA: http://localhost:3000/Gestore.html

app.use(express.static(__dirname+"/Gestore")) ; 

//LA AGGIUNGO PER AGGIUNGI OPERA , VEDIAMO SE FUNZIONA : 
app.get("/AggiuntaOpera", function(req,res)
{
    res.send("per ora non so , poi vediamo") ; 

})

//per gestire le richieste :
app.use(bodyParser.urlencoded({extended:true})) ; 


// CONNETTO A MONGO DB  : 
const mongoose = require('mongoose') ; 

mongoose.connect('mongodb://localhost:27017/Gestore') ; 
const db = mongoose.connection ; 

db.on('error',(error)=>{
    console.log("ERRORE CONNESSION CON MONGO DB NON RIUSCITA") ; 
}) ; 

db.once('open',()=>
{
    console.log("connessione con MongoDB avvenuta con successo") ; 
})

const OperaSchema = new mongoose.Schema({
codice:String,
nome:String,
descrizione:String,
prezzo:String,
immagine1:[Buffer], 
immagine2:[Buffer],
immagine3:[Buffer],
immagine4:[Buffer],
tecnica:String,
dimensione:String,
peso:String,
altezza:String
}) ; 

const Opera=mongoose.model('Opera',OperaSchema) ; 

const VendiOperaSchema = new mongoose.Schema({
nomeCliente:String,
nome:String,
prezzoVendita:String


});
const VendiOpera = mongoose.model('VendiOpera',VendiOperaSchema) ; 

            //AGGIUNGI OPERA :
const filePath=path.join(__dirname,'/Opere.json') ; 

app.post('/AggiungiOpera',function(req,res){
            console.log(req.body); 

            var newOpera= new Opera({"codice":req.body.codice,"nome":req.body.nome,"descrizione":req.body.descrizione,"prezzo":req.body.prezzo,"immagine1":req.body.immagine1,"immagine2":req.body.immagine2 , "immagine3":req.body.immagine3,"immagine4":req.body.immagine4,"tecnica":req.body.tecnica,"dimensione":req.body.dimensione,"peso":req.body.peso,"altezza":req.body.altezza}) ;

                newOpera.save() 
                .then(result=>{
                    console.log("opera aggiunta") ; 
                })
                .catch(err=>{
                    console.log("Errore durante la registrazione") ; 
                })
                var riepilogo = "OPERA REGISTRATA \n "+"codice : "+ newOpera.codice +
                "\n "+ "nome :"+ newOpera.nome + " \n "+ "descrizione:"+ newOpera.descrizione+
                "\n "+" prezzo:"+ newOpera.prezzo +" \n "+ "immagine1:"+ newOpera.immagine1 +
                "\n "+"immagine2:"+ newOpera.immagine2 +" \n "+"immagine3:"+ newOpera.immagine3 +
                "\n "+"immagine4:"+ newOpera.immagine4 +"\n "+"tecnica:"+ newOpera.tecnica+"\n  "+
                "dimensione:"+ newOpera.dimensione +" \n  "+"peso:"+ newOpera.peso +" \n "+ "altezza:"+ newOpera.altezza ; 
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

                    fs.writeFileSync(filePath, JSON.stringify(opere, null, 2), 'utf-8');
                    console.log("Opera aggiunta con successo");
                    //res.json({ message: "Opera aggiunta con successo", opera: newOpera });
                } catch (error) {
                    console.error("Errore durante la scrittura del file:", error);
                    //res.status(500).json({ message: "Errore durante l'operazione" });
                }

            });

                            // MODIFICA  :
                            app.post('/ModificaOpera',async function(req,res){
                            try{
                                            var conditions=
                                            {
                                                codice:req.body.codice , 
                                                nome:req.body.nome 
                                            };
                                            var update =
                                            {
                                                $set:{
                                                    descrizione:req.body.descrizione,
                                                    prezzo:req.body.prezzo,
                                                    immagine1:req.body.immagine1,
                                                    immagine2:req.body.immagine2 ,
                                                    immagine3:req.body.immagine3,
                                                    immagine4:req.body.immagine4,
                                                    tecnica:req.body.tecnica,
                                                    dimensione:req.body.dimensione,
                                                    peso:req.body.peso,
                                                    altezza:req.body.altezza
                                            }
                                            };
                                            console.log(req.body); 
                                            
                                            const result = await Opera.findOne(conditions); 

                                            if(result)
                                            {
                                                console.log("Elemento trovato. Update in corso");
                                            const updateResult = await Opera.updateOne(conditions, update);
                                            
                                            console.log("Risultato aggiornamento:", updateResult);

                                            
                                            if(updateResult.modifiedCount>0)
                                            {
                                                console.log("Aggiornamento opera avvenuta con successo")  ; 
                                                return res.json({
                                                    message: "Riepilogo opera aggiornata:",
                                                    codice:req.body.codice , 
                                                    nome:req.body.nome ,
                                                    descrizione:req.body.descrizione,
                                                    prezzo:req.body.prezzo,
                                                    immagine1:req.body.immagine1,
                                                    immagine2:req.body.immagine2 ,
                                                    immagine3:req.body.immagine3,
                                                    immagine4:req.body.immagine4,
                                                    tecnica:req.body.tecnica,
                                                    dimensione:req.body.dimensione,
                                                    peso:req.body.peso,
                                                    altezza:req.body.altezza
                                                });
                                            }else {
                                                console.log("Elemento presente ma non modifiato") ; 
                                                    }
                                            }else
                                            {
                                                console.log("Elemento non presente");
                                                return res.json({ message: "Elemento non presente" });  
                                            }
                                }catch(error) {
                                    console.error("Errore durante l'operazione", error);
                                    return res.status(500).json({ message: "Errore durante l'operazione" });
                                }
                            });
                                        
                                                                //ho PROVAto A FARE "DELETE" ma non è andato
                                                        app.post("/RimuoviOpera",async function(req,res)
                                                        {
                                                            try
                                                            {
                                                                var conditions=
                                                                {
                                                                    codice:req.body.codice , 
                                                                    nome:req.body.nome 
                                                                };

                                                                const result = await Opera.findOne(conditions); 
                                                                if (result) {
                                                                    console.log("Elemento trovato. Eliminazione in corso");
                                                                    
                                                                    const deleteResult = await Opera.deleteOne(conditions);

                                                                    if (deleteResult.deletedCount > 0) {
                                                                        console.log("Eliminazione opera avvenuta con successo", deleteResult);
                                                                        res.json({
                                                                            message: "Riepilogo opera eliminata:",
                                                                            codice:req.body.codice , 
                                                                            nome:req.body.nome ,
                                                                            descrizione:req.body.descrizione,
                                                                            prezzo:req.body.prezzo,
                                                                            immagine1:req.body.immagine1,
                                                                            immagine2:req.body.immagine2 ,
                                                                            immagine3:req.body.immagine3,
                                                                            immagine4:req.body.immagine4,
                                                                            tecnica:req.body.tecnica,
                                                                            dimensione:req.body.dimensione,
                                                                            peso:req.body.peso,
                                                                            altezza:req.body.altezza
                                                                        });
                                                                    } else {
                                                                        console.log("Nessun documento eliminato");
                                                                        res.json({ message: "Nessuna opera trovata per l'eliminazione" });
                                                                    }
                                                                } else {
                                                                    console.log("Elemento non presente");
                                                                    res.json({ message: "Elemento non presente" });
                                                                }
                                                            } catch (error) {
                                                                console.error("Errore durante l'operazione", error);
                                                                res.status(500).json({ message: "Errore durante l'operazione" });
                                                            }




                                                            }) ; 


                // Aggiungo questa funzione per scrivere sul file di log
                /*PERCHE'? perchè quando vissualizzo catalogo lato client ho un problema, dovrei creare più connessioni
                1) gestore
                1) client
                ma questo genera errori  
                quindi dovrei importare "il gestore"
                ma anche questo genera errori ,quindi la via più semplice è la seguente : 
                ho un file in cui salvo le opere ,quindi salvo elimino e modifico. cosi facendo quando dal lato client piggio su visualizza avrò un file tutto aggiornato! */
            function logAction(action, details) {
                const logEntry = `${action}: ${JSON.stringify(details)}\n`;
                fs.appendFile('log.txt', logEntry, (err) => {
                    if (err) {
                        console.error('Errore durante la scrittura del log:', err);
                    }
                });
            }


            app.get("/visualizzaOpere",function(req,res){
                const visualizzaOpereFilePath = path.join(__dirname, '/VendiOpere.json');

                try {
                    const leggiFile = fs.readFileSync(visualizzaOpereFilePath, 'utf-8');
                    const opere = JSON.parse(leggiFile);
                    res.json(opere);
                } catch (error) {
                    console.error("Errore durante la lettura del file:", error);
                    res.status(500).json({ message: "Errore durante l'operazione di lettura del file" });
                }

            });

            app.get("/reportAcquisti",function(req,res){
                const visualizzaOrdiniFilePath = path.join(__dirname, '/Ordini.json');

                try {
                    const leggiFile = fs.readFileSync(visualizzaOrdiniFilePath, 'utf-8');
                    const ordini = JSON.parse(leggiFile);
                    // ORA  
                    const reportClienti={
                        utente:"",
                        somma:0 , 
                        numeroSpese:0 
                    };
                    let vettore=[];// HO UN PROBLEMA SE HO è ELMENTI SI SALVA LO STESSO ELEMENTO PIù VOLTE
                    ordini.forEach((ordine)=>{
                        const utente =ordine.utente ; 
                        reportClienti.utente=utente ; 
                        const prezzo=Math.floor(ordine.prezzo) ; 
                       if(reportClienti.utente==utente)
                       {
                        reportClienti.somma+=ordine.prezzo ; 
                        reportClienti.numeroSpese++ ; 
                       }
                       console.log("stampo report : \n utente ", reportClienti.utente, "Somma :"  ,reportClienti.somma," numero spese:" ,reportClienti.numeroSpese) ; 
                       vettore.push(reportClienti);
                    })
                   // console.log(vettore);
                   
                    res.json(vettore);
                } catch (error) {
                    console.error("Errore durante la lettura del file:", error);
                    res.status(500).json({ message: "Errore durante l'operazione di lettura del file" });
                }



            })





            const filePathVendita=path.join(__dirname,'/Richieste.json') ; 

            app.post("/VendiOpera",function(req,res){
                console.log(req.body) ; 
                
            var newOpera= new VendiOpera({"nomeCliente":req.body.nomeCliente,"nome":req.body.nome,"prezzoVendita":req.body.prezzoVendita}) ;

            newOpera.save() 
            .then(result=>{
                console.log("opera aggiunta") ; 
            })
            .catch(err=>{
                console.log("Errore durante la registrazione") ; 
            })
            var riepilogo = "Richiesta  Vendita \n "+"nomeCliente : "+ newOpera.nomeCliente +
            "\n "+ "nome :"+ newOpera.nome +" prezzoVendita: "+newOpera.prezzoVendita ; 
            //logAction('Aggiunta opera',req.body) ; 
            res.json({riepilogo}) ;


            try{
                let leggifile= fs.readFileSync(filePathVendita,'utf-8') ; 
                
            let opere=[];
            if(leggifile)
            {
                opere=JSON.parse(leggifile) ; 
            } 
            opere.push(newOpera) ; 

                fs.writeFileSync(filePathVendita, JSON.stringify(opere, null, 2), 'utf-8');
                console.log("Opera aggiunta con successo");
                //res.json({ message: "Opera aggiunta con successo", opera: newOpera });
            } catch (error) {
                console.error("Errore durante la scrittura del file:", error);
                //res.status(500).json({ message: "Errore durante l'operazione" });
            }


            })

                app.get("/visualizzaSceltaClient",function(req,res){
                    const visualizzaStatoFilePath = path.join(__dirname, '/stato.json');

                    try {
                        const leggiFile = fs.readFileSync(visualizzaStatoFilePath, 'utf-8');
                        const opere = JSON.parse(leggiFile);
                        res.json(opere);
                    } catch (error) {
                        console.error("Errore durante la lettura del file:", error);
                        res.status(500).json({ message: "Errore durante l'operazione di lettura del file" });
                    }
                      })


                     app.get("/reportVendite",function(req,res){
                        const visualizzaVenditeFilePath = path.join(__dirname, '/ReportVendite.json');
        
                        try {
                            const leggiFile = fs.readFileSync(visualizzaVenditeFilePath, 'utf-8');
                            const ordini = JSON.parse(leggiFile);
                            // ORA  
                            const reportClienti={
                                nome:"",
                                somma:0 , 
                                numeroVendite:0 
                            };
                            ordini.forEach((vendita)=>{
                                const utente =vendita.utente ; 
                                reportClienti.nome=utente ; 
                                const prezzo=Math.floor(vendita.prezzo) ; 
                               if(reportClienti.utente==utente)
                               {
                                reportClienti.somma+=vendita.prezzo ; 
                                reportClienti.numeroVendite++ ; 
                               }
                               
                            })
                            console.log("stampo report : \n Utente :", reportClienti.nome, "Somma :"  ,reportClienti.somma," numero spese:" ,reportClienti.numeroVendite) ; 
                            res.json(reportClienti);
                        } catch (error) {
                            console.error("Errore durante la lettura del file:", error);
                            res.status(500).json({ message: "Errore durante l'operazione di lettura del file" });
                        }
        
        
        
                    })
        
        
        