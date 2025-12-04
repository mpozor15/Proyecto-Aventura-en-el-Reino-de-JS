export class Jugador {
    constructor(nombre, imagen, puntos, vida, oro) {
        this.nombre = nombre;
        this.imagen = imagen;
        this.puntos = puntos;
        this.vida = vida;
        this.oro = oro;
        this.inventario = []; 

        this.ataqueBase = 0;
        this.defensaBase = 0;
    }

    agregarInventario(producto) {
        this.inventario.push(producto);
    }

    // --- NUEVO: Método para borrar un objeto por su nombre ---
    eliminarDelInventario(nombreProducto) {
        // Buscamos en qué posición está el objeto con ese nombre
        const indice = this.inventario.findIndex(item => item.nombre === nombreProducto);
        
        // Si existe (índice es mayor o igual a 0), lo borramos
        if (indice > -1) {
            this.inventario.splice(indice, 1); 
        }
    }

    // --- NUEVO: Método para saber si ya tenemos ese objeto ---
    tieneObjeto(nombreProducto) {
        // Devuelve true si encuentra algún objeto con ese nombre
        return this.inventario.some(item => item.nombre === nombreProducto);
    }

    obtenerAtaqueTotal() {
        return this.inventario
            .filter(item => item.tipo === 'arma')
            .reduce((total, item) => total + item.bonus, 0);
    }

    obtenerDefensaTotal() {
        return this.inventario
            .filter(item => item.tipo === 'armadura')
            .reduce((total, item) => total + item.bonus, 0);
    }

    obtenerVidaTotal() {
        const bonusVida = this.inventario
            .filter(item => item.tipo === 'consumible')
            .reduce((total, item) => total + item.bonus, 0);
        return this.vida + bonusVida;
    }
}