const PuntInteres = require('../models/PuntInteres');
const Lloc = require('../models/Lloc');
const Regio = require('../models/Regio');
const cloudinary = require('../config/cloudinary');

const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${publicId}`;
};

// @desc    Obtenir tots els punts d'interès (opcionalment filtrar per lloc)
// @route   GET /api/punts?lloc=llocId
// @access  Public
const getPuntsInteres = async (req, res, next) => {
    try {
        const { lloc } = req.query;
        const filter = lloc ? { lloc } : {};

        const punts = await PuntInteres.find(filter)
            .populate('lloc', 'nom slug')
            .populate('regio', 'nom slug')
            .sort({ ordre: 1 });

        res.json(punts);
    } catch (error) {
        next(error);
    }
};

// @desc    Obtenir un punt d'interès per slug
// @route   GET /api/punts/:regioSlug/:llocSlug/:puntSlug
// @access  Public
const getPuntInteresBySlug = async (req, res, next) => {
    try {
        const { regioSlug, llocSlug, puntSlug } = req.params;

        const regio = await Regio.findOne({ slug: regioSlug });
        if (!regio) {
            return res.status(404).json({ error: 'Regió no trobada' });
        }

        const lloc = await Lloc.findOne({ slug: llocSlug, regio: regio._id });
        if (!lloc) {
            return res.status(404).json({ error: 'Lloc no trobat' });
        }

        const punt = await PuntInteres.findOne({ slug: puntSlug, lloc: lloc._id })
            .populate('lloc', 'nom slug')
            .populate('regio', 'nom slug');

        if (!punt) {
            return res.status(404).json({ error: 'Punt d\'interès no trobat' });
        }

        res.json(punt);
    } catch (error) {
        next(error);
    }
};

// @desc    Crear nou punt d'interès
// @route   POST /api/punts
// @access  Private (Admin)
const createPuntInteres = async (req, res, next) => {
    try {
        const { nom, slug, lloc, regio, descripcio, ordre } = req.body;

        if (!nom || !slug || !lloc || !regio) {
            return res.status(400).json({ error: 'Nom, slug, lloc i regió són obligatoris' });
        }

        const llocExists = await Lloc.findById(lloc);
        if (!llocExists) {
            if (req.file) await cloudinary.uploader.destroy(getPublicIdFromUrl(req.file.path)).catch(() => {});
            return res.status(404).json({ error: 'Lloc no trobat' });
        }

        const regioExists = await Regio.findById(regio);
        if (!regioExists) {
            if (req.file) await cloudinary.uploader.destroy(getPublicIdFromUrl(req.file.path)).catch(() => {});
            return res.status(404).json({ error: 'Regió no trobada' });
        }

        const imatgePortada = req.file ? req.file.path : null;

        const punt = await PuntInteres.create({
            nom,
            slug,
            lloc,
            regio,
            imatgePortada,
            descripcio: descripcio || '',
            galeriaImatges: [],
            ordre: ordre || 0
        });

        await punt.populate('lloc', 'nom slug');
        await punt.populate('regio', 'nom slug');

        res.status(201).json(punt);
    } catch (error) {
        if (req.file) await cloudinary.uploader.destroy(getPublicIdFromUrl(req.file.path)).catch(() => {});
        next(error);
    }
};

// @desc    Actualitzar punt d'interès
// @route   PUT /api/punts/:id
// @access  Private (Admin)
const updatePuntInteres = async (req, res, next) => {
    try {
        const { nom, slug, descripcio, ordre } = req.body;

        const punt = await PuntInteres.findById(req.params.id);
        if (!punt) {
            if (req.file) await cloudinary.uploader.destroy(getPublicIdFromUrl(req.file.path)).catch(() => {});
            return res.status(404).json({ error: 'Punt d\'interès no trobat' });
        }

        if (req.file && punt.imatgePortada) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(punt.imatgePortada)).catch(() => {});
        }

        punt.nom = nom || punt.nom;
        punt.slug = slug || punt.slug;
        punt.descripcio = descripcio !== undefined ? descripcio : punt.descripcio;
        punt.ordre = ordre !== undefined ? ordre : punt.ordre;

        if (req.file) {
            punt.imatgePortada = req.file.path;
        }

        await punt.save();
        await punt.populate('lloc', 'nom slug');
        await punt.populate('regio', 'nom slug');

        res.json(punt);
    } catch (error) {
        if (req.file) await cloudinary.uploader.destroy(getPublicIdFromUrl(req.file.path)).catch(() => {});
        next(error);
    }
};

// @desc    Afegir imatges a la galeria del punt
// @route   POST /api/punts/:id/galeria
// @access  Private (Admin)
const addImatgesGaleriaPunt = async (req, res, next) => {
    try {
        const punt = await PuntInteres.findById(req.params.id);
        if (!punt) {
            if (req.files) {
                for (const file of req.files) {
                    await cloudinary.uploader.destroy(getPublicIdFromUrl(file.path)).catch(() => {});
                }
            }
            return res.status(404).json({ error: 'Punt d\'interès no trobat' });
        }

        if (req.files && req.files.length > 0) {
            const novaImatges = req.files.map(file => file.path);
            punt.galeriaImatges.push(...novaImatges);
            await punt.save();
        }

        res.json(punt);
    } catch (error) {
        if (req.files) {
            for (const file of req.files) {
                await cloudinary.uploader.destroy(getPublicIdFromUrl(file.path)).catch(() => {});
            }
        }
        next(error);
    }
};

// @desc    Eliminar imatge de la galeria del punt
// @route   DELETE /api/punts/:id/galeria
// @access  Private (Admin)
const deleteImatgeGaleriaPunt = async (req, res, next) => {
    try {
        const { imatgeUrl } = req.body;
        if (!imatgeUrl) {
            return res.status(400).json({ error: 'URL de la imatge és obligatòria' });
        }

        const punt = await PuntInteres.findById(req.params.id);
        if (!punt) {
            return res.status(404).json({ error: 'Punt d\'interès no trobat' });
        }

        punt.galeriaImatges = punt.galeriaImatges.filter(img => img !== imatgeUrl);
        await cloudinary.uploader.destroy(getPublicIdFromUrl(imatgeUrl)).catch(() => {});
        await punt.save();

        res.json(punt);
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar punt d'interès
// @route   DELETE /api/punts/:id
// @access  Private (Admin)
const deletePuntInteres = async (req, res, next) => {
    try {
        const punt = await PuntInteres.findById(req.params.id);
        if (!punt) {
            return res.status(404).json({ error: 'Punt d\'interès no trobat' });
        }

        if (punt.imatgePortada) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(punt.imatgePortada)).catch(() => {});
        }

        for (const imatgeUrl of punt.galeriaImatges) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(imatgeUrl)).catch(() => {});
        }

        await punt.deleteOne();

        res.json({ message: 'Punt d\'interès eliminat correctament' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPuntsInteres,
    getPuntInteresBySlug,
    createPuntInteres,
    updatePuntInteres,
    addImatgesGaleriaPunt,
    deleteImatgeGaleriaPunt,
    deletePuntInteres
};
