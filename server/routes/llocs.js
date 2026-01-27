// routes/llocs.js
const express = require('express');
const router = express.Router();
const {
    getLlocs,
    getLlocBySlug,
    createLloc,
    updateLloc,
    addImatgesGaleria,
    deleteImatgeGaleria,
    deleteLloc
} = require('../controllers/llocController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/llocs (opcional: ?regio=regioId)
router.get('/', getLlocs);

// @route   GET /api/llocs/:regioSlug/:llocSlug
router.get('/:regioSlug/:llocSlug', getLlocBySlug);

// @route   POST /api/llocs
router.post('/', auth, upload.single('imatgePortada'), createLloc);

// @route   PUT /api/llocs/:id
router.put('/:id', auth, upload.single('imatgePortada'), updateLloc);

// @route   POST /api/llocs/:id/galeria (múltiples imatges)
router.post('/:id/galeria', auth, upload.array('imatges', 10), addImatgesGaleria);

// @route   DELETE /api/llocs/:id/galeria (eliminar una imatge)
router.delete('/:id/galeria', auth, deleteImatgeGaleria);

// @route   DELETE /api/llocs/:id
router.delete('/:id', auth, deleteLloc);

module.exports = router;