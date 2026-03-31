import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Users, BookOpen, Briefcase, MessageSquare, Database, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/utils';
import { seedDatabase } from '../../services/seedService';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    placements: 0,
    messages: 0
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const coursesSnap = await getDocs(collection(db, 'courses'));
        const placementsSnap = await getDocs(collection(db, 'placements'));
        const messagesSnap = await getDocs(collection(db, 'contactMessages'));

        setStats({
          users: usersSnap.size,
          courses: coursesSnap.size,
          placements: placementsSnap.size,
          messages: messagesSnap.size
        });

        const recentMessagesQuery = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'), limit(5));
        const recentMessagesSnap = await getDocs(recentMessagesQuery);
        setRecentMessages(recentMessagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSeedData = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      await seedDatabase();
      toast.success("Database seeded successfully! Refreshing stats...");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to seed database.");
    } finally {
      setSeeding(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'blue' },
    { label: 'Active Courses', value: stats.courses, icon: BookOpen, color: 'green' },
    { label: 'Job Listings', value: stats.placements, icon: Briefcase, color: 'purple' },
    { label: 'Contact Messages', value: stats.messages, icon: MessageSquare, color: 'red' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">High-level monitoring of system health and user activity.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSeedData}
              disabled={seeding}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              {seeding ? 'Seeding...' : 'Seed Demo Data'}
            </button>
            <Link to="/admin/access-control" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
              <UserPlus className="w-4 h-4" />
              Add User
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat, i) => (
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
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Manage Faculty', desc: 'Add, edit, delete, and reorder faculty profiles.', path: '/admin/faculty', icon: Users },
                  { label: 'Manage Courses', desc: 'Create and organize courses in the LMS.', path: '/admin/courses', icon: BookOpen },
                  { label: 'Content Library', desc: 'Upload notes, videos, and presentations.', path: '/admin/e-library', icon: Database },
                  { label: 'Job Listings', desc: 'Post and manage placement opportunities.', path: '/admin/jobs', icon: Briefcase }
                ].map((action, i) => (
                  <Link 
                    key={i} 
                    to={action.path}
                    className="p-6 border border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <action.icon className="w-5 h-5" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-bold text-gray-900">{action.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Contact Messages</h2>
                <Link to="/admin/messages" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</Link>
              </div>
              
              {recentMessages.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentMessages.map((msg) => (
                    <div key={msg.id} className="py-4 flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{msg.name}</h4>
                        <p className="text-xs text-gray-500">{msg.email}</p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-1">{msg.message}</p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{formatDate(msg.createdAt)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-500">No messages yet.</p>
                </div>
              )}
            </section>
          </div>

          {/* System Health / Info */}
          <div className="space-y-8">
            <section className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
               <ShieldCheck className="w-10 h-10 mb-6" />
               <h3 className="text-xl font-bold mb-2">System Governance</h3>
               <p className="text-blue-100 text-sm mb-6">
                 Full control over faculty and placement officer accounts. Ensure role-based access and data security.
               </p>
               <Link to="/admin/access-control" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all">
                 Manage Access
               </Link>
            </section>

            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Student Reports</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Students Certified</span>
                  </div>
                  <span className="font-bold text-gray-900">124</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Active Enrollments</span>
                  </div>
                  <span className="font-bold text-gray-900">452</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Mock Test Participants</span>
                  </div>
                  <span className="font-bold text-gray-900">89</span>
                </div>
              </div>
              <Link to="/admin/reports" className="w-full mt-8 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                Download Full Report
              </Link>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
