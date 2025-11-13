import { Outlet, Navigate } from 'react-router-dom';
import { AdminHeader } from '@/components/AdminHeader';
import { useEffect, useState } from 'react';

export const AdminLayout: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Kiểm tra authentication và role
    const checkAuth = () => {
      try {
        const role = localStorage.getItem('role');
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';
        
        if (role && isAuth) {
          console.log('AdminLayout - Checking user role:', role);
          // Kiểm tra xem user có role ADMIN không
          if (role === 'ADMIN') {
            console.log('AdminLayout - User is admin, authorized');
            setIsAuthorized(true);
          } else {
            console.log('AdminLayout - User is not admin, redirecting to home');
            setIsAuthorized(false);
          }
        } else {
          console.log('AdminLayout - User not authenticated, redirecting to login');
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error checking auth in AdminLayout:', error);
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, []);

  // Hiển thị loading khi đang kiểm tra
  if (isAuthorized === null) {
    return (
      <div className="admin-loading">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // Nếu không được authorize, chuyển hướng
  if (!isAuthorized) {
    console.log('AdminLayout - Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Nếu được authorize, hiển thị admin layout
  console.log('AdminLayout - Rendering admin interface');
  return (
    <>
      <AdminHeader />
      <Outlet />
    </>
  );
};
