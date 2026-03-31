import React from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Building2, Trophy, Users, TrendingUp, Briefcase } from 'lucide-react';

const Placements = () => {
  const statistics = [
    { icon: Users, value: '7500+', label: 'Students Placed', color: 'blue' },
    { icon: Building2, value: '150+', label: 'Partner Companies', color: 'blue' },
    { icon: Trophy, value: '₹35 LPA', label: 'Highest Package', color: 'blue' },
    { icon: TrendingUp, value: '₹8.5 LPA', label: 'Average Package', color: 'blue' },
  ];

  const topRecruiters = [
    { name: 'Google', logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png' },
    { name: 'Microsoft', logo: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31' },
    { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
    { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
    { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
  ];

  const recentPlacements = [
    { name: 'Rahul Sharma', company: 'Google', package: '₹32 LPA', role: 'Software Engineer', year: '2025' },
    { name: 'Priya Patel', company: 'Microsoft', package: '₹28 LPA', role: 'Data Scientist', year: '2025' },
    { name: 'Amit Kumar', company: 'Amazon', package: '₹25 LPA', role: 'Cloud Architect', year: '2025' },
    { name: 'Sneha Gupta', company: 'Meta', package: '₹30 LPA', role: 'Product Manager', year: '2025' },
    { name: 'Vikram Singh', company: 'Adobe', package: '₹22 LPA', role: 'UX Designer', year: '2025' },
    { name: 'Anjali Reddy', company: 'Salesforce', package: '₹24 LPA', role: 'Backend Developer', year: '2025' },
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
            Placement Records
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Our students are consistently placed in top-tier global companies with industry-leading compensation packages.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-24">
          {statistics.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-blue-50 rounded-3xl text-center border border-blue-100"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-sm">
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Top Recruiters</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 items-center">
            {topRecruiters.map((recruiter, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100 flex items-center justify-center"
              >
                <img src={recruiter.logo} alt={recruiter.name} className="max-h-8 object-contain" referrerPolicy="no-referrer" />
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Recent Placements (Class of 2025)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPlacements.map((placement, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-8 bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{placement.name}</h3>
                    <p className="text-sm text-gray-500">{placement.role}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Company</p>
                    <p className="font-bold text-blue-600">{placement.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Package</p>
                    <p className="font-bold text-gray-900">{placement.package}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default Placements;
