const express = require('express');
const router = express.Router();

const { 
    obtenerTrabajadorPorId 
} = require('../controllers/trabajadorController');

router.get('/:id',obtenerTrabajadorPorId)

module.exports = router;
