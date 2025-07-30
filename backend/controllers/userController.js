// const User = require('../models/User');

// // Logic for registering a user
// exports.register = async (req, res) => {
//     try {
//         // Logic for registering a user
//            const { username, email, role, password } = req.body;
//            const user = new User({ username, email, role, password });
//            await user.save();
//            res.status(201).json({ message: 'User registered successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
// // Logic for user login
// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         const isMatch = await user.comparePassword(password);
//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid credentials' });
//         }
//         res.status(200).json({ message: 'Login successful' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
// backend/controllers/userController.js
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { username, email, role, password } = req.body;
        const existingUser  = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser ) {
            return res.status(409).json({ message: 'User  already exists' });
        }
        const user = new User({ username, email, role, passwordHash: password });
        await user.save();
        res.status(201).json({ message: 'User  registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
