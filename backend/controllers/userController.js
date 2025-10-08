const User = require('../models/User');
const jwt = require('jsonwebtoken');
// Use model's bcryptjs-based hooks/methods instead of importing bcrypt here

// Generate JWT Token including role for RBAC middleware
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

exports.register = async (req, res) => {
    try {
        const { username, email, role, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Create new user with blockchain address
        const user = new User({ 
            username, 
            email, 
            role, 
            // Store raw password in passwordHash; model pre-save hook will hash it using bcryptjs
            passwordHash: password,
            blockchainAddress: req.body.blockchainAddress // Add blockchain address
        });
        
        await user.save();

        // Generate token with role
        const token = generateToken(user._id, user.role);

        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password via model method (uses bcryptjs under the hood)
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token with role
        const token = generateToken(user._id, user.role);

        res.status(200).json({ 
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
