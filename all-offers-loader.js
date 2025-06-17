/**
 * Módulo para cargar y gestionar todas las ofertas en la página de ofertas completa
 */

document.addEventListener('DOMContentLoaded', () => {
    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    
    if (productId) {
        // Actualizar la información del producto en la UI
        updateVariantInfo(productId);
        
        // Cargar las ofertas para el producto
        fetchAllOffers(productId);
        
        // Configurar el botón de volver
        setupBackButton(productId);
    } else {
        // Si no hay producto, mostrar error
        document.getElementById('all-offers-list').innerHTML = 
            '<div class="error">Error: No se especificó ningún producto</div>';
    }
});

/**
 * Actualiza la información del producto en la interfaz
 * @param {string} productId - ID del producto
 */
function updateVariantInfo(productId) {
    // Extraer información del producto del ID
    const parts = productId.split('_');
    if (parts.length >= 3) {
        const model = parts[0];
        let color = parts[1];
        let storage = parts[2];
        
        // Manejar formato con guiones bajos
        color = color.replace(/_/g, ' ');
        storage = storage.replace(/_/g, ' ');
        
        // Convertir primera letra a mayúscula
        color = color.charAt(0).toUpperCase() + color.slice(1);
        
        // Formatear el almacenamiento si es necesario
        if (storage.toLowerCase().includes('gb') && !storage.includes(' ')) {
            storage = storage.replace(/gb/i, ' GB');
        }
        
        // Actualizar el texto de la variante
        document.getElementById('variant-info').textContent = `${storage} ${color}`;
    }
}

/**
 * Configura el botón de volver a la página de detalles del producto
 * @param {string} productId - ID del producto
 */
function setupBackButton(productId) {
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = `index.html?product=${productId}`;
        });
    }
}

/**
 * Obtiene todas las ofertas desde la API para un producto específico
 * @param {string} productId - ID del producto
 */
async function fetchAllOffers(productId) {
    try {
        // Construir el nombre del archivo de ofertas basado en el ID del producto
        // Ahora usamos una convención de nomenclatura consistente con underscores
        const fileName = `offers_${productId}.json`;
        
        // URL de la API de ofertas para la variante seleccionada
        const apiUrl = `api/${fileName}`;
        
        // Mostrar indicador de carga
        const offersSection = document.getElementById('all-offers-list');
        offersSection.innerHTML = '<div class="loading">Cargando ofertas...</div>';
        
        // Hacer la petición a la API
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Actualizar el número de ofertas en la interfaz
        document.getElementById('offers-count').textContent = `${data.total_offers} ofertas`;
        
        // Renderizar todas las ofertas
        renderAllOffers(data.offers);
        
    } catch (error) {
        console.error('Error al obtener las ofertas:', error);
        const offersSection = document.getElementById('all-offers-list');
        offersSection.innerHTML = `<div class="error">Error al cargar las ofertas: ${error.message}</div>`;
    }
}

/**
 * Renderiza todas las ofertas en la interfaz
 * @param {Array} offers - Array de objetos con la información de las ofertas
 */
function renderAllOffers(offers) {
    const offersSection = document.getElementById('all-offers-list');
    offersSection.innerHTML = '';
    
    offers.forEach(offer => {
        const offerElement = createOfferElement(offer);
        offersSection.appendChild(offerElement);
    });
}

/**
 * Crea un elemento DOM para una oferta
 * @param {Object} offer - Objeto con la información de la oferta
 * @returns {HTMLElement} - Elemento DOM de la oferta
 */
function createOfferElement(offer) {
    const offerCard = document.createElement('div');
    offerCard.className = `offer-card${offer.refurbished ? ' refurbished' : ''}`;
    
    if (offer.refurbished) {
        // Renderizar oferta reacondicionada
        offerCard.innerHTML = `
            <div class="offer-main">
                <div class="offer-price-info">
                    <div class="refurbished-label">${offer.refurbishedLabel}</div>
                    <div class="refurbished-price">
                        <span>desde</span> <span class="price-highlight">${offer.price.toFixed(2).replace('.', ',')} $</span>
                    </div>
                    <div class="refurbished-new-price">${offer.newPriceLabel} ${offer.newPrice.toFixed(2).replace('.', ',')} $</div>
                </div>
                <div class="offer-seller">
                    <button class="refurbished-btn"><i class="fas fa-check-circle"></i></button>
                </div>
            </div>
        `;
    } else {
        // Renderizar oferta normal
        let offerHTML = '';
        
        // Agregar etiqueta si existe
        if (offer.tag) {
            offerHTML += `<div class="offer-tag">${offer.tag}</div>`;
        }
        
        offerHTML += `
            <div class="offer-main">
                <div class="offer-price-info">
                    <div class="offer-price">${offer.price.toFixed(2).replace('.', ',')} $</div>
                    <div class="offer-tax">${offer.taxInfo}</div>
        `;
        
        // Agregar información de envío si existe
        if (offer.shipping) {
            offerHTML += `
                    <div class="offer-shipping">
                        ${offer.shipping.returnIcon ? '<span class="shipping-icon"><i class="fas fa-sync-alt"></i></span>' : ''}
                        ${offer.shipping.truckIcon ? '<span class="shipping-icon"><i class="fas fa-truck"></i></span>' : ''}
                        <span class="shipping-date">${offer.shipping.date}</span>
                    </div>
                    <div class="offer-shipping-cost">${offer.shipping.cost}</div>
            `;
        }
        
        offerHTML += `
                </div>
                <div class="offer-seller">
        `;
        
        // Agregar logo del vendedor
        if (offer.merchant && offer.merchant.logo) {
            offerHTML += `<div class="seller-logo">${offer.merchant.logo}</div>`;
        }
        
        // Agregar calificación si existe
        if (offer.merchant && offer.merchant.rating) {
            offerHTML += `
                    <div class="seller-rating">
                        ${generateStarRating(offer.merchant.rating)}
                    </div>
            `;
        }
        
        offerHTML += `
                    <button class="expand-btn"><i class="fas fa-chevron-down"></i></button>
                </div>
            </div>
        `;
        
        // Agregar botón de acción si existe
        if (offer.actionButton) {
            offerHTML += `
                <div class="offer-action">
                    <a href="${offer.actionButton.url}" class="view-offer-btn">
                        ${offer.actionButton.text} <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            `;
        }
        
        offerCard.innerHTML = offerHTML;
    }
    
    return offerCard;
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
