const Lloc = require('../models/Lloc');
const Regio = require('../models/Regio');
const fs = require('fs').promises;
const path = require('path');
const cloudinary = require('../config/cloudinary');

// Funció helper per extreure public_id de la URL de Cloudinary
const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${publicId}`;
};


// @desc    Obtenir tots els llocs (opcionalment filtrar per regió)
// @route   GET /api/llocs?regio=regioId
// @access  Public
const getLlocs = async (req, res, next) => {
    try {
        const { regio } = req.query;

        const filter = regio ? { regio } : {};

        const llocs = await Lloc.find(filter)
            .populate('regio', 'nom slug')
            .sort({ ordre: 1 });

        res.json(llocs);
    } catch (error) {
        next(error);
    }
};

// @desc    Obtenir un lloc per slug i regió
// @route   GET /api/llocs/:regioSlug/:llocSlug
// @access  Public
const getLlocBySlug = async (req, res, next) => {
    try {
        const { regioSlug, llocSlug } = req.params;

        // Primer buscar la regió
        const regio = await Regio.findOne({ slug: regioSlug });

        if (!regio) {
            return res.status(404).json({
                error: 'Regió no trobada'
            });
        }

        // Després buscar el lloc
        const lloc = await Lloc.findOne({
            slug: llocSlug,
            regio: regio._id
        }).populate('regio', 'nom slug');

        if (!lloc) {
            return res.status(404).json({
                error: 'Lloc no trobat'
            });
        }

        res.json(lloc);
    } catch (error) {
        next(error);
    }
};

// @desc    Crear nou lloc
// @route   POST /api/llocs
// @access  Private (Admin)
const createLloc = async (req, res, next) => {
    try {
        const { nom, slug, regio, descripcio, puntsInteres, ordre } = req.body;

        // Validar camps obligatoris
        if (!nom || !slug || !regio) {
            return res.status(400).json({
                error: 'Nom, slug i regió són obligatoris'
            });
        }

        // Verificar que la regió existeix
        const regioExists = await Regio.findById(regio);
        if (!regioExists) {
            if (req.file) {
                await fs.unlink(path.join('uploads', req.file.filename)).catch(() => { });
            }
            return res.status(404).json({
                error: 'Regió no trobada'
            });
        }

        // Si hi ha imatge, obtenir la ruta
        const imatgePortada = req.file ? req.file.path : null;

        // Parsear puntsInteres si ve com a string (des d'un FormData)
        let parsedPuntsInteres = [];
        if (puntsInteres) {
            parsedPuntsInteres = typeof puntsInteres === 'string'
                ? JSON.parse(puntsInteres)
                : puntsInteres;
        }

        const lloc = await Lloc.create({
            nom,
            slug,
            regio,
            imatgePortada,
            descripcio: descripcio || '',
            puntsInteres: parsedPuntsInteres,
            galeriaImatges: [],
            ordre: ordre || 0
        });

        // Populate abans de retornar
        await lloc.populate('regio', 'nom slug');

        res.status(201).json(lloc);
    } catch (error) {
        // Si hi ha error i s'ha pujat imatge, eliminar-la
        if (req.file) {
            await fs.unlink(path.join('uploads', req.file.filename)).catch(() => { });
        }
        next(error);
    }
};

// @desc    Actualitzar lloc
// @route   PUT /api/llocs/:id
// @access  Private (Admin)
const updateLloc = async (req, res, next) => {
    try {
        const { nom, slug, regio, descripcio, puntsInteres, ordre } = req.body;

        const lloc = await Lloc.findById(req.params.id);

        if (!lloc) {
            // Si s'ha pujat una nova imatge i no existeix el lloc, eliminar-la de Cloudinary
            if (req.file) {
                await cloudinary.uploader.destroy(getPublicIdFromUrl(req.file.path)).catch(() => { });
            }
            return res.status(404).json({
                error: 'Lloc no trobat'
            });
        }

        // Si canvia la regió, verificar que existeix
        if (regio && regio !== lloc.regio.toString()) {
            const regioExists = await Regio.findById(regio);
            if (!regioExists) {
                if (req.file) {
                    await cloudinary.uploader.destroy(getPublicIdFromUrl(req.file.path)).catch(() => { });
                }
                return res.status(404).json({
                    error: 'Regió no trobada'
                });
            }
        }

        // Si hi ha nova imatge de portada, eliminar l'anterior de Cloudinary
        if (req.file && lloc.imatgePortada) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(lloc.imatgePortada)).catch(() => { });
        }

        // Actualitzar camps
        lloc.nom = nom || lloc.nom;
        lloc.slug = slug || lloc.slug;
        lloc.regio = regio || lloc.regio;
        lloc.descripcio = descripcio !== undefined ? descripcio : lloc.descripcio;
        lloc.ordre = ordre !== undefined ? ordre : lloc.ordre;

        if (req.file) {
            lloc.imatgePortada = req.file.path;
        }

        // Actualitzar puntsInteres si ve
        if (puntsInteres) {
            lloc.puntsInteres = typeof puntsInteres === 'string'
                ? JSON.parse(puntsInteres)
                : puntsInteres;
        }

        await lloc.save();
        await lloc.populate('regio', 'nom slug');

        res.json(lloc);
    } catch (error) {
        // Si hi ha error i s'ha pujat nova imatge, eliminar-la de Cloudinary
        if (req.file) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(req.file.path)).catch(() => { });
        }
        next(error);
    }
};

// @desc    Afegir imatges a la galeria
// @route   POST /api/llocs/:id/galeria
// @access  Private (Admin)
const addImatgesGaleria = async (req, res, next) => {
    try {
        const lloc = await Lloc.findById(req.params.id);

        if (!lloc) {
            // Eliminar imatges pujades si no existeix el lloc
            if (req.files) {
                for (const file of req.files) {
                    await fs.unlink(path.join('uploads', file.filename)).catch(() => { });
                }
            }
            return res.status(404).json({
                error: 'Lloc no trobat'
            });
        }

        // Afegir les noves imatges a la galeria
        if (req.files && req.files.length > 0) {
            const novaImatges = req.files.map(file => file.path);
            lloc.galeriaImatges.push(...novaImatges);
            await lloc.save();
        }

        res.json(lloc);
    } catch (error) {
        // Si hi ha error, eliminar imatges pujades
        if (req.files) {
            for (const file of req.files) {
                await fs.unlink(path.join('uploads', file.filename)).catch(() => { });
            }
        }
        next(error);
    }
};

// @desc    Eliminar imatge de la galeria
// @route   DELETE /api/llocs/:id/galeria
// @access  Private (Admin)
const deleteImatgeGaleria = async (req, res, next) => {
    try {
        const { imatgeUrl } = req.body;

        if (!imatgeUrl) {
            return res.status(400).json({
                error: 'URL de la imatge és obligatòria'
            });
        }

        const lloc = await Lloc.findById(req.params.id);

        if (!lloc) {
            return res.status(404).json({
                error: 'Lloc no trobat'
            });
        }

        // Eliminar imatge del array
        lloc.galeriaImatges = lloc.galeriaImatges.filter(img => img !== imatgeUrl);

        // Eliminar de Cloudinary
        await cloudinary.uploader.destroy(getPublicIdFromUrl(imatgeUrl)).catch(() => { });

        await lloc.save();

        res.json(lloc);
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar lloc
// @route   DELETE /api/llocs/:id
// @access  Private (Admin)
const deleteLloc = async (req, res, next) => {
    try {
        const lloc = await Lloc.findById(req.params.id);

        if (!lloc) {
            return res.status(404).json({
                error: 'Lloc no trobat'
            });
        }

        // Eliminar imatge de portada de Cloudinary si existeix
        if (lloc.imatgePortada) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(lloc.imatgePortada)).catch(() => { });
        }

        // Eliminar totes les imatges de la galeria de Cloudinary
        for (const imatgeUrl of lloc.galeriaImatges) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(imatgeUrl)).catch(() => { });
        }

        await lloc.deleteOne();

        res.json({
            message: 'Lloc eliminat correctament'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLlocs,
    getLlocBySlug,
    createLloc,
    updateLloc,
    addImatgesGaleria,
    deleteImatgeGaleria,
    deleteLloc
};