import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Camera, ShieldAlert, Clock, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { generateId } from '../../lib/utils';

const AssessmentView = () => {
  const { courseId, assessmentId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('verification');
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  // Test State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isSuspended, setIsSuspended] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    if (!user || !courseId || !assessmentId) return;

    const fetchData = async () => {
      try {
        const assessmentDoc = await getDoc(doc(db, 'courses', courseId, 'assessments', assessmentId));
        if (!assessmentDoc.exists()) {
          toast.error("Assessment not found");
          navigate(`/student/courses/${courseId}`);
          return;
        }
        const assessmentData = { id: assessmentDoc.id, ...assessmentDoc.data() };
        setAssessment(assessmentData);
        setTimeLeft(assessmentData.timeLimit * 60);

        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('studentId', '==', user.uid),
          where('courseId', '==', courseId)
        );
        const enrollmentsSnap = await getDocs(enrollmentsQuery);
        if (!enrollmentsSnap.empty) {
          setEnrollment({ id: enrollmentsSnap.docs[0].id, ...enrollmentsSnap.docs[0].data() });
        }
      } catch (error) {
        console.error("Error fetching assessment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, courseId, assessmentId, navigate]);

  // Camera Verification
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Camera access is required for proctored assessments.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Tab Switching Detection
  useEffect(() => {
    if (step !== 'test' || isSuspended) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const next = prev + 1;
          if (next >= 5) {
            setIsSuspended(true);
            toast.error("Test suspended due to multiple tab switches.");
          } else {
            toast.warning(`Warning: Tab switch detected! (${next}/5)`);
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [step, isSuspended]);

  // Timer
  useEffect(() => {
    if (step !== 'test' || isSuspended || timeLeft <= 0) return;

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
  }, [step, isSuspended, timeLeft]);

  const handleStartTest = () => {
    if (!cameraStream) {
      toast.error("Please verify your identity with the camera first.");
      return;
    }
    setStep('test');
  };

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!assessment || !user || !enrollment) return;

    let correctCount = 0;
    assessment.questions?.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const totalQuestions = assessment.questions?.length || 1;
    const finalScore = Math.round((correctCount / totalQuestions) * 100);
    const isPassed = finalScore >= assessment.passingScore;
    
    setScore(finalScore);
    setPassed(isPassed);
    setStep('result');
    stopCamera();

    try {
      // Update enrollment status if passed
      if (isPassed && enrollment.status !== 'completed') {
        await updateDoc(doc(db, 'enrollments', enrollment.id), {
          status: 'completed',
          progress: 100
        });

        // Generate Certificate
        const certId = generateId();
        const certificate = {
          id: certId,
          studentId: user.uid,
          studentName: profile?.name || 'Student',
          courseId: assessment.courseId,
          courseTitle: 'Course Title Placeholder', // In real app, fetch this
          issuedAt: new Date().toISOString(),
          certificateNumber: `CERT-${certId.substring(0, 8).toUpperCase()}`
        };
        await addDoc(collection(db, 'certificates'), certificate);
        toast.success("Congratulations! You've earned a certificate.");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
    }
  };

  if (loading) return null;
  if (!assessment) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isSuspended) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-red-100">
          <ShieldAlert className="w-20 h-20 text-red-600 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Suspended</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Your test has been suspended due to unusual activity (multiple tab switches). Please contact your faculty to reset your attempt.
          </p>
          <Link to={`/student/courses/${courseId}`} className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all">
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  if (step === 'verification') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-10 text-center">
            <ShieldCheck className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Camera Verification Required</h2>
            <p className="text-gray-500 mb-10">Please confirm your identity to start the proctored assessment.</p>
            
            <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden mb-10 border-4 border-gray-100 shadow-inner">
              {!cameraStream ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                  <Camera className="w-12 h-12 mb-4 opacity-50" />
                  <button 
                    onClick={startCamera}
                    className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-all"
                  >
                    Enable Camera
                  </button>
                </div>
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={`/student/courses/${courseId}`} className="px-8 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
                Cancel
              </Link>
              <button 
                onClick={handleStartTest}
                disabled={!cameraStream}
                className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-xl shadow-blue-100"
              >
                Confirm & Start Test
              </button>
            </div>
          </div>
          <div className="bg-blue-50 p-6 border-t border-blue-100">
            <div className="flex gap-3">
              <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Proctoring Active:</strong> This test is monitored. Tab switching, application switching, or closing the camera will result in immediate suspension.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-gray-100">
          {passed ? (
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-12 h-12" />
            </div>
          )}
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {passed ? 'Congratulations!' : 'Assessment Completed'}
          </h2>
          <p className="text-gray-500 mb-8">
            {passed 
              ? `You have successfully passed the assessment with a score of ${score}%.` 
              : `You scored ${score}%. Unfortunately, you need ${assessment.passingScore}% to pass.`}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-6 bg-gray-50 rounded-2xl">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Score</p>
              <p className={`text-3xl font-black ${passed ? 'text-green-600' : 'text-red-600'}`}>{score}%</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Required</p>
              <p className="text-3xl font-black text-gray-900">{assessment.passingScore}%</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {passed && (
              <Link to="/student/certificates" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                View Certificate
              </Link>
            )}
            <Link to={`/student/courses/${courseId}`} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all">
              Back to Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions?.[currentQuestionIndex];

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Test Header */}
      <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            CCS
          </div>
          <div>
            <h1 className="font-bold text-gray-900">{assessment.title}</h1>
            <p className="text-xs text-gray-500">Question {currentQuestionIndex + 1} of {assessment.questions?.length || 0}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-100">
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-3 pl-8 border-l border-gray-200">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Proctoring Active</p>
              <p className="text-sm font-bold text-green-600 flex items-center gap-1 justify-end">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                Monitoring Live
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-900 rounded-xl overflow-hidden border-2 border-white shadow-lg">
               <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover grayscale"
                />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-8 md:p-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-gray-100">
            <div 
              className="h-full bg-blue-600 transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + 1) / (assessment.questions?.length || 1)) * 100}%` }}
            ></div>
          </div>

          <div className="p-10 md:p-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-10 leading-relaxed">
              {currentQuestion.text}
            </h2>

            <div className="space-y-4">
              {currentQuestion.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(currentQuestion.id, i)}
                  className={`w-full p-6 text-left rounded-2xl border-2 transition-all flex items-center justify-between group ${
                    answers[currentQuestion.id] === i 
                      ? 'border-blue-600 bg-blue-50 text-blue-900' 
                      : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="font-medium">{option}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    answers[currentQuestion.id] === i 
                      ? 'border-blue-600 bg-blue-600' 
                      : 'border-gray-200 group-hover:border-blue-300'
                  }`}>
                    {answers[currentQuestion.id] === i && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
            >
              Previous
            </button>

            {currentQuestionIndex === assessment.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
              >
                Submit Test
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(assessment.questions.length - 1, prev + 1))}
                className="px-10 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                Next Question <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="flex gap-2">
            {assessment.questions?.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === currentQuestionIndex ? 'bg-blue-600 w-8' : 
                  answers[assessment.questions?.[i].id || ''] !== undefined ? 'bg-blue-200' : 'bg-gray-200'
                }`}
              ></button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssessmentView;
