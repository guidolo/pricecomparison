/**
 * Utilidades compartidas del comparador de precios.
 * Se carga antes que el resto de los scripts en todas las páginas.
 */

/* ------------------------------------------------------------------ *
 * Formato de precios (MXN)
 * ------------------------------------------------------------------ */

const MXN_FORMATTER = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const MXN_FORMATTER_COMPACT = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

/**
 * Formatea un precio en pesos mexicanos: 14999 -> "$14,999.00"
 * @param {number} value
 * @returns {string}
 */
function formatPrice(value) {
    if (typeof value !== 'number' || !isFinite(value)) return '—';
    return MXN_FORMATTER.format(value);
}

/**
 * Formatea un precio sin decimales, para ejes de gráficos: 14999 -> "$14,999"
 * @param {number} value
 * @returns {string}
 */
function formatPriceCompact(value) {
    if (typeof value !== 'number' || !isFinite(value)) return '—';
    return MXN_FORMATTER_COMPACT.format(value);
}

/* ------------------------------------------------------------------ *
 * Helpers de texto y DOM
 * ------------------------------------------------------------------ */

/**
 * Escapa texto para poder interpolarlo con seguridad dentro de innerHTML.
 * @param {*} value
 * @returns {string}
 */
function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Normaliza el id de producto quitando la extensión .json si viene por error.
 * @param {string} productId
 * @returns {string}
 */
function normalizeProductId(productId) {
    if (!productId) return '';
    return productId.endsWith('.json') ? productId.slice(0, -5) : productId;
}

/**
 * Descarga un JSON y lanza un error legible si falla.
 * @param {string} url
 * @returns {Promise<Object>}
 */
async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`No se pudo cargar la información (HTTP ${response.status})`);
    }
    return response.json();
}

/**
 * Convierte una fecha de envío "03.06. - 04.06." a "3 – 4 jun".
 * Si el formato no coincide, devuelve el texto original.
 * @param {string} raw
 * @returns {string}
 */
function formatShippingDate(raw) {
    if (!raw) return '';
    const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const matches = [...String(raw).matchAll(/(\d{1,2})\.(\d{1,2})\./g)];
    if (matches.length === 0) return raw;

    const parts = matches.map(match => ({
        day: parseInt(match[1], 10),
        month: parseInt(match[2], 10)
    }));

    const label = ({ day, month }) => `${day} ${MONTHS[month - 1] || ''}`.trim();

    if (parts.length === 1) return `Llega el ${label(parts[0])}`;
    if (parts[0].month === parts[1].month) {
        return `Llega ${parts[0].day} – ${label(parts[1])}`;
    }
    return `Llega ${label(parts[0])} – ${label(parts[1])}`;
}

/* ------------------------------------------------------------------ *
 * Barra de estado y avisos
 * ------------------------------------------------------------------ */

/**
 * Sincroniza la hora de la barra de estado con la hora real.
 */
