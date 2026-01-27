const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generar JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Token vàlid 30 dies
    });
};

// @desc    Registrar nou usuari admin (només per crear el primer)
// @route   POST /api/auth/register
// @access  Public (però després ho podríem protegir)
const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validar que vinguin els camps
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email i contrasenya són obligatoris'
            });
        }

        // Verificar si ja existeix l'usuari
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                error: 'Aquest email ja està registrat'
            });
        }

        // Crear usuari
        const user = await User.create({
            email,
            password
        });

        // Retornar user + token
        res.status(201).json({
            id: user._id,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Login usuari
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validar que vinguin els camps
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email i contrasenya són obligatoris'
            });
        }

        // Buscar usuari (incloent password que està select: false)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                error: 'Credencials incorrectes'
            });
        }

        // Verificar password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                error: 'Credencials incorrectes'
            });
        }

        // Retornar user + token
        res.json({
            id: user._id,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Obtenir usuari actual (per verificar token)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                error: 'Usuari no trobat'
            });
        }

        res.json({
            id: user._id,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe
};