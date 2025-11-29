import { showScene } from './utils.js';
import { Jugador } from './clases/jugador.js';
import { renderizarMercado } from './modulos/mercado.js';
import { PUNTUACION_BASE, VIDA_MAXIMA } from './constants.js';
import { renderizarEnemigos, listaEnemigos } from './modulos/enemigos.js'; // Importamos la lista
import { simularCombate } from './modulos/batalla.js';
import { obtenerRango } from './modulos/ranking.js'; // Importamos el ranking

// --- ESTADO GLOBAL ---
const jugador = new Jugador("Cazador", "assets/prota.png", PUNTUACION_BASE, VIDA_MAXIMA);
let indiceEnemigoActual = 0; // <--- NUEVO: Empezamos por el enemigo 0 (El primero)

document.addEventListener('DOMContentLoaded', () => {

    actualizarEstadisticasUI(); 

    // --- NAVEGACIÓN ---

    // Botón Mercado
    const btnMercado = document.getElementById('btn-mercado');
    if(btnMercado) {
        btnMercado.addEventListener('click', () => {
            cargarMercado();
            showScene('pantalla-mercado');
        });
    }

    // Botón Estadísticas Actualizadas (Tras comprar)
    const btnA = document.getElementById('btn-a');
    if(btnA) {
        btnA.addEventListener('click', () => {
            actualizarEstadisticasUI();
            pintarInventario();
            showScene('pantalla-estadisticas-a');
        });
    }

    // Botón Enemigos (Ver la lista antes de empezar)
    const btnEnemigos = document.getElementById('btn-enemigos');
    if(btnEnemigos) {
        btnEnemigos.addEventListener('click', () => {
            // Solo pintamos la lista para que el jugador sepa a qué se enfrenta
            // Pero quitamos los botones de "Luchar" individuales, porque es secuencial
            const contenedor = document.querySelector('.enemigos .list-e');
            renderizarEnemigos(contenedor, () => {}); // Callback vacío porque no clicamos ahí
            showScene('pantalla-enemigos');
        });
    }

    // BOTÓN: "EMPEZAR TORNEO" (De pantalla Enemigos a Batallas)
    const btnBatalla = document.getElementById('btn-batallas');
    if(btnBatalla) {
        // Le cambiamos el texto visualmente para que tenga sentido
        btnBatalla.textContent = "¡EMPEZAR COMBATES!";
        
        btnBatalla.addEventListener('click', () => {
            indiceEnemigoActual = 0; // Reiniciamos al primer enemigo
            prepararBatalla();       // Función nueva que carga el enemigo que toque
            showScene('pantalla-batallas');
        });
    }

    // BOTÓN DE LA PANTALLA DE BATALLA (Este cambia dinámicamente)
    const btnContinuarBatalla = document.getElementById('btn-final');
    if(btnContinuarBatalla) {
        btnContinuarBatalla.addEventListener('click', () => {
            // Este botón hace cosas distintas según si ganaste o perdiste
            gestionarSiguientePaso(btnContinuarBatalla);
        });
    }

    // Botón Reiniciar
    const btnReiniciar = document.getElementById('btn-reiniciar');
    if(btnReiniciar) {
        btnReiniciar.addEventListener('click', () => location.reload());
    }
});


// Logica De Batalla

