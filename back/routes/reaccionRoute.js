const express = require('express');
const router = express.Router();

const {
    darLike,
    quitarLike
} = require('../controller/reaccionController');

router.post('/', darLike);
router.put('/', quitarLike);

module.exports = router;
