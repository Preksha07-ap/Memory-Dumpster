const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        // In production, compare hashed password
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid Password' });
        }

        // Return user info and role (Flattened structure for frontend)
        return res.json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                name: user.profile.name,
                work: user.profile.work,
                qualification: user.profile.qualification,
                linkedin: user.profile.linkedin,
                github: user.profile.github,
                img: user.profile.img
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Register Logic
router.post('/register', async (req, res) => {
    console.log("➡️ Register Route Hit:", req.body);
    try {
        const { name, email, work, qualification, linkedin, github, img } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            // Update existing user profile
            user.profile = { name, work, qualification, linkedin, github, img };
            await user.save();
        } else {
            // Create new user (Default password for now since we don't have a password field)
            user = new User({
                username: email.split('@')[0], // Generate username from email
                email,
                password: 'defaultPassword123', // Placeholder
                role: 'viewer',
                profile: { name, work, qualification, linkedin, github, img }
            });
            await user.save();
        }

        // Return flattened user object
        res.json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                name: user.profile.name,
                work: user.profile.work,
                qualification: user.profile.qualification,
                linkedin: user.profile.linkedin,
                github: user.profile.github,
                img: user.profile.img
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
