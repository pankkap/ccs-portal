import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  FileText, 
  Loader2,
  X,
  Download,
  AlertCircle,
  BrainCircuit,
  MessageSquare,
  CheckCircle2,
  ListChecks,
  ChevronDown,
  Monitor,
  Type as TypeIcon,
  BookOpen,
  ArrowRight,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import questionService from '../../services/questionService';
import * as XLSX from 'xlsx';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Drill-down selection states
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  
  // Options lists
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  
  // Modal states
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const domains = ['Aptitude Reasoning', 'Communication Verbal', 'Technical Domain'];
  const types = ['MCQ (Single Ans)', 'MCQ (Multiple Ans)', 'Fill in the Blank', 'Output Based', 'Subjective'];

  const [formData, setFormData] = useState({
    questionText: '',
    domain: 'Technical Domain',
    type: 'MCQ (Single Ans)',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    topic: '',
    subtopic: '',
    difficulty: 'Medium'
  });

  // Fetch topics when domain changes
  useEffect(() => {
    if (selectedDomain) {
      fetchTopics();
      setSelectedTopic('');
      setSelectedSubtopic('');
      setQuestions([]);
    }
  }, [selectedDomain]);

  // Fetch subtopics when topic changes
  useEffect(() => {
    if (selectedTopic) {
      fetchSubtopics();
      setSelectedSubtopic('');
      fetchQuestions(); // Load questions immediately for the topic
    }
  }, [selectedTopic]);

  // Fetch questions when subtopic changes
  useEffect(() => {
     if (selectedTopic) {
        fetchQuestions();
     }
  }, [selectedSubtopic]);

  const fetchTopics = async () => {
    try {
      const res = await questionService.getTopics(selectedDomain);
      if (res.success) setTopics(res.data.topics);
    } catch (error) {
      toast.error("Failed to load topics");
    }
  };

  const fetchSubtopics = async () => {
    try {
      const res = await questionService.getSubtopics(selectedDomain, selectedTopic);
      if (res.success) setSubtopics(res.data.subtopics);
    } catch (error) {
      toast.error("Failed to load subtopics");
    }
  };

  const fetchQuestions = async () => {
    if (!selectedDomain || !selectedTopic) return;
    try {
      setLoading(true);
      const res = await questionService.getBank({
        domain: selectedDomain,
        topic: selectedTopic,
        subtopic: selectedSubtopic,
        search
      });
      if (res.success) {
        setQuestions(res.data.questions);
      }
    } catch (error) {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') fetchQuestions();
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      domain: selectedDomain || 'Technical Domain',
      type: 'MCQ (Single Ans)',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      topic: selectedTopic || '',
      subtopic: selectedSubtopic || '',
      difficulty: 'Medium'
    });
    setEditingId(null);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!formData.questionText || !formData.correctAnswer || !formData.topic) {
      return toast.error("Please fill required fields");
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await questionService.updateQuestion(editingId, formData);
        toast.success("Question updated");
      } else {
        await questionService.createQuestion(formData);
        toast.success("Question added to bank");
      }
      setIsManualModalOpen(false);
      resetForm();
      fetchQuestions();
    } catch (error) {
      toast.error("Failed to save question");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await questionService.bulkUpload(file);
      if (res.success) {
        toast.success(res.message);
        setIsBulkModalOpen(false);
        fetchQuestions();
      }
    } catch (error) {
      toast.error(error.message || "Bulk upload failed");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        questionText: "What is React?",
        domain: "Technical Domain",
        type: "MCQ (Single Ans)",
        option1: "Library",
        option2: "Framework",
        option3: "Language",
        option4: "DB",
        correctAnswer: "Library",
        explanation: "React is a UI library.",
        topic: "React",
        subtopic: "Basics",
        difficulty: "Easy"
      }
    ];

    const instructions = [
      { Rule: "Valid Domains", Value: "Aptitude Reasoning, Communication Verbal, Technical Domain" },
      { Rule: "Valid Types", Value: "MCQ (Single Ans), MCQ (Multiple Ans), Fill in the Blank, Output Based, Subjective" },
      { Rule: "MCQ (Multiple Ans)", Value: "Comma separated answers in correctAnswer column (e.g. Option A, Option B)" },
      { Rule: "Output Based", Value: "Provide the code snippet in the questionText column" },
      { Rule: "Subjective", Value: "Provide a detailed answer key in the correctAnswer column" }
    ];

    const wb = XLSX.utils.book_new();
    const ws_template = XLSX.utils.json_to_sheet(template);
    const ws_guide = XLSX.utils.json_to_sheet(instructions);
    
    XLSX.utils.book_append_sheet(wb, ws_template, "Questions Template");
    XLSX.utils.book_append_sheet(wb, ws_guide, "Instructions Guide");
    
    XLSX.writeFile(wb, "Assessment_Bulk_Template.xlsx");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await questionService.deleteQuestion(id);
      setQuestions(questions.filter(q => q._id !== id));
      toast.success("Question removed");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const openEdit = (q) => {
    setFormData({
      questionText: q.questionText,
      domain: q.domain || 'Technical Domain',
      type: q.type,
      options: q.options || ['', '', '', ''],
      correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer,
      explanation: q.explanation || '',
      topic: q.topic,
      subtopic: q.subtopic || '',
      difficulty: q.difficulty || 'Medium'
    });
    setEditingId(q._id);
    setIsManualModalOpen(true);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 font-sans tracking-tightest uppercase mb-1">Knowledge Vault</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select your domain to browse and manage questions.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-3xl font-black text-[11px] uppercase tracking-widest text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Bulk Import
            </button>
            <button 
              onClick={() => { resetForm(); setIsManualModalOpen(true); }}
              className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              <Plus className="w-5 h-5" />
              Add Question
            </button>
          </div>
        </header>

        {/* Drill-down Selection Bar */}
        <div className="bg-[#0f172a] rounded-[3rem] p-8 shadow-2xl mb-12 flex flex-col lg:flex-row gap-6 items-center border border-white/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
           
           <div className="w-full lg:w-1/4">
             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-2 block">1. Select Domain</label>
             <select 
               value={selectedDomain}
               onChange={(e) => setSelectedDomain(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-xs font-bold outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
             >
               <option value="" className="bg-gray-900">Choose Domain...</option>
               {domains.map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
             </select>
           </div>

           <div className="w-full lg:w-1/4 opacity-100 disabled:opacity-30 transition-opacity">
             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-2 block">2. Choose Topic</label>
             <select 
               value={selectedTopic}
               onChange={(e) => setSelectedTopic(e.target.value)}
               disabled={!selectedDomain}
               className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-xs font-bold outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer disabled:cursor-not-allowed"
             >
               <option value="" className="bg-gray-900">Choose Topic...</option>
               {topics.map(t => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
             </select>
           </div>

           <div className="w-full lg:w-1/4">
             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-2 block">3. Subtopic (Optional)</label>
             <select 
               value={selectedSubtopic}
               onChange={(e) => setSelectedSubtopic(e.target.value)}
               disabled={!selectedTopic}
               className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-xs font-bold outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer disabled:cursor-not-allowed"
             >
               <option value="" className="bg-gray-900">All Subtopics</option>
               {subtopics.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
             </select>
           </div>

           <div className="w-full lg:w-1/4 relative">
             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-2 block">Filter List</label>
             <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Keyword search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearch}
                  className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold outline-none focus:border-indigo-500 transition-all"
                />
             </div>
           </div>
        </div>

        {/* Dynamic Content */}
        {!selectedDomain || !selectedTopic ? (
          <div className="py-24 text-center">
             <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-gray-100 group">
                <ArrowRight className="w-12 h-12 text-gray-200 group-hover:text-indigo-400 group-hover:translate-x-2 transition-all" />
             </div>
             <h3 className="text-3xl font-black text-gray-900 uppercase tracking-widest mb-4">Awaiting Selection</h3>
             <p className="text-gray-400 max-w-sm mx-auto text-sm font-bold leading-relaxed">Please select a domain and topic from the navigation bar above to load your questions.</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Accessing Intelligence Vault</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-[4rem] border-2 border-dashed border-gray-100 p-32 text-center">
             <p className="text-2xl font-black text-gray-200 uppercase tracking-widest font-sans">No records found for this criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questions.map((q) => (
              <div 
                key={q._id}
                className="group bg-white rounded-[2.5rem] p-10 border border-transparent hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 flex gap-2">
                  <button onClick={() => openEdit(q)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(q._id)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] ${q.difficulty === 'Hard' ? 'bg-rose-50 text-rose-600' : q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {q.difficulty}
                  </span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50 px-4 py-1.5 rounded-xl">
                    {q.type}
                  </span>
                </div>

                <h4 className="font-bold text-gray-900 text-xl mb-8 font-sans leading-tight pr-10">{q.questionText}</h4>
                
                <div className="flex items-center justify-between pt-8 border-t border-gray-50 mt-auto">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {q.source === 'AI' ? <BrainCircuit className="w-6 h-6" /> : q.source === 'Bulk' ? <Upload className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Subtopic</p>
                        <p className="text-xs font-bold text-gray-500">{q.subtopic || 'General'}</p>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Manual Modal - Standard premium styling */}
        {isManualModalOpen && (
          <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-12 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tightest mb-1">{editingId ? 'Edit Entry' : 'Manual Entry'}</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Adding to {selectedDomain || 'Global Bank'}</p>
                </div>
                <button onClick={() => setIsManualModalOpen(false)} className="p-4 hover:bg-gray-50 rounded-2xl transition-all">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleManualSubmit} className="p-12 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase px-1">Domain</label>
                        <select 
                          value={formData.domain}
                          onChange={(e) => setFormData({...formData, domain: e.target.value})}
                          className="w-full bg-gray-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none border border-transparent focus:border-indigo-500 focus:bg-white transition-all"
                        >
                          {domains.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase px-1">Type</label>
                        <select 
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="w-full bg-gray-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none border border-transparent focus:border-indigo-500 focus:bg-white transition-all"
                        >
                          {types.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase px-1">Topic</label>
                        <input 
                          type="text" 
                          value={formData.topic}
                          onChange={(e) => setFormData({...formData, topic: e.target.value})}
                          className="w-full bg-gray-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none border border-transparent focus:border-indigo-500 focus:bg-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase px-1">Subtopic</label>
                        <input 
                          type="text" 
                          value={formData.subtopic}
                          onChange={(e) => setFormData({...formData, subtopic: e.target.value})}
                          className="w-full bg-gray-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none border border-transparent focus:border-indigo-500 focus:bg-white transition-all"
                        />
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase px-1">Question Content</label>
                      <textarea 
                        value={formData.questionText}
                        onChange={(e) => setFormData({...formData, questionText: e.target.value})}
                        rows={3}
                        className="w-full bg-gray-50 rounded-2xl px-6 py-5 text-xs font-bold outline-none border border-transparent focus:border-indigo-500 focus:bg-white transition-all resize-none shadow-inner"
                      />
                   </div>

                   {formData.type.includes('MCQ') && (
                     <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                       {formData.options.map((opt, i) => (
                         <div key={i} className="space-y-1">
                           <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Opt {String.fromCharCode(65+i)}</label>
                           <input 
                              type="text" 
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...formData.options];
                                newOpts[i] = e.target.value;
                                setFormData({...formData, options: newOpts});
                              }}
                              className="w-full bg-white rounded-xl px-4 py-3 text-xs font-bold outline-none border border-gray-100 shadow-sm"
                           />
                         </div>
                       ))}
                     </div>
                   )}

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase px-1">Correct Key</label>
                      <input 
                        type="text" 
                        value={formData.correctAnswer}
                        onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                        className="w-full bg-gray-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none border border-transparent focus:border-indigo-500 focus:bg-white transition-all"
                      />
                   </div>
                </div>

                <button type="submit" disabled={isSaving} className="w-full py-6 bg-[#0f172a] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-indigo-100 disabled:opacity-50">
                  {isSaving ? 'Processing...' : 'Upload Question'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Modal */}
        {isBulkModalOpen && (
          <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-8">
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-16 animate-in zoom-in-95 duration-500 text-center">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white rotate-6 shadow-xl shadow-indigo-200">
                  <Upload className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tightest mb-4">Bulk Import</h2>
              <p className="text-gray-400 font-bold text-sm mb-12">Export your database via XLS using our specialized smart-template.</p>
              
              <div className="flex flex-col gap-4">
                 <label className="w-full py-8 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer group">
                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleBulkUpload} disabled={uploading} />
                    <Monitor className="w-8 h-8 text-gray-300 group-hover:text-indigo-600 mb-2 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-600">Select Document</span>
                 </label>
                 
                 <button onClick={downloadTemplate} className="w-full py-5 bg-gray-50 border border-gray-100 text-gray-400 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-3">
                    <Download className="w-4 h-4" />
                    Download Smart Template
                 </button>
              </div>

              <div className="mt-12 flex items-center gap-3 justify-center text-indigo-400 bg-indigo-50/50 py-3 rounded-2xl px-6">
                 <Info className="w-4 h-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest">New: Includes Instruction Sheet</p>
              </div>
              
              <button onClick={() => setIsBulkModalOpen(false)} className="mt-10 text-gray-300 font-black text-[10px] uppercase tracking-[0.3em] hover:text-gray-900 transition-colors">Close Portal</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QuestionBank;
