// ============================================================
// RUTAS DE REACCIONES (likes)
// Guía: dar o quitar like cambia datos, así que pide sesión
// de alumno (codigo_estudiante en sesión, nunca del body).
// Ver likes también pide sesión.
// ============================================================
const express = require('express');
const requireSession = require('../middleware/requireSession');
const requireEstudiante = require('../middleware/requireEstudiante');
const router = express.Router();

const {
    likesActivosPorIdEstudiante,
    darLike,
    quitarLike
} = require('../controllers/reaccionController');

router.get('/activos/mios', requireSession, requireEstudiante, likesActivosPorIdEstudiante);
router.post('/', requireSession, requireEstudiante, darLike);
router.put('/', requireSession, requireEstudiante, quitarLike);

module.exports = router;
