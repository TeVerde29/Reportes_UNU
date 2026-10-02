// ============================================================
// RUTAS DE REACCIONES (likes)
// Guía: dar o quitar like cambia datos, así que pide sesión
// de estudiante (rol 3). Ver likes también pide sesión.
// ============================================================
const express = require('express');
const requireSession = require('../middleware/requireSession');
const requireRole = require('../middleware/requireRole');
const router = express.Router();

const {
    likesActivosPorIdEstudiante,
    darLike,
    quitarLike
} = require('../controllers/reaccionController');

router.get('/:id', requireSession, likesActivosPorIdEstudiante);
router.post('/', requireSession, requireRole([3]), darLike);
router.put('/', requireSession, requireRole([3]), quitarLike);

module.exports = router;
