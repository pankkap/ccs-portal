import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Trainings from './pages/Trainings';
import PlacementsPage from './pages/PlacementsPage';
import FacultyPage from './pages/FacultyPage';
import ELibrary from './pages/ELibrary';
import Contact from './pages/Contact';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import SystemGovernance from './pages/Admin/SystemGovernance';
import PageManagement from './pages/Admin/PageManagement';
import FacultyManagement from './pages/Admin/FacultyManagement';
import AccessControl from './pages/Admin/AccessControl';
import UnderConstruction from './pages/Admin/UnderConstruction';
import CourseManagement from './pages/Admin/CourseManagement';
import AdminELibraryManagement from './pages/Admin/ELibraryManagement';
import SchoolManagement from './pages/Admin/SchoolManagement';
import StudentManagement from './pages/Admin/StudentManagement';
import AdminCertificateTemplates from './pages/Admin/CertificateTemplates';

// Faculty Pages
import FacultyDashboard from './pages/Faculty/FacultyDashboard';
import CourseCreation from './pages/Faculty/CourseCreation';
import AssessmentCreation from './pages/Faculty/AssessmentCreation';
import FacultyMyCourses from './pages/Faculty/MyCourses';
import FacultyProfile from './pages/Faculty/FacultyProfile';
import ELibraryManagement from './pages/Faculty/ELibraryManagement';
import AIQuestionGenerator from './pages/Faculty/AIQuestionGenerator';
import QuestionBank from './pages/Faculty/QuestionBank';
import TestBuilder from './pages/Faculty/TestBuilder';
import FacultyMockTests from './pages/Faculty/MockTests';

// Placement Pages
import PlacementManagement from './pages/Placement/PlacementManagement';
import CreatePlacementDrive from './pages/Placement/CreatePlacementDrive';
import PlacementDashboard from './pages/Placement/PlacementDashboard';
import PlacementDriveDetail from './pages/Placement/PlacementDriveDetail';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import StudentMyCourses from './pages/Student/MyCourses';
import CourseView from './pages/Student/CourseView';
import AssessmentView from './pages/Student/AssessmentView';
import MockTests from './pages/Student/MockTests';
import Placements from './pages/Student/Placements';
import StudentPlacementDetail from './pages/Student/PlacementDetail';
import Certificates from './pages/Student/Certificates';
import StudentSettings from './pages/Student/Settings';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/trainings" element={<Trainings />} />
          <Route path="/placements" element={<PlacementsPage />} />
          <Route path="/faculty" element={<FacultyPage />} />
          <Route path="/e-library" element={<ELibrary />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/access-control" element={<ProtectedRoute allowedRoles={['admin']}><AccessControl /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={['admin']}><FacultyManagement /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><StudentManagement /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><CourseManagement /></ProtectedRoute>} />
          <Route path="/admin/elibrary" element={<ProtectedRoute allowedRoles={['admin']}><AdminELibraryManagement /></ProtectedRoute>} />
          <Route path="/admin/governance" element={<ProtectedRoute allowedRoles={['admin']}><SystemGovernance /></ProtectedRoute>} />
          <Route path="/admin/schools" element={<ProtectedRoute allowedRoles={['admin']}><SchoolManagement /></ProtectedRoute>} />
          <Route path="/admin/certificates" element={<ProtectedRoute allowedRoles={['admin']}><AdminCertificateTemplates /></ProtectedRoute>} />
          <Route path="/admin/pages" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><PageManagement /></ProtectedRoute>} />

          {/* Faculty Routes */}
          <Route path="/faculty/dashboard" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/faculty/courses" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><FacultyMyCourses /></ProtectedRoute>} />
          <Route path="/faculty/course/new" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><CourseCreation /></ProtectedRoute>} />
          <Route path="/faculty/course/edit/:courseId" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><CourseCreation /></ProtectedRoute>} />
          <Route path="/faculty/assessment/new" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><AssessmentCreation /></ProtectedRoute>} />
          <Route path="/faculty/assessment/edit/:assessmentId" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><AssessmentCreation /></ProtectedRoute>} />
          <Route path="/faculty/profile" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><FacultyProfile /></ProtectedRoute>} />
          <Route path="/faculty/mock-tests" element={<ProtectedRoute allowedRoles={['faculty', 'admin', 'placement']}><FacultyMockTests /></ProtectedRoute>} />
          <Route path="/faculty/test-builder" element={<ProtectedRoute allowedRoles={['faculty', 'admin', 'placement']}><TestBuilder /></ProtectedRoute>} />
          <Route path="/faculty/test-builder/:testId" element={<ProtectedRoute allowedRoles={['faculty', 'admin', 'placement']}><TestBuilder /></ProtectedRoute>} />
          <Route path="/faculty/elibrary" element={<ProtectedRoute allowedRoles={['faculty', 'admin', 'placement']}><ELibraryManagement /></ProtectedRoute>} />

          {/* Placement Routes */}
          <Route path="/placement/manage" element={<ProtectedRoute allowedRoles={['placement', 'admin', 'staff']}><PlacementManagement /></ProtectedRoute>} />
          <Route path="/placement/create" element={<ProtectedRoute allowedRoles={['placement', 'admin', 'staff']}><CreatePlacementDrive /></ProtectedRoute>} />
          <Route path="/placement/edit/:id" element={<ProtectedRoute allowedRoles={['placement', 'admin', 'staff']}><CreatePlacementDrive /></ProtectedRoute>} />
          <Route path="/placement/drive/:id" element={<ProtectedRoute allowedRoles={['placement', 'admin', 'staff']}><PlacementDriveDetail /></ProtectedRoute>} />
          <Route path="/placement/progress/:id" element={<ProtectedRoute allowedRoles={['placement', 'admin', 'staff']}><UnderConstruction pageName="Drive Progress Report" /></ProtectedRoute>} />
          <Route path="/placement" element={<ProtectedRoute allowedRoles={['placement', 'admin', 'staff']}><PlacementDashboard /></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student', 'admin']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute allowedRoles={['student', 'admin']}><StudentMyCourses /></ProtectedRoute>} />
          <Route path="/student/course/:courseId" element={<ProtectedRoute allowedRoles={['student', 'admin']}><CourseView /></ProtectedRoute>} />
          <Route path="/student/assessment/:assessmentId" element={<ProtectedRoute allowedRoles={['student', 'admin']}><AssessmentView /></ProtectedRoute>} />
          <Route path="/student/mock-tests" element={<ProtectedRoute allowedRoles={['student', 'admin']}><MockTests /></ProtectedRoute>} />
          <Route path="/student/placements" element={<ProtectedRoute allowedRoles={['student', 'admin']}><Placements /></ProtectedRoute>} />
          <Route path="/student/placements/:id" element={<ProtectedRoute allowedRoles={['student', 'admin']}><StudentPlacementDetail /></ProtectedRoute>} />
          <Route path="/student/certificates" element={<ProtectedRoute allowedRoles={['student', 'admin']}><Certificates /></ProtectedRoute>} />
          <Route path="/student/settings" element={<ProtectedRoute allowedRoles={['student', 'admin']}><StudentSettings /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}

export default App;
