const SeccioInfo = require('../models/SeccioInfo');

// @desc    Obtenir info d'una secció pel slug (crea automàticament si no existeix)
// @route   GET /api/seccions/:slug
// @access  Public
const getSeccioInfo = async (req, res, next) => {
    try {
        const { slug } = req.params;
        let seccio = await SeccioInfo.findOne({ slug });

        if (!seccio) {
            seccio = await SeccioInfo.create({ slug, descripcio: '' });
        }

        res.json(seccio);
    } catch (error) {
        next(error);
    }
};

// @desc    Actualitzar descripció d'una secció (upsert pel slug)
// @route   PUT /api/seccions/:slug
// @access  Private (Admin)
const updateSeccioInfo = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { descripcio } = req.body;

        const seccio = await SeccioInfo.findOneAndUpdate(
            { slug },
            { descripcio: descripcio ?? '' },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json(seccio);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSeccioInfo,
    updateSeccioInfo,
};
