  // server.js
  const express = require('express');
  const cors = require('cors');
  const bodyParser = require('body-parser');
  const mongoose = require('mongoose');
  require('dotenv').config();

  const app = express();
  const PORT = process.env.PORT || 5000;

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());
  const userRoutes = require('./routes/user');
  app.use('/api/users', userRoutes);
  

  // MongoDB Connection
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

  // Sample Route
  app.get('/', (req, res) => {
    res.send('API is running...');
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  