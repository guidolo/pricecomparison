/**
 * Módulo para cargar y gestionar datos de productos
 */

// Variables globales para el estado del producto
let currentVariantId = 'iphone_14_pro_max';
let currentColor = null;
let currentColorId = null;
let currentStorage = null;
let currentStorageId = null;
let currentCondition = null;
let currentConditionId = null;

// Obtener parámetros de la URL al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product') || 'iphone_14_pro_max';
    
    if (productId) {
        // Ahora usamos el product_id directamente
        currentVariantId = productId;
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
    console.log('initProductLoader called, currentVariantId:', currentVariantId);
    
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
            
            // Verificar si la opción ya está activa
            const isCurrentlyActive = option.classList.contains('active');
            
            // Desactivar todas las opciones del mismo tipo
            document.querySelectorAll(`.option[data-type="${optionType}"]`).forEach(el => {
                el.classList.remove('active');
            });
            
            // Si la opción no estaba activa, activarla; si estaba activa, desactivarla
            if (!isCurrentlyActive) {
                option.classList.add('active');
            }
            
            // Actualizar la variable correspondiente según el tipo de opción
            let selectedValue = null;
            let selectedId = null;
            
            // Solo obtener valores si hay una opción activa
            if (option.classList.contains('active')) {
                selectedValue = option.getAttribute('data-value');
                selectedId = option.getAttribute('data-id');
            }
            
            if (optionType === 'color') {
                currentColor = selectedValue;
                currentColorId = selectedId;
                console.log('Color seleccionado:', currentColor);
                console.log('Color ID seleccionado:', currentColorId);
                
                // Obtener los datos del producto pero sin actualizar la UI completa
                fetchProductData(true).then(data => {
                    if (data) {
                        // Solo actualizar las imágenes para el color seleccionado
                        updateProductImages(data.product.images);
                    }
                });
                
                // Filtrar ofertas por color, almacenamiento y condición usando el ID
                fetchOffers(currentVariantId, currentColorId, currentStorageId, currentConditionId);
                
                // Actualizar el gráfico de precios si está visible
                if (typeof updatePriceChartIfVisible === 'function') {
                    console.log('Calling updatePriceChartIfVisible for color change');
                    updatePriceChartIfVisible();
                } else {
                    console.log('updatePriceChartIfVisible function not available');
                }
            } else if (optionType === 'storage') {
                currentStorage = selectedValue;
                currentStorageId = selectedId;
                console.log('Storage seleccionado:', currentStorage);
                console.log('Storage ID seleccionado:', currentStorageId);
                // Filtrar ofertas por color, almacenamiento y condición usando el ID
                fetchOffers(currentVariantId, currentColorId, currentStorageId, currentConditionId);
                
                // Actualizar el gráfico de precios si está visible
                if (typeof updatePriceChartIfVisible === 'function') {
                    console.log('Calling updatePriceChartIfVisible for storage change');
                    updatePriceChartIfVisible();
                } else {
                    console.log('updatePriceChartIfVisible function not available');
                }
            } else if (optionType === 'condition') {
                currentCondition = selectedValue;
                currentConditionId = selectedId;
                console.log('Condición seleccionada:', currentCondition);
                console.log('Condición ID seleccionada:', currentConditionId);
                // Filtrar ofertas por color, almacenamiento y condición usando el ID
                fetchOffers(currentVariantId, currentColorId, currentStorageId, currentConditionId);
                
                // Actualizar el gráfico de precios si está visible
                if (typeof updatePriceChartIfVisible === 'function') {
                    console.log('Calling updatePriceChartIfVisible for condition change');
                    updatePriceChartIfVisible();
                } else {
                    console.log('updatePriceChartIfVisible function not available');
                }
            }
            
            console.log(`Opción ${isCurrentlyActive ? 'deseleccionada' : 'seleccionada'}: ${optionType} - ${selectedValue || 'ninguna'}`);
        }
    });
}

/**
 * Obtiene los datos del producto desde la API
 */
