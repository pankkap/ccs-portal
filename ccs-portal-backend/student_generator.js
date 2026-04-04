const mongoose = require('mongoose');
const User = require('./models/User.model');

/**
 * student_generator.js
 * 
 * Usage: node student_generator.js <count>
 * Example: node student_generator.js 20
 */

const COUNT = parseInt(process.argv[2]) || 10;
const MONGO_URI = 'mongodb://localhost:27017/ccs-portal';

const firstNames = ['Arjun', 'Sanya', 'Vikram', 'Ananya', 'Rohan', 'Ishani', 'Karan', 'Meera', 'Aditya', 'Priya'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Singhania', 'Iyer', 'Reddy', 'Chopra', 'Bannerjee', 'Khan'];
const departments = ['Computer Science Core', 'Artificial Intelligence', 'Data Science', 'Cloud Computing', 'Cyber Security'];
const schools = ['School of Computer Science', 'School of Engineering', 'School of Management'];
const batches = ['2024', '2025', '2026'];

async function generateStudents() {
  try {
    console.log(`Connecting to database at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    
    console.log(`Purging existing test registry to prevent collisions...`);
    await User.deleteMany({ email: { $regex: /^student\d+@iilm\.edu$/ } });
    
    console.log(`Generating ${COUNT} synthetic student dossiers...`);
    
    const students = [];
    for (let i = 1; i <= COUNT; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName} (${i})`;
      
      const email = `student${i}@iilm.edu`;
      const rollNo = `23CSE${Math.floor(1000 + Math.random() * 9000)}`;
      const cgpa = (Math.random() * (10 - 6.5) + 6.5).toFixed(2);
      
      students.push({
        name,
        email,
        password: 'student123', // Raw password, hashed by Mongoose pre-save hook
        role: 'student',
        status: 'active',
        rollNo,
        cgpa: parseFloat(cgpa),
        college: schools[Math.floor(Math.random() * schools.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        year: batches[Math.floor(Math.random() * batches.length)],
        skills: ['React.js', 'Node.js', 'Python', 'Machine Learning'].slice(0, Math.floor(Math.random() * 4) + 1)
      });
    }

    // User.create triggers the 'save' pre-hook for each document, ensuring correct password hashing
    const result = await User.create(students);
    
    console.log('\x1b[32m%s\x1b[0m', `Successfully synchronized ${result.length} student records to the central database.`);
    console.log('Default credentials for all generated accounts:');
    console.log('- Password: student123');
    
  } catch (error) {
    if (error.code === 11000) {
      console.error('\x1b[31m%s\x1b[0m', 'Transmission Error: Duplicate email addresses detected. Consider purging existing test data before re-running.');
    } else {
      console.error('Generation failure:', error);
    }
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

generateStudents();
