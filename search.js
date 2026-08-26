/**
 * Buscador de productos.
 * Carga el catálogo, filtra por texto y por generación, y navega al detalle.
 */

const state = {
    products: [],
    query: '',
    generation: 'all'
};

const DOM = {};

document.addEventListener('DOMContentLoaded', () => {
    DOM.input = document.getElementById('search-input');
    DOM.clear = document.getElementById('search-clear');
    DOM.filters = document.getElementById('category-filters');
    DOM.results = document.querySelector('.search-results');
    DOM.meta = document.getElementById('search-meta');

    startStatusBarClock();
    setupSearchEvents();
    fetchProductCatalog();
});

/* ------------------------------------------------------------------ *
 * Eventos
 * ------------------------------------------------------------------ */

function setupSearchEvents() {
    DOM.input.addEventListener('input', () => {
        state.query = DOM.input.value.toLowerCase().trim();
        DOM.clear.classList.toggle('is-visible', state.query.length > 0);
        applyFilters();
    });

    DOM.clear.addEventListener('click', () => {
        DOM.input.value = '';
        state.query = '';
        DOM.clear.classList.remove('is-visible');
        DOM.input.focus();
        applyFilters();
    });

    DOM.filters.addEventListener('click', event => {
        const button = event.target.closest('.category-btn');
        if (!button) return;

        DOM.filters.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');

        state.generation = button.dataset.generation;
        applyFilters();
    });
}

/* ------------------------------------------------------------------ *
 * Catálogo
 * ------------------------------------------------------------------ */

async function fetchProductCatalog() {
    renderResultsSkeleton();

    try {
        const data = await fetchJson('api/product-catalog.json');
        state.products = (data.products || []).map(product => ({
            ...product,
            generation: detectGeneration(product.name)
        }));

        renderGenerationFilters();
        applyFilters();
    } catch (error) {
        console.error('Error al obtener el catálogo de productos:', error);
        DOM.meta.textContent = '';
        renderStateMessage(DOM.results, {
            icon: 'fa-triangle-exclamation',
            title: 'No pudimos cargar el catálogo',
            message: 'Revisa tu conexión e intenta de nuevo.',
            tone: 'error'
        });
    }
}

/**
 * Deduce la generación a partir del nombre ("iPhone 14 Pro" -> "14").
 * El catálogo no trae categoría, así que la derivamos del modelo.
 * @param {string} name
 * @returns {string}
 */
function detectGeneration(name) {
    const match = /(\d{1,2})/.exec(name || '');
    return match ? match[1] : 'otros';
}

/**
 * Construye los chips de filtro con las generaciones presentes en el catálogo.
 */
function renderGenerationFilters() {
    const generations = [...new Set(state.products.map(p => p.generation))]
        .filter(gen => gen !== 'otros')
        .sort((a, b) => Number(b) - Number(a));

    if (generations.length < 2) {
        DOM.filters.innerHTML = '';
        return;
    }

    const chips = [{ id: 'all', label: 'Todos' }]
        .concat(generations.map(gen => ({ id: gen, label: `iPhone ${gen}` })));

    DOM.filters.innerHTML = chips.map((chip, index) => `
        <button type="button" class="category-btn${index === 0 ? ' active' : ''}"
                data-generation="${escapeHtml(chip.id)}"
                aria-pressed="${index === 0 ? 'true' : 'false'}">${escapeHtml(chip.label)}</button>
    `).join('');
}

/* ------------------------------------------------------------------ *
 * Filtrado y render
 * ------------------------------------------------------------------ */

function applyFilters() {
    const { query, generation } = state;

    const filtered = state.products.filter(product => {
        const matchesGeneration = generation === 'all' || product.generation === generation;
        if (!matchesGeneration) return false;
        if (!query) return true;

        const haystack = `${product.name || ''} ${product.description || ''}`.toLowerCase();
        return haystack.includes(query);
    });

    // Los productos con ofertas primero, luego por precio ascendente.
    filtered.sort((a, b) => {
        const aHas = (a.offer_count || 0) > 0;
        const bHas = (b.offer_count || 0) > 0;
        if (aHas !== bHas) return aHas ? -1 : 1;
        return (a.price_from || 0) - (b.price_from || 0);
    });

    displayProducts(filtered);
}

function displayProducts(products) {
    DOM.results.innerHTML = '';

    if (products.length === 0) {
        DOM.meta.textContent = '';
        renderStateMessage(DOM.results, {
            icon: 'fa-magnifying-glass',
            title: 'Sin resultados',
            message: 'Prueba con otro modelo o quita los filtros.'
        });
        return;
    }

    DOM.meta.textContent = `${products.length} ${products.length === 1 ? 'producto' : 'productos'}`;

    const fragment = document.createDocumentFragment();
    products.forEach(product => fragment.appendChild(createProductCard(product)));
    DOM.results.appendChild(fragment);
}

/**
 * Crea la tarjeta de un producto del catálogo.
 * @param {Object} product
 * @returns {HTMLElement}
 */
function createProductCard(product) {
    const offerCount = product.offer_count || 0;
    const hasOffers = offerCount > 0;

    const card = document.createElement(hasOffers ? 'button' : 'div');
    card.className = `product-card${hasOffers ? '' : ' product-card--disabled'}`;
    card.dataset.productId = product.id;
    if (hasOffers) {
        card.type = 'button';
        card.setAttribute('aria-label', `Ver ofertas de ${product.name}`);
    }

    const priceHtml = hasOffers && product.price_from
        ? `<p class="product-price"><span>Desde</span> ${escapeHtml(formatPrice(product.price_from))}</p>`
        : '';

    const offersHtml = hasOffers
        ? `<p class="product-offers"><strong>${offerCount}</strong> ${offerCount === 1 ? 'oferta disponible' : 'ofertas disponibles'}</p>`
        : '<p class="product-offers">Sin ofertas por ahora</p>';

    card.innerHTML = `
        <div class="product-image">
            <img src="${escapeHtml(product.image || 'images/iphone14.svg')}" alt="${escapeHtml(product.name)}" loading="lazy">
        </div>
        <div class="product-info">
            <h3 class="product-name">${escapeHtml(product.name)}</h3>
            ${priceHtml}
            ${offersHtml}
        </div>
        ${hasOffers ? '<div class="product-action"><i class="fas fa-chevron-right" aria-hidden="true"></i></div>' : ''}
    `;

    if (hasOffers) {
        card.addEventListener('click', () => viewProductDetails(product.id));
    }

    return card;
}

function renderResultsSkeleton(count = 5) {
    DOM.results.innerHTML = Array.from({ length: count }, () => `
        <div class="product-card product-card--skeleton" aria-hidden="true">
            <div class="skeleton skeleton--thumb"></div>
            <div class="skeleton-lines">
                <div class="skeleton skeleton--line"></div>
                <div class="skeleton skeleton--line skeleton--short"></div>
            </div>
        </div>
    `).join('');
}

/**
 * Navega a la ficha del producto.
 * @param {string} productId
 */
function viewProductDetails(productId) {
    window.location.href = `index.html?product=${encodeURIComponent(normalizeProductId(productId))}`;
}
