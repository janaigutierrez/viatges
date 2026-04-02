const Regio = require('../models/Regio');
const Lloc = require('../models/Lloc');
const fs = require('fs').promises;
const path = require('path');
const cloudinary = require('../config/cloudinary')

// Funció helper per extreure public_id de la URL de Cloudinary
const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${publicId}`;
};

// @desc    Obtenir totes les regions
// @route   GET /api/regions
// @access  Public
const getRegions = async (req, res, next) => {
    try {
        const regions = await Regio.find().sort({ ordre: 1 });
        res.json(regions);
    } catch (error) {
        next(error);
    }
};

// @desc    Obtenir una regió per slug
// @route   GET /api/regions/:slug
// @access  Public
const getRegioBySlug = async (req, res, next) => {
    try {
        const regio = await Regio.findOne({ slug: req.params.slug });

        if (!regio) {
            return res.status(404).json({
                error: 'Regió no trobada'
            });
        }

        res.json(regio);
    } catch (error) {
        next(error);
    }
};

// @desc    Crear nova regió
// @route   POST /api/regions
// @access  Private (Admin)
const createRegio = async (req, res, next) => {
    try {
        const { nom, slug, ordre } = req.body;

        if (!nom || !slug) {
            return res.status(400).json({
                error: 'Nom i slug són obligatoris'
            });
        }

        // Si hi ha imatge, obtenir la URL completa de Cloudinary
        const imatgePortada = req.file ? req.file.secure_url || req.file.path : null; // req.file.secure_url || req.file.path té la URL completa!

        const regio = await Regio.create({
            nom,
            slug,
            imatgePortada,
            ordre: ordre || 0
        });

        res.status(201).json(regio);
    } catch (error) {
        next(error);
    }
};

// @desc    Actualitzar regió
// @route   PUT /api/regions/:id
// @access  Private (Admin)
const updateRegio = async (req, res, next) => {
    try {
        const { nom, slug, ordre } = req.body;

        const regio = await Regio.findById(req.params.id);

        if (!regio) {
            if (req.file) {
                await cloudinary.uploader.destroy(getPublicIdFromUrl(req.file.secure_url || req.file.path)).catch(() => { });
            }
            return res.status(404).json({
                error: 'Regió no trobada'
            });
        }

        // Si hi ha nova imatge, eliminar l'anterior de Cloudinary
        if (req.file && regio.imatgePortada) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(regio.imatgePortada)).catch(() => { });
        }

        // Actualitzar camps
        regio.nom = nom || regio.nom;
        regio.slug = slug || regio.slug;
        regio.ordre = ordre !== undefined ? ordre : regio.ordre;

        if (req.file) {
            regio.imatgePortada = req.file.secure_url || req.file.path;
        }

        await regio.save();

        res.json(regio);
    } catch (error) {
        if (req.file) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(req.file.secure_url || req.file.path)).catch(() => { });
        }
        next(error);
    }
};

// @desc    Eliminar regió
// @route   DELETE /api/regions/:id
// @access  Private (Admin)
const deleteRegio = async (req, res, next) => {
    try {
        const regio = await Regio.findById(req.params.id);

        if (!regio) {
            return res.status(404).json({
                error: 'Regió no trobada'
            });
        }

        // Verificar si hi ha llocs associats
        const llocsCount = await Lloc.countDocuments({ regio: regio._id });

        if (llocsCount > 0) {
            return res.status(400).json({
                error: `No es pot eliminar la regió perquè té ${llocsCount} llocs associats. Elimina primer els llocs.`
            });
        }

        // Eliminar imatge de Cloudinary si existeix
        if (regio.imatgePortada) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(regio.imatgePortada)).catch(() => { });
        }

        await regio.deleteOne();

        res.json({
            message: 'Regió eliminada correctament'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRegions,
    getRegioBySlug,
    createRegio,
    updateRegio,
    deleteRegio
};