export class Producto {
    constructor(nombre, imagen, precio, rareza, tipo, bonus) {
        this.nombre = nombre;
        this.imagen = imagen;
        this.precio = precio;
        this.rareza = rareza;
        this.tipo = tipo;
        this.bonus = bonus;
    }

    // Método para crear una copia exacta de este producto
    clonar() {
        return new Producto(this.nombre, this.imagen, this.precio, this.rareza, this.tipo, this.bonus);
    }

    // Método que devuelve una COPIA con el precio rebajado
    aplicarDescuento(porcentaje) {
        const nuevoProducto = this.clonar();
        nuevoProducto.precio = this.precio - (this.precio * (porcentaje / 100));
        return nuevoProducto;
    }
}