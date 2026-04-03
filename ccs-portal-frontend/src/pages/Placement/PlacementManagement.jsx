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
  CircleX
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
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Placement Drive Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">Coordinate recruitment lifecycles and broadcast career opportunities globally.</p>
          </div>
          <button
            onClick={() => navigate('/placement/create')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-100 flex items-center gap-3 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Initialize New Drive
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
            {filteredDrives.map((drive) => (
              <div
                key={drive._id}
                className="group p-1 bg-gradient-to-br from-indigo-500/20 to-transparent dark:from-gray-800 dark:to-transparent rounded-[3rem] border border-gray-100 dark:border-gray-800 hover:border-indigo-600 transition-all shadow-sm hover:shadow-2xl relative"
              >
                <div className="bg-white dark:bg-gray-950 p-10 rounded-[2.8rem] h-full flex flex-col">
                  {/* Status Node */}
                  <div className="flex justify-between items-start mb-8">
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-tight flex items-center gap-2 ${drive.status === 'Open' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                      {drive.status === 'Open' ? <CircleCheck className="w-3 h-3" /> : <CircleX className="w-3 h-3" />}
                      {drive.status}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/placement/edit/${drive._id}`)}
                        className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(drive._id)}
                        className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all text-gray-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{drive.companyName}</h3>
                  <div className="flex items-center gap-2 mb-8">
                     <Briefcase className="w-4 h-4 text-gray-400" />
                     <p className="text-sm font-bold text-gray-500">{drive.role}</p>
                     <span className="w-1 h-1 bg-gray-200 dark:bg-gray-800 rounded-full"></span>
                     <p className="text-sm font-bold text-blue-600">{drive.companyType}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-10 border-t border-gray-50 dark:border-gray-900 pt-8">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {drive.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">CTC Package</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{drive.ctc || 'As per Industry'}</p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <button
                      onClick={() => navigate(`/placement/drive/${drive._id}`)}
                      className="w-full py-4 bg-gray-900 dark:bg-gray-800 text-white rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 shadow-lg hover:bg-blue-600 transition-all"
                    >
                      Management Hub
                      <ArrowRight className="w-4 h-4" />
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
