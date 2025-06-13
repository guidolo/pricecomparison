/**
 * Módulo para cargar y gestionar ofertas
 */

/**
 * Obtiene las ofertas desde la API para una variante específica y filtra por color y almacenamiento
 * @param {string} variantId - ID de la variante
 * @param {string} color - Color seleccionado para filtrar las ofertas
 * @param {string} storage - Almacenamiento seleccionado para filtrar las ofertas
 */
async function fetchOffers(variantId, color, storage) {
    try {
        // Usar el nuevo archivo de ofertas para iPhone 14 Pro Max
        const fileName = 'offers-iphone14-pro_max.json';
        
        // URL de la API de ofertas
        const apiUrl = `api/${fileName}`;
        
        // Mostrar indicador de carga
        const offersSection = document.querySelector('.offers-list');
        offersSection.innerHTML = '<div class="loading">Cargando ofertas...</div>';
        
        // Hacer la petición a la API
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filtrar ofertas por color y almacenamiento
        let filteredOffers = data.offers;
        
        // Mapeo de nombres de colores en español a IDs
        const colorMapping = {
            'morado oscuro': 'morado_oscuro',
            'negro espacial': 'negro_espacial',
            'oro': 'oro',
            'plata': 'plata'
        };
        
        // Filtrar por color si se proporciona
        if (color) {
            // Convertir el color a un formato comparable (minúsculas)
            const normalizedColor = color.toLowerCase();
            
            // Obtener el ID del color si existe en el mapeo
            const colorId = colorMapping[normalizedColor] || normalizedColor;
            
            console.log(`Filtrando por color: ${color}, ID: ${colorId}`);
            
            filteredOffers = filteredOffers.filter(offer => {
                if (offer.variant_attributes && offer.variant_attributes.color) {
                    console.log(`Oferta color ID: ${offer.variant_attributes.color.id}, Nombre: ${offer.variant_attributes.color.name}`);
                    return offer.variant_attributes.color.id === colorId;
                }
                return false;
            });
        }
        
        // Mapeo de capacidades de almacenamiento a IDs
        const storageMapping = {
            '128 GB': '128_gb',
            '256 GB': '256_gb',
            '512 GB': '512_gb',
            '1 TB': '1_tb'
        };
        
        // Filtrar por almacenamiento si se proporciona
        if (storage) {
            // Obtener el ID del almacenamiento si existe en el mapeo
            const storageId = storageMapping[storage] || storage;
            
            console.log(`Filtrando por almacenamiento: ${storage}, ID: ${storageId}`);
            
            filteredOffers = filteredOffers.filter(offer => {
                if (offer.variant_attributes && offer.variant_attributes.storage) {
                    console.log(`Oferta storage ID: ${offer.variant_attributes.storage.id}, Nombre: ${offer.variant_attributes.storage.name}`);
                    return offer.variant_attributes.storage.id === storageId;
                }
                return false;
            });
        }
        
        // Actualizar el número de ofertas en la interfaz
        updateOfferCount(filteredOffers.length);
        
        // Configurar el enlace "Ver todo"
        setupViewAllLink(variantId, filteredOffers.length);
        
        // Renderizar solo las primeras 3 ofertas filtradas
        renderOffers(filteredOffers.slice(0, 3));
        
        // Mostrar mensaje si no hay ofertas que coincidan con los filtros
        if (filteredOffers.length === 0) {
            offersSection.innerHTML = '<div class="no-offers">No hay ofertas disponibles para esta combinación de color y almacenamiento.</div>';
        }
        
    } catch (error) {
        console.error('Error al obtener las ofertas:', error);
        const offersSection = document.querySelector('.offers-list');
        offersSection.innerHTML = `<div class="error">Error al cargar las ofertas: ${error.message}</div>`;
    }
}

/**
 * Actualiza el número de ofertas en la interfaz
 * @param {number} count - Número total de ofertas
 */
function updateOfferCount(count) {
    // Actualizar el encabezado de la sección de ofertas
    document.querySelector('.offers-header h2').textContent = `${count} ofertas`;
    
    // Actualizar el botón de comparar ofertas
    document.querySelector('.compare-btn').innerHTML = `
        Comparar ${count} ofertas
        <i class="fas fa-chevron-right"></i>
    `;
}

/**
 * Renderiza las ofertas en la interfaz
 * @param {Array} offers - Array de objetos con la información de las ofertas
 */
function renderOffers(offers) {
    const offersSection = document.querySelector('.offers-list');
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

/**
 * Configura el enlace "Ver todo" para dirigir a la página de todas las ofertas
 * @param {string} variantId - ID de la variante
 * @param {number} totalOffers - Número total de ofertas
 */
function setupViewAllLink(variantId, totalOffers) {
    const viewAllLink = document.querySelector('.view-all');
    if (viewAllLink) {
        // Actualizar el texto del enlace si hay más de 3 ofertas
        if (totalOffers > 3) {
            viewAllLink.textContent = `Ver todo (${totalOffers})`;
        } else {
            viewAllLink.textContent = 'Ver todo';
        }
        
        // Configurar el enlace para ir a la página de todas las ofertas
        viewAllLink.href = `all-offers.html?variant=${variantId}`;
    }
}
