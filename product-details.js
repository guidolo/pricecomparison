// Función para cargar los detalles del producto
async function loadProductDetails() {
    try {
        // Cargar el archivo JSON con los detalles del producto
        const response = await fetch('api/iphone_14_pro_max_consolidated.json');
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
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Remover la clase activa de todas las pestañas
            tabs.forEach(t => t.classList.remove('active'));
            
            // Agregar la clase activa a la pestaña seleccionada
            tab.classList.add('active');
            
            // Mostrar la sección correspondiente
            if (index === 0) { // Pestaña de Ofertas
                offersSection.style.display = 'block';
                productDetailsSection.style.display = 'none';
            } else if (index === 2) { // Pestaña de Información del producto
                offersSection.style.display = 'none';
                productDetailsSection.style.display = 'block';
            }
            // Nota: La pestaña del medio (Gráfico de precios) no está implementada en este ejemplo
        });
    });
}

// Cargar los detalles del producto cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    setupTabNavigation();
});
