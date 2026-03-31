import React from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Award, Target, Users, ShieldCheck, Rocket, History, Quote, CheckCircle2, Globe, Briefcase } from 'lucide-react';

const About = () => {
  const values = [
    { icon: Target, title: 'Goal Oriented', desc: 'Focusing on measurable career outcomes for every student.' },
    { icon: Users, title: 'Student Centric', desc: 'Personalized guidance tailored to individual aspirations.' },
    { icon: ShieldCheck, title: 'Industry Standard', desc: 'Curriculum aligned with current market demands.' },
    { icon: Award, title: 'Excellence', desc: 'Committed to the highest standards of professional training.' },
  ];

  const journey = [
    { year: '2015', title: 'Foundation', desc: 'CCS was established with a vision to bridge the gap between academia and industry.' },
    { year: '2018', title: 'Expansion', desc: 'Launched our digital learning management system and expanded corporate partnerships.' },
    { year: '2021', title: 'Global Reach', desc: 'Started international placement drives and global certification programs.' },
    { year: '2024', title: 'Innovation Hub', desc: 'Integrated AI-driven career pathing and advanced mock assessment tools.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
        <div className="text-center mb-24">
          <motion.span 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-4 block"
          >
            Our Story
          </motion.span>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-tight"
          >
            Empowering Your Future <br /> <span className="text-blue-600">With Intelligence</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            The Center for Career Services (CCS) at IILM University is more than just a placement cell. We are a dedicated ecosystem designed to nurture talent and transform students into industry leaders.
          </motion.p>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="p-12 bg-gray-50 rounded-[3rem] border border-gray-100 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-200 transition-colors"></div>
            <Target className="w-12 h-12 text-blue-600 mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              To be a global leader in career services, recognized for our innovative approach to student development and our strong partnerships with industry leaders. We envision a world where every graduate is equipped with the skills and confidence to excel in their chosen field.
            </p>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="p-12 bg-blue-600 text-white rounded-[3rem] shadow-2xl shadow-blue-200 relative overflow-hidden group"
          >
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-3xl group-hover:bg-white/20 transition-colors"></div>
            <Rocket className="w-12 h-12 text-blue-100 mb-8" />
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-blue-50 leading-relaxed">
              To provide comprehensive career guidance, professional training, and industry exposure to students. We strive to bridge the gap between academic learning and professional excellence through personalized mentorship, advanced technology, and strategic corporate alliances.
            </p>
          </motion.div>
        </div>

        {/* Director's Message */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-blue-600 rounded-[3rem] rotate-3 -z-10 opacity-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000" 
              alt="Director" 
              className="rounded-[3rem] shadow-2xl w-full h-[600px] object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-8 left-8 right-8 p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20">
              <p className="text-gray-900 font-bold text-xl mb-1">Dr. Sarah Johnson</p>
              <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">Director, Career Services</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <Quote className="w-16 h-16 text-blue-100 mb-8" />
            <h2 className="text-4xl font-bold text-gray-900 mb-8">A Message from the Director</h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed italic">
              <p>
                "At CCS, we don't just help students find jobs; we help them build careers. Our philosophy is rooted in the belief that career development is a continuous journey of self-discovery and skill acquisition."
              </p>
              <p>
                "In today's rapidly evolving job market, technical skills alone are not enough. We focus on developing the whole individual—emotional intelligence, critical thinking, and professional ethics—to ensure our students are not just employable, but future-ready."
              </p>
              <p>
                "We invite you to explore the myriad opportunities at IILM University and join us in our mission to shape the leaders of tomorrow."
              </p>
            </div>
          </motion.div>
        </div>

        {/* Our Journey */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-gray-600">A decade of excellence in career development.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {journey.map((item, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-8 bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="text-4xl font-black text-blue-600/10 absolute top-4 right-4">{item.year}</div>
                <History className="w-8 h-8 text-blue-600 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Why Choose CCS? */}
        <div className="p-8 md:p-16 bg-gray-900 rounded-[2rem] md:rounded-[4rem] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/40 rounded-full -ml-48 -mb-48 blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-12 text-center">Why Choose CCS?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[
                { title: 'Global Network', desc: 'Access to 500+ global corporate partners and alumni network.', icon: Globe },
                { title: 'Personalized Coaching', desc: 'One-on-one mentorship with industry experts and career coaches.', icon: Users },
                { title: 'Advanced LMS', desc: 'State-of-the-art digital platform for learning and assessments.', icon: Rocket },
                { title: 'Industry Integration', desc: 'Regular guest lectures, workshops, and industry visits.', icon: Briefcase },
                { title: 'Proven Track Record', desc: 'Consistent 95%+ placement rate with top-tier companies.', icon: Award },
                { title: 'Skill Development', desc: 'Focus on both technical prowess and essential soft skills.', icon: CheckCircle2 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        {/* Strategic Partners */}
        <div className="mt-32 mb-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Strategic Partners</h2>
            <p className="text-gray-600">Collaborating with the best to provide the best opportunities.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-12 items-center opacity-40 grayscale hover:grayscale-0 transition-all">
            {[
              { name: 'Google', logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png' },
              { name: 'Microsoft', logo: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31' },
              { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
              { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
              { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
              { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
            ].map((partner, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-center p-4 hover:opacity-100 transition-opacity"
              >
                <img src={partner.logo} alt={partner.name} className="max-h-8 object-contain" referrerPolicy="no-referrer" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default About;
