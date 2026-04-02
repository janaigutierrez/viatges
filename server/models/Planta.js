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
        enum: ['plantes', 'suculentes', 'cactus', 'crases'],
        default: 'plantes'
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

// Index per filtrar per etiqueta
plantaSchema.index({ etiqueta: 1 });

// Transformar _id a id en les respostes JSON
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
