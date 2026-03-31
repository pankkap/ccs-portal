import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  MapPin, 
  Phone, 
  Mail 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0a1128] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        <div>
          <h3 className="text-xl font-bold mb-6">Center for Career Services</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Empowering students with skills, opportunities, and the confidence to succeed in a global career landscape.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all"><Linkedin className="w-4 h-4" /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all"><Instagram className="w-4 h-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-6">Quick Links</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/trainings" className="hover:text-white transition-colors">Training Programs</Link></li>
            <li><Link to="/faculty" className="hover:text-white transition-colors">Our Faculty</Link></li>
            <li><Link to="/placements" className="hover:text-white transition-colors">Placement Records</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6">Programs</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><Link to="/trainings" className="hover:text-white transition-colors">Soft Skills Training</Link></li>
            <li><Link to="/trainings" className="hover:text-white transition-colors">Aptitude Development</Link></li>
            <li><Link to="/trainings" className="hover:text-white transition-colors">Technical Workshops</Link></li>
            <li><Link to="/trainings" className="hover:text-white transition-colors">Interview Preparation</Link></li>
            <li><Link to="/trainings" className="hover:text-white transition-colors">Industry Bootcamps</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6">Contact Us</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li className="flex gap-3">
              <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span>123 University Campus, Academic Block B, Tech City, CA 90210</span>
            </li>
            <li className="flex gap-3">
              <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex gap-3">
              <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span>careers@university.edu</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs">
        <p>© 2026 Center for Career Services. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
