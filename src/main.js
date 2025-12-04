import { showScene } from './utils.js';
import { Jugador } from './clases/jugador.js';
import { renderizarMercado } from './modulos/mercado.js';
import { PUNTUACION_BASE, VIDA_MAXIMA, ORO_INICIAL } from './constants.js';
import { renderizarEnemigos, listaEnemigos } from './modulos/enemigos.js';
import { simularCombate } from './modulos/batalla.js';
import { obtenerRango } from './modulos/ranking.js';

// --- ESTADO GLOBAL ---
const jugador = new Jugador("Cazador", "assets/prota.png", PUNTUACION_BASE, VIDA_MAXIMA, ORO_INICIAL);
let indiceEnemigoActual = 0; // Empezamos por el enemigo 0 (El primero)

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

    // --- Reset De Animaciones ---
    imgJugador.style.animation = 'none';
    imgEnemigo.style.animation = 'none';
    imgJugador.offsetHeight; 
    imgJugador.style.animation = 'entrarIzquierda 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    imgEnemigo.style.animation = 'entrarDerecha 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    // ----------------------------

    // 3. Simulamos el combate
    const resultado = simularCombate(jugador, enemigo);

    // 4. Mostramos resultados CON CONSOLA (Log)
    const cajaRespuesta = document.querySelector('.respuesta');
    
    let mensajeTitulo = "";
    let botonTexto = "";

    if (resultado.jugadorGana) {
        jugador.puntos += resultado.puntos;

        jugador.oro += resultado.oroGanado;
        actualizarEstadisticasUI();

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

    // --- HTML CON LA CONSOLA RESPONSIVE ---
    cajaRespuesta.innerHTML = `
        <h2 style="font-size: 1.5rem; margin: 5px 0; color: ${resultado.jugadorGana ? '#D9C934' : 'red'}">${mensajeTitulo}</h2>
        <p style="font-size: 1rem; margin: 2px 0;">Puntos ganados: <strong>${resultado.puntos}</strong></p>
        <p style="font-size: 1rem; color: gold; margin: 2px 0;">💰 Botín: +${resultado.oroGanado} €</p>
        
        <div style="
            text-align: left; 
            max-height: 60px; 
            overflow-y: auto; 
            background: rgba(0,0,0,0.6); 
            color: #eee; 
            padding: 8px; 
            margin-top: 8px; 
            font-size: 0.85rem; 
            border-radius: 5px; 
            border: 1px solid #5A4224;
            font-family: sans-serif;
            line-height: 1.4;
        ">
            ${resultado.log.join('<br>')}
        </div>
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

function dispararConfetti() {
    // Si por lo que sea no cargó la librería, no hacemos nada para evitar errores
    if (typeof confetti !== 'function') return;

    // Configuración para que salga un chorro de colores desde abajo
    var count = 200;
    var defaults = {
        origin: { y: 0.7 } // Empieza un poco más abajo del centro
    };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    // Lanzamos varias ráfagas para que quede espectacular
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
}

function mostrarPantallaFinal() {
    jugador.puntos += jugador.oro;

    dispararConfetti(); 

    const contenedor = document.querySelector('.final .resultado');
    const rango = obtenerRango(jugador.puntos); 
    
    contenedor.innerHTML = `
        <h2 class="titulo-final">El Jugador ha logrado ser un ${rango}</h2>
        <p class="puntos-final">Puntos totales: ${jugador.puntos}</p>
        <p style="font-size: 0.9rem; color: #aaa;">(Incluye bonificación por oro restante)</p>
    `;
    
    pintarInventario();
}

function actualizarEstadisticasUI() {
    const ataque = jugador.obtenerAtaqueTotal();
    const defensa = jugador.obtenerDefensaTotal();
    const vida = jugador.obtenerVidaTotal();
    const puntos = jugador.puntos;
    const oro = jugador.oro;

    document.querySelectorAll('#ataque').forEach(el => el.textContent = ataque);
    document.querySelectorAll('#defensa').forEach(el => el.textContent = defensa);
    document.querySelectorAll('#vida').forEach(el => el.textContent = vida);
    document.querySelectorAll('#puntos').forEach(el => el.textContent = puntos);
    document.querySelectorAll('#oro').forEach(el => el.textContent = oro);
}

// Funcion para el cartelido de compra
function mostrarNotificacion() {
    const notificacion = document.getElementById('notificacion-compra');
    
    // 1. Le ponemos la clase para que baje
    notificacion.classList.add('mostrar');

    // 2. Esperamos 2 segundos y se la quitamos para que suba
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
    }, 2000);
}


function cargarMercado() {
    const contenedorMercado = document.querySelector('.mercado .articulos');
    
    renderizarMercado(contenedorMercado, jugador.inventario, (producto, botonHTML, cajaHTML) => {
        
        if (jugador.tieneObjeto(producto.nombre)) {
            // CASO: DEVOLVER (RETIRAR)
            // 1. Recuperamos el dinero (Reembolso)
            jugador.oro += producto.precio; 

            jugador.eliminarDelInventario(producto.nombre);
            
            // Visual
            botonHTML.textContent = "Añadir";
            botonHTML.style.backgroundColor = ""; 
            cajaHTML.classList.remove('comprado');
            cajaHTML.classList.add('retirado');
            
            // Actualizamos el contador de oro en pantalla al instante
            actualizarEstadisticasUI(); 

        } else {
            // CASO: INTENTAR COMPRAR
            
            if (jugador.oro >= producto.precio) {
                // SI TIENE DINERO:
                
                // 1. Restamos el dinero
                jugador.oro -= producto.precio;

                // 2. Lógica normal de compra
                const nuevoItem = producto.clonar();
                jugador.agregarInventario(nuevoItem);

                // Visual
                botonHTML.textContent = "Retirar";
                botonHTML.style.backgroundColor = "salmon"; 
                cajaHTML.classList.add('comprado');
                cajaHTML.classList.remove('retirado');
                mostrarNotificacion();

                // Actualizamos el contador de oro
                actualizarEstadisticasUI();

            } else {
                alert("🚫 ¡No tienes suficiente oro para comprar esto!");
            }
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