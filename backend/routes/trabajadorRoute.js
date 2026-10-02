// ============================================================
// RUTA DE TRABAJADOR (dato del personal)
// Guía: igual que estudiante, solo con sesión.
// ============================================================
const express = require('express');
const requireSession = require('../middleware/requireSession');
const router = express.Router();

const {
    obtenerTrabajadorPorId
} = require('../controllers/trabajadorController');

router.get('/:id', requireSession, obtenerTrabajadorPorId)

module.exports = router;
