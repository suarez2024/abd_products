// Array para almacenar los productos
let products = [];
let salesChart = null;

// Elementos del DOM
const productForm = document.getElementById('product-form');
const productsContainer = document.getElementById('products-container');
const totalValueElement = document.getElementById('total-value');
const totalProductsElement = document.getElementById('total-products');
const totalQuantityElement = document.getElementById('total-quantity');
const todaySoldElement = document.getElementById('today-sold');
const todayValueElement = document.getElementById('today-value');
const last10SoldElement = document.getElementById('last10-sold');
const last10ValueElement = document.getElementById('last10-value');

// Cargar productos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    renderProducts();
    updateStats();
    initializeChart();
});

// Función para inicializar el gráfico (se mantiene igual)
function initializeChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Unidades Vendidas',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Valor Adquirido (CUP)',
                    data: [],
                    backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Unidades Vendidas'
                    },
                    position: 'left'
                },
                y1: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor (CUP)'
                    },
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Ventas de los Últimos 10 Días',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 0) {
                                label += context.parsed.y + ' unidades';
                            } else {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
    
    updateChart();
}

// Función para actualizar el gráfico (se mantiene igual)
function updateChart() {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const last10Days = getLast10Days();
    
    // Preparar datos para el gráfico
    const chartData = last10Days.map(day => {
        const daySales = salesHistory.filter(sale => sale.date === day);
        const totalSold = daySales.reduce((sum, sale) => sum + sale.soldQuantity, 0);
        const totalValue = daySales.reduce((sum, sale) => sum + sale.valueAcquired, 0);
        
        return {
            day: day,
            sold: totalSold,
            value: totalValue
        };
    });
    
    // Formatear etiquetas para mostrar solo el día
    const labels = chartData.map(item => {
        const date = new Date(item.day);
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit' 
        });
    }).reverse();
    
    const soldData = chartData.map(item => item.sold).reverse();
    const valueData = chartData.map(item => item.value).reverse();
    
    // Actualizar el gráfico
    salesChart.data.labels = labels;
    salesChart.data.datasets[0].data = soldData;
    salesChart.data.datasets[1].data = valueData;
    salesChart.update();
}

// Función para cargar productos desde localStorage (se mantiene igual)
function loadProducts() {
    const savedProducts = localStorage.getItem('products');
    const savedSalesHistory = localStorage.getItem('salesHistory');
    
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
    
    // Inicializar historial de ventas si no existe
    if (!savedSalesHistory) {
        localStorage.setItem('salesHistory', JSON.stringify([]));
    }
}

// Función para guardar productos en localStorage (se mantiene igual)
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

// Función para guardar en el historial de ventas (se mantiene igual)
function saveToSalesHistory(productId, productName, soldQuantity, valueAcquired, date) {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    
    salesHistory.push({
        id: Date.now(),
        productId,
        productName,
        soldQuantity,
        valueAcquired,
        date: date || new Date().toISOString().split('T')[0]
    });
    
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
}

// Evento para agregar un nuevo producto (se mantiene igual)
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseInt(document.getElementById('product-quantity').value);
    
    if (name && price >= 0 && quantity > 0) {
        const existingProductIndex = products.findIndex(product => 
            product.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingProductIndex !== -1) {
            products[existingProductIndex].quantity += quantity;
        } else {
            const newProduct = {
                id: Date.now(),
                name,
                price,
                quantity,
                sold: 0,
                lastUpdated: new Date().toISOString(),
                expanded: false,
                editing: false
            };
            products.push(newProduct);
        }
        
        saveProducts();
        renderProducts();
        updateStats();
        updateChart();
        
        productForm.reset();
        document.getElementById('product-name').focus();
        
        showMessage('Producto agregado correctamente', 'success');
    }
});

