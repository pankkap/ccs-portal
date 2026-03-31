import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Globe, Save, Phone, Mail, MapPin, Layout as LayoutIcon } from 'lucide-react';
import { toast } from 'sonner';

const SystemGovernance = () => {
  const { user } = useAuth();
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
        const docRef = doc(db, 'system', 'governance');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching system content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'system', 'governance'), content);
      toast.success("System governance updated successfully!");
    } catch (error) {
      console.error("Error saving system content:", error);
      toast.error("Failed to update system governance");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Governance</h1>
            <p className="text-gray-500 mt-2">Manage university information and portal settings.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </header>

        <div className="space-y-8">
          {/* General Information */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">University Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">University Name</label>
                <input 
                  type="text" 
                  value={content.universityName}
                  onChange={(e) => setContent({ ...content, universityName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tagline</label>
                <input 
                  type="text" 
                  value={content.tagline}
                  onChange={(e) => setContent({ ...content, tagline: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">About University</label>
                <textarea 
                  value={content.about}
                  onChange={(e) => setContent({ ...content, about: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Phone className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Email</label>
                <input 
                  type="email" 
                  value={content.contactEmail}
                  onChange={(e) => setContent({ ...content, contactEmail: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Phone</label>
                <input 
                  type="text" 
                  value={content.contactPhone}
                  onChange={(e) => setContent({ ...content, contactPhone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                <input 
                  type="text" 
                  value={content.address}
                  onChange={(e) => setContent({ ...content, address: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </section>

          {/* Placement Statistics */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <LayoutIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Placement Highlights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Highest Package</label>
                <input 
                  type="text" 
                  value={content.placementStats?.highestPackage}
                  onChange={(e) => setContent({ ...content, placementStats: { ...content.placementStats, highestPackage: e.target.value } })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Average Package</label>
                <input 
                  type="text" 
                  value={content.placementStats?.averagePackage}
                  onChange={(e) => setContent({ ...content, placementStats: { ...content.placementStats, averagePackage: e.target.value } })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Placement Rate</label>
                <input 
                  type="text" 
                  value={content.placementStats?.placementRate}
                  onChange={(e) => setContent({ ...content, placementStats: { ...content.placementStats, placementRate: e.target.value } })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default SystemGovernance;
