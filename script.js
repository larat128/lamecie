// Datos de los productos (Precios simulados, los puedes cambiar)
const cheesecakes = [
    { id: 'ch_dulce', name: 'Cheesecake Dulce de Leche', price: 15, isCheesecake: true },
    { id: 'ch_clasico', name: 'Cheesecake Clásico', price: 12, isCheesecake: true },
    { id: 'ch_berries', name: 'Cheesecake Red Berries', price: 14, isCheesecake: true },
    { id: 'ch_oreo', name: 'Cheesecake Oreo', price: 13, isCheesecake: true },
    { id: 'ch_chocolate', name: 'Cheesecake Chocolate', price: 13, isCheesecake: true },
    { id: 'ch_pistachio', name: 'Cheesecake Pistacho', price: 16, isCheesecake: true },
    { id: 'ch_passion', name: 'Cheesecake Passion Fruit', price: 14, isCheesecake: true },
    { id: 'ch_basco', name: 'Cheesecake Vasco', price: 15, isCheesecake: true }
];

const otrosProductos = [
    { id: 'pie_manzana', name: 'Pie de Manzana', price: 10, isCheesecake: false },
    { id: 'pie_limon', name: 'Pie de Limón', price: 10, isCheesecake: false },
    { id: 'pie_frutos', name: 'Pie de Frutos Rojos', price: 12, isCheesecake: false },
    { id: 'tiramisu', name: 'Tiramisú', price: 11, isCheesecake: false },
    { id: 'torta_var', name: 'Torta del Día (Variedad)', price: 14, isCheesecake: false },
    { id: 'bebida_var', name: 'Bebidas (Variedad)', price: 3, isCheesecake: false }
];

// Estado de la aplicación
let carrito = [];
// Simulamos historial en LocalStorage para que no se borre al recargar la página
let historialCompras = parseInt(localStorage.getItem('compras_totales')) || 0;
let historialCheesecakes = parseInt(localStorage.getItem('cheesecakes_totales')) || 0;

// Renderizar Menú en la pantalla
function renderMenu() {
    const chContainer = document.getElementById('cheesecakes-container');
    const otrosContainer = document.getElementById('otros-container');

    cheesecakes.forEach(p => {
        chContainer.innerHTML += `
            <div class="card main-product">
                <span class="badge">⭐ Favorito</span>
                <h3>${p.name}</h3>
                <p>$${p.price.toFixed(2)}</p>
                <button class="btn" onclick="agregarAlCarrito('${p.id}')">Agregar</button>
            </div>
        `;
    });

    otrosProductos.forEach(p => {
        document.getElementById('otros-container').innerHTML += `
            <div class="card">
                <h3>${p.name}</h3>
                <p>$${p.price.toFixed(2)}</p>
                <button class="btn" onclick="agregarAlCarrito('${p.id}')">Agregar</button>
            </div>
        `;
    });
}

// Lógica del Carrito
function agregarAlCarrito(id) {
    const producto = [...cheesecakes, ...otrosProductos].find(p => p.id === id);
    const itemEnCarrito = carrito.find(item => item.id === id);

    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    actualizarInterfaz();
}

function actualizarInterfaz() {
    // 1. Renderizar Club de Fidelidad
    const esClienteFrecuente = historialCompras > 0;
    document.getElementById('loyalty-info').innerHTML = `
        Compras anteriores: <b>${historialCompras}</b> ${esClienteFrecuente ? '(¡Tienes 10% desc!)' : ''}<br>
        Cheesecakes acumulados: <b>${historialCheesecakes}/5</b>
    `;

    // 2. Renderizar Carrito
    const cartContainer = document.getElementById('cart-items');
    if (carrito.length === 0) {
        cartContainer.innerHTML = '<p style="color: gray;">El carrito está vacío.</p>';
        document.getElementById('subtotal').innerText = 'Subtotal: $0.00';
        document.getElementById('descuento').innerText = '';
        document.getElementById('total').innerText = 'Total: $0.00';
        return;
    }

    cartContainer.innerHTML = '';
    let subtotal = 0;
    let cheesecakesEnCarrito = 0;
    let descuentoPorCheesecakeGratis = 0;

    // Contar cuántos cheesecakes se llevan en este intento
    carrito.forEach(item => {
        if (item.isCheesecake) {
            cheesecakesEnCarrito += item.cantidad;
        }
    });

    // Calcular si aplica el 6to gratis considerando el historial
    let cuentaTemporalCheesecakes = historialCheesecakes;
    let cheesecakesRegalados = 0;

    carrito.forEach(item => {
        let precioItemTotal = item.price * item.cantidad;
        
        // Lógica interna para aplicar el gratis al producto que corresponda
        if (item.isCheesecake) {
            for(let i = 0; i < item.cantidad; i++) {
                cuentaTemporalCheesecakes++;
                if (cuentaTemporalCheesecakes === 6) {
                    descuentoPorCheesecakeGratis += item.price; // Descontamos el valor de este cheesecake
                    cheesecakesRegalados++;
                    cuentaTemporalCheesecakes = 0; // Se reinicia el contador de promos
                }
            }
        }

        subtotal += precioItemTotal;

        cartContainer.innerHTML += `
            <div class="cart-item">
                <span>${item.name} (x${item.cantidad})</span>
                <span>$${precioItemTotal.toFixed(2)}</span>
            </div>
        `;
    });

    // Aplicar Descuento de Cliente Frecuente (10%) sobre el remanente
    let baseParaDescuentoCliente = subtotal - descuentoPorCheesecakeGratis;
    let descuentoCliente = esClienteFrecuente ? (baseParaDescuentoCliente * 0.10) : 0;
    let totalFinal = subtotal - descuentoPorCheesecakeGratis - descuentoCliente;

    // Mostrar Totales
    document.getElementById('subtotal').innerText = `Subtotal: $${subtotal.toFixed(2)}`;
    
    let textoDescuento = '';
    if (cheesecakesRegalados > 0) textoDescuento += `¡6to Cheesecake Gratis! (-$${descuentoPorCheesecakeGratis.toFixed(2)})<br>`;
    if (descuentoCliente > 0) textoDescuento += `Desc. Cliente Frecuente 10% (-$${descuentoCliente.toFixed(2)})`;
    document.getElementById('descuento').innerHTML = textoDescuento;

    document.getElementById('total').innerText = `Total: $${totalFinal.toFixed(2)}`;
}

// Simular Finalizar Compra
function checkout() {
    if (carrito.length === 0) {
        alert('¡Tu carrito está vacío!');
        return;
    }

    // Contar cheesecakes de esta compra
    let cheesecakesComprados = 0;
    carrito.forEach(item => {
        if (item.isCheesecake) cheesecakesComprados += item.cantidad;
    });

    // Actualizar historial
    historialCompras += 1;
    historialCheesecakes += cheesecakesComprados;

    // Si pasa de 6, se calcula el sobrante para la siguiente vuelta
    while (historialCheesecakes >= 6) {
        historialCheesecakes -= 6; 
    }

    // Guardar en la "base de datos" del navegador
    localStorage.setItem('compras_totales', historialCompras);
    localStorage.setItem('cheesecakes_totales', historialCheesecakes);

    const nombre = document.getElementById('username').value;
    alert(`¡Gracias por tu compra, ${nombre}! Tu pedido en Lamecie ha sido procesado con éxito.`);
    
    // Limpiar carrito
    carrito = [];
    actualizarInterfaz();
}

// Iniciar app
renderMenu();
actualizarInterfaz();
