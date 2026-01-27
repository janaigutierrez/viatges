// models/Lloc.js
const mongoose = require('mongoose');

const llocSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'El nom del lloc és obligatori'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    regio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Regio',
        required: [true, 'La regió és obligatòria']
    },
    imatgePortada: {
        type: String,
        default: null
    },
    descripcio: {
        type: String,
        default: ''
    },
    galeriaImatges: [{
        type: String
    }],
    puntsInteres: [{
        nom: {
            type: String,
            required: true
        },
        descripcio: {
            type: String,
            default: ''
        }
    }],
    ordre: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index composat per slug + regio (un lloc pot tenir mateix nom en diferents regions)
llocSchema.index({ slug: 1, regio: 1 }, { unique: true });

// Transformar _id a id en les respostes JSON
llocSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Lloc', llocSchema);