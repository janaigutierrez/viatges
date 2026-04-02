const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Multer amb memòria (sense multer-storage-cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
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

// Helper: puja un buffer a Cloudinary i retorna la secure_url
const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'viatges',
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                transformation: [
                    { width: 1200, height: 800, crop: 'limit' },
                    { quality: 'auto' }
                ],
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        stream.end(file.buffer);
    });
};

upload.uploadToCloudinary = uploadToCloudinary;

module.exports = upload;
