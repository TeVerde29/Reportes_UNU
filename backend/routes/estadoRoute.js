// ============================================================
// CATÁLOGOS PÚBLICOS (estado / tipo / ubicación)
// Guía: son listas simples (ej: "Pendiente", "Pabellón 1").
// Se dejan públicas para que el formulario y el inicio carguen
// sin pedir sesión. No tienen datos personales, el riesgo es bajo.
// ============================================================
const express = require('express');
const router = express.Router();

const {
    obtenerEstados,
    obtenerEstadoPorNombre,
    obtenerEstadoPorID
} = require('../controllers/estadoController');

router.get('/', obtenerEstados);
router.get('/:nombre', obtenerEstadoPorNombre);
router.get('/Obtener/:id',obtenerEstadoPorID);

module.exports = router;
