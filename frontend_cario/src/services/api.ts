import { LoginCredentials, RegisterCredentials, User, ApiResponse, LoginResponse, Question } from '@/types';

const API_BASE_URL = 'http://localhost:8085';
//const API_BASE_URL = 'https://cario.ai4life.com.vn/backend/cario/';
const CHATBOT_API_URL = 'https://pivot-qg4z.onrender.com';
const ANALYSIS_API_URL = 'https://pivot-hdps.vercel.app';

// Community API endpoints
export const COMMUNITY_API = {
  searchGroups: (query: string, username?: string) => {
  const params = new URLSearchParams();
  const trimmed = (query ?? '').trim();
  if (trimmed.length > 0) params.set('name', trimmed);
  if (username) params.set('username', username);
  const qs = params.toString();
  const endpoint = qs ? `/group/get/all?${qs}` : '/group/get/all';
  console.log('Community API - searchGroups URL:', `${API_BASE_URL}${endpoint}`);
  return endpoint;
  },
  getUserGroups: (username: string) => {
    const endpoint = `/group/get/by-user?username=${username}`;
    console.log('Community API - getUserGroups URL:', `${API_BASE_URL}${endpoint}`);
    return endpoint;
  },
  getGroupPosts: (groupId: string) => {
  const endpoint = `/api/posts/get/by-group?groupId=${groupId}`;
    console.log('Community API - getGroupPosts URL:', `${API_BASE_URL}${endpoint}`);
    return endpoint;
  },
};

