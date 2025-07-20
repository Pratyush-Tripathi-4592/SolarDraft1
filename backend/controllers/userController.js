   const User = require('../models/User');
   
   exports.register = async (req, res) => {
       try {
           // Logic for registering a user
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   };

   exports.login = async (req, res) => {
       try {
           // Logic for user login
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   };
   