const Familia = require('../models/Familia');
const Planta = require('../models/Planta');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middleware/upload');

const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${publicId}`;
};

// @desc    Obtenir totes les famílies (filtrable per etiqueta i ubicacio)
// @route   GET /api/families
// @access  Public
const getFamilies = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.etiqueta) filter.etiqueta = req.query.etiqueta;
        if (req.query.ubicacio) filter.ubicacio = req.query.ubicacio;
        const families = await Familia.find(filter).sort({ ordre: 1, createdAt: -1 });
        res.json(families);
    } catch (error) {
        next(error);
    }
};

// @desc    Obtenir una família per slug
// @route   GET /api/families/:slug
// @access  Public
const getFamiliaBySlug = async (req, res, next) => {
    try {
        const familia = await Familia.findOne({ slug: req.params.slug });
        if (!familia) {
            return res.status(404).json({ error: 'Familia no encontrada' });
        }
        res.json(familia);
    } catch (error) {
        next(error);
    }
};

// @desc    Crear nova família
// @route   POST /api/families
// @access  Private (Admin)
const createFamilia = async (req, res, next) => {
    try {
        const { nom, slug, etiqueta, ubicacio, descripcio, ordre } = req.body;

        if (!nom || !slug) {
            return res.status(400).json({ error: 'Nombre y slug son obligatorios' });
        }

        const imatgePortada = req.file ? await uploadToCloudinary(req.file) : null;

        const familia = await Familia.create({
            nom,
            slug,
            etiqueta: etiqueta || 'planta',
            ubicacio: ubicacio || null,
            descripcio: descripcio || '',
            imatgePortada,
            ordre: ordre || 0
        });

        res.status(201).json(familia);
    } catch (error) {
        next(error);
    }
};

// @desc    Actualitzar família
// @route   PUT /api/families/:id
// @access  Private (Admin)
const updateFamilia = async (req, res, next) => {
    try {
        const { nom, slug, etiqueta, ubicacio, descripcio, ordre } = req.body;

        const familia = await Familia.findById(req.params.id);
        if (!familia) {
            return res.status(404).json({ error: 'Familia no encontrada' });
        }

        if (req.file && familia.imatgePortada) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(familia.imatgePortada)).catch(() => {});
        }

        familia.nom = nom || familia.nom;
        familia.slug = slug || familia.slug;
        familia.etiqueta = etiqueta || familia.etiqueta;
        familia.ubicacio = ubicacio !== undefined ? (ubicacio || null) : familia.ubicacio;
        familia.descripcio = descripcio !== undefined ? descripcio : familia.descripcio;
        familia.ordre = ordre !== undefined ? ordre : familia.ordre;

        if (req.file) {
            familia.imatgePortada = await uploadToCloudinary(req.file);
        }

        await familia.save();
        res.json(familia);
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar família (només si no té plantes associades)
// @route   DELETE /api/families/:id
// @access  Private (Admin)
const deleteFamilia = async (req, res, next) => {
    try {
        const familia = await Familia.findById(req.params.id);
        if (!familia) {
            return res.status(404).json({ error: 'Familia no encontrada' });
        }

        const plantesCount = await Planta.countDocuments({ familia: familia._id });
        if (plantesCount > 0) {
            return res.status(400).json({
                error: `No se puede eliminar la familia porque tiene ${plantesCount} planta(s) asociada(s). Elimínalas primero.`
            });
        }

        if (familia.imatgePortada) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(familia.imatgePortada)).catch(() => {});
        }

        await familia.deleteOne();

        res.json({ message: 'Familia eliminada correctamente' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFamilies,
    getFamiliaBySlug,
    createFamilia,
    updateFamilia,
    deleteFamilia
};
