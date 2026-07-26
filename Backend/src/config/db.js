const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌  MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  let retries = 5;
  while (retries) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅  MongoDB connected: ${conn.connection.host}`);
      break;
    } catch (err) {
      retries -= 1;
      console.error(`❌  MongoDB connection failed. Retries left: ${retries}. Error: ${err.message}`);
      if (retries === 0) {
        console.error('💀  Could not connect to MongoDB. Exiting.');
        process.exit(1);
      }
      // Wait 3 seconds before retrying
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄  MongoDB reconnected.');
});

module.exports = connectDB;
