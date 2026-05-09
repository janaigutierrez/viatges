const mongoose = require('mongoose');

const familiaSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'El nombre de la familia es obligatorio'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    etiqueta: {
        type: String,
        required: [true, 'La etiqueta es obligatoria'],
        enum: ['planta', 'crases-suculentes', 'cactus'],
        default: 'planta'
    },
    ubicacio: {
        type: String,
        enum: ['interior', 'exterior', null],
        default: null
    },
    descripcio: {
        type: String,
        default: ''
    },
    imatgePortada: {
        type: String,
        default: null
    },
    ordre: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

familiaSchema.index({ etiqueta: 1 });
familiaSchema.index({ ubicacio: 1 });

familiaSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Familia', familiaSchema);
