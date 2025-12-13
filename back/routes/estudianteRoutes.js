const express = require('express');
const router = express.Router();

const {
    obtenerEstudiante
} = require('../controller/estudianteController');

router.get('/:id', obtenerEstudiante);

module.exports = router;
