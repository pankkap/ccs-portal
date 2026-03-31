import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Briefcase, MapPin, Building2, Clock, Search, Filter, ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '../../lib/utils';

const Placements = () => {
  const { user, profile } = useAuth();
  const [placements, setPlacements] = useState([]);
  const [applications, setApplications] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const placementsSnap = await getDocs(collection(db, 'placements'));
        const placementsData = placementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlacements(placementsData);

        const appsQuery = query(collection(db, 'applications'), where('studentId', '==', user.uid));
        const appsSnap = await getDocs(appsQuery);
        const appsData = {};
        appsSnap.docs.forEach(doc => {
          const app = { id: doc.id, ...doc.data() };
          appsData[app.placementId] = app;
        });
        setApplications(appsData);
      } catch (error) {
        console.error("Error fetching placements data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleApply = async (placement) => {
    if (!user) return;

    try {
      const application = {
        placementId: placement.id,
        studentId: user.uid,
        studentName: profile?.name || 'Student',
        status: 'applied',
        appliedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'applications'), application);
      setApplications(prev => ({ ...prev, [placement.id]: { id: docRef.id, ...application } }));
      toast.success(`Successfully applied for ${placement.role} at ${placement.company}!`);
    } catch (error) {
      console.error("Application error:", error);
      toast.error("Failed to apply for job.");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Placement Portal</h1>
          <p className="text-gray-500 mt-2">Explore job openings and recruitment drives.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies or roles..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {placements.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {placements.map((job) => {
              const application = applications[job.id];
              return (
                <div key={job.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex gap-6">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Building2 className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{job.role}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${job.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {job.status === 'active' ? 'Applications Open' : 'Closed'}
                          </span>
                        </div>
                        <p className="text-gray-600 font-medium mb-4">{job.company}</p>
                        
                        <div className="flex flex-wrap gap-6">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <MapPin className="w-4 h-4 text-gray-300" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <Clock className="w-4 h-4 text-gray-300" />
                            Posted: {formatDate(job.postedAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {application ? (
                        <div className="px-6 py-3 bg-green-50 text-green-700 rounded-xl font-bold text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Applied ({application.status})
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleApply(job)}
                          disabled={job.status !== 'active'}
                          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                        >
                          Apply Now
                        </button>
                      )}
                      <button className="px-8 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                        View Details <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {job.employabilityGuide && (
                    <div className="mt-8 pt-8 border-t border-gray-50">
                      <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <p className="text-sm font-medium text-blue-800">
                            <strong>Employability Guide:</strong> {job.employabilityGuide}
                          </p>
                        </div>
                        <button className="text-xs font-bold text-blue-600 hover:underline flex-shrink-0">Download Guide</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No placement opportunities</h3>
            <p className="text-gray-500">Check back later for new job listings.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Placements;
