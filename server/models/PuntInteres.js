const mongoose = require('mongoose');

const puntInteresSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'El nom del punt d\'interès és obligatori'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    lloc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lloc',
        required: [true, 'El lloc és obligatori']
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
    ordre: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index composat: un slug únic per lloc
puntInteresSchema.index({ slug: 1, lloc: 1 }, { unique: true });

puntInteresSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('PuntInteres', puntInteresSchema);
