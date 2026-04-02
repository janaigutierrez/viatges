const multer = require('multer');
const multerCloudinary = require('multer-storage-cloudinary');
const CloudinaryStorage = multerCloudinary.CloudinaryStorage || multerCloudinary;
const cloudinary = require('../config/cloudinary');

// Configurar Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'viatges', // Carpeta a Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 1200, height: 800, crop: 'limit' }, // Redimensiona si és massa gran
            { quality: 'auto' } // Compressió automàtica
        ],
    },
});

// Configuració de Multer amb Cloudinary
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Màxim 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Només es permeten imatges (jpeg, jpg, png, gif, webp)'));
        }
    },
});

module.exports = upload;