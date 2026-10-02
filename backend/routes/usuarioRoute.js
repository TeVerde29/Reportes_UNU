// ============================================================
// RUTA DE USUARIO (verificar código)
// Guía: se usa para comprobar si un código ya existe.
// La dejamos con sesión para que no la prueben robots sin login.
// ============================================================
const express = require('express');
const requireSession = require('../middleware/requireSession');
const router = express.Router();

const {
    verificarUsuario
} = require('../controllers/usuarioController');

router.post('/', requireSession, verificarUsuario);

module.exports = router;
