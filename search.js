/**
 * Módulo para la búsqueda de productos
 */

// Variables globales
let allProducts = [];
let filteredProducts = [];

/**
 * Inicializa la página de búsqueda
 */
document.addEventListener('DOMContentLoaded', () => {
    // Cargar el catálogo de productos
    fetchProductCatalog();
    
    // Configurar eventos de búsqueda
    setupSearchEvents();
    
    // Configurar eventos de filtro por categoría
    setupCategoryFilterEvents();
});

/**
 * Configura los eventos de búsqueda
 */
function setupSearchEvents() {
    const searchInput = document.getElementById('search-input');
    
    // Evento de búsqueda al escribir
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        filterProducts(searchTerm);
    });
}

/**
 * Configura los eventos de filtro por categoría
 */
function setupCategoryFilterEvents() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Desactivar todos los botones
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Activar el botón seleccionado
            button.classList.add('active');
            
            // Filtrar productos por categoría
            const category = button.getAttribute('data-category');
            filterProductsByCategory(category);
        });
    });
}

/**
 * Obtiene el catálogo de productos desde la API
 */
async function fetchProductCatalog() {
    try {
        // URL de la API de catálogo de productos
        const apiUrl = 'api/product-catalog.json';
        
        // Hacer la petición a la API
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Guardar los productos
        allProducts = data.products;
        filteredProducts = [...allProducts];
        
        // Mostrar todos los productos inicialmente
        displayProducts(filteredProducts);
        
    } catch (error) {
        console.error('Error al obtener el catálogo de productos:', error);
        displayError('No se pudo cargar el catálogo de productos. Por favor, intenta de nuevo más tarde.');
    }
}

/**
 * Filtra los productos por término de búsqueda
 * @param {string} searchTerm - Término de búsqueda
 */
function filterProducts(searchTerm) {
    if (!searchTerm) {
        // Si no hay término de búsqueda, mostrar todos los productos (respetando el filtro de categoría)
        const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');
        filterProductsByCategory(activeCategory);
        return;
    }
    
    // Filtrar productos por término de búsqueda
    const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');
    
    if (activeCategory === 'all') {
        // Filtrar en todos los productos
        filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.description.toLowerCase().includes(searchTerm)
        );
    } else {
        // Filtrar en la categoría seleccionada
        filteredProducts = allProducts.filter(product => 
            product.category.toLowerCase() === activeCategory &&
            (product.name.toLowerCase().includes(searchTerm) || 
             product.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Mostrar los productos filtrados
    displayProducts(filteredProducts);
}

/**
 * Filtra los productos por categoría
 * @param {string} category - Categoría seleccionada
 */
function filterProductsByCategory(category) {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (category === 'all') {
        // Mostrar todos los productos (respetando el término de búsqueda)
        if (searchTerm) {
            filteredProducts = allProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                product.description.toLowerCase().includes(searchTerm)
            );
        } else {
            filteredProducts = [...allProducts];
        }
    } else {
        // Filtrar por categoría (respetando el término de búsqueda)
        if (searchTerm) {
            filteredProducts = allProducts.filter(product => 
                product.category.toLowerCase() === category &&
                (product.name.toLowerCase().includes(searchTerm) || 
                 product.description.toLowerCase().includes(searchTerm))
            );
        } else {
            filteredProducts = allProducts.filter(product => 
                product.category.toLowerCase() === category
            );
        }
    }
    
    // Mostrar los productos filtrados
    displayProducts(filteredProducts);
}

/**
 * Muestra los productos en la interfaz
 * @param {Array} products - Array de productos a mostrar
 */
function displayProducts(products) {
    const resultsContainer = document.querySelector('.search-results');
    
    // Limpiar resultados anteriores
    resultsContainer.innerHTML = '';
    
    if (products.length === 0) {
        // Mostrar mensaje si no hay resultados
        resultsContainer.innerHTML = '<div class="no-results">No se encontraron productos</div>';
        return;
    }
    
    // Crear tarjetas de producto
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-product-id', product.id);
        
        // Determinar si el producto tiene variantes disponibles
        const hasVariants = product.variants && product.variants.length > 0;
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <div class="product-details">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-price">Desde ${product.price_from.toFixed(2).replace('.', ',')} €</p>
                </div>
                <div class="product-action">
                    <button class="view-product-btn" ${!hasVariants ? 'disabled' : ''}>
                        ${hasVariants ? 'Ver detalles' : 'No disponible'}
                    </button>
                </div>
            </div>
        `;
        
        // Agregar evento para ver detalles del producto
        if (hasVariants) {
            productCard.querySelector('.view-product-btn').addEventListener('click', () => {
                viewProductDetails(product.id, product.variants[0]);
            });
        }
        
        resultsContainer.appendChild(productCard);
    });
}

/**
 * Muestra un mensaje de error en la interfaz
 * @param {string} message - Mensaje de error
 */
function displayError(message) {
    const resultsContainer = document.querySelector('.search-results');
    resultsContainer.innerHTML = `<div class="error-message">${message}</div>`;
}

/**
 * Redirige a la página de detalles del producto
 * @param {string} productId - ID del producto
 * @param {string} variantId - ID de la variante por defecto
 */
function viewProductDetails(productId, variantId) {
    // Redirigir a la página de detalles con el ID del producto y la variante
    window.location.href = `index.html?product=${productId}&variant=${variantId}`;
}
