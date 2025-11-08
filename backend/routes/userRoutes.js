const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.post(
  '/register',
  userController.validateRegistration, // array of middleware
  userController.registerUser          // function handler
);

router.post('/login', userController.login);
router.post('/logout', authenticateToken, userController.logout);
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);

// List users with optional role filter: /api/users?role=buyer
router.get('/', authenticateToken, userController.listUsers);

module.exports = router;
