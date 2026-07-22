package it.unina.fsm;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Dichiara quali transizioni della FSM (formato "SORGENTE->DESTINAZIONE",
 * es. "S0->S1") sono esercitate da un metodo @Test.
 *
 * Un singolo test può coprire più archi in sequenza: es. un login riuscito
 * copre sia S0->S1 che S1->S2.
 *
 * L'annotazione viene letta da CoperturaFSMExtension SOLO se il test termina
 * con successo (vedi TestWatcher#testSuccessful): una transizione "coperta"
 * significa quindi che il test che la esercita è passato, non solo che è
 * stato eseguito.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Transizione {
    String[] value();
}