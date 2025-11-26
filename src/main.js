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

    // 2. De Mercado -> Estadisticas Actualizado
    const btna = document.getElementById('btn-a');
    if(btna) {
        btna.addEventListener('click', () => {
            showScene('pantalla-estadisticas-a');
        });
    }

    // 3. De Estadisticas Actualizado -> Enemigos
    const btnEnemigos = document.getElementById('btn-enemigos');
    if(btnEnemigos) {
        btnEnemigos.addEventListener('click', () => {
            // Aquí podrías llamar a una función tipo: procesarCompra();
            showScene('pantalla-enemigos');
        });
    }

    // 4. De Enemigos -> Batalla
    const btnBatalla = document.getElementById('btn-batallas');
    if(btnBatalla) {
        btnBatalla.addEventListener('click', () => {
            // Aquí podrías llamar a: seleccionarEnemigo();
            showScene('pantalla-batallas');
        });
    }

    // 5. De Batalla -> Final
    const btnFinal = document.getElementById('btn-final');
    if(btnFinal) {
        btnFinal.addEventListener('click', () => {
            showScene('pantalla-final');
        });
    }

    // 6. De Final -> Reiniciar (Vuelta a Stats)
    const btnReiniciar = document.getElementById('btn-reiniciar');
    if(btnReiniciar) {
        btnReiniciar.addEventListener('click', () => {
            showScene('pantalla-estadisticas');
        });
    }
});