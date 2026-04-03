import React, { useEffect, useState, useRef } from 'react';
import { Layout } from '../../components/Layout';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Layers, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Save, 
  Loader2,
  X,
  PlusCircle,
  FileText,
  ShieldCheck,
  Video,
  Mic,
  Monitor,
  Command,
  ChevronDown,
  Info,
  Zap,
  Upload,
  BrainCircuit,
  Target,
  ListChecks,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Download,
  Terminal,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import questionService from '../../services/questionService';
import testService from '../../services/testService';
import aiService from '../../services/aiService';

const TestBuilder = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [fetchingTest, setFetchingTest] = useState(!!testId);
  const [saving, setSaving] = useState(false);
  
  // Test Global Config
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30, // Time Limit
    maxMarks: 100,
    isProctored: false,
    category: 'Technical Domain'
  });

  // Current Draft Questions
  const [draftQuestions, setDraftQuestions] = useState([]);
  
  // Selection Modes: 'bank' | 'ai' | 'import'
  const [mode, setMode] = useState('bank');

  // --- Bank Selection States ---
  const [bankQuestions, setBankQuestions] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('Technical Domain');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const [loadingBank, setLoadingBank] = useState(false);
  const [bankSearch, setBankSearch] = useState('');

  // --- AI Generation States ---
  const [aiConfig, setAiConfig] = useState({
    topic: '',
    subtopic: '',
    difficulty: 'Medium',
    count: 5,
    type: 'MCQ (Single Ans)'
  });
  const [generatingAi, setGeneratingAi] = useState(false);
  const [tempAiQuestions, setTempAiQuestions] = useState([]);

  // --- Mass Import & Manual Entry States ---
  const [importing, setImporting] = useState(false);
  const [tempImportQuestions, setTempImportQuestions] = useState([]);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [manualQuestion, setManualQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    type: 'MCQ (Single Ans)',
    difficulty: 'Medium',
    explanation: '',
    domain: selectedDomain,
    topic: selectedTopic,
    subtopic: ''
  });

  // Sync manual question defaults when domain/topic changes
  useEffect(() => {
    setManualQuestion(prev => ({
      ...prev,
      domain: selectedDomain,
      topic: selectedTopic
    }));
  }, [selectedDomain, selectedTopic]);

  const domains = ['Aptitude Reasoning', 'Communication Verbal', 'Technical Domain'];
  const testCategories = ['Aptitude Reasoning', 'Communication Verbal', 'Technical Domain'];
  const questionTypes = ['MCQ (Single Ans)', 'MCQ (Multiple Ans)', 'Fill in the Blank', 'Output Based', 'Subjective'];

  // --- Initialization ---
  useEffect(() => {
    if (testId) fetchTestDetails();
    fetchTopics(formData.category);
  }, [testId]);

  const fetchTestDetails = async () => {
    try {
      const res = await testService.getTestById(testId);
      if (res.success) {
        const test = res.data.test;
        setFormData({
          title: test.title,
          description: test.description || '',
          duration: test.duration,
          maxMarks: test.maxMarks || 100,
          isProctored: test.isProctored || false,
          category: test.category
        });
        setDraftQuestions(test.questions || []);
      }
    } catch (err) {
      toast.error("Failed to load test details");
    } finally {
      setFetchingTest(false);
    }
  };

  const fetchTopics = async (domain) => {
    try {
      const res = await questionService.getTopics(domain);
      if (res.success) setTopics(res.data.topics);
    } catch (err) {}
  };

  useEffect(() => {
    if (selectedDomain) fetchTopics(selectedDomain);
  }, [selectedDomain]);

  useEffect(() => {
    if (selectedTopic) fetchBankQuestions();
  }, [selectedTopic, selectedDomain]);

  const fetchBankQuestions = async () => {
    setLoadingBank(true);
    try {
      const res = await questionService.getBank({
        domain: selectedDomain,
        topic: selectedTopic,
        search: bankSearch
      });
      if (res.success) setBankQuestions(res.data.questions);
    } catch (err) {
      toast.error("Bank access error");
    } finally {
      setLoadingBank(false);
    }
  };

  // --- Handlers ---
  const toggleQuestion = (q) => {
    if (draftQuestions.find(item => item._id === q._id)) {
      setDraftQuestions(draftQuestions.filter(item => item._id !== q._id));
    } else {
      setDraftQuestions([...draftQuestions, q]);
    }
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiConfig.topic) return toast.error("AI Topic is required");
    
    setGeneratingAi(true);
    setTempAiQuestions([]);
    try {
      const res = await aiService.generateQuestions({
        ...aiConfig,
        domain: selectedDomain
      });
      if (res.success) {
        setTempAiQuestions(res.data.questions);
        toast.success(`AI generated ${res.data.questions.length} suggestions.`);
      }
    } catch (err) {
      toast.error("AI generation failed");
    } finally {
      setGeneratingAi(false);
    }
  };

  const addAiToDraft = async (q, index) => {
    try {
      const saved = await questionService.createQuestion({
        ...q,
        domain: selectedDomain,
        topic: aiConfig.topic,
        subtopic: aiConfig.subtopic,
        difficulty: aiConfig.difficulty,
        type: aiConfig.type,
        source: 'AI'
      });
      if (saved.success) {
        setDraftQuestions([...draftQuestions, saved.data.question]);
        setTempAiQuestions(tempAiQuestions.filter((_, i) => i !== index));
        toast.success("Added to test draft.");
        
        // Background sync bank
        fetchTopics(selectedDomain);
        if (aiConfig.topic === selectedTopic) {
           fetchBankQuestions();
        } else if (!selectedTopic) {
           setSelectedTopic(aiConfig.topic);
        }
      }
    } catch (err) {
      toast.error("Failed to save AI question");
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImporting(true);
    try {
      const res = await questionService.bulkUpload(file);
      if (res.success) {
        toast.success(`${res.data.count} questions imported to your Question Bank.`);
        fetchBankQuestions();
        setMode('bank');
      }
    } catch (err) {
      toast.error("Bulk upload failed");
    } finally {
      setImporting(false);
    }
  };

  const handleManualSave = async (e) => {
    e.preventDefault();
    if (!manualQuestion.questionText) return toast.error("Question text is required");
    
    setImporting(true);
    try {
      let res;
      if (isEditingBank && editQuestionId) {
        res = await questionService.updateQuestion(editQuestionId, manualQuestion);
      } else {
        res = await questionService.createQuestion({
          ...manualQuestion,
          source: 'Manual'
        });
      }

      if (res.success) {
        if (isEditingBank) {
          toast.success("Question updated successfully.");
          setMode('bank');
          fetchBankQuestions();
        } else {
          setDraftQuestions([...draftQuestions, res.data.question]);
          toast.success("Manual question added to test and bank.");
          
          // Background sync bank
          fetchTopics(selectedDomain);
          if (manualQuestion.topic === selectedTopic) {
             fetchBankQuestions();
          } else if (!selectedTopic) {
             setSelectedTopic(manualQuestion.topic);
          }
        }
        
        // Reset form
        setManualQuestion({ 
          ...manualQuestion, 
          questionText: '', 
          options: ['', '', '', ''], 
          correctAnswer: '', 
          explanation: '',
          subtopic: '' 
        });
        setIsEditingBank(false);
        setEditQuestionId(null);
      }
    } catch (err) {
      toast.error(isEditingBank ? "Failed to update question" : "Failed to add manual question");
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteFromBank = async (id, e) => {
    e.stopPropagation(); // Don't toggle addition to test
    if (!window.confirm("Are you sure you want to permanently delete this question from the bank?")) return;
    
    try {
       const res = await questionService.deleteQuestion(id);
       if (res.success) {
          toast.success("Question removed from bank.");
          fetchBankQuestions();
       }
    } catch (err) {
       toast.error("Failed to delete question");
    }
  };

  const handleEditFromBank = (q, e) => {
    e.stopPropagation();
    setManualQuestion({
      questionText: q.questionText,
      options: q.options || ['', '', '', ''],
      correctAnswer: q.correctAnswer || '',
      type: q.type,
      difficulty: q.difficulty,
      explanation: q.explanation || '',
      domain: q.domain,
      topic: q.topic,
      subtopic: q.subtopic || ''
    });
    setIsEditingBank(true);
    setEditQuestionId(q._id);
    setMode('manual');
  };

  const downloadTemplate = () => {
    const headers = [
      ['questionText', 'type', 'option1', 'option2', 'option3', 'option4', 'correctAnswer', 'explanation', 'domain', 'topic', 'subtopic', 'difficulty']
    ];
    const data = [
      ['What is React?', 'MCQ (Single Ans)', 'A Library', 'A Framework', 'A Tool', 'A Language', 'A Library', 'React is a UI library.', 'Technical Domain', 'React', 'Basics', 'Easy'],
      ['Which hooks are used for state?', 'MCQ (Multiple Ans)', 'useState', 'useEffect', 'useMemo', 'useContext', '["useState"]', 'useState is for state.', 'Technical Domain', 'React', 'Hooks', 'Medium']
    ];

    const instructions = [
      ['COLUMN GUIDE'],
      ['questionText', 'The actual question content.'],
      ['type', 'Must be one of: MCQ (Single Ans), MCQ (Multiple Ans), Fill in the Blank, Output Based, Subjective'],
      ['option1-4', 'Provide choices for MCQ types.'],
      ['correctAnswer', 'For Single MCQ: The text of the option. For Multi MCQ: ["Opt1", "Opt2"].'],
      ['domain', 'Must match: Aptitude Reasoning, Communication Verbal, or Technical Domain'],
      ['topic', 'Main categorization for the question bank.'],
      ['difficulty', 'Easy, Medium, or Hard'],
      [],
      ['TIPS'],
      ['1. MCQ (Multiple) requires the correctAnswer to be a JSON array ["Like", "This"].'],
      ['2. Subjective questions do not require options.'],
      ['3. Fill in the Blank requires the exact expected text in correctAnswer.']
    ];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...data]);
    const wsIns = XLSX.utils.aoa_to_sheet(instructions);
    
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.utils.book_append_sheet(wb, wsIns, "Instructions Guide");
    
    XLSX.writeFile(wb, "CCS_Assessment_Blueprint.xlsx");
    toast.success("Template with Guide downloaded!");
  };

  const handleFinalSave = async (e) => {
    e.preventDefault();
    if (!formData.title || draftQuestions.length === 0) {
      return toast.error("Title and at least one question required");
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        questions: draftQuestions.map(q => q._id)
      };
      const res = testId 
        ? await testService.updateTest(testId, payload)
        : await testService.createTest(payload);
        
      if (res.success) {
        toast.success(testId ? "Mock blueprint updated!" : "Mock blueprint created!");
        navigate('/faculty/mock-tests');
      }
    } catch (err) {
      toast.error(err.message || "Failed to save test");
    } finally {
      setSaving(false);
    }
  };

  if (fetchingTest) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Decoding Blueprint Data...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
        <header className="mb-10 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-8 transition-colors">
          <div className="flex items-center gap-6">
            <Link to="/faculty/mock-tests" className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-600 transition-all text-gray-400 hover:text-indigo-600">
               <ArrowLeft className="w-5 h-5 transition-transform" />
            </Link>
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tightest mb-1 transition-colors">{testId ? 'Modify Blueprint' : 'Architect New Test'}</h1>
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{testId ? `ID: ${testId}` : 'Unified Selection Workflow'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleFinalSave}
            disabled={saving || draftQuestions.length === 0}
            className="flex items-center gap-3 px-10 py-5 bg-[#0f172a] dark:bg-white text-white dark:text-gray-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-gray-100 transition-all shadow-2xl shadow-indigo-100 dark:shadow-indigo-900/10 disabled:opacity-30 group"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />}
            {testId ? 'Commit Changes' : 'Publish Mock Test'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Global Config */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
             <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                
                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                   <Command className="w-3 h-3" />
                   Core Parameters
                </h3>

                <div className="space-y-6 relative">
                   <div className="space-y-2">
                      <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Mock Title</label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-2xl px-5 py-4 text-xs font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 transition-all"
                        placeholder="e.g. Advanced React Assessment"
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Time Limit (Min)</label>
                        <input 
                          type="number" 
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                          className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-2xl px-5 py-4 text-xs font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 transition-all font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Max Marks</label>
                        <input 
                          type="number" 
                          value={formData.maxMarks}
                          onChange={(e) => setFormData({...formData, maxMarks: parseInt(e.target.value)})}
                          className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-2xl px-5 py-4 text-xs font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 transition-all font-mono"
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Domain Archive</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-2xl px-5 py-4 text-xs font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                      >
                         {testCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>

                   <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between transition-colors">
                       <div className="flex items-center gap-3">
                          <ShieldCheck className={`w-5 h-5 ${formData.isProctored ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-700'}`} />
                          <div>
                            <p className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">Proctoring</p>
                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-tighter">Webcam / Audio / Lockdown</p>
                          </div>
                       </div>
                       <button 
                        type="button"
                        onClick={() => setFormData({...formData, isProctored: !formData.isProctored})}
                        className={`w-12 h-6 rounded-full transition-all relative ${formData.isProctored ? 'bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40' : 'bg-gray-200 dark:bg-slate-700'}`}
                       >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isProctored ? 'left-7' : 'left-1'}`}></div>
                       </button>
                   </div>
                </div>
             </div>

             {/* Draft Reviewer */}
             <div className="bg-gray-900 dark:bg-slate-950 rounded-[2.5rem] p-10 text-white relative h-[500px] flex flex-col overflow-hidden transition-colors shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Blueprint Draft</h3>
                   <span className="text-xl font-black tracking-tight">{draftQuestions.length} <span className="text-[10px] text-white/40 font-bold ml-1 tracking-widest">ITEMS</span></span>
                </div>
                
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
                   {draftQuestions.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <PlusCircle className="w-8 h-8 text-white/10 mb-2" />
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-loose">No components added<br/>to blueprint</p>
                     </div>
                   ) : (
                     draftQuestions.map((q, idx) => (
                       <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-4 group relative hover:bg-white/10 transition-colors">
                          <span className="text-[10px] font-black text-indigo-400 mt-1">{String(idx + 1).padStart(2, '0')}</span>
                          <p className="text-[11px] font-bold line-clamp-2 text-white/80 leading-relaxed font-sans">{q.questionText}</p>
                          <button 
                            onClick={() => toggleQuestion(q)}
                            className="absolute -right-2 -top-2 w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-95"
                          >
                             <Trash2 className="w-3.5 h-3.5 text-white" />
                          </button>
                       </div>
                     ))
                   )}
                </div>
             </div>
          </div>

          {/* Right: Selection Workspace */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-sm min-h-[800px] flex flex-col overflow-hidden transition-colors">
             {/* Workspace Navigation */}
             <div className="flex items-center px-10 border-b border-gray-50 dark:border-slate-700 bg-gray-50/20 dark:bg-slate-900/20 transition-colors">
                <button 
                   onClick={() => setMode('ai')}
                   className={`px-6 py-8 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border-b-4 transition-all ${mode === 'ai' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'}`}
                >
                   <BrainCircuit className="w-4 h-4" />
                   AI Generated
                </button>
                <button 
                   onClick={() => setMode('upload')}
                   className={`px-6 py-8 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border-b-4 transition-all ${mode === 'upload' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'}`}
                >
                   <FileSpreadsheet className="w-4 h-4" />
                   Bulk Upload
                </button>
                <button 
                   onClick={() => setMode('manual')}
                   className={`px-6 py-8 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border-b-4 transition-all ${mode === 'manual' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'}`}
                >
                   <Terminal className="w-4 h-4" />
                   Manual Upload
                </button>
                <button 
                   onClick={() => setMode('bank')}
                   className={`px-6 py-8 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border-b-4 transition-all ${mode === 'bank' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'}`}
                >
                   <Layers className="w-4 h-4" />
                   Question Bank
                </button>
             </div>

             <div className="flex-1 p-10 overflow-auto no-scrollbar">
                {mode === 'bank' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest ml-1">Domain</label>
                           <select 
                             value={selectedDomain}
                             onChange={(e) => setSelectedDomain(e.target.value)}
                             className="w-full bg-gray-50 dark:bg-slate-900 rounded-2xl px-6 py-4 text-xs font-bold dark:text-white outline-none appearance-none cursor-pointer border border-transparent dark:border-slate-700"
                           >
                             {domains.map(d => <option key={d} value={d}>{d}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest ml-1">Focus Topic</label>
                           <select 
                             value={selectedTopic}
                             onChange={(e) => setSelectedTopic(e.target.value)}
                             className="w-full bg-gray-50 dark:bg-slate-900 rounded-2xl px-6 py-4 text-xs font-bold dark:text-white outline-none appearance-none cursor-pointer border border-transparent dark:border-slate-700"
                           >
                             <option value="">Select Topic...</option>
                             {topics.map(t => <option key={t} value={t}>{t}</option>)}
                           </select>
                        </div>
                     </div>

                     <div className="relative mb-8 flex items-center gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 w-4.5 h-4.5" />
                          <input 
                            type="text" 
                            placeholder="Search knowledge bank records..."
                            value={bankSearch}
                            onChange={(e) => setBankSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchBankQuestions()}
                            className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-[2.5rem] text-xs font-bold font-sans dark:text-white outline-none focus:bg-white dark:focus:bg-slate-950 transition-all shadow-sm"
                          />
                        </div>
                        {selectedTopic && !loadingBank && (
                          <div className="px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                             <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{bankQuestions.length} Found</span>
                          </div>
                        )}
                     </div>

                     {loadingBank ? (
                       <div className="py-20 text-center">
                          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                          <p className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.3em]">Querying Records...</p>
                       </div>
                     ) : bankQuestions.length === 0 ? (
                       <div className="py-24 text-center border-2 border-dashed border-gray-100 dark:border-slate-700 rounded-[3.5rem] bg-gray-50/20 dark:bg-slate-900/10">
                          <p className="text-sm font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest transition-colors">No records matched your selection.</p>
                       </div>
                     ) : (
                        <div className="grid grid-cols-1 gap-6">
                           {bankQuestions.map(q => {
                             const isAdded = draftQuestions.find(i => i._id === q._id);
                             return (
                               <div 
                                 key={q._id}
                                 onClick={() => toggleQuestion(q)}
                                 className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer flex items-start gap-6 group relative ${isAdded ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20' : 'bg-white dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl dark:text-white'}`}
                               >
                                  <div className="flex-1">
                                     <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                           <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${isAdded ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-900 text-gray-500 dark:text-gray-400'}`}>{q.type}</span>
                                           <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${isAdded ? 'bg-white/20' : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>{q.difficulty}</span>
                                           {q.subtopic && q.subtopic !== '' && (
                                              <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${isAdded ? 'bg-white/20' : 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'}`}>{q.subtopic}</span>
                                           )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <button 
                                              onClick={(e) => handleEditFromBank(q, e)}
                                              className={`p-3 rounded-xl transition-all ${isAdded ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-400 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                                           >
                                              <ArrowLeft className="w-3.5 h-3.5 rotate-[135deg]" />
                                           </button>
                                           <button 
                                              onClick={(e) => handleDeleteFromBank(q._id, e)}
                                              className={`p-3 rounded-xl transition-all ${isAdded ? 'bg-white/10 hover:bg-rose-500 text-white' : 'bg-gray-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-gray-400 dark:text-gray-600 hover:text-rose-600 dark:hover:text-rose-400'}`}
                                           >
                                              <Trash2 className="w-3.5 h-3.5" />
                                           </button>
                                        </div>
                                     </div>

                                     <h4 className="text-[15px] font-bold font-sans leading-relaxed mb-6">{q.questionText}</h4>
                                     
                                     {q.options && q.options.length > 0 && (
                                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                          {q.options.map((opt, i) => (
                                            <div key={i} className={`px-4 py-2.5 rounded-xl text-[11px] font-medium border flex items-center gap-3 ${isAdded ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 dark:bg-slate-900 border-transparent text-gray-600 dark:text-gray-400'}`}>
                                               <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] ${isAdded ? 'bg-white/20' : 'bg-white dark:bg-slate-800'}`}>
                                                 {String.fromCharCode(65 + i)}
                                               </span>
                                               <span className="line-clamp-1">{opt}</span>
                                            </div>
                                          ))}
                                       </div>
                                     )}

                                     <div className={`mt-4 pt-4 border-t ${isAdded ? 'border-white/10' : 'border-gray-50 dark:border-slate-700'} flex items-center gap-3`}>
                                        <div className={`p-2 rounded-lg ${isAdded ? 'bg-emerald-400/20' : 'bg-emerald-500/10'}`}>
                                           <ShieldCheck className={`w-3.5 h-3.5 ${isAdded ? 'text-emerald-300' : 'text-emerald-500'}`} />
                                        </div>
                                        <div>
                                           <p className={`text-[8px] font-black uppercase tracking-widest ${isAdded ? 'text-white/60' : 'text-gray-400 dark:text-gray-600'}`}>Correct Answer</p>
                                           <p className={`text-[11px] font-black ${isAdded ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                              {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                                           </p>
                                        </div>
                                     </div>
                                  </div>
                                  
                                  <div className="mt-1 transition-transform group-hover:scale-110 flex-shrink-0">
                                     {isAdded ? <CheckCircle2 className="w-8 h-8 text-white" /> : <PlusCircle className="w-8 h-8 text-indigo-300 dark:text-gray-700" />}
                                  </div>
                               </div>
                             )
                           })}
                        </div>
                     )}
                  </div>
                )}

                {mode === 'ai' && (
                  <div className="space-y-12 animate-in fade-in duration-300">
                     <div className="max-w-xl mx-auto py-6">
                        <div className="text-center mb-10">
                           <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.2rem] flex items-center justify-center mx-auto mb-5 border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
                              <BrainCircuit className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                           </div>
                           <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tightest">Instant Generator</h3>
                           <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1.5">AI-assisted question architecture.</p>
                        </div>

                        <form onSubmit={handleAiGenerate} className="space-y-6">
                           <div className="grid grid-cols-2 gap-5">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase ml-1">Topic</label>
                                 <input 
                                   type="text" 
                                   value={aiConfig.topic}
                                   onChange={(e) => setAiConfig({...aiConfig, topic: e.target.value})}
                                   className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-2xl px-6 py-4 text-xs font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                   placeholder="e.g. React JSX"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase ml-1">Subtopic</label>
                                 <input 
                                   type="text" 
                                   value={aiConfig.subtopic}
                                   onChange={(e) => setAiConfig({...aiConfig, subtopic: e.target.value})}
                                   className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-2xl px-6 py-4 text-xs font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                   placeholder="Core Logic"
                                 />
                              </div>
                           </div>

                           <div className="grid grid-cols-3 gap-5">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase ml-1">Difficulty</label>
                                 <select 
                                   value={aiConfig.difficulty}
                                   onChange={(e) => setAiConfig({...aiConfig, difficulty: e.target.value})}
                                   className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-2xl px-4 py-4 text-[11px] font-bold dark:text-white outline-none cursor-pointer"
                                 >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                 </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase ml-1">Gen Count</label>
                                 <input 
                                   type="number" 
                                   min="1" max="15"
                                   value={aiConfig.count}
                                   onChange={(e) => setAiConfig({...aiConfig, count: parseInt(e.target.value)})}
                                   className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-2xl px-4 py-4 text-[11px] font-bold dark:text-white outline-none cursor-pointer"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase ml-1">Type</label>
                                 <select 
                                   value={aiConfig.type}
                                   onChange={(e) => setAiConfig({...aiConfig, type: e.target.value})}
                                   className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-2xl px-4 py-4 text-[11px] font-bold dark:text-white outline-none cursor-pointer"
                                 >
                                    {questionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                 </select>
                              </div>
                           </div>

                           <button 
                             type="submit" 
                             disabled={generatingAi}
                             className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.35em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-indigo-900/40 flex items-center justify-center gap-3 disabled:opacity-50"
                           >
                              {generatingAi ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-4 h-4 fill-current" />}
                              {generatingAi ? 'Decoding Knowledge...' : 'Run Neural Generation'}
                           </button>
                        </form>
                     </div>

                     {/* AI Results Preview */}
                     {tempAiQuestions.length > 0 && (
                       <div className="space-y-6 pt-10 border-t border-gray-100 dark:border-slate-700 animate-in slide-in-from-bottom-10 duration-500">
                          <div className="flex items-center justify-between px-2">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">Generation Preview</h4>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tempAiQuestions.length} Suggestions Ready</p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-6">
                             {tempAiQuestions.map((q, idx) => (
                               <div key={idx} className="p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-900/30 flex items-start gap-6 relative group transition-all">
                                  <div className="flex-1">
                                     <div className="flex items-center gap-3 mb-4">
                                        <span className="text-[10px] font-black text-white px-2 py-1 bg-indigo-500 rounded-lg">NEW</span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{aiConfig.type}</span>
                                     </div>
                                     <h5 className="text-[15px] font-bold font-sans dark:text-white leading-relaxed mb-4">{q.questionText}</h5>
                                     
                                     {q.options && q.options.length > 0 && (
                                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                          {q.options.map((opt, i) => (
                                            <div key={i} className="px-4 py-2.5 rounded-xl text-[11px] font-medium bg-white dark:bg-slate-800 border-transparent dark:text-gray-300 text-gray-600 flex items-center gap-3 border border-gray-50 dark:border-slate-700">
                                               <span className="w-5 h-5 rounded bg-gray-100 dark:bg-slate-700 flex items-center justify-center font-bold text-[9px] text-gray-500 dark:text-gray-400">
                                                  {String.fromCharCode(65 + i)}
                                               </span>
                                               {opt}
                                            </div>
                                          ))}
                                       </div>
                                     )}

                                     <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-500/10">
                                           <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                        </div>
                                        <div>
                                           <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">Generated Correct Answer</p>
                                           <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                                              {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                                           </p>
                                        </div>
                                     </div>
                                  </div>
                                  <button 
                                    onClick={() => addAiToDraft(q, idx)}
                                    className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2 flex-shrink-0"
                                  >
                                     <Plus className="w-4 h-4" />
                                     Add to Test
                                  </button>
                               </div>
                             ))}
                          </div>
                       </div>
                     )}
                  </div>
                )}

                {mode === 'upload' && (
                  <div className="space-y-12 animate-in fade-in duration-300 max-w-2xl mx-auto">
                     <div className="p-16 bg-gray-50/50 dark:bg-slate-900/30 rounded-[3rem] border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-sm border border-gray-50 dark:border-slate-700">
                           <FileSpreadsheet className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tightest mb-6">Mass Sync</h3>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-12">Upload Excel records for rapid bank integration.</p>
                        
                        <label className="w-full group cursor-pointer mb-10">
                           <div className="w-full py-16 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-[3rem] bg-white dark:bg-slate-800 hover:border-emerald-500 transition-all group-hover:bg-emerald-50/10">
                              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleBulkUpload} disabled={importing} />
                              <Upload className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Select .xlsx or .xls file</p>
                           </div>
                        </label>

                        <button 
                           onClick={downloadTemplate}
                           className="flex items-center gap-3 px-8 py-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
                        >
                           <Download className="w-4 h-4" />
                           Download Template Guide
                        </button>
                     </div>

                     <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/20 flex items-start gap-5">
                        <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                        <div>
                           <p className="text-[10px] font-black text-amber-900 dark:text-amber-400 uppercase tracking-widest mb-1">PRO-TIP</p>
                           <p className="text-[11px] font-bold text-amber-900/70 dark:text-amber-200/40 uppercase tracking-tight leading-relaxed">Ensure your Excel file matches the template headers exactly. Bulk uploads are indexed directly into the Question Bank for future use.</p>
                        </div>
                     </div>
                  </div>
                )}

                {mode === 'manual' && (
                  <div className="space-y-12 animate-in fade-in duration-300 max-w-3xl mx-auto">
                     <div className="p-12 bg-white dark:bg-slate-800/50 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-xl shadow-gray-100/50 dark:shadow-none">
                        <div className="flex items-center gap-4 mb-10 border-b border-gray-50 dark:border-slate-700 pb-8">
                           <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center">
                              {isEditingBank ? <PlusCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400 rotate-45" /> : <Terminal className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                           </div>
                           <div>
                              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tightest">{isEditingBank ? 'Refine Architecture' : 'Single Entry'}</h3>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isEditingBank ? 'Updating existing bank record' : 'Architect a specific component manually'}</p>
                           </div>
                        </div>
                        
                        <form onSubmit={handleManualSave} className="space-y-8">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Question Narrative</label>
                              <textarea 
                                 className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-3xl px-8 py-6 text-sm font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 transition-all min-h-[160px] resize-none leading-relaxed font-sans shadow-inner"
                                 placeholder="Enter the complete question content..."
                                 value={manualQuestion.questionText}
                                 onChange={(e) => setManualQuestion({...manualQuestion, questionText: e.target.value})}
                              />
                           </div>
                           
                           <div className="space-y-4">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Target Domain</label>
                                 <select 
                                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-2xl px-6 py-4 text-xs font-bold dark:text-white outline-none appearance-none cursor-pointer focus:border-indigo-500 transition-all shadow-sm"
                                    value={manualQuestion.domain}
                                    onChange={(e) => setManualQuestion({...manualQuestion, domain: e.target.value})}
                                 >
                                    {domains.map(d => <option key={d} value={d}>{d}</option>)}
                                 </select>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Focus Topic</label>
                                    <input 
                                       type="text"
                                       className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-2xl px-6 py-4 text-xs font-bold dark:text-white outline-none focus:border-indigo-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                       placeholder="e.g. Hooks API"
                                       value={manualQuestion.topic}
                                       onChange={(e) => setManualQuestion({...manualQuestion, topic: e.target.value})}
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Subtopic</label>
                                    <input 
                                       type="text"
                                       className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-2xl px-6 py-4 text-xs font-bold dark:text-white outline-none focus:border-indigo-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                       placeholder="e.g. State Management"
                                       value={manualQuestion.subtopic}
                                       onChange={(e) => setManualQuestion({...manualQuestion, subtopic: e.target.value})}
                                    />
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Question Type</label>
                                 <select 
                                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-2xl px-6 py-4 text-xs font-bold dark:text-white outline-none appearance-none cursor-pointer focus:border-indigo-500 transition-all"
                                    value={manualQuestion.type}
                                    onChange={(e) => setManualQuestion({...manualQuestion, type: e.target.value})}
                                 >
                                    {questionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                 </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Correct Answer</label>
                                 <input 
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-2xl px-6 py-4 text-xs font-bold dark:text-white outline-none focus:border-indigo-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                    placeholder="Validation Key"
                                    value={manualQuestion.correctAnswer}
                                    onChange={(e) => setManualQuestion({...manualQuestion, correctAnswer: e.target.value})}
                                 />
                              </div>
                           </div>

                           <button 
                             type="submit"
                             disabled={importing}
                             className="w-full py-6 bg-[#0f172a] dark:bg-white text-white dark:text-gray-900 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-black dark:hover:bg-gray-100 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50 mt-4"
                           >
                              {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditingBank ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
                              {isEditingBank ? 'Update Global Bank Entry' : 'Synchronize to Blueprint & Bank'}
                           </button>
                        </form>
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestBuilder;
