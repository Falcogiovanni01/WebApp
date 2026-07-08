package it.unina.fsm;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Da mettere sulla classe di test PIU' ESTERNA (es. ClienteFSMTest,
 * GestoreFSMTest) per dichiarare a quale FSM appartiene l'intera suite.
 *
 * Esempio:
 *
 *   @CoperturaFSM(Fsm.CLIENTE)
 *   public class ClienteFSMTest { ... }
 *
 * CoperturaFSMExtension risale la gerarchia delle @Nested class fino a
 * trovare questa annotazione, per sapere se accumulare le transizioni
 * coperte nel bucket CLIENTE o in quello GESTORE.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface CoperturaFSM {
    Fsm value();
}