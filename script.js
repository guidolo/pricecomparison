document.addEventListener('DOMContentLoaded', function() {
    // Actualizar la hora en la barra de estado
    function updateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        document.querySelector('.time').textContent = `${hours}:${minutes}`;
    }
    
    // Actualizar la hora cada minuto
    updateTime();
    setInterval(updateTime, 60000);
    
    // Manejar clics en las opciones de producto
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            // Desactivar todas las opciones del mismo tipo
            const type = this.getAttribute('data-type');
            document.querySelectorAll(`.option[data-type="${type}"]`).forEach(opt => {
                opt.classList.remove('active');
            });
            
            // Activar la opción seleccionada
            this.classList.add('active');
        });
    });
    
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
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            // Desactivar todos los puntos
            dots.forEach(d => d.classList.remove('active'));
            
            // Activar el punto seleccionado
            this.classList.add('active');
            
            // Aquí se cambiaría la imagen si tuviéramos múltiples imágenes
            // Por ahora, solo simulamos un cambio de imagen
            const productImg = document.getElementById('product-img');
            productImg.style.opacity = '0.8';
            setTimeout(() => {
                productImg.style.opacity = '1';
            }, 300);
        });
    });
    
    // Manejar clic en el botón de comparar ofertas
    const compareBtn = document.querySelector('.compare-btn');
    compareBtn.addEventListener('click', function() {
        alert('Comparando 57 ofertas de iPhone 14');
    });
    
    // Manejar clic en el botón de cerrar
    const closeBtn = document.querySelector('.close-btn');
    closeBtn.addEventListener('click', function() {
        alert('Cerrando vista de producto');
    });
    
    // Manejar clic en el botón de compartir
    const shareBtn = document.querySelector('.share-btn');
    shareBtn.addEventListener('click', function() {
        alert('Compartiendo producto: Apple iPhone 14');
    });
});
