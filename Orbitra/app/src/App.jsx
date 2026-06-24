import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ClubCreationProvider } from './contexts/ClubCreationContext';
import { ClubCustomizationProvider } from './contexts/ClubCustomizationContext';
import { ClubPublishingProvider } from './contexts/ClubPublishingContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AdminRequests from './pages/AdminRequests';
import CreateClub from './pages/CreateClub';
import ClubCustomization from './pages/ClubCustomization';
import ManageClubs from './pages/ManageClubs';
import PublishRequests from './pages/PublishRequests';
import PublicClub from './pages/PublicClub';
import SuperadminReview from './pages/SuperadminReview';
import JoinClub from './pages/JoinClub';
import DebugWorkflow from './pages/DebugWorkflow';

// Club Portal Components
import ClubPortalWrapper from './components/club-portal/ClubPortalWrapper';

// Club Auth Components
import ClubJoin from './pages/club-auth/ClubJoin';
import ClubLogin from './pages/club-auth/ClubLogin';
import ClubSignup from './pages/club-auth/ClubSignup';

// Member Management
import { MemberManagementProvider } from './contexts/MemberManagementContext';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';

// Auth Components
import SignUp from './components/auth/SignUp';
import Login from './components/auth/Login';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ClubCreationProvider>
            <ClubCustomizationProvider>
              <ClubPublishingProvider>
                <MemberManagementProvider>
                  <Router>
            <div className="App">
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                  },
                  className: 'dark:bg-gray-800 dark:text-white',
                }}
              />

              {/* Routes */}
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin Only Routes */}
                <Route 
                  path="/create-club" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <CreateClub />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/customize-club/:clubId" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ClubCustomization />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/manage-clubs" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ManageClubs />
                    </ProtectedRoute>
                  } 
                />

                {/* Superadmin Only Routes */}
                <Route 
                  path="/admin-requests" 
                  element={
                    <ProtectedRoute requiredRole="superadmin">
                      <AdminRequests />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/publish-requests" 
                  element={
                    <ProtectedRoute requiredRole="superadmin">
                      <PublishRequests />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/superadmin/review" 
                  element={
                    <ProtectedRoute requiredRole="superadmin">
                      <SuperadminReview />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Debug Route - Remove in production */}
                <Route 
                  path="/debug-workflow" 
                  element={
                    <ProtectedRoute>
                      <DebugWorkflow />
                    </ProtectedRoute>
                  } 
                />

                {/* Club Auth Routes */}
                <Route path="/clubs/:clubSlug/join" element={<ClubJoin />} />
                <Route path="/clubs/:clubSlug/login" element={<ClubLogin />} />
                <Route path="/clubs/:clubSlug/signup" element={<ClubSignup />} />

                {/* Club Portal Routes */}
                <Route path="/clubs/:clubSlug/*" element={<ClubPortalWrapper />} />

                {/* Legacy Routes */}
                <Route path="/join/:accessKey" element={<JoinClub />} />
                <Route path="/club/:clubSlug" element={<PublicClub />} />

                {/* Redirect unknown routes to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
                  </Router>
                </MemberManagementProvider>
              </ClubPublishingProvider>
            </ClubCustomizationProvider>
          </ClubCreationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;