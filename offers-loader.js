/**
 * Módulo para cargar y gestionar ofertas
 */

/**
 * Obtiene las ofertas desde la API para un producto específico
 * @param {string} productIdParam - ID del producto
 * @param {string|null} color - ID del color seleccionado (null si no hay filtro)
 * @param {string|null} storage - ID del almacenamiento seleccionado (null si no hay filtro)
 * @param {string|null} condition - ID de la condición seleccionada (null si no hay filtro)
 */
async function fetchOffers(productIdParam, color, storage, condition) {
    try {
        // Obtener el ID del producto de la URL si no se proporciona
        const urlParams = new URLSearchParams(window.location.search);
        const productId = productIdParam || urlParams.get('product') || 'iphone_14_pro_max';
        
        // Construir el nombre del archivo de ofertas basado en el ID del producto
        // Ahora usamos una convención de nomenclatura consistente con underscores
        const offersFileName = `${productId}.json`;
        const apiUrl = `api/offers/${offersFileName}`;
        
        // Mostrar indicador de carga
        const offersSection = document.querySelector('.offers-list');
        offersSection.innerHTML = '<div class="loading">Cargando ofertas...</div>';
        
        // Hacer la petición a la API
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filtrar ofertas por color, almacenamiento y condición
        let filteredOffers = data.offers;
        
        // Filtrar por color si se proporciona y no es null
        if (color && color !== 'null') {
            console.log(`Filtrando por color ID: ${color}`);
            
            filteredOffers = filteredOffers.filter(offer => {
                if (offer.variant_attributes && offer.variant_attributes.color) {
                    console.log(`Oferta color ID: ${offer.variant_attributes.color.id}, Nombre: ${offer.variant_attributes.color.name}`);
                    return offer.variant_attributes.color.id === color;
                }
                return false;
            });
        } else {
            console.log('No se aplica filtro de color - mostrando todas las ofertas');
        }
        
        // Filtrar por almacenamiento si se proporciona y no es null
        if (storage && storage !== 'null') {
            console.log(`Filtrando por almacenamiento ID: ${storage}`);
            
            filteredOffers = filteredOffers.filter(offer => {
                if (offer.variant_attributes && offer.variant_attributes.storage) {
                    console.log(`Oferta storage ID: ${offer.variant_attributes.storage.id}, Nombre: ${offer.variant_attributes.storage.name}`);
                    return offer.variant_attributes.storage.id === storage;
                }
                return false;
            });
        } else {
            console.log('No se aplica filtro de almacenamiento - mostrando todas las ofertas');
        }
        
        // Filtrar por condición si se proporciona y no es null
        if (condition && condition !== 'null') {
            console.log(`Filtrando por condición ID: ${condition}`);
            
            filteredOffers = filteredOffers.filter(offer => {
                if (offer.condition && offer.condition.id) {
                    console.log(`Oferta condición ID: ${offer.condition.id}, Nombre: ${offer.condition.name}`);
                    return offer.condition.id === condition;
                }
                return false;
            });
        } else {
            console.log('No se aplica filtro de condición - mostrando todas las ofertas');
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
        document.querySelector('.offers-header h2').textContent = `${filteredOffers.length} ofertas`;
        
        // Configurar el enlace "Ver todo"
        setupViewAllLink(productId, filteredOffers.length);
        
        // Ordenar ofertas por precio de menor a mayor
        filteredOffers.sort((a, b) => a.price - b.price);
        
        // Renderizar todas las ofertas filtradas
        renderOffers(filteredOffers);
        
        // Mostrar mensaje si no hay ofertas que coincidan con los filtros
        if (filteredOffers.length === 0) {
            offersSection.innerHTML = '<div class="no-offers">No hay ofertas disponibles para esta combinación de filtros.</div>';
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
        
        // Agregar información de color y almacenamiento si existe
        if (offer.variant_attributes) {
            let variantInfo = '';
            let colorName = '';
            let storageName = '';
            
            // Obtener color si existe
            if (offer.variant_attributes.color && offer.variant_attributes.color.name) {
                colorName = offer.variant_attributes.color.name;
            }
            
            // Obtener almacenamiento si existe
            if (offer.variant_attributes.storage && offer.variant_attributes.storage.name) {
                storageName = offer.variant_attributes.storage.name;
            }
            
            // Combinar color y almacenamiento en una sola línea
            if (colorName && storageName) {
                variantInfo += `<div class="variant-info">${colorName} - ${storageName}</div>`;
            } else if (colorName) {
                variantInfo += `<div class="variant-info">${colorName}</div>`;
            } else if (storageName) {
                variantInfo += `<div class="variant-info">${storageName}</div>`;
            }
            
            if (variantInfo) {
                offerHTML += variantInfo;
            }
        }
        
        // Agregar condición de la oferta si existe
        if (offer.condition && offer.condition.name) {
            offerHTML += `<div class="offer-condition">${offer.condition.name}</div>`;
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
        // Mostrar simplemente "Ver todo" ya que todas las ofertas se muestran en la página principal
        viewAllLink.textContent = 'Ver todo';
        
        // Configurar el enlace para ir a la página de todas las ofertas
        viewAllLink.href = `all-offers.html?product=${productId}`;
    }
}
