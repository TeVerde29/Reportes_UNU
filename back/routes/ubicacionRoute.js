const express = require('express');
const router = express.Router();

const {
    obtenerUbicacionesPorId
} = require('../controller/ubicacionController');

router.get('/:id', obtenerUbicacionesPorId);

module.exports = router;
