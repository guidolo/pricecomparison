/**
 * Carga, filtrado y render de las ofertas en la ficha de producto.
 */

/** Ofertas de la última carga, ya filtradas y ordenadas. */
let visibleOffers = [];

/**
 * Aplica los filtros activos a un listado de ofertas.
 * @param {Array} offers
 * @param {{color?: string|null, storage?: string|null, condition?: string|null}} filters
 * @returns {Array}
 */
function filterOffers(offers, { color, storage, condition } = {}) {
    return (offers || []).filter(offer => {
        const attributes = offer.variant_attributes || {};

        if (color && color !== 'null') {
            if (!attributes.color || attributes.color.id !== color) return false;
        }
        if (storage && storage !== 'null') {
            if (!attributes.storage || attributes.storage.id !== storage) return false;
        }
        if (condition && condition !== 'null') {
            if (!offer.condition || offer.condition.id !== condition) return false;
        }
        return true;
    });
}

/**
 * Descarga las ofertas del producto y las pinta aplicando los filtros activos.
 * @param {string} productIdParam
 * @param {string|null} color
 * @param {string|null} storage
 * @param {string|null} condition
 */
async function fetchOffers(productIdParam, color, storage, condition) {
    const offersList = document.querySelector('.offers-list');
    const urlParams = new URLSearchParams(window.location.search);
    const productId = normalizeProductId(productIdParam || urlParams.get('product') || 'iphone_14_pro_max');

    renderOffersSkeleton(offersList);

    try {
        const data = await fetchJson(`api/offers/${productId}.json`);

        const filtered = filterOffers(data.offers, { color, storage, condition })
            .sort((a, b) => a.price - b.price);
        visibleOffers = filtered;

        updateOffersCount(filtered.length);
        setupViewAllLink(productId);

        if (filtered.length === 0) {
            updateMinimumPrice(null);
            renderStateMessage(offersList, {
                icon: 'fa-filter-circle-xmark',
                title: 'Sin ofertas con estos filtros',
                message: 'Cambia el color, el almacenamiento o la condición para ver más resultados.'
            });
            return;
        }

        updateMinimumPrice(filtered[0].price);
        renderOffers(filtered);
    } catch (error) {
        console.error('Error al obtener las ofertas:', error);
        updateOffersCount(0);
        updateMinimumPrice(null);
        renderStateMessage(offersList, {
            icon: 'fa-triangle-exclamation',
            title: 'No pudimos cargar las ofertas',
            message: error.message,
            tone: 'error'
        });
    }
}

/**
 * Actualiza el encabezado con la cantidad de ofertas visibles.
 * @param {number} count
 */
function updateOffersCount(count) {
    const header = document.querySelector('.offers-header h2');
    if (!header) return;
    header.textContent = count === 1 ? '1 oferta' : `${count} ofertas`;
}

/**
 * Actualiza el precio "desde" de la cabecera.
 * @param {number|null} price - null muestra el estado sin ofertas
 */
function updateMinimumPrice(price) {
    const priceValue = document.querySelector('.price-container .price-value');
    const priceLabel = document.querySelector('.price-container .price-label');
    if (!priceValue) return;

    if (price === null || price === undefined) {
        priceValue.textContent = 'Sin ofertas';
        priceValue.classList.add('is-empty');
        if (priceLabel) priceLabel.hidden = true;
        return;
    }

    priceValue.textContent = formatPrice(price);
    priceValue.classList.remove('is-empty');
    if (priceLabel) priceLabel.hidden = false;
}

/**
 * Pinta la lista de ofertas destacando la más barata.
 * @param {Array} offers
 */
function renderOffers(offers) {
    const offersList = document.querySelector('.offers-list');
    if (!offersList) return;

    offersList.removeAttribute('aria-busy');
    offersList.innerHTML = '';

    const fragment = document.createDocumentFragment();
    offers.forEach((offer, index) => {
        fragment.appendChild(createOfferElement(offer, { highlight: index === 0 && offers.length > 1 }));
    });
    offersList.appendChild(fragment);
}

/**
 * Configura el enlace "Ver todo" hacia la página de todas las ofertas.
 * @param {string} productId
 */
function setupViewAllLink(productId) {
    const viewAllLink = document.querySelector('.view-all');
    if (!viewAllLink) return;
    viewAllLink.href = `all-offers.html?product=${encodeURIComponent(productId)}`;
}
