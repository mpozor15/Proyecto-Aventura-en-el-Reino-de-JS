import { Jefe } from '../clases/enemigo.js';

export function simularCombate(jugador, enemigo) {
    let logBatalla = []; 
    let vidaJugador = jugador.obtenerVidaTotal();
    let vidaEnemigo = enemigo.vida;
    const defensaJugador = jugador.obtenerDefensaTotal();
    const ataqueJugador = jugador.obtenerAtaqueTotal();

    while (vidaJugador > 0 && vidaEnemigo > 0) {
        // Turno Jugador
        vidaEnemigo -= ataqueJugador;
        if (vidaEnemigo <= 0) break;

        // Turno Enemigo
        let danoRecibido = enemigo.ataque - defensaJugador;
        if (danoRecibido < 0) danoRecibido = 0;
        vidaJugador -= danoRecibido;
    }

    if (vidaJugador > 0) {

        let puntos = 100 + enemigo.ataque; 
        
        // Si es Jefe, multiplicamos
        if (enemigo instanceof Jefe) {
            puntos = puntos * enemigo.multiplicador;
        }
        
        // Redondeamos por si el multiplicador crea decimales
        puntos = Math.round(puntos);

        return {
            ganador: jugador.nombre,
            log: logBatalla,
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