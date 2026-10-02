// ============================================================
// RUTAS DE SESIÓN (entrar / quién soy / salir)
// Guía:
//  - POST /login  -> revisa código+clave y crea la sesión (cookie sid)
//  - GET  /me     -> dice quién está logueado (lo usa el front)
//  - POST /logout -> borra la sesión y la cookie
// El freno anti-fuerza bruta de login está en server.js.
// ============================================================
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/me', authController.me);
router.post('/logout', authController.logout);

module.exports = router;
