# iPhone 14 Shopping Mock

Este proyecto es un mock de una página de comparación de precios para el iPhone 14, creado con HTML, CSS y JavaScript.

## Características

- Interfaz de usuario que simula una aplicación móvil de comparación de precios
- Visualización de producto con imagen, precio y especificaciones
- Opciones interactivas para seleccionar color, almacenamiento y variante
- Navegación por pestañas para ver ofertas, gráficos de precios e información del producto
- Barra de navegación inferior para acceder a diferentes secciones de la aplicación

## Cómo ejecutar localmente

Para ver este mock, simplemente abre el archivo `index.html` en tu navegador web o utiliza un servidor local.

```bash
# Instalar dependencias
npm install

# Ejecutar el servidor local
npm start

# O alternativamente:
# Ejemplo con Python (desde la carpeta del proyecto)
python -m http.server

# Ejemplo con Node.js (requiere http-server)
npx http-server
```

## Desplegar en Heroku

### Prerrequisitos
- Tener una cuenta en [Heroku](https://heroku.com)
- Tener instalado [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- Tener Git configurado

### Pasos para desplegar

1. **Iniciar sesión en Heroku CLI:**
```bash
heroku login
```

2. **Crear una nueva aplicación en Heroku:**
```bash
heroku create tu-nombre-app
```

3. **Agregar el repositorio remoto de Heroku:**
```bash
heroku git:remote -a tu-nombre-app
```

4. **Hacer commit de los cambios:**
```bash
git add .
git commit -m "Preparar para despliegue en Heroku"
```

5. **Desplegar la aplicación:**
```bash
git push heroku main
```

6. **Abrir la aplicación:**
```bash
heroku open
```

### Comandos útiles de Heroku

```bash
# Ver logs de la aplicación
heroku logs --tail

# Abrir la aplicación en el navegador
heroku open

# Ver información de la aplicación
heroku info

# Escalar la aplicación (si es necesario)
heroku ps:scale web=1
```

## Estructura del proyecto

- `index.html`: Estructura HTML del mock
- `styles.css`: Estilos CSS para la interfaz de usuario
- `script.js`: Funcionalidad interactiva con JavaScript
- `images/`: Carpeta que contiene las imágenes del producto
- `server.js`: Servidor Express para producción
- `package.json`: Configuración de dependencias y scripts
- `Procfile`: Configuración para Heroku
