import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Save, ArrowLeft, PlusCircle, Clock, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateId } from '../../lib/utils';

const AssessmentCreation = () => {
  const { assessmentId } = useParams();
  const { user, profile } = useAuth();
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
    if (!user) return;

    const fetchData = async () => {
      if (assessmentId) {
        try {
          const assessmentDoc = await getDoc(doc(db, 'assessments', assessmentId));
          if (assessmentDoc.exists()) {
            setAssessment({ id: assessmentDoc.id, ...assessmentDoc.data() });
            
            const questionsQuery = query(
              collection(db, 'assessments', assessmentId, 'questions'),
              orderBy('order', 'asc')
            );
            const questionsSnap = await getDocs(questionsQuery);
            setQuestions(questionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }
        } catch (error) {
          console.error("Error fetching assessment:", error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [user, assessmentId]);

  const handleSaveAssessment = async () => {
    if (!user || !profile) return;
    if (!assessment.title) {
      toast.error("Assessment title is required");
      return;
    }

    setSaving(true);
    try {
      const id = assessmentId || generateId();
      const assessmentData = {
        ...assessment,
        id,
        facultyId: user.uid,
        facultyName: profile.name,
        createdAt: assessment.createdAt || new Date().toISOString()
      };

      await setDoc(doc(db, 'assessments', id), assessmentData);
      
      // Save questions
      for (const question of questions) {
        const questionId = question.id || generateId();
        const questionData = {
          ...question,
          id: questionId,
          assessmentId: id,
          order: question.order || 0
        };
        await setDoc(doc(db, 'assessments', id, 'questions', questionId), questionData);
      }

      toast.success(assessmentId ? "Assessment updated!" : "Assessment created!");
      navigate('/faculty');
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Failed to save assessment");
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

  if (loading) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link to="/faculty" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{assessmentId ? 'Edit Assessment' : 'Create New Assessment'}</h1>
          </div>
          <button 
            onClick={handleSaveAssessment}
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Assessment'}
          </button>
        </header>

        <div className="space-y-8">
          {/* Assessment Details */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Assessment Configuration</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Assessment Title</label>
                <input 
                  type="text" 
                  value={assessment.title}
                  onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
                  placeholder="e.g. Final Assessment: Data Structures"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Time Limit (minutes)</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="number" 
                      value={assessment.timeLimit}
                      onChange={(e) => setAssessment({ ...assessment, timeLimit: parseInt(e.target.value) })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Passing Score (%)</label>
                  <input 
                    type="number" 
                    value={assessment.passingScore}
                    onChange={(e) => setAssessment({ ...assessment, passingScore: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="proctored"
                    checked={assessment.proctored}
                    onChange={(e) => setAssessment({ ...assessment, proctored: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="proctored" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    Enable AI Proctoring
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="published"
                    checked={assessment.published}
                    onChange={(e) => setAssessment({ ...assessment, published: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="published" className="text-sm font-bold text-gray-700">Publish to students</label>
                </div>
              </div>
            </div>
          </section>

          {/* Questions Section */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Questions</h2>
              <button 
                onClick={addQuestion}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add Question
              </button>
            </div>

            <div className="space-y-8">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="p-8 border border-gray-100 rounded-3xl bg-gray-50/50 relative group">
                  <button 
                    onClick={() => removeQuestion(qIndex)}
                    className="absolute top-6 right-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                        {qIndex + 1}
                      </div>
                      <textarea 
                        value={question.text}
                        onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                        placeholder="Question text"
                        rows={2}
                        className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
                      {question.options?.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name={`correct-${qIndex}`}
                            checked={question.correctOption === oIndex}
                            onChange={() => updateQuestion(qIndex, 'correctOption', oIndex)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <input 
                            type="text" 
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            className={`flex-1 px-4 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                              question.correctOption === oIndex ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {questions.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                  <p className="text-sm text-gray-400">No questions added yet. Click "Add Question" to start.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default AssessmentCreation;
