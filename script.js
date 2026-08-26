/**
 * Interacciones de la ficha de producto: reloj, carrusel, acciones y navegación.
 */

document.addEventListener('DOMContentLoaded', () => {
    startStatusBarClock();
    initProductLoader();
    setupCarousel();
    setupTopActions();
    setupBottomNav();
});

/**
 * Cambia la imagen principal al tocar los puntos del carrusel.
 */
function setupCarousel() {
    const dotsContainer = document.querySelector('.carousel-dots');
    const productImg = document.getElementById('product-img');
    if (!dotsContainer || !productImg) return;

    dotsContainer.addEventListener('click', event => {
        const dot = event.target.closest('.dot');
        if (!dot) return;

        dotsContainer.querySelectorAll('.dot').forEach(item => item.classList.remove('active'));
        dot.classList.add('active');

        const imageUrl = dot.dataset.imageUrl;
        if (!imageUrl) return;

        productImg.style.opacity = '0';
        const swap = () => {
            productImg.removeEventListener('load', swap);
            productImg.style.opacity = '1';
        };
        productImg.addEventListener('load', swap);
        productImg.src = imageUrl;
        // Fallback por si la imagen ya estaba en caché y no dispara load.
        setTimeout(() => { productImg.style.opacity = '1'; }, 400);
    });
}

/**
 * Acciones de la barra superior: cerrar, compartir, favoritos y alertas.
 */
function setupTopActions() {
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.location.href = 'search.html';
        });
    }

    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const title = document.querySelector('.product-title').textContent;
            const shareData = { title, text: `Mira las ofertas de ${title}`, url: window.location.href };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                    return;
                } catch (error) {
                    if (error.name === 'AbortError') return;
                }
            }

            if (navigator.clipboard) {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    showToast('Enlace copiado al portapapeles');
                    return;
                } catch (error) {
                    /* Continúa al mensaje genérico. */
                }
            }

            showToast(`Comparte ${title} con este enlace`);
        });
    }

    const wishlistBtn = document.querySelector('.wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            const isActive = wishlistBtn.classList.toggle('is-active');
            wishlistBtn.setAttribute('aria-pressed', String(isActive));

            const icon = wishlistBtn.querySelector('i');
            icon.classList.toggle('fas', isActive);
            icon.classList.toggle('far', !isActive);

            showToast(isActive ? 'Guardado en favoritos' : 'Quitado de favoritos');
        });
    }

    const priceAlertBtn = document.querySelector('.price-alert-btn');
    if (priceAlertBtn) {
        priceAlertBtn.addEventListener('click', () => {
            const isActive = priceAlertBtn.classList.toggle('is-active');
            priceAlertBtn.setAttribute('aria-pressed', String(isActive));

            const icon = priceAlertBtn.querySelector('i');
            icon.classList.toggle('fas', isActive);
            icon.classList.toggle('far', !isActive);

            showToast(isActive
                ? 'Te avisaremos si baja de precio'
                : 'Alerta de precio desactivada');
        });
    }
}

/**
 * Marca la sección activa de la barra inferior.
 */
function setupBottomNav() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(other => other.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

