var main= function()
{
"use strict" ; 
var $contenuto = $("main .contenuto") ; 
var $input ; 

 // Chiamata alla funzione di verifica del cookie all'avvio
 checkLoginCookie();

    $(".tabs a span").toArray().forEach(function (element) {
        $(element).on("click", function()
        {
            var $element=$(element) ; 

            $(".tabs a span").removeClass("active") ; 

            $element.addClass("active") ; 
            $("main .contenuto").empty() ;
            
            if($element.parent().is(":nth-child(1)"))
            {
                $input = $("<div>").append("<br>","<br>",
                    $("<form>", { id: "registrazioneUtente", method: "POST", action: "/registrazione" }).append(
                        $("<label>", { text: "NomeUtente" }), "<br>",
                        $("<input>", { name: "nome", type: "text", placeholder: "Inserisci il tuo nomeUtente" }), "<br>",

                        $("<label>", { text: "Password" }), "<br>",
                        $("<input>", { name: "password", type: "password", placeholder: "Inserisci la password" }), "<br>",

                        $("<label>", { text: "Numero telefonico" }), "<br>",
                        $("<input>", { name: "numero", type: "text", placeholder: "Inserisci il tuo numero telefonico" }), "<br>",

                        $("<label>", { text: "Carta di credito" }), "<br>",
                        $("<input>", { name: "carta", type: "text", placeholder: "Inserisci la carta di credito" }), " <br>", "<br>",

                        $("<input>", { type: "submit", value: "Registrati" }),

                        $("<input>", { type: "reset", value: "Cancella" }).on("click", function () {
                            $("input[type='text']").val("");
                            $("input[type='password']").val("");
                            return false;
                        })
                    ),
                );

            }else if($element.parent().is(":nth-child(2)"))
            {
                $input = $("<div>").append(
                    $("<form>", { id: "Login", method: "post", action: '/login' }).append("<br>","<br>",
                        $("<label>", { text: "NomeUtente" }), "<br>",
                        $("<input>", { name: "nome", type: "text", placeholder: "Inserisci il tuo nome" }), "<br>",

                        $("<label>", { text: "Password" }), "<br>",
                        $("<input>", { name: "password", type: "password", placeholder: "Inserisci la password" }), "<br>", "<br>",

                        $("<input>", { type: "submit", value: "Accedi" }),
                 //  setLoginCookie()  //impostiamo i cookie
                        ),
                );
            }else if ($element.parent().is(":nth-child(3)")) {
                $input = $("<div>").append(
                    $("<div>", { id: "catalogo" }), // qui dovrei visualizzare il catalogo.
                    $("<form>", { id: "visualizza", method: "get", action: '/visualizza' }).append("<br>", "<br>",
                        $("<input>", { type: "submit", value: "visualizzaCatalogo" })
                    ),
                    $("<form>", { id: "aggiungiCarrello", method: "post", action: '/aggiungiCarrello' }).append("<br>", "<br>",
                        $("<label>", { text: "NomeUtente" }), "<br>",
                        $("<input>", { name: "nome", type: "text", placeholder: "Inserisci il tuo nome" }), "<br>",
            
                        $("<label>", { text: "CodiceOpera" }), "<br>",
                        $("<input>", { name: "codice", type: "text", placeholder: "Inserisci il codice" }), "<br>", "<br>",
            
                        $("<input>", { type: "submit", value: "AggiungiCarrello" })
                    ),
                    $("<form>", { id: "rimuoviCarrello", method: "post", action: '/rimuoviCarrello' }).append("<br>", "<br>",
                        $("<label>", { text: "NomeUtente" }), "<br>",
                        $("<input>", { name: "nome", type: "text", placeholder: "Inserisci il tuo nome" }), "<br>",
            
                        $("<label>", { text: "CodiceOpera" }), "<br>",
                        $("<input>", { name: "codice", type: "text", placeholder: "Inserisci il codice" }), "<br>", "<br>",
            
                        $("<input>", { type: "submit", value: "RimuoviCarrello" })
                    ),
                            $("<form>", { id: "visualizzaCarrello", method: "post", action: '/visualizzaCarrello' }).append("<br>", "<br>",
                            $("<label>", { text: "NomeUtente" }), "<br>",
                            $("<input>", { name: "nome", type: "text", placeholder: "Inserisci il tuo nome" }), "<br>",
                
                            $("<label>", { text: "Password" }), "<br>",
                            $("<input>", { name: "password", type: "Password", placeholder: "Inserisci la password" }), "<br>", "<br>",
                
                                $("<input>", { type: "submit", value: "Visualizza Carrello"})
                            ),
                                $("<form>", { id: "acquista", method: "post", action: '/acquista' }).append("<br>", "<br>",
                                $("<label>", { text: "NomeUtente" }), "<br>",
                                $("<input>", { name: "nome", type: "text", placeholder: "Inserisci il tuo nome" }), "<br>",
                    
                                $("<label>", { text: "Password" }), "<br>",
                                $("<input>", { name: "password", type: "Password", placeholder: "Inserisci la password" }), "<br>", "<br>",
                    
                                    $("<input>", {   type: "submit", value: "Acquista"   })
                                )
                            );
                              
           
            }else if($element.parent().is(":nth-child(4)"))
            {
                $input=$("<div>").append(
                    $("<form>",{id:"Vendi", method:"POST", action:"/VendiOpera"}).append("<br>",// MI SERVE PER GESTIRE LA RICHIESTA NEL LATO SERVER.
                    $("<label>",{text:"Nome Cliente:"}),"<br>",
                    $("<input>",{name:"nomeCliente",type:"text",placeholder:"Inserisci nome Cliente"}),"<br>",

                    $("<label>",{text:"Numero Cliente:"}),"<br>",
                    $("<input>",{name:"numero",type:"text",placeholder:"Inserisci numero Cliente"}),"<br>",

                    
                        $("<label>",{text:"Nome Opera:"}),"<br>",
                        $("<input>",{name:"nome",type:"text",placeholder:"Inserisci nome opera"}),"<br>",
    
                        $("<label>",{text:"Descrizione:"}),"<br>",
                        $("<textarea>",{name:"descrizione",type:"descrizione", placeholder:"Inserisci Descrizione", rows:5, cols:30}),"<br>",/*SE RIESCO AD ESPORTARMELO SULLA BASE DI DATI è OK ALTRIMENTI RICOVERTI IN "INPUT"*/
    
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
                        
                        $("<label>",{text:"Prezzo"}),"<br>",
                        $("<input>",{name:"prezzo", type:"text", placeholder:"Inserisci prezzo"}),"<br>",
    
    
                        $("<input>",{type:"submit", value:"Vendi", id:"VendiOpera"}),

                                $("<form>",{id:"visualizzaOfferta", method:"get", action:"visualizzaOfferta"}).append("<br>",
                                $("<input>",{type:"submit",value:"Visualizza Offerta",id:"visualizzaOfferta"}),
                                ),
                                
                                                    $("<form>",{id:"accetta",method:"POST", action:"/accettaOfferta"}).append("<br>",
                                                                        
                                                    $("<label>",{text:"Nome Cliente:"}),"<br>",
                                                    $("<input>",{name:"nomeCliente",type:"text",placeholder:"Inserisci nome Cliente"}),"<br>",
                                                    $("<label>",{text:"Nome Opera:"}),"<br>",
                                                    $("<input>",{name:"nome",type:"text",placeholder:"Inserisci nome Opera"}),"<br>",
                                                    $("<label>",{text:"Prezzo"}),"<br>",
                                                    $("<input>",{name:"prezzo", type:"text", placeholder:"Inserisci prezzo"}),"<br>",
                                                    $("<label>",{text:"Accetto o proponi o rifiuta"}),"<br>",
                                                    $("<input>",{name:"stato", type:"text", placeholder:"Inserisci scelta"}),"<br>",
                                                    
                                                    $("<input>",{type:"submit", value:"INVIA", id:"accetta"})
                                
                                                    )
                    ))
           }
            $contenuto.empty().append($input) ; 
            return false ; 
        });       
    });
    $(".tabs a:first-child span").trigger("click") ; 
}
$(document).ready(main) ; 


                $("#registrazioneUtente").on("submit",function()
                {
                    var invio_dati={
                        nome:$("input[name='nome']").val() , 
                        password:$("input[name='password']").val(),
                        numero:$("input[name='numero']").val(),
                        carta:$("input[name='carta']").val()
                    } ; 

                    $.ajax({
                        type:"Post",
                        url:"/registrazione",
                        contentType:"application/json",
                        data:JSON.stringify(invio_dati),
                        success:function(response)
                        {
                            console.log("registrazione avvenuta con successo"); 
                            $("input[name='nome']").val() , 
                            $("input[name='password']").val(),
                            $("input[name='numero']").val(),
                            $("input[name='carta']").val()
                        },
                        error:function(error)
                        {
                            console.error("errore durante la registrazione") ; 
                        }
                    })
                });

                $("#Login").on("submit",function(){
                    var invio_dati={
                        nome:$("input[name='nome']").val() , 
                        password:$("input[name='password']").val()
                    } ; 
                    $.ajax({
                        type:"Post",
                        url:"/login",
                        contentType:"application/json",
                        data:JSON.stringify(invio_dati),
                        success:function(response)
                        {
                            console.log("login avvenuto con successo"); 
                            $("input[name='nome']").val() , 
                            $("input[name='password']").val()                            
                        },
                        error:function(error)
                        {
                            console.error("errore durante il login") ; 
                        }
                    });
                });



              //  Funzione per ottenere e visualizzare il catalogo
            //function visualizzaCatalogo() {
            $("#visualizza").on("submit",function(){  
                event.preventDefault() ; // DOVREBBE NON ANDARE SU VISUALIZZA E FAR USCIRE SOTTO A VISUALIZZA CATALOGO LE OPERE, MA NON VA!
                
                $.ajax({
                    type: "GET",
                    url: "/visualizza",   //"/Gestore/Operas",
                    success: function (opera) {
                        // Svuota il container del catalogo prima di aggiungere nuovi elementi
                        $("#catalogo").empty();
                        // Visualizza i prodotti nel catalogo
                        opera.forEach(function (opera) {
                            var $prodotto = $("<div>").append(
                                $("<p>", { text: opera.nome }),
                                $("<p>", { text: "Prezzo: " + opera.prezzo })
                            );
                            var $aggiungiAlCarrello = $("<button>", {
                                text: "Aggiungi al Carrello",
                                click: function () {
                                    // Aggiungi il prodotto al carrello
                                    aggiungiAlCarrello(prodotto);
                                }
                            });
                            $prodotto.append($aggiungiAlCarrello);
                            $("#catalogo").append($prodotto);
                        });
                    },
                    error: function (error) {
                        console.error("Errore durante il recupero del catalogo");
                    }
                });
            });

            //AGGIUNGO AL CARELLO LE OPERE : 
            $("#aggiungiCarrello").on("submit",function(){
                var invio_dati={
                    nome:$("input[name='nome']").val() , 
                    codice:$("input[name='codice']").val()
                } ; 

                $.ajax({
                    type:"post",
                    url:"/aggiungiCarrello",
                    contentType:"application/json",
                    data:JSON.stringify(invio_dati),
                    success:function(response)
                    {
                        console.log("aggiunta nel carrello avvenuto con successo"); 
                        $("input[name='nome']").val() ;
                       let codiceVal= $("input[name='codice']").val() ;
                      alert("elemento"+codiceVal+"aggiunto");
                    },
                    error:function(error)
                    {
                        console.error("errore durante il login") ; 
                    }
                });
            }) ; 

            //RIMUOVI DAL CARELLO LE OPERE : 
            $("#rimuoviCarrello").on("submit",function(){
                var invio_dati={
                    nome:$("input[name='nome']").val() , 
                    codice:$("input[name='codice']").val()
                } ; 

                $.ajax({
                    type:"post",
                    url:"/rimuoviCarrello",
                    contentType:"application/json",
                    data:JSON.stringify(invio_dati),
                    success:function(response)
                    {
                        console.log("rimozione nel carrello avvenuto con successo"); 
                        $("input[name='nome']").val() ;
                       let codiceVal= $("input[name='codice']").val() ;
                      alert("elemento"+codiceVal+"aggiunto");
                    },
                    error:function(error)
                    {     console.error("errore durante il login") ; 
                    }
                });
            }) ; 
               

            // MI SERVE TENERE IL RIFERIMENTO ALL'UTENTE, ALTRIMENTI CHE CARRELLO VISUALIZZO ?
            //:UTILIZZIAMO I COOKIE : 
            function setLoginCookie() {
                document.cookie = "login=true; expires=Thu, 01 Jan 2025 00:00:00 UTC; path=/";
            }
        
            // Funzione per verificare il cookie di login
            function checkLoginCookie() {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = cookies[i].trim();
                    if (cookie.startsWith("login=")) {
                        isUserLoggedIn = true;
                        return;
                    }
                }
                isUserLoggedIn = false;
            }
            // ora la andremo a chiamare, dove ? nel login e nel visualizza carrello.
            $("#visualizzaCarrello").on("submit",function()
            {  var invio_dati={
                nome:$("input[name='nome']").val() , 
                password:$("input[name='password']").val(),
                              
            } ; 
            // Invia una richiesta POST al server
            $.ajax({
                type: "POST",
                url: "/visualizzaCarrello",
                contentType: "application/json",
                data: JSON.stringify(invio_dati),
                success: function (carrello) {
                    // Gestisci la risposta del server
                    console.log("Carrello visualizzato con successo:", carrello);
                                       },
                error: function (error) {
                    console.error("Errore durante la richiesta al server", error);
                }
            });
        })
                
        $("#acquista").on("submit",function()
        {  var invio_dati={
            nome:$("input[name='nome']").val() , 
            password:$("input[name='password']").val(),
                          
        } ; 
        // Invia una richiesta POST al server
        $.ajax({
            type: "POST",
            url: "/acquista",
            contentType: "application/json",
            data: JSON.stringify(invio_dati),
            success: function (carrello) {
                // Gestisci la risposta del server
                console.log("Acquisto effettuato con successo:", carrello);
                                   },
            error: function (error) {
                console.error("Errore durante la richiesta al server", error);
            }
        });
    })


            $("#Vendi").on("submit",function(){
                var invio_dati={
                nomeCliente: $("input[name='nomeCliente']").val(),
                numeri: $("input[name='numero']").val(),
                nome: $("input[name='nome']").val(),
                descrizione: $("input[name='descrizione']").val(),
                immagine1: $("input[name='immagine1']").val(),
                immagine2: $("input[name='immagine2']").val(),
                immagine3: $("input[name='immagine3']").val(),
                immagine4: $("input[name='immagine4']").val(),
                tecnica:$("input[name='tecnica']").val() ,
                dimensione:$("input[name='dimensione']").val(),
                peso:$("input[name='peso']").val(),
                altezza:$("input[name='altezza']").val(),
                prezzo: $("input[name='prezzo']").val()
                }

                 // ora li passo al server : 
            $.ajax({
                type:"Post",
                url:"/VendiOpera",
                contentType:"application/json",
                data: JSON.stringify(invio_dati) ,
                success:function(response){
                    console.log("opera aggiunta avvenuta con successo",response)   ; 
                 $("input[name='nomeCliente']").val(""),
                 $("input[name='numero']").val(""),
                 $("input[name='nome']").val(""),
                 $("input[name='descrizione']").val(""),                 
                 $("input[name='immagine1']").val(""),
                     $("input[name='immagine2']").val(""),
                     $("input[name='immagine3']").val(""),
                    $("input[name='immagine4']").val(""),
                    $("input[name='tecnica']").val("") ,
                    $("input[name='dimensione']").val(""),
                    $("input[name='peso']").val(""),
                    $("input[name='altezza']").val(""),
                    $("input[name='prezzo']").val("")
                },
                error:function(error)
                {
                    console.error("errore durante l'inserimento dei dati ") ; 
                }
            })
            })

                    $("visualizzaOfferta").on("submit",function(){
                            $.ajax({
                                type:"get",
                                url:'/visualizzaOfferta',
                                contentType:"application/json",
                                data: JSON.stringify(invio_dati) ,
                                success:function(response){
                                    console.log("visualizza offerta proposta",response)   ; 
                                 
                                },
                                error:function(error)
                                {
                                    console.error("errore durante l'inserimento dei dati ") ; 
                                }
                            })


                            })


                    


                    $("accetta").on("submit",function(){
                        var invio_dati =
                        {
                            nomeCliente: $("input[name='nomeCliente']").val(),
                            nome:$("input='nome']").val(),
                            prezzo:$("input[name='prezzo']").val(),
                            stato:$("input[name='stato']").val()
                        }


                        $.ajax({
                            type:"POST",
                            url:'/accettaOfferta',
                            contentType:"application/json",
                            data: JSON.stringify(invio_dati) ,
                            success:function(response){
                                console.log("opera aggiunta avvenuta con successo",response)   ; 
                             $("input[name='nomeCliente']").val(""),
                             $("input[name='nome']").val(""),
                            $("input[name='prezzo']").val(""),
                            $("input[name='stato']").val("")
                            },
                            error:function(error)
                            {
                                console.error("errore durante l'inserimento dei dati ") ; 
                            }
                        })
                    })
            

            



            /*
                // Al click del pulsante "Visualizza Catalogo", chiama la funzione per visualizzare il catalogo
            $("#visualizza").on("submit", function (event) {
                event.preventDefault(); // Impedisce il submit del form, che ricaricherebbe la pagina
                visualizzaCatalogo();
            });*/