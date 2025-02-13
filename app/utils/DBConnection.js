const mongoose = require('mongoose');

// Replace with your MongoDB URI (Mongo Atlas example)
const mongoURI = 'mongodb+srv://anishkumar3787230:anish123@cluster0.coy1l.mongodb.net/AttendanceLandMarkReality?retryWrites=true&w=majority&appName=Cluster0'; 
 
// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI); // No need for useNewUrlParser and useUnifiedTopology options

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process with failure if MongoDB connection fails
  }
};

module.exports = connectDB;
