import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Clock, ShieldCheck, AlertTriangle, CheckCircle2, 
  ArrowRight, Loader2, ShieldAlert, Camera 
} from 'lucide-react';
import { toast } from 'sonner';
import testService from '../services/testService';
import enrollmentService from '../services/enrollmentService';

const TestOverlay = ({ testId, enrollmentId, moduleId, onComplete, onClose }) => {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('intro'); // 'intro', 'test', 'result'
  
  // Test State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await testService.getTestById(testId);
        if (res.success) {
          setTest(res.data.test);
          setTimeLeft(res.data.test.duration * 60);
        }
      } catch (err) {
        toast.error("Test Blueprint failure");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  // Timer logic
  useEffect(() => {
    if (step !== 'test' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await enrollmentService.submitAssessmentResult(enrollmentId, {
        testId,
        answers,
        moduleId
      });
      if (res.success) {
        setResult(res.data);
        setStep('result');
      }
    } catch (err) {
      toast.error(err.message || "Result transmission failure");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-12">
       <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Architecting Examination Environment...</p>
    </div>
  );

  if (!test) return null;

  return (
    <div className="fixed inset-0 bg-gray-950 z-[100] flex flex-col font-sans animate-in fade-in duration-500">
      {/* Test Header */}
      <header className="h-24 bg-gray-900 border-b border-white/5 flex items-center justify-between px-10 md:px-20 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black shadow-2xl shadow-blue-900/40">
            CCS
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1 max-w-xs">{test.title}</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
              {step === 'test' ? `Item ${currentIdx + 1} of ${test.questions.length}` : 'Governance Session Active'}
            </p>
          </div>
        </div>

        {step === 'test' && (
          <div className={`flex items-center gap-4 px-8 py-3 rounded-2xl border transition-all ${timeLeft < 300 ? 'bg-rose-500 text-white border-rose-400 animate-pulse' : 'bg-white/5 border-white/10 text-white'}`}>
             <Clock className="w-5 h-5 opacity-40" />
             <span className="font-mono font-black text-2xl tracking-tighter">{formatTime(timeLeft)}</span>
          </div>
        )}

        <button 
          onClick={step === 'test' ? () => { if(window.confirm("Abort? Progress will clear.")) onClose(); } : onClose}
          className="p-4 hover:bg-white/5 rounded-2xl transition-all text-gray-500 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 lg:p-24">
        {step === 'intro' && (
           <div className="max-w-2xl mx-auto py-12 animate-in slide-in-from-bottom-10 duration-700">
              <div className="text-center mb-12">
                 <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-blue-600/20 shadow-inner">
                    <ShieldCheck className="w-10 h-10 text-blue-500" />
                 </div>
                 <h1 className="text-5xl font-black text-white mb-4 tracking-tightest">Institutional Audit</h1>
                 <p className="text-gray-500 text-lg font-medium leading-relaxed">
                   Verify your phase alignment through this standardized competency evaluation. 
                   Ensure your proctoring environment is optimized.
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-12">
                 <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-sm text-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Requirement</p>
                    <p className="text-3xl font-black text-white">70% <span className="text-[10px] opacity-40">Min</span></p>
                 </div>
                 <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-sm text-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Questions</p>
                    <p className="text-3xl font-black text-white">{test.questions.length}</p>
                 </div>
              </div>

              <button 
                onClick={() => setStep('test')}
                className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20"
              >
                Launch Assessment Session
              </button>
           </div>
        )}

        {step === 'test' && (
           <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
              <div className="space-y-8">
                 <div className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-2xl shadow-blue-900/40 shrink-0">
                       {currentIdx + 1}
                    </div>
                    <h3 className="text-3xl font-black text-white leading-tight tracking-tight pt-2">
                       {test.questions[currentIdx].questionText}
                    </h3>
                 </div>

                 <div className="grid grid-cols-1 gap-4 pt-4">
                    {test.questions[currentIdx].options.map((opt, i) => (
                       <button
                         key={i}
                         onClick={() => setAnswers({...answers, [test.questions[currentIdx]._id]: opt})}
                         className={`p-8 text-left rounded-[2rem] border-2 transition-all group flex items-center justify-between ${
                            answers[test.questions[currentIdx]._id] === opt
                              ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-600/20'
                              : 'bg-white/5 border-white/5 text-gray-400 hover:border-blue-600/50 hover:bg-blue-600/5'
                         }`}
                       >
                         <span className="text-lg font-black">{opt}</span>
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                            answers[test.questions[currentIdx]._id] === opt ? 'bg-white shadow-lg' : 'bg-white/5 group-hover:bg-blue-600/20'
                         }`}>
                            <div className={`w-3 h-3 rounded-full ${answers[test.questions[currentIdx]._id] === opt ? 'bg-blue-600 animate-pulse' : 'bg-transparent'}`} />
                         </div>
                       </button>
                    ))}
                 </div>
              </div>

              <div className="pt-12 border-t border-white/5 flex items-center justify-between">
                 <button 
                  onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                  disabled={currentIdx === 0}
                  className="px-8 py-4 text-gray-500 hover:text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-10 transition-all"
                 >
                    Previous Item
                 </button>
                 
                 {currentIdx === test.questions.length - 1 ? (
                    <button 
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-12 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/40 flex items-center gap-3 disabled:opacity-50"
                    >
                       {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                       Finalize Submission
                    </button>
                 ) : (
                    <button 
                      onClick={() => setCurrentIdx(currentIdx + 1)}
                      className="px-12 py-5 bg-white text-gray-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl flex items-center gap-3 active:scale-95"
                    >
                       Continue <ArrowRight className="w-5 h-5" />
                    </button>
                 )}
              </div>
           </div>
        )}

        {step === 'result' && (
           <div className="max-w-2xl mx-auto py-12 text-center animate-in zoom-in-95 duration-700">
              {result?.passed ? (
                 <div className="w-32 h-32 bg-emerald-500/10 rounded-[3rem] flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="w-16 h-16" />
                 </div>
              ) : (
                 <div className="w-32 h-32 bg-rose-500/10 rounded-[3rem] flex items-center justify-center mx-auto mb-10 border border-rose-500/20 shadow-2xl shadow-rose-500/10 text-rose-500">
                    <AlertTriangle className="w-16 h-16" />
                 </div>
              )}

              <h2 className="text-6xl font-black text-white mb-2 tracking-tightest">
                 {result?.passed ? 'Passed Audit' : 'Incomplete'}
              </h2>
              <p className="text-[10px] font-black tracking-[0.5em] text-gray-600 uppercase mb-12">Session Identifier: {result?.score}% SCORE</p>
              
              <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 mb-12 space-y-6">
                 <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-sm mx-auto">
                    {result?.passed 
                      ? 'Congratulations. Your competency benchmarks have been successfully synchronized with the institutional registry.'
                      : `Threshold not achieved. You have ${result?.attemptsRemaining} attempts decentralized to your profile before lockout.`}
                 </p>
              </div>

              <div className="flex flex-col gap-4">
                 <button 
                  onClick={onComplete}
                  className={`w-full py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all shadow-2xl ${result?.passed ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-950 hover:bg-gray-100'}`}
                 >
                    {result?.passed ? 'Proceed to Curriculum' : 'Review Phase Material'}
                 </button>
                 {!result?.passed && result?.attemptsRemaining > 0 && (
                    <button 
                      onClick={() => { setStep('intro'); setAnswers({}); setCurrentIdx(0); }}
                      className="px-8 py-4 text-gray-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      Initialize Retake Session
                    </button>
                 )}
              </div>
           </div>
        )}
      </main>

      <footer className="h-20 bg-gray-900 border-t border-white/5 flex items-center justify-center px-10 gap-4">
         <ShieldAlert className="w-4 h-4 text-rose-500" />
         <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            AI Monitoring Enabled • Data Encryption Protocol Beta-9 • Session Governance Active
         </p>
      </footer>
    </div>
  );
};

export default TestOverlay;
