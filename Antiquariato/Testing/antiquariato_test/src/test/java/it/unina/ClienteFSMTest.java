package it.unina;

import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("FSM Cliente: Automazione Selenium")
public class ClienteFSMTest {

    private WebDriver driver;
    private WebDriverWait wait;
    
    // Porta del server Cliente
    private final String BASE_URL = "http://localhost:3001"; 
    
    // Inserisci qui le credenziali fisse del tuo utente di test nel DB
    private final String USER_TEST = "PROVA UTENTE";
    private final String PASS_TEST = "Prov@1000";

    // DA NOTARE IL PUNTO 2 E IL PUNTO 3 SONO STATI NECESSARI AI FINI DI UNA MIGLIORE ESPERIENZA DI TESTING AUTOMATIZZATO CON CHROME DRIVER
    // LA loro assenza generava un errore 
    @BeforeAll
    void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");
        // 2. Disattiva il pop-up "Vuoi salvare la password?" e l'autofill
        java.util.Map<String, Object> prefs = new java.util.HashMap<>();
        prefs.put("credentials_enable_service", false);
        prefs.put("profile.password_manager_enabled", false);
        options.setExperimentalOption("prefs", prefs);
        
        // 3. Nasconde la fastidiosa barra "Chrome è controllato da un software automatizzato"
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

    // --- METODI HELPER (DRY) ---

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


    // --- SUITE DI TEST ---
    // NOTA : AGGIUNGERE REGISTRAIONE !!!!!!! 
    @Nested
    @DisplayName("Stato S0 e S3: Accesso e Registrazione")
    class S0_S3_AccessoPubblico {

        @BeforeEach
        void setup() {
            svuotaSessioneTotale();
        }

        @Test
        @DisplayName("Transizione S0 -> S3 -> S0: Navigazione Form")
        void testNavigazioneRegistrazione() {
            WebElement btnVaiRegistrazione = wait.until(ExpectedConditions.elementToBeClickable(By.id("link-show-register")));
            btnVaiRegistrazione.click();

            WebElement formRegistrazione = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-register")));
            assertTrue(formRegistrazione.isDisplayed(), "Il sistema doveva passare allo stato S3 (Registrazione).");

            WebElement btnTornaLogin = driver.findElement(By.id("link-show-login"));
            btnTornaLogin.click();

            WebElement formLogin = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-login")));
            assertTrue(formLogin.isDisplayed(), "Il sistema doveva tornare allo stato S0 (Login).");
            System.out.println(" [TEST SUPERATO] Navigazione tra Login e Registrazione confermata.");
        }

        @Test
        @DisplayName("Transizione S0 -> S0: Credenziali Errate (Negative Path)")
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

        @Test
        @DisplayName("Transizione S3 -> S0: Registrazione Avvenuta con Successo")
        void testRegistrazioneSuccesso() {
            driver.get(BASE_URL);
            // 1. Vai in S3
            driver.findElement(By.id("link-show-register")).click();
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-register")));

            // 2. Generiamo dati casuali per evitare conflitti con utenti già esistenti
            String username = "NuovoUtente_" + System.currentTimeMillis();
            
            // 3. Compiliamo il form di registrazione
            driver.findElement(By.cssSelector("input[data-testid='reg-username']")).sendKeys(username);
            driver.findElement(By.cssSelector("input[data-testid='reg-password']")).sendKeys("password123");
            driver.findElement(By.cssSelector("input[data-testid='reg-phone']")).sendKeys("3330001122");
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
            
            System.out.println("[TEST SUPERATO] Registrazione completata per l'utente: " + username);
        }

    @Test
    @DisplayName("S3: Registrazione con campi vuoti (Negative Path)")
    void testRegistrazioneCampiVuoti() {
        driver.get(BASE_URL);
        driver.findElement(By.id("link-show-register")).click();
        
        // Non inviamo alcun dato, clicchiamo solo submit
        driver.findElement(By.cssSelector("button[data-testid='reg-submit']")).click();

        // Se il tuo HTML ha l'attributo 'required', il browser dovrebbe bloccare il submit.
        // Se il submit passa lo stesso, il test fallirà correttamente segnalando una falla di sicurezza.
        // Puoi verificare se sei rimasto bloccato in S3 (form ancora visibile)
        WebElement formRegistrazione = driver.findElement(By.id("form-register"));
        assertTrue(formRegistrazione.isDisplayed(), "Il form doveva rimanere visibile perché la registrazione non doveva passare.");
    }


    }


    @Nested
    @DisplayName("Stato S1: Check Session e Persistenza")
    class S1_VerificaSessione {

        @Test
        @DisplayName("Transizione S1 -> S2: Bypass del login con cookie/storage validi")
        void testPersistenzaSessione() {
            eseguiLoginDiSupporto();

            // SIMULIAMO L'USCITA E IL RIENTRO (Ricaricamento)
            driver.navigate().refresh();

            // L'app deve saltare S0 e mostrare subito la dashboard (S2)
            WebElement appContainer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("main-app-container")));
            assertTrue(appContainer.isDisplayed(), "Errore: Il sistema non ha riconosciuto la sessione attiva ed è tornato al login.");
            System.out.println(" [TEST SUPERATO] Persistenza della sessione confermata dopo ricaricamento della pagina.");
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
        void testAggiungiERimuoviCarrello() {
            // --- FASE DI PRE-PULIZIA (Garantisce l'isolamento del test) ---
            driver.findElement(By.cssSelector("button[data-target='tab-carrello']")).click();
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-carrello")));
            
            // Se ci sono già opere nel carrello, rimuoviamole tutte cliccando in loop
            java.util.List<WebElement> bottoniRimuovi = driver.findElements(By.xpath("//button[contains(text(), 'Rimuovi')]"));
            for (int i = 0; i < bottoniRimuovi.size(); i++) {
                wait.until(ExpectedConditions.elementToBeClickable(By.xpath("(//button[contains(text(), 'Rimuovi')])[1]"))).click();
                // Breve pausa per permettere al fetch di Node.js di aggiornare il DOM
                try { Thread.sleep(300); } catch (Exception e) {} 
            }
            
            // Torniamo al catalogo per iniziare il test vero e proprio
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

            // 4. Ora siamo certi che il carrello scenda a ZERO. Il bottone deve sparire.
            Boolean isCartEmpty = wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("btn-acquista")));
            assertTrue(isCartEmpty, "L'opera non è stata rimossa correttamente o c'erano residui.");
            System.out.println("✅ [TEST SUPERATO] Rimozione dal carrello completata (con pulizia preventiva).");
        }

        @Test
        @DisplayName("Flusso End-to-End: S2 -> S4 -> Acquisto Definitivo")
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
            System.out.println("[TEST SUPERATO] Flusso di acquisto completato con successo.");
        }

        @Test
        @DisplayName("Transizione S2/S4 -> S0: Logout Cliente")
        void testLogoutCliente() {
            WebElement logoutButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-logout")));
            logoutButton.click();

            WebElement authContainer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("auth-container")));
            assertTrue(authContainer.isDisplayed(), "Il sistema doveva distruggere la sessione e tornare in S0.");
        }
    }
}