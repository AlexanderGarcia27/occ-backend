# Scrapin-OCC Backend

Backend API para el scraper de vacantes de OCC.com.mx

## Despliegue en Render

1. Sube este directorio `backend/` a un repositorio de GitHub
2. Ve a [Render.com](https://render.com) y crea una cuenta
3. Conecta tu repositorio de GitHub
4. Crea un nuevo "Web Service"
5. Configura las siguientes variables de entorno:
   - `LOCATIONIQ_API_KEY`: Tu API key de LocationIQ
   - `NODE_ENV`: production

## Variables de Entorno

- `PORT`: Puerto del servidor (Render lo configura automáticamente)
- `LOCATIONIQ_API_KEY`: API key para el servicio de geocodificación
- `NODE_ENV`: Entorno de ejecución

## Endpoints

### POST /api/search
Realiza el scraping de vacantes
```json
{
  "searchTerm": "desarrollador"
}
```

### GET /api/resultados.json
Obtiene los resultados en formato JSON

### GET /api/download/:filename
Descarga archivos generados (json, csv, xlsx, pdf)

### GET /api/geocode
Proxy para geocodificación de ubicaciones

### GET /health
Health check del servicio
