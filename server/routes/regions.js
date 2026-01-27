// routes/regions.js
const express = require('express');
const router = express.Router();
const {
    getRegions,
    getRegioBySlug,
    createRegio,
    updateRegio,
    deleteRegio
} = require('../controllers/regioController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/regions
router.get('/', getRegions);

// @route   GET /api/regions/:slug
router.get('/:slug', getRegioBySlug);

// @route   POST /api/regions
router.post('/', auth, upload.single('imatgePortada'), createRegio);

// @route   PUT /api/regions/:id
router.put('/:id', auth, upload.single('imatgePortada'), updateRegio);

// @route   DELETE /api/regions/:id
router.delete('/:id', auth, deleteRegio);

module.exports = router;