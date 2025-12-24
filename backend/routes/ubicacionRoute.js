const express = require('express');
const router = express.Router();

const {
    obtenerUbicacionesPorId
} = require('../controllers/ubicacionController');

router.get('/:id', obtenerUbicacionesPorId);

module.exports = router;
