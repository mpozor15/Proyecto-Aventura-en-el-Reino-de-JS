import { showScene } from './utils.js'; // La mantenemos por si acaso, pero usaremos la nuestra
import { Jugador } from './clases/jugador.js';
import { renderizarMercado } from './modulos/mercado.js';
import { PUNTUACION_BASE, VIDA_MAXIMA, ORO_INICIAL } from './constants.js';
import { renderizarEnemigos, listaEnemigos } from './modulos/enemigos.js';
import { simularCombate } from './modulos/batalla.js';
import { obtenerRango } from './modulos/ranking.js';

// --- ESTADO GLOBAL ---
// Creamos al jugador con 500 de oro forzado
const jugador = new Jugador("Cazador", "assets/prota.png", 0, 100, 500); 
jugador.oro = 500; // Doble seguridad

let indiceEnemigoActual = 0;

// --- FUNCIÓN MAESTRA PARA CAMBIAR ESCENAS (SOLUCIÓN DEFINITIVA) ---
// Esta función limpia los estilos manuales "pegados" antes de mostrar la nueva
function cambiarEscena(idDestino) {
    // 1. Ocultamos TODAS las escenas forzando display: none
    // Esto borra el rastro de la "fuerza bruta" anterior
    document.querySelectorAll('.scene').forEach(escena => {
        escena.style.display = 'none'; 
        escena.classList.remove('active');
    });

    // 2. Mostramos SOLO la que queremos
    const destino = document.getElementById(idDestino);
    if (destino) {
        destino.style.display = 'flex'; // La forzamos a verse
        destino.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {

    actualizarEstadisticasUI();
    pintarInventario(); 

    // ----------------------------------------------------------------------
    // 1. BOTÓN COMENZAR (Formulario -> Estadísticas)
    // ----------------------------------------------------------------------
    const btnComenzar = document.getElementById('btn-comenzar-juego');
    
    if (btnComenzar) {
        btnComenzar.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            // Recogida de datos
            const nombre = document.getElementById('crear-nombre').value;
            const ataque = parseInt(document.getElementById('crear-ataque').value) || 0;
            const defensa = parseInt(document.getElementById('crear-defensa').value) || 0;
            const vida = parseInt(document.getElementById('crear-vida').value) || 0;
            const msgError = document.getElementById('msg-error');

            // Validaciones
            const regexNombre = /^[A-Z][a-zA-Z\s]*$/;

            if (!nombre.trim()) { msgError.textContent = "Nombre vacío."; return; }
            if (!regexNombre.test(nombre)) { msgError.textContent = "Mayúscula inicial obligatoria."; return; }
            if (nombre.length > 20) { msgError.textContent = "Nombre muy largo."; return; }
            if (vida < 100) { msgError.textContent = "Vida mínima 100."; return; }
            if (ataque < 0 || defensa < 0) { msgError.textContent = "No negativos."; return; }
            
            const total = ataque + defensa + vida;
            if (total > 110) { msgError.textContent = `Te pasaste: ${total}/110.`; return; }

            // Guardado
            msgError.textContent = "";
            jugador.nombre = nombre.trim();
            jugador.ataqueBase = ataque;
            jugador.defensaBase = defensa;
            jugador.vida = vida;
            jugador.puntos = 0;

            document.querySelectorAll('.menu1 h1').forEach(h => h.textContent = jugador.nombre);
            actualizarEstadisticasUI();

            // CAMBIO DE ESCENA USANDO LA NUEVA FUNCIÓN
            cambiarEscena('pantalla-estadisticas');
        });
    }

    // ----------------------------------------------------------------------
    // 2. NAVEGACIÓN (TODOS LOS BOTONES USAN AHORA cambiarEscena)
    // ----------------------------------------------------------------------

    // Botón Mercado
    const btnMercado = document.getElementById('btn-mercado');
    if(btnMercado) {
        btnMercado.addEventListener('click', () => {
            cargarMercado();
            cambiarEscena('pantalla-mercado'); // <--- CAMBIADO
        });
    }

    // Botón Estadísticas Actualizadas (Tras comprar)
    const btnA = document.getElementById('btn-a');
    if(btnA) {
        btnA.addEventListener('click', () => {
            actualizarEstadisticasUI();
            pintarInventario();
            cambiarEscena('pantalla-estadisticas-a'); // <--- CAMBIADO
        });
    }

    // Botón Enemigos
    const btnEnemigos = document.getElementById('btn-enemigos');
    if(btnEnemigos) {
        btnEnemigos.addEventListener('click', () => {
            const contenedor = document.querySelector('.enemigos .list-e');
            renderizarEnemigos(contenedor, () => {}); 
            cambiarEscena('pantalla-enemigos'); // <--- CAMBIADO
        });
    }

    // Botón Empezar Combates
    const btnBatalla = document.getElementById('btn-batallas');
    if(btnBatalla) {
        btnBatalla.textContent = "¡EMPEZAR COMBATES!";
        btnBatalla.addEventListener('click', () => {
            indiceEnemigoActual = 0; 
            prepararBatalla();       
            cambiarEscena('pantalla-batallas'); // <--- CAMBIADO
        });
    }

    // Botón Continuar Batalla (Dinámico)
    const btnContinuarBatalla = document.getElementById('btn-final');
    if(btnContinuarBatalla) {
        btnContinuarBatalla.addEventListener('click', () => {
            gestionarSiguientePaso(btnContinuarBatalla);
        });
    }

    // Botón Ranking (Consola)
    const btnRanking = document.getElementById('btn-ranking');
    if(btnRanking) {
        btnRanking.addEventListener('click', () => {
            mostrarRankingPorConsola();
            alert("Ranking mostrado en la consola (F12)");
        });
    }

    // Botón Tabla Visual (Reiniciar 1)
    const btnReiniciar = document.getElementById('btn-reiniciar');
    if(btnReiniciar) {
        btnReiniciar.addEventListener('click', () => {
            pintarTablaRankingVisual(); 
            cambiarEscena('pantalla-final2'); // <--- CAMBIADO
        });
    }

    // Botón Reiniciar Total
    const btnReiniciar2 = document.getElementById('btn-reiniciar2');
    if(btnReiniciar2) {
        btnReiniciar2.addEventListener('click', () => location.reload());
    }
});


