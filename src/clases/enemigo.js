class Enemigo{
    constructor(nombre, imagen, ataque, vida) {
        this.nombre = nombre;
        this.imagen = imagen;
        this.ataque = ataque;
        this.vida = vida;
    }

}

class Jefe extends Enemigo{
    constructor(nombre, imagen, ataque, vida, multiplicador) {
        super(nombre, imagen, ataque, vida);
        this.multiplicador = multiplicador;
    }

}