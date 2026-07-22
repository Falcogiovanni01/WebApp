package it.unina;

import it.unina.fsm.CoperturaFSM;
import it.unina.fsm.CoperturaFSMExtension;
import it.unina.fsm.Fsm;
import it.unina.fsm.Transizione;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
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
import com.mongodb.client.model.Sorts;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.bson.Document;

import static org.junit.jupiter.api.Assertions.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ExtendWith(CoperturaFSMExtension.class)
@CoperturaFSM(Fsm.CLIENTE)
@DisplayName("FSM Cliente: Automazione Selenium")
public class ClienteFSMTest {

    private WebDriver driver;
    private WebDriverWait wait;

    // Porta del server Cliente
    private final String BASE_URL = "http://localhost:3001";

    // utente di test nel DB
    private final String USER_TEST = "PROVA UTENTE";
    private final String PASS_TEST = "Prov@1000";

     // ============================================================
    // Provisioning automatico dell'utente di test.
    // Non usa Selenium: è una chiamata HTTP diretta al server Cliente,
    // eseguita una sola volta prima di aprire il browser. Rende la suite
    // eseguibile da zero su un DB Mongo pulito, senza precondizioni manuali.
    // ============================================================
    private void assicuraUtenteDiTest() {
        try {
            HttpClient client = HttpClient.newHttpClient();

            // 1. Proviamo prima il login: se l'utente esiste già con queste
            // credenziali (es. da un'esecuzione precedente), non serve altro.
            String loginBody = "nome=" + URLEncoder.encode(USER_TEST, StandardCharsets.UTF_8)
                    + "&password=" + URLEncoder.encode(PASS_TEST, StandardCharsets.UTF_8);
            HttpRequest loginReq = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/login"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(loginBody))
                    .build();
            HttpResponse<String> loginRes = client.send(loginReq, HttpResponse.BodyHandlers.ofString());

            if (loginRes.statusCode() == 200) {
                System.out.println("[SETUP] Utente di test già presente nel DB: login verificato.");
                return;
            }

            // 2. Login fallito (401): l'utente non esiste ancora, lo registriamo.
            String regBody = "nome=" + URLEncoder.encode(USER_TEST, StandardCharsets.UTF_8)
                    + "&password=" + URLEncoder.encode(PASS_TEST, StandardCharsets.UTF_8)
                    + "&numero=" + URLEncoder.encode("3331234567", StandardCharsets.UTF_8)
                    + "&carta=" + URLEncoder.encode("0000000000000000", StandardCharsets.UTF_8);
            HttpRequest regReq = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/registrazione"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(regBody))
                    .build();
            HttpResponse<String> regRes = client.send(regReq, HttpResponse.BodyHandlers.ofString());

            if (regRes.statusCode() == 200) {
                System.out.println("[SETUP] Utente di test creato automaticamente (DB era vuoto/pulito).");
            } else {
                System.out.println("[SETUP] ATTENZIONE: impossibile creare l'utente di test (status "
                        + regRes.statusCode() + "). I test di login potrebbero fallire.");
            }
        } catch (Exception e) {
            System.out.println("[SETUP] ATTENZIONE: impossibile contattare " + BASE_URL
                    + " per predisporre l'utente di test (" + e.getMessage()
                    + "). Verifica che ServerCliente.js e MongoDB siano avviati prima di lanciare i test.");
        }
    }

    // --- METODI HELPER ---

    private void svuotaSessioneTotale() {
        driver.get(BASE_URL);
        // 1. Distruggiamo i Cookie lato Server
        driver.manage().deleteAllCookies();
        // 2. Distruggiamo il LocalStorage lato Client
        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("window.localStorage.clear();");
        // 3. Ricarichiamo per applicare
        driver.navigate().refresh();
    }

