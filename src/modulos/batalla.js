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
        logBatalla.push(`⚔️ Atacas al ${enemigo.nombre} y le haces ${ataqueJugador} daño.`);
        if (vidaEnemigo <= 0) break;

        // Turno Enemigo
        let danoRecibido = enemigo.ataque - defensaJugador;
        if (danoRecibido < 0) danoRecibido = 0; 
        vidaJugador -= danoRecibido;
        logBatalla.push(`🛡️ ${enemigo.nombre} ataca. Recibes ${danoRecibido} daño.`);
    }

    if (vidaJugador > 0) {
        // GANAMOS
        let puntos = 100 + enemigo.ataque; // Por cada enemigo derrotado 100 puntos mas el ataque del enemigo
        
        let oroGanado = 0;
        if (enemigo instanceof Jefe) {
            puntos = puntos * enemigo.multiplicador;
            oroGanado = 10; 
        } else {
            oroGanado = 5; 
        }
        
        puntos = Math.round(puntos);

        return {
            ganador: jugador.nombre,
            log: logBatalla,
            puntos: puntos,
            oroGanado: oroGanado,
            jugadorGana: true
        };
    } else {
        // PERDIMOS
        return {
            ganador: enemigo.nombre,
            log: logBatalla,
            puntos: 0,
            oroGanado: 0,
            jugadorGana: false
        };
    }
}