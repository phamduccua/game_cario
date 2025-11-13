import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';

export const AdminHeader: React.FC = () => {
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy role từ localStorage vì useAuth không còn cung cấp user object
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null;

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const handleLogoClick = () => {
    // Quay lại trang admin dashboard
    navigate('/admin/dashboard');
  };

  const isActive = (path: string) => location.pathname === path;

  if (!role || role !== 'ADMIN') return null;

  return (
    <header className="header admin-header">
      <div className="header-left" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="Logo" className="logo" />
        <h1 className="website-title">Cario Admin</h1>
      </div>

      <div className="header-right">
      <nav className="header-nav">
        <Link 
          to="/admin" 
          className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        <Link 
          to="/admin/questions" 
          className={`nav-link ${isActive('/admin/questions') ? 'active' : ''}`}
        >
          Quản lý câu hỏi
        </Link>
        <Link 
          to="/admin/users" 
          className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}
        >
          Quản lý người dùng
        </Link>
      </nav>
        <div className="user-menu-container">
          <button
            className="user-menu-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {username?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <span className="dropdown-arrow">▼</span>
          </button>
          
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-info">
                <div className="user-name">{username || 'Admin'}</div>
                <div className="user-email">admin@example.com</div>
                <div className="user-role">Role: Admin</div>
              </div>
              <div className="menu-divider"></div>
              <button className="menu-item" onClick={() => setShowUserMenu(false)}>
                Thông tin cá nhân
              </button>
              <button className="menu-item" onClick={() => setShowUserMenu(false)}>
                Đổi mật khẩu
              </button>
              <div className="menu-divider"></div>
              <Link to="/" className="menu-item" onClick={() => setShowUserMenu(false)}>
                Về trang chủ
              </Link>
              <button className="menu-item logout" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
