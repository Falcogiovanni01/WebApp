package it.unina.fsm;

import java.util.Set;

/**
 * Liste ricostruite leggendo direttamente CLIENT.svg e GESTORE.svg (non più
 * per inferenza dai @DisplayName). Ogni arco riporta tra parentesi
 * l'etichetta originale del diagramma, per poterlo ritrovare facilmente.
 *
 * NOTE METODOLOGICHE (decisioni prese col committente del progetto):
 *
 * 1) GESTORE: le transizioni disegnate nel diagramma con etichetta "↔"
 *    (es. "Modifica ↔ Aggiungi") sono state ESPANSE in due archi distinti
 *    (S2->S3 e S3->S2), perché rappresentano due azioni UI realmente
 *    distinte (cliccare la tab A da B, e viceversa), anche se il grafo le
 *    disegna con un'unica linea per compattezza visiva.
 *
 * 2) CLIENTE: il diagramma NON disegna un self-loop S3->S3 (l'unico arco
 *    uscente da S3 è quello di successo verso S0). È stato comunque aggiunto
 *    qui perché il test "Registrazione con campi vuoti" esercita un
 *    comportamento reale del sistema che il diagramma originale non
 *    modellava: consideriamo quindi il diagramma incompleto su questo punto,
 *    non il test fuori standard.
 *
 * 3) GESTORE: gli stati S5.1 (Report Acquisti) e S5.2 (Report Vendite) del
 *    diagramma sono stati collassati in un unico stato S5 in fase di
 *    scrittura del codice: switchare tra i sotto-tab di Report diventa quindi
 *    un self-loop S5->S5.
 *
 * LIMITE NOTO: questo modello identifica un arco solo con la coppia
 * "SORGENTE->DESTINAZIONE", senza distinguere transizioni diverse che
 * condividono le stesse due estremità (es. "S3->S0 per registrazione
 * riuscita" e un ipotetico, futuro "S3->S0 per annullamento" sarebbero la
 * stessa stringa "S3->S0"). Per la granularità di questo progetto va bene,
 * ma è un limite da conoscere se si discute il criterio di copertura.
 */
public final class TransizioniAttese {

    public static final Set<String> CLIENTE = Set.of(
            "S0->S0",   // username o password errati (self-loop)
            "S0->S1",   // username & password validi
            "S0->S3",   // registrazione utente
            "S1->S0",   // cookie non valido
            "S1->S2",   // cookie sessione validato
            "S3->S0",   // registrazione effettuata
            "S3->S3",   // registrazione con campi vuoti (arco aggiunto, assente nel diagramma originale)
            "S2->S0",   // logout da catalogo
            "S2->S2",   // aggiungi al carrello (self-loop)
            "S2->S4",   // visualizza carrello
            "S4->S0",   // logout da carrello
            "S4->S2",   // visualizza opere (torna al catalogo)
            "S4->S4"    // rimuovi items / acquisto opera (self-loop)
    );

    public static final Set<String> GESTORE = Set.of(
            "S0->S0",   // credenziali errate (self-loop)
            "S0->S1",   // credenziali valide
            "S1->S0",   // cookie non valido
            "S1->S2",   // cookie validato

            "S2->S0",   // logout da Aggiungi
            "S3->S0",   // logout da Modifica
            "S4->S0",   // logout da Rimuovi
            "S5->S0",   // logout da Report

            "S2->S2",   // submit aggiungi (self-loop)
            "S3->S3",   // submit modifica (self-loop)
            "S4->S4",   // submit rimuovi (self-loop)
            "S5->S5",   // cambio sotto-tab Acquisti/Vendite (S5.1/S5.2 collassati qui)

            "S2->S3",   // Aggiungi -> Modifica
            "S3->S2",   // Modifica -> Aggiungi
            "S2->S4",   // Aggiungi -> Rimuovi
            "S4->S2",   // Rimuovi -> Aggiungi
            "S2->S5",   // Aggiungi -> Report
            "S5->S2",   // Report -> Aggiungi
            "S3->S4",   // Modifica -> Rimuovi
            "S4->S3",   // Rimuovi -> Modifica
            "S3->S5",   // Modifica -> Report
            "S5->S3",   // Report -> Modifica
            "S4->S5",   // Rimuovi -> Report
            "S5->S4"    // Report -> Rimuovi
    );

    private TransizioniAttese() {}
}