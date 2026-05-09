const EntradaHorticultura = require('../models/EntradaHorticultura');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middleware/upload');

const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${publicId}`;
};

// @desc    Obtenir totes les entrades (ordenades per data desc)
// @route   GET /api/horticultura
// @access  Public
const getEntrades = async (req, res, next) => {
    try {
        const entrades = await EntradaHorticultura.find().sort({ data: -1 });
        res.json(entrades);
    } catch (error) {
        next(error);
    }
};

// @desc    Obtenir una entrada per slug
// @route   GET /api/horticultura/:slug
// @access  Public
const getEntradaBySlug = async (req, res, next) => {
    try {
        const entrada = await EntradaHorticultura.findOne({ slug: req.params.slug });

        if (!entrada) {
            return res.status(404).json({ error: 'Entrada no trobada' });
        }

        res.json(entrada);
    } catch (error) {
        next(error);
    }
};

// @desc    Crear nova entrada
// @route   POST /api/horticultura
// @access  Private (Admin)
const createEntrada = async (req, res, next) => {
    try {
        const { titol, slug, data, descripcio, cos } = req.body;

        if (!titol || !slug) {
            return res.status(400).json({ error: 'Títol i slug són obligatoris' });
        }

        const imatgePortada = req.file ? await uploadToCloudinary(req.file) : null;

        const entrada = await EntradaHorticultura.create({
            titol,
            slug,
            data: data || new Date(),
            descripcio: descripcio || '',
            cos: cos || '',
            imatgePortada,
            galeriaImatges: []
        });

        res.status(201).json(entrada);
    } catch (error) {
        next(error);
    }
};

// @desc    Actualitzar entrada
// @route   PUT /api/horticultura/:id
// @access  Private (Admin)
const updateEntrada = async (req, res, next) => {
    try {
        const { titol, slug, data, descripcio, cos } = req.body;

        const entrada = await EntradaHorticultura.findById(req.params.id);
        if (!entrada) {
            return res.status(404).json({ error: 'Entrada no trobada' });
        }

        if (req.file && entrada.imatgePortada) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(entrada.imatgePortada)).catch(() => {});
        }

        entrada.titol = titol || entrada.titol;
        entrada.slug = slug || entrada.slug;
        entrada.data = data || entrada.data;
        entrada.descripcio = descripcio !== undefined ? descripcio : entrada.descripcio;
        entrada.cos = cos !== undefined ? cos : entrada.cos;

        if (req.file) {
            entrada.imatgePortada = await uploadToCloudinary(req.file);
        }

        await entrada.save();

        res.json(entrada);
    } catch (error) {
        next(error);
    }
};

// @desc    Afegir imatges a la galeria
// @route   POST /api/horticultura/:id/galeria
// @access  Private (Admin)
const addImatgesGaleria = async (req, res, next) => {
    try {
        const entrada = await EntradaHorticultura.findById(req.params.id);
        if (!entrada) {
            return res.status(404).json({ error: 'Entrada no trobada' });
        }

        if (req.files && req.files.length > 0) {
            const novaImatges = [];
            for (const file of req.files) {
                const url = await uploadToCloudinary(file);
                novaImatges.push(url);
            }
            entrada.galeriaImatges.push(...novaImatges);
            await entrada.save();
        }

        res.json(entrada);
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar imatge de la galeria
// @route   DELETE /api/horticultura/:id/galeria
// @access  Private (Admin)
const deleteImatgeGaleria = async (req, res, next) => {
    try {
        const { imatgeUrl } = req.body;
        if (!imatgeUrl) {
            return res.status(400).json({ error: 'URL de la imatge és obligatòria' });
        }

        const entrada = await EntradaHorticultura.findById(req.params.id);
        if (!entrada) {
            return res.status(404).json({ error: 'Entrada no trobada' });
        }

        entrada.galeriaImatges = entrada.galeriaImatges.filter(img => img !== imatgeUrl);
        await cloudinary.uploader.destroy(getPublicIdFromUrl(imatgeUrl)).catch(() => {});
        await entrada.save();

        res.json(entrada);
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar entrada
// @route   DELETE /api/horticultura/:id
// @access  Private (Admin)
const deleteEntrada = async (req, res, next) => {
    try {
        const entrada = await EntradaHorticultura.findById(req.params.id);
        if (!entrada) {
            return res.status(404).json({ error: 'Entrada no trobada' });
        }

        if (entrada.imatgePortada) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(entrada.imatgePortada)).catch(() => {});
        }

        for (const imatgeUrl of entrada.galeriaImatges) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(imatgeUrl)).catch(() => {});
        }

        await entrada.deleteOne();

        res.json({ message: 'Entrada eliminada correctament' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEntrades,
    getEntradaBySlug,
    createEntrada,
    updateEntrada,
    addImatgesGaleria,
    deleteImatgeGaleria,
    deleteEntrada
};
