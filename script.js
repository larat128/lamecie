import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Tu configuración oficial de Firebase integrada
const firebaseConfig = {
    apiKey: "AIzaSyAYFZz6yojkPAWWFU2gWxrbsFvlwbyanb0",
    authDomain: "don-bosco-seating-booqluet.firebaseapp.com",
    projectId: "don-bosco-seating-booqluet",
    storageBucket: "don-bosco-seating-booqluet.firebasestorage.app",
    messagingSenderId: "1005727362551",
    appId: "1:1005727362551:web:205c7b9f419255267cd2f2"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Menú Oficial en Inglés
const cheesecakes = [
    { id: 'ch_dulce', name: 'Dulce de Elche Cheesecake', price: 16.00, isCheesecake: true },
    { id: 'ch_clasico', name: 'Classic Cheesecake', price: 13.50, isCheesecake: true },
    { id: 'ch_berries', name: 'Red Berries Cheesecake', price: 15.00, isCheesecake: true },
    { id: 'ch_oreo', name: 'Oreo Cheesecake', price: 14.00, isCheesecake: true },
    { id: 'ch_chocolate', name: 'Chocolate Cheesecake', price: 14.50, isCheesecake: true },
    { id: 'ch_pistachio', name: 'Pistachio Cheesecake', price: 16.50, isCheesecake: true },
    { id: 'ch_passion', name: 'Passion Fruit Cheesecake', price: 15.00, isCheesecake: true },
    { id: 'ch_basco', name: 'Basque Cheesecake', price: 16.00, isCheesecake: true }
];

const otrosProductos = [
    { id: 'pie_manzana', name: 'Classic Apple Pie', price: 11.00, isCheesecake: false },
    { id: 'pie_limon', name: 'Lemon Pie', price: 10.50, isCheesecake: false },
    { id: 'pie_frutos', name: 'Red Berries Pie', price: 12.00, isCheesecake: false },
    { id: 'tiramisu', name: 'Traditional Tiramisu', price: 11.50, isCheesecake: false },
    { id: 'torta_var', name: 'Fine Cakes Selection', price: 15.00, isCheesecake: false },
    { id: 'bebida_var', name: 'Premium Beverages', price: 4.00, isCheesecake: false }
];

let cart = [];
let currentCustomerData = {
    totalPurchases: 0,
    cheesecakesCount: 0
};

// Desplegar menú de productos
function renderMenu() {
    const chContainer = document.getElementById('cheesecakes-container');
    const otrosContainer = document.getElementById('otros-container');

    cheesecakes.forEach(p => {
        chContainer.innerHTML += `
            <div class="card main-product">
                <span class="badge">Main Product</span>
                <h3>${p.name}</h3>
                <div class="price">$${p.price.toFixed(2)}</div>
                <button class="btn btn-add" data-id="${p.id}">Add Selection</button>
            </div>
        `;
    });

    otrosProductos.forEach(p => {
        otrosContainer.innerHTML += `
            <div class="card">
                <h3>${p.name}</h3>
                <div class="price">$${p.price.toFixed(2)}</div>
                <button class="btn btn-add" data-id="${p.id}">Add Selection</button>
            </div>
        `;
    });

    document.querySelectorAll('.btn-add').forEach(button => {
        button.addEventListener('click', (e) => {
            agregarAlCarrito(e.target.getAttribute('data-id'));
        });
    });
}

// Cargar Historial de Firebase Firestore de manera dinámica
async function loadCustomerData() {
    const username = document.getElementById('username').value.trim() || "GuestUser";
    const docRef = doc(db, "customers", username);
    
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            currentCustomerData = docSnap.data();
        } else {
            currentCustomerData = { totalPurchases: 0, cheesecakesCount: 0 };
        }
    } catch (error) {
        console.error("Database connection issue: ", error);
    }
    actualizarInterfaz();
}

function agregarAlCarrito(id) {
    const producto = [...cheesecakes, ...otrosProductos].find(p => p.id === id);
    const itemEnCarrito = cart.find(item => item.id === id);

    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        cart.push({ ...producto, cantidad: 1 });
    }
    actualizarInterfaz();
}

