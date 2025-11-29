import { Enemigo, Jefe } from '../clases/enemigo.js';

export const listaEnemigos = [
    new Enemigo("Goblin", "assets/goblin.png", 8, 40),
    new Enemigo("Lobo", "assets/lobo.png", 9, 50),
    new Enemigo("Bandido", "assets/bandido.png", 12, 60),
    new Jefe("Dragón", "assets/dragon.png", 28, 150, 1.5) 
];

/**
 * Pinta la lista de enemigos en el HTML (Solo visualización, SIN botones)
 */
export function renderizarEnemigos(contenedor, callbackSeleccion) {
    contenedor.innerHTML = '';

    listaEnemigos.forEach(enemigo => {
        const div = document.createElement('div');
        div.className = 'caja3';
        
        // Etiqueta especial si es Jefe
        let etiqueta = "";
        if (enemigo instanceof Jefe) {
            etiqueta = '<br><span style="color:red; font-weight:bold; font-size:0.8em;">(JEFE FINAL)</span>';
        }

        // Pintamos imagen y textos
        div.innerHTML = `
            <img src="${enemigo.imagen}" alt="${enemigo.nombre}" />
            <h3>${enemigo.nombre} ${etiqueta}</h3>
            <p>Ataque: ${enemigo.ataque}</p>
            <p>Vida: ${enemigo.vida}</p>
        `;

        contenedor.appendChild(div);
    });
}