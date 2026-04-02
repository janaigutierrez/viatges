const Planta = require('../models/Planta');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middleware/upload');

// Funció helper per extreure public_id de la URL de Cloudinary
const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${publicId}`;
};

// @desc    Obtenir totes les plantes (amb filtre opcional per etiqueta)
// @route   GET /api/plantes
// @access  Public
const getPlantes = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.etiqueta) {
            filter.etiqueta = req.query.etiqueta;
        }
        const plantes = await Planta.find(filter).sort({ ordre: 1, createdAt: -1 });
        res.json(plantes);
    } catch (error) {
        next(error);
    }
};

// @desc    Obtenir una planta per id
// @route   GET /api/plantes/:id
// @access  Public
const getPlantaById = async (req, res, next) => {
    try {
        const planta = await Planta.findById(req.params.id);

        if (!planta) {
            return res.status(404).json({
                error: 'Planta no trobada'
            });
        }

        res.json(planta);
    } catch (error) {
        next(error);
    }
};

// @desc    Crear nova planta
// @route   POST /api/plantes
// @access  Private (Admin)
const createPlanta = async (req, res, next) => {
    try {
        const { nom, nomLlati, descripcio, etiqueta, ordre } = req.body;

        if (!nom) {
            return res.status(400).json({
                error: 'El nom és obligatori'
            });
        }

        const imatgePortada = req.file ? await uploadToCloudinary(req.file) : null;

        const planta = await Planta.create({
            nom,
            nomLlati: nomLlati || '',
            descripcio: descripcio || '',
            etiqueta: etiqueta || 'plantes',
            imatgePortada,
            ordre: ordre || 0
        });

        res.status(201).json(planta);
    } catch (error) {
        next(error);
    }
};

// @desc    Actualitzar planta
// @route   PUT /api/plantes/:id
// @access  Private (Admin)
const updatePlanta = async (req, res, next) => {
    try {
        const { nom, nomLlati, descripcio, etiqueta, ordre } = req.body;

        const planta = await Planta.findById(req.params.id);

        if (!planta) {
            return res.status(404).json({
                error: 'Planta no trobada'
            });
        }

        // Si hi ha nova imatge, eliminar l'anterior de Cloudinary
        if (req.file && planta.imatgePortada) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(planta.imatgePortada)).catch(() => {});
        }

        planta.nom = nom || planta.nom;
        planta.nomLlati = nomLlati !== undefined ? nomLlati : planta.nomLlati;
        planta.descripcio = descripcio !== undefined ? descripcio : planta.descripcio;
        planta.etiqueta = etiqueta || planta.etiqueta;
        planta.ordre = ordre !== undefined ? ordre : planta.ordre;

        if (req.file) {
            planta.imatgePortada = await uploadToCloudinary(req.file);
        }

        await planta.save();

        res.json(planta);
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar planta
// @route   DELETE /api/plantes/:id
// @access  Private (Admin)
const deletePlanta = async (req, res, next) => {
    try {
        const planta = await Planta.findById(req.params.id);

        if (!planta) {
            return res.status(404).json({
                error: 'Planta no trobada'
            });
        }

        // Eliminar imatge de Cloudinary si existeix
        if (planta.imatgePortada) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(planta.imatgePortada)).catch(() => {});
        }

        await planta.deleteOne();

        res.json({
            message: 'Planta eliminada correctament'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPlantes,
    getPlantaById,
    createPlanta,
    updatePlanta,
    deletePlanta
};
