import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';

export const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Lấy role từ localStorage vì useAuth không còn cung cấp user object
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
  
  console.log('Header - isAuthenticated:', isAuthenticated);
  console.log('Header - role:', role);
  console.log('Header - username:', username);

  // Click outside để đóng menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const handleLogoClick = () => {
    // Quay lại trang chủ dựa trên role
    if (role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated || !role) return null;

  return (
    <header className="header">
      <div className="header-left" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="Logo" className="logo" />
        <h1 className="website-title">Cario</h1>
      </div>
      <div className="header-right">
        <nav className="header-nav">
          {role === 'ADMIN' ? (
            // Admin navigation
            <>
              <Link 
                to="/admin/dashboard" 
                className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
              >
                Trang chủ
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
            </>
          ) : (
            // User navigation
            <>
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                Trang chủ
              </Link>
              <Link 
                to="/quiz" 
                className={`nav-link ${isActive('/quiz') ? 'active' : ''}`}
              >
                Câu hỏi
              </Link>
              <Link 
                to="/chatbot" 
                className={`nav-link ${isActive('/chatbot') ? 'active' : ''}`}
              >
                Chatbot
              </Link>
              <Link 
                to="/forum" 
                className={`nav-link ${isActive('/forum') ? 'active' : ''}`}
              >
                Diễn đàn
              </Link>
              <Link 
                to="/community" 
                className={`nav-link ${isActive('/community') ? 'active' : ''}`}
              >
                Cộng đồng
              </Link>
            </>
          )}
        </nav>
        <div className="user-menu-container" ref={menuRef}>
          <button
            className="user-menu-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="dropdown-arrow">▼</span>
          </button>
          
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-header">
                <div className="user-avatar-large">
                  {username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="user-details">
                  <div className="username">{username || 'User'}</div>
                  <div className="user-role">{role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}</div>
                </div>
              </div>
              <div className="menu-divider"></div>
              <button className="menu-item" onClick={() => setShowUserMenu(false)}>
                <span className="menu-icon">👤</span>
                Thông tin cá nhân
              </button>
              <button className="menu-item" onClick={() => setShowUserMenu(false)}>
                <span className="menu-icon">🔒</span>
                Đổi mật khẩu
              </button>
              <div className="menu-divider"></div>
              <button className="menu-item logout" onClick={handleLogout}>
                <span className="menu-icon">🚪</span>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
