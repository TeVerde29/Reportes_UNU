// ============================================================
// RUTAS DE REPORTES
// Guía: lo que CREA o CAMBIA pide sesión. Lo que solo MIRA queda público
// para que la página de inicio cargue sin loguearse.
//  - Crear/editar/mis reportes: solo alumno (sesión con codigo_estudiante,
//    el rol 3 solo vive en sesión, no hay `usuario` estudiante en BD)
//  - Revisar (aceptar/resolver) y eliminar (rechazo): solo personal (1 y 2)
//  - Editar su reporte: solo el dueño (lo revisa el controlador)
// ============================================================
const express = require('express');
const requireSession = require('../middleware/requireSession');
const requireRole = require('../middleware/requireRole');
const requireEstudiante = require('../middleware/requireEstudiante');

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
  eliminarReporte,
  obtenerReportesPorTipoProblema,
  obtenerReportesPorUbicacion,
  obtenerReportesPorTipoYUbicacion,
  obtenerReportesPorMes
} = require('../controllers/reporteController');

// RUTAS QUE ESCRIBEN (protegidas)
// OJO: /mis-reportes y /pendientes/estudiante van ANTES de /:id
// o Express las confunde con un id.
router.post('/', requireSession, requireEstudiante, upload.single('foto'), crearReporte);
router.get('/pendientes/estudiante', requireSession, requireEstudiante, obtenerReportesPendientesPorIdEstudiante);
router.get('/mis-reportes', requireSession, requireEstudiante, obtenerReportesPorIdEstudiante);
router.put('/revisar/:id', requireSession, requireRole([1, 2]), revisarReporte);
// Rechazo = borrado total (registro + foto), solo personal
router.delete('/:id', requireSession, requireRole([1, 2]), eliminarReporte);
// Editar: solo el dueño (sesión alumno, el controlador verifica)
router.put('/:id', requireSession, requireEstudiante, upload.single('foto'), actualizarReporte);

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
