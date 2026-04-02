import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Save, ArrowLeft, PlusCircle, Clock, ShieldCheck, Trash2, Loader2, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import assessmentService from '../../services/assessmentService';

const AssessmentCreation = () => {
  const { assessmentId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    proctored: true,
    published: false,
    type: 'final'
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (assessmentId) {
        try {
          const res = await assessmentService.getAssessmentById(assessmentId);
          if (res.success) {
            const data = res.data.assessment;
            setAssessment({
              title: data.title,
              description: data.description,
              timeLimit: data.timeLimit,
              passingScore: data.passingScore,
              proctored: data.proctored,
              published: data.published,
              type: data.type
            });
            setQuestions(data.questions || []);
          }
        } catch (error) {
          toast.error("Error fetching assessment details");
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [assessmentId]);

  const handleSaveAssessment = async () => {
    if (!assessment.title) {
      toast.error("Assessment title is required");
      return;
    }

    if (questions.length === 0) {
      toast.error("Add at least one question");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...assessment, questions };
      let res;
      
      if (assessmentId) {
        res = await assessmentService.updateAssessment(assessmentId, payload);
      } else {
        res = await assessmentService.createAssessment(payload);
      }

      if (res.success) {
        toast.success(assessmentId ? "Assessment updated!" : "Assessment created!");
        navigate('/faculty/dashboard');
      }
    } catch (error) {
      toast.error(error.message || "Failed to save assessment");
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { 
      text: '', 
      options: ['', '', '', ''], 
      correctOption: 0, 
      points: 1,
      order: questions.length + 1 
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    const options = [...(updatedQuestions[qIndex].options || [])];
    options[oIndex] = value;
    updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Loading curriculum architecture...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Link to="/faculty/dashboard" className="p-3 hover:bg-gray-100 rounded-2xl transition-colors bg-white shadow-sm">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{assessmentId ? 'Edit Assessment' : 'New Assessment'}</h1>
              <p className="text-gray-500 text-sm mt-1">Design rigorous evaluations for your curriculum.</p>
            </div>
          </div>
          <button 
            onClick={handleSaveAssessment}
            disabled={saving}
            className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Synchronizing...' : 'Save Assessment'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Assessment Details */}
            <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <ClipboardCheck className="w-6 h-6 text-blue-600" />
                Assessment Configuration
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-widest">Assessment Title</label>
                  <input 
                    type="text" 
                    value={assessment.title}
                    onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
                    placeholder="e.g. Final Certification: Cloud Computing"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-widest">Description</label>
                  <textarea 
                    value={assessment.description}
                    onChange={(e) => setAssessment({ ...assessment, description: e.target.value })}
                    placeholder="Provide instructions for the candidates..."
                    rows={3}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium leading-relaxed"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-widest">Time Limit (Min)</label>
                    <div className="relative">
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="number" 
                        value={assessment.timeLimit}
                        onChange={(e) => setAssessment({ ...assessment, timeLimit: parseInt(e.target.value) })}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-widest">Passing Grade (%)</label>
                    <input 
                      type="number" 
                      value={assessment.passingScore}
                      onChange={(e) => setAssessment({ ...assessment, passingScore: parseInt(e.target.value) })}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Questions Section */}
            <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <PlusCircle className="w-6 h-6 text-blue-600" />
                  Exam Questions
                </h2>
                <button 
                  onClick={addQuestion}
                  className="px-6 py-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Multiple Choice
                </button>
              </div>

              <div className="space-y-8">
                {questions.map((question, qIndex) => (
                  <div key={qIndex} className="p-8 border border-gray-100 rounded-[32px] bg-gray-50/50 relative group">
                    <button 
                      onClick={() => removeQuestion(qIndex)}
                      className="absolute top-6 right-6 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="space-y-6">
                      <div className="flex items-start gap-5">
                        <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-xl shrink-0 mt-1">
                          {qIndex + 1}
                        </div>
                        <textarea 
                          value={question.text}
                          onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                          placeholder="What is the primary function of...?"
                          rows={2}
                          className="flex-1 px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-14">
                        {question.options?.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm transition-all focus-within:border-blue-200 focus-within:ring-2 focus-within:ring-blue-50">
                            <input 
                              type="radio" 
                              name={`correct-${qIndex}`}
                              checked={question.correctOption === oIndex}
                              onChange={() => updateQuestion(qIndex, 'correctOption', oIndex)}
                              className="w-5 h-5 text-blue-600 focus:ring-blue-500 ml-2"
                            />
                            <input 
                              type="text" 
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              placeholder={`Distractor Option ${oIndex + 1}`}
                              className="flex-1 px-4 py-2 border-none bg-transparent text-sm focus:outline-none font-medium"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {questions.length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[40px] bg-gray-50/20">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gray-200 mx-auto mb-6 border border-gray-50">
                      <ClipboardCheck className="w-10 h-10" />
                    </div>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">The exam is empty. Add your first question.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-10">
            <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Security & Status</h3>
              
              <div className="space-y-6">
                <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-blue-50/50 transition-colors">
                  <div className="flex-1">
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-green-600" />
                       AI Proctoring
                    </span>
                    <p className="text-[10px] text-gray-500 mt-0.5">Detect tab-switching & multiple faces</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500"
                    checked={assessment.proctored}
                    onChange={(e) => setAssessment({ ...assessment, proctored: e.target.checked })}
                  />
                </label>

                <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-blue-50/50 transition-colors">
                  <div className="flex-1">
                    <span className="text-sm font-bold text-gray-900">Publish Now</span>
                    <p className="text-[10px] text-gray-500 mt-0.5">Make available for student enrollment</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500"
                    checked={assessment.published}
                    onChange={(e) => setAssessment({ ...assessment, published: e.target.checked })}
                  />
                </label>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Category</label>
                  <select 
                    value={assessment.type}
                    onChange={(e) => setAssessment({ ...assessment, type: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-700"
                  >
                    <option value="practice">📝 Practice Test</option>
                    <option value="final">🎓 Final Assessment</option>
                    <option value="quiz">⚡ Quick Quiz</option>
                  </select>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AssessmentCreation;
