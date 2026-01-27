// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Configurar on i com guardar les imatges
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta on es guarden
    },
    filename: (req, file, cb) => {
        // Nom únic: timestamp + nom original
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Filtrar només imatges
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Només es permeten imatges (jpeg, jpg, png, gif, webp)'));
    }
};

// Configuració final de Multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Màxim 5MB per imatge
    },
    fileFilter: fileFilter
});

module.exports = upload;