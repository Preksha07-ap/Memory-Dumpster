const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
    try {
        // Fetch all users, return only profile info
        const users = await User.find({}, 'profile role email');
        console.log("ALL USERS IN DB:", users);

        // Transform to match frontend expectation
        const members = users.map(u => ({
            name: u.profile.name || u.email, // Fallback
            work: u.profile.work || 'Member',
            qualification: u.profile.qualification || '',
            linkedin: u.profile.linkedin || '#',
            github: u.profile.github || '#',
            role: u.role,
            email: u.email,
            img: u.profile.img,
            _id: u._id
        }));

        res.json(members);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete Member
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Member not found' });

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Member deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
