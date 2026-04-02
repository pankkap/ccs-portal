import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Briefcase, MapPin, Building2, Clock, Search, Filter, ExternalLink, CheckCircle2, Loader2, Sparkles, Building, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import placementService from '../../services/placementService';

const StudentPlacements = () => {
  const { user, profile } = useAuth();
  const [placements, setPlacements] = useState([]);
  const [applications, setApplications] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const placementsRes = await placementService.getPlacements();
        setPlacements(placementsRes.success ? placementsRes.data.placements : []);

        // Note: For students, we might need an endpoint to get THEIR applications
        // or filter the general applications list if authorized.
        // Assuming the backend handles "my applications" if we hit a specific route
        // For now, let's assume getApplications returns all if admin, or my applications if student (standard MERN pattern)
        const appsRes = await placementService.getApplications();
        if (appsRes.success) {
          const appsData = {};
          appsRes.data.applications.forEach(app => {
            appsData[app.placementId._id || app.placementId] = app;
          });
          setApplications(appsData);
        }
      } catch (error) {
        console.error("Error fetching placements data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApply = async (placement) => {
    try {
      const res = await placementService.applyForJob({
        placementId: placement._id,
        resume: profile?.resume || '', // Use profile resume if available
        notes: 'Applied via student portal'
      });

      if (res.success) {
        setApplications(prev => ({ 
          ...prev, 
          [placement._id]: res.data.application 
        }));
        toast.success(`Application transmitted to ${placement.company} HR!`);
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit application");
    }
  };

  const filteredPlacements = placements.filter(p => 
    p.role.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.company.toLowerCase().includes(searchQuery.toLowerCase())
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
              const application = applications[job._id];
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
                             <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">{job.role}</h3>
                             <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${job.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                              {job.status === 'active' ? 'Intake Open' : 'Archived'}
                            </span>
                          </div>
                          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{job.company}</p>
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
                        <div className="px-8 py-4 bg-green-50 text-green-700 rounded-2xl font-black text-xs flex items-center gap-3 border border-green-100 uppercase tracking-widest">
                          <CheckCircle2 className="w-5 h-5" />
                          Authenticated ({application.status})
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleApply(job)}
                          disabled={job.status !== 'active'}
                          className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 disabled:opacity-50 uppercase tracking-widest"
                        >
                          Submit Dossier
                        </button>
                      )}
                      <button className="px-10 py-4 bg-white border border-gray-100 text-gray-900 rounded-2xl font-black text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-sm">
                        JD & Details <ExternalLink className="w-4 h-4" />
                      </button>
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