function prepararBatalla() {
    // 1. Miramos qué enemigo toca
    if (indiceEnemigoActual >= listaEnemigos.length) {
        mostrarPantallaFinal();
        showScene('pantalla-final');
        return;
    }

    const enemigo = listaEnemigos[indiceEnemigoActual];

    // 2. Pintamos las imágenes
    const imgJugador = document.querySelector('.combate .persona img');
    const imgEnemigo = document.querySelector('.combate .evil img');
    if(imgJugador) imgJugador.src = jugador.imagen;
    if(imgEnemigo) imgEnemigo.src = enemigo.imagen;

    // 3. Simulamos el combate
    const resultado = simularCombate(jugador, enemigo);

    // 4. Mostramos resultados (SOLO GANAR/PERDER Y PUNTOS)
    const cajaRespuesta = document.querySelector('.respuesta');
    
    let mensajeTitulo = "";
    let botonTexto = "";

    if (resultado.jugadorGana) {
        jugador.puntos += resultado.puntos;
        mensajeTitulo = "¡VICTORIA!";
        
        if (indiceEnemigoActual + 1 < listaEnemigos.length) {
            botonTexto = "Siguiente Enemigo >>";
        } else {
            botonTexto = "Ver Resultado Final";
        }

    } else {
        mensajeTitulo = "HAS MUERTO...";
        botonTexto = "Ver Resultado Final";
    }

    // Solo mostramos el título y los puntos 
    cajaRespuesta.innerHTML = `
        <h2 style="font-size: 1.5rem; margin: 10px 0; color: ${resultado.jugadorGana ? '#D9C934' : 'red'}">${mensajeTitulo}</h2>
        <p style="font-size: 1.1rem; margin: 5px 0;">Puntos ganados: <strong>${resultado.puntos}</strong></p>
    `;

    // 5. Actualizamos el botón de abajo
    const btnAccion = document.getElementById('btn-final');
    btnAccion.textContent = botonTexto;
    
    if (!resultado.jugadorGana || indiceEnemigoActual + 1 >= listaEnemigos.length) {
        btnAccion.dataset.accion = "ir_final";
    } else {
        btnAccion.dataset.accion = "siguiente_ronda";
    }

    pintarInventario();
}

/**
 * Función que decide qué hace el botón de la pantalla de batalla
 */
function gestionarSiguientePaso(boton) {
    const accion = boton.dataset.accion;

    if (accion === "ir_final") {
        mostrarPantallaFinal();
        showScene('pantalla-final');
    } else {
        // Siguiente ronda
        indiceEnemigoActual++; // Pasamos al siguiente (0 -> 1, 1 -> 2...)
        prepararBatalla();     // Cargamos el nuevo enemigo y luchamos
    }
}

// --- FUNCIONES VISUALES (Resto igual que antes) ---

function mostrarPantallaFinal() {
    const contenedor = document.querySelector('.final .resultado');
    const rango = obtenerRango(jugador.puntos); 
    
    // HTML Limpio igual que la foto
    contenedor.innerHTML = `
        <h1 class="titulo-f">El Jugador ha logrado ser un ${rango}</h1>
        <h2 class="puntos-f">Puntos totales: ${jugador.puntos}</h2>
    `;
    
    pintarInventario();
}

function actualizarEstadisticasUI() {
    const ataque = jugador.obtenerAtaqueTotal();
    const defensa = jugador.obtenerDefensaTotal();
    const vida = jugador.obtenerVidaTotal();
    const puntos = jugador.puntos;

    document.querySelectorAll('#ataque').forEach(el => el.textContent = ataque);
    document.querySelectorAll('#defensa').forEach(el => el.textContent = defensa);
    document.querySelectorAll('#vida').forEach(el => el.textContent = vida);
    document.querySelectorAll('#puntos').forEach(el => el.textContent = puntos);
}

function cargarMercado() {
    const contenedorMercado = document.querySelector('.mercado .articulos');
    
    renderizarMercado(contenedorMercado, jugador.inventario, (producto, botonHTML, cajaHTML) => {
        // LOGICA DE COMPRA/DEVOLUCION (Igual que la que tenías perfecta)
        if (jugador.tieneObjeto(producto.nombre)) {
            jugador.eliminarDelInventario(producto.nombre);
            botonHTML.textContent = "Añadir";
            botonHTML.style.backgroundColor = ""; 
            cajaHTML.classList.remove('comprado');
            cajaHTML.classList.add('retirado');
        } else {
            const nuevoItem = producto.clonar();
            jugador.agregarInventario(nuevoItem);
            botonHTML.textContent = "Retirar";
            botonHTML.style.backgroundColor = "salmon"; 
            cajaHTML.classList.add('comprado');
            cajaHTML.classList.remove('retirado');
        }
        pintarInventario();
    });
}

function pintarInventario() {
    const contenedores = document.querySelectorAll('.compras-p .compras');
    contenedores.forEach(contenedor => {
        contenedor.innerHTML = ''; 
        jugador.inventario.forEach(item => {
            const div = document.createElement('div');
            div.className = 'obj';
            div.style.backgroundImage = `url(${item.imagen})`;
            div.style.backgroundSize = 'contain';
            div.style.backgroundRepeat = 'no-repeat';
            div.style.backgroundPosition = 'center';
            contenedor.appendChild(div);
        });
    });
}