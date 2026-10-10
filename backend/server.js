// ============================================================
// SERVIDOR - Reportes UNU
// Guía simple: este archivo enciende la API y pone la seguridad.
// Orden: 1) casco (helmet) 2) permiso front (cors) 3) sesión (cookie sid)
// ============================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

// Casco: pone cabeceras que frenan ataques comunes (XSS, clickjacking, etc.)
const helmet = require('helmet');
// Freno: limita cuántas veces piden login para evitar adivinar claves
const rateLimit = require('express-rate-limit');
// Cajón de sesiones: guarda la sesión en MySQL (tabla `sessions`), no en la memoria
const MySQLStore = require('express-mysql-session')(session);

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

// Si despliegas detrás de Nginx/Render/Railway, esto deja que la cookie segura funcione
app.set('trust proxy', 1);

// 1) Casco de seguridad (cabeceras)
// OJO imágenes: cross-origin para que el front (4200) pueda mostrar
// las fotos que sirve el back (3000/uploads). Sin esto el navegador
// las bloquea con ERR_BLOCKED_BY_RESPONSE.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2) Permiso: solo tu front puede pedir con cookie
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200',
    credentials: true // deja pasar la cookie `sid`
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Cajón de sesiones en MySQL (usa la tabla `sessions` que ya creaste con el .sql)
// Si la tabla no existe y pones createDatabaseTable:true, él la crea solo.
// OJO Render/TiDB: express-mysql-session@3 filtra sus opciones (solo deja pasar
// host/port/user/... a mysql2) y ELIMINA `ssl`. Sin SSL TiDB rechaza la conexión
// y login/me con sesión daban 500. Por eso se le pasa un pool propio YA con SSL
// como conexión existente (uso documentado: new MySQLStore(options, connection)).
const mysql = require('mysql2'); // API callback, la que el store espera
const sessionPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'reporte_incidencias',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {})
});
const sessionStore = new MySQLStore({
    createDatabaseTable: true, // crea `sessions` si falta
    clearExpired: true, // borra sesiones vencidas solo
    checkExpirationInterval: 900000 // revisa cada 15 min
}, sessionPool);
// Log de errores del store: sin esto el fallo de sesión llega como HTML 500
// y el front muestra "<!DOCTYPE ... is not valid JSON".
sessionStore.on('error', (err) => {
    console.error('[sessionStore]', err && err.message ? err.message : err);
});

app.use(session({
    name: 'sid', // nombre de la cookie de sesión
    store: sessionStore, // aquí se guarda (MySQL), no en la memoria
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false, // no guarda si no cambió nada
    saveUninitialized: false, // no crea sesión vacía
    cookie: {
        httpOnly: true, // el JS no la puede leer (frena robo por XSS)
        // En despliegue front y back están en dominios distintos:
        // COOKIE_SAMESITE=none + COOKIE_SECURE=true (solo https)
        sameSite: process.env.COOKIE_SAMESITE === 'none' ? 'none' : 'lax',
        secure: process.env.COOKIE_SECURE === 'true', // true solo con https en despliegue
        maxAge: 1000 * 60 * 60 * 8 // 8 horas de sesión
    }
}));

// 4) Freno anti-fuerza bruta: solo para adivinar claves en /api/auth/login
const loginFreno = rateLimit({
    windowMs: 15 * 60 * 1000, // ventana de 15 minutos
    max: 30, // 30 intentos por IP (suficiente para 7000 alumnos, frena robots)
    message: { success: false, message: 'Demasiados intentos, espera 15 minutos' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/auth/login', loginFreno);

// 4b) Freno por cuenta: mismo login, pero la llave es el `codigo`.
// Sin esto, un atacante rota IPs y el freno de arriba nunca salta.
// Va DESPUÉS de express.json() para poder leer req.body.codigo.
const loginFrenoPorCuenta = rateLimit({
    windowMs: 15 * 60 * 1000, // ventana de 15 minutos
    max: 20, // 20 intentos por cuenta (el bloqueo real lo pone bloqueo_login con 10 fallos)
    keyGenerator: (req) => (req.body && req.body.codigo) || req.ip,
    message: { success: false, message: 'Demasiados intentos, espera 15 minutos' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/auth/login', loginFrenoPorCuenta);

// 4c) Freno para verificarUsuario (oráculo de claves del personal sin límite)
const verificarFreno = rateLimit({
    windowMs: 15 * 60 * 1000, // ventana de 15 minutos
    max: 30, // 30 intentos por IP
    message: { success: false, message: 'Demasiados intentos, espera 15 minutos' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/usuario', verificarFreno);

// Tablas auxiliares de seguridad (bloqueo_login): se crea sola si falta
const { initSeguridad } = require('./config/seguridad');
initSeguridad();

// 4.1) Job diario: borra pendientes con más de 7 días (fila + foto)
// Sin librerías: calcula cuánto falta para las 03:00 y repite cada 24h.
const { limpiarPendientesAntiguos } = require('./jobs/limpiarPendientes');
function programarLimpiezaPendientes() {
    const ejecutar = async () => {
        try {
            const r = await limpiarPendientesAntiguos();
            if (r.reportes > 0) console.log(`[job pendientes] eliminados: ${r.reportes} reportes, ${r.fotos} fotos`);
        } catch (e) {
            console.error('[job pendientes]', e.message);
        }
    };
    const ahora = new Date();
    const proxima = new Date(ahora);
    proxima.setHours(3, 0, 0, 0);
    if (proxima <= ahora) proxima.setDate(proxima.getDate() + 1);
    setTimeout(() => { ejecutar(); setInterval(ejecutar, 24 * 60 * 60 * 1000); }, proxima - ahora);
}
programarLimpiezaPendientes();

const REPORTES_IMG_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'Reportes_UNU_IMG', 'uploads', 'reportes');
app.use('/uploads/reportes', express.static(REPORTES_IMG_DIR));
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

// 5) Errores de subida: multer tira HTML por defecto, el front espera JSON
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err && (err.code === 'LIMIT_FILE_SIZE' || (err.message && err.message.includes('Solo se permiten imágenes')) || err.message === 'Tipo de archivo no permitido')) {
        return res.status(400).json({
            success: false,
            message: err.code === 'LIMIT_FILE_SIZE' ? 'Foto de máximo 5MB' : err.message
        });
    }
    next(err);
});

// 6) Fallo final en JSON: sin esto Express devuelve HTML en errores del
// middleware de sesión (GET /api/auth/me y POST /api/auth/login daban 500
// con <!DOCTYPE, imposible de leer desde Angular).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('[unhandled]', err && err.message ? err.message : err);
    if (res.headersSent) return next(err);
    res.status(err && err.status ? err.status : 500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════');
    console.log('Servidor con AUTENTICACIÓN POR SESIÓN iniciado');
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Base de datos: ${process.env.DB_NAME || 'reporte_incidencias'}`);
    console.log(`FRONTEND_ORIGIN: ${process.env.FRONTEND_ORIGIN || 'http://localhost:4200'}`);
    console.log(`IMAGENES: ${REPORTES_IMG_DIR}`);
    console.log('COOKIE: sid (httpOnly, sameSite=lax, secure=false)');
    console.log('SESIONES: tabla `sessions` en MySQL');
    console.log('═══════════════════════════════════════════');
});
