import React from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Download, FileText, Video, Headphones, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const ELibrary = () => {
  const resources = [
    { type: 'E-Book', title: 'Mastering Technical Interviews', author: 'Dr. Robert Wilson', format: 'PDF', size: '4.5 MB', icon: FileText },
    { type: 'Video', title: 'Soft Skills for Global Careers', author: 'Ms. Emily Davis', format: 'MP4', size: '120 MB', icon: Video },
    { type: 'E-Book', title: 'Quantitative Aptitude Guide', author: 'Dr. Robert Wilson', format: 'PDF', size: '8.2 MB', icon: FileText },
    { type: 'Audio', title: 'Leadership & Management Podcast', author: 'Dr. Sarah Johnson', format: 'MP3', size: '15 MB', icon: Headphones },
    { type: 'Course', title: 'Full Stack Development Bootcamp', author: 'Prof. Michael Chen', format: 'Online', size: 'N/A', icon: Globe },
    { type: 'E-Book', title: 'Resume Building Strategies', author: 'Mr. David Miller', format: 'PDF', size: '2.1 MB', icon: FileText },
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
            Digital E-Library
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Access a vast collection of career-focused resources, from technical guides to soft skills workshops.
          </motion.p>
        </div>

        <div className="relative max-w-2xl mx-auto mb-16">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input 
            type="text" 
            placeholder="Search for books, videos, or courses..." 
            className="w-full pl-16 pr-8 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-600 transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              className="p-8 bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <resource.icon className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {resource.type}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
              <p className="text-sm text-gray-500 mb-6">By {resource.author}</p>
              
              <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                <div className="text-xs font-bold text-gray-400">
                  {resource.format} • {resource.size}
                </div>
                <Link to="/login" className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all">
                  Access <Download className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-8 md:p-12 bg-blue-600 rounded-[2rem] md:rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-4">Request a Resource</h2>
            <p className="text-blue-100">Can't find what you're looking for? Let us know and we'll try to add it to our library.</p>
          </div>
          <Link to="/login" className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-xl whitespace-nowrap">
            Submit Request
          </Link>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default ELibrary;
