/*
  @author Gurnoor SINGH (102316101) 
*/
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import Hackathons from './pages/Hackathons';
import AdminDashboard from './pages/AdminDashboard';
import MentorDashboard from './pages/MentorDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import CreateInternship from './pages/CreateInternship';
import AssignTask from './pages/AssignTask';
import { Toaster } from 'react-hot-toast';

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Toaster position="top-right" />
        <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Internship Platform</h1>
          <nav className="flex items-center gap-6">
            <a href="/hackathons" className="text-gray-600 hover:text-primary font-medium transition-colors">Hackathons</a>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 hidden sm:inline">Hi, <strong>{user.name}</strong> ({user.role})</span>
                <a href="/" onClick={(e) => { e.preventDefault(); logout(); }} className="text-red-500 hover:text-red-700 font-medium transition-colors">Logout</a>
              </div>
            ) : (
              <div className="flex gap-4 border-l pl-6 border-gray-200">
                <a href="/login" className="text-gray-600 hover:text-gray-900 font-medium flex items-center">Login</a>
                <a href="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium">Register</a>
              </div>
            )}
          </nav>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
            <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPassword />} />
            <Route path="/reset-password/:token" element={user ? <Navigate to="/" replace /> : <ResetPassword />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/dashboard" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/mentor/dashboard" element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/create-internship" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <CreateInternship />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/edit-internship/:id" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <CreateInternship />
              </ProtectedRoute>
            } />
            <Route path="/mentor/assign-task" element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <AssignTask />
              </ProtectedRoute>
            } />
            <Route path="/mentor/edit-task/:id" element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <AssignTask />
              </ProtectedRoute>
            } />
            <Route path="/" element={
              user ? (
                user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
                user.role === 'mentor' ? <Navigate to="/mentor/dashboard" replace /> :
                user.role === 'recruiter' ? <Navigate to="/recruiter/dashboard" replace /> : 
                <Navigate to="/student/dashboard" replace />
              ) : (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                  <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Find Your Dream Internship</h2>
                  <p className="text-lg text-gray-600 max-w-2xl">Connect with top companies, build your resume, and start your career journey today.</p>
                  <div className="mt-8 flex gap-4">
                    <a href="/register" className="bg-primary text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Get Started</a>
                    <a href="/login" className="bg-white text-gray-700 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm border border-gray-200">Log In</a>
                  </div>
                </div>
              )
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
