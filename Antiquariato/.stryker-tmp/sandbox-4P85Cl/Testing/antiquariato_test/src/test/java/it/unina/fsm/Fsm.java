package it.unina.fsm;

/**
 * Identifica a quale delle due FSM del progetto (Cliente o Gestore)
 * appartiene una classe di test, per sapere contro quale lista di
 * transizioni attese calcolare la copertura.
 */
public enum Fsm {
    CLIENTE,
    GESTORE
}