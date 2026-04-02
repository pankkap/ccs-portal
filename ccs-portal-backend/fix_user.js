const mongoose = require('mongoose');

async function fixUserRole() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ccs-portal');
    const User = require('./models/User.model');
    
    // Update the user role to admin
    const result = await User.updateOne(
      { email: 'pkapoor@iilm.edu' }, 
      { $set: { role: 'admin' } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('Successfully upgraded pkapoor@iilm.edu to admin role!');
    } else {
      console.log('User pkapoor@iilm.edu already had the admin role or was not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

fixUserRole();
