const express = require('express');
const requireSession = require('../middlewares/requireSession');

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

// 🔐 RUTAS PROTEGIDAS
router.post('/', requireSession, upload.single('foto'), crearReporte);
router.put('/:id', requireSession, upload.single('foto'), actualizarReporte);
router.get('/pendientes/estudiante/:id', requireSession, obtenerReportesPendientesPorIdEstudiante);

// 🌐 RUTAS PÚBLICAS
router.get('/estado/:id', obtenerReportesPorIdEstado);
router.get('/top/reacciones/', obtenerReportesPorCantidadReacciones);
router.get('/:id', obtenerReportePorId);

module.exports = router;
