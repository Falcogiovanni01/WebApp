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
@DisplayName("FSM Cliente: Automazione Selenium")
public class ClienteFSMTest {

    private WebDriver driver;
    private WebDriverWait wait;
    
    // ATTENZIONE: Il Gestore era sulla 3000. Inserisci qui la porta su cui gira il server Cliente!
    private final String BASE_URL = "http://localhost:3001"; 

    @BeforeAll
    void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");
        
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterAll
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

  @Nested
    @DisplayName("Stati S0 e S3: Accesso e Registrazione")
    class S0_S3_AccessoPubblico {

        @Test
        @DisplayName("Transizione S0 -> S3 -> S0: Navigazione Form")
        void testNavigazioneRegistrazione() {
            driver.get(BASE_URL);
            // 1. Dallo stato S0 (Login), andiamo in S3 (Registrazione)
            WebElement btnVaiRegistrazione = wait.until(ExpectedConditions.elementToBeClickable(By.id("link-show-register")));
            btnVaiRegistrazione.click();

            // 2. Verifica Architetturale: Deve apparire il form S3
            WebElement formRegistrazione = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-register")));
            assertTrue(formRegistrazione.isDisplayed(), "Il sistema doveva passare allo stato S3 (Registrazione).");
            System.out.println("[TEST SUPERATO] Transizione S0 -> S3 eseguita. Form registrazione visibile.");

            // 3. Da S3 torniamo a S0
            WebElement btnTornaLogin = driver.findElement(By.id("link-show-login"));
            btnTornaLogin.click();

            // 4. Verifica Architetturale: Deve riapparire il form S0
            WebElement formLogin = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("form-login")));
            assertTrue(formLogin.isDisplayed(), "Il sistema doveva tornare allo stato S0 (Login).");
            System.out.println("[TEST SUPERATO] Transizione S3 -> S0 eseguita. Ritorno al login.");
        }
    }

    // Strutturiamo il test esattamente come il diagramma a stati
    @Nested
    @DisplayName("Stato S0: Autenticazione Cliente")
    class S0_Login_Cliente {

        @Test
        @DisplayName("Transizione S0 -> S0: Credenziali Errate")
        void testLoginFallito() {
            driver.get(BASE_URL);

            // Usiamo i tuoi selettori data-testid, sono perfetti per il testing
            WebElement userField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[data-testid='login-username']")));
            WebElement passField = driver.findElement(By.cssSelector("input[data-testid='login-password']"));
            WebElement loginButton = driver.findElement(By.cssSelector("button[data-testid='login-submit']"));

            // Tentativo con utente inventato
            userField.sendKeys("utente_inesistente o password_sbagliata");
            passField.sendKeys("password_sbagliata");
            loginButton.click();

            // Verifica: L'utente deve rimanere bloccato in S0 (il form di login resta visibile)
            assertTrue(userField.isDisplayed(), "Il sistema doveva restare in S0 a causa di credenziali errate.");
            System.out.println("[TEST SUPERATO] Login fallito gestito correttamente. Nessun accesso non autorizzato.");
        }

        @Test
        @DisplayName("Transizione S0 -> S1 -> S2: Login Valido (Accesso Catalogo)")
        void testLoginSuccesso() {
            driver.get(BASE_URL);

            WebElement userField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[data-testid='login-username']")));
            WebElement passField = driver.findElement(By.cssSelector("input[data-testid='login-password']"));
            WebElement loginButton = driver.findElement(By.cssSelector("button[data-testid='login-submit']"));

            // INSERISCI QUI LE CREDENZIALI DI UN TUO CLIENTE REALE PRESENTE NEL DATABASE
            userField.sendKeys("Gio");
            passField.sendKeys("1234");
            loginButton.click();

            // Verifica Architetturale: Deve apparire il container principale dell'app (Stato S2)
            WebElement appContainer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("main-app-container")));
            assertTrue(appContainer.isDisplayed(), "Il sistema doveva passare allo stato S2 (Catalogo/Carrello).");
            
            System.out.println("[TEST SUPERATO] Transizione S0 -> S2 eseguita. Accesso all'area privata consentito.");
        }
    }

    @Nested
    @DisplayName("Stato S1: Check Session e Persistenza Cookie")
    class S1_VerificaSessione {

        @Test
        @DisplayName("Transizione S1 -> S2: Bypass del login con cookie valido")
        void testPersistenzaCookie() {
            // 1. Entriamo nell'app e facciamo un login iniziale per generare il cookie
            driver.get(BASE_URL);

            WebElement userField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[data-testid='login-username']")));
            WebElement passField = driver.findElement(By.cssSelector("input[data-testid='login-password']"));
            WebElement loginButton = driver.findElement(By.cssSelector("button[data-testid='login-submit']"));

            // INSERISCI QUI LE CREDENZIALI DEL TUO CLIENTE REALE
            userField.sendKeys("Gio");
            passField.sendKeys("1234");
            loginButton.click();

            // Aspettiamo che il container dell'app sia visibile per confermare il login
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("main-app-container")));

            // 2. SIMULIAMO L'USCITA E IL RIENTRO (Ricaricamento della pagina principale)
            // Questo costringe Chrome a interrogare di nuovo il tuo server Node.js inviando il cookie
            driver.navigate().refresh();

            // 3. Verifica Architetturale (S1 -> S2)
            // Dopo il refresh, il container principale deve tornare visibile IMMEDIATAMENTE, senza form.
            WebElement appContainer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("main-app-container")));
            
            assertTrue(appContainer.isDisplayed(), "Errore Cookie: Il sistema non ha riconosciuto la sessione attiva ed è tornato al login.");
            
            // Log visivo di successo
            System.out.println("[TEST SUPERATO] Transizione S1 -> S2 eseguita. Cookie validato e sessione persistente.");
        }
    }

    // Ora testiamo lo stato S2, ma per arrivarci dobbiamo prima fare un login valido.
    // questo test è simile a quello del Gestore, ma con le credenziali del Cliente.
    // Nota: S2 per il Cliente è il Catalogo, mentre S2 per il Gestore è la Dashboard.
    // NON ACQUISTA!
    @Nested
    @DisplayName("Stati S2 e S4: Area Privata Cliente")
    class S2_S4_AreaPrivata {

        @BeforeEach
        void setupLoginDiServizioCliente() {
            driver.get(BASE_URL);
            
            // FIX ANTICRASH: Svuotiamo il localStorage e ricarichiamo la pagina 
            // per garantire che l'app parta sempre da S0 (sloggata) per ogni singolo test.
            org.openqa.selenium.JavascriptExecutor js = (org.openqa.selenium.JavascriptExecutor) driver;
            js.executeScript("window.localStorage.clear();");
            driver.navigate().refresh();
            
            WebElement userField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[data-testid='login-username']")));
            WebElement passField = driver.findElement(By.cssSelector("input[data-testid='login-password']"));
            
            // INSERISCI QUI LE CREDENZIALI DEL TUO CLIENTE REALE
            userField.sendKeys("Gio");
            passField.sendKeys("1234");
            
            driver.findElement(By.cssSelector("button[data-testid='login-submit']")).click();
            
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-catalogo")));
        }

        @Test
        @DisplayName("Transizioni Bidirezionali: S2 (Catalogo) <-> S4 (Carrello)")
        void testNavigazioneCatalogoCarrello() {
            WebElement btnCarrello = driver.findElement(By.cssSelector("button[data-target='tab-carrello']"));
            WebElement btnCatalogo = driver.findElement(By.cssSelector("button[data-target='tab-catalogo']"));

            btnCarrello.click();
            WebElement tabCarrello = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-carrello")));
            assertTrue(tabCarrello.isDisplayed(), "Il sistema doveva passare allo stato S4 (Carrello).");
            System.out.println(" [TEST SUPERATO] Transizione S2 -> S4 (Carrello) eseguita.");

            btnCatalogo.click();
            WebElement tabCatalogo = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-catalogo")));
            assertTrue(tabCatalogo.isDisplayed(), "Il sistema doveva tornare allo stato S2 (Catalogo).");
            System.out.println(" [TEST SUPERATO] Transizione S4 -> S2 (Catalogo) eseguita.");
        }
        
        @Test
        @DisplayName("Flusso Completo (End-to-End): S2 -> S4 -> Acquisto")
        void testFlussoAcquisto() {
            // 1. Troviamo il bottone nel catalogo usando XPath
            WebElement btnAggiungi = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(), 'Aggiungi al Carrello')]")
            ));
            btnAggiungi.click();

            // 2. Intercettiamo l'Alert JS
            wait.until(ExpectedConditions.alertIsPresent());
            driver.switchTo().alert().accept();
            System.out.println(" Alert 'Aggiunto al carrello' intercettato e superato.");

            // 3. Spostiamoci nel Carrello
            WebElement btnTabCarrello = driver.findElement(By.cssSelector("button[data-target='tab-carrello']"));
            btnTabCarrello.click();
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-carrello")));

            // 4. Verifichiamo bottone acquista
            WebElement btnAcquista = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("btn-acquista")));
            
            // 5. Acquistiamo
            btnAcquista.click();

            // 6. Secondo Alert JS
            wait.until(ExpectedConditions.alertIsPresent());
            driver.switchTo().alert().accept();
            System.out.println("Alert 'Acquisto confermato' intercettato e superato.");

            // 7. Verifica Svuotamento
            Boolean isCartEmpty = wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("btn-acquista")));
            assertTrue(isCartEmpty, "Errore: Il carrello doveva risultare vuoto dopo la conferma dell'acquisto.");
            
            System.out.println("[TEST SUPERATO] Flusso End-to-End completato: Opera acquistata e carrello svuotato.");
        }

        @Test
        @DisplayName("Transizione S2/S4 -> S0: Logout Cliente e Distruzione Sessione")
        void testLogoutCliente() {
            WebElement logoutButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-logout")));
            logoutButton.click();

            // Controllo più solido: verifichiamo che appaia il contenitore principale di autenticazione
            WebElement authContainer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("auth-container")));
            assertTrue(authContainer.isDisplayed(), "Il sistema doveva distruggere la sessione e tornare in S0.");
            System.out.println("[TEST SUPERATO] Transizione S2/S4 -> S0 eseguita. Logout Cliente completato.");
        }
    }
}