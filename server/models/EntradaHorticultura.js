const mongoose = require('mongoose');

const entradaHorticulturaSchema = new mongoose.Schema({
    titol: {
        type: String,
        required: [true, 'El títol és obligatori'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    data: {
        type: Date,
        required: [true, 'La data és obligatòria'],
        default: Date.now
    },
    descripcio: {
        type: String,
        default: ''
    },
    cos: {
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
    }
}, {
    timestamps: true
});

entradaHorticulturaSchema.index({ data: -1 });

entradaHorticulturaSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('EntradaHorticultura', entradaHorticulturaSchema);
