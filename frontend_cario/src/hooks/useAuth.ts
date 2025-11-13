import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { LoginCredentials, RegisterCredentials, User, LoginResponse } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Kiểm tra xem có role và username trong localStorage không
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');
        
        if (isAuth && role && username) {
          console.log('Auth check - User authenticated with role:', role);
          setAuthState({
            user: null, // Không có user info chi tiết
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          console.log('Auth check - No authentication found');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          
          // Xóa thông tin user khỏi localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          localStorage.removeItem('username');
          localStorage.removeItem('isAuthenticated');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    console.log('Login attempt with credentials:', credentials);
    
    try {
      // Test connection trước khi login
      console.log('Testing server connection...');
      const isConnected = await apiService.testConnection();
      console.log('Server connection test result:', isConnected);
      
      if (!isConnected) {
        console.log('Login failed: Cannot connect to server');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.' 
        };
      }
      
      // Gọi real API - không có fallback to mock service
      const result = await apiService.login(credentials);
      console.log('Login API result:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', Object.keys(result));
      console.log('Result.success:', result.success);
      console.log('Result.data:', result.data);
      console.log('Result.error:', result.error);
      
      if (result.success && result.data) {
        // Login thành công với HTTP 200
        const loginData: LoginResponse = result.data;
        console.log('Login successful, role received:', loginData.role);
        console.log('Full result object:', result);
        console.log('Result data type:', typeof result.data);
        
        // Cập nhật auth state với thông tin cơ bản
        setAuthState({
          user: null, // Không có user info trong response mới
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Không tự động chuyển hướng ở đây, để LoginPage xử lý
        console.log('Login successful, ready for redirect');
        
        return { 
          success: true, 
          data: loginData // Trả về data để LoginPage có thể sử dụng
        };
      } else {
        // Xử lý các loại lỗi cụ thể
        console.log('Login failed, error details:', result.error);
        
        if (result.error?.includes('Username hoặc password không đúng') || 
            result.error?.includes('Invalid credentials')) {
          // Lỗi 403 - Sai thông tin đăng nhập
          console.log('Login failed: Invalid credentials');
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return { 
            success: false, 
            error: 'Username hoặc password không đúng. Vui lòng kiểm tra lại.' 
          };
        } else if (result.error?.includes('Không thể kết nối đến server') ||
                   result.error?.includes('fetch')) {
          // Lỗi network - Không cho phép đăng nhập
          console.log('Login failed: Network error');
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return { 
            success: false, 
            error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.' 
          };
        } else if (result.error?.includes('Server response không hợp lệ') ||
                   result.error?.includes('thiếu role')) {
          // Lỗi response format
          console.log('Login failed: Invalid response format');
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return { 
            success: false, 
            error: 'Server response không hợp lệ. Vui lòng liên hệ admin.' 
          };
        } else if (result.error?.includes('Lỗi server') ||
                   result.error?.includes('500')) {
          // Lỗi server
          console.log('Login failed: Server error');
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return { 
            success: false, 
            error: 'Lỗi server. Vui lòng thử lại sau.' 
          };
        } else if (result.error?.includes('Tài khoản không được phép') ||
                   result.error?.includes('401')) {
          // Lỗi unauthorized
          console.log('Login failed: Unauthorized');
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return { 
            success: false, 
            error: 'Tài khoản không được phép truy cập.' 
          };
        } else {
          // Các lỗi khác
          console.log('Login failed: Other error');
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return { 
            success: false, 
            error: result.error || 'Đăng nhập thất bại. Vui lòng thử lại.' 
          };
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Không có fallback - chỉ trả về lỗi
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.' 
      };
    }
  }, [navigate]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Gọi real API - không có fallback to mock service
      const result = await apiService.register(credentials);
      
      if (result.success && result.data) {
        // Register thành công với HTTP 200
        setAuthState(prev => ({ ...prev, isLoading: false }));
        
        // Chuyển sang trang login sau khi đăng ký thành công
        navigate('/login');
        
        return { success: true };
      } else {
        // Không có fallback - trả về lỗi từ server
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: result.error || 'Đăng ký thất bại' };
      }
    } catch (error) {
      console.error('Register error:', error);
      
      // Không có fallback - chỉ trả về lỗi
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Không thể kết nối đến server' };
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa thông tin user khỏi localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      localStorage.removeItem('isAuthenticated');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      navigate('/login');
    }
  }, [navigate]);

  return {
    ...authState,
    login,
    register,
    logout,
  };
};
