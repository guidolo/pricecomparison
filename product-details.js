/**
 * Ficha técnica del producto, navegación por pestañas y gráfico de precios.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    setupTabNavigation();
    setupSpecsAccordion();
    setupChartResizeHandling();
});

/* ------------------------------------------------------------------ *
 * Ficha técnica
 * ------------------------------------------------------------------ */

async function loadProductDetails() {
    const container = document.querySelector('.product-details-content');
    if (!container) return;

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = normalizeProductId(urlParams.get('product')) || 'iphone_14_pro_max';
        const data = await fetchJson(`api/products/${productId}.json`);
        const product = data && data.product;

        if (!product) throw new Error('Producto sin datos');

        container.innerHTML = '';
        if (product.product_summary) renderProductSummary(product.product_summary, container);
        if (Array.isArray(product.product_details) && product.product_details.length > 0) {
            renderProductSpecs(product.product_details, container);
        }

        if (!container.children.length) {
            renderStateMessage(container, {
                icon: 'fa-circle-info',
                title: 'Sin ficha técnica',
                message: 'Este producto todavía no tiene especificaciones cargadas.'
            });
        }
    } catch (error) {
        console.error('Error al cargar los detalles del producto:', error);
        renderStateMessage(container, {
            icon: 'fa-triangle-exclamation',
            title: 'No pudimos cargar la ficha técnica',
            message: error.message,
            tone: 'error'
        });
    }
}

/**
 * Pinta el bloque de especificaciones destacadas.
 * @param {Object} summary
 * @param {HTMLElement} container
 */
function renderProductSummary(summary, container) {
    const LABELS = {
        screen_size: 'Pantalla',
        front_camera_mp: 'Cámara frontal',
        ram_gb: 'Memoria RAM',
        battery: 'Batería',
        operating_system: 'Sistema operativo'
    };

    const items = Object.entries(summary)
        .filter(([, value]) => value && value !== 'N/A')
        .map(([key, value]) => `
            <div class="product-summary-item">
                <span class="product-summary-name">${escapeHtml(LABELS[key] || key)}</span>
                <span class="product-summary-value">${escapeHtml(value)}</span>
            </div>
        `);

    if (items.length === 0) return;

    const section = document.createElement('section');
    section.className = 'product-summary-section';
    section.innerHTML = `
        <h3 class="product-summary-title">Lo esencial</h3>
        <div class="product-summary-grid">${items.join('')}</div>
    `;
    container.appendChild(section);
}

/**
 * Pinta las categorías de especificaciones como acordeón.
 * @param {Array} categories
 * @param {HTMLElement} container
 */
function renderProductSpecs(categories, container) {
    categories.forEach((category, index) => {
        const specs = (category.specifications || []).filter(spec => spec.name || spec.value);
        if (specs.length === 0) return;

        // Los valores sin nombre continúan la especificación anterior.
        const entries = [];
        specs.forEach(spec => {
            if (spec.name) {
                entries.push({ name: spec.name, values: spec.value ? [spec.value] : [] });
            } else if (spec.value && entries.length > 0) {
                entries[entries.length - 1].values.push(spec.value);
            }
        });

        const rows = entries.map(entry => `
            <div class="product-detail-item">
                <span class="product-detail-name">${escapeHtml(entry.name)}</span>
                <span class="product-detail-value">${entry.values.map(escapeHtml).join('<br>')}</span>
            </div>
        `);

        if (rows.length === 0) return;

        const block = document.createElement('section');
        block.className = `product-detail-category${index === 0 ? ' is-open' : ''}`;
        block.innerHTML = `
            <button type="button" class="product-detail-category-title" aria-expanded="${index === 0}">
                ${escapeHtml(category.category)}
                <i class="fas fa-chevron-down" aria-hidden="true"></i>
            </button>
            <div class="product-detail-list">${rows.join('')}</div>
        `;
        container.appendChild(block);
    });
}

/**
 * Abre y cierra las categorías de la ficha técnica.
 */
function setupSpecsAccordion() {
    const container = document.querySelector('.product-details-content');
    if (!container) return;

    container.addEventListener('click', event => {
        const trigger = event.target.closest('.product-detail-category-title');
        if (!trigger) return;

        const category = trigger.closest('.product-detail-category');
        const isOpen = category.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(isOpen));
    });
}

