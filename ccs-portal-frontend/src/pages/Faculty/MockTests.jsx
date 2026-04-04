import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { 
  Plus, 
  Search, 
  Award, 
  Clock, 
  Target, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Loader2,
  FileText,
  Users,
  Calendar,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Layers,
  GraduationCap,
  Library
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import testService from '../../services/testService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const MockTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('practice'); // 'practice' | 'curriculum'
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await testService.getMyTests();
      if (res.success) {
        setTests(res.data.tests);
      }
    } catch (error) {
      toast.error("Failed to load assessments dossier");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent Deletion: Are you sure you want to remove this blueprint?")) return;
    try {
      await testService.deleteTest(id);
      setTests(tests.filter(t => t._id !== id));
      toast.success("Assessment blueprint purged successfully");
    } catch (error) {
      toast.error("Purge operation failed");
    }
  };

  const filteredTests = tests.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.category.toLowerCase().includes(search.toLowerCase());
    // Segregation Logic: practice vs curriculum
    const matchesTab = activeTab === 'practice' ? (t.testType === 'practice' || !t.testType) : t.testType === 'curriculum';
    return matchesSearch && matchesTab;
  });

  const stats = {
    practice: tests.filter(t => t.testType === 'practice' || !t.testType).length,
    curriculum: tests.filter(t => t.testType === 'curriculum').length,
    totalQuestions: tests.reduce((acc, t) => acc + (t.questions?.length || 0), 0)
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Award className="w-5 h-5" />
               </div>
               <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Faculty Governance</h3>
            </div>
            <h1 className="text-5xl font-black text-gray-950 tracking-tightest leading-none">Institutional Assessments</h1>
            <p className="text-gray-400 font-medium max-w-2xl leading-relaxed">
              Orchestrate specialized evaluation blueprints. Both practice labs and curriculum mandatory audits contribute to the centralized <span className="text-indigo-600 font-bold underline decoration-indigo-200">Question Bank</span>.
            </p>
          </div>
          <div className="flex shrink-0">
             <button 
                onClick={() => navigate(`/faculty/test-builder?type=${activeTab}`)}
                className="flex items-center gap-4 px-10 py-5 bg-gray-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl hover:scale-105 active:scale-95 group"
              >
                <Plus className="w-5 h-5 text-indigo-400 group-hover:rotate-90 transition-transform" />
                Initialize New Build
              </button>
          </div>
        </header>

        {/* Dynamic Segregation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b border-gray-100 pb-8">
           <div className="flex bg-gray-100/50 p-1.5 rounded-[2rem] gap-1 shrink-0 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('practice')}
                className={cn(
                  "px-8 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap",
                  activeTab === 'practice' 
                    ? "bg-white text-gray-950 shadow-xl shadow-gray-200/50 scale-100" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                )}
              >
                 <Zap className={cn("w-4 h-4", activeTab === 'practice' ? "text-amber-500" : "text-gray-300")} />
                 Practice Mock Test
                 <span className={cn("ml-2 px-2 py-0.5 rounded-full text-[9px]", activeTab === 'practice' ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-500")}>
                    {stats.practice}
                 </span>
              </button>
              <button 
                onClick={() => setActiveTab('curriculum')}
                className={cn(
                  "px-8 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap",
                  activeTab === 'curriculum' 
                    ? "bg-white text-gray-950 shadow-xl shadow-gray-200/50 scale-100" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                )}
              >
                 <ShieldCheck className={cn("w-4 h-4", activeTab === 'curriculum' ? "text-indigo-600" : "text-gray-300")} />
                 Curriculum Assessment
                 <span className={cn("ml-2 px-2 py-0.5 rounded-full text-[9px]", activeTab === 'curriculum' ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-500")}>
                    {stats.curriculum}
                 </span>
              </button>
           </div>

           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 pointer-events-none" />
              <input 
                type="text" 
                placeholder={`Search ${activeTab === 'practice' ? 'Mock Tests' : 'Assessments'}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-3xl text-xs font-bold font-sans outline-none focus:border-indigo-500 transition-all shadow-sm"
              />
           </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 animate-pulse">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] animate-pulse">Syncing institutional blueprints</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="py-32 text-center bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-200 border-spacing-8">
             <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-gray-50">
                {activeTab === 'practice' ? <Library className="w-10 h-10 text-gray-200" /> : <GraduationCap className="w-10 h-10 text-gray-200" />}
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-2">Registry Incomplete</h3>
             <p className="text-gray-400 text-sm font-bold max-w-xs mx-auto mb-12">
               No blueprints found in the current <span className="text-gray-900 border-b-2 border-indigo-200">{activeTab}</span> spectrum. Initialize a build to populate the repository.
             </p>
             <button 
               onClick={() => navigate('/faculty/test-builder')}
               className="px-12 py-5 bg-gray-950 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
             >
                Initial Architectural Phase
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredTests.map((test) => (
              <div 
                key={test._id}
                className="group bg-white rounded-[3.5rem] p-10 border border-gray-50 hover:border-indigo-100 hover:shadow-[0_40px_80px_-20px_rgba(30,41,59,0.08)] transition-all relative overflow-hidden flex flex-col h-full"
              >
                <div className="absolute top-0 right-0 p-10 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                   <button 
                     onClick={() => navigate(`/faculty/test-builder/${test._id}`)}
                     className="p-4 bg-gray-950 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-2xl"
                   >
                      <Edit2 className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => handleDelete(test._id)}
                     className="p-4 bg-white text-rose-500 border border-rose-50 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>

                <div className="mb-8 flex flex-wrap items-center gap-3">
                   <span className="px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {test.category}
                   </span>
                   {test.isProctored && (
                     <span className="flex items-center gap-2 px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        AI Verified
                     </span>
                   )}
                   {test.testType === 'curriculum' && (
                     <span className="px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] bg-blue-950 text-blue-400">
                        Institutional Asset
                     </span>
                   )}
                </div>

                <div className="mb-auto">
                  <h4 className="text-3xl font-black text-gray-950 leading-[1.1] tracking-tightest group-hover:text-indigo-600 transition-colors uppercase mb-4">
                    {test.title}
                  </h4>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed line-clamp-2 pr-12">
                     {test.description || "Experimental analysis blueprint designed for high-competency verification."}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-gray-50">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Duration</p>
                      <div className="flex items-center gap-2">
                         <Clock className="w-4 h-4 text-gray-900" />
                         <span className="text-sm font-black text-gray-900 tracking-tighter">{test.duration} min</span>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Question Bank</p>
                      <div className="flex items-center gap-2">
                         <Layers className="w-4 h-4 text-gray-900" />
                         <span className="text-sm font-black text-gray-900 tracking-tighter">{test.questions?.length || 0} items</span>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Threshold</p>
                      <div className="flex items-center gap-2">
                         <Target className="w-4 h-4 text-gray-900" />
                         <span className="text-sm font-black text-gray-900 tracking-tighter">{test.passingScore || 70}%</span>
                      </div>
                   </div>
                </div>

                <div className="mt-10 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                         <Calendar className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none">Modified</p>
                         <p className="text-xs font-black text-gray-900 mt-1">{new Date(test.updatedAt || test.createdAt).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => navigate(`/faculty/test-builder/${test._id}`)}
                        className="px-8 py-4 bg-gray-50 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-2"
                      >
                         Architect <ChevronRight className="w-3.5 h-3.5" />
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

export default MockTests;
