const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const app = require('./app');

const PORT = process.env.PORT || 5000;

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal')
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
