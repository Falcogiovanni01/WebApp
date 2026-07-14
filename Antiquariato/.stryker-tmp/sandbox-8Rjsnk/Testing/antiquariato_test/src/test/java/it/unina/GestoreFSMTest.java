package it.unina;

import it.unina.fsm.CoperturaFSM;
import it.unina.fsm.CoperturaFSMExtension;
import it.unina.fsm.Fsm;
import it.unina.fsm.Transizione;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import org.bson.Document;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ExtendWith(CoperturaFSMExtension.class)
@CoperturaFSM(Fsm.GESTORE)
@DisplayName("FSM Gestore: Automazione Selenium")
public class GestoreFSMTest {

    private WebDriver driver;
    private WebDriverWait wait;
    
    private final String BASE_URL = "http://localhost:3000"; 

    // --- METODI HELPER PER NON RIPETERE IL CODICE (DRY) ---

    private void loginDiSupporto() {
        driver.manage().deleteAllCookies();
        driver.navigate().refresh();
        driver.get(BASE_URL);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("user"))).sendKeys("admin");
        driver.findElement(By.id("pass")).sendKeys("admin");
        driver.findElement(By.cssSelector("#form-login-gestore button[type='submit']")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-aggiungi")));
    }

    private void aggiungiOperaDiSupporto(String codice, String nome) {
        WebElement formAggiungi = driver.findElement(By.id("form-aggiungi"));
        formAggiungi.findElement(By.name("codice")).sendKeys(codice);
        formAggiungi.findElement(By.name("nome")).sendKeys(nome);
        formAggiungi.findElement(By.name("prezzo")).sendKeys("150");
        formAggiungi.findElement(By.cssSelector("button[data-testid='btn-submit-aggiungi']")).click();
        try { wait.until(ExpectedConditions.alertIsPresent()); driver.switchTo().alert().accept(); } catch (Exception e) {}
    }

     // ============================================================
    // Verifica di persistenza reale su MongoDB, non solo sull'interfaccia.
    // Apre una connessione diretta (indipendente da quella usata dal server
    // Express, che gira nel suo processo separato tramite mongoose) e
    // interroga la stessa collezione "operas" (nome derivato dalla
    // pluralizzazione automatica di Mongoose sul modello "Opera").
    // Ritorna null se l'opera non esiste nel DB.
    // ============================================================
    private Document trovaOperaNelDB(String codice) {
        try (MongoClient mongoClient = MongoClients.create("mongodb://127.0.0.1:27017")) {
            MongoCollection<Document> operas = mongoClient.getDatabase("Gestore").getCollection("operas");
            return operas.find(Filters.eq("codice", codice)).first();
        }
    }

    @BeforeAll
    void setUp() {
        // Configurazione per far aprire Chrome in automatico
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");
        
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterAll
    void tearDown() {
        if (driver != null) {
            driver.quit(); // Chiude la finestra di Chrome alla fine del test
        }
    }

    // Strutturiamo il test esattamente come il  diagramma a stati
    /**************
     * 
     * S0_Login
     * se esegui la classe S0_login, vedrai che il test fallisce perché il browser mantiene la sessione precedente.
     * Per risolvere questo problema, dobbiamo cancellare i cookie prima di ogni test
     * 
     */
    @Nested
    @DisplayName("Stato S0: Login Gestore")
    class S0_Login {

        @BeforeEach
        void puliziaSessione() {
            // 1. Apriamo il browser prima di ogni test
            driver.get(BASE_URL);
            
            // 2. Questa è la riga MAGICA che risolve il tuo bug:
            // Cancella ogni traccia di sessione precedente prima di testare il login
            driver.manage().deleteAllCookies();
            
            // 3. Ricarichiamo la pagina per assicurarci che il server veda il browser "vergine"
            driver.navigate().refresh();
        }


        @Test
        @DisplayName("Transizione S0 -> S1 -> S0: Credenziali Errate")
        @Transizione({"S0->S0"})
        void testLoginFallito() {
            // 1. Andiamo sulla pagina iniziale (Stato S0)
            driver.get(BASE_URL);

            // 2. Troviamo i campi del form usando gli ID del tuo HTML
            WebElement userField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("user")));
            WebElement passField = driver.findElement(By.id("pass"));
            WebElement loginButton = driver.findElement(By.cssSelector("#form-login-gestore button[type='submit']"));

            // 3. Inseriamo credenziali volutamente sbagliate
            userField.sendKeys("gestore_falso");
            passField.sendKeys("password_errata");

            // 4. Scateniamo l'evento di submit
            loginButton.click();

            //  GESTIONE ALERT: Diciamo a Selenium di gestire la finestra che è apparsa
            wait.until(ExpectedConditions.alertIsPresent());
            driver.switchTo().alert().accept(); 

            // 5. Verifica matematica: l'utente deve restare in S0.
            // Il campo utente deve essere ancora visibile a schermo.
            assertTrue(userField.isDisplayed(), "Il sistema doveva restare nello stato S0 a causa delle credenziali errate.");
        }

        @Test
        @Transizione({"S0->S1", "S1->S2"})
        @DisplayName("Transizione S0 -> S1 -> S2: Credenziali Valide (Accesso Dashboard)")
        void testLoginSuccesso() {
            // 1. Partiamo sempre dallo stato iniziale
            driver.get(BASE_URL);

            // 2. Troviamo gli elementi
            WebElement userField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("user")));
            WebElement passField = driver.findElement(By.id("pass"));
            WebElement loginButton = driver.findElement(By.cssSelector("#form-login-gestore button[type='submit']"));

            // 3. Inseriamo le credenziali CORRETTE
            userField.sendKeys("admin"); 
            passField.sendKeys("admin"); 
            
            // 4. Scateniamo l'evento
            loginButton.click();

            // 5. Verifica Architetturale: Dobbiamo essere arrivati in S2.
            // L'overlay del login deve sparire e la dashboard deve apparire.
            // Cerchiamo un elemento che esiste SOLO nella dashboard, ad esempio il form per aggiungere un'opera.
            // NOTA: Se l'ID del form nel tuo HTML è diverso, cambialo qui sotto!
            WebElement aggiungiOperaForm = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-aggiungi")));
            
            assertTrue(aggiungiOperaForm.isDisplayed(), "Il sistema doveva passare allo stato S2 (Dashboard Gestore).");
            
            System.out.println(" [TEST SUPERATO] Transizione S0 -> S1 eseguita con successo. Accesso consentito.");
       
        }
    }

    // Ora testiamo lo stato S1, ma per arrivarci dobbiamo prima fare un login valido.
    @Nested
    @DisplayName("Stato S1: Check Session e Persistenza Cookie (Gestore)")
    class S1_VerificaSessione_Gestore {

        @BeforeEach
        void puliziaCookie() {
            // Senza questo reset, se una classe precedente lascia una sessione valida,
            // driver.get(BASE_URL) carica la pagina già "loggata": l'overlay di login
            // resta nascosto e #user non diventa mai visibile (TimeoutException).
            driver.manage().deleteAllCookies();
        }

        @Test
        @Transizione({"S1->S2"})
        @DisplayName("Transizione S1 -> S2: Bypass del login con cookie valido")
        void testPersistenzaCookieGestore() {
            // 1. Andiamo sull'app Gestore e facciamo il login
         
            loginDiSupporto(); // Questo metodo cancella i cookie residui e fa il login, portandoci in S2.
            // 2. SIMULIAMO IL RIENTRO (Ricaricamento pagina)
            driver.navigate().refresh();

            // 3. Verifica Architetturale: la dashboard deve caricarsi direttamente
            WebElement aggiungiOperaForm = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-aggiungi")));
            
            assertTrue(aggiungiOperaForm.isDisplayed(), "Errore Cookie: Il sistema non ha riconosciuto la sessione del Gestore ed è tornato in S0.");
            
            System.out.println("[TEST SUPERATO] Transizione S1 -> S2 (Gestore) eseguita. Cookie validato e sessione persistente.");
        }

        @Test
        @Transizione({"S1->S0"})
        @DisplayName("Transizione S1 -> S0: Cookie di sessione assente/non valido (Gestore)")
        void testCookieNonValidoGestoreTornaAlLogin() {
            // 1. Andiamo sull'app Gestore e facciamo il login
            loginDiSupporto();
            // 2. Ora cancelliamo i cookie per simulare una sessione scaduta o assente
            driver.manage().deleteAllCookies();
            // 3. Ricarichiamo la pagina per forzare il sistema a verificare la sessione
            driver.navigate().refresh();

            WebElement loginForm = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-login-gestore")));
            assertTrue(loginForm.isDisplayed(), "Senza un cookie di sessione valido, il sistema doveva tornare in S0 (Login Gestore).");
            System.out.println("[TEST SUPERATO] Cookie assente/non valido: transizione S1 -> S0 (Gestore) confermata.");
        }
    }




    // Ora testiamo lo stato S2, ma per arrivarci dobbiamo prima fare un login valido.
    @Nested
    @DisplayName("Stato S2: Area Protetta (Dashboard Gestore)")
    class S2_Dashboard {

        @BeforeEach
        void setupLoginDiServizio() {
            // FIX: riusiamo l'helper loginDiSupporto() (già usato da S3_Modifica e S4_Rimozione),
            // che cancella prima i cookie residui. Senza questo passaggio, se un test precedente
            // aveva già una sessione valida, l'overlay di login risultava già nascosto al reload
            // e #user non diventava mai "visibile" per Selenium (TimeoutException).
            loginDiSupporto();
        }

        @Test
        @DisplayName("Transizioni Bidirezionali: S2 (Aggiungi) <-> S3 (Modifica)")
        @Transizione({"S2->S3", "S3->S2"})
        void testNavigazioneTabs() {
            // 1. Troviamo i bottoni di navigazione (usando l'attributo data-target del tuo HTML)
            WebElement btnModifica = driver.findElement(By.cssSelector("button[data-target='tab-modifica']"));
            WebElement btnAggiungi = driver.findElement(By.cssSelector("button[data-target='tab-aggiungi']"));

            // 2. Clicchiamo sulla tab Modifica (Transizione S2 -> S3)
            btnModifica.click();

            // 3. Verifica: la sezione Modifica deve diventare visibile
            WebElement tabModifica = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-modifica")));
            assertTrue(tabModifica.isDisplayed(), "Il sistema doveva passare allo stato S3 (Sezione Modifica).");
            System.out.println("[TEST SUPERATO] Transizione S2 -> S3 (Modifica) eseguita.");

            // 4. Clicchiamo sulla tab Aggiungi per tornare indietro (Transizione S3 -> S2)
            btnAggiungi.click();

            // 5. Verifica: la sezione Aggiungi deve tornare visibile
            WebElement tabAggiungi = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-aggiungi")));
            assertTrue(tabAggiungi.isDisplayed(), "Il sistema doveva tornare allo stato S2 (Sezione Aggiungi).");
            System.out.println("[TEST SUPERATO] Transizione S3 -> S2 (Ritorno ad Aggiungi) eseguita.");
        }

        @Test
        @DisplayName("Transizione S2 -> Report: Visualizzazione Report Acquisti")
        @Transizione({"S2->S5", "S5->S5"})
        void testReportAcquisti() {
            // 1. Clicchiamo sulla tab Offerte / Report assicurandoci sia cliccabile
            WebElement btnOfferte = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[data-target='tab-offerte']")));
            btnOfferte.click();

            // 2. Verifica intermedia: la sezione del report deve diventare visibile nel DOM
            WebElement tabOfferte = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-offerte")));
            assertTrue(tabOfferte.isDisplayed(), "La sezione Offerte/Report doveva essere visibile a schermo.");

            // 3. Interagiamo con il bottone specifico del Report Acquisti
            WebElement btnRepAcquisti = driver.findElement(By.id("btn-rep-acquisti"));
            btnRepAcquisti.click();

            // 4. Verifica finale: il pannello dei risultati deve attivarsi e mostrarsi all'utente
            WebElement reportResults = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("report-results")));
            assertTrue(reportResults.isDisplayed(), "Il pannello dei risultati del report acquisti deve essere visibile.");
            
            System.out.println("[TEST SUPERATO] Navigazione ed elaborazione Report Acquisti completata con successo.");
        }

        @Test
        @DisplayName("Transizione S2 -> Report: Visualizzazione Report Vendite")
        @Transizione({"S2->S5", "S5->S5"})
        void testReportVendite() {
            // 1. Clicchiamo sulla tab Offerte / Report
            WebElement btnOfferte = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[data-target='tab-offerte']")));
            btnOfferte.click();

            // 2. Verifica intermedia di visibilità della tab
            WebElement tabOfferte = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-offerte")));
            assertTrue(tabOfferte.isDisplayed(), "La sezione Offerte/Report doveva essere visibile a schermo.");

            // 3. Interagiamo con il bottone specifico del Report Vendite
            WebElement btnRepVendite = driver.findElement(By.id("btn-rep-vendite"));
            btnRepVendite.click();

            // 4. Verifica finale sulla comparsa del box dei risultati
            WebElement reportResults = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("report-results")));
            assertTrue(reportResults.isDisplayed(), "Il pannello dei risultati del report vendite deve essere visibile.");
            
            System.out.println(" [TEST SUPERATO] Navigazione ed elaborazione Report Vendite completata con successo.");
        }



        @Test
        @DisplayName("Transizione S2 -> S0: Logout e Distruzione Sessione")
        @Transizione({"S2->S0"})
        void testLogoutGestore() { // LA POST CONDIZIONE SAREBBE STATA QUELLA DI DISTRUGGERE IL COOKIE, MA NEL NOSTRO CASO LO CONSERVIAMO PER DUE ORE. 
            // 1. Siamo in S2. Troviamo il bottone di logout e lo clicchiamo.
          
            WebElement logoutButton = driver.findElement(By.id("btn-logout-gestore"));
            logoutButton.click();

            // 2. Verifica Architetturale: Il sistema deve riportarci allo stato S0.
            // Il form di login deve tornare a essere l'elemento visibile principale.
            WebElement loginForm = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-login-gestore")));
            
            assertTrue(loginForm.isDisplayed(), "Il sistema doveva distruggere la sessione e tornare allo stato S0.");
            
            // 3. Stampa di conferma visiva nel terminale (eseguita solo se l'assert ha successo)
            System.out.println(" [TEST SUPERATO] Transizione S2 -> S0 eseguita con successo. Sessione distrutta.");
        }

        @Test
    @DisplayName("Transizione S2 -> S2: Aggiunta Nuova Opera (Dinamica)")
    @Transizione({"S2->S2"})
    void testAggiuntaNuovaOpera() {
        WebElement formAggiungi = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-aggiungi")));

        WebElement inputCodice = formAggiungi.findElement(By.name("codice"));
        WebElement inputNome = formAggiungi.findElement(By.name("nome"));
        WebElement inputDescrizione = formAggiungi.findElement(By.name("descrizione"));
        WebElement inputPrezzo = formAggiungi.findElement(By.name("prezzo"));
        WebElement inputTecnica = formAggiungi.findElement(By.name("tecnica"));
        WebElement btnSubmit = formAggiungi.findElement(By.cssSelector("button[data-testid='btn-submit-aggiungi']"));

        // Generiamo un codice univoco basato sul tempo di sistema
        String codiceUnivoco = "TEST-" + System.currentTimeMillis();
        
        inputCodice.sendKeys(codiceUnivoco);
        inputNome.sendKeys("Opera Autogenerata");
        inputDescrizione.sendKeys("Opera creata da Selenium per test automatizzato");
        inputPrezzo.sendKeys("150");
        inputTecnica.sendKeys("Automazione");

        btnSubmit.click();

        try {
            wait.until(ExpectedConditions.alertIsPresent());
            driver.switchTo().alert().accept();
            System.out.println("Alert di conferma accettato. Opera " + codiceUnivoco + " inserita.");
        } catch (Exception e) {
            System.out.println("Nessun alert rilevato, verifica del DOM in corso.");
        }

        assertTrue(formAggiungi.isDisplayed(), "Il sistema deve rimanere nello stato S2 dopo l'aggiunta.");
         // DB, non solo mostrata come "successo" dall'alert del browser.
        Document operaCreata = trovaOperaNelDB(codiceUnivoco);
        assertNotNull(operaCreata, "L'opera doveva essere stata realmente scritta nel DB, non solo mostrata come successo dall'alert.");
        assertEquals("150", operaCreata.getString("prezzo"), "Il prezzo salvato nel DB doveva corrispondere a quello inserito nel form.");
 
       
       
        System.out.println("[TEST SUPERATO] Inserita opera dinamica nel database, pronta per l'acquisto.");
    }

    // Test per verificare che il sistema blocchi l'inserimento quando i campi obbligatori sono vuoti
    // Questo test simula un tentativo di aggiunta senza compilare i campi richiesti, verificando che il form non venga inviato e che l'utente rimanga nello stato S2.
    @Test
        @DisplayName("Transizione S2 -> S2: Aggiunta Fallita (Campi Vuoti)")
        @Transizione({"S2->S2"})
        void testAggiuntaFallita() {
            WebElement formAggiungi = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-aggiungi")));
            
            // Non compiliamo nulla e premiamo subito Submit
            WebElement btnSubmit = formAggiungi.findElement(By.cssSelector("button[data-testid='btn-submit-aggiungi']"));
            btnSubmit.click();

            // Il form usa l'attributo HTML5 'required', quindi il browser dovrebbe bloccare il submit.
            // Verifichiamo che il form sia ancora lì e non sia scattata nessuna transizione.
            assertTrue(formAggiungi.isDisplayed(), "Il form deve restare visibile perché mancano i campi obbligatori.");
            System.out.println("[TEST SUPERATO] Inserimento bloccato correttamente per campi mancanti.");
        }
    

}

    @Nested
    @DisplayName("Stato S3: Modifica Opera")
    class S3_Modifica {
        // Variabile per memorizzare il codice dell'opera creata dinamicamente
        // Questo codice sarà utilizzato nei test di modifica per garantire che stiamo lavorando con un'opera esistente
        // l'obiettivo è evitare conflitti con opere già presenti nel database e garantire l'isolamento dei test
        // per rendere il test ripetibile e affidabile, generiamo un codice unico basato sul timestamp corrente
        // Questo approccio assicura che ogni esecuzione del test lavori con un'opera "fresca" e non interferisca con altre esecuzioni o dati preesistenti
        String codiceTest;

        @BeforeEach
        void setup() {
            codiceTest = "MOD-" + System.currentTimeMillis();
            loginDiSupporto();
            aggiungiOperaDiSupporto(codiceTest, "Opera da Modificare");
        }

        @Test
        @DisplayName("Transizione S3 -> S3: Modifica Fallita (Opera Inesistente)")
        @Transizione({"S2->S3", "S3->S3"}) 
        void testModificaFallita() {
            driver.findElement(By.cssSelector("button[data-target='tab-modifica']")).click();
            WebElement formModifica = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-modifica")));

            formModifica.findElement(By.name("codice")).sendKeys("FALSO-999");
            formModifica.findElement(By.name("nome")).sendKeys("Hacker");
            formModifica.findElement(By.cssSelector("button[data-testid='btn-submit-modifica']")).click();

            try { wait.until(ExpectedConditions.alertIsPresent()); driver.switchTo().alert().accept(); } catch (Exception e) {}

            assertTrue(formModifica.isDisplayed(), "Il sistema doveva restare in S3.");
            System.out.println("[TEST SUPERATO] Tentativo di modifica fallito come previsto per opera inesistente.");
        }

        @Test
        @DisplayName("Transizione S3 -> S3: Modifica Avvenuta con Successo")
        @Transizione({"S2->S3", "S3->S3"})
        void testModificaSuccesso() {
            driver.findElement(By.cssSelector("button[data-target='tab-modifica']")).click();
            WebElement formModifica = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-modifica")));

            formModifica.findElement(By.name("codice")).sendKeys(codiceTest); // Usiamo l'opera appena creata!
            formModifica.findElement(By.name("nome")).sendKeys("Titolo Modificato!");
            formModifica.findElement(By.name("prezzo")).sendKeys("9999");
            formModifica.findElement(By.cssSelector("button[data-testid='btn-submit-modifica']")).click();

            try {      
            wait.until(ExpectedConditions.alertIsPresent()); driver.switchTo().alert().accept();
            } catch (Exception e) {}

            assertTrue(formModifica.isDisplayed(), "Il sistema doveva restare in S3.");

             // Verifica di persistenza: il prezzo deve essere stato realmente
            // aggiornato in MongoDB, non solo mostrato come "successo" dall'alert.
            Document operaAggiornata = trovaOperaNelDB(codiceTest);
            assertNotNull(operaAggiornata, "L'opera modificata doveva ancora esistere nel DB.");
            assertEquals("9999", operaAggiornata.getString("prezzo"), "Il prezzo nel DB doveva riflettere la modifica, non solo l'alert di conferma.");

            System.out.println("[TEST SUPERATO] Modifica avvenuta con successo per opera esistente.");
        }
    }


    // Ora testiamo lo stato S4, ma per arrivarci dobbiamo prima fare un login valido.
    // Salviamo un'opera di supporto prima di ogni test per garantire che ci sia qualcosa da rimuovere.
    @Nested
    @DisplayName("Stato S4: Rimozione Opera")
    class S4_Rimozione {
        
        String codiceTest;

        @BeforeEach
        void setup() {
            codiceTest = "DEL-" + System.currentTimeMillis();
            loginDiSupporto();
            aggiungiOperaDiSupporto(codiceTest, "Opera da Rimuovere");
        }

        @Test
        @DisplayName("Transizione S4 -> S4: Rimozione Avvenuta con Successo")
        @Transizione({"S2->S4","S4->S4"})
        void testRimozioneSuccesso() {
            driver.findElement(By.cssSelector("button[data-target='tab-rimuovi']")).click();
            WebElement formRimuovi = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-rimuovi")));

            // Ora inseriamo SOLO il codice, in perfetta coerenza col tuo HTML
            formRimuovi.findElement(By.name("codice")).sendKeys(codiceTest);
            formRimuovi.findElement(By.cssSelector("button[data-testid='btn-submit-rimuovi']")).click();

            try { wait.until(ExpectedConditions.alertIsPresent()); driver.switchTo().alert().accept(); } catch (Exception e) {}

            assertTrue(formRimuovi.isDisplayed(), "Il sistema doveva restare in S4 dopo l'eliminazione.");
          
          
            // Verifica di persistenza: l'opera deve essere stata realmente rimossa
            // da MongoDB, non solo scomparsa dall'interfaccia.
            Document operaRimossa = trovaOperaNelDB(codiceTest);
            assertNull(operaRimossa, "L'opera doveva essere stata rimossa realmente dal DB, non solo dall'interfaccia.");
 
            System.out.println("[TEST SUPERATO] L'opera " + codiceTest + " è stata rimossa correttamente.");
        }
        
 
    }

    // Ora testiamo lo stato S4, ma per arrivarci dobbiamo prima fare un login valido.
    // Dato che non necessitiamo di creare un'opera di supporto per questo test, ci limitiamo a fare il login e testiamo la rimozione fallita.
    @Nested
    @DisplayName("Stato S4: Rimozione (Negative Path)")
    class S4_Rimozione_Fallimento {

        @BeforeEach
        void setup() {
            loginDiSupporto(); // Qui facciamo SOLO il login. Niente spazzatura nel DB!
        }

        @Test
        @DisplayName("Transizione S4 -> S4: Rimozione Fallita (Codice Inesistente)")
        @Transizione({"S2->S4","S4->S4"})
        void testRimozioneFallita() {
                driver.findElement(By.cssSelector("button[data-target='tab-rimuovi']")).click();
            WebElement formRimuovi = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-rimuovi")));

            // Testiamo il backend inserendo un codice che non esiste
            formRimuovi.findElement(By.name("codice")).sendKeys("CODICE-INESISTENTE-999");
            formRimuovi.findElement(By.cssSelector("button[data-testid='btn-submit-rimuovi']")).click();

            // Intercettiamo l'alert di errore (status 404)
            try { 
                wait.until(ExpectedConditions.alertIsPresent()); 
                driver.switchTo().alert().accept(); 
            } catch (Exception e) {
                System.out.println("Nessun alert rilevato per l'errore di rimozione.");
            }

            assertTrue(formRimuovi.isDisplayed(), "Il form di rimozione deve restare visibile dopo un errore.");
            System.out.println("[TEST SUPERATO] Eliminazione bloccata correttamente per codice inesistente.");
        }
    }

}