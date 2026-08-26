/**
 * Carga y gestión de los datos del producto (ficha, selectores e imágenes).
 */

/* Estado del producto seleccionado. product-details.js lee estas variables. */
let currentVariantId = 'iphone_14_pro_max';
let currentColor = null;
let currentColorId = null;
let currentStorage = null;
let currentStorageId = null;
let currentCondition = null;
let currentConditionId = null;

/** Datos del producto cargado, para reutilizarlos sin volver a pedirlos. */
let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentVariantId = normalizeProductId(urlParams.get('product')) || 'iphone_14_pro_max';
});

/**
 * Punto de entrada llamado desde script.js.
 */
function initProductLoader() {
    setupProductOptionEvents();
    fetchProductData();
}

/* ------------------------------------------------------------------ *
 * Datos
 * ------------------------------------------------------------------ */

/**
 * Descarga la ficha del producto y pinta la interfaz.
 */
async function fetchProductData() {
    try {
        const data = await fetchJson(`api/products/${currentVariantId}.json`);
        currentProduct = data.product;

        updateProductUI(currentProduct);
        fetchOffers(currentVariantId, currentColorId, currentStorageId, currentConditionId);

        return data;
    } catch (error) {
        console.error('Error al obtener los datos del producto:', error);
        showProductError();
        return null;
    }
}

/**
 * Muestra un estado de error cuando el producto no existe o falla la carga.
 */
function showProductError() {
    const title = document.querySelector('.product-title');
    if (title) title.textContent = 'Producto no disponible';

    const offersList = document.querySelector('.offers-list');
    renderStateMessage(offersList, {
        icon: 'fa-triangle-exclamation',
        title: 'No pudimos cargar este producto',
        message: 'Vuelve al buscador e intenta con otro modelo.',
        tone: 'error'
    });

    const price = document.querySelector('.price-container .price-value');
    if (price) {
        price.textContent = 'Sin datos';
        price.classList.add('is-empty');
    }
}

/* ------------------------------------------------------------------ *
 * Interfaz
 * ------------------------------------------------------------------ */

/**
 * Vuelca los datos del producto en la interfaz.
 * @param {Object} product
 */
function updateProductUI(product) {
    if (!product) return;

    const titleElement = document.querySelector('.product-title');
    if (titleElement) titleElement.textContent = product.name;
    document.title = `${product.name} — Comparador de precios`;

    const categoryElement = document.querySelector('.category');
    if (categoryElement) categoryElement.textContent = product.category || '';

    const ratingValueElement = document.querySelector('.rating-value');
    if (ratingValueElement) {
        ratingValueElement.textContent = String(product.rating ?? '—').replace('.', ',');
    }

    const reviewsCountElement = document.querySelector('.reviews-count');
    if (reviewsCountElement) {
        const count = Number(product.reviews_count) || 0;
        reviewsCountElement.textContent = count
            ? `(${count.toLocaleString('es-MX')} reseñas)`
            : '';
    }

    const starsContainer = document.querySelector('.stars');
    if (starsContainer) starsContainer.innerHTML = generateStarRating(product.rating);

    updateProductOptions(product.pickers || []);
    updateProductImages(product.images || []);
}

/**
 * Pinta los selectores de color, almacenamiento y condición.
 * @param {Array} pickers
 */
function updateProductOptions(pickers) {
    const container = document.querySelector('.product-options');
    if (!container) return;

    const groups = [
        { picker: pickers.find(p => p.id === 'color'), type: 'color' },
        { picker: pickers.find(p => p.id === 'internal_memory'), type: 'storage' },
        { picker: pickers.find(p => p.id === 'condicion'), type: 'condition' }
    ].filter(group => group.picker && Array.isArray(group.picker.values) && group.picker.values.length > 0);

    container.innerHTML = groups.map(({ picker, type }) => `
        <div class="option-group">
            <p class="option-row-title">${escapeHtml(picker.name)}</p>
            <div class="option-row" role="group" aria-label="${escapeHtml(picker.name)}">
                ${picker.values.map(value => renderOption(value, type)).join('')}
            </div>
        </div>
    `).join('');

    // Ningún selector arranca activo: así la ficha abre mostrando todas las
    // ofertas del modelo y el usuario va acotando.
}