/* ------------------------------------------------------------------ *
 * Pestañas
 * ------------------------------------------------------------------ */

function setupTabNavigation() {
    const tabs = [...document.querySelectorAll('.tab-navigation .tab')];
    const panels = [
        document.querySelector('.offers-section'),
        document.querySelector('.price-chart-section'),
        document.querySelector('.product-details-section')
    ];

    if (tabs.length === 0) return;

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', async () => {
            tabs.forEach((item, itemIndex) => {
                const isActive = itemIndex === index;
                item.classList.toggle('active', isActive);
                item.setAttribute('aria-selected', String(isActive));
            });

            panels.forEach((panel, panelIndex) => {
                if (panel) panel.hidden = panelIndex !== index;
            });

            if (index === 1) await renderPriceChart();
        });
    });
}

/* ------------------------------------------------------------------ *
 * Gráfico de precios
 * ------------------------------------------------------------------ */

/**
 * Vuelve a dibujar el gráfico si la pestaña está visible (al cambiar filtros).
 */
async function updatePriceChartIfVisible() {
    const section = document.querySelector('.price-chart-section');
    if (section && !section.hidden) await renderPriceChart();
}

/**
 * Redibuja el gráfico al cambiar el tamaño de la ventana.
 */
function setupChartResizeHandling() {
    let timer = null;
    window.addEventListener('resize', () => {
        clearTimeout(timer);
        timer = setTimeout(() => updatePriceChartIfVisible(), 150);
    });
}

/**
 * Devuelve las etiquetas de los últimos N meses terminando en el mes actual.
 * @param {number} count
 * @returns {string[]}
 */
function buildMonthLabels(count) {
    const labels = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = date.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '');
        labels.push(label.charAt(0).toUpperCase() + label.slice(1));
    }
    return labels;
}

/**
 * Prepara el canvas para pantallas de alta densidad.
 * @param {HTMLCanvasElement} canvas
 * @returns {{ctx: CanvasRenderingContext2D, width: number, height: number}}
 */
function setupCanvas(canvas) {
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || canvas.parentElement.clientWidth || 320;
    const height = Number(canvas.getAttribute('height')) || 240;

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    return { ctx, width, height };
}

/**
 * Mensaje centrado dentro del canvas.
 * @param {string} message
 */
function drawChartMessage(message) {
    const canvas = document.getElementById('priceChartCanvas');
    if (!canvas) return;

    const { ctx, width, height } = setupCanvas(canvas);
    ctx.fillStyle = '#66727d';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = message.split(' ');
    const lines = [];
    let line = '';
    words.forEach(word => {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width > width - 40 && line) {
            lines.push(line);
            line = word;
        } else {
            line = candidate;
        }
    });
    lines.push(line);

    lines.forEach((text, index) => {
        ctx.fillText(text, width / 2, height / 2 + (index - (lines.length - 1) / 2) * 18);
    });

    const legend = document.getElementById('price-chart-legend');
    if (legend) legend.innerHTML = '';
}

/**
 * Dibuja el historial de precios de la oferta más barata según los filtros activos.
 */
async function renderPriceChart() {
    const canvas = document.getElementById('priceChartCanvas');
    if (!canvas) return;

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = normalizeProductId(urlParams.get('product')) || 'iphone_14_pro_max';

        const filters = {
            color: typeof currentColorId !== 'undefined' ? currentColorId : null,
            storage: typeof currentStorageId !== 'undefined' ? currentStorageId : null,
            condition: typeof currentConditionId !== 'undefined' ? currentConditionId : null
        };

        const data = await fetchJson(`api/offers/${productId}.json`);
        const offers = filterOffers(data.offers, filters).sort((a, b) => a.price - b.price);
        const offer = offers.find(item => Array.isArray(item.price_hist) && item.price_hist.length > 1);

        if (!offer) {
            drawChartMessage('Sin historial de precios para los filtros seleccionados');
            return;
        }

        drawPriceChart(canvas, offer.price_hist);
        renderChartLegend(offer);
    } catch (error) {
        console.error('Error al renderizar el gráfico de precios:', error);
        drawChartMessage('No pudimos cargar el historial de precios');
    }
}

/**
 * Dibuja la serie de precios en el canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {number[]} priceHistory
 */