async function fetchProductData(skipUpdateUI = false) {
    try {
        // Construir el path del archivo JSON según el producto
        const apiUrl = `api/products/${currentVariantId}.json`;
        console.log('Fetching product data from:', apiUrl);
        
        // Hacer la petición a la API
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Product data loaded successfully:', data);
        
        // Guardar los valores actuales antes de actualizar la UI
        const savedColorId = currentColorId;
        const savedStorageId = currentStorageId;
        const savedColor = currentColor;
        const savedStorage = currentStorage;
        const savedConditionId = currentConditionId;
        const savedCondition = currentCondition;
        
        // Actualizar la interfaz con los datos del producto solo si no se indica lo contrario
        if (!skipUpdateUI) {
            console.log('Updating product UI with data:', data.product);
            updateProductUI(data.product);
            
            // Restaurar las selecciones previas solo si existían
            if (savedColorId && savedColor) {
                // Buscar y activar la opción de color correspondiente
                const colorOptions = document.querySelectorAll('.option[data-type="color"]');
                colorOptions.forEach(option => {
                    if (option.getAttribute('data-id') === savedColorId) {
                        // Desactivar todas las opciones de color
                        colorOptions.forEach(opt => opt.classList.remove('active'));
                        // Activar esta opción
                        option.classList.add('active');
                        currentColorId = savedColorId;
                        currentColor = savedColor;
                    }
                });
            }
            
            if (savedStorageId && savedStorage) {
                // Buscar y activar la opción de almacenamiento correspondiente
                const storageOptions = document.querySelectorAll('.option[data-type="storage"]');
                storageOptions.forEach(option => {
                    if (option.getAttribute('data-id') === savedStorageId) {
                        // Desactivar todas las opciones de almacenamiento
                        storageOptions.forEach(opt => opt.classList.remove('active'));
                        // Activar esta opción
                        option.classList.add('active');
                        currentStorageId = savedStorageId;
                        currentStorage = savedStorage;
                    }
                });
            }
            
            if (savedConditionId && savedCondition) {
                // Buscar y activar la opción de condición correspondiente
                const conditionOptions = document.querySelectorAll('.option[data-type="condition"]');
                conditionOptions.forEach(option => {
                    if (option.getAttribute('data-id') === savedConditionId) {
                        // Desactivar todas las opciones de condición
                        conditionOptions.forEach(opt => opt.classList.remove('active'));
                        // Activar esta opción
                        option.classList.add('active');
                        currentConditionId = savedConditionId;
                        currentCondition = savedCondition;
                    }
                });
            }
        }
        
        // Actualizar las imágenes según el color seleccionado
        updateProductImages(data.product.images);
        
        // Esperar a que se actualice la interfaz y los pickers estén disponibles
        setTimeout(() => {
            // Cargar las ofertas para la variante seleccionada usando IDs (pueden ser null si no hay filtros)
            fetchOffers(currentVariantId, currentColorId, currentStorageId, currentConditionId);
        }, 100);
        
        return data;
    } catch (error) {
        console.error('Error al obtener los datos del producto:', error);
        return null;
    }
}

/**
 * Genera el HTML para mostrar una calificación con estrellas
 * @param {number} rating - Calificación (de 0 a 5)
 * @returns {string} - HTML con las estrellas
 */
