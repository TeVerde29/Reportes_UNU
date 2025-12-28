const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// LOGIN por sesión
router.post('/login', authController.login);

// Saber si hay sesión activa
router.get('/me', authController.me);

// Cerrar sesión
router.post('/logout', authController.logout);

module.exports = router;