// ----------------------------------------------------------------------
// LÓGICA DE BATALLA Y JUEGO
// ----------------------------------------------------------------------

// --- FUNCIÓN NUEVA: Activa la lluvia de monedas ---
function lanzarMonedas() {
    const contenedor = document.getElementById('contenedor-lluvia');
    if (contenedor) {
        // 1. Quitamos la clase por si acaso estaba activa de antes (reset)
        contenedor.classList.remove('activa');
        
        // 2. Truco para reiniciar la animación (reflow)
        void contenedor.offsetWidth; 
        
        // 3. Añadimos la clase para que empiece a caer
        contenedor.classList.add('activa');

        // 4. Quitamos la clase al terminar (2 segundos dura el CSS)
        setTimeout(() => {
            contenedor.classList.remove('activa');
        }, 2000);
    }
}

function prepararBatalla() {
    if (indiceEnemigoActual >= listaEnemigos.length) {
        mostrarPantallaFinal();
        cambiarEscena('pantalla-final'); // <--- CAMBIADO
        return;
    }

    const enemigo = listaEnemigos[indiceEnemigoActual];

    const imgJugador = document.querySelector('.combate .persona img');
    const imgEnemigo = document.querySelector('.combate .evil img');
    
    if(imgJugador) imgJugador.src = jugador.imagen;
    if(imgEnemigo) imgEnemigo.src = enemigo.imagen;

    imgJugador.style.animation = 'none';
    imgEnemigo.style.animation = 'none';
    imgJugador.offsetHeight; 
    imgJugador.style.animation = 'entrarIzquierda 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    imgEnemigo.style.animation = 'entrarDerecha 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    const resultado = simularCombate(jugador, enemigo);

    const cajaRespuesta = document.querySelector('.respuesta');
    let mensajeTitulo = "";
    let botonTexto = "";

    if (resultado.jugadorGana) {
        jugador.puntos += resultado.puntos;
        if(resultado.oroGanado) {
            jugador.oro += resultado.oroGanado;
        }

        lanzarMonedas();

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

    cajaRespuesta.innerHTML = `
        <h2 style="font-size: 1.5rem; margin: 5px 0; color: ${resultado.jugadorGana ? '#D9C934' : 'red'}">${mensajeTitulo}</h2>
        <p style="font-size: 1rem; margin: 2px 0;">Puntos ganados: <strong>${resultado.puntos}</strong></p>
        ${resultado.jugadorGana ? `<p style="font-size: 0.9rem; color: gold;">💰 Botín: +${resultado.oroGanado || 0} €</p>` : ''}
        
        <div style="
            text-align: left; 
            max-height: 80px; 
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

    const btnAccion = document.getElementById('btn-final');
    btnAccion.textContent = botonTexto;
    
    if (!resultado.jugadorGana || indiceEnemigoActual + 1 >= listaEnemigos.length) {
        btnAccion.dataset.accion = "ir_final";
    } else {
        btnAccion.dataset.accion = "siguiente_ronda";
    }
    pintarInventario(); 
}

function gestionarSiguientePaso(boton) {
    const accion = boton.dataset.accion;

    if (accion === "ir_final") {
        mostrarPantallaFinal();
        cambiarEscena('pantalla-final'); // <--- CAMBIADO
    } else {
        indiceEnemigoActual++; 
        prepararBatalla();     
    }
}

// --- UTILIDADES ---

function dispararConfetti() {
    if (typeof confetti !== 'function') return;
    var count = 200;
    var defaults = { origin: { y: 0.7 } };
    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
}

function mostrarPantallaFinal() {
    jugador.puntos += jugador.oro;
    guardarPartidaEnLocalStorage();
    dispararConfetti();

    const contenedor = document.querySelector('.final .resultado');
    const rango = obtenerRango(jugador.puntos); 
    
    contenedor.innerHTML = `
        <h1 class="titulo-f">El Jugador ha logrado ser un ${rango}</h1>
        <h2 class="puntos-f">Puntos totales: ${jugador.puntos}</h2>
        <p style="font-size: 0.8rem; color: #ccc;">(Incluye bonificación por oro)</p>
    `;
    pintarInventario();
}

function actualizarEstadisticasUI() {
    const ataque = jugador.obtenerAtaqueTotal();
    const defensa = jugador.obtenerDefensaTotal();
    const vida = jugador.obtenerVidaTotal();
    const puntos = jugador.puntos;
    const oro = (jugador.oro !== undefined) ? jugador.oro : 0;

    document.querySelectorAll('#ataque').forEach(el => el.textContent = ataque);
    document.querySelectorAll('#defensa').forEach(el => el.textContent = defensa);
    document.querySelectorAll('#vida').forEach(el => el.textContent = vida);
    document.querySelectorAll('#puntos').forEach(el => el.textContent = puntos);
    document.querySelectorAll('#oro').forEach(el => el.textContent = oro);
    document.querySelectorAll('#oro-display').forEach(el => el.textContent = oro + ' €');

    const monederoFlotante = document.getElementById('oro-flotante');
    if(monederoFlotante) monederoFlotante.textContent = oro;
}

function mostrarNotificacion() {
    const notificacion = document.getElementById('notificacion-compra');
    notificacion.classList.add('mostrar');
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
    }, 2000);
}

function cargarMercado() {
    const contenedorMercado = document.querySelector('.mercado .articulos');
    
    renderizarMercado(contenedorMercado, jugador.inventario, (producto, botonHTML, cajaHTML) => {
        if (jugador.tieneObjeto(producto.nombre)) {
            jugador.oro += producto.precio;
            jugador.eliminarDelInventario(producto.nombre);
            
            botonHTML.textContent = "Añadir";
            botonHTML.style.backgroundColor = ""; 
            cajaHTML.classList.remove('comprado');
            cajaHTML.classList.add('retirado');
            
            actualizarEstadisticasUI();
            pintarInventario();

        } else {
            if (jugador.oro >= producto.precio) {
                jugador.oro -= producto.precio;
                const nuevoItem = producto.clonar();
                jugador.agregarInventario(nuevoItem);
                
                botonHTML.textContent = "Retirar";
                botonHTML.style.backgroundColor = "salmon"; 
                cajaHTML.classList.add('comprado');
                cajaHTML.classList.remove('retirado');
                mostrarNotificacion();
                
                actualizarEstadisticasUI();
                pintarInventario();
            } else {
                alert("🚫 No tienes suficiente oro.");
            }
        }
    });
}

function pintarInventario() {
    const contenedores = document.querySelectorAll('.compras-p .compras, #inventario-global');
    contenedores.forEach(contenedor => {
        contenedor.innerHTML = ''; 
        for (let i = 0; i < 6; i++) {
            const div = document.createElement('div');
            div.className = 'obj';
            if (jugador.inventario[i]) {
                const item = jugador.inventario[i];
                div.style.backgroundImage = `url(${item.imagen})`;
                div.style.backgroundSize = 'contain';
                div.style.backgroundRepeat = 'no-repeat';
                div.style.backgroundPosition = 'center';
                div.title = item.nombre; 
            } else {
                div.style.backgroundColor = 'rgba(0,0,0,0.1)';
            }
            contenedor.appendChild(div);
        }
    });
}

function guardarPartidaEnLocalStorage() {
    let ranking = JSON.parse(localStorage.getItem('aventura_ranking')) || [];
    const nuevoRegistro = {
        nombre: jugador.nombre,
        puntos: jugador.puntos,
        monedas: jugador.oro,
        fecha: new Date().toLocaleDateString()
    };
    ranking.push(nuevoRegistro);
    localStorage.setItem('aventura_ranking', JSON.stringify(ranking));
}

function mostrarRankingPorConsola() {
    const ranking = JSON.parse(localStorage.getItem('aventura_ranking')) || [];
    if (ranking.length === 0) { console.log("No hay registros aún."); return; }
    ranking.sort((a, b) => b.puntos - a.puntos);
    console.table(ranking);
}

function pintarTablaRankingVisual() {
    // 1. Recuperamos tus datos reales
    let ranking = JSON.parse(localStorage.getItem('aventura_ranking')) || [];
    
    // 2. Elemento del DOM
    const tbody = document.getElementById('cuerpo-tabla-ranking');
    if(!tbody) return;

    // 3. DATOS DE RELLENO (Para cumplir el requisito de scroll)
    // Estos se añaden visualmente para que la tabla sea larga
    const leyendas = [
        { nombre: "Rey Arturo", puntos: 2000, monedas: 1000 },
        { nombre: "Merlín", puntos: 1800, monedas: 900 },
        { nombre: "Lancelot", puntos: 1500, monedas: 500 },
        { nombre: "Morgana", puntos: 1200, monedas: 666 },
        { nombre: "Robin Hood", puntos: 900, monedas: 50 },
        { nombre: "Sancho Panza", puntos: 800, monedas: 20 },
        { nombre: "Don Quijote", puntos: 750, monedas: 10 },
        { nombre: "Gandalf", puntos: 2500, monedas: 0 },
        { nombre: "Frodo", puntos: 500, monedas: 100 },
        { nombre: "Gollum", puntos: 100, monedas: 5 }
    ];

    // Juntamos tus partidas con las leyendas
    const datosCompletos = [...ranking, ...leyendas];

    // Ordenamos todo por puntos
    datosCompletos.sort((a, b) => b.puntos - a.puntos);

    // 4. Renderizamos
    tbody.innerHTML = '';
    
    datosCompletos.forEach(fila => {
        const tr = document.createElement('tr');
        // Usamos la moneda o 0 si no existe
        const monedas = fila.monedas || 0; 
        
        tr.innerHTML = `
            <td>${fila.nombre}</td>
            <td>${fila.puntos}</td>
            <td>${monedas} €</td>
        `;
        tbody.appendChild(tr);
    });
}