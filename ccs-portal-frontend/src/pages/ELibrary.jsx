import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Video, 
  Music, 
  Link as LinkIcon, 
  Download, 
  ExternalLink, 
  User as UserIcon,
  Filter,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import elibraryService from '../services/elibraryService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ELibrary = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const types = ['All', 'PDF', 'Video', 'Audio', 'Doc', 'Link'];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await elibraryService.getAllResources();
      if (res.success) {
        setResources(res.data.resources);
      }
    } catch (error) {
      toast.error("Failed to load e-library");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'PDF': return <FileText className="w-5 h-5 text-red-500" />;
      case 'Audio': return <Music className="w-5 h-5 text-purple-500" />;
      case 'Video': return <Video className="w-5 h-5 text-blue-500" />;
      case 'Doc': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'Link': return <LinkIcon className="w-5 h-5 text-green-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.facultyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || res.type === selectedType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if ((a.order || 0) !== (b.order || 0)) {
      return (a.order || 0) - (b.order || 0);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-[#0f172a] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Digital E-Library</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Access a curated collection of educational resources, research papers, and technical documentation shared by our expert faculty.
          </p>
          
          <div className="max-w-3xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6 transition-colors group-focus-within:text-blue-500" />
            <input 
              type="text" 
              placeholder="Search by topic, keyword, or faculty name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-white/5 border border-white/10 rounded-[2rem] text-lg text-white focus:outline-none focus:bg-white focus:text-gray-900 transition-all shadow-2xl focus:ring-4 focus:ring-blue-600/20"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 overflow-visible">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16 bg-white p-3 rounded-full shadow-xl border border-gray-100 max-w-fit mx-auto relative z-10 overflow-hidden">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                selectedType === type 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Archiving resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100">
              <BookOpen className="w-12 h-12 text-gray-200" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">No resources found</h2>
            <p className="text-gray-500 mt-2">Try adjusting your search query or filter to find what you're looking for.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedType('All'); }}
              className="mt-8 text-blue-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <div 
                key={resource._id} 
                className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full overflow-hidden"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors animate-in zoom-in duration-500">
                    {getTypeIcon(resource.type)}
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-3 py-1 border border-gray-100 rounded-lg">
                    {resource.type}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                  {resource.title}
                </h3>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-auto line-clamp-3">
                  {resource.description || 'Access expert-curated content designed to enhance your learning experience in this specific subject area.'}
                </p>

                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold ring-4 ring-blue-50">
                      {resource.facultyName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">Shared By</p>
                      <p className="text-xs font-bold text-gray-900 leading-none">{resource.facultyName}</p>
                    </div>
                  </div>

                  <a 
                    href={resource.contentUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-gray-900 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-200"
                    title="Open Resource"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <section className="bg-white py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#6367FF] rounded-[4rem] p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            
            <div className="relative z-10 max-w-xl text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">Need specific learning materials?</h2>
              <p className="text-blue-100 text-lg md:text-xl font-medium mb-10 leading-relaxed">
                Connect with your course instructors to request additional resources or detailed documentation for your ongoing subjects.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl flex items-center gap-3">
                  Request Resource
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="relative z-10 flex-shrink-0 animate-bounce duration-[3000ms]">
               <div className="bg-white/20 p-8 rounded-[3rem] backdrop-blur-md border border-white/30 shadow-2xl">
                 <BookOpen className="w-24 h-24 text-white" />
               </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ELibrary;
