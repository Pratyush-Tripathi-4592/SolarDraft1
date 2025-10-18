const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.post(
  '/register',
  userController.validateRegistration, // array of middleware
  userController.registerUser          // function handler
);

router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

module.exports = router;
