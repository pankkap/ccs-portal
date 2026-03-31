import React from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { GraduationCap, Code, Brain, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Trainings = () => {
  const programs = [
    { 
      icon: MessageSquare, 
      title: 'Soft Skills Training', 
      desc: 'Master the art of communication, leadership, and emotional intelligence. Essential for modern workplace success.',
      features: ['Public Speaking', 'Body Language', 'Conflict Resolution', 'Teamwork'],
      color: 'blue'
    },
    { 
      icon: Brain, 
      title: 'Aptitude Development', 
      desc: 'Sharpen your logical reasoning and quantitative abilities to excel in competitive placement exams.',
      features: ['Logical Reasoning', 'Quantitative Aptitude', 'Data Interpretation', 'Verbal Ability'],
      color: 'indigo'
    },
    { 
      icon: Code, 
      title: 'Technical Workshops', 
      desc: 'Hands-on training in industry-standard technologies and programming languages.',
      features: ['Full Stack Development', 'Data Science', 'Cloud Computing', 'Cybersecurity'],
      color: 'green'
    },
    { 
      icon: GraduationCap, 
      title: 'Interview Preparation', 
      desc: 'Mock interviews and personalized feedback to help you build confidence and land your dream job.',
      features: ['Mock Interviews', 'Resume Building', 'Group Discussions', 'HR Round Prep'],
      color: 'purple'
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
            Our Training Programs
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Comprehensive skill development modules designed to make you industry-ready from day one.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {programs.map((program, i) => (
            <motion.div
              key={i}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-10 bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-blue-50 text-blue-600`}>
                <program.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{program.title}</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">{program.desc}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {program.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    {feature}
                  </div>
                ))}
              </div>

              <Link to="/login" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
                Enroll in Program <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ))}
        </div>
        {/* Training Methodology */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Training Methodology</h2>
            <p className="text-gray-600">A systematic approach to professional excellence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { step: '01', title: 'Assessment', desc: 'Initial evaluation of skills and career aspirations to create a personalized roadmap.' },
              { step: '02', title: 'Training', desc: 'Intensive workshops and hands-on projects guided by industry experts.' },
              { step: '03', title: 'Placement', desc: 'Mock interviews, resume building, and direct access to top recruiters.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-8 md:p-12 bg-gray-50 rounded-[2rem] md:rounded-[3rem] border border-gray-100 group"
              >
                <div className="text-6xl font-black text-blue-600/10 absolute top-8 right-8 group-hover:text-blue-600/20 transition-colors">{item.step}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-32 p-8 md:p-16 bg-blue-600 rounded-[2rem] md:rounded-[4rem] text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-blue-100 mb-10 text-lg">Enroll in our training programs today and take the first step towards your dream career.</p>
            <Link to="/login" className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-xl inline-block">
              Get Started Now
            </Link>
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default Trainings;
