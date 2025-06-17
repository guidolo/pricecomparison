/**
 * Módulo para cargar y gestionar ofertas
 */

/**
 * Obtiene las ofertas desde la API para un producto específico y filtra por color y almacenamiento
 * @param {string} productId - ID del producto
 * @param {string} color - Color seleccionado para filtrar las ofertas
 * @param {string} storage - Almacenamiento seleccionado para filtrar las ofertas
 */
async function fetchOffers(productIdParam, color, storage) {
    try {
        // Obtener el ID del producto de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('product') || 'iphone_14_pro_max';
        
        // Mapeo de IDs de producto a nombres de archivos JSON disponibles
        const productToFileMap = {
            'iphone_14_pro_max': 'offers-iphone14-pro_max.json',
            'iphone_16e': 'offers-iphone16e.json'
        };
        
        // Usar el archivo de ofertas correspondiente al producto o construir el nombre basado en el ID
        const offersFileName = productToFileMap[productId] || `offers-${productId.replace('_', '')}.json`;
        const apiUrl = `api/${offersFileName}`;
        
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
        
        // Filtrar por color si se proporciona
        if (color) {
            console.log(`Filtrando por color ID: ${color}`);
            
            filteredOffers = filteredOffers.filter(offer => {
                if (offer.variant_attributes && offer.variant_attributes.color) {
                    console.log(`Oferta color ID: ${offer.variant_attributes.color.id}, Nombre: ${offer.variant_attributes.color.name}`);
                    return offer.variant_attributes.color.id === color;
                }
                return false;
            });
        }
        
        // Filtrar por almacenamiento si se proporciona
        if (storage) {
            console.log(`Filtrando por almacenamiento ID: ${storage}`);
            
            filteredOffers = filteredOffers.filter(offer => {
                if (offer.variant_attributes && offer.variant_attributes.storage) {
                    console.log(`Oferta storage ID: ${offer.variant_attributes.storage.id}, Nombre: ${offer.variant_attributes.storage.name}`);
                    return offer.variant_attributes.storage.id === storage;
                }
                return false;
            });
        }
        
        // Calcular el precio mínimo de las ofertas
        if (filteredOffers.length > 0) {
            const minPrice = Math.min(...filteredOffers.map(offer => offer.price));
            // Actualizar el precio en el contenedor de precio
            updateMinimumPrice(minPrice);
        } else {
            // Si no hay ofertas, mostrar mensaje "Sin ofertas"
            updateMinimumPrice("Sin ofertas", true);
        }
        
        // Actualizar el número de ofertas en la interfaz
        updateOfferCount(filteredOffers.length);
        
        // Configurar el enlace "Ver todo"
        setupViewAllLink(productId, filteredOffers.length);
        
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
 * Actualiza el precio mínimo en el contenedor de precio
 * @param {number|string} price - Precio mínimo de las ofertas o mensaje
 * @param {boolean} isMessage - Indica si es un mensaje en lugar de un precio
 */
function updateMinimumPrice(price, isMessage = false) {
    const priceContainer = document.querySelector('.price-container .price-value');
    if (priceContainer) {
        if (isMessage) {
            priceContainer.textContent = price;
        } else {
            priceContainer.textContent = `${price.toFixed(2).replace('.', ',')} $`;
        }
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
        
        // Agregar logo del vendedor como imagen y botón de acción en el mismo contenedor
        offerHTML += `<div class="seller-container">`;
        
        // Agregar logo del vendedor
        if (offer.merchant && offer.merchant.logo) {
            offerHTML += `<div class="seller-logo"><img src="${offer.merchant.logo}" alt="${offer.merchant.name}" /></div>`;
        } else if (offer.merchant && offer.merchant.name) {
            // Si no hay logo, mostrar el nombre del merchant
            offerHTML += `<div class="seller-name">${offer.merchant.name}</div>`;
        }
        
        // Agregar botón de acción si existe
        if (offer.actionButton) {
            offerHTML += `
                <a href="${offer.actionButton.url}" class="view-offer-btn">
                    ${offer.actionButton.text} <i class="fas fa-arrow-right"></i>
                </a>
            `;
        }
        
        offerHTML += `</div>
                </div>
            </div>
        `;
        
        offerCard.innerHTML = offerHTML;
    }
    
    return offerCard;
}

// La función generateStarRating ha sido eliminada ya que no se utiliza más

/**
 * Configura el enlace "Ver todo" para dirigir a la página de todas las ofertas
 * @param {string} productId - ID del producto
 * @param {number} totalOffers - Número total de ofertas
 */
function setupViewAllLink(productId, totalOffers) {
    const viewAllLink = document.querySelector('.view-all');
    if (viewAllLink) {
        // Actualizar el texto del enlace si hay más de 3 ofertas
        if (totalOffers > 3) {
            viewAllLink.textContent = `Ver todo (${totalOffers})`;
        } else {
            viewAllLink.textContent = 'Ver todo';
        }
        
        // Configurar el enlace para ir a la página de todas las ofertas
        viewAllLink.href = `all-offers.html?product=${productId}`;
    }
}
