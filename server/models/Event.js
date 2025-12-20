const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    desc: { type: String, required: true },
    img: { type: String, default: 'images/logoo.jpg' },
    category: { type: String, enum: ['official', 'unofficial'], default: 'unofficial' }, // New field
    link: { type: String }, // External link
    createdBy: { type: String } // Username of creator
});

module.exports = mongoose.model('Event', eventSchema);
