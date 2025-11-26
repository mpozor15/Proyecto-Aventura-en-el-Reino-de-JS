import { showScene } from './utils.js';

// Esperamos a que cargue el DOM por seguridad
document.addEventListener('DOMContentLoaded', () => {

    // 1. De Estadísticas -> Mercado
    const btnMercado = document.getElementById('btn-mercado');
    if(btnMercado) {
        btnMercado.addEventListener('click', () => {
            showScene('pantalla-mercado');
        });
    }

    // 2. De Mercado -> Enemigos
    const btnEnemigos = document.getElementById('btn-enemigos');
    if(btnEnemigos) {
        btnEnemigos.addEventListener('click', () => {
            // Aquí podrías llamar a una función tipo: procesarCompra();
            showScene('pantalla-enemigos');
        });
    }

    // 3. De Enemigos -> Batalla
    const btnBatalla = document.getElementById('btn-batallas');
    if(btnBatalla) {
        btnBatalla.addEventListener('click', () => {
            // Aquí podrías llamar a: seleccionarEnemigo();
            showScene('pantalla-batallas');
        });
    }

    // 4. De Batalla -> Final
    const btnFinal = document.getElementById('btn-final');
    if(btnFinal) {
        btnFinal.addEventListener('click', () => {
            showScene('pantalla-final');
        });
    }

    // 5. De Final -> Reiniciar (Vuelta a Stats)
    const btnReiniciar = document.getElementById('btn-reiniciar');
    if(btnReiniciar) {
        btnReiniciar.addEventListener('click', () => {
            showScene('pantalla-estadisticas');
        });
    }
});