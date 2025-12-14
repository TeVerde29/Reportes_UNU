const express = require('express');
const router = express.Router();

const {
    verificarUsuario
} = require('../controller/usuarioController');

router.post('/', verificarUsuario);

module.exports = router;
