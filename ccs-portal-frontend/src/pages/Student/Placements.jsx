import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { 
  Building2, MapPin, Briefcase, Clock, Search, 
  ExternalLink, GraduationCap, ChevronRight, CheckCircle2,
  Filter, Calendar, Rocket, Info, Loader2, Target, Building, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import placementService from '../../services/placementService';

const StudentPlacements = () => {
  const { user, profile } = useAuth();
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const matchedRes = await placementService.getMatchedPlacements();
      
      if (matchedRes.success && matchedRes.data.placements?.length > 0) {
        setPlacements(matchedRes.data.placements);
      } else {
        const allRes = await placementService.getPlacements();
        if (allRes.success) {
          setPlacements(allRes.data.placements || []);
        }
      }
    } catch (error) {
      console.error("Error fetching institutional placement drives:", error);
      try {
        const allRes = await placementService.getPlacements();
        if (allRes.success) {
          setPlacements(allRes.data.placements || []);
        } else {
          toast.error("Failed to synchronize corporate repository");
        }
      } catch (fallbackError) {
        toast.error("Failed to synchronize corporate repository");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const filteredPlacements = placements.filter(p => 
    p.role.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Aggregating Career Opportunities...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Corporate Relations</h1>
            <p className="text-gray-500 mt-2 text-lg">Direct access to elite recruitment drives and internships.</p>
          </div>
          <div className="flex items-center gap-4 p-2 bg-blue-50 rounded-2xl border border-blue-100">
             <TrendingUp className="w-5 h-5 text-blue-600 ml-2" />
             <span className="text-xs font-bold text-blue-700 uppercase tracking-widest pr-4">12+ New Openings This Week</span>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Designation, Technology, or Corporate Brand..."
              className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[24px] text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm font-medium"
            />
          </div>
          <button className="px-8 py-5 bg-gray-900 text-white rounded-[24px] text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-gray-100">
            <Filter className="w-5 h-5" />
            Refine Results
          </button>
        </div>

        {filteredPlacements.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {filteredPlacements.map((job) => {
              const application = job.applicants?.find(a => a.studentId && profile?._id && a.studentId.toString() === profile._id.toString());
              return (
                <div key={job._id} className="bg-white p-10 rounded-[42px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 -translate-y-1/2"></div>
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-blue-600 shrink-0 border border-gray-50 shadow-inner">
                        <Building className="w-10 h-10" />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                             <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{job.role}</h3>
                             <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${job.status === 'Open' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                              {job.status === 'Open' ? 'Identity Verified' : 'Closed'}
                            </span>
                          </div>
                          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{job.companyName}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-8">
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                            <Clock className="w-4 h-4 text-blue-600" />
                            Posted: {new Date(job.postedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      {application ? (
                        <div className="flex-1 px-10 py-5 bg-green-50 text-green-600 rounded-[28px] text-[12px] font-black uppercase tracking-widest border border-green-100 flex items-center justify-center gap-3">
                          <CheckCircle2 className="w-5 h-5" />
                          Applied
                        </div>
                      ) : (
                        <Link 
                          to={`/student/placements/${job._id}`}
                          target="_blank"
                          className="flex-1 px-10 py-5 bg-blue-600 text-white rounded-[28px] text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 group/explore"
                        >
                          Explore the Opportunity
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {job.requirements && (
                    <div className="mt-10 pt-10 border-t border-gray-50">
                       <div className="flex flex-wrap gap-2">
                          {job.requirements.split(',').map((req, i) => (
                             <span key={i} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-gray-100">
                                {req.trim()}
                             </span>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-gray-100 max-w-4xl mx-auto shadow-sm">
            <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-600 mx-auto mb-8">
               <Briefcase className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Intelligence Pipeline Empty</h3>
            <p className="text-gray-400 font-medium max-w-md mx-auto text-lg leading-relaxed">No placement opportunities match your current filters. Broadcast your profile to remain in view of talent acquisition teams.</p>
          </div>
        )}
      </div>

    </Layout>
  );
};

export default StudentPlacements;