class ApiService {
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    methodName?: string
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Merge headers từ options nếu có
    if (options.headers) {
      if (typeof options.headers === 'object') {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            headers[key] = value;
          }
        });
      }
    }
    
    const config: RequestInit = {
      headers,
      mode: 'cors',
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Try to parse JSON body (if any)
      const parsed = await response.json().catch(() => null);

      if (!response.ok) {
        // Log HTTP error with context
        console.error(`API HTTP error${methodName ? ` [${methodName}]` : ''} - URL: ${url}`, parsed || { status: response.status, statusText: response.statusText });
        // If parsed contains message/error, include it
        const msg = parsed && (parsed.message || parsed.error) ? (parsed.message || parsed.error) : `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(msg);
      }

      // If API returns wrapped format { success: boolean, data: ... }
      if (parsed && typeof parsed === 'object' && 'success' in parsed) {
        const wrapped: any = parsed;
        if (!wrapped.success) {
          // Log full raw response for debugging
          console.error(`API returned success=false${methodName ? ` [${methodName}]` : ''} - URL: ${url}`, wrapped);
          return { success: false, error: wrapped.error || wrapped.message || 'API returned unsuccessful response' };
        }
        return { success: true, data: wrapped.data as T };
      }

      // Otherwise return parsed value as data
      return { success: true, data: parsed as T };
    } catch (error) {
      console.error(`API Error${methodName ? ` [${methodName}]` : ''} - URL: ${url}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi kết nối đến server',
      };
    }
  }

  // Hàm authFetch để gọi API với authentication
  async authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers as Record<string, string>,
    };
    
    const config: RequestInit = {
      headers,
      mode: 'cors',
      credentials: 'include',
      ...options,
    };
    
    console.log('authFetch - Request config:', {
      url,
      method: config.method,
      headers: config.headers,
      mode: config.mode,
      credentials: config.credentials
    });
    
    return fetch(url, config);
  }

  // Quiz API
  async getQuestions(type: string = 'ordinary'): Promise<ApiResponse<Question[]>> {
    try {
      console.log('Getting questions with type:', type);
      
      // Gọi API chính xác
      const url = `${API_BASE_URL}/api/question/get?type=${type}`;
      console.log('GetQuestions - Calling API:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });
      
      console.log('GetQuestions - Response status:', response.status);
      console.log('GetQuestions - Response statusText:', response.statusText);
      console.log('GetQuestions - Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('GetQuestions - API response:', data);
        
        // Kiểm tra cấu trúc response và chuyển đổi sang format Question[]
        let questions: Question[] = [];
        if (Array.isArray(data)) {
          questions = data;
        } else if (data.questions && Array.isArray(data.questions)) {
          questions = data.questions;
        } else if (data.data && Array.isArray(data.data)) {
          questions = data.data;
        } else {
          console.error('Unexpected API response structure:', data);
          throw new Error('Cấu trúc response không hợp lệ');
        }
        
        console.log('GetQuestions - Parsed questions:', questions);
        return {
          success: true,
          data: questions,
        };
      } else {
        // Xử lý lỗi chi tiết
        const errorData = await response.json().catch(() => ({}));
        console.error('GetQuestions - API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          errorData: errorData,
          headers: response.headers
        });
        
        if (response.status === 404) {
          throw new Error('Endpoint không tồn tại. Vui lòng kiểm tra lại URL.');
        } else if (response.status >= 500) {
          throw new Error('Lỗi server. Vui lòng thử lại sau.');
        } else {
          throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
    } catch (error) {
      console.error('Get Questions API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy câu hỏi từ server',
      };
    }
  }

  async createQuestion(payload: {
    content: string;
    type: 'science' | 'stone' | 'fantasy' | 'ordinary';
    answers: Array<{ content: string }>;
  }): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/api/question/create`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || errorData.error || 'Tạo câu hỏi thất bại' };
      }

      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Không thể tạo câu hỏi' };
    }
  }

  async deleteQuestion(id: string | number): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/api/question/delete/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || errorData.error || 'Xóa câu hỏi thất bại' };
      }

      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Không thể xóa câu hỏi' };
    }
  }

  async updateQuestion(payload: {
    id: number | string;
    content: string;
    type: 'science' | 'stone' | 'fantasy' | 'ordinary';
    answers: Array<{ id: number | string; content: string }>;
  }): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/api/question/update`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || errorData.error || 'Cập nhật câu hỏi thất bại' };
      }
      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Không thể cập nhật câu hỏi' };
    }
  }

  // Chatbot API
  async chat(message: string): Promise<ApiResponse<{ response: string }>> {
    const url = `${CHATBOT_API_URL}/query`;
    
    // Lấy username từ localStorage
    const username = localStorage.getItem('username') || 'anonymous';
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      // Không sử dụng credentials để tránh CORS error
      body: JSON.stringify({ 
        query: message,
        user_id: username 
      }),
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Chatbot API Response:', data);
      return {
        success: true,
        data: { response: data.response || data.answer || data.message || 'Không có phản hồi' },
      };
    } catch (error) {
      console.error('Chatbot API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể kết nối đến chatbot',
      };
    }
  }

  // Analysis API (analyze quiz answers)
  async analyzeAnswers(payload: { items: Array<{ question: string; answer: string }> }): Promise<ApiResponse<any>> {
    const url = `${ANALYSIS_API_URL}/analyze-answers`;
    const config: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(payload),
    };

    try {
      console.log('AnalyzeAnswers - URL:', url);
      console.log('AnalyzeAnswers - Payload:', payload);
      const response = await fetch(url, config);
      console.log('AnalyzeAnswers - Response status:', response.status);
      console.log('AnalyzeAnswers - Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('AnalyzeAnswers - API Error:', errorMessage, errorData);
        return { success: false, error: errorMessage };
      }

      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      console.error('AnalyzeAnswers - Network/Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể phân tích câu trả lời',
      };
    }
  }

  // Forum API
  async getPosts(): Promise<ApiResponse<any[]>> {
    try {
      const url = `${API_BASE_URL}/api/posts/get`;
      console.log('Getting posts from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Posts loaded successfully:', data);
        return {
          success: true,
          data: Array.isArray(data) ? data : (data.posts || data.data || []),
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load posts:', errorData);
        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error('Get Posts API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tải bài viết',
      };
    }
  }

  async createPost(payload: { title: string; content: string }): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/api/posts/create`;
      console.log('Creating post at:', url, 'with payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Post created successfully:', data);
        return {
          success: true,
          data,
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create post:', errorData);
        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error('Create Post API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo bài viết',
      };
    }
  }

  async createPostInGroup(payload: { title: string; content: string; type: string; groupId: number | string }): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/api/posts/create`;
      console.log('Creating group post at:', url, 'with payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error('Failed to create group post:', data);
        return { success: false, error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}` };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Create Group Post API Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Không thể tạo bài viết trong nhóm' };
    }
  }

  async updatePost(payload: { id: number | string; title: string; content: string; groupId?: number | string }): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/api/posts/update`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || errorData.error || 'Cập nhật bài viết thất bại' };
      }
      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Không thể cập nhật bài viết' };
    }
  }

  async deletePost(id: number | string): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/api/posts/delete/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || errorData.error || 'Xóa bài viết thất bại' };
      }
      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Không thể xóa bài viết' };
    }
  }

  async getPostsByUser(username: string): Promise<ApiResponse<any[]>> {
    try {
      const url = `${API_BASE_URL}/api/posts/get/by-user?username=${username}`;
      console.log('Getting posts by user:', username, 'from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User posts loaded successfully:', data);
        return {
          success: true,
          data: Array.isArray(data) ? data : (data.posts || data.data || []),
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load user posts:', errorData);
        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error('Get User Posts API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tải bài viết của người dùng',
      };
    }
  }

  // Comment API
  async createComment(payload: { content: string; postId: number | string; parentId?: number | string }): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/api/comment/create`;
      console.log('=== CREATE COMMENT REQUEST ===');
      console.log('URL:', url);
      console.log('Payload:', payload);
      console.log('Username from localStorage:', localStorage.getItem('username'));
      console.log('Role from localStorage:', localStorage.getItem('role'));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      console.log('=== CREATE COMMENT RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Comment created successfully:', data);
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('=== CREATE COMMENT ERROR ===');
        console.error('Status:', response.status);
        console.error('Error data:', errorData);
        console.error('Full response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorData
        });
        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error('Create Comment API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo bình luận',
      };
    }
  }

  async deleteComment(id: number | string): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/api/comment/delete/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || errorData.error || 'Xóa bình luận thất bại' };
      }
      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Không thể xóa bình luận' };
    }
  }

  async getCommentsByPost(postId: number | string): Promise<ApiResponse<any[]>> {
    try {
      const url = `${API_BASE_URL}/api/comment/get/by-posts/${postId}`;
      console.log('Getting comments for post:', postId, 'from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Comments loaded successfully:', data);
        return {
          success: true,
          data: Array.isArray(data) ? data : (data.comments || data.data || []),
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load comments:', errorData);
        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error('Get Comments API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tải bình luận',
      };
    }
  }

  // Like API
  async toggleLike(postId: number | string): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/api/like`;
      console.log('Toggling like for post:', postId, 'at:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        // Check if response has content before parsing JSON
        const contentType = response.headers.get('content-type');
        const text = await response.text();
        
        if (text && text.trim() && contentType?.includes('application/json')) {
          const data = JSON.parse(text);
          console.log('Like toggled successfully:', data);
          return { success: true, data };
        } else {
          // Backend returned empty or non-JSON response, treat as success
          console.log('Like toggled successfully (no response body)');
          return { success: true, data: {} };
        }
      } else {
        const text = await response.text();
        let errorData = {};
        try {
          errorData = text ? JSON.parse(text) : {};
        } catch (e) {
          console.warn('Error response is not JSON:', text);
        }
        console.error('Failed to toggle like:', errorData);
        return {
          success: false,
          error: (errorData as any).message || (errorData as any).error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error('Toggle Like API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể thích/bỏ thích bài viết',
      };
    }
  }

  // Group CRUD API
  async createGroup(payload: { name: string; description: string; isPrivate: boolean }): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/group/create`;
      console.log('Creating group at:', url, 'with payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Group created successfully:', data);
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create group:', errorData);
        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error('Create Group API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo nhóm',
      };
    }
  }

  async updateGroup(payload: { id: number | string; name?: string; description?: string; isPrivate?: boolean; status?: string }): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/group/update-status`;
      console.log('Updating group at:', url, 'with payload:', payload);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Group updated successfully:', data);
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update group:', errorData);
        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error('Update Group API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật nhóm',
      };
    }
  }

  async deleteGroup(id: number | string): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/group/delete/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || errorData.error || 'Xóa nhóm thất bại' };
      }
      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Không thể xóa nhóm' };
    }
  }

  // Group Member API
  async joinGroup(groupId: number | string): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/api/group-member/join/${groupId}`;
      console.log('Joining group:', groupId, 'at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log('Joined group successfully:', data);
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to join group:', errorData);
        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error('Join Group API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tham gia nhóm',
      };
    }
  }

  async updateMemberRole(payload: { id: number | string; role: string }): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/api/group-member/update`;
      console.log('Updating member role at:', url, 'with payload:', payload);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Member role updated successfully:', data);
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update member role:', errorData);
        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error('Update Member Role API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật vai trò thành viên',
      };
    }
  }

  async removeMember(id: number | string): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/api/group-member/delete/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || errorData.error || 'Xóa thành viên thất bại' };
      }
      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Không thể xóa thành viên' };
    }
  }

  async getGroupMembers(groupId: number | string): Promise<ApiResponse<any[]>> {
    try {
      const url = `${API_BASE_URL}/api/group-member/get?groupId=${groupId}`;
      console.log('Getting members for group:', groupId, 'from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Group members loaded successfully:', data);
        return {
          success: true,
          data: Array.isArray(data) ? data : (data.members || data.data || []),
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load group members:', errorData);
        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error('Get Group Members API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tải danh sách thành viên',
      };
    }
  }

  // Test connection to server
  async testConnection(): Promise<boolean> {
    try {
      const url = `${API_BASE_URL}/login`; // Using /login as a reachable endpoint
      console.log('Testing connection to:', url);
      
      // Gửi request test với empty credentials để kiểm tra kết nối
      const testCredentials = { username: 'test', password: 'test' };
      console.log('Test credentials:', testCredentials);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(testCredentials),
      });
      
      console.log('Connection test response status:', response.status);
      console.log('Connection test response statusText:', response.statusText);
      
      // Nếu server trả về 403, có nghĩa là kết nối thành công nhưng credentials sai
      // Nếu server trả về 200, có nghĩa là kết nối thành công và credentials đúng (không nên xảy ra)
      // Nếu server trả về 500, có nghĩa là lỗi server
      // Nếu không thể kết nối, sẽ throw error
      
      if (response.status === 403) {
        console.log('Connection successful - server responded with 403 (expected for test credentials)');
        return true; // Kết nối thành công
      } else if (response.status === 200) {
        console.log('Connection successful - server responded with 200 (unexpected for test credentials)');
        return true; // Kết nối thành công
      } else if (response.status >= 500) {
        console.log('Connection successful - server error (5xx)');
        return true; // Kết nối thành công, lỗi server
      } else {
        console.log('Connection test - unexpected status:', response.status);
        return true; // Kết nối thành công
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return false; // Không thể kết nối
    }
  }

  // Auth services - Chỉ sử dụng real API, không có fallback
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    try {
      const url = `${API_BASE_URL}/login`;
      console.log('=== LOGIN ATTEMPT ===');
      console.log('URL:', url);
      console.log('Credentials:', credentials);
      
      const requestBody = JSON.stringify(credentials);
      console.log('Request body:', requestBody);
      
      const requestHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      console.log('Request headers:', requestHeaders);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        mode: 'cors',
        credentials: 'include',
        body: requestBody,
      });

      console.log('=== LOGIN RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      console.log('Response ok:', response.ok);
      
      // Xử lý response dựa vào HTTP status code
      if (response.status === 200) {
        // Login thành công
        try {
          const data: LoginResponse = await response.json();
          console.log('Login success - Response data:', data);
          
          // Kiểm tra cấu trúc data - response trực tiếp từ server
          const responseData = data as any;
          const role = responseData.role;
          
          if (!role) {
            console.error('Login response missing role:', data);
            return {
              success: false,
              error: 'Server response không hợp lệ: thiếu role',
            };
          }
          
          console.log('User role:', role);
          
          // Lưu role và username vào localStorage
          localStorage.setItem('role', role);
          localStorage.setItem('username', credentials.username);
          localStorage.setItem('isAuthenticated', 'true');
          
          console.log('Login - Role and username saved to localStorage:', { role, username: credentials.username });
          
          return {
            success: true,
            data: { role },
          };
        } catch (parseError) {
          console.error('Error parsing login response:', parseError);
          return {
            success: false,
            error: 'Không thể parse response từ server',
          };
        }
      } else if (response.status === 403) {
        // Sai username hoặc password
        console.log('Login failed: 403 - Invalid credentials');
        try {
          const errorData = await response.json();
          console.log('403 error details:', errorData);
          return {
            success: false,
            error: errorData.message || errorData.error || 'Username hoặc password không đúng. Vui lòng kiểm tra lại.',
          };
        } catch (parseError) {
          console.log('Could not parse 403 response as JSON');
          return {
            success: false,
            error: 'Username hoặc password không đúng. Vui lòng kiểm tra lại.',
          };
        }
      } else if (response.status === 401) {
        // Unauthorized
        console.log('Login failed: 401 - Unauthorized');
        try {
          const errorData = await response.json();
          console.log('401 error details:', errorData);
          return {
            success: false,
            error: errorData.message || errorData.error || 'Tài khoản không được phép truy cập.',
          };
        } catch (parseError) {
          return {
            success: false,
            error: 'Tài khoản không được phép truy cập.',
          };
        }
      } else if (response.status === 500) {
        // Server error
        console.log('Login failed: 500 - Server error');
        try {
          const errorData = await response.json();
          console.log('500 error details:', errorData);
          return {
            success: false,
            error: errorData.message || errorData.error || 'Lỗi server. Vui lòng thử lại sau.',
          };
        } catch (parseError) {
          return {
            success: false,
            error: 'Lỗi server. Vui lòng thử lại sau.',
          };
        }
      } else {
        // Các lỗi khác
        console.log('Login failed with unexpected status:', response.status);
        try {
          const errorData = await response.json();
          console.log('Unexpected status error details:', errorData);
          return {
            success: false,
            error: errorData.message || errorData.error || `Lỗi đăng nhập: ${response.status} - ${response.statusText}`,
          };
        } catch (parseError) {
          console.log('Could not parse error response as JSON');
          return {
            success: false,
            error: `Lỗi đăng nhập: ${response.status} - ${response.statusText}`,
          };
        }
      }
    } catch (error: unknown) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error instanceof Error ? error.constructor?.name : 'Unknown');
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi kết nối đến server',
      };
    }
  }

  // Helper method để kiểm tra authentication status
  isAuthenticated(): boolean {
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const isAuth = localStorage.getItem('isAuthenticated');
    
    return !!(role && username && isAuth === 'true');
  }

  // Helper method để lấy role từ localStorage
  getRoleFromLocalStorage(): string | null {
    const role = localStorage.getItem('role');
    if (role) {
      console.log('getRoleFromLocalStorage - Role found:', role);
    } else {
      console.log('getRoleFromLocalStorage - No role found');
    }
    return role;
  }

  async register(credentials: RegisterCredentials): Promise<ApiResponse<any>> {
    try {
      const url = `${API_BASE_URL}/register`;
      console.log('Attempting register to:', url);
      
      // Chỉ gửi username, password, email theo yêu cầu API
      const registerData = {
        username: credentials.username,
        password: credentials.password,
        email: credentials.email
      };
      
      console.log('Register data:', registerData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(registerData),
      });

      console.log('Register response status:', response.status);

      // Kiểm tra HTTP status 200
      if (response.status === 200) {
        console.log('Register success');
        
        // Không lưu bất kỳ thông tin gì vào localStorage
        // Chỉ trả về success để chuyển sang trang login
        return {
          success: true,
          data: { message: 'Đăng ký thành công' },
        };
      } else {
        // Nếu không phải 200, xử lý như error
        const errorData = await response.json().catch(() => ({}));
        console.log('Register failed with status:', response.status, 'Error:', errorData);
        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error('Register API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể kết nối đến server',
      };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      // Gọi API logout để server xóa cookie
      await this.request('/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa user info khỏi localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      localStorage.removeItem('isAuthenticated');
    }

    return { success: true };
  }

  // Kiểm tra xem user có đang đăng nhập không (dựa vào role và username trong localStorage)
  async checkAuthStatus(): Promise<ApiResponse<{ user: User }>> {
    try {
      // Kiểm tra xem có thông tin user trong localStorage không
      const role = this.getRoleFromLocalStorage();
      const username = localStorage.getItem('username');
      const isAuth = localStorage.getItem('isAuthenticated');
      
      if (role && username && isAuth === 'true') {
        // Tạo user object từ localStorage
        const user: User = {
          id: 'temp-id', // Tạm thời
          fullName: username,
          email: '',
          username: username,
          role: role as 'USER' | 'ADMIN',
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        
        return {
          success: true,
          data: { user },
        };
      } else {
        // Không có thông tin user, xóa tất cả
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('isAuthenticated');
        
        return {
          success: false,
          error: 'Không có thông tin người dùng',
        };
      }
    } catch (error) {
      // Nếu không thể xác thực, xóa thông tin user
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      localStorage.removeItem('isAuthenticated');
      return {
        success: false,
        error: 'Không thể xác thực người dùng',
      };
    }
  }


}

export const apiService = new ApiService();
