import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MapPin,
  Briefcase,
  Calendar,
  ExternalLink,
  Trash2,
  Edit3,
  ArrowRight,
  TrendingUp,
  Globe,
  MoreVertical,
  CircleCheck,
  CircleX,
  User,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import placementService from '../../services/placementService';
import { Layout } from '../../components/Layout';

const PlacementManagement = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const res = await placementService.getAllPlacements();
      if (res.success) {
        setDrives(res.data.placements);
      }
    } catch (err) {
      toast.error("Failed to load drives");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this drive?")) return;
    try {
      const res = await placementService.deleteDrive(id);
      if (res.success) {
        toast.success("Drive removed successfully");
        fetchDrives();
      }
    } catch (err) {
      toast.error("Failed to delete drive");
    }
  };

  const filteredDrives = drives.filter(d =>
    d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto min-h-full font-sans">
        {/* Header Architecture */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage Job Openings</h1>
            <p className="text-gray-500 mt-2 text-base font-medium">Add and manage job listings for students.</p>
          </div>
          <button
            onClick={() => navigate('/placement/create')}
            className="px-6 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Job
          </button>
        </div>

        {/* Filter Node */}
        <div className="relative mb-16">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search drives by company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-20 pr-10 py-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-gray-300 shadow-sm"
          />
        </div>

        {/* Drive Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-tight">Optimizing Drive Cache...</p>
          </div>
        ) : filteredDrives.length === 0 ? (
          <div className="py-32 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[3rem]">
            <Briefcase className="w-20 h-20 text-gray-100 dark:text-gray-800 mx-auto mb-6" />
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-700 uppercase tracking-tight">No Active Placement Architectures Found</p>
          </div>
        ) : (
          <div className="space-y-4 pb-20 max-w-5xl mx-auto">
            {filteredDrives.map((drive) => (
              <div
                key={drive._id}
                className="group flex flex-col md:flex-row items-center gap-6 p-6 bg-white border border-gray-200 rounded-[2rem] hover:border-blue-500 hover:shadow-xl transition-all relative"
              >
                {/* Left: Icon */}
                <div className="w-16 h-16 bg-[#f5f3ff] rounded-2xl flex items-center justify-center shrink-0">
                  <Briefcase className="w-7 h-7 text-[#8b5cf6]" />
                </div>

                {/* Center: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-black text-gray-900 truncate tracking-tight">{drive.role}</h3>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${drive.status === 'Open' ? 'bg-[#10b981] text-white' : 'bg-rose-500 text-white'}`}>
                      {drive.status}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 font-bold uppercase tracking-widest text-[11px]">
                    <span className="hover:text-gray-900 transition-colors uppercase">{drive.companyName}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="hover:text-gray-900 transition-colors capitalize">{drive.companyType}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="hover:text-gray-900 transition-colors">{drive.location}</span>
                  </div>
                </div>

                {/* Right: Meta & Stats */}
                <div className="flex items-center gap-8">
                  {/* Action Hub */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/placement/drive/${drive._id}`)}
                      className="px-5 py-2.5 bg-[#8b5cf6] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7c3aed] transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
                    >
                      <Users className="w-4 h-4" />
                      Applicant Details
                    </button>
                    <button
                      onClick={() => navigate(`/placement/progress/${drive._id}`)}
                      className="px-5 py-2.5 bg-gray-50 text-gray-500 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 hover:text-gray-900 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Drive Progress
                    </button>
                  </div>

                  {/* Applicant Avatar Stack (Counter) */}
                  <div className="flex -space-x-3 items-center mr-2">
                    <div className="w-9 h-9 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                      +{drive.applicants?.length || 0}
                    </div>
                  </div>

                  {/* Quick Actions (Admin Control) */}
                  <div className="flex items-center gap-2 border-l border-gray-100 pl-6">
                    <button
                      onClick={() => navigate(`/placement/edit/${drive._id}`)}
                      className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(drive._id)}
                      className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PlacementManagement;
