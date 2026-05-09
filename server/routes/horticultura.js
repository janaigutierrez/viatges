const express = require('express');
const router = express.Router();
const {
    getEntrades,
    getEntradaBySlug,
    createEntrada,
    updateEntrada,
    addImatgesGaleria,
    deleteImatgeGaleria,
    deleteEntrada
} = require('../controllers/entradaHorticulturaController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getEntrades);
router.get('/:slug', getEntradaBySlug);
router.post('/', auth, upload.single('imatgePortada'), createEntrada);
router.put('/:id', auth, upload.single('imatgePortada'), updateEntrada);
router.post('/:id/galeria', auth, upload.array('imatges', 10), addImatgesGaleria);
router.delete('/:id/galeria', auth, deleteImatgeGaleria);
router.delete('/:id', auth, deleteEntrada);

module.exports = router;
