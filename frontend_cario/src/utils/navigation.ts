import { LoginResponse } from '@/types';

/**
 * Chuyển hướng người dùng đến trang phù hợp với role sau khi đăng nhập
 */
export const redirectAfterLogin = (loginResponse: LoginResponse): void => {
  const { role } = loginResponse;
  
  console.log('Redirecting user with role:', role);
  
  switch (role) {
    case 'ADMIN':
      // Chuyển đến trang admin dashboard
      console.log('Redirecting ADMIN to /admin/dashboard');
      window.location.href = '/admin/dashboard';
      break;
    case 'USER':
      // Chuyển đến trang chính cho user thường
      console.log('Redirecting USER to /');
      window.location.href = '/';
      break;
    default:
      // Fallback về trang chính
      console.warn('Unknown role:', role);
      window.location.href = '/';
  }
};

/**
 * Lấy đường dẫn mặc định cho role
 */
export const getDefaultPathForRole = (role: string): string => {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'USER':
      return '/';
    default:
      return '/';
  }
};

/**
 * Kiểm tra xem người dùng có quyền truy cập trang admin không
 */
export const canAccessAdmin = (role: string): boolean => {
  return role === 'ADMIN';
};

/**
 * Kiểm tra xem người dùng có quyền truy cập trang user không
 */
export const canAccessUser = (role: string): boolean => {
  return role === 'USER' || role === 'ADMIN';
};
