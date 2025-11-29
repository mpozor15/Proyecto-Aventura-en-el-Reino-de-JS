/**
 * Decide el rango del jugador según sus puntos finales.
 * @param {number} puntos - Puntos totales del jugador
 * @returns {string} El rango (Noob, Novato, Veterano, Pro)
 */
export function obtenerRango(puntos) {
    if (puntos < 150) return "Noob";      // Si matas solo al Goblin
    if (puntos < 250) return "Novato";    // Si matas a un par
    if (puntos < 350) return "Veterano";  // Si llegas casi al final
    return "Pro";                         // Si te pasas el juego (matas al Dragón)
}