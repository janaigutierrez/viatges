const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email és obligatori'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email invàlid']
    },
    password: {
        type: String,
        required: [true, 'Contrasenya és obligatòria'],
        minlength: [6, 'La contrasenya ha de tenir mínim 6 caràcters'],
        select: false // no s'envia al front
    },
    role: {
        type: String,
        default: 'admin',
        enum: ['admin']
    }
}, {
    timestamps: true
});

// Hash password abans de guardar
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Mètode per comparar passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Transformar _id a id en les respostes JSON
userSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password; // Extra seguretat
        return ret;
    }
});

module.exports = mongoose.model('User', userSchema);