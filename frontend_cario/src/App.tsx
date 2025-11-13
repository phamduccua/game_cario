import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

import { HomePage } from '@/pages/HomePage';
import { ChatbotPage } from '@/pages/ChatbotPage';
import { ForumPage } from '@/pages/ForumPage';
import { CommunityPage } from '@/pages/CommunityPage';
import { QuizGatePage } from '@/pages/QuizGatePage';
import { QuizPage } from '@/pages/QuizPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { ManageQuestionsPage } from '@/pages/admin/ManageQuestionsPage';
import { ManageUsersPage } from '@/pages/admin/ManageUsersPage';
import { MainLayout } from '@/layouts/MainLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import '@/styles/App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'USER' | 'ADMIN' }> = ({ 
  children, 
  requiredRole 
}) => {
  const isAuthenticated = typeof window !== 'undefined' ? localStorage.getItem('isAuthenticated') === 'true' : false;
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && role !== requiredRole) {
    // Nếu yêu cầu ADMIN nhưng user là USER, chuyển về trang chủ
    if (requiredRole === 'ADMIN' && role === 'USER') {
      return <Navigate to="/" replace />;
    }
    // Nếu yêu cầu USER nhưng user là ADMIN, chuyển về admin dashboard
    if (requiredRole === 'USER' && role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - không có header */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Main routes - có header - chỉ cho USER */}
        <Route element={
          <ProtectedRoute requiredRole="USER">
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz" element={<QuizGatePage />} />
          <Route path="/quiz/start" element={<QuizPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
        </Route>

        {/* Admin routes - chỉ cho ADMIN */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="questions" element={<ManageQuestionsPage />} />
          <Route path="users" element={<ManageUsersPage />} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Redirect tất cả route khác về login nếu chưa đăng nhập */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
