export class Jugador {
    // Añadimos ataqueBase y defensaBase al constructor (con valor por defecto 0)
    constructor(nombre, imagen, puntos, vida, ataqueBase = 0, defensaBase = 0) {
        this.nombre = nombre;
        this.imagen = imagen;
        this.puntos = puntos;
        this.vida = vida;
        
        // Propiedades nuevas para guardar lo que pongas en el formulario
        this.ataqueBase = ataqueBase;
        this.defensaBase = defensaBase;
        
        this.inventario = []; 
    }

    agregarInventario(producto) {
        this.inventario.push(producto);
    }

    eliminarDelInventario(nombreProducto) {
        const indice = this.inventario.findIndex(item => item.nombre === nombreProducto);
        if (indice > -1) {
            this.inventario.splice(indice, 1); 
        }
    }

    tieneObjeto(nombreProducto) {
        return this.inventario.some(item => item.nombre === nombreProducto);
    }

    obtenerAtaqueTotal() {
        const bonusObjetos = this.inventario
            .filter(item => item.tipo === 'arma')
            .reduce((total, item) => total + item.bonus, 0);
            
        // Sumamos la base del formulario + los objetos
        return this.ataqueBase + bonusObjetos;
    }

    obtenerDefensaTotal() {
        const bonusObjetos = this.inventario
            .filter(item => item.tipo === 'armadura')
            .reduce((total, item) => total + item.bonus, 0);

        // Sumamos la base del formulario + los objetos
        return this.defensaBase + bonusObjetos;
    }

    obtenerVidaTotal() {
        const bonusVida = this.inventario
            .filter(item => item.tipo === 'consumible')
            .reduce((total, item) => total + item.bonus, 0);
        return this.vida + bonusVida;
    }
}