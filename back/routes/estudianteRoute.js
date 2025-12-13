const express = require('express');
const router = express.Router();

const {
    obtenerEstudiantePorId
} = require('../controller/estudianteController');

router.get('/:id', obtenerEstudiantePorId);

module.exports = router;
