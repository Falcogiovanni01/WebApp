var main = function(){
"use strict" ; 
var $contenuto=$("main .contenuto") ; 
var $input ; 
//var $scegli_opera ; 
//var $button ; 
    $(".tabs a span").toArray().forEach(function(element)
    {
        $(element).on("click",function(){

            var $element=$(element); 


         //RENDE INATTIVE TUTTE LE SCHEDE
        $(".tabs a span").removeClass("active") ; 
        //ATTIVO SOLO LA PRIMA SCHEDA
        $element.addClass("active") ; 
        $("main .contenuto").empty() ; 

            if($element.parent().is(":nth-child(1)"))
            {   
             
                 $input=$("<div>").append(
                $("<form>",{id:"Aggiungi", method:"POST", action:"/AggiungiOpera"}).append(// MI SERVE PER GESTIRE LA RICHIESTA NEL LATO SERVER.
                    $("<label>", {text:"Codice:"}),"<br>" , 
                    $("<input>", {name:"codice", type:"text",placeholder:"InserisciCodice"}),"<br>" , /**QUESTO SE HO TEMPO LO FACCIO FARE DAL SISTEMA AUTOMATICAMENTE */

                    $("<label>",{text:"Nome:"}),"<br>",
                    $("<input>",{name:"nome",type:"text",placeholder:"Inserisci nome opera"}),"<br>",

                    $("<label>",{text:"Descrizione:"}),"<br>",
                    $("<textarea>",{name:"descrizione",type:"descrizione", placeholder:"Inserisci Descrizione", rows:5, cols:30}),"<br>",/*SE RIESCO AD ESPORTARMELO SULLA BASE DI DATI è OK ALTRIMENTI RICOVERTI IN "INPUT"*/

                    $("<label>",{text:"Prezzo"}),"<br>",
                    $("<input>",{name:"prezzo", type:"text", placeholder:"Inserisci prezzo"}),"<br>",

                    $("<label>",{text:"Immagine1"}),"<br>",
                    $("<input>",{name:"immagine1", type:"file"}),"<br>",

                    $("<label>",{text:"Immagine2"}),"<br>",
                    $("<input>",{name:"immagine2", type:"file"}),"<br>",

                    $("<label>",{text:"Immagine3"}),"<br>",
                    $("<input>",{name:"immagine3", type:"file"}),"<br>",

                    $("<label>",{text:"Immagine4"}),"<br>",
                    $("<input>",{name:"immagine4", type:"file"}),"<br>",

                    
                    $("<label>",{text:"Tecnica"}),"<br>",
                    $("<input>",{name:"tecnica",type:"text",placeholder:"inserisci Evenutale tecnica"}),"<br>",

                    $("<label>",{text:"Dimensioni"}),"<br>",
                    $("<input>",{name:"dimensione",type:"text",placeholder:"inserisci Eventuale dimensioni"}),"<br>",


                    $("<label>",{text:"Peso"}),"<br>",
                    $("<input>",{name:"peso",type:"text",placeholder:"inserisci Eventuale peso"}),"<br>",

                    $("<label>",{text:"Altezza"}),"<br>",
                    $("<input>",{name:"altezza",type:"text",placeholder:"inserisci Eventuale altezza"}),"<br>",
                    

                    $("<input>",{type:"submit", value:"AGGIUNGI", id:"AggiungiOpera"})
                  

                )
                )
               
                }else if($element.parent().is(":nth-child(2)"))
                {
                    
                 $input=$("<div>").append(
                    $("<form>",{id:"Modifica", method:"POST", action:"/ModificaOpera"}).append(// MI SERVE PER GESTIRE LA RICHIESTA NEL LATO SERVER.
                        $("<label>", {text:"Codice:"}),"<br>" , 
                        $("<input>", {name:"codice", type:"text",placeholder:"InserisciCodice"}),"<br>" , /**QUESTO SE HO TEMPO LO FACCIO FARE DAL SISTEMA AUTOMATICAMENTE */
    
                        $("<label>",{text:"Nome:"}),"<br>",
                        $("<input>",{name:"nome",type:"text",placeholder:"Inserisci nome opera"}),"<br>",
    
                        $("<label>",{text:"Descrizione:"}),"<br>",
                        $("<textarea>",{name:"descrizione",type:"descrizione", placeholder:"Inserisci Descrizione", rows:5, cols:30}),"<br>",/*SE RIESCO AD ESPORTARMELO SULLA BASE DI DATI è OK ALTRIMENTI RICOVERTI IN "INPUT"*/
    
                        $("<label>",{text:"Prezzo"}),"<br>",
                        $("<input>",{name:"prezzo", type:"text", placeholder:"Inserisci prezzo"}),"<br>",
    
                        $("<label>",{text:"Immagine1"}),"<br>",
                        $("<input>",{name:"immagine1", type:"file"}),"<br>",
    
                        $("<label>",{text:"Immagine2"}),"<br>",
                        $("<input>",{name:"immagine2", type:"file"}),"<br>",
    
                        $("<label>",{text:"Immagine3"}),"<br>",
                        $("<input>",{name:"immagine3", type:"file"}),"<br>",
    
                        $("<label>",{text:"Immagine4"}),"<br>",
                        $("<input>",{name:"immagine4", type:"file"}),"<br>",
    
                        
                        $("<label>",{text:"Tecnica"}),"<br>",
                        $("<input>",{name:"tecnica",type:"text",placeholder:"inserisci Evenutale tecnica"}),"<br>",
    
                        $("<label>",{text:"Dimensione"}),"<br>",
                        $("<input>",{name:"dimensione",type:"text",placeholder:"inserisci Eventuale dimensioni"}),"<br>",
    
    
                        $("<label>",{text:"Peso"}),"<br>",
                        $("<input>",{name:"peso",type:"text",placeholder:"inserisci Eventuale peso"}),"<br>",
    
                        $("<label>",{text:"Altezza"}),"<br>",
                        $("<input>",{name:"altezza",type:"text",placeholder:"inserisci Eventuale altezza"}),"<br>",
                        
    
                        $("<input>",{type:"submit", value:"Modifica", id:"ModificaOpera"})
                      
    
                    )
                    )
                }else if($element.parent().is(":nth-child(3)"))
                {                    
                 $input=$("<div>").append(
                    $("<form>",{id:"Rimuovi", method:"post", action:"/RimuoviOpera"}).append("<br>","<br>",// MI SERVE PER GESTIRE LA RICHIESTA NEL LATO SERVER.
                        $("<label>", {text:"Codice:"}),"<br>" , 
                        $("<input>", {name:"codice", type:"text",placeholder:"InserisciCodice"}),"<br>" , /**QUESTO SE HO TEMPO LO FACCIO FARE DAL SISTEMA AUTOMATICAMENTE */
    
                        $("<label>",{text:"Nome:"}),"<br>",
                        $("<input>",{name:"nome",type:"text",placeholder:"Inserisci nome opera"}),"<br>","<br>","<br>",
                       $("<input>",{type:"submit", value:"Rimuovi", id:"RimuoviOpera"})
                         
                    )
                    )
                }else if($element.parent().is(":nth-child(4)"))
                {   $input=$("<div>").append(
                    $("<form>",{id:"visualizzaOfferta",method:"get", action:"/VisualizzaOpere"}).append("<br>","<br>",
                    $("<input>",{type:"submit", value:"Visualizza Opere Offerte", id:"VisualizzaOfferta"})
                    ),
                            $("<form>", { id: "Vendita", method: "POST", action: "/VendiOpera" }).append(
                                $("<label>", { text: "Nome Cliente:" }), "<br>",
                                $("<input>", { name: "nomeCliente", type: "text", placeholder: "Inserisci nome cliente" }), "<br>",
                    
                                $("<label>", { text: "Nome Opera:" }), "<br>",
                                $("<textarea>", { name: "nome", type: "text", placeholder: "Inserisci nome opera", rows: 5, cols: 30 }), "<br>",
                    
                                $("<label>", { text: "Prezzo di vendita:" }), "<br>",
                                $("<input>", { name: "prezzoVendita", type: "text", placeholder: "Inserisci prezzo di vendita" }), "<br>",
                    
                                $("<input>", { type: "submit", value: "invia ", id: "VendiOpera" })
                            ),
                            $("<form>",{id:"visualizzaSceltaClient", method:"Get",action:"/visualizzaSceltaClient"}).append("<br>",
                            $("<input>",{type:"submit",value:"visualizzaScelta",id:"visualizzaSceltaClient"})),

                                $("<form>",{id:"reportAcquisti",method:"Get", action:"/reportAcquisti" }).append("<br>",
                                $("<input>",{type:"submit",value:"Report acquisti",id:"reportAcquisti"})),
                                
                                $("<form>",{id:"reportVendite",method:"Get", action:"/reportVendite" }).append("<br>",
                                $("<input>",{type:"submit",value:"Report Vendite",id:"reportVendite"}))

                )
                }

               // Aggiungi input al contenuto di ".contenuto"
               $contenuto.empty().append($input) ; 
           
        return false ; 

        });

    }) ; 



$(".tabs a:first-child span").trigger("click") ; 

} ; 





