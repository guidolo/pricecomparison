document.addEventListener('DOMContentLoaded', function() {
    // Actualizar la hora en la barra de estado
    updateTime();
    setInterval(updateTime, 60000);
    
    // Inicializar el cargador de productos con el producto de la URL
    initProductLoader();
    
    // Manejar clics en las pestañas
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Desactivar todas las pestañas
            tabs.forEach(t => t.classList.remove('active'));
            
            // Activar la pestaña seleccionada
            this.classList.add('active');
        });
    });
    
    // Manejar clics en los elementos de navegación inferior
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Desactivar todos los elementos de navegación
            navItems.forEach(i => i.classList.remove('active'));
            
            // Activar el elemento seleccionado
            this.classList.add('active');
        });
    });
    
    // Manejar clics en los puntos del carrusel
    document.querySelector('.carousel-dots').addEventListener('click', function(event) {
        if (event.target.classList.contains('dot')) {
            // Desactivar todos los puntos
            document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
            
            // Activar el punto seleccionado
            event.target.classList.add('active');
            
            // Cambiar la imagen si hay una URL en el punto
            const imageUrl = event.target.getAttribute('data-image-url');
            if (imageUrl) {
                const productImg = document.getElementById('product-img');
                productImg.style.opacity = '0.8';
                productImg.src = imageUrl;
                setTimeout(() => {
                    productImg.style.opacity = '1';
                }, 300);
            }
        }
    });
    
    // Manejar clic en el botón de cerrar
    const closeBtn = document.querySelector('.close-btn');
    closeBtn.addEventListener('click', function() {
        window.location.href = 'search.html';
    });
    
    // Manejar clic en el botón de compartir
    const shareBtn = document.querySelector('.share-btn');
    shareBtn.addEventListener('click', function() {
        alert('Compartiendo producto: Apple iPhone 14');
    });
});

/**
 * Actualiza la hora en la barra de estado
 */
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.querySelector('.time').textContent = `${hours}:${minutes}`;
}

/**
 * Agrega el producto a la wishlist
 */
function addToWishlist() {
    const wishlistBtn = document.querySelector('.wishlist-btn');
    const heartIcon = wishlistBtn.querySelector('i');
    
    // Cambiar el ícono de corazón vacío a lleno
    heartIcon.classList.remove('far');
    heartIcon.classList.add('fas');
    
    // Mostrar mensaje de confirmación
    alert('Producto agregado a tu wishlist');
}

/**
 * Configura una alerta de precio para el producto
 */
function setPriceAlert() {
    const priceAlertBtn = document.querySelector('.price-alert-btn');
    const bellIcon = priceAlertBtn.querySelector('i');
    
    // Cambiar el ícono de campana vacía a llena
    bellIcon.classList.remove('far');
    bellIcon.classList.add('fas');
    
    // Mostrar mensaje de confirmación
    alert('Te avisaremos si el producto baja de precio');
}