/**
 * HTML de una opción individual.
 * @param {{id: string, name: string, thumbnail?: string}} value
 * @param {string} type
 * @returns {string}
 */
function renderOption(value, type) {
    const isActive =
        (type === 'color' && value.id === currentColorId) ||
        (type === 'storage' && value.id === currentStorageId) ||
        (type === 'condition' && value.id === currentConditionId);

    const content = value.thumbnail
        ? `<img src="${escapeHtml(value.thumbnail)}" alt="${escapeHtml(value.name)}" class="color-thumbnail" loading="lazy">`
        : escapeHtml(value.name);

    return `
        <button type="button" class="option${isActive ? ' active' : ''}"
                data-type="${escapeHtml(type)}"
                data-value="${escapeHtml(value.name)}"
                data-id="${escapeHtml(value.id)}"
                aria-pressed="${isActive ? 'true' : 'false'}"
                title="${escapeHtml(value.name)}">
            <span class="option-value">${content}</span>
        </button>
    `;
}

/**
 * Delegación de clics sobre los selectores. Volver a tocar una opción activa
 * la deselecciona (quita el filtro).
 */
function setupProductOptionEvents() {
    document.addEventListener('click', event => {
        const option = event.target.closest('.option');
        if (!option) return;

        const optionType = option.dataset.type;
        const wasActive = option.classList.contains('active');

        document.querySelectorAll(`.option[data-type="${optionType}"]`).forEach(el => {
            el.classList.remove('active');
            el.setAttribute('aria-pressed', 'false');
        });

        if (!wasActive) {
            option.classList.add('active');
            option.setAttribute('aria-pressed', 'true');
        }

        const selectedValue = wasActive ? null : option.dataset.value;
        const selectedId = wasActive ? null : option.dataset.id;

        if (optionType === 'color') {
            currentColor = selectedValue;
            currentColorId = selectedId;
            updateProductImages(currentProduct ? currentProduct.images : []);
        } else if (optionType === 'storage') {
            currentStorage = selectedValue;
            currentStorageId = selectedId;
        } else if (optionType === 'condition') {
            currentCondition = selectedValue;
            currentConditionId = selectedId;
        }

        fetchOffers(currentVariantId, currentColorId, currentStorageId, currentConditionId);

        if (typeof updatePriceChartIfVisible === 'function') {
            updatePriceChartIfVisible();
        }
    });
}

/**
 * Actualiza la imagen principal y los puntos del carrusel según el color activo.
 * @param {Array} images
 */
function updateProductImages(images) {
    const productImg = document.getElementById('product-img');
    if (!productImg || !Array.isArray(images) || images.length === 0) return;

    let colorImages = [];

    if (currentColorId || currentColor) {
        colorImages = images.filter(img => img.use_picker_id === currentColorId);
        if (colorImages.length === 0) {
            colorImages = images.filter(img => img.color === currentColor);
        }
    }

    if (colorImages.length === 0) {
        const firstColor = images[0].color;
        colorImages = firstColor ? images.filter(img => img.color === firstColor) : images.slice(0, 1);
    }

    colorImages = [...colorImages].sort((a, b) => (a.position || 0) - (b.position || 0));

    const productName = currentProduct ? currentProduct.name : 'Producto';
    const selectedColor = currentColor || colorImages[0].color || '';

    productImg.src = colorImages[0].url;
    productImg.alt = `${productName} ${selectedColor}`.trim();

    const dotsContainer = document.querySelector('.carousel-dots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = colorImages.map((img, index) => `
        <button type="button" class="dot${index === 0 ? ' active' : ''}"
                data-image-url="${escapeHtml(img.url)}"
                aria-label="Ver imagen ${index + 1} de ${colorImages.length}"></button>
    `).join('');
}
