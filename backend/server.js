require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const auth = require('./routes/authRoute');
const estado = require('./routes/estadoRoute');
const estudiante = require('./routes/estudianteRoute');
const reaccion = require('./routes/reaccionRoute');
const reporte = require('./routes/reporteRoute');
const tipoProblema = require('./routes/tipo_problemaRoute');
const trabajador = require('./routes/trabajadorRoute');
const ubicacion = require('./routes/ubicacionRoute');
const usuario = require('./routes/usuarioRoute');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    name: 'sid', // nombre de la cookie de sesión
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',  // para localhost funciona bien
        secure: false,    // true solo si usas https
        maxAge: 1000 * 60 * 60 * 8 // 8 horas
    }
}));

app.use('/uploads/reportes', express.static(path.join('C:', 'Reportes_UNU_IMG', 'uploads', 'reportes')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.json({
        mensaje: "API SISTEMA DE REPORTE DE INCIDENCIAS - Backend",
        version: "1.0.0",
        endpoints: { // Falta poner las rutas usadas en cada controlador
            estado: {
                // obtenerEstados                           -> 
                // obtenerEstadoPorNombre                   -> USADO
            },
            estudiante: {
                // obtenerEstudiantePorId                   ->  
            },
            reaccion: {
                // LikesActivosPorIdEstudiante              -> USADO
                // darLike                                  -> USADO
                // quitarLike                               -> USADO
            },
            reporte: {
                // rearReporte                              -> USADO
                // actualizarReporte                        -> USADO
                // obtenerReportePorId                      -> USADO
                // obtenerReportesPorIdEstado               -> USADO
                // obtenerReportesPorCantidadReacciones     -> USADO
                // obtenerReportesPendientesPorIdEstudiante -> USADO
            },
            tipoProblema: {
                // obtenerTiposProblema                     -> USADO
            },
            trabajador: {
            },
            ubicacion: {
                // obtenerUbicaciones                       -> USADO
                // obtenerUbicacionesPorId                  -> 
            },
            usuario: {
            }
        },
        autenticacion: {
            tipo: "Sesión con Cookies",
            cookie_name: "sid",
            notas: "El servidor mantiene la sesión; el navegador envía la cookie automáticamente."
        },
        sesion_actual: {
            autenticado: !!req.session.auth,
            auth: req.session.auth || null
        }
    });
});

app.use('/api/auth', auth);
app.use('/api/estado', estado);
app.use('/api/estudiante', estudiante);
app.use('/api/reaccion', reaccion);
app.use('/api/reporte', reporte);
app.use('/api/tipoProblema', tipoProblema);
app.use('/api/trabajador', trabajador);
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
    console.log('Servidor con AUTENTICACIÓN POR SESIÓN iniciado');
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Base de datos: ${process.env.DB_NAME || 'reporte_incidencias'}`);
    console.log(`FRONTEND_ORIGIN: ${process.env.FRONTEND_ORIGIN || 'http://localhost:4200'}`);
    console.log('COOKIE: sid (httpOnly, sameSite=lax, secure=false)');
    console.log('═══════════════════════════════════════════');
});
