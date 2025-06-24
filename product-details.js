// Función para cargar los detalles del producto
async function loadProductDetails() {
    try {
        // Obtener el ID del producto de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('product') || 'iphone_14_pro_max';
        // Construir el path del archivo JSON según el producto
        const apiUrl = `api/products/${productId}.json`;
        // Cargar el archivo JSON con los detalles del producto
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Verificar si tenemos datos de detalles del producto
        if (data && data.product) {
            // Mostrar el resumen del producto si existe
            if (data.product.product_summary) {
                displayProductSummary(data.product.product_summary);
            }
            
            // Mostrar los detalles completos del producto si existen
            if (data.product.product_details) {
                displayProductDetails(data.product.product_details);
            } else {
                console.error('No se encontraron detalles del producto en el JSON');
            }
        }
    } catch (error) {
        console.error('Error al cargar los detalles del producto:', error);
    }
}

// Función para mostrar el resumen del producto
function displayProductSummary(productSummary) {
    const productDetailsContent = document.querySelector('.product-details-content');
    
    // Crear el contenedor del resumen
    const summaryElement = document.createElement('div');
    summaryElement.className = 'product-summary-section';
    
    // Crear el título del resumen
    const summaryTitle = document.createElement('h3');
    summaryTitle.className = 'product-summary-title';
    summaryTitle.textContent = 'Resumen del Producto';
    summaryElement.appendChild(summaryTitle);
    
    // Crear la grilla de especificaciones del resumen
    const summaryGrid = document.createElement('div');
    summaryGrid.className = 'product-summary-grid';
    
    // Mapear las claves del resumen a nombres más legibles
    const summaryLabels = {
        'screen_size': 'Tamaño de Pantalla',
        'front_camera_mp': 'Cámara Frontal',
        'ram_gb': 'Memoria RAM',
        'battery': 'Batería',
        'operating_system': 'Sistema Operativo'
    };
    
    // Crear elementos para cada especificación del resumen
    Object.entries(productSummary).forEach(([key, value]) => {
        if (value !== 'N/A') {
            const summaryItem = document.createElement('div');
            summaryItem.className = 'product-summary-item';
            
            const summaryName = document.createElement('div');
            summaryName.className = 'product-summary-name';
            summaryName.textContent = summaryLabels[key] || key;
            
            const summaryValue = document.createElement('div');
            summaryValue.className = 'product-summary-value';
            summaryValue.textContent = value;
            
            summaryItem.appendChild(summaryName);
            summaryItem.appendChild(summaryValue);
            summaryGrid.appendChild(summaryItem);
        }
    });
    
    summaryElement.appendChild(summaryGrid);
    
    // Insertar el resumen al principio del contenido
    productDetailsContent.insertBefore(summaryElement, productDetailsContent.firstChild);
}

// Función para mostrar los detalles del producto en la interfaz
function displayProductDetails(productDetails) {
    const productDetailsContent = document.querySelector('.product-details-content');
    
    // Guardar el resumen del producto si existe
    const existingSummary = productDetailsContent.querySelector('.product-summary-section');
    
    // Limpiar el contenido existente
    productDetailsContent.innerHTML = '';
    
    // Restaurar el resumen del producto si existía
    if (existingSummary) {
        productDetailsContent.appendChild(existingSummary);
    }
    
    // Iterar por cada categoría de detalles
    productDetails.forEach(category => {
        // Crear el contenedor de la categoría
        const categoryElement = document.createElement('div');
        categoryElement.className = 'product-detail-category';
        
        // Crear el título de la categoría
        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'product-detail-category-title';
        categoryTitle.textContent = category.category;
        categoryElement.appendChild(categoryTitle);
        
        // Iterar por cada especificación en la categoría
        category.specifications.forEach(spec => {
            // Solo mostrar especificaciones que tienen un nombre
            if (spec.name) {
                const specElement = document.createElement('div');
                specElement.className = 'product-detail-item';
                
                const specName = document.createElement('div');
                specName.className = 'product-detail-name';
                specName.textContent = spec.name;
                
                const specValue = document.createElement('div');
                specValue.className = 'product-detail-value';
                specValue.textContent = spec.value;
                
                specElement.appendChild(specName);
                specElement.appendChild(specValue);
                categoryElement.appendChild(specElement);
            } else if (spec.value) {
                // Para valores sin nombre, los agregamos como continuación del anterior
                const lastSpecElement = categoryElement.querySelector('.product-detail-item:last-child');
                if (lastSpecElement) {
                    const lastSpecValue = lastSpecElement.querySelector('.product-detail-value');
                    lastSpecValue.innerHTML += '<br>' + spec.value;
                }
            }
        });
        
        // Agregar la categoría al contenedor principal
        productDetailsContent.appendChild(categoryElement);
    });
}

