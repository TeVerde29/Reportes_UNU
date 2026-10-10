// ============================================================
// RUTA DE USUARIO (verificar código)
// Guía: solo personal (roles 1 y 2): probar claves del personal no es
// algo que un alumno deba poder hacer. Además lleva freno anti-fuerza
// bruta en server.js (verificarFreno).
// ============================================================
const express = require('express');
const requireSession = require('../middleware/requireSession');
const requireRole = require('../middleware/requireRole');
const router = express.Router();

const {
    verificarUsuario
} = require('../controllers/usuarioController');

router.post('/', requireSession, requireRole([1, 2]), verificarUsuario);

module.exports = router;
