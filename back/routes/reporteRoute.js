const express = require('express');
const router = express.Router();

const {
  crearReporte,
  actualizarReporte,
  obtenerReportePorId,
  obtenerReportesPorIdEstado,
  obtenerReportesPorCantidadReacciones,
  obtenerReportesPendientesPorIdEstudiante
} = require('../controller/reporteController');

router.post('/', crearReporte);
router.put('/:id', actualizarReporte);
router.get('/estado/:id', obtenerReportesPorIdEstado);
router.get('/top/reacciones/', obtenerReportesPorCantidadReacciones);
router.get('/pendientes/estudiante/:id', obtenerReportesPendientesPorIdEstudiante);
router.get('/:id', obtenerReportePorId);

module.exports = router;