// Función para manejar la navegación entre pestañas
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab-navigation .tab');
    const offersSection = document.querySelector('.offers-section');
    const productDetailsSection = document.querySelector('.product-details-section');
    const priceChartSection = document.querySelector('.price-chart-section');

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', async () => {
            // Remover la clase activa de todas las pestañas
            tabs.forEach(t => t.classList.remove('active'));
            // Agregar la clase activa a la pestaña seleccionada
            tab.classList.add('active');

            // Mostrar la sección correspondiente
            if (index === 0) { // Pestaña de Ofertas
                offersSection.style.display = 'block';
                productDetailsSection.style.display = 'none';
                priceChartSection.style.display = 'none';
            } else if (index === 1) { // Pestaña de Gráfico de precios
                offersSection.style.display = 'none';
                productDetailsSection.style.display = 'none';
                priceChartSection.style.display = 'block';
                // Cargar y renderizar el gráfico
                await renderPriceChart();
            } else if (index === 2) { // Pestaña de Información del producto
                offersSection.style.display = 'none';
                productDetailsSection.style.display = 'block';
                priceChartSection.style.display = 'none';
            }
        });
    });
}

/**
 * Actualiza el gráfico de precios si está visible
 * Esta función se llama cuando cambian los filtros
 */
async function updatePriceChartIfVisible() {
    console.log('updatePriceChartIfVisible called');
    
    const priceChartSection = document.querySelector('.price-chart-section');
    const priceChartTab = document.querySelector('.tab-navigation .tab:nth-child(2)');
    
    console.log('priceChartSection:', priceChartSection);
    console.log('priceChartTab:', priceChartTab);
    console.log('priceChartTab active:', priceChartTab?.classList.contains('active'));
    console.log('priceChartSection display:', priceChartSection?.style.display);
    
    // Solo actualizar si la pestaña del gráfico está activa y visible
    if (priceChartTab && priceChartTab.classList.contains('active') && 
        priceChartSection && priceChartSection.style.display !== 'none') {
        console.log('Updating price chart...');
        await renderPriceChart();
        console.log('Price chart updated successfully');
    } else {
        console.log('Price chart not visible, skipping update');
    }
}

