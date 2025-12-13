const express = require('express');
const router = express.Router();

const {
    obtenerUbicacionesPorId
} = require('../controller/tipo_ubicacionController');

router.get('/:id', obtenerUbicacionesPorId);

module.exports = router;
