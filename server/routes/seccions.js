const express = require('express');
const router = express.Router();
const { getSeccioInfo, updateSeccioInfo } = require('../controllers/seccioInfoController');
const auth = require('../middleware/auth');

router.get('/:slug', getSeccioInfo);
router.put('/:slug', auth, updateSeccioInfo);

module.exports = router;
