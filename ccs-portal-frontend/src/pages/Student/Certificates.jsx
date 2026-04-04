import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Award, Eye, Download, ShieldCheck, Loader2, Sparkles, Share2, X } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import certificateService from '../../services/certificateService';
import { toast } from 'sonner';

const Certificates = () => {
  const certificateRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const downloadCertificate = async (cert) => {
    const captureId = `certificate-capture-${cert._id}`;
    const element = document.getElementById(captureId);
    
    if (!element) {
      toast.error("Asset orchestration domain missing");
      return;
    }
    
    try {
      setDownloading(true);
      toast.info("Preparing digital asset for archival...");
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${cert.studentName.replace(/\s+/g, '_')}_Certificate.pdf`);
      
      toast.success("Credential archived successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Asset archival failed. Error code: PDF-GEN-FAULT");
    } finally {
      setDownloading(false);
    }
  };

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
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {certificates.map((cert) => (
              <div key={cert._id} className="bg-white rounded-[42px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden flex flex-col h-full border-b-8 border-b-blue-600/10 hover:border-b-blue-600">
                <div className="h-64 bg-gray-900 overflow-hidden relative group shrink-0">
                  {cert.certificateTemplateId?.backgroundUrl ? (
                    <img 
                      src={cert.certificateTemplateId.backgroundUrl} 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                      alt="Template"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-black" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-10 flex flex-col justify-end">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[28px] flex items-center justify-center text-yellow-400 shadow-2xl mb-8 relative z-10 border border-white/20 group-hover:rotate-12 transition-transform">
                      <Award className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 relative z-10 uppercase tracking-tight leading-tight px-4 truncate w-full">{cert.courseTitle}</h3>
                    <div className="px-4 py-1.5 bg-blue-500/20 backdrop-blur rounded-full relative z-10 flex items-center gap-2 w-fit">
                       <Sparkles className="w-3 h-3 text-blue-300" />
                       <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest">Certified Expert</span>
                    </div>
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
                    <button 
                      onClick={() => { setSelectedCert(cert); setIsModalOpen(true); }}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-100 flex items-center justify-center gap-3"
                    >
                      <Eye className="w-4 h-4" />
                      Inspect Credential
                    </button>
                    <div className="flex gap-3">
                       <button 
                          onClick={() => downloadCertificate(cert)}
                          disabled={downloading}
                          className="flex-1 py-4 border-2 border-gray-50 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 hover:border-blue-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                           {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
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
                </div>
              </div>
            ))}
          </div>

          {/* Hidden Container for PDF Capture (Ensures download works from the card) */}
          <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none">
            {certificates.map(cert => (
              <div 
                key={`capture-${cert._id}`} 
                id={`certificate-capture-${cert._id}`}
                className="relative overflow-hidden"
                style={{ 
                  aspectRatio: '1.414/1', 
                  width: '1200px', 
                  height: '848px', 
                  backgroundColor: '#ffffff' 
                }}
              >
                {/* Background Layer */}
                {cert.certificateTemplateId?.backgroundUrl ? (
                  <img 
                    src={cert.certificateTemplateId.backgroundUrl} 
                    alt="Template Background"
                    className="absolute inset-0 w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #f5f3ff, #ffffff)', border: '20px solid rgba(49, 46, 129, 0.05)' }}>
                    <Award className="w-96 h-96 opacity-20" style={{ color: '#e5e7eb' }} />
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center">
                   <div className="space-y-4 mb-20">
                      <p className="text-sm font-black uppercase tracking-[0.4em]" style={{ color: '#9ca3af' }}>This is to certify that</p>
                      <h2 className="text-7xl font-black tracking-tightest leading-none font-serif" style={{ color: '#111827' }}>
                         {cert.studentName}
                      </h2>
                   </div>
                   <div className="space-y-6">
                      <p className="text-sm font-black uppercase tracking-[0.4em]" style={{ color: '#9ca3af' }}>has successfully fulfilled the curriculum for</p>
                      <h3 className="text-4xl font-black tracking-tight leading-tight px-20" style={{ color: '#1e3a8a' }}>
                         {cert.courseTitle}
                      </h3>
                   </div>
                   <div className="mt-24 w-full max-w-2xl pt-10 flex items-end justify-between px-20" style={{ borderTop: '1px solid rgba(243, 244, 246, 0.5)' }}>
                      <div className="text-left space-y-2">
                         <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9ca3af' }}>Date of Award</p>
                         <p className="text-lg font-black" style={{ color: '#111827' }}>{new Date(cert.issuedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right space-y-2">
                         <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9ca3af' }}>Verification Status</p>
                         <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: '#059669' }}>
                               <ShieldCheck className="w-5 h-5" />
                               Authenticated
                            </span>
                            <span className="text-[10px] font-black tracking-widest" style={{ color: '#2563eb' }}>ID: {cert.certificateNumber}</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            ))}
            </div>
          </>
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

        {/* Certificate Inspection Immersive Modal */}
        {isModalOpen && selectedCert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 overflow-hidden">
             <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-2xl" onClick={() => setIsModalOpen(false)}></div>
             
             <div className="relative z-10 w-full max-w-6xl flex flex-col items-center gap-10">
                {/* Visual Header Controls */}
                <div className="w-full flex items-center justify-between px-8 py-4 bg-white/5 backdrop-blur rounded-[2rem] border border-white/10">
                    <div className="flex items-center gap-4">
                       <ShieldCheck className="w-6 h-6 text-emerald-400" />
                       <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Verified Digital Asset • ID: {selectedCert.certificateNumber}</span>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="w-12 h-12 bg-white/10 hover:bg-white/20 transition-all rounded-2xl flex items-center justify-center text-white"
                    >
                       <X className="w-6 h-6" />
                    </button>
                </div>

                {/* The Certificate Canvas */}
                <div ref={certificateRef} className="relative w-full aspect-[1.414/1] bg-white shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden scale-in-center border-[20px] border-white/5 backdrop-blur-3xl rounded-[2.5rem]">
                   {/* Background Layer */}
                   {selectedCert.certificateTemplateId?.backgroundUrl ? (
                      <img 
                        src={selectedCert.certificateTemplateId.backgroundUrl} 
                        alt="Template Background"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                   ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center border-[20px] border-indigo-900/5">
                         <Award className="w-96 h-96 text-gray-200 opacity-20" />
                      </div>
                   )}

                   {/* Dynamic Overlays (Positioned relative to template) */}
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center select-none pointer-events-none">
                      {/* Institutional Header (Placeholder if not in template) */}
                      {!selectedCert.certificateTemplateId?.backgroundUrl && (
                        <div className="mb-20">
                           <h4 className="text-2xl font-black text-indigo-900 uppercase tracking-[0.5em] mb-4">Institutional Credential</h4>
                           <div className="w-24 h-1 bg-indigo-900/20 mx-auto"></div>
                        </div>
                      )}

                      <div className="space-y-4 mb-20">
                         <p className="text-sm font-black text-gray-400 uppercase tracking-[0.4em]">This is to certify that</p>
                         <h2 className="text-7xl font-black text-gray-900 tracking-tightest leading-none drop-shadow-sm font-serif">
                            {selectedCert.studentName}
                         </h2>
                      </div>

                      <div className="space-y-6">
                         <p className="text-sm font-black text-gray-400 uppercase tracking-[0.4em]">has successfully fulfilled the curriculum for</p>
                         <h3 className="text-4xl font-black text-blue-900 tracking-tight leading-tight px-20">
                            {selectedCert.courseTitle}
                         </h3>
                      </div>

                      <div className="mt-24 w-full max-w-2xl border-t border-gray-100/50 pt-10 flex items-end justify-between px-20">
                         <div className="text-left space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date of Award</p>
                            <p className="text-lg font-black text-gray-900">{new Date(selectedCert.issuedAt).toLocaleDateString()}</p>
                         </div>
                         <div className="text-right space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Status</p>
                            <div className="flex flex-col items-end gap-1">
                               <div className="flex items-center gap-2 text-emerald-600">
                                  <ShieldCheck className="w-5 h-5" />
                                  <span className="text-sm font-black uppercase tracking-widest">Authenticated</span>
                               </div>
                               <span className="text-[10px] font-black text-blue-600 tracking-widest bg-blue-50/50 px-3 py-1 rounded-full border border-blue-100">
                                  ID: {selectedCert.certificateNumber}
                               </span>
                            </div>
                         </div>
                      </div>

                      {/* Seal/ID Pin */}
                      <div className="absolute bottom-12 right-12 flex flex-col items-end opacity-40">
                         <div className="w-16 h-1 bg-gray-200 mb-2"></div>
                         <span className="text-[8px] font-mono font-black text-gray-400">{selectedCert.certificateNumber}</span>
                      </div>
                   </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-6">
                   <button 
                    onClick={() => downloadCertificate(selectedCert)}
                    disabled={downloading}
                    className="px-12 py-5 bg-white text-gray-950 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-50 transition-all flex items-center gap-4 disabled:opacity-50"
                   >
                      {downloading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : <Download className="w-5 h-5 text-blue-600" />}
                      Download HD PDF
                   </button>
                   <button className="px-12 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/40 hover:scale-105 transition-all flex items-center gap-4">
                      <Share2 className="w-5 h-5" />
                      Social Portability
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Certificates;
