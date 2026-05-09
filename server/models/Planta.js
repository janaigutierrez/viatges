const mongoose = require('mongoose');

const plantaSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'El nombre de la planta es obligatorio'],
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
    familia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Familia',
        required: [true, 'La familia es obligatoria']
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

plantaSchema.index({ familia: 1 });

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
