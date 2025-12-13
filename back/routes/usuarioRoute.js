const express = require('express');
const router = express.Router();

const {
    VerificarUsuario
} = require('../controller/usuarioController');

router.post('/', VerificarUsuario);

module.exports = router;
