const express = require('express');
const router = express.Router();
const {
    getFamilies,
    getFamiliaBySlug,
    createFamilia,
    updateFamilia,
    deleteFamilia
} = require('../controllers/familiaController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getFamilies);
router.get('/:slug', getFamiliaBySlug);
router.post('/', auth, upload.single('imatgePortada'), createFamilia);
router.put('/:id', auth, upload.single('imatgePortada'), updateFamilia);
router.delete('/:id', auth, deleteFamilia);

module.exports = router;
