/**
 * Página "Todas las ofertas": lista completa de ofertas de un producto.
 */

document.addEventListener('DOMContentLoaded', () => {
    startStatusBarClock();

    const urlParams = new URLSearchParams(window.location.search);
    const productId = normalizeProductId(urlParams.get('product'));

    if (!productId) {
        renderStateMessage(document.getElementById('all-offers-list'), {
            icon: 'fa-triangle-exclamation',
            title: 'Falta el producto',
            message: 'Vuelve al buscador y elige un modelo.',
            tone: 'error'
        });
        document.getElementById('offers-count').textContent = 'Sin ofertas';
        return;
    }

    setupNavigation(productId);
    loadProductSummary(productId);
    fetchAllOffers(productId);
});

/**
 * Configura el botón de volver y el de compartir.
 * @param {string} productId
 */
function setupNavigation(productId) {
    const backButton = document.getElementById('back-to-product');
    if (backButton) {
        backButton.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = `index.html?product=${encodeURIComponent(productId)}`;
            }
        });
    }

    const shareButton = document.querySelector('.share-btn');
    if (shareButton) {
        shareButton.addEventListener('click', async () => {
            if (navigator.clipboard) {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    showToast('Enlace copiado al portapapeles');
                    return;
                } catch (error) {
                    /* Ignora y usa el mensaje genérico. */
                }
            }
            showToast('Copia el enlace desde la barra del navegador');
        });
    }

    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.bottom-nav .nav-item').forEach(other => other.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

/**
 * Carga nombre e imagen reales del producto para el encabezado.
 * @param {string} productId
 */
async function loadProductSummary(productId) {
    const titleElement = document.getElementById('product-title-small');
    const imageElement = document.getElementById('product-img-small');

    try {
        const data = await fetchJson(`api/products/${productId}.json`);
        const product = data.product || {};

        if (titleElement) titleElement.textContent = product.name || 'Producto';
        document.title = `Ofertas de ${product.name || 'producto'}`;

        const firstImage = Array.isArray(product.images) && product.images.length > 0
            ? [...product.images].sort((a, b) => (a.position || 0) - (b.position || 0))[0]
            : null;

        if (imageElement && firstImage && firstImage.url) {
            imageElement.src = firstImage.url;
            imageElement.alt = product.name || 'Producto';
        }
    } catch (error) {
        console.error('Error al cargar el resumen del producto:', error);
        if (titleElement) titleElement.textContent = 'Producto';
    }
}

/**
 * Descarga y pinta todas las ofertas del producto.
 * @param {string} productId
 */
async function fetchAllOffers(productId) {
    const offersList = document.getElementById('all-offers-list');
    const countElement = document.getElementById('offers-count');
    const variantElement = document.getElementById('variant-info');

    renderOffersSkeleton(offersList, 4);

    try {
        const data = await fetchJson(`api/offers/${productId}.json`);
        const offers = [...(data.offers || [])].sort((a, b) => a.price - b.price);

        countElement.textContent = offers.length === 1 ? '1 oferta' : `${offers.length} ofertas`;

        if (variantElement) {
            variantElement.innerHTML = buildVariantSummary(offers);
        }

        if (offers.length === 0) {
            renderStateMessage(offersList, {
                icon: 'fa-box-open',
                title: 'Todavía no hay ofertas',
                message: 'Vuelve más tarde: los comercios actualizan sus precios a diario.'
            });
            return;
        }

        renderAllOffers(offers);
    } catch (error) {
        console.error('Error al obtener las ofertas:', error);
        countElement.textContent = 'Sin ofertas';
        renderStateMessage(offersList, {
            icon: 'fa-triangle-exclamation',
            title: 'No pudimos cargar las ofertas',
            message: error.message,
            tone: 'error'
        });
    }
}

/**
 * Resume las variantes disponibles a partir de las ofertas.
 * @param {Array} offers
 * @returns {string}
 */
function buildVariantSummary(offers) {
    if (!offers.length) return '';

    const colors = new Set();
    const storages = new Set();

    offers.forEach(offer => {
        const attributes = offer.variant_attributes || {};
        if (attributes.color && attributes.color.name) colors.add(attributes.color.name);
        if (attributes.storage && attributes.storage.name) storages.add(attributes.storage.name);
    });

    const parts = [];
    if (colors.size) parts.push(`${colors.size} ${colors.size === 1 ? 'color' : 'colores'}`);
    if (storages.size) parts.push(`${storages.size} ${storages.size === 1 ? 'capacidad' : 'capacidades'}`);
    parts.push(`desde <strong>${escapeHtml(formatPrice(offers[0].price))}</strong>`);

    return parts.join(' · ');
}

/**
 * Pinta la lista completa destacando la oferta más barata.
 * @param {Array} offers
 */
function renderAllOffers(offers) {
    const offersList = document.getElementById('all-offers-list');
    if (!offersList) return;

    offersList.removeAttribute('aria-busy');
    offersList.innerHTML = '';

    const fragment = document.createDocumentFragment();
    offers.forEach((offer, index) => {
        fragment.appendChild(createOfferElement(offer, { highlight: index === 0 && offers.length > 1 }));
    });
    offersList.appendChild(fragment);
}
