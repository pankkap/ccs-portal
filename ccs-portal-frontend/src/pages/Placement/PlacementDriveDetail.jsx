import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Layout } from '../../components/Layout';
import { 
  Users, 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  Search, 
  Mail, 
  GraduationCap, 
  Building2, 
  Calendar,
  Award,
  Loader2,
  FileText,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';

const PlacementDriveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDriveDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/placements/${id}`, { withCredentials: true });
        if (res.data.success) {
          setDrive(res.data.data.placement);
        }
      } catch (err) {
        toast.error("Failed to synchronize applicant registry");
      } finally {
        setLoading(false);
      }
    };
    fetchDriveDetails();
  }, [id]);

  const filteredApplicants = drive?.applicants?.filter(app => 
    app.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.studentId?.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Synchronizing Registry...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20">
        {/* Breadcrumbs & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/placement/manage')}
              className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-900 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{drive?.role}</h1>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                  Registry Active
                </span>
              </div>
              <p className="text-gray-500 font-medium text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4" /> {drive?.companyName} • Applicant Management Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 active:scale-95 whitespace-nowrap hide-print"
            >
              <Printer className="w-5 h-5" />
              Print Applicant
            </button>

            <div className="relative flex-1 md:w-64 group hide-print">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold placeholder:text-gray-300 outline-none focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Applicant Registry Table */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Roll No.</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Academic Context</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">CGPA</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApplicants.length > 0 ? (
                  filteredApplicants.map((app) => (
                    <tr key={app._id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="text-xs font-black text-gray-400 group-hover:text-gray-900 transition-colors tracking-tighter uppercase">
                          {app.studentId?.rollNo || 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 tracking-tight">{app.studentId?.name || app.studentName}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" /> Batch of {app.studentId?.year || 'TBD'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-xs font-bold text-gray-900 flex items-center gap-2">
                             <Building2 className="w-3 h-3 text-gray-300" />
                             {app.studentId?.department || 'General'}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-2">
                             <GraduationCap className="w-3 h-3 text-gray-300" />
                             {app.studentId?.college || 'IILM University'}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                           <Award className="w-3.5 h-3.5" />
                           <span className="text-xs font-black tracking-tighter">{app.studentId?.cgpa || '0.00'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          app.status === 'applied' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          app.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             app.status === 'applied' ? 'bg-blue-600' :
                             app.status === 'shortlisted' ? 'bg-emerald-600' :
                             'bg-gray-600'
                          }`}></div>
                          {app.status}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right hide-print">
                        {app.studentId?.resume || app.resume ? (
                          <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={() => window.open(app.studentId?.resume || app.resume, '_blank')}
                               className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-md group/dl"
                             >
                                <FileText className="w-4 h-4" />
                             </button>
                             <button
                               onClick={() => {
                                 const link = document.createElement('a');
                                 link.href = app.studentId?.resume || app.resume;
                                 link.download = `${app.studentId?.name || 'Student'}_CV.pdf`;
                                 link.click();
                               }}
                               className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md"
                             >
                                <Download className="w-4 h-4" />
                             </button>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-gray-300 uppercase tracking-widest italic">No Dossier</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4">
                           <Users className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No candidates found in this index.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Specific Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            .hide-print, 
            aside, 
            nav, 
            .Sonner, 
            #sidebar, 
            header button:first-child {
              display: none !important;
            }
            .max-w-7xl {
              max-width: 100% !important;
              padding: 0 !important;
            }
            .bg-white {
              border: none !important;
              box-shadow: none !important;
            }
            table {
              width: 100% !important;
            }
            body {
              background: white !important;
            }
            main {
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}} />
      </div>
    </Layout>
  );
};

export default PlacementDriveDetail;
