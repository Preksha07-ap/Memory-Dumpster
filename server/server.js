require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const path = require('path');

app.use(cors()); // Allow all origins (simplest fix)
app.use(express.json()); // Enable JSON body parsing

app.use(express.static(path.join(__dirname, '../client/dist')));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// MongoDB Connection
if (!process.env.MONGO_URI) {
    console.error('❌ FATAL ERROR: MONGO_URI is not defined in .env');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1); // Exit if DB fails
    });

const eventRoutes = require('./controllers/eventController');
const projectRoutes = require('./controllers/projectController');
const galleryRoutes = require('./controllers/galleryController');

app.use('/api/events', eventRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/members', require('./controllers/memberController'));
app.use('/api/upload', require('./controllers/uploadController'));
app.use('/api/auth', require('./controllers/authController'));

// Serve static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