function actualizarInterfaz() {
    // 1. Mostrar estado del Cliente Frecuente
    const esClienteFrecuente = currentCustomerData.totalPurchases > 0;
    document.getElementById('loyalty-info').innerHTML = `
        Orders placed: <b>${currentCustomerData.totalPurchases}</b> ${esClienteFrecuente ? '(10% Frequent Client applied)' : ''}<br>
        Cheesecakes toward gift: <b>${currentCustomerData.cheesecakesCount}/5</b>
    `;

    // 2. Procesar el Carrito
    const cartContainer = document.getElementById('cart-items');
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="color: #777; font-style: italic;">The selection is currently empty.</p>';
        document.getElementById('subtotal').innerText = 'Subtotal: $0.00';
        document.getElementById('descuento').innerText = '';
        document.getElementById('total').innerText = 'Total: $0.00';
        return;
    }

    cartContainer.innerHTML = '';
    let subtotal = 0;
    let discount6thCheesecake = 0;
    let tempCheesecakeCount = currentCustomerData.cheesecakesCount;
    let rewardedCheesecakes = 0;

    cart.forEach(item => {
        let itemTotalPrice = item.price * item.cantidad;
        
        if (item.isCheesecake) {
            for(let i = 0; i < item.cantidad; i++) {
                tempCheesecakeCount++;
                if (tempCheesecakeCount === 6) {
                    discount6thCheesecake += item.price; 
                    rewardedCheesecakes++;
                    tempCheesecakeCount = 0; 
                }
            }
        }

        subtotal += itemTotalPrice;

        cartContainer.innerHTML += `
            <div class="cart-item">
                <span>${item.name} (x${item.cantidad})</span>
                <span>$${itemTotalPrice.toFixed(2)}</span>
            </div>
        `;
    });

    let baseForFrequentDiscount = subtotal - discount6thCheesecake;
    let customerDiscount = esClienteFrecuente ? (baseForFrequentDiscount * 0.10) : 0;
    let finalTotal = subtotal - discount6thCheesecake - customerDiscount;

    document.getElementById('subtotal').innerText = `Subtotal: $${subtotal.toFixed(2)}`;
    
    let textDiscount = '';
    if (rewardedCheesecakes > 0) textDiscount += `✨ 6th Cheesecake Reward (-$${discount6thCheesecake.toFixed(2)})<br>`;
    if (customerDiscount > 0) textDiscount += `💎 Frequent Loyalty 10% Off (-$${customerDiscount.toFixed(2)})`;
    document.getElementById('descuento').innerHTML = textDiscount;

    document.getElementById('total').innerText = `Total: $${finalTotal.toFixed(2)}`;
}

// Finalizar pedido guardando en la nube
async function checkout() {
    if (cart.length === 0) {
        alert('Your order selection is empty.');
        return;
    }

    let cheesecakesBoughtThisTime = 0;
    cart.forEach(item => {
        if (item.isCheesecake) cheesecakesBoughtThisTime += item.cantidad;
    });

    let newPurchases = currentCustomerData.totalPurchases + 1;
    let newCheesecakesCount = currentCustomerData.cheesecakesCount + cheesecakesBoughtThisTime;

    while (newCheesecakesCount >= 6) {
        newCheesecakesCount -= 6;
    }

    const username = document.getElementById('username').value.trim() || "GuestUser";
    const docRef = doc(db, "customers", username);

    try {
        await setDoc(docRef, {
            totalPurchases: newPurchases,
            cheesecakesCount: newCheesecakesCount
        });

        alert(`Thank you for your order, ${username}. Your experience at Lamecie Bakery has been successfully registered.`);
        
        cart = [];
        await loadCustomerData();
    } catch (e) {
        console.error("Firebase write error: ", e);
        alert("Could not synchronize with the server. Please verify your internet connection.");
    }
}

// Event Listeners de inicialización
document.getElementById('username').addEventListener('change', loadCustomerData);
document.getElementById('btn-checkout').addEventListener('click', checkout);

renderMenu();
loadCustomerData();