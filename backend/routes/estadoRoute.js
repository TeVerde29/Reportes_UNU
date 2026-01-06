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
