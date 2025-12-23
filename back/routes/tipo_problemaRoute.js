const express = require('express');
const router = express.Router();

const {
    obtenerTiposProblema
} = require('../controllers/tipo_problemaController');

router.get('/', obtenerTiposProblema);

module.exports = router;
