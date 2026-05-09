const mongoose = require('mongoose');

const seccioInfoSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    descripcio: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

seccioInfoSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('SeccioInfo', seccioInfoSchema);
