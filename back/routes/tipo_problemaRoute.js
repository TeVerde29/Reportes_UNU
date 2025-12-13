const express = require('express');
const router = express.Router();

const {
    obtenerTiposProblema
} = require('../controller/tipo_problemaController');

router.get('/', obtenerTiposProblema);

module.exports = router;
