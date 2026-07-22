package it.unina.fsm;

import org.junit.jupiter.api.extension.AfterAllCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Registrata con @ExtendWith sulla classe di test più esterna. Grazie
 * all'ereditarietà delle estensioni in JUnit 5, si applica automaticamente
 * anche a tutte le @Nested class contenute, senza doverla ripetere.
 *
 * Funzionamento:
 * 1) testSuccessful(): ogni volta che un @Test annotato con @Transizione
 *    termina con SUCCESSO, le sue transizioni vengono aggiunte a un
 *    accumulatore statico (CLIENTE o GESTORE, deciso leggendo @CoperturaFSM).
 * 2) afterAll(): scatta per ogni nested class E per la classe esterna.
 *    Stampiamo il report SOLO quando scatta per la classe esterna (quella
 *    senza enclosing class), perché JUnit esegue gli afterAll delle nested
 *    class prima di quello della classe che le contiene: a quel punto tutti
 *    i test della suite sono già stati eseguiti.
 *
 * Nota sugli accumulatori statici: sono statici (e non stato d'istanza)
 * perché JUnit può creare un'istanza diversa dell'extension per ogni nested
 * class attraversata; usare campi statici garantisce che il conteggio sia
 * condiviso e coerente su tutta la suite, indipendentemente da quante volte
 * l'extension viene istanziata.
 */
public class CoperturaFSMExtension implements TestWatcher, AfterAllCallback {

    private static final Set<String> coperteCliente = Collections.synchronizedSet(new LinkedHashSet<>());
    private static final Set<String> coperteGestore = Collections.synchronizedSet(new LinkedHashSet<>());

    @Override
    public void testSuccessful(ExtensionContext context) {
        context.getTestMethod().ifPresent(method -> {
            Transizione annotazione = method.getAnnotation(Transizione.class);
            if (annotazione == null) {
                return; // test senza @Transizione: non contribuisce alla copertura
            }

            Fsm fsm = risolviFsm(context);
            Set<String> destinazione = (fsm == Fsm.GESTORE) ? coperteGestore : coperteCliente;
            destinazione.addAll(Arrays.asList(annotazione.value()));
        });
    }

    private Fsm risolviFsm(ExtensionContext context) {
        Class<?> corrente = context.getRequiredTestClass();
        while (corrente != null) {
            CoperturaFSM annotazione = corrente.getAnnotation(CoperturaFSM.class);
            if (annotazione != null) {
                return annotazione.value();
            }
            corrente = corrente.getEnclosingClass();
        }
        // Fallback difensivo: se manca @CoperturaFSM sulla classe esterna,
        // il report andrà
        // verificato manualmente in quel caso.
        return Fsm.CLIENTE;
    }

    @Override
    public void afterAll(ExtensionContext context) {
        Class<?> testClass = context.getRequiredTestClass();
        if (testClass.getEnclosingClass() != null) {
            return; // non è la classe esterna: aspettiamo il suo afterAll
        }

        CoperturaFSM annotazione = testClass.getAnnotation(CoperturaFSM.class);
        if (annotazione == null) {
            return;
        }

        if (annotazione.value() == Fsm.GESTORE) {
            stampaReport("GESTORE", TransizioniAttese.GESTORE, coperteGestore);
        } else {
            stampaReport("CLIENTE", TransizioniAttese.CLIENTE, coperteCliente);
        }
    }

    private void stampaReport(String nomeFsm, Set<String> attese, Set<String> coperte) {
        Set<String> mancanti = new LinkedHashSet<>(attese);
        mancanti.removeAll(coperte);

        Set<String> extra = new LinkedHashSet<>(coperte);
        extra.removeAll(attese);

        int totale = attese.size();
        int copertiCount = totale - mancanti.size();
        double percentuale = totale == 0 ? 0.0 : (100.0 * copertiCount / totale);

        System.out.println();
        System.out.println("========================================");
        System.out.println("REPORT COPERTURA FSM - " + nomeFsm);
        System.out.println("========================================");
        System.out.printf("Transizioni coperte: %d/%d (%.1f%%)%n", copertiCount, totale, percentuale);

        if (mancanti.isEmpty()) {
            System.out.println("Tutte le transizioni attese risultano coperte da almeno un test superato.");
        } else {
            System.out.println("Transizioni NON coperte:");
            for (String t : mancanti) {
                System.out.println("  - " + t);
            }
        }

        if (!extra.isEmpty()) {
            System.out.println("Transizioni annotate ma assenti da TransizioniAttese (verifica il file, potrebbe mancare un arco o esserci un refuso):");
            for (String t : extra) {
                System.out.println("  - " + t);
            }
        }
        System.out.println("========================================");
        System.out.println();
    }
}