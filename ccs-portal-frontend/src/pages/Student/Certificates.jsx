import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Award, Eye, Download, ShieldCheck, Loader2, Sparkles, Share2 } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import certificateService from '../../services/certificateService';
import { toast } from 'sonner';

const Certificates = () => {
  const { profile } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await certificateService.getCertificates();
        if (res.success) {
          setCertificates(res.data.certificates || []);
        }
      } catch (error) {
        console.error("Error fetching certificates:", error);
        toast.error("Failed to synchronize achievement vault");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Accessing Achievement Archival...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Verified Credentials</h1>
            <p className="text-gray-500 mt-2 text-lg">Your academic and professional achievements, permanently recorded.</p>
          </div>
          <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 shadow-sm">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-yellow-600 shadow-sm">
                <Award className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black text-yellow-800 uppercase tracking-widest">Global Ranking</p>
                <p className="text-sm font-black text-gray-900">Top 5% Performers</p>
             </div>
          </div>
        </header>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {certificates.map((cert) => (
              <div key={cert._id} className="bg-white rounded-[42px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden flex flex-col h-full border-b-8 border-b-blue-600/10 hover:border-b-blue-600">
                <div className="p-10 bg-gradient-to-br from-indigo-900 via-blue-900 to-black flex flex-col items-center justify-center text-center relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full blur-[100px] opacity-10 translate-y-1/2 -translate-x-1/2"></div>
                  
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[28px] flex items-center justify-center text-yellow-400 shadow-2xl mb-8 relative z-10 border border-white/20 group-hover:rotate-12 transition-transform">
                    <Award className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 relative z-10 uppercase tracking-tight leading-tight px-4">{cert.courseTitle}</h3>
                  <div className="px-4 py-1.5 bg-blue-500/20 backdrop-blur rounded-full relative z-10 flex items-center gap-2">
                     <Sparkles className="w-3 h-3 text-blue-300" />
                     <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest">Certified Expert</span>
                  </div>
                </div>
                
                <div className="p-10 flex-grow flex flex-col">
                  <div className="space-y-6 mb-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Credentialed To</span>
                      <span className="font-bold text-gray-900 text-sm">{cert.studentName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorization Date</span>
                      <span className="font-bold text-gray-900 text-sm">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Verification ID</span>
                      <span className="font-mono text-[10px] font-black text-blue-600 break-all bg-white px-2 py-1 rounded-lg border border-blue-50">{cert.certificateNumber}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    <button className="w-full py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-100 flex items-center justify-center gap-3">
                      <Eye className="w-4 h-4" />
                      Inspect Credential
                    </button>
                    <div className="flex gap-3">
                       <button className="flex-1 py-4 border-2 border-gray-50 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 hover:border-blue-100 transition-all flex items-center justify-center gap-3">
                          <Download className="w-4 h-4" />
                          Vault
                       </button>
                       <button className="p-4 border-2 border-gray-50 text-gray-400 rounded-2xl hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all">
                          <Share2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
                
                <div className="px-10 py-5 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Digital Audit Verified</span>
                  </div>
                  <img src="/iilm-logo-small.png" alt="IILM" className="h-4 grayscale hover:grayscale-0 transition-all cursor-crosshair" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-gray-100 max-w-4xl mx-auto shadow-sm">
            <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-600 mx-auto mb-8">
               <Award className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight">Achievement Vault Empty</h2>
            <p className="text-gray-400 font-medium max-w-md mx-auto text-lg leading-relaxed mb-10">Complete your professional curriculum modules and successfully pass the proctored assessments to unlock verified digital credentials.</p>
            <Link to="/student/courses" className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100">
               Explore Curriculum
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Certificates;