    private void eseguiLoginDiSupporto() {
        svuotaSessioneTotale();
        WebElement userField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[data-testid='login-username']")));
        driver.findElement(By.cssSelector("input[data-testid='login-password']")).sendKeys(PASS_TEST);
        userField.sendKeys(USER_TEST);
        driver.findElement(By.cssSelector("button[data-testid='login-submit']")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("main-app-container")));
    }



    // ============================================================
    // Verifiche di persistenza reale su MongoDB, non solo sull'interfaccia.
    // DB "Cliente" (da mongoose.connect nel server), collezioni derivate dalla
    // pluralizzazione automatica di Mongoose sui modelli "Cliente", "Ordine"
    // e "Carrello". 
    // ============================================================
    private Document trovaClienteNelDB(String nome) {
        try (MongoClient mongoClient = MongoClients.create("mongodb://127.0.0.1:27017")) {
            MongoCollection<Document> clienti = mongoClient.getDatabase("Cliente").getCollection("clientes");
            return clienti.find(Filters.eq("nome", nome)).first();
        }
    }
 
    private Document trovaUltimoOrdineNelDB(String utente) {
        try (MongoClient mongoClient = MongoClients.create("mongodb://127.0.0.1:27017")) {
            MongoCollection<Document> ordini = mongoClient.getDatabase("Cliente").getCollection("ordines");
            return ordini.find(Filters.eq("utente", utente)).sort(Sorts.descending("_id")).first();
        }
    }
 
    private long contaCarrelloNelDB(String nome) {
        try (MongoClient mongoClient = MongoClients.create("mongodb://127.0.0.1:27017")) {
            MongoCollection<Document> carrello = mongoClient.getDatabase("Cliente").getCollection("carrellos");
            return carrello.countDocuments(Filters.eq("nome", nome));
        }
    }



    // DA NOTARE IL PUNTO 2 E IL PUNTO 3 SONO STATI NECESSARI AI FINI DI UNA MIGLIORE ESPERIENZA DI TESTING AUTOMATIZZATO CON CHROME DRIVER
    // LA loro assenza generava un errore
    @BeforeAll
    void setUp() {
        // garantiamo che l'utente di test esista nel DB, indipendentemente
        // da quale macchina/DB venga usato per eseguire la suite (niente più
        // precondizioni manuali da creare a mano prima di 'mvn test').
        assicuraUtenteDiTest();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");
        // 2. Disattiva il pop-up "Vuoi salvare la password?" e l'autofill
        java.util.Map<String, Object> prefs = new java.util.HashMap<>();
        prefs.put("credentials_enable_service", false);
        prefs.put("profile.password_manager_enabled", false);
        options.setExperimentalOption("prefs", prefs);

        // 3. Nasconde la barra "Chrome è controllato da un software automatizzato"
        options.setExperimentalOption("excludeSwitches", new String[]{"enable-automation"});

        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterAll
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }


    // --- SUITE DI TEST ---
    @Nested
    @DisplayName("Stato S0 e S3: Accesso e Registrazione")
    class S0_S3_AccessoPubblico {

        @BeforeEach
        void setup() {
            svuotaSessioneTotale();
        }

        

        @Test
        @DisplayName("Transizione S0 -> S0: Credenziali Errate (Negative Path)")
        @Transizione({"S0->S0"})
        void testLoginFallito() {
            WebElement userField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[data-testid='login-username']")));
            WebElement passField = driver.findElement(By.cssSelector("input[data-testid='login-password']"));
            WebElement loginButton = driver.findElement(By.cssSelector("button[data-testid='login-submit']"));

            userField.sendKeys("utente_999");
            passField.sendKeys("password_sbagliata");
            loginButton.click();

            try { wait.until(ExpectedConditions.alertIsPresent()); driver.switchTo().alert().accept(); } catch (Exception e) {}

            assertTrue(userField.isDisplayed(), "Il sistema doveva restare in S0 a causa di credenziali errate.");
            System.out.println(" [TEST SUPERATO] Login fallito con credenziali errate confermato.");
        }

        @Test
        @DisplayName("Transizione S0 -> S1 -> S2: Login Valido (Accesso Catalogo)")
        @Transizione({"S0->S1", "S1->S2"})
        void testLoginSuccesso() {
            WebElement userField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[data-testid='login-username']")));
            WebElement passField = driver.findElement(By.cssSelector("input[data-testid='login-password']"));
            WebElement loginButton = driver.findElement(By.cssSelector("button[data-testid='login-submit']"));

            userField.sendKeys(USER_TEST);
            passField.sendKeys(PASS_TEST);
            loginButton.click();

            WebElement appContainer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("main-app-container")));
            assertTrue(appContainer.isDisplayed(), "Il sistema doveva passare allo stato S2 (Catalogo).");
            System.out.println(" [TEST SUPERATO] Login valido e accesso al catalogo confermato.");
        }
    }

    // --- TEST SU REGISTRAZIONE E SESSIONE ---
    @Nested
    @DisplayName("Stato S3: Registrazione Nuovo Cliente")
    class S3_Registrazione {

        @BeforeEach
        void setup() {
            // senza questo reset, se una classe annidata precedente
            // (es. S2_S4_AreaPrivata) lascia il browser loggato, driver.get(BASE_URL)
            // carica la pagina già in stato "loggato": auth-container (che contiene
            // link-show-register) resta nascosto -> ElementNotInteractableException.
            svuotaSessioneTotale();
        }

        @Test
        @DisplayName("Transizione S3 -> S0: Registrazione Avvenuta con Successo")
        @Transizione({"S0->S3", "S3->S0"})
        void testRegistrazioneSuccesso() {
            driver.get(BASE_URL);
            // 1. Vai in S3
            driver.findElement(By.id("link-show-register")).click();
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-register")));

            // 2. Generiamo dati casuali per evitare conflitti con utenti già esistenti.
            long timestamp = System.currentTimeMillis();
            String username = "NuovoUtente_" + timestamp;
            String telefonoUnico = "3" + String.format("%09d", timestamp % 1_000_000_000L);

            // 3. Compiliamo il form di registrazione
            driver.findElement(By.cssSelector("input[data-testid='reg-username']")).sendKeys(username);
            driver.findElement(By.cssSelector("input[data-testid='reg-password']")).sendKeys("password123");
            driver.findElement(By.cssSelector("input[data-testid='reg-phone']")).sendKeys(telefonoUnico);
            driver.findElement(By.cssSelector("input[data-testid='reg-card']")).sendKeys("1234567890123456");

            driver.findElement(By.cssSelector("button[data-testid='reg-submit']")).click();

            // 4. Gestiamo l'alert di successo
            try {
                wait.until(ExpectedConditions.alertIsPresent());
                driver.switchTo().alert().accept();
            } catch (Exception e) {}

            // 5. Verifica: il sistema ci riporta al login (S0)
            WebElement formLogin = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-login")));
            assertTrue(formLogin.isDisplayed(), "La registrazione doveva riportare l'utente allo stato S0 (Login).");

            // Verifica di persistenza nel DB
           Document clienteCreato = trovaClienteNelDB(username);
            assertNotNull(clienteCreato, "L'utente doveva essere stato realmente scritto nel DB, non solo mostrato come successo dall'alert.");
            assertEquals(telefonoUnico, clienteCreato.getString("numero"), "Il numero di telefono salvato nel DB doveva corrispondere a quello inserito nel form.");

            System.out.println("[TEST SUPERATO] Registrazione completata per l'utente: " + username);
        }

    @Test
    @DisplayName("S3: Registrazione con campi vuoti (Negative Path)")
    @Transizione({"S3->S3"})
    void testRegistrazioneCampiVuoti() {
        driver.get(BASE_URL);
        driver.findElement(By.id("link-show-register")).click();

        // Non inviamo alcun dato, clicchiamo solo submit
        driver.findElement(By.cssSelector("button[data-testid='reg-submit']")).click();
        // Dato la presenza del campo 'required', il browser dovrebbe bloccare il submit.
        // Se il submit passa lo stesso, il test fallirà correttamente segnalando una falla di sicurezza.
        // verifichiamo se siamo rimasti bloccati in S3 (form ancora visibile)
        WebElement formRegistrazione = driver.findElement(By.id("form-register"));
        assertTrue(formRegistrazione.isDisplayed(), "Il form doveva rimanere visibile perché la registrazione non doveva passare.");
    }


    }


    @Nested
    @DisplayName("Stato S1: Check Session e Persistenza")
    class S1_VerificaSessione {

        @Test
        @DisplayName("Transizione S1 -> S2: Bypass del login con cookie/storage validi")
        @Transizione({"S1->S2"})
        void testPersistenzaSessione() {
            eseguiLoginDiSupporto();

            // SIMULIAMO L'USCITA E IL RIENTRO (Refresh della pagina)
            driver.navigate().refresh();

            // L'app deve saltare S0 e mostrare subito la dashboard (S2)
            WebElement appContainer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("main-app-container")));
            assertTrue(appContainer.isDisplayed(), "Errore: Il sistema non ha riconosciuto la sessione attiva ed è tornato al login.");
            System.out.println(" [TEST SUPERATO] Persistenza della sessione confermata dopo ricaricamento della pagina.");
        }

        @Test
        @DisplayName("Transizione S1 -> S0: Cookie di sessione assente/non valido")
        @Transizione({"S1->S0"})
        void testCookieNonValidoTornaAlLogin() {
            // 1. Partiamo da uno stato autenticato (S2), per assicurarci che il test
            // stia davvero verificando una transizione e non un semplice stato iniziale.
            eseguiLoginDiSupporto();
            WebElement appContainer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("main-app-container")));
            assertTrue(appContainer.isDisplayed(), "Precondizione fallita: l'utente doveva risultare loggato prima del test.");

            // 2. Simuliamo la scadenza/invalidazione del cookie di sessione,
            // cancellandolo direttamente a livello di browser (bypassando l'httpOnly,
            // cosa che l'applicazione client non potrebbe mai fare da sola).
            driver.manage().deleteCookieNamed("session");

            // 3. Ricarichiamo: senza cookie valido, checkSessionCliente deve rispondere 401
            // e l'app deve tornare in S0 (schermata di login).
            driver.navigate().refresh();

            WebElement authContainer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("auth-container")));
            assertTrue(authContainer.isDisplayed(), "Senza un cookie di sessione valido, il sistema doveva tornare in S0 (Login).");
            System.out.println(" [TEST SUPERATO] Cookie assente/non valido: transizione S1 -> S0 confermata.");
        }
    }

    @Nested
    @DisplayName("Stati S2 e S4: Area Privata Cliente")
    class S2_S4_AreaPrivata {

        @BeforeEach
        void setup() {
            eseguiLoginDiSupporto();
        }

        @Test
        @DisplayName("Transizioni Bidirezionali: S2 (Catalogo) <-> S4 (Carrello)")
        @Transizione({"S2->S4", "S4->S2"})
        void testNavigazioneCatalogoCarrello() {
            WebElement btnCarrello = driver.findElement(By.cssSelector("button[data-target='tab-carrello']"));
            WebElement btnCatalogo = driver.findElement(By.cssSelector("button[data-target='tab-catalogo']"));

            btnCarrello.click();
            WebElement tabCarrello = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-carrello")));
            assertTrue(tabCarrello.isDisplayed(), "Il sistema doveva passare allo stato S4 (Carrello).");

            btnCatalogo.click();
            WebElement tabCatalogo = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-catalogo")));
            assertTrue(tabCatalogo.isDisplayed(), "Il sistema doveva tornare allo stato S2 (Catalogo).");
            System.out.println(" [TEST SUPERATO] Navigazione tra Catalogo e Carrello confermata.");
        }

        @Test
        @DisplayName("Transizione S4: Bottone Acquisto nascosto con Carrello Vuoto")
        void testCarrelloVuotoNascondeBottone() {
            // Assumiamo che all'inizio il carrello sia vuoto
            driver.findElement(By.cssSelector("button[data-target='tab-carrello']")).click();
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-carrello")));

            // Verifica che il bottone d'acquisto non sia visibile
            Boolean isBtnAcquistaHidden = wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("btn-acquista")));
            assertTrue(isBtnAcquistaHidden, "Il bottone Acquista doveva essere nascosto per impedire checkout vuoti.");
            System.out.println(" [TEST SUPERATO] Bottone Acquista nascosto con carrello vuoto confermato.");
        }

      @Test
        @DisplayName("Flusso S2 -> S4: Aggiunta e Rimozione dal Carrello")
        @Transizione({"S2->S4", "S4->S4", "S4->S2", "S2->S2"})
        // include anche le transizioni del blocco di pre-pulizia (S2->S4 per
        // entrare nel carrello, S4->S4 per rimuovere eventuali residui, S4->S2 per
        // tornare al catalogo), perché è stato deciso di contare come "verificate"
        // anche le azioni UI reali dentro il corpo del test, non solo quelle seguite
        // da un assert esplicito.
        void testAggiungiERimuoviCarrello() {

            driver.findElement(By.cssSelector("button[data-target='tab-carrello']")).click();
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-carrello")));

            // Se ci sono già opere nel carrello, le rimuoviamo tutte cliccando in loop.
            // aspettiamo esplicitamente che il numero di bottoni "Rimuovi"
            // sia realmente diminuito dopo ogni click, prima di procedere con il successivo.
            int numeroResidui = driver.findElements(By.xpath("//button[contains(text(), 'Rimuovi')]")).size();
            for (int i = 0; i < numeroResidui; i++) {
                int contoPrimaDelClick = driver.findElements(By.xpath("//button[contains(text(), 'Rimuovi')]")).size();
                wait.until(ExpectedConditions.elementToBeClickable(By.xpath("(//button[contains(text(), 'Rimuovi')])[1]"))).click();
                wait.until(d -> d.findElements(By.xpath("//button[contains(text(), 'Rimuovi')]")).size() < contoPrimaDelClick);
            }

            driver.findElement(By.cssSelector("button[data-target='tab-catalogo']")).click();
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-catalogo")));
            // ---------------------------------------------------------------

            // 1. Aggiungiamo un'opera
            WebElement btnAggiungi = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("(//button[contains(text(), 'Aggiungi al Carrello')])[1]")));
            btnAggiungi.click();
            try { wait.until(ExpectedConditions.alertIsPresent()); driver.switchTo().alert().accept(); } catch (Exception e) {}

            // 2. Andiamo nel carrello
            driver.findElement(By.cssSelector("button[data-target='tab-carrello']")).click();
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-carrello")));

            // 3. Troviamo l'unico bottone "Rimuovi" e clicchiamolo
            WebElement btnRimuovi = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[contains(text(), 'Rimuovi')]")));
            btnRimuovi.click();

            // 4. Ora siamo certi che il carrello sia vuoto. Il bottone deve sparire.
            Boolean isCartEmpty = wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("btn-acquista")));
            assertTrue(isCartEmpty, "L'opera non è stata rimossa correttamente o c'erano residui.");
            System.out.println("[TEST SUPERATO] Rimozione dal carrello completata (con pulizia preventiva).");
        }

        @Test
        @DisplayName("Flusso End-to-End: S2 -> S4 -> Acquisto Definitivo")
        @Transizione({"S2->S2", "S2->S4", "S4->S4"})
        // "S2->S2" corrisponde al click su "Aggiungi al Carrello" fatto dal
        // catalogo prima di spostarsi nel carrello; mancava nella versione precedente.
        void testFlussoAcquisto() {
            // 1. Aggiungiamo al carrello
            WebElement btnAggiungi = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[contains(text(), 'Aggiungi al Carrello')]")));
            btnAggiungi.click();
            try { wait.until(ExpectedConditions.alertIsPresent()); driver.switchTo().alert().accept(); } catch (Exception e) {}

            // 2. Spostiamoci nel Carrello
            driver.findElement(By.cssSelector("button[data-target='tab-carrello']")).click();
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-carrello")));

            // 3. Acquistiamo
            WebElement btnAcquista = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-acquista")));
            btnAcquista.click();
            try { wait.until(ExpectedConditions.alertIsPresent()); driver.switchTo().alert().accept(); } catch (Exception e) {}

            // 4. Verifica Svuotamento Post-Acquisto
            Boolean isCartEmpty = wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("btn-acquista")));
            assertTrue(isCartEmpty, "Il carrello doveva risultare vuoto dopo la conferma dell'acquisto.");
            
            // Verifica di persistenza: deve esistere un ordine reale nel DB (non solo
            // un carrello svuotato in UI), e il carrello dell'utente su MongoDB deve
            // essere effettivamente a zero elementi.
            Document ultimoOrdine = trovaUltimoOrdineNelDB(USER_TEST);
            assertNotNull(ultimoOrdine, "L'acquisto doveva aver scritto un ordine reale nel DB, non solo svuotato il carrello in UI.");
 
            long carrelloResiduo = contaCarrelloNelDB(USER_TEST);
            assertEquals(0, carrelloResiduo, "Il carrello dell'utente nel DB doveva essere vuoto dopo l'acquisto, non solo nell'interfaccia.");
           
            System.out.println("[TEST SUPERATO] Flusso di acquisto completato con successo.");
        }

        @Test
        @DisplayName("Transizione S2/S4 -> S0: Logout Cliente")
        @Transizione({"S2->S0"})
        // qui viene testato solo il logout dalla tab di default (S2, Catalogo),
        // perché eseguiLoginDiSupporto() atterra sempre su S2 e il corpo del test
        // non naviga verso S4 prima di cliccare logout. "S4->S0" resta scoperto
        // finché non si scrive un test dedicato che fa logout dal carrello.
        void testLogoutCliente() {
            WebElement logoutButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-logout")));
            logoutButton.click();

            WebElement authContainer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("auth-container")));
            assertTrue(authContainer.isDisplayed(), "Il sistema doveva distruggere la sessione e tornare in S0.");
        }
       
        @Test
        @DisplayName("Transizione S4 -> S0: Logout Cliente dal Carrello")
        @Transizione({"S2->S4", "S4->S0"})
        void testLogoutClienteDalCarrello() {
            driver.findElement(By.cssSelector("button[data-target='tab-carrello']")).click();
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-carrello")));
 
            WebElement logoutButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-logout")));
            logoutButton.click();
 
            WebElement authContainer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("auth-container")));
            assertTrue(authContainer.isDisplayed(), "Il sistema doveva distruggere la sessione e tornare in S0 anche partendo dal carrello.");
            System.out.println(" [TEST SUPERATO] Logout dal carrello confermato: transizione S4 -> S0.");
        }
    }

    @Nested
