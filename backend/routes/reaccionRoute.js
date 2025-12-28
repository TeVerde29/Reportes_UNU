const express = require('express');
const router = express.Router();

const {
    listarLikesActivosPorEstudiante,
    darLike,
    quitarLike
} = require('../controllers/reaccionController');

router.get('/:id_estudiante', listarLikesActivosPorEstudiante);
router.post('/', darLike);
router.put('/', quitarLike);

module.exports = router;
