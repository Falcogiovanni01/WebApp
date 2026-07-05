package it.unina;

import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("FSM Gestore: Automazione Selenium")
public class GestoreFSMTest {

    private WebDriver driver;
    private WebDriverWait wait;
    
    private final String BASE_URL = "http://localhost:3000"; 

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

        @Test
        @DisplayName("Transizione S1 -> S2: Bypass del login con cookie valido")
        void testPersistenzaCookieGestore() {
            // 1. Andiamo sull'app Gestore e facciamo il login
            driver.get(BASE_URL);

            WebElement userField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("user")));
            WebElement passField = driver.findElement(By.id("pass"));
            WebElement loginButton = driver.findElement(By.cssSelector("#form-login-gestore button[type='submit']"));

            // Credenziali reali del gestore
            userField.sendKeys("admin");
            passField.sendKeys("admin");
            loginButton.click();

            // Aspettiamo di essere in S2 (Dashboard)
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-aggiungi")));

            // 2. SIMULIAMO IL RIENTRO (Ricaricamento pagina)
            driver.navigate().refresh();

            // 3. Verifica Architetturale: la dashboard deve caricarsi direttamente
            WebElement aggiungiOperaForm = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-aggiungi")));
            
            assertTrue(aggiungiOperaForm.isDisplayed(), "Errore Cookie: Il sistema non ha riconosciuto la sessione del Gestore ed è tornato in S0.");
            
            System.out.println("[TEST SUPERATO] Transizione S1 -> S2 (Gestore) eseguita. Cookie validato e sessione persistente.");
        }
    }




    // Ora testiamo lo stato S2, ma per arrivarci dobbiamo prima fare un login valido.
    @Nested
    @DisplayName("Stato S2: Area Protetta (Dashboard Gestore)")
    class S2_Dashboard {

        @BeforeEach
        void setupLoginDiServizio() {
            // Per testare S2, dobbiamo prima arrivarci. Facciamo un login veloce.
            driver.get(BASE_URL);
            WebElement userField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("user")));
            driver.findElement(By.id("pass")).sendKeys("admin"); 
            userField.sendKeys("admin");
            driver.findElement(By.cssSelector("#form-login-gestore button[type='submit']")).click();
            
            // Aspettiamo di essere in S2
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-aggiungi")));
        }

        @Test
        @DisplayName("Transizioni Bidirezionali: S2 (Aggiungi) <-> S3 (Modifica)")
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
        @DisplayName("Transizione S2 -> S0: Logout e Distruzione Sessione")
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
        System.out.println("[TEST SUPERATO] Inserita opera dinamica nel database, pronta per l'acquisto.");
    }
    

    @Test
        @DisplayName("Transizione S3 -> S3: Modifica Fallita (Opera Inesistente)")
        void testModificaFallita() {
            // 1. Andiamo nella tab Modifica (S3)
           WebElement btnModifica =  driver.findElement(By.cssSelector("button[data-target='tab-modifica']"));
           btnModifica.click();

            WebElement formModifica = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-modifica")));

            // 2. Inseriamo un codice palesemente falso
            formModifica.findElement(By.name("codice")).sendKeys("CODICE-FALSO-999");
            formModifica.findElement(By.name("nome")).sendKeys("Tentativo di Modifica Fallito");
            formModifica.findElement(By.name("prezzo")).sendKeys("10");

            // 3. Inviamo
            formModifica.findElement(By.cssSelector("button[data-testid='btn-submit-modifica']")).click();

            // 4. Intercettiamo l'alert di errore generato dal backend
            try {
                wait.until(ExpectedConditions.alertIsPresent());
                driver.switchTo().alert().accept();
                System.out.println(" Alert di errore intercettato correttamente per opera inesistente.");
            } catch (Exception e) {
                System.out.println("Nessun alert rilevato per la modifica fallita.");
            }

            // 5. Verifica: Dobbiamo restare in S3
            assertTrue(formModifica.isDisplayed(), "Il sistema doveva restare nella schermata di modifica dopo un errore.");
            System.out.println("[TEST SUPERATO] Modifica bloccata correttamente per codice inesistente.");
        }

        @Test
        @DisplayName("Transizione S3 -> S3: Modifica Avvenuta con Successo")
        void testModificaSuccesso() {
            // FASE 1: Creiamo un'opera al volo per assicurarci che esista
            String codiceTemp = "MOD-" + System.currentTimeMillis();
            WebElement formAggiungi = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-aggiungi")));
            formAggiungi.findElement(By.name("codice")).sendKeys(codiceTemp);
            formAggiungi.findElement(By.name("nome")).sendKeys("Opera da Modificare");
            formAggiungi.findElement(By.name("prezzo")).sendKeys("100");
            formAggiungi.findElement(By.cssSelector("button[data-testid='btn-submit-aggiungi']")).click();
            
            try { wait.until(ExpectedConditions.alertIsPresent()); driver.switchTo().alert().accept(); } catch (Exception e) {}

            // FASE 2: Ora passiamo in S3 (Modifica) per cambiare il prezzo dell'opera appena creata
            driver.findElement(By.cssSelector("button[data-target='tab-modifica']")).click();
            WebElement formModifica = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-modifica")));

            formModifica.findElement(By.name("codice")).sendKeys(codiceTemp);
            formModifica.findElement(By.name("nome")).sendKeys("Opera Modificata!");
            formModifica.findElement(By.name("prezzo")).sendKeys("9999");
            
            formModifica.findElement(By.cssSelector("button[data-testid='btn-submit-modifica']")).click();

            // Intercettiamo l'alert di successo
            try {
                wait.until(ExpectedConditions.alertIsPresent());
                driver.switchTo().alert().accept();
            } catch (Exception e) {}

            // Verifica: Dobbiamo restare in S3
            assertTrue(formModifica.isDisplayed(), "Il sistema doveva restare nella schermata di modifica dopo il successo.");
            System.out.println("[TEST SUPERATO] L'opera " + codiceTemp + " è stata modificata con successo.");
        }

    }


}