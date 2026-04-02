const express = require('express');
const router = express.Router();
const {
    getPlantes,
    getPlantaById,
    createPlanta,
    updatePlanta,
    deletePlanta
} = require('../controllers/plantaController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/plantes
router.get('/', getPlantes);

// @route   GET /api/plantes/:id
router.get('/:id', getPlantaById);

// @route   POST /api/plantes
router.post('/', auth, upload.single('imatgePortada'), createPlanta);

// @route   PUT /api/plantes/:id
router.put('/:id', auth, upload.single('imatgePortada'), updatePlanta);

// @route   DELETE /api/plantes/:id
router.delete('/:id', auth, deletePlanta);

module.exports = router;
