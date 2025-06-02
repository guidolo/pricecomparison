/**
 * Módulo para cargar y gestionar datos de productos
 */

// Variable global para almacenar la variante actual
let currentVariantId = 'iphone14-blue-128';

// Obtener parámetros de la URL al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    const variantId = urlParams.get('variant');
    
    if (variantId) {
        currentVariantId = variantId;
    }
    
    // Agregar botón para volver a la búsqueda si venimos de la página de búsqueda
    if (document.referrer.includes('search.html') || urlParams.has('product')) {
        addBackToSearchButton();
    }
});

/**
 * Inicializa el cargador de productos
 */
function initProductLoader() {
    // Cargar datos del producto
    fetchProductData();
    
    // Configurar eventos para opciones de producto
    setupProductOptionEvents();
}

/**
 * Configura los eventos para las opciones de producto
 */
function setupProductOptionEvents() {
    document.addEventListener('click', (event) => {
        // Manejar clics en opciones de producto
        if (event.target.closest('.option')) {
            const option = event.target.closest('.option');
            const optionType = option.dataset.type;
            
            // Desactivar todas las opciones del mismo tipo
            document.querySelectorAll(`.option[data-type="${optionType}"]`).forEach(el => {
                el.classList.remove('active');
            });
            
            // Activar la opción seleccionada
            option.classList.add('active');
            
            // Si cambia el color o el almacenamiento, actualizar la variante
            if (optionType === 'color' || optionType === 'storage') {
                updateSelectedVariant();
            } else if (optionType === 'variant') {
                // Si se selecciona directamente una variante
                currentVariantId = option.getAttribute('data-variant-id');
                
                // Desactivar todas las opciones de variante
                document.querySelectorAll('.option[data-type="variant"]').forEach(el => {
                    el.classList.remove('active');
                });
                
                // Activar la opción seleccionada
                option.classList.add('active');
                
                fetchOffers(currentVariantId);
            }
            
            console.log(`Opción seleccionada: ${optionType} - ${option.querySelector('.option-value').textContent}`);
        }
    });
}

/**
 * Obtiene los datos del producto desde la API
 */
async function fetchProductData() {
    try {
        // URL de la API de productos
        const apiUrl = 'api/products.json';
        
        // Hacer la petición a la API
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Actualizar la interfaz con los datos del producto
        updateProductUI(data.product);
        
        // Cargar las ofertas para la variante seleccionada por defecto
        fetchOffers(currentVariantId);
        
    } catch (error) {
        console.error('Error al obtener los datos del producto:', error);
    }
}

/**
 * Actualiza la interfaz con los datos del producto
 * @param {Object} product - Datos del producto
 */
function updateProductUI(product) {
    // Actualizar título y categoría
    document.querySelector('.product-title').textContent = product.name;
    document.querySelector('.category').textContent = product.category;
    
    // Actualizar calificación
    document.querySelector('.rating-value').textContent = product.rating.toString().replace('.', ',');
    document.querySelector('.reviews-count').textContent = product.reviews_count;
    
    // Actualizar opciones de producto (colores, almacenamiento, variantes)
    updateProductOptions(product.variants);
    
    // Actualizar precio desde
    const defaultVariant = product.variants.find(v => v.variant_id === currentVariantId);
    if (defaultVariant) {
        document.querySelector('.price-value').textContent = `${defaultVariant.price_from.toFixed(2).replace('.', ',')} €`;
    }
    
    // Actualizar imágenes si están disponibles
    updateProductImages(product.images);
}

/**
 * Actualiza las opciones de producto en la interfaz
 * @param {Array} variants - Array de variantes del producto
 */
function updateProductOptions(variants) {
    // Obtener opciones únicas de color y almacenamiento
    const colors = [...new Set(variants.map(v => v.color))];
    const storages = [...new Set(variants.map(v => v.storage))];
    
    // Actualizar opciones de color
    const colorOptions = document.querySelectorAll('.option[data-type="color"]');
    if (colorOptions.length > 0) {
        const colorContainer = colorOptions[0].parentElement;
        colorContainer.innerHTML = '';
        
        colors.forEach((color, index) => {
            const variant = variants.find(v => v.color === color);
            const isActive = color === getSelectedColor();
            
            const optionElement = document.createElement('div');
            optionElement.className = `option${isActive ? ' active' : ''}`;
            optionElement.setAttribute('data-type', 'color');
            optionElement.setAttribute('data-value', color);
            optionElement.innerHTML = `
                <div class="option-value">${color}</div>
                <div class="option-label">${variant.color_label}</div>
            `;
            
            colorContainer.appendChild(optionElement);
        });
    }
    
    // Actualizar opciones de almacenamiento
    const storageOptions = document.querySelectorAll('.option[data-type="storage"]');
    if (storageOptions.length > 0) {
        const storageContainer = storageOptions[0].parentElement;
        storageContainer.innerHTML = '';
        
        storages.forEach((storage, index) => {
            const variant = variants.find(v => v.storage === storage);
            const isActive = storage === getSelectedStorage();
            
            const optionElement = document.createElement('div');
            optionElement.className = `option${isActive ? ' active' : ''}`;
            optionElement.setAttribute('data-type', 'storage');
            optionElement.setAttribute('data-value', storage);
            optionElement.innerHTML = `
                <div class="option-value">${storage}</div>
                <div class="option-label">${variant.storage_label}</div>
            `;
            
            storageContainer.appendChild(optionElement);
        });
    }
    
    // Actualizar opciones de variante
    updateVariantOptions(variants);
}

