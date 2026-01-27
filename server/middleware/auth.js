const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        // Obtenir token del header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                error: 'No hi ha token, accés denegat'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Afegir user id al request
        req.userId = decoded.id;

        next();
    } catch (error) {
        res.status(401).json({
            error: 'Token invàlid o expirat'
        });
    }
};

module.exports = auth;