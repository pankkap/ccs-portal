import React from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { GraduationCap, Award, BookOpen, Linkedin, Mail } from 'lucide-react';

const Faculty = () => {
  const facultyMembers = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Head of Career Services',
      specialization: 'Strategic Career Planning & Leadership',
      experience: '15+ Years',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
      education: 'Ph.D. in Organizational Psychology'
    },
    {
      name: 'Prof. Michael Chen',
      role: 'Senior Technical Trainer',
      specialization: 'Full Stack Development & Cloud Computing',
      experience: '12+ Years',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
      education: 'M.Tech in Computer Science'
    },
    {
      name: 'Ms. Emily Davis',
      role: 'Soft Skills Expert',
      specialization: 'Communication & Emotional Intelligence',
      experience: '10+ Years',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
      education: 'MBA in Human Resource Management'
    },
    {
      name: 'Dr. Robert Wilson',
      role: 'Aptitude & Reasoning Specialist',
      specialization: 'Quantitative Analysis & Logical Reasoning',
      experience: '18+ Years',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      education: 'Ph.D. in Mathematics'
    },
    {
      name: 'Ms. Jessica Lee',
      role: 'Industry Relations Manager',
      specialization: 'Corporate Partnerships & Placements',
      experience: '8+ Years',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
      education: 'Masters in International Business'
    },
    {
      name: 'Mr. David Miller',
      role: 'Mock Interview Coach',
      specialization: 'Behavioral Interviews & Resume Strategy',
      experience: '14+ Years',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      education: 'Ex-Google Recruiter'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Meet Our Expert Faculty
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Our team of industry veterans and academic experts are dedicated to shaping your professional future.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {facultyMembers.map((faculty, i) => (
            <motion.div
              key={i}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all overflow-hidden"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={faculty.image} 
                  alt={faculty.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 gap-4">
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg">
                    <Linkedin className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg">
                    <Mail className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{faculty.name}</h3>
                <p className="text-blue-600 font-bold text-sm mb-4 uppercase tracking-widest">{faculty.role}</p>
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span>{faculty.specialization}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span>{faculty.education}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span>{faculty.experience} Experience</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default Faculty;
