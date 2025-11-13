import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/types';

interface DashboardStats {
  totalUsers: number;
  totalQuestions: number;
  totalQuizzes: number;
  averageScore: number;
  recentUsers: User[];
}

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalQuestions: 0,
    totalQuizzes: 0,
    averageScore: 0,
    recentUsers: []
  });

  // Mock data cho demo
  useEffect(() => {
    const mockStats: DashboardStats = {
      totalUsers: 156,
      totalQuestions: 89,
      totalQuizzes: 342,
      averageScore: 78.5,
      recentUsers: [
        {
          id: '1',
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          username: 'nguyenvana',
          role: 'USER'
        },
        {
          id: '2',
          fullName: 'Trần Thị B',
          email: 'tranthib@example.com',
          username: 'tranthib',
          role: 'USER'
        },
        {
          id: '3',
          fullName: 'Lê Văn C',
          email: 'levanc@example.com',
          username: 'levanc',
          role: 'USER'
        }
      ]
    };
    setStats(mockStats);
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Cario Admin</h1>
          <p>Quản lý hệ thống Cario</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-label">Tổng người dùng</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">❓</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalQuestions}</div>
              <div className="stat-label">Tổng câu hỏi</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalQuizzes}</div>
              <div className="stat-label">Tổng bài kiểm tra</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{stats.averageScore}%</div>
              <div className="stat-label">Điểm trung bình</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Thao tác nhanh</h2>
          <div className="actions-grid">
            <Link to="/admin/questions" className="action-card">
              <div className="action-icon">➕</div>
              <h3>Thêm câu hỏi</h3>
              <p>Tạo câu hỏi mới cho hệ thống</p>
            </Link>

            <Link to="/admin/users" className="action-card">
              <div className="action-icon">👤</div>
              <h3>Quản lý người dùng</h3>
              <p>Xem và chỉnh sửa thông tin người dùng</p>
            </Link>

            <Link to="/admin/questions" className="action-card">
              <div className="action-icon">✏️</div>
              <h3>Sửa câu hỏi</h3>
              <p>Chỉnh sửa câu hỏi hiện có</p>
            </Link>

            <Link to="/admin/questions" className="action-card">
              <div className="action-icon">🗑️</div>
              <h3>Xóa câu hỏi</h3>
              <p>Xóa câu hỏi không phù hợp</p>
            </Link>
          </div>
        </div>

        {/* Recent Users */}
        <div className="recent-section">
          <h2>Người dùng gần đây</h2>
          <div className="recent-users">
            {stats.recentUsers.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-avatar">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.fullName}</div>
                  <div className="user-email">{user.email}</div>
                  <div className="user-username">@{user.username}</div>
                </div>
                <div className="user-role">
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'ADMIN' ? 'Admin' : 'User'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="system-info">
          <h2>Thông tin hệ thống</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Phiên bản:</span>
              <span className="info-value">v1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Cập nhật lần cuối:</span>
              <span className="info-value">15/01/2024</span>
            </div>
            <div className="info-item">
              <span className="info-label">Trạng thái:</span>
              <span className="info-value status-active">Hoạt động</span>
            </div>
            <div className="info-item">
              <span className="info-label">Bảo trì:</span>
              <span className="info-value">Không</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
