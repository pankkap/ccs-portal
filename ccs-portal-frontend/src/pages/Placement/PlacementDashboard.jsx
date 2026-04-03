import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Briefcase, Users, CheckCircle, Clock, Plus, ArrowRight, Edit3, Trash2, MapPin, Building2, Loader2, Search, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import placementService from '../../services/placementService';
import { toast } from 'sonner';

const PlacementDashboard = () => {
  const { profile } = useAuth();
  const [placements, setPlacements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const placementsRes = await placementService.getAllPlacements();
      if (placementsRes.success) {
        setPlacements(placementsRes.data.placements || []);
      }

      const applicationsRes = await placementService.getApplications();
      if (applicationsRes.success) {
        setApplications(applicationsRes.data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching placement dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Broadcast Termination: Are you sure you want to delete this drive?")) return;
    try {
      const res = await placementService.deleteDrive(id);
      if (res.success) {
        toast.success("Drive decommissioned successfully");
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to delete drive");
    }
  };

  const stats = [
    { label: 'Active Drives', value: placements.filter(p => p.status === 'active' || p.status === 'Open').length, icon: Briefcase, color: 'blue' },
    { label: 'Applications', value: applications.length, icon: Users, color: 'green' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, icon: CheckCircle, color: 'purple' },
    { label: 'Pending', value: applications.filter(a => a.status === 'applied').length, icon: Clock, color: 'orange' },
  ];

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-bold tracking-tight text-sm">Synchronizing Career Intelligence...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Placement Intelligence</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Welcome back, {profile?.name}. Manage your active recruitment pipelines.</p>
          </div>
          <Link to="/placement/create" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Initialize New Drive
          </Link>
        </header>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6 hover:shadow-lg transition-all border-b-4 border-b-transparent hover:border-b-blue-500">
              <div className={`w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 tracking-tight"> {stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Career Pipelines</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search roles..." className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
                  </div>
                </div>
              </div>

              {placements.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {placements.map((job) => (
                    <div key={job._id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex gap-6">
                          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                            <Building2 className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">{job.role}</h3>
                            <p className="text-gray-500 font-bold text-sm mt-1">{job.company}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/placement/edit/${job._id}`)}
                            className="p-3 bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(job._id)}
                            className="p-3 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-6 my-8 pt-8 border-t border-gray-50">
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold tracking-tight">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold tracking-tight">
                          <Clock className="w-4 h-4" />
                          Posted: {new Date(job.postedAt).toLocaleDateString()}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${job.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                          {job.status === 'active' ? 'Applications Open' : 'Closed'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-300" />
                            </div>
                          ))}
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                            +{applications.filter(a => a.placementId?._id === job._id).length}
                          </div>
                        </div>
                        <Link
                          to={`/placement/jobs/${job._id}/applications`}
                          className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center gap-2"
                        >
                          Review Applications
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-100 p-20 rounded-[40px] text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                    <Briefcase className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">No active job drives</h3>
                  <p className="text-gray-400 mb-10 max-w-sm mx-auto font-medium">Launch your first recruitment campaign to connect our students with professional opportunities.</p>
                  <Link to="/placement/create" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                    Initialize New Drive
                  </Link>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-10">
            <section className="bg-white p-8 rounded-[38px] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
                <h3 className="text-xl font-bold text-gray-900">Live Intake</h3>
                <Link to="/placement/applications" className="text-xs font-bold text-blue-600 hover:text-blue-700 tracking-tight">Global Feed</Link>
              </div>

              {applications.length > 0 ? (
                <div className="space-y-6">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app._id} className="p-5 bg-gray-50/50 border border-gray-50 rounded-2xl hover:border-blue-100 transition-all group">
                      <h4 className="text-sm font-bold text-gray-900">{app.studentName}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Applying for {app.placementId?.role || 'Job opening'}</p>
                      <div className="flex items-center justify-between mt-5">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${app.status === 'applied' ? 'bg-blue-50 text-blue-600' :
                          app.status === 'shortlisted' ? 'bg-green-50 text-green-600' :
                            app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                              'bg-purple-100 text-purple-700'
                          }`}>
                          {app.status}
                        </span>
                        <span className="text-[10px] text-gray-300 font-bold">{new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Users className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                  <p className="text-sm text-gray-400 font-bold tracking-widest uppercase">Intake pipeline empty</p>
                </div>
              )}
            </section>

            <section className="bg-gradient-to-br from-indigo-900 to-black rounded-[40px] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <Filter className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">Advanced Filtering</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed font-medium">
                  Sort through thousands of student profiles based on CGPA, skills, and certifications.
                </p>
                <button className="w-full py-4 bg-white text-gray-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-2xl">
                  Candidate Search
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlacementDashboard;