/**
 * Actualiza las opciones de variante en la interfaz
 * @param {Array} variants - Array de variantes del producto
 */
function updateVariantOptions(variants) {
    const variantOptions = document.querySelectorAll('.option[data-type="variant"]');
    if (variantOptions.length > 0) {
        const variantContainer = variantOptions[0].parentElement;
        variantContainer.innerHTML = '';
        
        variants.forEach((variant, index) => {
            const isActive = variant.variant_id === currentVariantId;
            
            const optionElement = document.createElement('div');
            optionElement.className = `option${isActive ? ' active' : ''}`;
            optionElement.setAttribute('data-type', 'variant');
            optionElement.setAttribute('data-variant-id', variant.variant_id);
            optionElement.innerHTML = `
                <div class="option-value">${variant.variant_name}</div>
                <div class="option-label">${variant.variant_label}</div>
            `;
            
            variantContainer.appendChild(optionElement);
        });
    }
}

/**
 * Agrega un botón para volver a la página de búsqueda
 */
function addBackToSearchButton() {
    // Verificar si ya existe el botón
    if (document.querySelector('.back-to-search-btn')) {
        return;
    }
    
    // Crear el botón
    const backButton = document.createElement('button');
    backButton.className = 'back-to-search-btn';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Volver a la búsqueda';
    
    // Agregar evento para volver a la página de búsqueda
    backButton.addEventListener('click', () => {
        window.location.href = 'search.html';
    });
    
    // Insertar el botón al principio de la sección de producto
    const productView = document.querySelector('.product-view');
    productView.insertBefore(backButton, productView.firstChild);
}

/**
 * Actualiza la URL con la variante seleccionada sin recargar la página
 * @param {string} variantId - ID de la variante
 */
function updateUrlWithVariant(variantId) {
    // Obtener los parámetros actuales de la URL
    const urlParams = new URLSearchParams(window.location.search);
    
    // Actualizar o agregar el parámetro de variante
    urlParams.set('variant', variantId);
    
    // Actualizar la URL sin recargar la página
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
}

/**
 * Actualiza las imágenes del producto en la interfaz
 * @param {Array} images - Array de imágenes del producto
 */
function updateProductImages(images) {
    const productImg = document.getElementById('product-img');
    if (productImg) {
        const currentColor = getSelectedColor();
        const colorImages = images.filter(img => img.color === currentColor);
        
        if (colorImages.length > 0) {
            // Ordenar imágenes por posición
            colorImages.sort((a, b) => a.position - b.position);
            
            // Actualizar la imagen principal
            productImg.src = colorImages[0].url;
            productImg.alt = `${document.querySelector('.product-title').textContent} ${currentColor}`;
            
            // Actualizar los puntos del carrusel
            const dotsContainer = document.querySelector('.carousel-dots');
            if (dotsContainer) {
                dotsContainer.innerHTML = '';
                
                colorImages.forEach((img, index) => {
                    const dot = document.createElement('span');
                    dot.className = `dot${index === 0 ? ' active' : ''}`;
                    dot.setAttribute('data-image-url', img.url);
                    dot.setAttribute('data-position', img.position);
                    
                    dotsContainer.appendChild(dot);
                });
            }
        }
    }
}

/**
 * Obtiene el color seleccionado actualmente
 * @returns {string} - Color seleccionado
 */
function getSelectedColor() {
    const activeColorOption = document.querySelector('.option[data-type="color"].active');
    return activeColorOption ? activeColorOption.getAttribute('data-value') : 'Azul';
}

/**
 * Obtiene el almacenamiento seleccionado actualmente
 * @returns {string} - Almacenamiento seleccionado
 */
function getSelectedStorage() {
    const activeStorageOption = document.querySelector('.option[data-type="storage"].active');
    return activeStorageOption ? activeStorageOption.getAttribute('data-value') : '128 GB';
}

/**
 * Actualiza la variante seleccionada basada en el color y almacenamiento actuales
 */
function updateSelectedVariant() {
    const color = getSelectedColor();
    const storage = getSelectedStorage();
    
    // Construir el ID de la variante basado en el color y almacenamiento
    const newVariantId = `iphone14-${color.toLowerCase()}-${storage.replace(' ', '').toLowerCase()}`;
    
    // Actualizar la variante actual
    currentVariantId = newVariantId;
    
    // Actualizar la opción de variante seleccionada en la UI
    const variantOptions = document.querySelectorAll('.option[data-type="variant"]');
    variantOptions.forEach(option => {
        if (option.getAttribute('data-variant-id') === currentVariantId) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Actualizar la URL con la nueva variante
    updateUrlWithVariant(currentVariantId);
    
    // Cargar las ofertas para la nueva variante
    fetchOffers(currentVariantId);
    
    // Actualizar las imágenes
    fetchProductData();
}
