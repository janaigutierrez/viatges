const Apartat = require('../models/Apartat');
const PuntInteres = require('../models/PuntInteres');
const Lloc = require('../models/Lloc');
const Regio = require('../models/Regio');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middleware/upload');

const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${publicId}`;
};

// @desc    Obtenir tots els apartats (filtrable per puntInteres)
// @route   GET /api/apartats?puntInteres=id
// @access  Public
const getApartats = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.puntInteres) filter.puntInteres = req.query.puntInteres;
        const apartats = await Apartat.find(filter)
            .populate('puntInteres', 'nom slug')
            .populate('lloc', 'nom slug')
            .populate('regio', 'nom slug')
            .sort({ ordre: 1, createdAt: -1 });
        res.json(apartats);
    } catch (error) {
        next(error);
    }
};

// @desc    Obtenir un apartat per slugs complets
// @route   GET /api/apartats/:regioSlug/:llocSlug/:puntSlug/:apartatSlug
// @access  Public
const getApartatBySlug = async (req, res, next) => {
    try {
        const { regioSlug, llocSlug, puntSlug, apartatSlug } = req.params;

        const regio = await Regio.findOne({ slug: regioSlug });
        if (!regio) return res.status(404).json({ error: 'Región no encontrada' });

        const lloc = await Lloc.findOne({ slug: llocSlug, regio: regio._id });
        if (!lloc) return res.status(404).json({ error: 'Lugar no encontrado' });

        const punt = await PuntInteres.findOne({ slug: puntSlug, lloc: lloc._id });
        if (!punt) return res.status(404).json({ error: 'Punto de interés no encontrado' });

        const apartat = await Apartat.findOne({ slug: apartatSlug, puntInteres: punt._id })
            .populate('puntInteres', 'nom slug')
            .populate('lloc', 'nom slug')
            .populate('regio', 'nom slug');

        if (!apartat) return res.status(404).json({ error: 'Apartado no encontrado' });

        res.json(apartat);
    } catch (error) {
        next(error);
    }
};

// @desc    Crear nou apartat
// @route   POST /api/apartats
// @access  Private (Admin)
const createApartat = async (req, res, next) => {
    try {
        const { nom, slug, puntInteres, descripcio, ordre } = req.body;

        if (!nom || !slug || !puntInteres) {
            return res.status(400).json({ error: 'Nombre, slug y punto de interés son obligatorios' });
        }

        const punt = await PuntInteres.findById(puntInteres);
        if (!punt) return res.status(404).json({ error: 'Punto de interés no encontrado' });

        const imatgePortada = req.file ? await uploadToCloudinary(req.file) : null;

        const apartat = await Apartat.create({
            nom,
            slug,
            puntInteres,
            lloc: punt.lloc,
            regio: punt.regio,
            descripcio: descripcio || '',
            imatgePortada,
            galeriaImatges: [],
            ordre: ordre || 0
        });

        await apartat.populate('puntInteres', 'nom slug');
        await apartat.populate('lloc', 'nom slug');
        await apartat.populate('regio', 'nom slug');

        res.status(201).json(apartat);
    } catch (error) {
        next(error);
    }
};

// @desc    Actualitzar apartat
// @route   PUT /api/apartats/:id
// @access  Private (Admin)
const updateApartat = async (req, res, next) => {
    try {
        const { nom, slug, descripcio, ordre } = req.body;

        const apartat = await Apartat.findById(req.params.id);
        if (!apartat) return res.status(404).json({ error: 'Apartado no encontrado' });

        if (req.file && apartat.imatgePortada) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(apartat.imatgePortada)).catch(() => {});
        }

        apartat.nom = nom || apartat.nom;
        apartat.slug = slug || apartat.slug;
        apartat.descripcio = descripcio !== undefined ? descripcio : apartat.descripcio;
        apartat.ordre = ordre !== undefined ? ordre : apartat.ordre;

        if (req.file) {
            apartat.imatgePortada = await uploadToCloudinary(req.file);
        }

        await apartat.save();
        await apartat.populate('puntInteres', 'nom slug');
        await apartat.populate('lloc', 'nom slug');
        await apartat.populate('regio', 'nom slug');

        res.json(apartat);
    } catch (error) {
        next(error);
    }
};

// @desc    Afegir imatges a la galeria
// @route   POST /api/apartats/:id/galeria
// @access  Private (Admin)
const addImatgesGaleria = async (req, res, next) => {
    try {
        const apartat = await Apartat.findById(req.params.id);
        if (!apartat) return res.status(404).json({ error: 'Apartado no encontrado' });

        if (req.files && req.files.length > 0) {
            const novaImatges = [];
            for (const file of req.files) {
                const url = await uploadToCloudinary(file);
                novaImatges.push(url);
            }
            apartat.galeriaImatges.push(...novaImatges);
            await apartat.save();
        }

        res.json(apartat);
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar imatge de la galeria
// @route   DELETE /api/apartats/:id/galeria
// @access  Private (Admin)
const deleteImatgeGaleria = async (req, res, next) => {
    try {
        const { imatgeUrl } = req.body;
        if (!imatgeUrl) return res.status(400).json({ error: 'URL de la imagen es obligatoria' });

        const apartat = await Apartat.findById(req.params.id);
        if (!apartat) return res.status(404).json({ error: 'Apartado no encontrado' });

        apartat.galeriaImatges = apartat.galeriaImatges.filter(img => img !== imatgeUrl);
        await cloudinary.uploader.destroy(getPublicIdFromUrl(imatgeUrl)).catch(() => {});
        await apartat.save();

        res.json(apartat);
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar apartat
// @route   DELETE /api/apartats/:id
// @access  Private (Admin)
const deleteApartat = async (req, res, next) => {
    try {
        const apartat = await Apartat.findById(req.params.id);
        if (!apartat) return res.status(404).json({ error: 'Apartado no encontrado' });

        if (apartat.imatgePortada) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(apartat.imatgePortada)).catch(() => {});
        }
        for (const url of apartat.galeriaImatges) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(url)).catch(() => {});
        }

        await apartat.deleteOne();
        res.json({ message: 'Apartado eliminado correctamente' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getApartats,
    getApartatBySlug,
    createApartat,
    updateApartat,
    addImatgesGaleria,
    deleteImatgeGaleria,
    deleteApartat
};
