import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  CheckSquare,
  Trash2, 
  Plus, 
  BrainCircuit, 
  ArrowRight,
  Eye,
  Save,
  MessageSquare,
  LayoutDashboard,
  Code2,
  ListChecks,
  ChevronDown,
  Command,
  Zap,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import aiService from '../../services/aiService';
import questionService from '../../services/questionService';
import { useNavigate } from 'react-router-dom';

const AIQuestionGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    domain: 'Technical Domain',
    topic: '',
    subtopic: '',
    difficulty: 'Medium',
    count: 5,
    type: 'MCQ (Single Ans)'
  });

  const domains = ['Aptitude Reasoning', 'Communication Verbal', 'Technical Domain'];
  const types = ['MCQ (Single Ans)', 'MCQ (Multiple Ans)', 'Fill in the Blank', 'Output Based', 'Subjective'];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.topic) return toast.error("Topic is required");

    setLoading(true);
    setQuestions([]);
    
    try {
      const res = await aiService.generateQuestions(formData);
      if (res.success) {
        const generated = res.data.questions;
        setQuestions(generated);
        
        // AUTO-SAVE to Bank as requested
        setSaving(true);
        let successCount = 0;
        for (const q of generated) {
          try {
            await questionService.createQuestion({
              ...q,
              domain: formData.domain,
              topic: formData.topic,
              subtopic: formData.subtopic,
              difficulty: formData.difficulty,
              type: formData.type,
              source: 'AI'
            });
            successCount++;
          } catch (err) {
            console.error("Save error:", err);
          }
        }
        setSaving(false);
        toast.success(`Generated & Saved ${successCount} questions to Bank!`);
      }
    } catch (error) {
      toast.error(error.message || "AI Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-12 border-b border-gray-100 pb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Intellect engine v2.5</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 font-sans tracking-tight">AI Generator</h1>
          </div>
          <div className="hidden md:flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Model</p>
                <p className="text-xs font-bold text-gray-900">Gemini 1.5 Flash</p>
             </div>
             <div className="w-px h-8 bg-gray-100"></div>
             <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                <div className="flex items-center gap-1.5 justify-end">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <p className="text-xs font-bold text-gray-900">Ready</p>
                </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Config Side - Slmmer & More Modern */}
          <div className="lg:col-span-3 lg:sticky lg:top-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Command className="w-3 h-3" />
                  Parameters
                </h3>
                
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Domain</label>
                    <div className="relative group">
                      <select 
                        value={formData.domain}
                        onChange={(e) => setFormData({...formData, domain: e.target.value})}
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold font-sans outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                      >
                        {domains.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Topic</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Hooks"
                      value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold font-sans outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Subtopic</label>
                    <input 
                      type="text" 
                      placeholder="Optional"
                      value={formData.subtopic}
                      onChange={(e) => setFormData({...formData, subtopic: e.target.value})}
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold font-sans outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Difficulty</label>
                      <select 
                        value={formData.difficulty}
                        onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-[11px] font-bold font-sans outline-none appearance-none cursor-pointer"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Count</label>
                      <input 
                        type="number" 
                        min="1" max="15"
                        value={formData.count}
                        onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})}
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-[11px] font-bold font-sans outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Question Type</h3>
                <div className="grid grid-cols-1 gap-2">
                  {types.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({...formData, type: t})}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border text-left flex items-center justify-between ${formData.type === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-gray-500 border-gray-50 hover:bg-gray-50'}`}
                    >
                      {t}
                      {formData.type === t && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleGenerate}
                  disabled={loading || saving}
                  className="w-full py-4 bg-[#0f172a] text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-xl shadow-gray-200"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Generate</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
                <div className="flex items-center gap-2 mt-4 px-2 text-gray-400">
                   <Info className="w-3 h-3" />
                   <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">Questions auto-saved to bank</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Side - Cleaner, Chat-style */}
          <div className="lg:col-span-9 bg-white rounded-[2rem] border border-gray-100 min-h-[600px] overflow-hidden flex flex-col shadow-sm">
            {questions.length > 0 ? (
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-indigo-600">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">{formData.topic} - Successful Generation</span>
                   </div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{questions.length} Items</p>
                </div>
                
                <div className="divide-y divide-gray-50">
                  {questions.map((q, index) => (
                    <div 
                      key={index}
                      className="p-10 hover:bg-gray-50/30 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                      <div className="max-w-4xl">
                        <div className="flex items-center gap-3 mb-6">
                           <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center text-[10px] font-black">{index + 1}</span>
                           <div className="w-px h-3 bg-gray-200"></div>
                           <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{formData.type}</span>
                        </div>

                        <div className="mb-8 pl-1">
                           {formData.type === 'Output Based' ? (
                             <div className="bg-[#1e1e1e] rounded-2xl p-6 mb-6 shadow-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-4 text-emerald-400/70 border-b border-white/5 pb-3">
                                   <Code2 className="w-4 h-4" />
                                   <span className="text-[10px] font-black tracking-widest uppercase font-mono">Input Snippet</span>
                                </div>
                                <pre className="text-emerald-400 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap">
                                   {q.questionText}
                                </pre>
                             </div>
                           ) : (
                             <h4 className="text-xl font-bold text-gray-900 leading-snug font-sans tracking-tight">{q.questionText}</h4>
                           )}
                        </div>
                        
                        {(formData.type.includes('MCQ') || formData.type === 'Output Based') && q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                            {q.options.map((opt, i) => {
                              const isCorrect = Array.isArray(q.correctAnswer) 
                                ? q.correctAnswer.includes(opt) 
                                : opt === q.correctAnswer;
                              return (
                                <div 
                                  key={i} 
                                  className={`p-4 rounded-xl border transition-all ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-100 text-gray-500'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 inline-flex items-center justify-center rounded-lg text-[10px] font-black ${isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-gray-100 text-gray-400'}`}>{String.fromCharCode(65 + i)}</span>
                                    <span className="text-xs font-bold">{opt}</span>
                                    {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-600" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Answers for non-MCQ layout */}
                        {!formData.type.includes('MCQ') && formData.type !== 'Output Based' && (
                          <div className="bg-emerald-50 rounded-2xl p-6 mb-6 border border-emerald-100">
                               <div className="flex items-center gap-2 mb-3">
                                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Model Answer</span>
                               </div>
                               <p className="text-sm text-emerald-900 font-bold leading-relaxed">{q.correctAnswer}</p>
                          </div>
                        )}

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100/50">
                          <div className="flex items-center gap-2 mb-3">
                            <Info className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] font-sans">AI Logic Explanation</span>
                          </div>
                          <p className="text-xs text-gray-500/80 font-medium font-sans leading-relaxed italic">{q.explanation || "System logic analysis completed."}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8 animate-pulse shadow-inner">
                  <Sparkles className="w-10 h-10 text-indigo-200" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">AI Assistant Ready</h3>
                <p className="text-gray-400 max-w-sm mx-auto text-sm font-medium leading-relaxed mb-10">
                  Fill in the parameters on the left to start a new intelligent generation session.
                </p>
                <div className="flex gap-10">
                   <div className="text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Response</p>
                      <p className="text-xs font-bold text-gray-900">&lt; 2.0s</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Precision</p>
                      <p className="text-xs font-bold text-gray-900">High</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Language</p>
                      <p className="text-xs font-bold text-gray-900">Multimodal</p>
                   </div>
                </div>
              </div>
            )}
            
            <div className="p-8 border-t border-gray-50 bg-gray-50/20 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                     <BrainCircuit className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Powered by DeepMind Gemini</p>
               </div>
               <button 
                 onClick={() => navigate('/faculty/question-bank')}
                 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  View full bank
                  <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIQuestionGenerator;
