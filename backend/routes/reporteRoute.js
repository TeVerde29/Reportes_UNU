const express = require('express');
const router = express.Router();

const {
  upload,
  crearReporte,
  actualizarReporte,
  obtenerReportePorId,
  obtenerReportesPorIdEstado,
  obtenerReportesPorCantidadReacciones,
  obtenerReportesPendientesPorIdEstudiante
} = require('../controllers/reporteController');

router.post('/', upload.single('foto'), crearReporte);
router.put('/:id', upload.single('foto'), actualizarReporte);
router.get('/estado/:id', obtenerReportesPorIdEstado);
router.get('/top/reacciones', obtenerReportesPorCantidadReacciones);
router.get('/pendientes/estudiante/:id', obtenerReportesPendientesPorIdEstudiante);
router.get('/:id', obtenerReportePorId);

module.exports = router;
