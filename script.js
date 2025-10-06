// Array para almacenar los productos
let products = [];

// Elementos del DOM
const productForm = document.getElementById('product-form');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productQuantityInput = document.getElementById('product-quantity');
const productsList = document.getElementById('products-list');
const totalValueElement = document.getElementById('total-value');
const totalProductsElement = document.getElementById('total-products');
const mostValuableElement = document.getElementById('most-valuable');

// Evento para añadir un nuevo producto
productForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = productNameInput.value.trim();
    const price = parseFloat(productPriceInput.value);
    const quantity = parseInt(productQuantityInput.value);
    
    if (name && price > 0 && quantity > 0) {
        addProduct(name, price, quantity);
        productForm.reset();
        updateStats();
        renderProducts();
    } else {
        alert('Por favor, complete todos los campos correctamente.');
    }
});

// Función para añadir un producto
function addProduct(name, price, quantity) {
    const product = {
        id: Date.now(), // ID único basado en timestamp
        name: name,
        price: price,
        quantity: quantity
    };
    
    products.push(product);
    saveToLocalStorage();
}

// Función para eliminar un producto
function deleteProduct(id) {
    products = products.filter(product => product.id !== id);
    saveToLocalStorage();
    updateStats();
    renderProducts();
}

// Función para editar un producto
function editProduct(id, newPrice, newQuantity) {
    const productIndex = products.findIndex(product => product.id === id);
    
    if (productIndex !== -1) {
        products[productIndex].price = newPrice;
        products[productIndex].quantity = newQuantity;
        saveToLocalStorage();
        updateStats();
        renderProducts();
    }
}

// Función para calcular el valor total de un producto
function calculateProductTotal(price, quantity) {
    return price * quantity;
}

// Función para actualizar las estadísticas
function updateStats() {
    const totalValue = products.reduce((sum, product) => {
        return sum + calculateProductTotal(product.price, product.quantity);
    }, 0);
    
    const totalProducts = products.reduce((sum, product) => {
        return sum + product.quantity;
    }, 0);
    
    let mostValuable = '-';
    if (products.length > 0) {
        const maxValueProduct = products.reduce((max, product) => {
            const productValue = calculateProductTotal(product.price, product.quantity);
            const maxValue = calculateProductTotal(max.price, max.quantity);
            return productValue > maxValue ? product : max;
        });
        
        mostValuable = `${maxValueProduct.name} (${calculateProductTotal(maxValueProduct.price, maxValueProduct.quantity).toFixed(2)} CUP)`;
    }
    
    totalValueElement.textContent = `${totalValue.toFixed(2)} CUP`;
    totalProductsElement.textContent = totalProducts;
    mostValuableElement.textContent = mostValuable;
}

// Función para renderizar los productos
function renderProducts() {
    productsList.innerHTML = '';
    
    if (products.length === 0) {
        productsList.innerHTML = '<div class="empty-message">No hay productos añadidos. Agregue algunos productos para comenzar.</div>';
        return;
    }
    
    products.forEach(product => {
        const productTotal = calculateProductTotal(product.price, product.quantity);
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-header">
                <div class="product-name">${product.name}</div>
                <div class="product-actions">
                    <button class="edit-btn" onclick="toggleEditForm(${product.id})">Editar</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">Eliminar</button>
                </div>
            </div>
            <div class="product-details">
                <div class="product-detail">
                    <span class="detail-label">Precio Unitario</span>
                    <span class="detail-value">${product.price.toFixed(2)} CUP</span>
                </div>
                <div class="product-detail">
                    <span class="detail-label">Cantidad</span>
                    <span class="detail-value">${product.quantity}</span>
                </div>
            </div>
            <div class="product-total">
                Valor Total: ${productTotal.toFixed(2)} CUP
            </div>
            <div class="edit-form" id="edit-form-${product.id}">
                <input type="number" id="edit-price-${product.id}" placeholder="Nuevo precio" value="${product.price}" step="0.01" min="0">
                <input type="number" id="edit-quantity-${product.id}" placeholder="Nueva cantidad" value="${product.quantity}" min="1">
                <button class="save-btn" onclick="saveProductChanges(${product.id})">Guardar Cambios</button>
            </div>
        `;
        
        productsList.appendChild(productCard);
    });
}

// Función para mostrar/ocultar el formulario de edición
function toggleEditForm(id) {
    const editForm = document.getElementById(`edit-form-${id}`);
    const isVisible = editForm.style.display === 'block';
    
    // Ocultar todos los formularios de edición primero
    document.querySelectorAll('.edit-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Mostrar u ocultar el formulario seleccionado
    editForm.style.display = isVisible ? 'none' : 'block';
}

// Función para guardar los cambios de un producto
function saveProductChanges(id) {
    const newPrice = parseFloat(document.getElementById(`edit-price-${id}`).value);
    const newQuantity = parseInt(document.getElementById(`edit-quantity-${id}`).value);
    
    if (newPrice > 0 && newQuantity > 0) {
        editProduct(id, newPrice, newQuantity);
    } else {
        alert('Por favor, ingrese valores válidos para precio y cantidad.');
    }
}

// Función para guardar en localStorage
function saveToLocalStorage() {
    localStorage.setItem('products', JSON.stringify(products));
}

// Función para cargar desde localStorage
function loadFromLocalStorage() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    }
}

// Inicializar la aplicación
function init() {
    loadFromLocalStorage();
    updateStats();
    renderProducts();
}

// Iniciar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', init);
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
