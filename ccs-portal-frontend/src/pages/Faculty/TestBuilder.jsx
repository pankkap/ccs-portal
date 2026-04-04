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
  FileSpreadsheet,
  GraduationCap,
  UploadCloud
} from 'lucide-react';
import { toast } from 'sonner';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import questionService from '../../services/questionService';
import testService from '../../services/testService';
import aiService from '../../services/aiService';
import { cn } from '../../lib/utils';

const TestBuilder = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initType = searchParams.get('type') || 'practice';
  const [fetchingTest, setFetchingTest] = useState(!!testId);
  const [saving, setSaving] = useState(false);
  
  // Test Global Config
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    maxMarks: 100,
    isProctored: false,
    category: 'Technical Domain',
    testType: initType, // 'practice' | 'curriculum'
    isPublic: initType === 'practice',
    passingScore: 70
  });

  // Role check: Only Curriculum Assessments are forced private
  useEffect(() => {
    if (formData.testType === 'curriculum') {
      setFormData(prev => ({ ...prev, isPublic: false }));
    }
  }, [formData.testType]);

  const [draftQuestions, setDraftQuestions] = useState([]);
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

  // --- Mass Import & Manual Entry ---
  const [importing, setImporting] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [manualQuestion, setManualQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    type: 'MCQ (Single Ans)',
    difficulty: 'Medium',
    explanation: '',
    domain: 'Technical Domain',
    topic: '',
    subtopic: ''
  });

  const domains = ['Aptitude Reasoning', 'Communication Verbal', 'Technical Domain'];
  const testCategories = ['Aptitude Reasoning', 'Communication Verbal', 'Technical Domain'];
  const questionTypes = ['MCQ (Single Ans)', 'MCQ (Multiple Ans)', 'Fill in the Blank', 'Output Based', 'Subjective'];

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
          category: test.category,
          testType: test.testType || 'practice',
          isPublic: test.isPublic !== undefined ? test.isPublic : true,
          passingScore: test.passingScore || 70
        });
        setDraftQuestions(test.questions || []);
      }
    } catch (err) {
      toast.error("Failed to load blueprint details");
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
      toast.error("Bank synchronization error");
    } finally {
      setLoadingBank(false);
    }
  };

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
        toast.success(`AI suggested ${res.data.questions.length} items.`);
      }
    } catch (err) {
      toast.error("AI engine failure");
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
        toast.success("Component saved to Question Bank & Blueprint.");
        fetchTopics(selectedDomain);
      }
    } catch (err) {
      toast.error("Question Bank archival failure");
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      const res = await questionService.bulkUpload(file);
      if (res.success) {
        toast.success(`${res.data.count} items imported to centralized Question Bank.`);
        fetchBankQuestions();
        setMode('bank');
      }
    } catch (err) {
      toast.error("Bulk ingestion failed");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [['questionText', 'type', 'option1', 'option2', 'option3', 'option4', 'correctAnswer', 'explanation', 'domain', 'topic', 'subtopic', 'difficulty']];
    const data = [['What is React?', 'MCQ (Single Ans)', 'A Library', 'A Framework', 'A Tool', 'A Language', 'A Library', 'React is a UI library.', 'Technical Domain', 'React', 'Basics', 'Easy']];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "CCS_Assessment_Blueprint.xlsx");
    toast.success("Template downloaded!");
  };

  const handleManualSave = async (e) => {
    e.preventDefault();
    if (!manualQuestion.questionText) return toast.error("Content text required");
    
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
          toast.success("Item updated in registry.");
          setMode('bank');
          fetchBankQuestions();
        } else {
          setDraftQuestions([...draftQuestions, res.data.question]);
          toast.success("Item archived to Question Bank & Blueprint.");
          fetchTopics(selectedDomain);
        }
        setManualQuestion({ ...manualQuestion, questionText: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', subtopic: '' });
        setIsEditingBank(false);
      }
    } catch (err) {
      toast.error("Archival failure");
    } finally {
      setImporting(false);
    }
  };

  const handleFinalSave = async (e) => {
    e.preventDefault();
    if (!formData.title || draftQuestions.length === 0) {
      return toast.error("Identify blueprint title and components before committing.");
    }

    setSaving(true);
    try {
      let finalTitle = formData.title;
      if (formData.testType === 'curriculum' && !finalTitle.startsWith('[Curriculum]')) {
        finalTitle = `[Curriculum] ${finalTitle}`;
      }

      const payload = {
        ...formData,
        title: finalTitle,
        questions: draftQuestions.map(q => q._id)
      };
      const res = testId 
        ? await testService.updateTest(testId, payload)
        : await testService.createTest(payload);
        
      if (res.success) {
        toast.success(testId ? "Architectural commits synced!" : "New blueprint initialized in registry.");
        navigate('/faculty/mock-tests');
      }
    } catch (err) {
      toast.error(err.message || "Registry synchronization failure");
    } finally {
      setSaving(false);
    }
  };

  if (fetchingTest) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">Syncing registry data...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-12 flex items-center justify-between border-b border-gray-100 pb-10 transition-colors">
          <div className="flex items-center gap-8">
            <Link to="/faculty/mock-tests" className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-300 hover:text-indigo-600 hover:border-indigo-100 transition-all">
               <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-100">
                    {formData.testType === 'practice' ? 'Mock Practice Lab' : 'Curriculum Mandatory Audit'}
                 </span>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">• Unified Question Bank Integration Enabled</p>
              </div>
              <h1 className="text-5xl font-black text-gray-950 tracking-tightest leading-none">{testId ? 'Modify Blueprint' : 'Architect Assessment'}</h1>
            </div>
          </div>
          
          <button 
            onClick={handleFinalSave}
            disabled={saving || draftQuestions.length === 0}
            className="flex items-center gap-4 px-10 py-5 bg-gray-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-30 group"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-indigo-400" />}
            {testId ? 'Commit Archival' : 'Initialize Assessment'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-10">
             <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden transition-colors">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                   <Command className="w-4 h-4 text-indigo-600" />
                   Configuration Matrix
                </h3>

                <div className="space-y-8 relative">
                   {/* Assessment Identity Selection */}
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Assessment Identity</label>
                      <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-50 rounded-[1.75rem]">
                         <button 
                          type="button"
                          onClick={() => setFormData({...formData, testType: 'practice', isPublic: true})}
                          className={cn(
                            "py-4 rounded-2xl text-[9px] font-black flex flex-col items-center gap-2 uppercase tracking-widest transition-all",
                            formData.testType === 'practice' ? "bg-white text-gray-900 shadow-xl shadow-gray-200" : "text-gray-400 hover:text-gray-600"
                          )}
                         >
                            <Zap className={cn("w-4 h-4", formData.testType === 'practice' ? "text-amber-500" : "text-gray-300")} />
                            Practice Mock Test
                         </button>
                         <button 
                          type="button"
                          onClick={() => setFormData({...formData, testType: 'curriculum', isPublic: false})}
                          className={cn(
                            "py-4 rounded-2xl text-[9px] font-black flex flex-col items-center gap-2 uppercase tracking-widest transition-all",
                            formData.testType === 'curriculum' ? "bg-white text-gray-900 shadow-xl shadow-gray-200" : "text-gray-400 hover:text-gray-600"
                          )}
                         >
                            <ShieldCheck className={cn("w-4 h-4", formData.testType === 'curriculum' ? "text-indigo-600" : "text-gray-300")} />
                            Curriculum Assessment
                         </button>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Title Designation</label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-black text-gray-950 outline-none focus:bg-white focus:ring-4 ring-indigo-50 transition-all"
                        placeholder="e.g. Data Science Core Audit"
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Duration (Min)</label>
                        <input 
                          type="number" 
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                          className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-black text-gray-950 outline-none focus:bg-white focus:ring-4 ring-indigo-50 transition-all font-mono"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Threshold (%)</label>
                        <input 
                          type="number" 
                          value={formData.passingScore}
                          onChange={(e) => setFormData({...formData, passingScore: parseInt(e.target.value)})}
                          className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-black text-gray-950 outline-none focus:bg-white focus:ring-4 ring-indigo-50 transition-all font-mono"
                        />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Governance Focus</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-black text-gray-950 outline-none focus:bg-white focus:ring-4 ring-indigo-50 transition-all appearance-none cursor-pointer"
                      >
                         {testCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>

                   <div className="p-6 bg-gray-50 rounded-[2rem] flex items-center justify-between border border-gray-100">
                       <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", formData.isProctored ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-300')}>
                             <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-gray-900 leading-tight">Proctoring</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                               {formData.testType === 'curriculum' ? 'Attempts defined by curriculum limits' : 'Unlimited practice attempts'}
                            </p>
                          </div>
                       </div>
                       <button 
                        type="button"
                        onClick={() => setFormData({...formData, isProctored: !formData.isProctored})}
                        className={cn("w-14 h-8 rounded-full transition-all relative", formData.isProctored ? 'bg-indigo-600 shadow-xl' : 'bg-gray-200')}
                       >
                          <div className={cn("absolute top-1.5 w-5 h-5 rounded-full bg-white transition-all", formData.isProctored ? 'left-7.5 shadow-lg' : 'left-1.5')} />
                       </button>
                   </div>
                </div>
             </div>

             <div className="bg-gray-950 rounded-[3.5rem] p-10 text-white relative h-[450px] flex flex-col overflow-hidden shadow-2xl">
                 <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">Archived Dossier</h3>
                    <span className="text-2xl font-black tracking-tightest">{draftQuestions.length} <span className="text-[10px] text-white/30 font-black ml-1 tracking-widest uppercase">Items</span></span>
                 </div>
                
                 <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
                    {draftQuestions.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                         <PlusCircle className="w-10 h-10 text-white/5 mb-4" />
                         <p className="text-[10px] font-black text-white/10 uppercase tracking-widest leading-loose">No architectural assets<br/>included in blueprint</p>
                      </div>
                    ) : (
                      draftQuestions.map((q, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/5 p-5 rounded-3xl flex items-start gap-5 group relative hover:bg-white/10 transition-colors cursor-default">
                           <span className="text-[10px] font-black text-indigo-400 mt-1">{String(idx + 1).padStart(2, '0')}</span>
                           <p className="text-[11px] font-bold line-clamp-3 text-white/80 leading-relaxed">{q.questionText}</p>
                           <button 
                             onClick={() => toggleQuestion(q)}
                             className="absolute -right-3 -top-3 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-2xl hover:scale-110"
                           >
                              <Trash2 className="w-4 h-4 text-white" />
                           </button>
                        </div>
                      ))
                    )}
                 </div>
             </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-[3.5rem] border border-gray-100 shadow-sm min-h-[900px] flex flex-col overflow-hidden">
             <div className="flex bg-gray-50/50 p-2 gap-2 border-b border-gray-100">
                {[
                  { id: 'bank', icon: Layers, label: 'Question Bank' },
                  { id: 'ai', icon: BrainCircuit, label: 'Neural AI Generator' },
                  { id: 'upload', icon: FileSpreadsheet, label: 'Bulk Ingestion' },
                  { id: 'manual', icon: Terminal, label: 'Standard Schema' }
                ].map(nav => (
                   <button 
                    key={nav.id}
                    onClick={() => setMode(nav.id)}
                    className={cn(
                      "flex-1 px-6 py-6 rounded-[2rem] text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                      mode === nav.id ? "bg-white text-gray-950 shadow-xl shadow-gray-200" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                    )}
                   >
                      <nav.icon className={cn("w-4 h-4", mode === nav.id ? "text-indigo-600" : "text-gray-300")} />
                      {nav.label}
                   </button>
                ))}
             </div>

             <div className="flex-1 p-12 overflow-auto no-scrollbar">
                {mode === 'bank' && (
                  <div className="space-y-10">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Institutional Domain</label>
                           <select 
                             value={selectedDomain}
                             onChange={(e) => setSelectedDomain(e.target.value)}
                             className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-black text-gray-950 outline-none ring-offset-0 focus:ring-4 ring-indigo-50/50 transition-all appearance-none cursor-pointer"
                           >
                             {domains.map(d => <option key={d} value={d}>{d}</option>)}
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Topic</label>
                           <select 
                             value={selectedTopic}
                             onChange={(e) => setSelectedTopic(e.target.value)}
                             className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-black text-gray-950 outline-none ring-offset-0 focus:ring-4 ring-indigo-50/50 transition-all appearance-none cursor-pointer"
                           >
                             <option value="">Query Topic Registry...</option>
                             {topics.map(t => <option key={t} value={t}>{t}</option>)}
                           </select>
                        </div>
                     </div>

                     <div className="relative mb-12 flex items-center gap-6">
                        <div className="relative flex-1">
                          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 pointer-events-none" />
                          <input 
                            type="text" 
                            placeholder="Query knowledge assets..."
                            value={bankSearch}
                            onChange={(e) => setBankSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchBankQuestions()}
                            className="w-full pl-20 pr-8 py-6 bg-gray-900 text-white border-none rounded-[2.5rem] text-sm font-bold outline-none ring-offset-1 focus:ring-4 ring-indigo-100 transition-all shadow-2xl"
                          />
                        </div>
                        {selectedTopic && !loadingBank && bankQuestions.length > 0 && (
                          <div className="px-8 py-5 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center gap-2">
                             <Target className="w-4 h-4 text-indigo-600" />
                             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{bankQuestions.length} Items Found</span>
                          </div>
                        )}
                     </div>

                     {loadingBank ? (
                       <div className="py-24 text-center">
                          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-6" />
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Optimizing registry records</p>
                       </div>
                     ) : bankQuestions.length === 0 ? (
                       <div className="py-32 text-center rounded-[3.5rem] bg-gray-50/50 border-2 border-dashed border-gray-100 flex flex-col items-center">
                          <Layers className="w-16 h-16 text-gray-100 mb-6" />
                          <p className="text-sm font-black text-gray-300 uppercase tracking-[0.2em] max-w-xs mx-auto">Registry endpoint returned no matches for current criteria.</p>
                       </div>
                     ) : (
                         <div className="grid grid-cols-1 gap-8">
                            {bankQuestions.map(q => {
                              const isAdded = draftQuestions.find(i => i._id === q._id);
                              return (
                                <div 
                                  key={q._id}
                                  onClick={() => toggleQuestion(q)}
                                  className={cn(
                                    "p-10 rounded-[3.5rem] border transition-all cursor-pointer flex items-start gap-8 relative group overflow-hidden",
                                    isAdded 
                                      ? "bg-gray-950 border-gray-950 text-white shadow-2xl shadow-gray-400" 
                                      : "bg-white border-gray-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50"
                                  )}
                                >
                                   <div className="flex-1">
                                      <div className="flex items-center justify-between mb-6">
                                         <div className="flex items-center gap-3">
                                            <span className={cn("text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl", isAdded ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-400')}>
                                               {q.type}
                                            </span>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">• {q.difficulty}</span>
                                            {q.subtopic && <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-2"># {q.subtopic}</span>}
                                         </div>
                                         <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all">
                                            {isAdded ? <CheckCircle2 className="w-8 h-8 text-indigo-400" /> : <PlusCircle className="w-8 h-8 text-gray-100 group-hover:text-indigo-100" />}
                                         </div>
                                      </div>

                                      <h4 className="text-xl font-bold font-sans leading-relaxed mb-8 group-hover:text-indigo-500 transition-colors uppercase">{q.questionText}</h4>
                                      <div className={cn("pt-8 border-t flex items-center gap-4", isAdded ? 'border-white/5' : 'border-gray-50')}>
                                         <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                            <ShieldCheck className="w-5 h-5" />
                                         </div>
                                         <div>
                                            <p className={cn("text-[9px] font-black uppercase tracking-widest leading-none mb-1", isAdded ? 'text-white/40' : 'text-gray-400')}>Credential Basis</p>
                                            <p className={cn("text-xs font-black", isAdded ? 'text-white' : 'text-emerald-600')}>{Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</p>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                              )
                            })}
                         </div>
                      )}
                  </div>
                )}

                {mode === 'ai' && (
                  <div className="space-y-12 animate-in fade-in duration-300 max-w-2xl mx-auto">
                     <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100/50">
                           <BrainCircuit className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-950 tracking-tightest">Neural Generation</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">AI-assisted question architecture</p>
                     </div>

                     <form onSubmit={handleAiGenerate} className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Domain Topic</label>
                              <input 
                                type="text" 
                                value={aiConfig.topic}
                                onChange={(e) => setAiConfig({...aiConfig, topic: e.target.value})}
                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-black text-gray-950 outline-none focus:ring-4 ring-indigo-50 transition-all"
                                placeholder="e.g. React Hooks"
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Subtopic Focus</label>
                              <input 
                                type="text" 
                                value={aiConfig.subtopic}
                                onChange={(e) => setAiConfig({...aiConfig, subtopic: e.target.value})}
                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-black text-gray-950 outline-none focus:ring-4 ring-indigo-50 transition-all"
                                placeholder="e.g. useEffect"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Complexity</label>
                              <select 
                                value={aiConfig.difficulty}
                                onChange={(e) => setAiConfig({...aiConfig, difficulty: e.target.value})}
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-5 text-xs font-black text-gray-950 outline-none cursor-pointer"
                              >
                                 <option value="Easy">Easy</option>
                                 <option value="Medium">Medium</option>
                                 <option value="Hard">Hard</option>
                              </select>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Count</label>
                              <input 
                                type="number" 
                                min="1" max="15"
                                value={aiConfig.count}
                                onChange={(e) => setAiConfig({...aiConfig, count: parseInt(e.target.value)})}
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-5 text-sm font-black text-gray-950 outline-none"
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Schema Type</label>
                              <select 
                                value={aiConfig.type}
                                onChange={(e) => setAiConfig({...aiConfig, type: e.target.value})}
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-5 text-xs font-black text-gray-950 outline-none cursor-pointer"
                              >
                                 {questionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                           </div>
                        </div>

                        <button 
                          type="submit" 
                          disabled={generatingAi}
                          className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-4 disabled:opacity-50"
                        >
                           {generatingAi ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                           {generatingAi ? 'Generating Assets...' : 'Run Neural Generation'}
                        </button>
                     </form>

                     {tempAiQuestions.length > 0 && (
                       <div className="space-y-6 pt-10 border-t border-gray-50">
                          <div className="flex items-center justify-between px-2">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Preview</h4>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tempAiQuestions.length} Ready</p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-6">
                             {tempAiQuestions.map((q, idx) => (
                               <div key={idx} className="p-8 rounded-[3rem] border border-indigo-50 bg-indigo-50/20 flex flex-col gap-6">
                                  <div className="flex items-center gap-3">
                                     <span className="text-[9px] font-black text-white px-3 py-1.5 bg-indigo-500 rounded-xl uppercase tracking-widest">AI</span>
                                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{aiConfig.type}</span>
                                  </div>
                                  <h5 className="text-sm font-black text-gray-900 leading-relaxed">{q.questionText}</h5>
                                  <button onClick={() => addAiToDraft(q, idx)} className="w-full py-4 bg-white border border-indigo-100 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all">
                                     Approve & Save to Bank
                                  </button>
                               </div>
                             ))}
                          </div>
                       </div>
                     )}
                  </div>
                )}

                {mode === 'upload' && (
                  <div className="space-y-12 animate-in fade-in duration-500 max-w-2xl mx-auto">
                     <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100/50">
                           <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-950 tracking-tightest">Mass Ingestion</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">Upload Excel Blueprint</p>
                     </div>

                     <div className="p-10 border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/50 text-center">
                        <Upload className="w-10 h-10 text-gray-300 mx-auto mb-6" />
                        <h4 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-widest">Select Excel File</h4>
                        <p className="text-xs text-gray-500 mb-8 font-medium">Requires strict schema alignment</p>
                        
                        <div className="flex flex-col gap-4 items-center justify-center">
                           <label className="px-10 py-5 bg-gray-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:scale-105 active:scale-95 transition-transform flex items-center gap-3">
                              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                              {importing ? 'Processing...' : 'Upload Asset'}
                              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleBulkUpload} disabled={importing} />
                           </label>
                           <button onClick={downloadTemplate} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-2 mt-4">
                              <Download className="w-3 h-3" /> Download Template
                           </button>
                        </div>
                     </div>
                  </div>
                )}

                {mode === 'manual' && (
                   <div className="space-y-12 animate-in fade-in duration-500 max-w-2xl mx-auto">
                      <div className="text-center mb-10">
                         <div className="w-20 h-20 bg-gray-950 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <Terminal className="w-10 h-10" />
                         </div>
                         <h3 className="text-3xl font-black text-gray-950 tracking-tightest">Archive Direct Entry</h3>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">Manual registry input</p>
                      </div>

                      <form onSubmit={handleManualSave} className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Question Content</label>
                            <textarea 
                              value={manualQuestion.questionText}
                              onChange={(e) => setManualQuestion({...manualQuestion, questionText: e.target.value})}
                              className="w-full bg-gray-50 border-none rounded-3xl px-8 py-6 text-sm font-black text-gray-950 outline-none focus:bg-white focus:ring-4 ring-indigo-50 min-h-[150px] transition-all resize-none"
                              placeholder="Describe the architectural component..."
                            />
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Response Schema</label>
                               <select 
                                 value={manualQuestion.type}
                                 onChange={(e) => setManualQuestion({...manualQuestion, type: e.target.value})}
                                 className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-black text-gray-950 outline-none focus:ring-4 ring-indigo-50 transition-all appearance-none cursor-pointer"
                               >
                                  {questionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                               </select>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Difficulty Complexity</label>
                               <select 
                                 value={manualQuestion.difficulty}
                                 onChange={(e) => setManualQuestion({...manualQuestion, difficulty: e.target.value})}
                                 className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-black text-gray-950 outline-none focus:ring-4 ring-indigo-50 transition-all appearance-none cursor-pointer"
                               >
                                  <option value="Easy">Easy</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Hard">Hard</option>
                               </select>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Options Registry</label>
                            <div className="grid grid-cols-1 gap-4">
                               {manualQuestion.options.map((opt, i) => (
                                  <div key={i} className="flex items-center gap-4 group">
                                     <div className={cn("w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-sm shrink-0 transition-all", manualQuestion.correctAnswer === opt && opt !== '' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-100 text-gray-400')}>
                                        {String.fromCharCode(65 + i)}
                                     </div>
                                     <input 
                                       type="text" 
                                       value={opt}
                                       onChange={(e) => {
                                          const newOpts = [...manualQuestion.options];
                                          newOpts[i] = e.target.value;
                                          setManualQuestion({...manualQuestion, options: newOpts});
                                       }}
                                       className="flex-1 bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-black text-gray-950 outline-none focus:bg-white focus:ring-4 ring-indigo-50 transition-all"
                                       placeholder={`Option ${i+1}`}
                                     />
                                     <button 
                                       type="button"
                                       onClick={() => setManualQuestion({...manualQuestion, correctAnswer: opt})}
                                       className={cn("p-4 rounded-xl border transition-all", manualQuestion.correctAnswer === opt && opt !== '' ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-300 hover:text-emerald-500')}
                                     >
                                        <CheckCircle2 className="w-5 h-5" />
                                     </button>
                                  </div>
                               ))}
                            </div>
                         </div>

                         <button 
                           type="submit" 
                           disabled={importing}
                           className="w-full py-6 bg-gray-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50"
                         >
                            {importing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-5 h-5" />}
                            Archive to Question Bank & Blueprint
                         </button>
                      </form>
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