function updateTime() {
    const timeElement = document.querySelector('.time');
    if (!timeElement) return;
    timeElement.textContent = new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

/**
 * Arranca el reloj de la barra de estado.
 */
function startStatusBarClock() {
    updateTime();
    setInterval(updateTime, 30000);
}

/** Temporizador del toast activo. */
let toastTimer = null;

/**
 * Muestra un mensaje breve en la parte inferior de la pantalla.
 * @param {string} message
 */
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.innerHTML = `<i class="fas fa-circle-check" aria-hidden="true"></i> ${escapeHtml(message)}`;
    toast.classList.add('is-visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

/* ------------------------------------------------------------------ *
 * Rating
 * ------------------------------------------------------------------ */

/**
 * Genera el HTML de estrellas para una calificación de 0 a 5.
 * @param {number} rating
 * @returns {string}
 */
function generateStarRating(rating) {
    const value = Number(rating) || 0;
    const fullStars = Math.floor(value);
    const hasHalfStar = value % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return [
        '<i class="fas fa-star"></i>'.repeat(fullStars),
        hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : '',
        '<i class="far fa-star"></i>'.repeat(Math.max(0, emptyStars))
    ].join('');
}

/* ------------------------------------------------------------------ *
 * Estados de la lista de ofertas
 * ------------------------------------------------------------------ */

/**
 * Pinta placeholders animados mientras cargan las ofertas.
 * @param {HTMLElement} container
 * @param {number} count
 */
function renderOffersSkeleton(container, count = 3) {
    if (!container) return;
    container.setAttribute('aria-busy', 'true');
    container.innerHTML = Array.from({ length: count }, () => `
        <div class="offer-card offer-card--skeleton" aria-hidden="true">
            <div class="skeleton skeleton--price"></div>
            <div class="skeleton skeleton--line"></div>
            <div class="skeleton skeleton--line skeleton--short"></div>
            <div class="skeleton skeleton--button"></div>
        </div>
    `).join('');
}

/**
 * Pinta un estado vacío o de error dentro de un contenedor.
 * @param {HTMLElement} container
 * @param {{icon?: string, title: string, message?: string, tone?: 'empty'|'error'}} options
 */
function renderStateMessage(container, { icon = 'fa-box-open', title, message = '', tone = 'empty' } = {}) {
    if (!container) return;
    container.removeAttribute('aria-busy');
    container.innerHTML = `
        <div class="state-message state-message--${tone}" role="status">
            <div class="state-message__icon"><i class="fas ${escapeHtml(icon)}"></i></div>
            <p class="state-message__title">${escapeHtml(title)}</p>
            ${message ? `<p class="state-message__text">${escapeHtml(message)}</p>` : ''}
        </div>
    `;
}

/* ------------------------------------------------------------------ *
 * Tarjeta de oferta (usada por index y all-offers)
 * ------------------------------------------------------------------ */

/**
 * Crea el elemento DOM de una oferta.
 * @param {Object} offer - Oferta proveniente de la API
 * @param {{highlight?: boolean}} [options] - highlight marca la mejor oferta
 * @returns {HTMLElement}
 */
function createOfferElement(offer, options = {}) {
    const { highlight = false } = options;

    const card = document.createElement('article');
    card.className = 'offer-card';
    if (highlight) card.classList.add('offer-card--best');

    const merchant = offer.merchant || {};
    const attributes = offer.variant_attributes || {};
    const colorName = attributes.color && attributes.color.name ? attributes.color.name : '';
    const storageName = attributes.storage && attributes.storage.name ? attributes.storage.name : '';
    const conditionName = offer.condition && offer.condition.name ? offer.condition.name : '';
    const conditionModifier = conditionName
        ? conditionName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')
        : '';

    const badges = [];
    if (highlight) {
        badges.push('<span class="badge badge--best"><i class="fas fa-bolt"></i> Mejor precio</span>');
    }
    if (offer.tag) {
        badges.push(`<span class="badge badge--promo"><i class="fas fa-coins"></i> ${escapeHtml(offer.tag)}</span>`);
    }

    const chips = [];
    if (conditionName) {
        chips.push(`<span class="chip chip--${escapeHtml(conditionModifier)}">${escapeHtml(conditionName)}</span>`);
    }
    if (colorName) chips.push(`<span class="chip">${escapeHtml(colorName)}</span>`);
    if (storageName) chips.push(`<span class="chip">${escapeHtml(storageName)}</span>`);

    const shipping = offer.shipping || {};
    const shippingBits = [];
    if (shipping.cost) {
        shippingBits.push(`<span class="offer-shipping__item offer-shipping__item--free"><i class="fas fa-truck"></i> ${escapeHtml(shipping.cost)}</span>`);
    }
    if (shipping.date) {
        shippingBits.push(`<span class="offer-shipping__item"><i class="far fa-calendar"></i> ${escapeHtml(formatShippingDate(shipping.date))}</span>`);
    }
    if (shipping.returnIcon) {
        shippingBits.push('<span class="offer-shipping__item"><i class="fas fa-undo"></i> Devolución gratis</span>');
    }

    const merchantLogo = merchant.logo
        ? `<img class="merchant__logo" src="${escapeHtml(merchant.logo)}" alt="${escapeHtml(merchant.name || 'Tienda')}" loading="lazy"
                onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'merchant__name',textContent:this.alt}))">`
        : `<span class="merchant__name">${escapeHtml(merchant.name || 'Tienda')}</span>`;

    const merchantRating = merchant.rating
        ? `<span class="merchant__rating"><span class="merchant__stars">${generateStarRating(merchant.rating)}</span>
              <span class="merchant__rating-value">${escapeHtml(String(merchant.rating).replace('.', ','))}</span></span>`
        : '';

    const action = offer.actionButton || {};
    const actionHtml = action.url
        ? `<a class="btn btn--primary offer-card__cta" href="${escapeHtml(action.url)}" target="_blank" rel="noopener noreferrer">
               ${escapeHtml(action.text || 'Ver oferta')} <i class="fas fa-arrow-right"></i>
           </a>`
        : '';

    card.innerHTML = `
        ${badges.length ? `<div class="offer-card__badges">${badges.join('')}</div>` : ''}
        <div class="offer-card__body">
            <div class="offer-card__pricing">
                <p class="offer-price">${escapeHtml(formatPrice(offer.price))}</p>
                ${offer.taxInfo ? `<p class="offer-tax">${escapeHtml(offer.taxInfo)}</p>` : ''}
            </div>
            <div class="merchant">
                ${merchantLogo}
                ${merchantRating}
            </div>
        </div>
        ${chips.length ? `<div class="offer-card__chips">${chips.join('')}</div>` : ''}
        ${shippingBits.length ? `<div class="offer-shipping">${shippingBits.join('')}</div>` : ''}
        ${actionHtml}
    `;

    return card;
}
