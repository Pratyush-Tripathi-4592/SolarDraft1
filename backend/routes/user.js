
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();
router.post('/register', async (req, res) => {
  const { fullName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser  = new User({ fullName, email, password: hashedPassword });
  try {
    await newUser .save();
    res.status(201).json({ message: 'User  registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});
module.exports = router;
  