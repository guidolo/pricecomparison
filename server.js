const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Ruta principal - servir search.html directamente
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'search.html'));
});

// Ruta para index.html
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para search.html
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'search.html'));
});

// Ruta para all-offers.html
app.get('/all-offers', (req, res) => {
    res.sendFile(path.join(__dirname, 'all-offers.html'));
});

// Servir archivos JSON de la API
app.get('/api/products/:product', (req, res) => {
    let productParam = req.params.product;
    if (productParam.endsWith('.json')) {
        productParam = productParam.slice(0, -5);
    }
    const productFile = path.join(__dirname, 'api', 'products', `${productParam}.json`);
    res.sendFile(productFile);
});

app.get('/api/offers/:product', (req, res) => {
    let productParam = req.params.product;
    if (productParam.endsWith('.json')) {
        productParam = productParam.slice(0, -5);
    }
    const offerFile = path.join(__dirname, 'api', 'offers', `${productParam}.json`);
    res.sendFile(offerFile);
});

app.get('/api/product-catalog.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'api', 'product-catalog.json'));
});

// Servir archivos estáticos desde el directorio raíz (después de las rutas específicas)
app.use(express.static(__dirname));

// Manejar rutas no encontradas
app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'search.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Abre http://localhost:${PORT} en tu navegador`);
}); 