// Renderiza el gráfico de precios usando canvas puro
async function renderPriceChart() {
    try {
        console.log('renderPriceChart called');
        
        // Obtener el ID del producto de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('product') || 'iphone_14_pro_max';
        
        // Obtener los filtros actuales - intentar primero desde las variables globales
        // y luego desde la URL como fallback
        let color = null;
        let storage = null;
        let condition = null;
        
        // Intentar obtener desde variables globales (si están disponibles)
        if (typeof currentColorId !== 'undefined' && currentColorId) {
            color = currentColorId;
        } else {
            color = urlParams.get('color');
        }
        
        if (typeof currentStorageId !== 'undefined' && currentStorageId) {
            storage = currentStorageId;
        } else {
            storage = urlParams.get('storage');
        }
        
        if (typeof currentConditionId !== 'undefined' && currentConditionId) {
            condition = currentConditionId;
        } else {
            condition = urlParams.get('condition');
        }
        
        console.log('Current filters - color:', color, 'storage:', storage, 'condition:', condition);
        console.log('Global variables - currentColorId:', typeof currentColorId !== 'undefined' ? currentColorId : 'undefined', 
                   'currentStorageId:', typeof currentStorageId !== 'undefined' ? currentStorageId : 'undefined',
                   'currentConditionId:', typeof currentConditionId !== 'undefined' ? currentConditionId : 'undefined');
        
        // Construir el nombre del archivo de ofertas
        const offersFileName = `${productId}.json`;
        const offersApiUrl = `api/offers/${offersFileName}`;
        
        console.log('Fetching offers from:', offersApiUrl);
        
        // Obtener las ofertas
        const response = await fetch(offersApiUrl);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const offersData = await response.json();
        console.log('Total offers loaded:', offersData.offers.length);
        
        // Aplicar los mismos filtros que se usan en offers-loader.js
        let filteredOffers = offersData.offers;
        
        // Filtrar por color si se proporciona y no es null
        if (color && color !== 'null') {
            console.log(`Filtrando por color ID: ${color}`);
            filteredOffers = filteredOffers.filter(offer => {
                if (offer.variant_attributes && offer.variant_attributes.color) {
                    return offer.variant_attributes.color.id === color;
                }
                return false;
            });
            console.log('Ofertas después del filtro de color:', filteredOffers.length);
        }
        
        // Filtrar por almacenamiento si se proporciona y no es null
        if (storage && storage !== 'null') {
            console.log(`Filtrando por almacenamiento ID: ${storage}`);
            filteredOffers = filteredOffers.filter(offer => {
                if (offer.variant_attributes && offer.variant_attributes.storage) {
                    return offer.variant_attributes.storage.id === storage;
                }
                return false;
            });
            console.log('Ofertas después del filtro de almacenamiento:', filteredOffers.length);
        }
        
        // Filtrar por condición si se proporciona y no es null
        if (condition && condition !== 'null') {
            console.log(`Filtrando por condición ID: ${condition}`);
            filteredOffers = filteredOffers.filter(offer => {
                if (offer.condition && offer.condition.id) {
                    return offer.condition.id === condition;
                }
                return false;
            });
            console.log('Ofertas después del filtro de condición:', filteredOffers.length);
        }
        
        // Obtener la primera oferta filtrada que tenga price_hist
        let firstOfferWithPriceHist = null;
        for (const offer of filteredOffers) {
            if (offer.price_hist && offer.price_hist.length > 0) {
                firstOfferWithPriceHist = offer;
                break;
            }
        }
        
        console.log('Primera oferta con price_hist encontrada:', firstOfferWithPriceHist ? 'Sí' : 'No');
        
        // Si no hay ofertas filtradas con price_hist, no mostrar nada
        if (!firstOfferWithPriceHist) {
            console.log('No hay ofertas filtradas con price_hist - mostrando mensaje');
            const canvas = document.getElementById('priceChartCanvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const width = canvas.width = canvas.offsetWidth;
            const height = canvas.height = canvas.offsetHeight;
            
            ctx.fillStyle = '#f8fafd';
            ctx.fillRect(0, 0, width, height);
            
            ctx.fillStyle = '#888';
            ctx.font = '18px sans-serif';
            ctx.fillText('Sin datos de histórico de precios para los filtros seleccionados', 20, height / 2);
            return;
        }
        
        // Usar el price_hist de la primera oferta (filtrada o no)
        const priceHistory = firstOfferWithPriceHist.price_hist;
        console.log('Price history data:', priceHistory);
        console.log('Oferta seleccionada:', firstOfferWithPriceHist.variant_attributes);
        
        // Generar fechas para los últimos 6 meses (el último registro es junio 2025)
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const currentYear = 2025;
        
        // Crear array de fechas en formato YYYY-MM
        const dates = [];
        for (let i = 5; i >= 0; i--) {
            const month = (6 - i) % 12;
            const year = currentYear - (month === 0 ? 1 : 0);
            const monthStr = (month === 0 ? 12 : month).toString().padStart(2, '0');
            dates.push(`${year}-${monthStr}`);
        }
        
        const canvas = document.getElementById('priceChartCanvas');
        const ctx = canvas.getContext('2d');
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Configuración visual
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        
        ctx.fillStyle = '#f8fafd';
        ctx.fillRect(0, 0, width, height);
        
        // Margen y escalas
        const margin = 40;
        const chartW = width - margin * 2;
        const chartH = height - margin * 2;
        
        // Extraer precios
        const prices = priceHistory;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        // Dibujar líneas de fondo
        ctx.strokeStyle = '#e0e6ef';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 4; i++) {
            const y = margin + (chartH * i) / 4;
            ctx.beginPath();
            ctx.moveTo(margin, y);
            ctx.lineTo(width - margin, y);
            ctx.stroke();
            
            // Etiquetas de precio (eje Y)
            ctx.fillStyle = '#bbb';
            ctx.font = '13px sans-serif';
            const priceLabel = (maxPrice - ((maxPrice - minPrice) * i) / 4).toFixed(0);
            ctx.fillText(priceLabel + ' $', 5, y + 4);
        }
        
        // Dibujar línea de precios
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        priceHistory.forEach((price, i) => {
            const x = margin + (chartW * i) / (priceHistory.length - 1);
            const y = margin + chartH * (1 - (price - minPrice) / (maxPrice - minPrice || 1));
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        
        // Dibujar puntos y etiquetas
        priceHistory.forEach((price, i) => {
            const x = margin + (chartW * i) / (priceHistory.length - 1);
            const y = margin + chartH * (1 - (price - minPrice) / (maxPrice - minPrice || 1));
            
            // Punto
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = '#ff9800';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Etiqueta de precio solo para min y max
            if (price === minPrice || price === maxPrice) {
                ctx.fillStyle = '#ff9800';
                ctx.font = 'bold 13px sans-serif';
                ctx.fillText(price.toFixed(0) + ' $', x - 25, y - 12);
            }
            
            // Etiqueta de fecha (mes)
            ctx.fillStyle = '#888';
            ctx.font = '12px sans-serif';
            ctx.fillText(months[i], x - 18, height - 10);
        });
        
    } catch (error) {
        console.error('Error al renderizar el gráfico de precios:', error);
        
        // Mostrar mensaje de error en el canvas
        const canvas = document.getElementById('priceChartCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        
        ctx.fillStyle = '#f8fafd';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#888';
        ctx.font = '18px sans-serif';
        ctx.fillText('Error al cargar el gráfico de precios', 20, height / 2);
    }
}

// Cargar los detalles del producto cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    setupTabNavigation();
});
