const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/memories_db')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const users = [
    {
        username: 'member1',
        email: 'member1@example.com', // Added email field as per plan, though schema needs update if not present
        password: 'password123',
        role: 'member',
        profile: { name: 'Member One', work: 'Developer', qualification: 'B.Tech', linkedin: '', github: '' }
    },
    {
        username: 'member2',
        email: 'member2@example.com',
        password: 'password123',
        role: 'member',
        profile: { name: 'Member Two', work: 'Designer', qualification: 'B.Des', linkedin: '', github: '' }
    },
    {
        username: 'member3',
        email: 'member3@example.com',
        password: 'password123',
        role: 'member',
        profile: { name: 'Member Three', work: 'Manager', qualification: 'MBA', linkedin: '', github: '' }
    },
    {
        username: 'member4',
        email: 'member4@example.com',
        password: 'password123',
        role: 'member',
        profile: { name: 'Member Four', work: 'Analyst', qualification: 'B.Sc', linkedin: '', github: '' }
    }
];

const seedUsers = async () => {
    try {
        await User.deleteMany({}); // Clear existing users
        console.log('🗑️  Existing users removed.');

        for (const user of users) {
            // Note: In a real app, hash the password here before saving
            // For now, storing plain text as per existing pattern, plan to upgrade later
            await User.create(user);
        }

        console.log('✅ 4 Members seeded successfully.');
        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        mongoose.connection.close();
    }
};

seedUsers();
