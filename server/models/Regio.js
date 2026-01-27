const mongoose = require('mongoose');

const regioSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'El nom de la regió és obligatori'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
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

// Transformar _id a id en les respostes JSON
regioSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Regio', regioSchema);