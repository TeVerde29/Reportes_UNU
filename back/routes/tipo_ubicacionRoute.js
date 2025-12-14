const express = require('express');
const router = express.Router();

const {
    obtenerTiposUbiacion
} = require('../controller/tipo_ubicacionController');

router.get('/', obtenerTiposUbiacion);

module.exports = router;
