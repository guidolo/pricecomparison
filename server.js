const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde el directorio raíz
app.use(express.static(__dirname));

// Ruta principal
app.get('/', (req, res) => {
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
    const productFile = path.join(__dirname, 'api', 'products', `${req.params.product}.json`);
    res.sendFile(productFile);
});

app.get('/api/offers/:product', (req, res) => {
    const offerFile = path.join(__dirname, 'api', 'offers', `${req.params.product}.json`);
    res.sendFile(offerFile);
});

app.get('/api/product-catalog.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'api', 'product-catalog.json'));
});

// Manejar rutas no encontradas
app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Abre http://localhost:${PORT} en tu navegador`);
}); 