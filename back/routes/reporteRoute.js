const express = require('express');
const router = express.Router();

const {
  crearReporte,
  actualizarReporte,
  obtenerReportePorId,
  obtenerReportesPorIdEstado,
  obtenerReportesPorMayorReacciones,
  obtenerReportesPendientesPorIdEstudiante
} = require('../controller/reporteController');

router.post('/', crearReporte);
router.put('/:id', actualizarReporte);
router.get('/:id', obtenerReportePorId);
router.get('/estado/:id', obtenerReportesPorIdEstado);
router.get('/top/reacciones', obtenerReportesPorMayorReacciones);
router.get('/pendientes/estudiante/:id', obtenerReportesPendientesPorIdEstudiante);

module.exports = router;
