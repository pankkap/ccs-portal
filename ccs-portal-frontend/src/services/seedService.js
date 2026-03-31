import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { generateId } from '../lib/utils';

export const seedDatabase = async () => {
  const batch = writeBatch(db);

  // 1. Seed System Governance
  const systemRef = doc(db, 'system', 'governance');
  batch.set(systemRef, {
    universityName: 'IILM University',
    tagline: 'Empowering Future Leaders through Innovation',
    about: 'IILM University has a legacy of 28 years in responsible management education. We provide a holistic learning environment with focus on industry-readiness and placement excellence.',
    contactEmail: 'admissions@iilm.edu',
    contactPhone: '+91 124 2775655',
    address: 'Plot No. 6-7, Sector 53, Gurugram, Haryana 122003',
    placementStats: {
      highestPackage: '18 LPA',
      averagePackage: '6.5 LPA',
      placementRate: '95%'
    }
  });

  // 2. Seed Courses
  const courses = [
    {
      id: 'course-1',
      title: 'Full Stack Web Development',
      description: 'Master modern web technologies from frontend to backend. Learn React, Node.js, and Cloud Deployment.',
      facultyId: 'faculty-1',
      facultyName: 'Dr. Rajesh Kumar',
      skills: 'React, Node.js, Firebase, Tailwind',
      duration: '12 Weeks',
      published: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'course-2',
      title: 'Data Structures & Algorithms',
      description: 'Deep dive into DSA for technical interviews. Covers Arrays, Trees, Graphs, and Dynamic Programming.',
      facultyId: 'faculty-1',
      facultyName: 'Dr. Rajesh Kumar',
      skills: 'C++, Java, Problem Solving',
      duration: '8 Weeks',
      published: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'course-3',
      title: 'AI & Machine Learning',
      description: 'Explore the world of Artificial Intelligence. Learn Python, Scikit-Learn, and Neural Networks.',
      facultyId: 'faculty-2',
      facultyName: 'Prof. Anjali Sharma',
      skills: 'Python, ML, Data Science',
      duration: '10 Weeks',
      published: true,
      createdAt: new Date().toISOString()
    }
  ];

  courses.forEach(course => {
    batch.set(doc(db, 'courses', course.id), course);
    
    // Seed Modules for each course
    const modules = [
      { id: generateId(), title: 'Introduction & Setup', type: 'video', contentUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order: 1, courseId: course.id },
      { id: generateId(), title: 'Core Concepts', type: 'pdf', contentUrl: 'https://example.com/guide.pdf', order: 2, courseId: course.id },
      { id: generateId(), title: 'Advanced Topics', type: 'video', contentUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order: 3, courseId: course.id }
    ];
    
    modules.forEach(mod => {
      batch.set(doc(db, 'courses', course.id, 'modules', mod.id), mod);
    });
  });

  // 3. Seed Assessments
  const assessments = [
    {
      id: 'assess-1',
      title: 'Full Stack Final Assessment',
      description: 'Comprehensive test covering all modules of Full Stack Development.',
      facultyId: 'faculty-1',
      facultyName: 'Dr. Rajesh Kumar',
      timeLimit: 45,
      passingScore: 70,
      proctored: true,
      published: true,
      type: 'final',
      createdAt: new Date().toISOString()
    }
  ];

  assessments.forEach(assess => {
    batch.set(doc(db, 'assessments', assess.id), assess);
    
    // Seed Questions
    const questions = [
      {
        id: generateId(),
        text: 'What is the virtual DOM in React?',
        options: ['A direct copy of the real DOM', 'A lightweight representation of the real DOM', 'A browser API', 'A CSS engine'],
        correctOption: 1,
        points: 10,
        order: 1,
        assessmentId: assess.id
      },
      {
        id: generateId(),
        text: 'Which hook is used for side effects in React?',
        options: ['useState', 'useContext', 'useEffect', 'useMemo'],
        correctOption: 2,
        points: 10,
        order: 2,
        assessmentId: assess.id
      }
    ];
    
    questions.forEach(q => {
      batch.set(doc(db, 'assessments', assess.id, 'questions', q.id), q);
    });
  });

  // 4. Seed Placements
  const placements = [
    {
      id: 'place-1',
      company: 'Google',
      role: 'Software Engineer Intern',
      location: 'Bangalore / Remote',
      salary: '1.2 Lakhs/month',
      description: 'Looking for passionate developers with strong DSA skills.',
      requirements: 'B.Tech 3rd/4th Year, Proficiency in C++/Java/Python',
      deadline: '2026-05-15',
      status: 'active',
      postedAt: new Date().toISOString()
    },
    {
      id: 'place-2',
      company: 'Microsoft',
      role: 'Full Stack Developer',
      location: 'Hyderabad',
      salary: '15 - 22 LPA',
      description: 'Join our Azure cloud team to build scalable services.',
      requirements: 'Experience with React and Node.js',
      deadline: '2026-04-20',
      status: 'active',
      postedAt: new Date().toISOString()
    }
  ];

  placements.forEach(p => {
    batch.set(doc(db, 'placements', p.id), p);
  });

  // 5. Seed Mock Tests
  const mockTests = [
    {
      id: 'mock-1',
      title: 'TCS NQT Mock Test 2026',
      description: 'Practice test for TCS National Qualifier Test.',
      timeLimit: 60,
      questionsCount: 30,
      proctored: true,
      published: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'mock-2',
      title: 'Infosys Certification Practice',
      description: 'Mock test for Infosys InfyTQ certification.',
      timeLimit: 90,
      questionsCount: 40,
      proctored: false,
      published: true,
      createdAt: new Date().toISOString()
    }
  ];

  mockTests.forEach(m => {
    batch.set(doc(db, 'mockTests', m.id), m);
  });

  await batch.commit();
};
