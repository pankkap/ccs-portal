import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Camera, ShieldAlert, Clock, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import assessmentService from '../../services/assessmentService';
import enrollmentService from '../../services/enrollmentService';

const AssessmentView = () => {
  const { courseId, assessmentId } = useParams();
  const { profile } = useAuth();
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assessmentRes = await assessmentService.getAssessmentById(assessmentId);
        if (assessmentRes.success) {
          const data = assessmentRes.data.assessment;
          setAssessment(data);
          setTimeLeft(data.timeLimit * 60);
        }

        const enrollRes = await enrollmentService.getEnrollmentByCourseId(courseId);
        if (enrollRes.success) {
          setEnrollment(enrollRes.data.enrollment);
        }
      } catch (error) {
        console.error("Error fetching assessment:", error);
        toast.error("Failed to authenticate assessment session");
        navigate(`/student/course/${courseId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, assessmentId, navigate]);

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
      toast.error("Biometric verification is required for proctored sessions.");
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
            toast.error("Proctoring Protocol: Session suspended due to window violation.");
          } else {
            toast.warning(`Security Alert: Tab switch detected! (${next}/5 warnings)`);
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
    if (!cameraStream && assessment?.proctored) {
      toast.error("Biometric verification failed. Check camera access.");
      return;
    }
    setStep('test');
    // Lock mouse scroll or other proctoring if needed
  };

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!assessment || submitting) return;

    setSubmitting(true);
    try {
      const res = await assessmentService.submitAssessment(assessment._id, {
        answers,
        courseId
      });

      if (res.success) {
        setScore(res.data.score);
        setPassed(res.data.passed);
        setStep('result');
        stopCamera();
      }
    } catch (error) {
      toast.error("Fatal error during result transmission");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Initializing Proctoring Environment...</p>
    </div>
  );

  if (!assessment) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isSuspended) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-12 text-center border border-red-100">
          <ShieldAlert className="w-20 h-20 text-red-600 mx-auto mb-8 animate-pulse" />
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Access Suspended</h2>
          <p className="text-gray-400 mb-10 leading-relaxed font-medium">
            Multiple window violations detected. Your attempt has been logged and invalidated. Contact administration for session audit.
          </p>
          <Link to={`/student/course/${courseId}`} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
            Exit Environment
          </Link>
        </div>
      </div>
    );
  }

  if (step === 'verification') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-3xl w-full bg-white rounded-[48px] shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-12 text-center">
            <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Security Protocol</h2>
            <p className="text-gray-400 mb-12 font-medium">Verify your identity to unlock the {assessment.title} gateway.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="relative aspect-square md:aspect-auto bg-gray-900 rounded-[32px] overflow-hidden border-4 border-gray-100 shadow-inner group">
                {!cameraStream ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                    <Camera className="w-16 h-16 mb-6 opacity-30 group-hover:scale-110 transition-transform" />
                    <button 
                      onClick={startCamera}
                      className="px-8 py-4 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/40"
                    >
                      Activate Biometrics
                    </button>
                  </div>
                ) : (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover grayscale brightness-110 contrast-125"
                  />
                )}
                {cameraStream && (
                   <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-green-500/80 backdrop-blur rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Bio-Feed</span>
                   </div>
                )}
              </div>

              <div className="flex flex-col justify-center text-left space-y-8">
                 <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Session Guidelines</h3>
                    <ul className="space-y-3">
                       {[
                          "Remain in the center of the frame",
                          "Background must be neutral and lit",
                          "Tab switching will terminate session",
                          "Mobile devices are strictly prohibited"
                       ].map((rule, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-500 font-medium leading-tight">
                             <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                <ShieldCheck className="w-3 h-3 text-blue-600" />
                             </div>
                             {rule}
                          </li>
                       ))}
                    </ul>
                 </div>

                 <div className="flex flex-col gap-4">
                    <button 
                      onClick={handleStartTest}
                      disabled={!cameraStream && assessment.proctored}
                      className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl disabled:opacity-20"
                    >
                      Authenticate & Proceed
                    </button>
                    <Link to={`/student/course/${courseId}`} className="w-full py-4 text-gray-400 font-bold text-xs uppercase tracking-widest text-center hover:text-gray-600 transition-colors">
                      Abort Operation
                    </Link>
                 </div>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-8 border-t border-red-100/50">
            <div className="flex gap-4">
              <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0" />
              <p className="text-xs text-red-900 leading-relaxed font-bold uppercase tracking-tight">
                AI Proctoring Active: This session utilizes real-time facial analysis and viewport monitoring. Any violation will lead to immediate automated suspension with no warnings.
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
        <div className="max-w-xl w-full bg-white rounded-[48px] shadow-2xl p-14 text-center border border-gray-100">
          {passed ? (
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100">
              <CheckCircle2 className="w-14 h-14" />
            </div>
          ) : (
            <div className="w-24 h-24 bg-red-100 text-red-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-100">
              <AlertTriangle className="w-14 h-14" />
            </div>
          )}
          
          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
            {passed ? 'Certification Earned' : 'Curriculum Incomplete'}
          </h2>
          <p className="text-gray-400 mb-12 font-medium text-lg leading-relaxed">
            {passed 
              ? `Outstanding performance. Your verified certificate has been added to your vault.` 
              : `Total competency not achieved. Review the course material and attempt the final audit again.`}
          </p>

          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Achieved Score</p>
              <p className={`text-4xl font-black transition-all ${passed ? 'text-green-600' : 'text-red-500'}`}>{score}%</p>
            </div>
            <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Competency Bar</p>
              <p className="text-4xl font-black text-gray-900">{assessment.passingScore}%</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {passed && (
              <Link to="/student/certificates" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100">
                Claim Verified Certificate
              </Link>
            )}
            <Link to={`/student/course/${courseId}`} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl">
              Back to Curriculum
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions?.[currentQuestionIndex];

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Test Header */}
      <header className="h-24 bg-white border-b border-gray-100 flex items-center justify-between px-10 md:px-20 sticky top-0 z-20 shadow-sm backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black shadow-xl">
            CCS
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-gray-900 uppercase tracking-tight text-sm">{assessment.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {assessment.questions?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all ${timeLeft < 300 ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' : 'bg-gray-50 border-gray-100'}`}>
            <Clock className="w-6 h-6" />
            <span className="font-mono font-black text-2xl tracking-tighter">{formatTime(timeLeft)}</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-4 pl-10 border-l border-gray-100">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Link</p>
              <p className="text-xs font-black text-green-600 flex items-center gap-2 justify-end uppercase mt-1">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse shadow-sm shadow-green-400"></span>
                ACTIVE
              </p>
            </div>
            <div className="w-14 h-14 bg-black rounded-[20px] overflow-hidden border border-white/20 shadow-2xl ring-4 ring-gray-50">
               <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover grayscale scale-110"
                />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-14 lg:p-20">
        <div className="bg-white rounded-[48px] shadow-2xl border border-gray-100 overflow-hidden group">
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-50">
            <div 
              className="h-full bg-blue-600 transition-all duration-1000 shadow-sm shadow-blue-500" 
              style={{ width: `${((currentQuestionIndex + 1) / (assessment.questions?.length || 1)) * 100}%` }}
            ></div>
          </div>

          <div className="p-12 md:p-20 lg:p-24">
             <div className="flex gap-6 mb-12">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl shrink-0">
                  {currentQuestionIndex + 1}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight tracking-tight">
                  {currentQuestion.text}
                </h2>
             </div>

            <div className="space-y-5">
              {currentQuestion.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(currentQuestion._id, i)}
                  className={`w-full p-8 text-left rounded-3xl border-2 transition-all flex items-center justify-between group/opt ${
                    answers[currentQuestion._id] === i 
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 scale-[1.02] shadow-xl shadow-blue-50' 
                      : 'border-gray-50 hover:border-blue-200 hover:bg-gray-50/50 text-gray-600'
                  }`}
                >
                  <span className="font-bold text-lg">{option}</span>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    answers[currentQuestion._id] === i 
                      ? 'border-blue-600 bg-blue-600' 
                      : 'border-gray-200 group-hover/opt:border-blue-300'
                  }`}>
                    {answers[currentQuestion._id] === i && <div className="w-3 h-3 bg-white rounded-full"></div>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-10 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-8 py-4 text-xs font-black text-gray-400 hover:text-gray-900 disabled:opacity-20 transition-colors uppercase tracking-widest"
            >
              Back
            </button>

            {currentQuestionIndex === assessment.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 flex items-center gap-3 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                Finalize & Submit
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(assessment.questions.length - 1, prev + 1))}
                className="px-12 py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3 shadow-2xl"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {assessment.questions?.map((q, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`w-10 h-10 rounded-xl transition-all font-black text-[10px] flex items-center justify-center border ${
                  i === currentQuestionIndex ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-125' : 
                  answers[q._id] !== undefined ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-300 border-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssessmentView;
