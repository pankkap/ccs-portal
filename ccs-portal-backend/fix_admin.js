const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect('mongodb://localhost:27017/ccs-portal');
  const User = require('./models/User.model');
  await User.updateOne({ email: 'admin@iilm.edu' }, { $set: { role: 'admin' } });
  console.log('Fixed role to admin');
  process.exit();
}

fix();
