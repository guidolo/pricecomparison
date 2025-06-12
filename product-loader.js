/**
 * Módulo para cargar y gestionar datos de productos
 */

// Variable global para almacenar la variante actual
let currentVariantId = 'iphone14-pro-max';
let currentColor = 'Morado oscuro';
let currentStorage = '128 GB';
let currentRam = '6 GB';

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
            
            // Actualizar la variable correspondiente según el tipo de opción
            const selectedValue = option.getAttribute('data-value');
            
            if (optionType === 'color') {
                currentColor = selectedValue;
                // Actualizar imágenes según el color seleccionado
                fetchProductData();
                // Filtrar ofertas por color
                fetchOffers(currentVariantId, currentColor);
            } else if (optionType === 'storage') {
                currentStorage = selectedValue;
                fetchOffers(currentVariantId, currentColor);
            } else if (optionType === 'ram') {
                currentRam = selectedValue;
                fetchOffers(currentVariantId, currentColor);
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
        const apiUrl = 'api/iphone_14_pro_max_consolidated.json';
        
        // Hacer la petición a la API
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Actualizar la interfaz con los datos del producto
        updateProductUI(data.product);
        
        // Cargar las ofertas para la variante seleccionada por defecto
        fetchOffers(currentVariantId, currentColor);
        
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
    document.querySelector('.category').textContent = product.category || 'Handys & Smartphones';
    
    // Actualizar calificación
    document.querySelector('.rating-value').textContent = product.rating.toString().replace('.', ',');
    document.querySelector('.reviews-count').textContent = product.reviews_count;
    
    // Actualizar opciones de producto (colores, almacenamiento, RAM)
    updateProductOptions(product.pickers);
    
    // Actualizar imágenes
    updateProductImages(product.images);
}

/**
 * Actualiza las opciones de producto en la interfaz
 * @param {Array} pickers - Array de selectores del producto
 */
function updateProductOptions(pickers) {
    // Obtener los pickers de color, almacenamiento y RAM
    const colorPicker = pickers.find(picker => picker.id === 'color');
    const storagePicker = pickers.find(picker => picker.id === 'internal_memory');
    const ramPicker = pickers.find(picker => picker.id === 'ram');
    
    // Obtener el contenedor de opciones
    const productOptions = document.querySelector('.product-options');
    if (productOptions) {
        // Limpiar el contenedor de opciones
        productOptions.innerHTML = '';
        
        // Crear fila para opciones de color
        if (colorPicker && colorPicker.values.length > 0) {
            const colorRow = document.createElement('div');
            colorRow.className = 'option-row';
            
            // Agregar título para la fila de colores
            const colorTitle = document.createElement('div');
            colorTitle.className = 'option-row-title';
            colorTitle.textContent = colorPicker.name;
            productOptions.appendChild(colorTitle);
            
            // Agregar todas las opciones de color disponibles
            colorPicker.values.forEach((colorValue, index) => {
                const colorOption = document.createElement('div');
                colorOption.className = `option${index === 0 ? ' active' : ''}`;
                colorOption.dataset.type = 'color';
                colorOption.setAttribute('data-value', colorValue.name);
                
                colorOption.innerHTML = `
                    <div class="option-value">${colorValue.name}</div>
                `;
                
                colorRow.appendChild(colorOption);
                
                // Establecer el color inicial
                if (index === 0) {
                    currentColor = colorValue.name;
                }
            });
            
            productOptions.appendChild(colorRow);
        }
        
        // Crear fila para opciones de almacenamiento
        if (storagePicker && storagePicker.values.length > 0) {
            const storageRow = document.createElement('div');
            storageRow.className = 'option-row';
            
            // Agregar título para la fila de almacenamiento
            const storageTitle = document.createElement('div');
            storageTitle.className = 'option-row-title';
            storageTitle.textContent = storagePicker.name;
            productOptions.appendChild(storageTitle);
            
            // Agregar todas las opciones de almacenamiento disponibles
            storagePicker.values.forEach((storageValue, index) => {
                const storageOption = document.createElement('div');
                storageOption.className = `option${index === 0 ? ' active' : ''}`;
                storageOption.dataset.type = 'storage';
                storageOption.setAttribute('data-value', storageValue.name);
                
                storageOption.innerHTML = `
                    <div class="option-value">${storageValue.name}</div>
                `;
                
                storageRow.appendChild(storageOption);
                
                // Establecer el almacenamiento inicial
                if (index === 0) {
                    currentStorage = storageValue.name;
                }
            });
            
            productOptions.appendChild(storageRow);
        }
        
        // Crear fila para opciones de RAM
        if (ramPicker && ramPicker.values.length > 0) {
            const ramRow = document.createElement('div');
            ramRow.className = 'option-row';
            
            // Agregar título para la fila de RAM
            const ramTitle = document.createElement('div');
            ramTitle.className = 'option-row-title';
            ramTitle.textContent = ramPicker.name;
            productOptions.appendChild(ramTitle);
            
            // Agregar todas las opciones de RAM disponibles
            ramPicker.values.forEach((ramValue, index) => {
                const ramOption = document.createElement('div');
                ramOption.className = `option${index === 0 ? ' active' : ''}`;
                ramOption.dataset.type = 'ram';
                ramOption.setAttribute('data-value', ramValue.name);
                
                ramOption.innerHTML = `
                    <div class="option-value">${ramValue.name}</div>
                `;
                
                ramRow.appendChild(ramOption);
                
                // Establecer la RAM inicial
                if (index === 0) {
                    currentRam = ramValue.name;
                }
            });
            
            productOptions.appendChild(ramRow);
        }
    }
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
        // Filtrar imágenes por el color seleccionado actualmente
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
    return currentColor;
}

/**
 * Obtiene el almacenamiento seleccionado actualmente
 * @returns {string} - Almacenamiento seleccionado
 */
function getSelectedStorage() {
    return currentStorage;
}

/**
 * Obtiene la RAM seleccionada actualmente
 * @returns {string} - RAM seleccionada
 */
function getSelectedRam() {
    return currentRam;
}

/**
 * Actualiza la variante seleccionada basada en el color y almacenamiento actuales
 */
function updateSelectedVariant() {
    // Ya no necesitamos construir un ID de variante basado en color y almacenamiento
    // porque ahora usamos el ID del producto y filtramos por color
    
    // Actualizar la URL con la nueva variante
    updateUrlWithVariant(currentVariantId);
    
    // Cargar las ofertas para la nueva variante, filtrando por color
    fetchOffers(currentVariantId, currentColor);
    
    // Actualizar las imágenes
    fetchProductData();
}
