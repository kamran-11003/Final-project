const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing all collections...');
    
    // Wait for connection
    await mongoose.connection.asPromise();
    
    // Get all collections
    const collections = await mongoose.connection.db.collections();
    
    // Drop each collection
    for (let collection of collections) {
      await collection.drop();
      console.log(`✅ Dropped collection: ${collection.collectionName}`);
    }
    
    console.log('✅ Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
