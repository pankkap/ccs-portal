const mongoose = require('mongoose');

async function fixStudent() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ccs-portal');
    const User = require('./models/User.model');

    // Delete the previous double-hashed account
    await User.deleteOne({ email: 'student@iilm.edu' });

    // Create new student passing the raw text password 
    // Mongoose's pre-save hook inside User.model.js will handle the hashing EXACTLY once!
    await User.create({
      name: 'Demo Student-3',
      email: 'student3@iilm.edu',
      password: 'student123',
      role: 'student',
      status: 'active'
    });
    console.log('Fixed student account successfully! You can now log in.');
  } catch (error) {
    console.error('Failed to fix student:', error);
  } finally {
    process.exit();
  }
}

fixStudent();
