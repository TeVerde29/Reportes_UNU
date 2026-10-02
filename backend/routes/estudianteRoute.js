// ============================================================
// RUTA DE ESTUDIANTE (dato personal)
// Guía: el perfil del alumno solo se ve con sesión.
// El front la llama después del login para mostrar el nombre.
// ============================================================
const express = require('express');
const requireSession = require('../middleware/requireSession');
const router = express.Router();

const {
    obtenerEstudiantePorId,
    //obtenerEstudiantePorIdUsuario
} = require('../controllers/estudianteController');

router.get('/:id', requireSession, obtenerEstudiantePorId);
//router.get('/usuario/:id', obtenerEstudiantePorIdUsuario);

module.exports = router;