$(document).ready(main) ; 




        $("#Aggiungi").on("submit",function(){
            var invio_dati={
                codice: $("input[name='codice']").val(),
                nome: $("input[name='nome']").val(),
                descrizione: $("input[name='descrizione']").val(),
                prezzo: $("input[name='prezzo']").val(),
                immagine1: $("input[name='immagine1']").val(),
                immagine2: $("input[name='immagine2']").val(),
                immagine3: $("input[name='immagine3']").val(),
                immagine4: $("input[name='immagine4']").val(),
                tecnica:$("input[name='tecnica']").val() ,
                dimensione:$("input[name='dimensione']").val(),
                peso:$("input[name='peso']").val(),
                altezza:$("input[name='altezza']").val()
            } ; 

            // ora li passo al server : 
            $.ajax({
                type:"Post",
                url:"/Aggiungi",
                contentType:"application/json",
                data: JSON.stringify(invio_dati) ,
                success:function(response){
                    console.log("opera aggiunta avvenuta con successo",response)   ; 
                   $("input[name='codice']").val(""),
                 $("input[name='nome']").val(""),
                 $("input[name='descrizione']").val(""),
                 $("input[name='prezzo']").val(""),
                 $("input[name='immagine1']").val(""),
                     $("input[name='immagine2']").val(""),
                     $("input[name='immagine3']").val(""),
                    $("input[name='immagine4']").val(""),
                    $("input[name='tecnica']").val("") ,
                    $("input[name='dimensione']").val(""),
                    $("input[name='peso']").val(""),
                    $("input[name='altezza']").val("")

                    setTimeout(function(){
                    window.location.href ="http://localhost:3000/Gestore.html" ; 
                },1000) ; 
                },
                error:function(error)
                {
                    console.error("errore durante la modifica") ; 
                }
            })
        }) ; 


        
        $("#Rimuovi").on("submit",function(){
            var invio_dati={
                codice: $("input[name='codice']").val(),
                nome: $("input[name='nome']").val(),
              
            } ; 

            // ora li passo al server : 
            $.ajax({
                type:"post",
                url:"/RimuoviOpera",
                contentType:"application/json",
                data: JSON.stringify(invio_dati) ,
                success:function(response){
                    console.log("opera eliminata con successo",response)   ; 
                   $("input[name='codice']").val(""),
                 $("input[name='nome']").val("")
                  },
                error:function(error)
                {
                    console.error("errore durante la eliminazione") ; 
                }
            })
        }) ; 



        $("#Modifica").on("submit",function(){
            var invio_dati={
                codice: $("input[name='codice']").val(),
                nome: $("input[name='nome']").val(),
                descrizione: $("input[name='descrizione']").val(),
                prezzo: $("input[name='prezzo']").val(),
                immagine1: $("input[name='immagine1']").val(),
                immagine2: $("input[name='immagine2']").val(),
                immagine3: $("input[name='immagine3']").val(),
                immagine4: $("input[name='immagine4']").val(),
                tecnica:$("input[name='tecnica']").val() ,
                dimensione:$("input[name='dimensione']").val(),
                peso:$("input[name='peso']").val(),
                altezza:$("input[name='altezza']").val()
            } ; 

            // ora li passo al server : 
            $.ajax({
                type:"post",
                url:"/ModificaOpera",
                contentType:"application/json",
                data: JSON.stringify(invio_dati) ,
                success:function(response){
                    console.log("opera Modificat con successo",response)   ; 
                   $("input[name='codice']").val(""),
                 $("input[name='nome']").val(""),
                 $("input[name='descrizione']").val(""),
                 $("input[name='prezzo']").val(""),
                 $("input[name='immagine1']").val(""),
                     $("input[name='immagine2']").val(""),
                     $("input[name='immagine3']").val(""),
                    $("input[name='immagine4']").val(""),
                    $("input[name='tecnica']").val("") ,
                    $("input[name='dimensione']").val(""),
                    $("input[name='peso']").val(""),
                    $("input[name='altezza']").val("")
                },
                error:function(error)
                {
                    console.error("errore durante la modifica") ; 
                }
            })
        }) ; 


        $("#visualizzOfferte").on("submit",function(req,res){  
            event.preventDefault() ; // DOVREBBE NON ANDARE SU VISUALIZZA E FAR USCIRE SOTTO A VISUALIZZA CATALOGO LE OPERE, MA NON VA!
            
            $.ajax({
                type: "GET",
                url: "/visualizzaOpere",   //"/Gestore/Operas",
                success: function (opera) {
                 console.log(" visualizza opere ") ; 
                },
                error: function (error) {
                    console.error("Errore durante il recupero del catalogo");
                }
            });
        });


        $("#Vendita").on("submit",function(){
        var invio_dati = {
            nomeCliente: $("input[name='nomeCliente']").val(),
            nome: $("input[name='nome']").val(),
            prezzoVendita: $("input[name='prezzoVendita']").val()
        };
    
        
        $.ajax({
            type: "POST",
            url: "/VendiOpera",
            contentType: "application/json",
            data: JSON.stringify(invio_dati),
            success: function (response) {
                console.log("opera venduta con successo", response);
                $("input[name='nomeCliente']").val(""),
                $("input[name='nome']").val(""),
                $("input[name='prezzoVendita']").val("")
            },
            error: function (error) {
                console.error("errore durante la vendita");
            }
        });
    
        return false; // DOVREBBE ESSERE L'EQUIVALENTE DI " EVENT.PREVENTDEFAULT()"
    });
        

    $("#visualizzSceltaClient").on("submit",function(req,res){  
        event.preventDefault() ; 
        
        $.ajax({
            type: "GET",
            url: "/visualizzaSceltaClient", 
            success: function (opera) {
             console.log(" visualizza opere ") ; 
            },
            error: function (error) {
                console.error("Errore durante il recupero dei dati");
            }
        });
    });


    $("#reportAcquisti").on("submit",function(req,res){
        $.ajax({
            type: "GET",
            url: "/reportAcquisti", 
            success: function (opera) {
             console.log(" visualizza ordini ") ; 
            },
            error: function (error) {
                console.error("Errore durante il recupero dei dati");
            }
        });
    })
    $("#reportVendite").on("submit",function(req,res){
        $.ajax({
            type: "GET",
            url: "/reportVendite", 
            success: function (opera) {
             console.log(" visualizza Vendite ") ; 
            },
            error: function (error) {
                console.error("Errore durante il recupero dei dati");
            }
        });
    })


/**se hai tempo :  
 *   $scegli_opera=$("<div>").append("<br>","<br>","<br>",
                $("<select>").append(
                    $("<option>", {selected:"selected",value:"Altro", text:"inserisci opera generica"}), 
                    $("<option>",{value:"Dipinto", text:"inserisci Dipinto"}) ,
                    $("<option>",{value:"Scultura",text:"inserisci scultura"})
                )

            )

                    /*IN BASE AL GENERE DI OPERA SCELTA CAMBIA IL FORMAT 
                    $scegli_opera.on("change",function(){
                        var seleziona=$(this).val() ; 
                        operaScelta(seleziona); 
                    })
 */