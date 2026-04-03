import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { CheckSquare, Search, Filter, Clock, ArrowRight, ShieldCheck, Loader2, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import assessmentService from '../../services/assessmentService';
import { toast } from 'sonner';

const MockTests = () => {
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await assessmentService.getAllTests();
        if (res.success) {
          setMockTests(res.data.tests || []);
        }
      } catch (error) {
        console.error("Error fetching mock simulations:", error);
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
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Synchronizing Intelligence Index...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Intelligence Quotient</h1>
            <p className="text-gray-500 mt-2 text-lg">Master standardized simulations built by expert faculty architecture.</p>
          </div>
          <div className="flex items-center gap-4 px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-sm">
             <Zap className="w-5 h-5 text-indigo-600" />
             <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">Adaptive Simulation Mode Active</span>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-blue-600 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query specialized simulations..."
              className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[24px] text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm font-medium"
            />
          </div>
          <button className="px-8 py-5 bg-gray-900 text-white rounded-[24px] text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-gray-1).">
            <Filter className="w-5 h-5" />
            Refine Grid
          </button>
        </div>

        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredTests.map((test) => (
              <div key={test._id} className="bg-white rounded-[42px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 group overflow-hidden flex flex-col h-full hover:-translate-y-2">
                <div className="p-10 flex flex-col h-full pt-12 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 -translate-y-1/2"></div>
                   
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                      <CheckSquare className="w-8 h-8" />
                    </div>
                    {test.isProctored && (
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                        <ShieldCheck className="w-4 h-4" />
                        AI Verified
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight group-hover:text-blue-600 transition-colors uppercase leading-tight">{test.title}</h3>
                  <p className="text-sm text-gray-400 mb-10 font-medium leading-relaxed line-clamp-3">{test.description}</p>
                  
                  <div className="mt-auto space-y-8">
                      <div className="flex items-center gap-8 pt-8 border-t border-gray-50">
                         <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Clock className="w-4 h-4 text-blue-500" />
                            {test.duration} Minutes
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <CheckSquare className="w-4 h-4 text-blue-500" />
                            {test.maxMarks} Marks
                         </div>
                      </div>

                      <Link 
                         to={`/student/mock-test/${test._id}`}
                         className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl group/btn"
                      >
                         Initialize Practice 
                         <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                      </Link>
                  </div>
                </div>
                <div className="px-10 py-5 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{test.category || 'Standard'} Assessment</span>
                  <div className="flex items-center gap-2">
                     <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                     <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Elite Simulation</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-gray-100 max-w-4xl mx-auto shadow-sm">
            <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-600 mx-auto mb-8">
               <CheckSquare className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Intelligence Standby</h3>
            <p className="text-gray-400 font-medium max-w-md mx-auto text-lg leading-relaxed">No mock simulations match your current parameters. We are synchronizing expert data architecture.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MockTests;
