const express = require('express');
const router = express.Router();

const {
    verificarUsuario
} = require('../controllers/usuarioController');

router.post('/', verificarUsuario);

module.exports = router;
