const Regio = require('../models/Regio');
const Lloc = require('../models/Lloc');
const fs = require('fs').promises;
const path = require('path');
const cloudinary = require('../config/cloudinary')

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
        const imatgePortada = req.file ? req.file.path : null; // req.file.path té la URL completa!

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
            return res.status(404).json({
                error: 'Regió no trobada'
            });
        }

        // Si hi ha nova imatge, eliminar l'anterior de Cloudinary
        if (req.file && regio.imatgePortada) {
            // Extreure public_id de la URL antiga
            const urlParts = regio.imatgePortada.split('/');
            const publicIdWithExt = urlParts[urlParts.length - 1];
            const publicId = publicIdWithExt.split('.')[0];
            const folder = urlParts[urlParts.length - 2];

            await cloudinary.uploader.destroy(`${folder}/${publicId}`).catch(() => { });
        }

        // Actualitzar camps
        regio.nom = nom || regio.nom;
        regio.slug = slug || regio.slug;
        regio.ordre = ordre !== undefined ? ordre : regio.ordre;

        if (req.file) {
            regio.imatgePortada = req.file.path; // URL completa de Cloudinary
        }

        await regio.save();

        res.json(regio);
    } catch (error) {
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
            // Extreure public_id de la URL de Cloudinary
            const publicId = regio.imatgePortada.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`viatges/${publicId}`).catch(() => { });
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