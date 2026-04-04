import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { CheckSquare, Search, Filter, Clock, ArrowRight, ShieldCheck, Loader2, Sparkles, Zap, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';
import testService from '../../services/testService';
import { toast } from 'sonner';

const MockTests = () => {
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch strictly public Practice Mock Tests as per institutional policy
        const res = await testService.getPublicTests();
        if (res.success) {
          setMockTests(res.data.tests || []);
        }
      } catch (error) {
        console.error("Error fetching practice simulations:", error);
        toast.error("Practice repository synchronization failed");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTests = mockTests.filter(test => 
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <Layout>
       <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">Synchronizing Practice Index...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16 bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 transition-all group-hover:scale-150 rounded-full blur-3xl -mr-16 -mt-16 opacity-30"></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
                  <BrainCircuit className="w-4 h-4" />
               </div>
               <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Self-Paced Training</h3>
            </div>
            <h1 className="text-5xl font-black text-gray-950 tracking-tightest leading-none">Practice Mock Tests</h1>
            <p className="text-gray-500 mt-4 text-sm font-medium max-w-xl">Master standardized simulations built by expert faculty architecture. Refine your competencies in a zero-stakes environment.</p>
          </div>

          <div className="flex items-center gap-4 px-8 py-4 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] shadow-sm relative">
             <Zap className="w-5 h-5 text-amber-500" />
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest leading-none mb-1">Adaptive Mode Active</span>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">Unlimited Attempts Available</span>
             </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-6 mb-16 px-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query specialized practice labs..."
              className="w-full pl-20 pr-8 py-6 bg-white border border-gray-100 rounded-[2.5rem] text-sm font-bold focus:outline-none focus:ring-4 ring-indigo-50/50 transition-all shadow-sm"
            />
          </div>
          <button className="px-12 py-6 bg-gray-950 text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-2xl">
            <Filter className="w-4 h-4 text-indigo-400" />
            Refine Repository
          </button>
        </div>

        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredTests.map((test) => (
              <div key={test._id} className="bg-white rounded-[4rem] border border-gray-50 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden flex flex-col h-full hover:-translate-y-3 p-2">
                <div className="p-10 flex flex-col h-full relative overflow-hidden bg-white rounded-[3.5rem]">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 -translate-y-1/2"></div>
                   
                  <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="w-16 h-16 bg-gray-50 rounded-[1.75rem] flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-12 duration-500">
                      <CheckSquare className="w-8 h-8" />
                    </div>
                    {test.isProctored ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        <ShieldCheck className="w-4 h-4" />
                        AI Guarded
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-100">
                        <Zap className="w-4 h-4" />
                        Self-Paced
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-950 mb-4 tracking-tightest group-hover:text-indigo-600 transition-colors uppercase leading-tight">{test.title}</h3>
                  <p className="text-sm text-gray-400 mb-10 font-medium leading-relaxed line-clamp-3">{test.description}</p>
                  
                  <div className="mt-auto space-y-10">
                      <div className="grid grid-cols-2 gap-4 pb-10 border-b border-gray-50">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Duration</span>
                            <div className="flex items-center gap-2 text-xs font-black text-gray-900">
                               <Clock className="w-4 h-4 text-indigo-500" />
                               {test.duration} MIN
                            </div>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Credential</span>
                            <div className="flex items-center gap-2 text-xs font-black text-gray-900">
                               <CheckSquare className="w-4 h-4 text-indigo-500" />
                               {test.maxMarks} MARKS
                            </div>
                         </div>
                      </div>

                      <Link 
                         to={`/student/mock-test/${test._id}`}
                         className="w-full py-6 bg-gray-950 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-4 shadow-2xl relative overflow-hidden group/btn active:scale-95"
                      >
                         <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
                         Initialize Practice Lab 
                         <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-3 transition-transform" />
                      </Link>
                  </div>
                </div>
                <div className="px-10 py-6 bg-gray-50/50 rounded-[3.5rem] flex items-center justify-between mt-2 border border-gray-100/50">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">#{test.category || 'Standard'} LAB</span>
                  <div className="flex items-center gap-2">
                     <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                     <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Adaptive Simulation</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-white rounded-[5rem] border-4 border-dashed border-gray-50 max-w-4xl mx-auto shadow-sm flex flex-col items-center">
            <div className="w-32 h-32 bg-indigo-50 rounded-[3rem] flex items-center justify-center text-indigo-300 mb-10 border border-indigo-100/50 shadow-inner">
               <BrainCircuit className="w-16 h-16" />
            </div>
            <h3 className="text-4xl font-black text-gray-950 mb-4 tracking-tightest uppercase">Practice Registry Empty</h3>
            <p className="text-gray-400 font-bold max-w-md mx-auto text-sm uppercase tracking-widest leading-loose">Expert data architecture is being synchronized. Please wait for the next pedagogical injection.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MockTests;
