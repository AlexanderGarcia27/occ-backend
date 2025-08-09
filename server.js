import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeOCC } from './scrape.js';
import fs from 'fs';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración CORS más permisiva para producción
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-vercel-app.vercel.app', // Reemplazar con tu URL de Vercel
    /\.vercel\.app$/  // Permitir todos los subdominios de Vercel
  ],
  credentials: true
}));

app.use(express.json());

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend funcionando correctamente' });
});

// Endpoint para buscar
app.post('/api/search', async (req, res) => {
    try {
        const { searchTerm } = req.body;
        
        if (!searchTerm || !searchTerm.trim()) {
            return res.json({ success: false, error: 'Término de búsqueda requerido' });
        }

        console.log(`Buscando: ${searchTerm}`);
        
        // Llamar a la función del scraper
        const results = await scrapeOCC(searchTerm.trim(), true); // true para producción
        
        if (results.length === 0) {
            return res.json({ success: false, error: 'No se encontraron vacantes' });
        }

        console.log(`Se encontraron ${results.length} vacantes`);
        
        res.json({ 
            success: true, 
            message: `Se encontraron ${results.length} vacantes`,
            count: results.length
        });

    } catch (error) {
        console.error('Error en la búsqueda:', error);
        res.status(500).json({ success: false, error: 'Error al procesar la búsqueda' });
    }
});

// Servir resultados.json
app.get('/api/resultados.json', (req, res) => {
  const filePath = path.join(__dirname, 'resultados.json');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'No hay resultados.json' });
  }
});

// Servir archivos de descarga
app.get('/api/download/:filename', (req, res) => {
  const { filename } = req.params;
  const allowedFiles = ['resultados.json', 'resultados.csv', 'resultados.xlsx', 'resultados.pdf'];
  
  if (!allowedFiles.includes(filename)) {
    return res.status(400).json({ error: 'Archivo no permitido' });
  }
  
  const filePath = path.join(__dirname, filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: `Archivo ${filename} no encontrado` });
  }
});

// Endpoint proxy para geocodificación con LocationIQ
app.get('/api/geocode', async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ error: 'Falta el parámetro q' });
    }
    
    // Tu API key de LocationIQ
    const apiKey = process.env.LOCATIONIQ_API_KEY || 'pk.8e189bb0bea1772e515ad047bed32836';
    const url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(q)}&countrycodes=mx&format=json&limit=1&addressdetails=1`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Scrapin-OCC/1.0 (tuemail@dominio.com)'
            }
        });
        
        if (!response.ok) {
            return res.status(500).json({ error: 'Error al consultar LocationIQ' });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Error en geocodificación:', err);
        res.status(500).json({ error: 'Error al buscar la ubicación' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend ejecutándose en puerto ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
