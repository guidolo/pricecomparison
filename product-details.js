// Función para cargar los detalles del producto
async function loadProductDetails() {
    try {
        // Obtener el ID del producto de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('product') || 'iphone_14_pro_max';
        // Construir el path del archivo JSON según el producto
        const apiUrl = `api/${productId}_consolidated.json`;
        // Cargar el archivo JSON con los detalles del producto
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Verificar si tenemos datos de detalles del producto
        if (data && data.product && data.product.product_details) {
            displayProductDetails(data.product.product_details);
        } else {
            console.error('No se encontraron detalles del producto en el JSON');
        }
    } catch (error) {
        console.error('Error al cargar los detalles del producto:', error);
    }
}

// Función para mostrar los detalles del producto en la interfaz
function displayProductDetails(productDetails) {
    const productDetailsContent = document.querySelector('.product-details-content');
    
    // Limpiar el contenido existente
    productDetailsContent.innerHTML = '';
    
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

// Renderiza el gráfico de precios usando canvas puro
async function renderPriceChart() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product') || 'iphone_14_pro_max';
    const apiUrl = `api/${productId}_consolidated.json`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const priceHistory = (data && data.product && data.product.price_history) ? data.product.price_history : [];
    const canvas = document.getElementById('priceChartCanvas');
    const ctx = canvas.getContext('2d');
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Configuración visual
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    ctx.fillStyle = '#f8fafd';
    ctx.fillRect(0, 0, width, height);
    // Si no hay datos, mostrar mensaje
    if (!priceHistory.length) {
        ctx.fillStyle = '#888';
        ctx.font = '18px sans-serif';
        ctx.fillText('Sin datos de histórico de precios', 20, height / 2);
        return;
    }
    // Margen y escalas
    const margin = 40;
    const chartW = width - margin * 2;
    const chartH = height - margin * 2;
    // Extraer precios y fechas
    const prices = priceHistory.map(p => p.price);
    const dates = priceHistory.map(p => p.date.slice(0, 7));
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
        const priceLabel = (maxPrice - ((maxPrice - minPrice) * i) / 4).toFixed(2);
        ctx.fillText(priceLabel + ' $', 5, y + 4);
    }
    // Dibujar línea de precios
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 3;
    ctx.beginPath();
    priceHistory.forEach((point, i) => {
        const x = margin + (chartW * i) / (priceHistory.length - 1);
        const y = margin + chartH * (1 - (point.price - minPrice) / (maxPrice - minPrice || 1));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    // Dibujar puntos y etiquetas solo para min y max
    priceHistory.forEach((point, i) => {
        const x = margin + (chartW * i) / (priceHistory.length - 1);
        const y = margin + chartH * (1 - (point.price - minPrice) / (maxPrice - minPrice || 1));
        // Punto
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Etiqueta de precio solo para min y max
        if (point.price === minPrice || point.price === maxPrice) {
            ctx.fillStyle = '#ff9800';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText(point.price.toFixed(2) + ' $', x - 25, y - 12);
        }
        // Etiqueta de fecha
        ctx.fillStyle = '#888';
        ctx.font = '12px sans-serif';
        ctx.fillText(dates[i], x - 18, height - 10);
    });
}

// Cargar los detalles del producto cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    setupTabNavigation();
});
