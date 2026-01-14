import { Jefe } from '../clases/enemigo.js';

/**
 * Simula el combate turno por turno
 */
export function simularCombate(jugador, enemigo) {
    let logBatalla = []; // El array donde guardamos el texto
    let vidaJugador = jugador.obtenerVidaTotal();
    let vidaEnemigo = enemigo.vida;
    const defensaJugador = jugador.obtenerDefensaTotal();
    const ataqueJugador = jugador.obtenerAtaqueTotal();

    // Bucle: Mientras los dos sigan vivos...
    while (vidaJugador > 0 && vidaEnemigo > 0) {
        
        // 1. Turno del Jugador
        vidaEnemigo -= ataqueJugador;
        
        // --- ESTA LÍNEA FALTABA: Escribimos en el log ---
        logBatalla.push(`⚔️ Atacas al ${enemigo.nombre} y le haces ${ataqueJugador} daño.`);

        if (vidaEnemigo <= 0) break; // Si muere, se acaba el combate aquí

        // 2. Turno del Enemigo
        let danoRecibido = enemigo.ataque - defensaJugador;
        if (danoRecibido < 0) danoRecibido = 0; 

        vidaJugador -= danoRecibido;
        
        // --- ESTA LÍNEA TAMBIÉN FALTABA ---
        logBatalla.push(`🛡️ ${enemigo.nombre} ataca. Recibes ${danoRecibido} daño.`);
    }

    // --- RESULTADO ---
    if (vidaJugador > 0) {
        // GANAMOS
        
        // Cálculo de puntos corregido (100 base + ataque enemigo)
        let puntos = 100 + enemigo.ataque; 
        
        if (enemigo instanceof Jefe) {
            puntos = puntos * enemigo.multiplicador;
        }
        
        puntos = Math.round(puntos);

        return {
            ganador: jugador.nombre,
            log: logBatalla, // Ahora este array SÍ tiene texto
            puntos: puntos,
            jugadorGana: true
        };
    } else {
        // PERDIMOS
        return {
            ganador: enemigo.nombre,
            log: logBatalla,
            puntos: 0,
            jugadorGana: false
        };
    }
}