const express = require('express');
const router = express.Router();
const {
    getPuntsInteres,
    getPuntInteresBySlug,
    createPuntInteres,
    updatePuntInteres,
    addImatgesGaleriaPunt,
    deleteImatgeGaleriaPunt,
    deletePuntInteres
} = require('../controllers/puntInteresController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/punts (opcional: ?lloc=llocId)
router.get('/', getPuntsInteres);

// @route   GET /api/punts/:regioSlug/:llocSlug/:puntSlug
router.get('/:regioSlug/:llocSlug/:puntSlug', getPuntInteresBySlug);

// @route   POST /api/punts
router.post('/', auth, upload.single('imatgePortada'), createPuntInteres);

// @route   PUT /api/punts/:id
router.put('/:id', auth, upload.single('imatgePortada'), updatePuntInteres);

// @route   POST /api/punts/:id/galeria
router.post('/:id/galeria', auth, upload.array('imatges', 20), addImatgesGaleriaPunt);

// @route   DELETE /api/punts/:id/galeria
router.delete('/:id/galeria', auth, deleteImatgeGaleriaPunt);

// @route   DELETE /api/punts/:id
router.delete('/:id', auth, deletePuntInteres);

module.exports = router;
