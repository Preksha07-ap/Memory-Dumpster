const express = require('express');
const router = express.Router();
const Album = require('../models/Album');

// Get all albums
router.get('/', async (req, res) => {
    try {
        const albums = await Album.find();
        res.json(albums);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new album
router.post('/', async (req, res) => {
    const album = new Album({
        title: req.body.title,
        cover: req.body.cover,
        category: req.body.category
    });

    try {
        const newAlbum = await album.save();
        res.status(201).json(newAlbum);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add photo(s) to album
router.post('/:id/photos', async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) return res.status(404).json({ message: 'Album not found' });

        if (req.body.photos && Array.isArray(req.body.photos)) {
            // Batch Add
            const newPhotos = req.body.photos.map(p => ({
                src: p.src,
                caption: p.caption || ''
            }));
            album.photos.push(...newPhotos);
        } else {
            // Single Add (Backward Compatibility)
            album.photos.push({
                src: req.body.src,
                caption: req.body.caption
            });
        }

        const updatedAlbum = await album.save();
        res.json(updatedAlbum);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Like photo
router.post('/:id/photos/:photoId/like', async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        const userId = req.body.userId;

        if (!album) return res.status(404).json({ message: 'Album not found' });

        const photo = album.photos.id(req.params.photoId); // Mongoose helper for subdocs
        if (!photo) return res.status(404).json({ message: 'Photo not found' });

        // Initialize likes array if undefined (for old docs)
        if (!photo.likes) photo.likes = [];

        if (photo.likes.includes(userId)) {
            // Unlike
            photo.likes = photo.likes.filter(id => id.toString() !== userId);
        } else {
            // Like
            photo.likes.push(userId);
        }

        const updatedAlbum = await album.save();
        res.json(updatedAlbum);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
