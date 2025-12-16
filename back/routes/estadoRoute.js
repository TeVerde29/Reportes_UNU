const express = require('express');
const router = express.Router();

const {
    obtenerEstados,
    obtenerEstadoPorNombre
} = require('../controller/estadoController');

router.get('/', obtenerEstados);
router.get('/:nombre', obtenerEstadoPorNombre);

module.exports = router;
