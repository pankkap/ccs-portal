import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Users, BookOpen, Briefcase, MessageSquare, Database, ArrowRight, ShieldCheck, UserPlus, Loader2, Sparkles, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    placements: 0,
    enrollments: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res.success) {
          const { statistics, recentActivities } = res.data;
          setStats({
            users: statistics.users.total,
            courses: statistics.courses,
            placements: statistics.placements,
            enrollments: statistics.enrollments
          });
          setRecentUsers(recentActivities.users || []);
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        toast.error("Failed to synchronize system telemetry");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Identities', value: stats.users, icon: Users, color: 'blue' },
    { label: 'Curriculum Assets', value: stats.courses, icon: BookOpen, color: 'green' },
    { label: 'Career Pipelines', value: stats.placements, icon: Briefcase, color: 'purple' },
    { label: 'Active Learnings', value: stats.enrollments, icon: Activity, color: 'orange' },
  ];

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Aggregating System Intelligence...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Executive Intelligence</h1>
            <p className="text-gray-500 mt-2 text-lg">Central control hub for {profile?.name}. Monitoring real-time system performance.</p>
          </div>
          <div className="flex items-center gap-4 p-2 bg-blue-50 rounded-2xl border border-blue-100">
             <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse ml-2" />
             <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest pr-4">MERN Stack fully operational</span>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[38px] border border-gray-100 shadow-sm flex items-center gap-6 hover:shadow-xl transition-all border-b-4 border-b-transparent hover:border-b-blue-600 group">
              <div className={`w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-10 flex items-center gap-3">
                 <Sparkles className="w-6 h-6 text-blue-600" />
                 Operational Commands
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Faculty Registry', desc: 'Manage institutional experts and profile order.', path: '/admin/faculty', icon: Users, color: 'blue' },
                  { label: 'Curriculum Ops', desc: 'Oversee and publish multi-modal learning assets.', path: '/admin/courses', icon: BookOpen, color: 'green' },
                  { label: 'Placement Hub', desc: 'Broadcast career opportunities globally.', path: '/admin/jobs', icon: Briefcase, color: 'purple' },
                  { label: 'Identity Control', desc: 'Secure role-based access for all entities.', path: '/admin/users', icon: ShieldCheck, color: 'indigo' }
                ].map((action, i) => (
                  <Link 
                    key={i} 
                    to={action.path}
                    className="p-8 bg-gray-50/50 border border-gray-100 rounded-[32px] hover:border-blue-500 hover:bg-white hover:shadow-2xl transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full blur-[50px] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="flex items-center justify-between mb-6 relative z-10">
                      <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                    </div>
                    <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight relative z-10">{action.label}</h3>
                    <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed relative z-10">{action.desc}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-10 border-b border-gray-50 pb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent User Onboarding</h2>
                <Link to="/admin/users" className="text-sm font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest py-1 border-b-2 border-blue-100 hover:border-blue-600 transition-all">Directory View</Link>
              </div>
              
              {recentUsers.length > 0 ? (
                <div className="space-y-6">
                  {recentUsers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black shadow-lg">
                           {u.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">{u.name}</h4>
                          <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.role}
                        </span>
                        <span className="text-[10px] font-bold text-gray-300 uppercase">{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                  <p className="text-sm font-bold text-gray-300 tracking-widest uppercase">Registry feed standby</p>
                </div>
              )}
            </section>
          </div>

          {/* System Health / Info */}
          <div className="space-y-10">
            <section className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[48px] p-10 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
               <ShieldCheck className="w-12 h-12 mb-8 text-blue-200" />
               <h3 className="text-3xl font-black mb-4 tracking-tight leading-tight">Identity Governance</h3>
               <p className="text-blue-100 text-sm mb-10 leading-relaxed font-medium">
                 Enforce security protocols and manage role-based permission tiers for faculty, students, and officers.
               </p>
               <Link to="/admin/access-control" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-2xl">
                 Audit Access Control
               </Link>
            </section>

            <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-10">
              <h3 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-4">Activity Reports</h3>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-100"></div>
                    <span className="text-sm font-bold text-gray-500 tracking-tight uppercase">Certified Alumni</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-100"></div>
                    <span className="text-sm font-bold text-gray-500 tracking-tight uppercase">Live Enrollments</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900">{stats.enrollments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-100"></div>
                    <span className="text-sm font-bold text-gray-500 tracking-tight uppercase">Test Sessions</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900">0</span>
                </div>
              </div>
              <Link to="/admin/reports" className="w-full py-5 border-2 border-gray-100 text-gray-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 hover:border-blue-100 transition-all flex items-center justify-center gap-3">
                 Generate Data Audit
              </Link>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
