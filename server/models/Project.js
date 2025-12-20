const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    desc: { type: String, required: true },
    stack: [{ type: String }], // Array of strings like ['React', 'Node']
    img: { type: String, default: 'images/logoo.jpg' },
    github: String,
    demo: String,
    createdBy: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Array of User IDs
});

module.exports = mongoose.model('Project', projectSchema);
