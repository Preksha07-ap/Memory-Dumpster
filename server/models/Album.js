const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    cover: { type: String, default: 'images/logoo.jpg' },
    category: { type: String, enum: ['official', 'unofficial'], default: 'unofficial' }, // New field
    photos: [{
        src: String,
        caption: String,
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Array of User IDs
    }]
});

module.exports = mongoose.model('Album', albumSchema);