function generateStarRating(rating) {
    let starsHTML = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Estrellas completas
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Media estrella si es necesario
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Estrellas vacías
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

/**
 * Actualiza la interfaz con los datos del producto
 * @param {Object} product - Datos del producto
 */
function updateProductUI(product) {
    console.log('updateProductUI called with product:', product);
    
    // Actualizar título y categoría
    const titleElement = document.querySelector('.product-title');
    const categoryElement = document.querySelector('.category');
    
    console.log('Title element:', titleElement);
    console.log('Category element:', categoryElement);
    
    if (titleElement) {
        titleElement.textContent = product.name;
        console.log('Updated title to:', product.name);
    }
    
    if (categoryElement) {
        categoryElement.textContent = product.category || 'Smartphones';
        console.log('Updated category to:', product.category || 'Smartphones');
    }
    
    // Actualizar calificación
    const ratingValueElement = document.querySelector('.rating-value');
    const reviewsCountElement = document.querySelector('.reviews-count');
    
    if (ratingValueElement) {
        ratingValueElement.textContent = product.rating.toString().replace('.', ',');
        console.log('Updated rating to:', product.rating);
    }
    
    if (reviewsCountElement) {
        reviewsCountElement.textContent = `(${product.reviews_count})`;
        console.log('Updated reviews count to:', product.reviews_count);
    }
    
    // Actualizar estrellas
    const starsContainer = document.querySelector('.stars');
    if (starsContainer) {
        starsContainer.innerHTML = generateStarRating(product.rating);
        console.log('Updated stars for rating:', product.rating);
    }
    
    // Actualizar opciones de producto (colores, almacenamiento y condición)
    console.log('Updating product options with pickers:', product.pickers);
    updateProductOptions(product.pickers);
    
    // Actualizar imágenes
    console.log('Updating product images:', product.images);
    updateProductImages(product.images);
}

/**
 * Actualiza las opciones de producto en la interfaz
 * @param {Array} pickers - Array de selectores del producto
 */
function updateProductOptions(pickers) {
    // Obtener los pickers de color, almacenamiento y condición
    const colorPicker = pickers.find(picker => picker.id === 'color');
    const storagePicker = pickers.find(picker => picker.id === 'internal_memory');
    const conditionPicker = pickers.find(picker => picker.id === 'condicion');
    
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
                // Seleccionar automáticamente el primer color si no hay ninguno seleccionado
                const isFirstColor = index === 0 && !currentColorId;
                colorOption.className = `option${isFirstColor ? ' active' : ''}`;
                colorOption.dataset.type = 'color';
                colorOption.setAttribute('data-value', colorValue.name);
                colorOption.setAttribute('data-id', colorValue.id);
                
                colorOption.innerHTML = `
                    <div class="option-value">${colorValue.name}</div>
                `;
                
                colorRow.appendChild(colorOption);
                
                // Si es el primer color y no hay ninguno seleccionado, establecerlo como actual
                if (isFirstColor) {
                    currentColor = colorValue.name;
                    currentColorId = colorValue.id;
                    console.log('Color seleccionado por defecto:', currentColor);
                    console.log('Color ID seleccionado por defecto:', currentColorId);
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
            
            // Agregar todas las opciones de almacenamiento disponibles (sin activar ninguna por defecto)
            storagePicker.values.forEach((storageValue, index) => {
                const storageOption = document.createElement('div');
                storageOption.className = 'option'; // Sin 'active' por defecto
                storageOption.dataset.type = 'storage';
                storageOption.setAttribute('data-value', storageValue.name);
                storageOption.setAttribute('data-id', storageValue.id);
                
                storageOption.innerHTML = `
                    <div class="option-value">${storageValue.name}</div>
                `;
                
                storageRow.appendChild(storageOption);
            });
            
            productOptions.appendChild(storageRow);
        }
        
        // Crear fila para opciones de condición
        if (conditionPicker && conditionPicker.values.length > 0) {
            const conditionRow = document.createElement('div');
            conditionRow.className = 'option-row';
            
            // Agregar título para la fila de condición
            const conditionTitle = document.createElement('div');
            conditionTitle.className = 'option-row-title';
            conditionTitle.textContent = conditionPicker.name;
            productOptions.appendChild(conditionTitle);
            
            // Agregar todas las opciones de condición disponibles (sin activar ninguna por defecto)
            conditionPicker.values.forEach((conditionValue, index) => {
                const conditionOption = document.createElement('div');
                conditionOption.className = 'option'; // Sin 'active' por defecto
                conditionOption.dataset.type = 'condition';
                conditionOption.setAttribute('data-value', conditionValue.name);
                conditionOption.setAttribute('data-id', conditionValue.id);
                
                conditionOption.innerHTML = `
                    <div class="option-value">${conditionValue.name}</div>
                `;
                
                conditionRow.appendChild(conditionOption);
            });
            
            productOptions.appendChild(conditionRow);
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
 * Actualiza la URL con el producto seleccionado sin recargar la página
 * @param {string} productId - ID del producto
 */
function updateUrlWithVariant(productId) {
    // Obtener los parámetros actuales de la URL
    const urlParams = new URLSearchParams(window.location.search);
    
    // Actualizar o agregar el parámetro de producto
    urlParams.set('product', productId);
    
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
    if (productImg && images) {
        console.log('Actualizando imágenes para color:', currentColor);
        console.log('Actualizando imágenes para colorId:', currentColorId);
        
        let colorImages = [];
        
        // Si hay un color seleccionado, buscar sus imágenes
        if (currentColorId || currentColor) {
            // Primero intentar filtrar por ID de color (usando use_picker_id)
            colorImages = images.filter(img => img.use_picker_id === currentColorId);
            
            // Si no hay imágenes con ese ID, intentar filtrar por nombre de color
            if (colorImages.length === 0) {
                colorImages = images.filter(img => img.color === currentColor);
            }
        }
        
        // Si no hay imágenes para el color seleccionado o no hay color seleccionado,
        // mostrar las imágenes del primer color disponible
        if (colorImages.length === 0) {
            console.log('No hay color seleccionado o no se encontraron imágenes, mostrando primer color disponible');
            
            // Obtener el primer color disponible de las imágenes
            const firstColor = images[0]?.color;
            if (firstColor) {
                colorImages = images.filter(img => img.color === firstColor);
                console.log('Mostrando imágenes del primer color disponible:', firstColor);
            }
        }
        
        console.log('Imágenes encontradas:', colorImages.length);
        
        if (colorImages.length > 0) {
            // Ordenar imágenes por posición
            colorImages.sort((a, b) => a.position - b.position);
            
            // Actualizar la imagen principal
            productImg.src = colorImages[0].url;
            const selectedColor = currentColor || colorImages[0].color;
            productImg.alt = `${document.querySelector('.product-title').textContent} ${selectedColor}`;
            
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
 * Obtiene el ID del color seleccionado actualmente
 * @returns {string} - ID del color seleccionado
 */
function getSelectedColorId() {
    const activeColorOption = document.querySelector('.option[data-type="color"].active');
    if (!activeColorOption) return null;
    
    // Obtener el ID directamente del atributo data-id
    const colorId = activeColorOption.getAttribute('data-id');
    console.log('getSelectedColorId - elemento:', activeColorOption);
    console.log('getSelectedColorId - ID obtenido:', colorId);
    
    return colorId;
}

/**
 * Obtiene el almacenamiento seleccionado actualmente
 * @returns {string} - Almacenamiento seleccionado
 */
function getSelectedStorage() {
    return currentStorage;
}

/**
 * Obtiene el ID del almacenamiento seleccionado actualmente
 * @returns {string} - ID del almacenamiento seleccionado
 */
function getSelectedStorageId() {
    const activeStorageOption = document.querySelector('.option[data-type="storage"].active');
    return activeStorageOption ? activeStorageOption.getAttribute('data-id') : null;
}

/**
 * Obtiene la condición seleccionada actualmente
 * @returns {string} - Condición seleccionada
 */
function getSelectedCondition() {
    return currentCondition;
}

/**
 * Obtiene el ID de la condición seleccionada actualmente
 * @returns {string} - ID de la condición seleccionada
 */
function getSelectedConditionId() {
    const activeConditionOption = document.querySelector('.option[data-type="condition"].active');
    return activeConditionOption ? activeConditionOption.getAttribute('data-id') : null;
}

/**
 * Actualiza la variante seleccionada basada en el color y almacenamiento actuales
 */
function updateSelectedVariant() {
    // Ya no necesitamos construir un ID de variante basado en color y almacenamiento
    // porque ahora usamos el ID del producto y filtramos por color, almacenamiento y condición
    
    // Actualizar la URL con la nueva variante
    updateUrlWithVariant(currentVariantId);
    
    console.log('updateSelectedVariant - usando IDs directamente:');
    console.log('currentColorId:', currentColorId);
    console.log('currentStorageId:', currentStorageId);
    console.log('currentConditionId:', currentConditionId);
    
    // Cargar las ofertas para la nueva variante, filtrando por color, almacenamiento y condición usando IDs
    fetchOffers(currentVariantId, currentColorId, currentStorageId, currentConditionId);
    
    // Obtener los datos del producto pero sin actualizar la UI completa
    fetchProductData(true).then(data => {
        if (data) {
            // Solo actualizar las imágenes para el color seleccionado
            updateProductImages(data.product.images);
        }
    });
}
