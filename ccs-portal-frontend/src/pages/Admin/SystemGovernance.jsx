import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Globe, Save, Phone, Mail, MapPin, Layout as LayoutIcon, Loader2, Sparkles, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/adminService';

const SystemGovernance = () => {
  const { profile } = useAuth();
  const [content, setContent] = useState({
    universityName: 'IILM University',
    tagline: 'Empowering Future Leaders',
    about: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    placementStats: {
      highestPackage: '18 LPA',
      averagePackage: '6.5 LPA',
      placementRate: '95%'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await adminService.getSettings();
        if (res.success && res.data.settings) {
          // Merge with defaults to ensure all fields exist
          setContent(prev => ({
            ...prev,
            ...res.data.settings
          }));
        }
      } catch (error) {
        console.error("Error fetching system content:", error);
        toast.error("Failed to synchronize governance parameters");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminService.updateSettings(content);
      if (res.success) {
        toast.success("System configurations stabilized and persisted!");
      }
    } catch (error) {
      toast.error(error.message || "Credential modification failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Synchronizing Root Parameters...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Governance</h1>
            <p className="text-gray-500 mt-2 text-lg">Modify root branding, contact matrices, and organizational telemetry.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-10 py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 disabled:opacity-50 flex items-center gap-3"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Synchronizing...' : 'Persist Changes'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* General Information */}
            <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[60px] opacity-40 translate-x-1/2 -translate-y-1/2"></div>
              <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                   <Building2 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Corporate Identity</h2>
              </div>
              <div className="grid grid-cols-1 gap-8 relative z-10">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">University Name</label>
                  <input 
                    type="text" 
                    value={content.universityName}
                    onChange={(e) => setContent({ ...content, universityName: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    placeholder="Master Brand..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Corporate Tagline</label>
                  <input 
                    type="text" 
                    value={content.tagline}
                    onChange={(e) => setContent({ ...content, tagline: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    placeholder="Vision Statement..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Institutional Brief</label>
                  <textarea 
                    value={content.about}
                    onChange={(e) => setContent({ ...content, about: e.target.value })}
                    rows={5}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                    placeholder="Mission objective..."
                  />
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                   <Phone className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Access Matrices</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Gateway Email</label>
                  <input 
                    type="email" 
                    value={content.contactEmail}
                    onChange={(e) => setContent({ ...content, contactEmail: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Comm Line (Phone)</label>
                  <input 
                    type="text" 
                    value={content.contactPhone}
                    onChange={(e) => setContent({ ...content, contactPhone: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Geographic Coordinates (Address)</label>
                  <input 
                    type="text" 
                    value={content.address}
                    onChange={(e) => setContent({ ...content, address: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-10">
             {/* Placement Statistics */}
             <section className="bg-gray-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
               <div className="flex items-center gap-4 mb-10 relative z-10">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-blue-400 border border-white/20">
                     <LayoutIcon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">Performance KPI</h2>
               </div>
               <div className="space-y-10 relative z-10">
                 <div>
                   <label className="block text-[10px] font-black text-blue-300 uppercase tracking-widest mb-3">Peak Remuneration</label>
                   <input 
                     type="text" 
                     value={content.placementStats?.highestPackage}
                     onChange={(e) => setContent({ ...content, placementStats: { ...content.placementStats, highestPackage: e.target.value } })}
                     className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all"
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-blue-300 uppercase tracking-widest mb-3">Median Remuneration</label>
                   <input 
                     type="text" 
                     value={content.placementStats?.averagePackage}
                     onChange={(e) => setContent({ ...content, placementStats: { ...content.placementStats, averagePackage: e.target.value } })}
                     className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all"
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-blue-300 uppercase tracking-widest mb-3">Success Coefficient (%)</label>
                   <input 
                     type="text" 
                     value={content.placementStats?.placementRate}
                     onChange={(e) => setContent({ ...content, placementStats: { ...content.placementStats, placementRate: e.target.value } })}
                     className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all"
                   />
                 </div>
               </div>
               <div className="mt-12 pt-8 border-t border-white/10 relative z-10 text-center">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center justify-center gap-2">
                     <Sparkles className="w-3 h-3" />
                     Broadcast Live Intelligence
                  </p>
               </div>
             </section>

             <section className="bg-blue-600 p-10 rounded-[48px] text-white shadow-xl shadow-blue-100">
                <Globe className="w-12 h-12 mb-8 opacity-40" />
                <h3 className="text-xl font-bold mb-4">Domain Authorization</h3>
                <p className="text-blue-100 text-xs font-medium leading-relaxed leading-relaxed mb-10">
                   By committing these changes, you are modifying the root identity of the portal across all nodes and endpoints.
                </p>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center gap-2">
                   <div className="w-2 h-2 bg-green-400 rounded-full" />
                   <span className="text-[10px] font-black uppercase tracking-widest">System Health: Optimal</span>
                </div>
             </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SystemGovernance;
