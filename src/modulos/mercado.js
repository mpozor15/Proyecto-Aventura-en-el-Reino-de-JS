import { Producto } from '../clases/producto.js';

export const inventarioMercado = [
    new Producto("Manzana", "assets/manzana.png", 50, "comun", "consumible", 10),
    new Producto("Armadura de Cuero", "assets/armadura.png", 100, "rara", "armadura", 6),
    new Producto("Hacha", "assets/hacha.png", 80, "comun", "arma", 8),
    new Producto("Bota", "assets/bota.png", 80, "comun", "armadura", 3),
    new Producto("Arco", "assets/arco.png", 80, "epica", "arma", 10),
    new Producto("Escudo", "assets/escudo.png", 120, "rara", "armadura", 10)
];

// AHORA RECIBIMOS UN 3º PARAMETRO: "itemsJugador" (el array de inventario)
export function renderizarMercado(contenedor, itemsJugador, callbackCompra) {
    contenedor.innerHTML = ''; 

    inventarioMercado.forEach(producto => {
        // Comprobamos si ya lo tenemos
        const yaLoTiene = itemsJugador.some(item => item.nombre === producto.nombre);

        let nombreCaracteristica = "Bonus";
        if (producto.tipo === 'arma') nombreCaracteristica = "Ataque";
        else if (producto.tipo === 'armadura') nombreCaracteristica = "Defensa";
        else if (producto.tipo === 'consumible') nombreCaracteristica = "Vida";

        const div = document.createElement('div');
        div.className = 'caja2';
        
        if (yaLoTiene) {
            div.classList.add('comprado');
        }

        div.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" />
            <h3>${producto.nombre}</h3>
            <p>Tipo: ${producto.tipo}</p>
            <p><strong>${nombreCaracteristica}: +${producto.bonus}</strong></p>
            <p class="precio">${producto.precio} €</p>
        `;

        const btn = document.createElement('button');
        
        if (yaLoTiene) {
            btn.textContent = "Retirar";
        } else {
            btn.textContent = "Añadir";
        }
        
        btn.addEventListener('click', () => {
            callbackCompra(producto, btn, div); 
        });

        div.appendChild(btn);
        contenedor.appendChild(div);
    });
}