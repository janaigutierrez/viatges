const express = require('express');
const router = express.Router();
const {
    getApartats,
    getApartatBySlug,
    createApartat,
    updateApartat,
    addImatgesGaleria,
    deleteImatgeGaleria,
    deleteApartat
} = require('../controllers/apartatController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getApartats);
router.get('/:regioSlug/:llocSlug/:puntSlug/:apartatSlug', getApartatBySlug);
router.post('/', auth, upload.single('imatgePortada'), createApartat);
router.put('/:id', auth, upload.single('imatgePortada'), updateApartat);
router.post('/:id/galeria', auth, upload.array('imatges', 10), addImatgesGaleria);
router.delete('/:id/galeria', auth, deleteImatgeGaleria);
router.delete('/:id', auth, deleteApartat);

module.exports = router;
