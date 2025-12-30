const express = require('express');
const router = express.Router();

const {
    likesActivosPorIdEstudiante,
    darLike,
    quitarLike
} = require('../controllers/reaccionController');

router.get('/:id', likesActivosPorIdEstudiante);
router.post('/', darLike);
router.put('/', quitarLike);

module.exports = router;
