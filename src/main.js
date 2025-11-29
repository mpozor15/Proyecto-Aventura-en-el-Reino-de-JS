import { showScene } from './utils.js';
import { Jugador } from './clases/jugador.js';
import { renderizarMercado } from './modulos/mercado.js';
import { PUNTUACION_BASE, VIDA_MAXIMA } from './constants.js';

// --- 1. ESTADO GLOBAL ---
// Creamos al jugador aquí para que exista durante todo el juego
const jugador = new Jugador("Cazador", "assets/prota.png", PUNTUACION_BASE, VIDA_MAXIMA);

document.addEventListener('DOMContentLoaded', () => {

    // Inicializamos los números de la pantalla (ponemos todo a 0 o al valor base)
    actualizarEstadisticasUI(); 

    // --- 2. NAVEGACIÓN Y EVENTOS ---

    // BOTÓN: De la pantalla inicial al Mercado
    const btnMercado = document.getElementById('btn-mercado');
    if(btnMercado) {
        btnMercado.addEventListener('click', () => {
            cargarMercado(); // Carga los productos antes de cambiar de escena
            showScene('pantalla-mercado');
        });
    }

    // Boton: Del Mercado a ver las Estadisticas Actualizadas
    const btnA = document.getElementById('btn-a');
    if(btnA) {
        btnA.addEventListener('click', () => {
            actualizarEstadisticasUI(); // Recalcula ataque/defensa con lo comprado
            pintarInventario();         // Pinta los cuadraditos de los objetos
            showScene('pantalla-estadisticas-a');
        });
    }

    // Boton: De Estadisticas Actualizadas a Enemigos
    const btnEnemigos = document.getElementById('btn-enemigos');
    if(btnEnemigos) {
        btnEnemigos.addEventListener('click', () => {
            showScene('pantalla-enemigos');
            // cargarEnemigos()
        });
    }

    // Boton: De Enemigos a Batallas
    const btnBatalla = document.getElementById('btn-batallas');
    if(btnBatalla) {
        btnBatalla.addEventListener('click', () => {
            showScene('pantalla-batallas');
        });
    }

    // Boton: De Batallas al Final
    const btnFinal = document.getElementById('btn-final');
    if(btnFinal) {
        btnFinal.addEventListener('click', () => {
            showScene('pantalla-final');
        });
    }

    // Boton: Reiniciar juego
    const btnReiniciar = document.getElementById('btn-reiniciar');
    if(btnReiniciar) {
        btnReiniciar.addEventListener('click', () => {
            location.reload(); // Recarga la página completa
        });
    }
});


// --- 3. Funciones Logicas ---

/**
 * Recorre todas las cajas de estadísticas del HTML y pone los valores reales del jugador.
 * Usa los métodos de la clase Jugador (obtenerAtaqueTotal, etc)
 */
function actualizarEstadisticasUI() {
    const ataque = jugador.obtenerAtaqueTotal();
    const defensa = jugador.obtenerDefensaTotal();
    const vida = jugador.obtenerVidaTotal();
    const puntos = jugador.puntos;

    // Usamos querySelectorAll porque hay varias pantallas con estos datos
    document.querySelectorAll('#ataque').forEach(el => el.textContent = ataque);
    document.querySelectorAll('#defensa').forEach(el => el.textContent = defensa);
    document.querySelectorAll('#vida').forEach(el => el.textContent = vida);
    document.querySelectorAll('#puntos').forEach(el => el.textContent = puntos);
}

/**
 * Carga el mercado y gestiona la compra/devolución
 */
function cargarMercado() {
    const contenedorMercado = document.querySelector('.mercado .articulos');
    
    renderizarMercado(contenedorMercado, jugador.inventario, (producto, botonHTML, cajaHTML) => {
        
        if (jugador.tieneObjeto(producto.nombre)) {
            // CASO: DEVOLVER (RETIRAR)
            jugador.eliminarDelInventario(producto.nombre);

            // Visual del botón
            botonHTML.textContent = "Añadir";
            botonHTML.style.backgroundColor = ""; 
            
            // Quitamos el fondo amarillo
            cajaHTML.classList.remove('comprado');
            cajaHTML.classList.add('retirado');

        } else {
            // Comprar
            const nuevoItem = producto.clonar();
            jugador.agregarInventario(nuevoItem);

            // Visual del botón
            botonHTML.textContent = "Retirar";
            botonHTML.style.backgroundColor = "salmon"; 
            
            // Ponemos el fondo amarillo
            cajaHTML.classList.add('comprado');
            cajaHTML.classList.remove('retirado');
        }
        
        pintarInventario();
    });
}

/**
 * Dibuja los iconos de los objetos comprados en las cajas de abajo
 */
function pintarInventario() {
    // Buscamos todos los contenedores de compras (hay uno en cada section)
    const contenedores = document.querySelectorAll('.compras-p .compras');

    contenedores.forEach(contenedor => {
        contenedor.innerHTML = ''; // Borramos lo anterior
        
        jugador.inventario.forEach(item => {
            // Creamos un div cuadradito
            const div = document.createElement('div');
            div.className = 'obj';
            
            // Le ponemos la imagen del objeto de fondo
            div.style.backgroundImage = `url(${item.imagen})`;
            div.style.backgroundSize = 'contain';
            div.style.backgroundRepeat = 'no-repeat';
            div.style.backgroundPosition = 'center';
            
            contenedor.appendChild(div);
        });
    });
}