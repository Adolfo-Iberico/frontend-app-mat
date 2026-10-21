// Define las rutas de la aplicación y compone sus proveedores globales.
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Loading from './components/Common/Loading';
import { env } from './config/env';

// Landing
const LandingPage = React.lazy(() => import('./components/Landing/LandingPage'));

// Layout
import MainLayout from './components/Layout/MainLayout';

// Auth
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
const LegalPage = React.lazy(() => import('./components/Auth/LegalPage'));

// Common (páginas compartidas por todos los roles)
import Profile from './components/Common/Profile';
import Notifications from './components/Common/Notifications';
import Settings from './components/Common/Settings';
import Help from './components/Common/Help';
const Messaging = React.lazy(() => import('./components/Common/Messaging'));
const Forum = React.lazy(() => import('./components/Common/Forum'));

// Student
const StudentDashboard = React.lazy(() => import('./components/Student/StudentDashboard'));
const RoleDashboard = React.lazy(() => import('./components/Common/RoleDashboard'));
const LessonList = React.lazy(() => import('./components/Student/LessonList'));
const LessonDetail = React.lazy(() => import('./components/Student/LessonDetail'));
const EvaluationList = React.lazy(() => import('./components/Student/EvaluationList'));
const EvaluationPlayer = React.lazy(() => import('./components/Student/EvaluationPlayer'));
const EvaluationResult = React.lazy(() => import('./components/Student/EvaluationResult'));
const ExamList = React.lazy(() => import('./components/Student/ExamList'));
const ExamPlayer = React.lazy(() => import('./components/Student/ExamPlayer'));
const StudentWorkBoard = React.lazy(() => import('./components/Student/StudentWorkBoard'));
const StudentRanking = React.lazy(() => import('./components/Student/StudentRanking'));
const Gamification = React.lazy(() => import('./components/Student/Gamification'));
const MathSimulations = React.lazy(() => import('./components/Student/MathSimulations'));

// Teacher
const TeacherDashboard = React.lazy(() => import('./components/Teacher/TeacherDashboard'));
const LessonEditor = React.lazy(() => import('./components/Teacher/LessonEditor'));
const EvaluationCreator = React.lazy(() => import('./components/Teacher/EvaluationCreator'));
const StudentProgress = React.lazy(() => import('./components/Teacher/StudentProgress'));
const Reports = React.lazy(() => import('./components/Teacher/Reports'));
const ExamManager = React.lazy(() => import('./components/Teacher/ExamManager'));
const ExamEditor = React.lazy(() => import('./components/Teacher/ExamEditor'));
const ExamStats = React.lazy(() => import('./components/Teacher/ExamStats'));
const TeacherStudentRanking = React.lazy(() => import('./components/Teacher/TeacherStudentRanking'));
const TeacherWorkBoard = React.lazy(() => import('./components/Teacher/TeacherWorkBoard'));
const AcademicCalendar = React.lazy(() => import('./components/Teacher/AcademicCalendar'));
const TeacherSalones = React.lazy(() => import('./components/Teacher/TeacherSalones'));
const TeacherGames = React.lazy(() => import('./components/Teacher/TeacherGames'));

// Coordinator
const CoordinatorSalones = React.lazy(() => import('./components/Coordinator/CoordinatorSalones'));

// Student - Cursos
const StudentCourses = React.lazy(() => import('./components/Student/StudentCourses'));
const StudentGames = React.lazy(() => import('./components/Student/StudentGames'));

// Admin - Work Board
const AdminWorkBoard = React.lazy(() => import('./components/Admin/AdminWorkBoard'));

// Parent
const ParentDashboard = React.lazy(() => import('./components/Parent/ParentDashboard'));
const ChildProgress = React.lazy(() => import('./components/Parent/ChildProgress'));
const ChildReport = React.lazy(() => import('./components/Parent/ChildReport'));
const ParentStudentLookup = React.lazy(() => import('./components/Parent/ParentStudentLookup'));

// Admin
const AdminDashboard = React.lazy(() => import('./components/Admin/AdminDashboard'));
const UserManagement = React.lazy(() => import('./components/Admin/UserManagement'));
const StudentManager = React.lazy(() => import('./components/Staff/StudentManager'));
const SystemConfig = React.lazy(() => import('./components/Admin/SystemConfig'));
const ColorSettings = React.lazy(() => import('./components/Admin/ColorSettings'));
const TranslationPanel = React.lazy(() => import('./components/Admin/TranslationPanel'));

import './App.css';

