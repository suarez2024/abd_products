// Array para almacenar los productos
let products = [];

// Elementos del DOM
const productForm = document.getElementById('product-form');
const productsContainer = document.getElementById('products-container');
const totalValueElement = document.getElementById('total-value');
const totalProductsElement = document.getElementById('total-products');
const totalQuantityElement = document.getElementById('total-quantity');

// Cargar productos del localStorage al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
        renderProducts();
        updateStats();
    }
});

// Evento para agregar un nuevo producto
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseInt(document.getElementById('product-quantity').value);
    
    if (name && price >= 0 && quantity > 0) {
        // Verificar si el producto ya existe
        const existingProductIndex = products.findIndex(product => 
            product.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingProductIndex !== -1) {
            // Si existe, actualizar cantidad
            products[existingProductIndex].quantity += quantity;
        } else {
            // Si no existe, agregar nuevo producto
            const newProduct = {
                id: Date.now(),
                name,
                price,
                quantity
            };
            products.push(newProduct);
        }
        
        // Guardar en localStorage
        saveProducts();
        
        // Actualizar la interfaz
        renderProducts();
        updateStats();
        
        // Resetear formulario
        productForm.reset();
        document.getElementById('product-name').focus();
    }
});

// Función para renderizar los productos
function renderProducts() {
    if (products.length === 0) {
        productsContainer.innerHTML = '<p class="empty-message">No hay productos agregados. Agrega el primero usando el formulario.</p>';
        return;
    }
    
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-details">
                    <span>Precio: ${formatCurrency(product.price)}</span>
                    <span>Cantidad: ${product.quantity}</span>
                    <span>Valor total: ${formatCurrency(product.price * product.quantity)}</span>
                </div>
            </div>
            <div class="product-actions">
                <button class="btn-edit" onclick="editProduct(${product.id})">Editar</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">Eliminar</button>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
}

// Función para editar un producto
function editProduct(id) {
    const productIndex = products.findIndex(product => product.id === id);
    if (productIndex === -1) return;
    
    const product = products[productIndex];
    const productCard = document.querySelector(`.product-card:nth-child(${productIndex + 1})`);
    
    productCard.innerHTML = `
        <form class="edit-form" onsubmit="saveEdit(${id}); return false;">
            <div class="edit-form-row">
                <div class="edit-form-group">
                    <label for="edit-name-${id}">Nombre:</label>
                    <input type="text" id="edit-name-${id}" value="${product.name}" required>
                </div>
            </div>
            <div class="edit-form-row">
                <div class="edit-form-group">
                    <label for="edit-price-${id}">Precio (CUP):</label>
                    <input type="number" id="edit-price-${id}" value="${product.price}" min="0" step="0.01" required>
                </div>
                <div class="edit-form-group">
                    <label for="edit-quantity-${id}">Cantidad:</label>
                    <input type="number" id="edit-quantity-${id}" value="${product.quantity}" min="1" required>
                </div>
            </div>
            <div class="edit-actions">
                <button type="submit" class="btn-save">Guardar</button>
                <button type="button" class="btn-cancel" onclick="cancelEdit(${id})">Cancelar</button>
            </div>
        </form>
    `;
}

// Función para guardar la edición de un producto
function saveEdit(id) {
    const productIndex = products.findIndex(product => product.id === id);
    if (productIndex === -1) return;
    
    const name = document.getElementById(`edit-name-${id}`).value.trim();
    const price = parseFloat(document.getElementById(`edit-price-${id}`).value);
    const quantity = parseInt(document.getElementById(`edit-quantity-${id}`).value);
    
    if (name && price >= 0 && quantity > 0) {
        products[productIndex].name = name;
        products[productIndex].price = price;
        products[productIndex].quantity = quantity;
        
        saveProducts();
        renderProducts();
        updateStats();
    }
}

// Función para cancelar la edición
function cancelEdit(id) {
    renderProducts();
}

// Función para eliminar un producto
function deleteProduct(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        products = products.filter(product => product.id !== id);
        saveProducts();
        renderProducts();
        updateStats();
    }
}

// Función para actualizar las estadísticas
function updateStats() {
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
    
    totalValueElement.textContent = formatCurrency(totalValue);
    totalProductsElement.textContent = totalProducts;
    totalQuantityElement.textContent = totalQuantity;
}

// Función para formatear moneda
function formatCurrency(amount) {
    return `${amount.toFixed(2)} CUP`;
}

// Función para guardar productos en localStorage
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}