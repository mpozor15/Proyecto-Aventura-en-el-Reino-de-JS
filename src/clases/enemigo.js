export class Enemigo {
    constructor(nombre, imagen, ataque, vida) {
        this.nombre = nombre;
        this.imagen = imagen;
        this.ataque = ataque;
        this.vida = vida;
        this.vidaMaxima = vida;
    }
}

export class Jefe extends Enemigo {
    constructor(nombre, imagen, ataque, vida, multiplicador = 1.2) {
        super(nombre, imagen, ataque, vida);
        this.multiplicador = multiplicador;
    }
}