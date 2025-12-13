const express = require('express');
const router = express.Router();

const {
    obtenerEstados
} = require('../controller/estadoController');

router.get('/', obtenerEstados);

module.exports = router;
