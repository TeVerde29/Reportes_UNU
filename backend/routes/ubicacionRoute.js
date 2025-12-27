const express = require('express');
const router = express.Router();

const {
    obtenerUbicaciones,
    obtenerUbicacionesPorId
} = require('../controllers/ubicacionController');

router.get('/',obtenerUbicaciones);
router.get('/:id', obtenerUbicacionesPorId);

module.exports = router;
