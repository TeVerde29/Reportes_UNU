const express = require('express');
const router = express.Router();

const {
    obtenerEstudiantePorId,
    obtenerEstudiantePorIdUsuario
} = require('../controller/estudianteController');

router.get('/:id', obtenerEstudiantePorId);
router.get('/usuario/:id', obtenerEstudiantePorIdUsuario);

module.exports = router;
