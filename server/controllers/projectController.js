const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new project
router.post('/', async (req, res) => {
    const project = new Project({
        title: req.body.title,
        desc: req.body.desc,
        stack: req.body.stack,
        img: req.body.img,
        github: req.body.github,
        demo: req.body.demo
    });

    try {
        const newProject = await project.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Like project
router.post('/:id/like', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        const userId = req.body.userId; // Assuming sent from frontend

        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (project.likes.includes(userId)) {
            // Unlike
            project.likes = project.likes.filter(id => id.toString() !== userId);
        } else {
            // Like
            project.likes.push(userId);
        }

        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
