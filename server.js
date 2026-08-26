const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Envía un archivo JSON de la API y responde 404 si no existe.
 * @param {import('express').Response} res
 * @param {string} filePath
 */
function sendJsonFile(res, filePath) {
    fs.access(filePath, fs.constants.R_OK, error => {
        if (error) {
            res.status(404).json({ error: 'Recurso no encontrado' });
            return;
        }
        res.sendFile(filePath);
    });
}

/**
 * Evita path traversal en los parámetros de la API.
 * @param {string} value
 * @returns {string}
 */
function safeSlug(value) {
    const withoutExtension = value.endsWith('.json') ? value.slice(0, -5) : value;
    return withoutExtension.replace(/[^a-zA-Z0-9_-]/g, '');
}

// Páginas
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'search.html')));
app.get('/index', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/search', (req, res) => res.sendFile(path.join(__dirname, 'search.html')));
app.get('/all-offers', (req, res) => res.sendFile(path.join(__dirname, 'all-offers.html')));

// API estática (archivos JSON)
app.get('/api/product-catalog.json', (req, res) => {
    sendJsonFile(res, path.join(__dirname, 'api', 'product-catalog.json'));
});

app.get('/api/products/:product', (req, res) => {
    const slug = safeSlug(req.params.product);
    sendJsonFile(res, path.join(__dirname, 'api', 'products', `${slug}.json`));
});

app.get('/api/offers/:product', (req, res) => {
    const slug = safeSlug(req.params.product);
    sendJsonFile(res, path.join(__dirname, 'api', 'offers', `${slug}.json`));
});

// Archivos estáticos (después de las rutas específicas)
app.use(express.static(__dirname));

// Cualquier otra ruta vuelve al buscador
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'Recurso no encontrado' });
        return;
    }
    res.status(404).sendFile(path.join(__dirname, 'search.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
