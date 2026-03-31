import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Briefcase, Users, CheckCircle, Clock, Plus, ArrowRight, Edit3, Trash2, MapPin, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/utils';

const PlacementDashboard = () => {
  const { user, profile } = useAuth();
  const [placements, setPlacements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const placementsSnap = await getDocs(collection(db, 'placements'));
        const placementsData = placementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlacements(placementsData);

        const applicationsSnap = await getDocs(collection(db, 'applications'));
        setApplications(applicationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching placement dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: 'Job Openings', value: placements.length, icon: Briefcase, color: 'blue' },
    { label: 'Total Applications', value: applications.length, icon: Users, color: 'green' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, icon: CheckCircle, color: 'purple' },
    { label: 'Pending Review', value: applications.filter(a => a.status === 'applied').length, icon: Clock, color: 'orange' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Placement Portal</h1>
            <p className="text-gray-500 mt-2">Welcome, {profile?.name}! Manage job drives and recruitment.</p>
          </div>
          <Link to="/placement/jobs/new" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <Plus className="w-5 h-5" />
            Add New Job
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Active Job Openings */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Active Job Openings</h2>
                <Link to="/placement/jobs" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {placements.length > 0 ? (
                <div className="space-y-4">
                  {placements.map((job) => (
                    <div key={job.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                            <Building2 className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{job.role}</h3>
                            <p className="text-sm font-medium text-gray-600">{job.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Posted: {formatDate(job.postedAt)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${job.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {job.status === 'active' ? 'Applications Open' : 'Closed'}
                          </span>
                        </div>
                        <Link 
                          to={`/placement/jobs/${job.id}/applications`}
                          className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          View Applications <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 p-12 rounded-3xl text-center">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No job openings posted</h3>
                  <p className="text-gray-500 mb-6">Start by posting your first job opening for students.</p>
                  <Link to="/placement/jobs/new" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                    Post Job
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Recent Applications Sidebar */}
          <div className="space-y-8">
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
                <Link to="/placement/applications" className="text-xs font-bold text-blue-600 hover:text-blue-700">View All</Link>
              </div>
              
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="p-4 border border-gray-50 rounded-xl hover:bg-gray-50 transition-colors">
                      <h4 className="text-sm font-bold text-gray-900">{app.studentName}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Applied for {app.placementId}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          app.status === 'applied' ? 'bg-blue-50 text-blue-700' :
                          app.status === 'shortlisted' ? 'bg-green-50 text-green-700' :
                          app.status === 'rejected' ? 'bg-red-50 text-red-700' :
                          'bg-purple-50 text-purple-700'
                        }`}>
                          {app.status}
                        </span>
                        <span className="text-[10px] text-gray-400">{formatDate(app.appliedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No applications yet.</p>
                </div>
              )}
            </section>

            <section className="bg-gray-900 rounded-3xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Employability Guides</h3>
              <p className="text-gray-400 text-sm mb-6">
                Distribute preparation resources and guides to help students secure employment.
              </p>
              <button className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
                Manage Guides
              </button>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlacementDashboard;