const GOOGLE_CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <NotificationProvider>
              <ErrorBoundary>
              <div className="min-h-screen bg-[var(--background)]">
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'var(--surface)',
                      color: 'var(--on-surface)',
                      border: '1px solid var(--outline-variant)'
                    }
                  }}
                />
                <Suspense fallback={<Loading />}>
                <Routes>
                  {/* Landing */}
                  <Route path="/" element={<LandingPage />} />

                  {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/terms" element={<LegalPage kind="terms" />} />
<Route path="/privacy" element={<LegalPage kind="privacy" />} />
<Route path="/data-policy" element={<LegalPage kind="data" />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                      {/* Student */}
                      <Route path="/dashboard" element={<RoleDashboard />} />
                      <Route path="/my-work" element={<StudentWorkBoard />} />
                      <Route path="/ranking" element={<StudentRanking />} />
                      <Route path="/lessons" element={<LessonList />} />
                      <Route path="/lessons/:id" element={<LessonDetail />} />
                      <Route path="/evaluations" element={<EvaluationList />} />
                      <Route path="/evaluations/:id/take" element={<EvaluationPlayer />} />
                      <Route path="/evaluations/:id/result" element={<EvaluationResult />} />
                      <Route path="/exams" element={<ExamList />} />
                      <Route path="/exams/:id/take" element={<ExamPlayer />} />
                      <Route path="/gamification" element={<Gamification />} />
                      <Route path="/simulations" element={<MathSimulations />} />
                      
                      {/* Common */}
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/messages" element={<Messaging />} />
                      <Route path="/forum" element={<Forum />} />
                      <Route path="/my-courses" element={<StudentCourses />} />
                      <Route path="/games" element={<StudentGames />} />
                    </Route>
                  </Route>

                  {/* Teacher Routes */}
                  <Route element={<ProtectedRoute roles={['teacher', 'admin']} />}>
                    <Route element={<MainLayout />}>
                      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                      <Route path="/teacher/lessons/create" element={<LessonEditor />} />
                      <Route path="/teacher/lessons/:id/edit" element={<LessonEditor />} />
                      <Route path="/teacher/evaluations/create" element={<EvaluationCreator />} />
                      <Route path="/teacher/evaluations/:id/edit" element={<EvaluationCreator />} />
                      <Route path="/teacher/exams" element={<ExamManager />} />
                      <Route path="/teacher/exams/create" element={<ExamEditor />} />
                      <Route path="/teacher/exams/:id/edit" element={<ExamEditor />} />
                      <Route path="/teacher/exams/:id/stats" element={<ExamStats />} />
                      <Route path="/teacher/ranking" element={<TeacherStudentRanking />} />
                      <Route path="/teacher/works" element={<TeacherWorkBoard />} />
                      <Route path="/teacher/students/:id/progress" element={<StudentProgress />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/teacher/calendar" element={<AcademicCalendar />} />
                      <Route path="/teacher/salones" element={<TeacherSalones />} />
                      <Route path="/teacher/games" element={<TeacherGames />} />
                    </Route>
                  </Route>

                  {/* Coordinator / Director Routes */}
                  <Route element={<ProtectedRoute roles={['coordinador', 'director']} />}>
                    <Route element={<MainLayout />}>
                      <Route path="/coordinator/salones" element={<CoordinatorSalones />} />
                      <Route path="/teacher/salones" element={<TeacherSalones />} />
                    </Route>
                  </Route>

                  {/* Student Manager: docente, coordinador, director y admin */}
                  <Route element={<ProtectedRoute roles={['teacher', 'coordinador', 'director', 'admin']} />}>
                    <Route element={<MainLayout />}>
                      <Route path="/students-manager" element={<StudentManager />} />
                    </Route>
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<ProtectedRoute roles={['admin']} />}>
                    <Route element={<MainLayout />}>
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      <Route path="/admin/users" element={<UserManagement />} />
                      <Route path="/admin/config" element={<SystemConfig />} />
                      <Route path="/admin/colors" element={<ColorSettings />} />
                      <Route path="/admin/works" element={<AdminWorkBoard />} />
                      <Route path="/admin/translations" element={<TranslationPanel />} />
                    </Route>
                  </Route>

                  {/* Public Parent Route - DNI Lookup (no auth required) */}
                  <Route path="/parent/lookup" element={<ParentStudentLookup />} />

                  {/* Protected Parent Routes */}
                  <Route element={<ProtectedRoute roles={['parent']} />}>
                    <Route element={<MainLayout />}>
                      <Route path="/parent" element={<ParentDashboard />} />
                      <Route path="/parent/children/:studentId" element={<ChildProgress />} />
                      <Route path="/parent/children/:studentId/report" element={<ChildReport />} />
                    </Route>
                  </Route>

                  {/* 404 Catch-all */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                </Suspense>
              </div>
              </ErrorBoundary>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
        </LanguageProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