function drawPriceChart(canvas, priceHistory) {
    const { ctx, width, height } = setupCanvas(canvas);
    const labels = buildMonthLabels(priceHistory.length);

    const marginLeft = 58;
    const marginRight = 16;
    const marginTop = 24;
    const marginBottom = 28;
    const chartW = width - marginLeft - marginRight;
    const chartH = height - marginTop - marginBottom;

    const minPrice = Math.min(...priceHistory);
    const maxPrice = Math.max(...priceHistory);
    const range = maxPrice - minPrice || maxPrice || 1;
    const padded = range * 0.15;
    const scaleMin = minPrice - padded;
    const scaleMax = maxPrice + padded;

    const pointX = index => marginLeft + (chartW * index) / (priceHistory.length - 1);
    const pointY = price => marginTop + chartH * (1 - (price - scaleMin) / (scaleMax - scaleMin));

    const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    // Cuadrícula y eje Y
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = `11px ${font}`;
    for (let i = 0; i <= 3; i++) {
        const y = marginTop + (chartH * i) / 3;
        ctx.beginPath();
        ctx.strokeStyle = '#e3eaf0';
        ctx.lineWidth = 1;
        ctx.moveTo(marginLeft, y);
        ctx.lineTo(width - marginRight, y);
        ctx.stroke();

        const value = scaleMax - ((scaleMax - scaleMin) * i) / 3;
        ctx.fillStyle = '#98a4ae';
        ctx.fillText(formatPriceCompact(value), marginLeft - 8, y);
    }

    // Área bajo la curva
    const gradient = ctx.createLinearGradient(0, marginTop, 0, marginTop + chartH);
    gradient.addColorStop(0, 'rgba(0, 105, 241, 0.18)');
    gradient.addColorStop(1, 'rgba(0, 105, 241, 0)');

    ctx.beginPath();
    ctx.moveTo(pointX(0), marginTop + chartH);
    priceHistory.forEach((price, index) => ctx.lineTo(pointX(index), pointY(price)));
    ctx.lineTo(pointX(priceHistory.length - 1), marginTop + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Línea
    ctx.beginPath();
    priceHistory.forEach((price, index) => {
        const x = pointX(index);
        const y = pointY(price);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#0069f1';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Puntos y etiquetas
    ctx.textAlign = 'center';
    priceHistory.forEach((price, index) => {
        const x = pointX(index);
        const y = pointY(price);
        const isExtreme = price === minPrice || price === maxPrice;

        ctx.beginPath();
        ctx.arc(x, y, isExtreme ? 5 : 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = price === minPrice ? '#008246' : '#0069f1';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (isExtreme) {
            ctx.fillStyle = price === minPrice ? '#008246' : '#384550';
            ctx.font = `600 11px ${font}`;
            ctx.textBaseline = 'bottom';
            ctx.fillText(formatPriceCompact(price), x, y - 9);
        }

        ctx.fillStyle = '#98a4ae';
        ctx.font = `11px ${font}`;
        ctx.textBaseline = 'top';
        ctx.fillText(labels[index] || '', x, marginTop + chartH + 8);
    });
}

/**
 * Resumen numérico debajo del gráfico.
 * @param {Object} offer
 */
function renderChartLegend(offer) {
    const legend = document.getElementById('price-chart-legend');
    if (!legend) return;

    const history = offer.price_hist;
    const current = history[history.length - 1];
    const first = history[0];
    const minPrice = Math.min(...history);
    const change = first ? ((current - first) / first) * 100 : 0;
    const isDown = change <= 0;

    const merchantName = offer.merchant && offer.merchant.name ? offer.merchant.name : 'la tienda';

    legend.innerHTML = `
        <div>Precio actual <strong>${escapeHtml(formatPrice(current))}</strong></div>
        <div>Mínimo del periodo <strong>${escapeHtml(formatPrice(minPrice))}</strong></div>
        <div>Variación <strong style="color: ${isDown ? 'var(--success)' : 'var(--danger)'}">
            ${isDown ? '▼' : '▲'} ${escapeHtml(Math.abs(change).toFixed(1).replace('.', ','))}%
        </strong></div>
        <div style="flex-basis:100%">Serie de ${escapeHtml(merchantName)}</div>
    `;
}
