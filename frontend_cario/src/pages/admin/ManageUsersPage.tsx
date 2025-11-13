import { useState, useEffect } from 'react';
import { User } from '@/types';

interface UserWithStats extends User {
  totalQuizzes?: number;
  averageScore?: number;
  lastActive?: string;
}

export const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    role: 'USER' as 'USER' | 'ADMIN'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data cho demo
  useEffect(() => {
    const mockUsers: UserWithStats[] = [
      {
        id: '1',
        fullName: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        username: 'nguyenvana',
        role: 'USER',
        totalQuizzes: 15,
        averageScore: 85,
        lastActive: '2024-01-15'
      },
      {
        id: '2',
        fullName: 'Trần Thị B',
        email: 'tranthib@example.com',
        username: 'tranthib',
        role: 'USER',
        totalQuizzes: 8,
        averageScore: 92,
        lastActive: '2024-01-14'
      },
      {
        id: '3',
        fullName: 'Admin User',
        email: 'admin@example.com',
        username: 'admin',
        role: 'ADMIN',
        totalQuizzes: 0,
        averageScore: 0,
        lastActive: '2024-01-15'
      }
    ];
    setUsers(mockUsers);
  }, []);

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      username: '',
      role: 'USER'
    });
    setEditingUser(null);
  };

  const openModal = (user?: UserWithStats) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      alert('Vui lòng nhập họ và tên');
      return false;
    }
    if (!formData.email.trim()) {
      alert('Vui lòng nhập email');
      return false;
    }
    if (!formData.username.trim()) {
      alert('Vui lòng nhập username');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (editingUser) {
        // Cập nhật user
        const updatedUser: UserWithStats = {
          ...editingUser,
          ...formData
        };
        
        setUsers(prev => 
          prev.map(u => u.id === editingUser.id ? updatedUser : u)
        );
        
        // TODO: Gọi API cập nhật
        console.log('Cập nhật user:', updatedUser);
      } else {
        // Thêm user mới
        const newUser: UserWithStats = {
          id: Date.now().toString(),
          ...formData,
          totalQuizzes: 0,
          averageScore: 0,
          lastActive: new Date().toISOString().split('T')[0]
        };
        
        setUsers(prev => [...prev, newUser]);
        
        // TODO: Gọi API thêm mới
        console.log('Thêm user mới:', newUser);
      }
      
      closeModal();
    } catch (error) {
      console.error('Lỗi khi lưu user:', error);
      alert('Có lỗi xảy ra khi lưu user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa user này?')) return;

    try {
      // TODO: Gọi API xóa
      console.log('Xóa user:', userId);
      
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Lỗi khi xóa user:', error);
      alert('Có lỗi xảy ra khi xóa user');
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    try {
      // TODO: Gọi API thay đổi role
      console.log('Thay đổi role user:', userId, '->', newRole);
      
      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );
    } catch (error) {
      console.error('Lỗi khi thay đổi role:', error);
      alert('Có lỗi xảy ra khi thay đổi role');
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Quản lý người dùng</h1>
          <button 
            className="add-user-btn"
            onClick={() => openModal()}
          >
            + Thêm người dùng mới
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="users-table">
          <div className="table-header">
            <div className="table-cell">Thông tin</div>
            <div className="table-cell">Thống kê</div>
            <div className="table-cell">Vai trò</div>
            <div className="table-cell">Thao tác</div>
          </div>
          
          {filteredUsers.map(user => (
            <div key={user.id} className="table-row">
              <div className="table-cell user-info">
                <div className="user-avatar">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <div className="user-name">{user.fullName}</div>
                  <div className="user-email">{user.email}</div>
                  <div className="user-username">@{user.username}</div>
                </div>
              </div>
              
              <div className="table-cell user-stats">
                <div className="stat-item">
                  <span className="stat-label">Bài kiểm tra:</span>
                  <span className="stat-value">{user.totalQuizzes}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Điểm TB:</span>
                  <span className="stat-value">{user.averageScore}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Hoạt động:</span>
                  <span className="stat-value">{user.lastActive}</span>
                </div>
              </div>
              
              <div className="table-cell user-role">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as 'USER' | 'ADMIN')}
                  className={`role-select ${user.role}`}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              <div className="table-cell actions">
                <button 
                  className="edit-btn"
                  onClick={() => openModal(user)}
                >
                  Sửa
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(user.id)}
                  disabled={user.role === 'ADMIN'}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>Không tìm thấy người dùng nào.</p>
          </div>
        )}
      </div>

      {/* Modal thêm/sửa user */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Sửa thông tin người dùng' : 'Thêm người dùng mới'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label>Họ và tên:</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Nhập email..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Nhập username..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Vai trò:</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  required
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang lưu...' : (editingUser ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
