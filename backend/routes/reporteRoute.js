const express = require('express');
const requireSession = require('../middleware/requireSession');


const router = express.Router();

const {
  upload,
  crearReporte,
  actualizarReporte,
  obtenerReportePorId,
  obtenerReportesPorIdEstado,
  obtenerReportesPorCantidadReacciones,
  obtenerReportesPendientesPorIdEstudiante,
  revisarReporte
} = require('../controllers/reporteController');

// RUTAS PROTEGIDAS
router.post('/', requireSession, upload.single('foto'), crearReporte);
router.get('/pendientes/estudiante/:id', requireSession, obtenerReportesPendientesPorIdEstudiante);
router.put('/revisar/:id', requireSession ,revisarReporte);

// RUTAS PÚBLICAS
router.put('/:id',actualizarReporte);
router.get('/estado/:id', obtenerReportesPorIdEstado);
router.get('/top/reacciones', obtenerReportesPorCantidadReacciones);
router.get('/:id', obtenerReportePorId);

//Para reporte


module.exports = router;