// Función para renderizar los productos (COMPLETAMENTE MODIFICADA)
function renderProducts() {
    if (products.length === 0) {
        productsContainer.innerHTML = '<p class="empty-message">No hay productos agregados. Agrega el primero usando el formulario.</p>';
        return;
    }
    
    productsContainer.innerHTML = '';
    
    products.forEach((product, index) => {
        const remaining = product.quantity - product.sold;
        const valueAcquired = product.sold * product.price;
        const totalValue = product.quantity * product.price;
        
        const productCard = document.createElement('div');
        productCard.className = `product-card ${product.expanded ? 'expanded' : ''}`;
        productCard.innerHTML = `
            <div class="product-header ${product.expanded ? 'expanded' : ''}" onclick="toggleProduct(${product.id})">
                <div class="product-name">${product.name}</div>
                <div class="product-actions">
                    <button class="btn-edit" onclick="event.stopPropagation(); toggleEdit(${product.id})">
                        ${product.editing ? 'Guardar' : 'Editar'}
                    </button>
                    <button class="btn-delete" onclick="event.stopPropagation(); deleteProduct(${product.id})">Eliminar</button>
                    <span class="expand-icon ${product.expanded ? 'expanded' : ''}">▼</span>
                </div>
            </div>
            <div class="product-content ${product.expanded ? 'expanded' : ''}">
                <div class="product-metrics">
                    <div class="metric-group">
                        <div class="metric-label">Precio Unitario</div>
                        <div class="metric-value">${formatCurrency(product.price)}</div>
                    </div>
                    <div class="metric-group">
                        <div class="metric-label">Cantidad en Stock</div>
                        <div class="metric-value">${product.quantity}</div>
                    </div>
                    <div class="metric-group">
                        <div class="metric-label">Unidades Vendidas</div>
                        <div class="metric-value">
                            <input type="number" 
                                   class="sales-input" 
                                   value="${product.sold}" 
                                   min="0" 
                                   max="${product.quantity}"
                                   ${product.editing ? '' : 'disabled'}
                                   onchange="updateSoldQuantity(${product.id}, this.value)"
                                   onclick="event.stopPropagation()">
                        </div>
                    </div>
                    <div class="metric-group">
                        <div class="metric-label">Unidades Restantes</div>
                        <div class="metric-value ${remaining === 0 ? 'out-of-stock' : ''}">
                            ${remaining}
                            ${remaining === 0 ? ' (Agotado)' : ''}
                        </div>
                    </div>
                    <div class="metric-group">
                        <div class="metric-label">Valor Adquirido</div>
                        <div class="metric-value">${formatCurrency(valueAcquired)}</div>
                    </div>
                    <div class="metric-group total-value">
                        <div class="metric-label">Valor Total Stock</div>
                        <div class="metric-value">${formatCurrency(totalValue)}</div>
                    </div>
                </div>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
}

// Función para expandir/contraer producto
function toggleProduct(productId) {
    const productIndex = products.findIndex(product => product.id === productId);
    if (productIndex === -1) return;
    
    products[productIndex].expanded = !products[productIndex].expanded;
    renderProducts();
}

// Función para activar/desactivar edición
function toggleEdit(productId) {
    const productIndex = products.findIndex(product => product.id === productId);
    if (productIndex === -1) return;
    
    const product = products[productIndex];
    
    if (product.editing) {
        // Guardar cambios
        const input = document.querySelector(`.product-card:nth-child(${productIndex + 1}) .sales-input`);
        if (input) {
            updateSoldQuantity(productId, input.value);
        }
    }
    
    // Cambiar estado de edición
    products[productIndex].editing = !products[productIndex].editing;
    renderProducts();
}

// Función para actualizar las unidades vendidas (MODIFICADA)
function updateSoldQuantity(productId, newSold) {
    const productIndex = products.findIndex(product => product.id === productId);
    if (productIndex === -1) return;
    
    const product = products[productIndex];
    newSold = parseInt(newSold);
    
    // Validar que no sea mayor que la cantidad disponible
    if (newSold > product.quantity) {
        newSold = product.quantity;
        showMessage('No puedes vender más unidades de las que tienes en stock', 'warning');
    }
    
    if (newSold < 0) {
        newSold = 0;
    }
    
    // Calcular la diferencia para el historial
    const difference = newSold - product.sold;
    
    if (difference !== 0) {
        // Guardar en historial si hay cambio
        saveToSalesHistory(
            product.id,
            product.name,
            difference,
            difference * product.price
        );
        
        // Actualizar el producto
        products[productIndex].sold = newSold;
        products[productIndex].lastUpdated = new Date().toISOString();
        products[productIndex].editing = false; // Desactivar edición después de guardar
        
        // Guardar cambios
        saveProducts();
        
        // Actualizar interfaz y gráfico
        renderProducts();
        updateStats();
        updateChart();
        
        showMessage('Unidades vendidas actualizadas', 'success');
    } else {
        // Si no hay cambios, solo desactivar edición
        products[productIndex].editing = false;
        renderProducts();
    }
}

// Función para eliminar producto (se mantiene igual)
function deleteProduct(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        products = products.filter(product => product.id !== id);
        saveProducts();
        renderProducts();
        updateStats();
        updateChart();
        showMessage('Producto eliminado correctamente', 'success');
    }
}

// Función para actualizar las estadísticas (se mantiene igual)
function updateStats() {
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
    
    totalValueElement.textContent = formatCurrency(totalValue);
    totalProductsElement.textContent = totalProducts;
    totalQuantityElement.textContent = totalQuantity;
    
    updateSalesStats();
}

// Función para actualizar estadísticas de ventas (se mantiene igual)
function updateSalesStats() {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const today = new Date().toISOString().split('T')[0];
    
    const todaySales = salesHistory.filter(sale => sale.date === today);
    const todaySold = todaySales.reduce((sum, sale) => sum + sale.soldQuantity, 0);
    const todayValue = todaySales.reduce((sum, sale) => sum + sale.valueAcquired, 0);
    
    todaySoldElement.textContent = todaySold;
    todayValueElement.textContent = formatCurrency(todayValue);
    
    const last10Days = getLast10Days();
    const last10Sales = salesHistory.filter(sale => last10Days.includes(sale.date));
    const last10Sold = last10Sales.reduce((sum, sale) => sum + sale.soldQuantity, 0);
    const last10Value = last10Sales.reduce((sum, sale) => sum + sale.valueAcquired, 0);
    
    last10SoldElement.textContent = `${last10Sold} unidades`;
    last10ValueElement.textContent = formatCurrency(last10Value);
}

// Función para obtener los últimos 10 días (se mantiene igual)
function getLast10Days() {
    const days = [];
    for (let i = 9; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

// Función para formatear moneda (se mantiene igual)
function formatCurrency(amount) {
    return `${amount.toFixed(2)} CUP`;
}

// Función para mostrar mensajes (se mantiene igual)
function showMessage(message, type) {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}
