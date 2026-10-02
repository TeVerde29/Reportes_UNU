// ============================================================
// RUTAS DE REPORTES
// Guía: lo que CREA o CAMBIA pide sesión. Lo que solo MIRA queda público
// para que la página de inicio cargue sin loguearse.
//  - Crear reporte: solo Estudiante (rol 3)
//  - Revisar (aceptar/rechazar): solo personal (roles 1 y 2)
//  - Editar su reporte: solo Estudiante con sesión
// ============================================================
const express = require('express');
const requireSession = require('../middleware/requireSession');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

const {
  upload,
  crearReporte,
  actualizarReporte,
  obtenerReportePorId,
  obtenerReportesPorIdEstado,
  obtenerReportesPorCantidadReacciones,
  obtenerReportesPendientesPorIdEstudiante,
  obtenerReportesPorIdEstudiante,
  revisarReporte,
  obtenerReportesPorTipoProblema,
  obtenerReportesPorUbicacion,
  obtenerReportesPorTipoYUbicacion,
  obtenerReportesPorMes
} = require('../controllers/reporteController');

// RUTAS QUE ESCRIBEN (protegidas)
router.post('/', requireSession, requireRole([3]), upload.single('foto'), crearReporte);
router.get('/pendientes/estudiante/:id', requireSession, obtenerReportesPendientesPorIdEstudiante);
router.get('/mis-reportes/:id', requireSession, obtenerReportesPorIdEstudiante);
router.put('/revisar/:id', requireSession, requireRole([1, 2]), revisarReporte);
// Editar: antes estaba público (hueco). Ahora pide sesión de estudiante.
router.put('/:id', requireSession, requireRole([3]), upload.single('foto'), actualizarReporte);

// RUTAS QUE SOLO MIRAN (públicas para el inicio y estadísticas)
router.get('/estado/:id', obtenerReportesPorIdEstado);
router.get('/top/reacciones', obtenerReportesPorCantidadReacciones);
router.get('/:id', obtenerReportePorId);

//Para estadistica (las mira el personal en el dashboard)
router.get('/estadisticas/tipo-problema', obtenerReportesPorTipoProblema);
router.get('/estadisticas/ubicacion', obtenerReportesPorUbicacion);
router.get('/estadisticas/tipo-problema-ubicacion', obtenerReportesPorTipoYUbicacion);
router.get('/estadisticas/por-mes', obtenerReportesPorMes);

module.exports = router;
