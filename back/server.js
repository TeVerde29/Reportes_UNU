require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const estado        = require('./routes/estadoRoute');
const estudiante    = require('./routes/estudianteRoute');
const reaccion      = require('./routes/reaccionRoute');
const reporte       = require('./routes/reporteRoute');
const tipoProblema  = require('./routes/tipo_problemaRoute');
const ubicacion     = require('./routes/ubicacionRoute');
const usuario       = require('./routes/usuarioRoute');

app.get('/', (req, res) => {
    res.json({
        mensaje: "API SISTEMA DE REPORTE DE INCIDENCIAS - Backend",
        version: "1.0.0",
        endpoints: { // Falta poner las rutas usadas en cada controlador
            estado: {
            },
            estudiante: {
            },
            reaccion: {
            },
            reporte: {
                crear: "POST /api/reporte",
                actualizar: "PUT /api/reporte/:id",
                obtenerPorId: "GET /api/reporte/:id",
                porEstado: "GET /api/reporte/estado/:id",
                topPorReacciones: "GET /api/reporte/top/reacciones",
                pendientesPorEstudiante: "GET /api/reporte/pendientes/estudiante/:id"
            },
            tipoProblema: {
            },
            ubicacion: {
            },
            usuario: {
            }
        },
        autenticacion: {
            tipo: "Bearer Token (JWT)",
            header: "Authorization: Bearer <token>"
        }
    });
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/estado', estado);
app.use('/api/estudiante', estudiante);
app.use('/api/reaccion', reaccion);
app.use('/api/reporte', reporte);
app.use('/api/tipoProblema', tipoProblema);
app.use('/api/ubicacion', ubicacion);
app.use('/api/usuario', usuario);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        mensaje: "Ruta no encontrada"
    });
});

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════');
    console.log('Servidor con JWT inicializado correctamente');
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Base de datos: ${process.env.DB_NAME || 'proyecto_swlibre'}`);
    console.log(`JWT configurado - Expiración: ${process.env.JWT_EXPIRES_IN || '24h'}`);
    console.log('═══════════════════════════════════════════');
});