@DisplayName("Copertura di codice aggiuntiva: percorsi di errore in Registrazione")
class CoperturaCodice_ErroriRegistrazione {

    @Test
    @DisplayName("Registrazione con nome utente già esistente (vincolo unique, righe 184-188)")
    void testRegistrazioneNomeGiaEsistente() throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        long timestamp = System.currentTimeMillis();
        String telefonoNuovo = "3" + String.format("%09d", timestamp % 1_000_000_000L);

        String body = "nome=" + URLEncoder.encode(USER_TEST, StandardCharsets.UTF_8)
                + "&password=" + URLEncoder.encode("altrapassword123", StandardCharsets.UTF_8)
                + "&numero=" + URLEncoder.encode(telefonoNuovo, StandardCharsets.UTF_8)
                + "&carta=" + URLEncoder.encode("1234567890123456", StandardCharsets.UTF_8);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/registrazione"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());

        assertEquals(409, res.statusCode(), "...");
        assertTrue(res.body().contains("nome utente"), "...");
    }

@Test
@DisplayName("Registrazione con numero di telefono non valido (errore di validazione Mongoose, righe 191-194)")
void testRegistrazioneTelefonoNonValido() throws Exception {
    HttpClient client = HttpClient.newHttpClient();
    long timestamp = System.currentTimeMillis();
    String username = "UtenteTelefonoErrato_" + timestamp;

    // Numero volutamente troppo corto (5 cifre invece di 10): deve far
    // scattare il validator Mongoose sul campo 'numero', non il vincolo unique.
    String body = "nome=" + URLEncoder.encode(username, StandardCharsets.UTF_8)
            + "&password=" + URLEncoder.encode("password123", StandardCharsets.UTF_8)
            + "&numero=" + URLEncoder.encode("12345", StandardCharsets.UTF_8)
            + "&carta=" + URLEncoder.encode("1234567890123456", StandardCharsets.UTF_8);

    HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL + "/registrazione"))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();
    HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());

    assertEquals(400, res.statusCode(), "Il server doveva rifiutare un numero di telefono malformato con status 400.");
    assertTrue(res.body().contains("10 cifre"), "Il messaggio di errore doveva indicare il vincolo sulle 10 cifre.");
    System.out.println("[TEST SUPERATO] Registrazione con numero di telefono non valido correttamente rifiutata (400).");
}
}


}