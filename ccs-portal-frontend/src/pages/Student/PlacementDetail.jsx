import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { 
  Building2, MapPin, Briefcase, Clock, Calendar, 
  ExternalLink, ArrowLeft, CheckCircle2, ChevronRight, 
  ShieldCheck, Target, Award, Rocket, FileText, Loader2, Zap, DollarSign, Layers, Globe, GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import placementService from '../../services/placementService';
import JobApplicationModal from '../../components/Student/JobApplicationModal';
import SkillUpdateModal from '../../components/Student/SkillUpdateModal';

const StudentPlacementDetail = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [placement, setPlacement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);

  const fetchPlacementData = async () => {
    try {
      const res = await placementService.getPlacementById(id);
      if (res.success) {
        setPlacement(res.data.placement);
      }
    } catch (error) {
      toast.error("Drive details currently unavailable in this sector.");
      navigate('/student/placements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacementData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Retrieving Opportunity Intelligence...</p>
        </div>
      </Layout>
    );
  }

  if (!placement) return null;

  const application = placement.applicants?.find(a => a.studentId && profile?._id && a.studentId.toString() === profile._id.toString());
  const isClosed = placement.status === 'Closed';

  return (
    <Layout shadowHeader={true}>
      <div className="max-w-7xl mx-auto pb-24 px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-4 mb-8">
          <Link to="/student/placements" className="p-3 bg-white border border-gray-100 rounded-full hover:bg-gray-50 transition-all shadow-sm group">
            <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <span className="text-gray-400">Recruitment</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-blue-600">Career Opportunity Details</span>
          </div>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Left Content */}
          <div className="flex-1 space-y-10">
            {/* Massive Header Hero */}
            <div className="bg-white p-10 md:p-14 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"></div>
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -mr-[250px] -mt-[250px] opacity-70 group-hover:scale-110 transition-transform duration-1000"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                <div className="w-28 h-28 bg-white rounded-[32px] flex items-center justify-center text-blue-600 shrink-0 border border-gray-100 shadow-xl shadow-blue-900/5">
                  <Building2 className="w-12 h-12" />
                </div>
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap items-center gap-4">
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight uppercase leading-none">{placement.role}</h1>
                    {application ? (
                      <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-black uppercase tracking-widest border border-green-200 flex items-center gap-2 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Application Submitted
                      </span>
                    ) : isClosed ? (
                      <span className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest border border-red-100 flex items-center gap-2 shadow-sm">
                        Closed
                      </span>
                    ) : (
                      <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2 shadow-sm">
                        Verification Active
                      </span>
                    )}
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-gray-500 uppercase tracking-widest">{placement.companyName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-14 relative z-10">
                <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Remuneration</p>
                  </div>
                  <p className="text-lg font-black text-gray-900">{placement.ctc || 'As per norms'}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                  </div>
                  <p className="text-lg font-black text-gray-900">{placement.location}</p>
                </div>
                 <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-purple-500" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sector</p>
                  </div>
                  <p className="text-lg font-black text-gray-900">{placement.companyType}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deadline</p>
                  </div>
                  <p className="text-lg font-black text-blue-600">{placement.deadline ? new Date(placement.deadline).toLocaleDateString() : 'Rolling'}</p>
                </div>
              </div>
            </div>

            {/* Core Job Description */}
            <section className="bg-white p-10 md:p-14 rounded-[40px] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 pointer-events-none" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Scope of Responsibility</h2>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-600 leading-relaxed text-[17px] whitespace-pre-wrap font-medium">
                  {placement.jobDescription}
                </p>
              </div>

              {placement.skills && placement.skills.length > 0 && (
                <div className="mt-12 pt-10 border-t border-gray-50">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Technical Competencies Matrix</h3>
                  <div className="flex flex-wrap gap-2">
                    {placement.skills.map((skill, index) => (
                      <span key={index} className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold uppercase tracking-widest border border-blue-100 transition-colors">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

          </div>

          {/* Sticky Right Sidebar */}
          <div className="lg:w-[420px] shrink-0 space-y-8">
            
            {/* Sticky Action Card */}
            <div className="sticky top-24 space-y-8">
              <div className="bg-gray-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 border border-gray-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/30 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                        <Zap className="w-5 h-5 text-yellow-400" />
                      </div>
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Opportunity Gateway</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10">
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                      <span className="text-gray-400 text-sm font-bold">Role Access</span>
                      <span className="text-white text-sm font-black uppercase tracking-widest">{isClosed ? 'Closed' : 'Active'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                      <span className="text-gray-400 text-sm font-bold">Eligibility</span>
                      <span className="text-white text-sm font-black uppercase tracking-widest text-right max-w-[200px] truncate">{placement.eligibility || 'Standard Criteria'}</span>
                    </div>
                    {placement.companyLink && (
                      <div className="pt-2">
                        <a href={placement.companyLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-blue-300 transition-colors bg-white/5 py-3 px-4 rounded-xl w-fit">
                          <ExternalLink className="w-4 h-4" /> Internal Insight link
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {application ? (
                      <div className="w-full px-8 py-5 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col items-center justify-center gap-2 backdrop-blur-md">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        <p className="font-black uppercase tracking-widest text-[11px] text-green-100">Application Synchronized</p>
                      </div>
                    ) : isClosed ? (
                      <div className="w-full px-8 py-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center justify-center gap-2 backdrop-blur-md">
                        <p className="font-black uppercase tracking-widest text-[11px] text-red-200">Drive is Closed</p>
                      </div>
                    ) : (
                      <>
                         <button 
                            onClick={() => setShowApplyModal(true)}
                            className="w-full px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 group"
                          >
                            <Rocket className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                            Launch Application
                          </button>
                      </>
                    )}
                    
                    {!application && !isClosed && (
                      <button 
                        onClick={() => setIsSkillModalOpen(true)}
                        className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 backdrop-blur-md"
                      >
                        <Target className="w-4 h-4 text-blue-300" />
                        Verify Skill Alignments Prior
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirement & Selection Process Card */}
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Selection Journey
                </h3>
                <div className="pl-8 relative border-l-2 border-gray-100 space-y-8">
                  {(placement.recruitmentProcess || '1. Resume Screening\n2. Aptitude Test\n3. Interview').split('\n').map((step, idx) => {
                    const cleanStep = step.replace(/^\d+\.\s*/, '').trim();
                    if(!cleanStep) return null;
                    return (
                      <div key={idx} className="relative">
                        <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[39px] shadow-[0_0_0_4px_white]"></div>
                        <p className="text-gray-700 font-bold text-sm">{cleanStep}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <SkillUpdateModal 
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        onApply={() => {
           toast.success("Profile Architecture Synchronized");
           fetchPlacementData();
        }}
      />

      <JobApplicationModal 
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        job={placement}
        onSuccess={() => {
           fetchPlacementData();
        }}
      />
    </Layout>
  );
};

export default StudentPlacementDetail;
