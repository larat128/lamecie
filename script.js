import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAYFZz6yojkPAWWFU2gWxrbsFvlwbyanb0",
    authDomain: "don-bosco-seating-booqluet.firebaseapp.com",
    projectId: "don-bosco-seating-booqluet",
    storageBucket: "don-bosco-seating-booqluet.firebasestorage.app",
    messagingSenderId: "1005727362551",
    appId: "1:1005727362551:web:205c7b9f419255267cd2f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Menu Data
const cheesecakes = [
    { id: 'ch_dulce', name: 'Dulce de Elche Cheesecake', price: 15, isCheesecake: true },
    { id: 'ch_clasico', name: 'Classic Cheesecake', price: 12, isCheesecake: true },
    { id: 'ch_berries', name: 'Red Berries Cheesecake', price: 14, isCheesecake: true },
    { id: 'ch_oreo', name: 'Oreo Cheesecake', price: 13, isCheesecake: true },
    { id: 'ch_chocolate', name: 'Chocolate Cheesecake', price: 13, isCheesecake: true },
    { id: 'ch_pistachio', name: 'Pistachio Cheesecake', price: 16, isCheesecake: true },
    { id: 'ch_passion', name: 'Passion Fruit Cheesecake', price: 14, isCheesecake: true },
    { id: 'ch_basco', name: 'Basque Cheesecake', price: 15, isCheesecake: true }
];

const otrosProductos = [
    { id: 'pie_manzana', name: 'Apple Pie', price: 10, isCheesecake: false },
    { id: 'pie_limon', name: 'Lemon Pie', price: 10, isCheesecake: false },
    { id: 'pie_frutos', name: 'Red Berries Pie', price: 12, isCheesecake: false },
    { id: 'tiramisu', name: 'Tiramisu', price: 11, isCheesecake: false },
    { id: 'torta_var', name: 'Assorted Cakes (Variety)', price: 14, isCheesecake: false },
    { id: 'bebida_var', name: 'Beverages (Variety)', price: 3, isCheesecake: false }
];

// App State
let cart = [];
let currentCustomerData = {
    totalPurchases: 0,
    cheesecakesCount: 0
};

// Render Items in Menu
function renderMenu() {
    const chContainer = document.getElementById('cheesecakes-container');
    const otrosContainer = document.getElementById('otros-container');

    cheesecakes.forEach(p => {
        chContainer.innerHTML += `
            <div class="card main-product">
                <span class="badge">⭐ Best Seller</span>
                <h3>${p.name}</h3>
                <p>$${p.price.toFixed(2)}</p>
                <button class="btn btn-add" data-id="${p.id}">Add to Cart</button>
            </div>
        `;
    });

    otrosProductos.forEach(p => {
        otrosContainer.innerHTML += `
            <div class="card">
                <h3>${p.name}</h3>
                <p>$${p.price.toFixed(2)}</p>
                <button class="btn btn-add" data-id="${p.id}">Add to Cart</button>
            </div>
        `;
    });

    // Add event listeners to newly generated buttons
    document.querySelectorAll('.btn-add').forEach(button => {
        button.addEventListener('click', (e) => {
            agregarAlCarrito(e.target.getAttribute('data-id'));
        });
    });
}

// Load Customer Data from Firebase Firestore
async function loadCustomerData() {
    const username = document.getElementById('username').value.trim() || "GuestUser";
    const docRef = doc(db, "customers", username);
    
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            currentCustomerData = docSnap.data();
        } else {
            // New user defaults
            currentCustomerData = { totalPurchases: 0, cheesecakesCount: 0 };
        }
    } catch (error) {
        console.error("Error loading user from Firebase:", error);
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
    // 1. Loyalty updates
    const esClienteFrecuente = currentCustomerData.totalPurchases > 0;
    document.getElementById('loyalty-info').innerHTML = `
        Previous Purchases: <b>${currentCustomerData.totalPurchases}</b> ${esClienteFrecuente ? '(10% Member discount applied!)' : ''}<br>
        Cheesecakes Progress: <b>${currentCustomerData.cheesecakesCount}/5</b>
    `;

    // 2. Cart updates
    const cartContainer = document.getElementById('cart-items');
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="color: gray;">Your cart is empty.</p>';
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
    if (rewardedCheesecakes > 0) textDiscount += `6th Cheesecake Free! (-$${discount6thCheesecake.toFixed(2)})<br>`;
    if (customerDiscount > 0) textDiscount += `Frequent Buyer 10% Off (-$${customerDiscount.toFixed(2)})`;
    document.getElementById('descuento').innerHTML = textDiscount;

    document.getElementById('total').innerText = `Total: $${finalTotal.toFixed(2)}`;
}

// Complete Purchase & Save to Firebase
async function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    let cheesecakesBoughtThisTime = 0;
    cart.forEach(item => {
        if (item.isCheesecake) cheesecakesBoughtThisTime += item.cantidad;
    });

    // Update operational counter locally
    let newPurchases = currentCustomerData.totalPurchases + 1;
    let newCheesecakesCount = currentCustomerData.cheesecakesCount + cheesecakesBoughtThisTime;

    while (newCheesecakesCount >= 6) {
        newCheesecakesCount -= 6;
    }

    // Prepare update payload
    const username = document.getElementById('username').value.trim() || "GuestUser";
    const docRef = doc(db, "customers", username);

    try {
        await setDoc(docRef, {
            totalPurchases: newPurchases,
            cheesecakesCount: newCheesecakesCount
        });

        alert(`Thank you for your purchase, ${username}! Your order at Lamecie has been successfully processed and recorded into our system.`);
        
        // Reload state from database clean up
        cart = [];
        await loadCustomerData();
    } catch (e) {
        console.error("Error writing document to database: ", e);
        alert("There was an issue processing your order with our cloud database. Please try again.");
    }
}

// Listeners and Initialization
document.getElementById('username').addEventListener('change', loadCustomerData);
document.getElementById('btn-checkout').addEventListener('click', checkout);

renderMenu();
loadCustomerData();
