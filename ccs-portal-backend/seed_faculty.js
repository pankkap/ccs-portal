const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB URI - ensure this matches your .env
const MONGODB_URI = 'mongodb://localhost:27017/ccs-portal';

async function seedFaculty() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    // Import User model
    const User = require('./models/User.model');
    
    // Faculty Data
    const facultyData = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.j@iilm.edu',
        role: 'faculty',
        department: 'Computer Science',
        designation: 'Head of Career Services',
        specialization: 'Strategic Career Planning & Leadership',
        experience: '15+ Years',
        education: 'Ph.D. in Organizational Psychology',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
        showInFacultyPage: true,
        order: 0,
        status: 'active'
      },
      {
        name: 'Prof. Michael Chen',
        email: 'm.chen@iilm.edu',
        role: 'faculty',
        department: 'Information Technology',
        designation: 'Senior Technical Trainer',
        specialization: 'Full Stack Development & Cloud Computing',
        experience: '12+ Years',
        education: 'M.Tech in Computer Science',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
        showInFacultyPage: true,
        order: 1,
        status: 'active'
      },
      {
        name: 'Ms. Emily Davis',
        email: 'emily.d@iilm.edu',
        role: 'faculty',
        department: 'Business Administration',
        designation: 'Soft Skills Expert',
        specialization: 'Communication & Emotional Intelligence',
        experience: '10+ Years',
        education: 'MBA in Human Resource Management',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
        showInFacultyPage: true,
        order: 2,
        status: 'active'
      },
      {
        name: 'Dr. Robert Wilson',
        email: 'r.wilson@iilm.edu',
        role: 'faculty',
        department: 'Mathematics',
        designation: 'Aptitude & Reasoning Specialist',
        specialization: 'Quantitative Analysis & Logical Reasoning',
        experience: '18+ Years',
        education: 'Ph.D. in Mathematics',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
        showInFacultyPage: true,
        order: 3,
        status: 'active'
      }
    ];

    console.log('Seeding faculty members...');
    
    for (const data of facultyData) {
      // Check if user already exists
      const existing = await User.findOne({ email: data.email });
      if (existing) {
        console.log(`User ${data.email} already exists, skipping...`);
        continue;
      }
      
      // Hash a dummy password
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash('password123', salt);
      
      const user = new User(data);
      await user.save();
      console.log(`Added: ${data.name}`);
    }

    console.log('Successfully seeded dummy faculty members!');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

seedFaculty();
