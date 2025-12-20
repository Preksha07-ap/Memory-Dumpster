const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In production, hash this!
    role: { type: String, enum: ['member', 'viewer'], default: 'viewer' },
    profile: {
        name: String,
        work: String,
        qualification: String,
        linkedin: String,
        github: String,
        img: String
    }
});

module.exports = mongoose.model('User', userSchema);
