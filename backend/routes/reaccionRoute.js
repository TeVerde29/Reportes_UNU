const express = require('express');
const router = express.Router();

const {
    LikesActivosPorIdEstudiante,
    darLike,
    quitarLike
} = require('../controllers/reaccionController');

router.get('/:id', LikesActivosPorIdEstudiante);
router.post('/', darLike);
router.put('/', quitarLike);

module.exports = router;
