const mongoose = require('mongoose');

const apartatSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'El nombre del apartado es obligatorio'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    puntInteres: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PuntInteres',
        required: true
    },
    lloc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lloc',
        required: true
    },
    regio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Regio',
        required: true
    },
    descripcio: {
        type: String,
        default: ''
    },
    imatgePortada: {
        type: String,
        default: null
    },
    galeriaImatges: {
        type: [String],
        default: []
    },
    ordre: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Slug únic dins de cada PuntInteres
apartatSchema.index({ slug: 1, puntInteres: 1 }, { unique: true });

apartatSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Apartat', apartatSchema);
