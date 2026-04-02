const mongoose = require('mongoose');

async function checkUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ccs-portal');
    const User = require('./models/User.model');
    
    const user = await User.findOne({ email: 'pkapoor@iilm.edu' });
    if (user) {
      console.log('User found:', {
        email: user.email,
        role: user.role,
        googleId: user.googleId
      });
    } else {
      console.log('User pkapoor@iilm.edu not found in database.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkUser();
