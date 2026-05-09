const mongoose = require('mongoose');

const plantaSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'El nom de la planta és obligatori'],
        trim: true
    },
    nomLlati: {
        type: String,
        trim: true,
        default: ''
    },
    descripcio: {
        type: String,
        default: ''
    },
    etiqueta: {
        type: String,
        required: [true, "L'etiqueta és obligatòria"],
        enum: ['planta', 'crases-suculentes', 'cactus'],
        default: 'planta'
    },
    ubicacio: {
        type: String,
        enum: ['interior', 'exterior', null],
        default: null
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

plantaSchema.index({ etiqueta: 1 });
plantaSchema.index({ ubicacio: 1 });

plantaSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Planta', plantaSchema);
