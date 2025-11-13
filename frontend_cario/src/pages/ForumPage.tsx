import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  ownerUsername?: string;
}

// Utility function để tính thời gian đã đăng
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} tháng trước`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} năm trước`;
  }
};

export const ForumPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [menuOpenPostId, setMenuOpenPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Load posts từ API khi component mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await apiService.getPosts();
      
      if (result.success && result.data) {
        // Chuyển đổi dữ liệu từ API sang format Post
        const formattedPosts: Post[] = result.data.map((post: any) => {
          // Lấy username từ userOfPost.username
          const userName = post.userOfPost?.username || post.user?.name || post.user?.fullName || 
                          post.author?.name || post.authorName || post.username || 'Người dùng';
          
          // Tạo avatar từ chữ cái đầu của username
          const avatar = userName.charAt(0).toUpperCase();
          
          // Tính thời gian đã đăng
          const dateString = post.createdAt || post.timestamp || post.date || post.created_at;
          const timeAgo = dateString ? getTimeAgo(dateString) : 'Không xác định';
          
          return {
            id: post.id || post._id || String(Math.random()),
            author: {
              name: userName,
              avatar: avatar
            },
            title: post.title || post.subject || 'Không có tiêu đề',
            content: post.content || post.body || post.text || 'Không có nội dung',
            timestamp: timeAgo,
            likes: post.countLike ?? post.likes ?? post.likeCount ?? 0,
            comments: post.countComment ?? post.comments ?? post.commentCount ?? 0,
            shares: post.shares || post.shareCount || 0,
            isLiked: post.userIsLike ?? post.isLiked ?? false,
            ownerUsername: post.userOfPost?.username || undefined,
          };
        });
        
        setPosts(formattedPosts);
      } else {
        console.error('Failed to load posts:', result.error);
        setError(result.error || 'Không thể tải bài viết');
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Có lỗi xảy ra khi tải bài viết');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    alert(`Mở bình luận cho bài viết ${postId}`);
  };

  const handleShare = (postId: string) => {
    alert(`Chia sẻ bài viết ${postId}`);
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || isCreating) return;
    try {
      setIsCreating(true);
      setError(null);
      const payload = { title: newPostTitle.trim(), content: newPostContent.trim() };
      const result = await apiService.createPost(payload);
      if (result.success && result.data) {
        // Sau khi tạo thành công, load lại danh sách từ API get-all để đảm bảo thứ tự và dữ liệu đồng bộ
        await loadPosts();
        setNewPostTitle('');
        setNewPostContent('');
        setShowCreatePost(false);
      } else {
        setError(result.error || 'Không thể tạo bài viết');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo bài viết');
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (post: Post) => {
    setEditingPostId(post.id);
    setEditPostTitle(post.title || '');
    setEditPostContent(post.content || '');
  };

  const closeEditModal = () => {
    setEditingPostId(null);
    setEditPostTitle('');
    setEditPostContent('');
  };

  const handleUpdatePost = async () => {
    if (!editingPostId || !editPostTitle.trim() || !editPostContent.trim() || isUpdating) return;
    try {
      setIsUpdating(true);
      setError(null);
      // Theo định dạng yêu cầu: { title, content, id }
      const payload = { title: editPostTitle.trim(), content: editPostContent.trim(), id: editingPostId } as {
        title: string; content: string; id: string;
      };
      const res = await apiService.updatePost(payload);
      if (!res.success) {
        throw new Error(res.error || 'Không thể cập nhật bài viết');
      }
      await loadPosts();
      closeEditModal();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra khi cập nhật bài viết');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      const res = await apiService.deletePost(postId);
      if (!res.success) {
        throw new Error(res.error || 'Không thể xóa bài viết');
      }
      await loadPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra khi xóa bài viết');
    } finally {
      setMenuOpenPostId(null);
    }
  };

  return (
    <div className="forum-page">
      <div className="forum-container">
        <div className="forum-header">
          <h1>Diễn đàn Cario</h1>
          <p>Chia sẻ kinh nghiệm và thảo luận cùng cộng đồng</p>
        </div>

        {showCreatePost && (
          <div className="create-post-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Tạo bài viết mới</h3>
                <button 
                  className="close-btn" 
                  onClick={() => setShowCreatePost(false)}
                >
                  ×
                </button>
              </div>
              <div className="post-form">
                <div className="post-author">
                  <div className="avatar">
                    {(() => {
                      const username = localStorage.getItem('username');
                      const user = localStorage.getItem('user');
                      let userName = username;
                      
                      if (!userName && user) {
                        try {
                          const userObj = JSON.parse(user);
                          userName = userObj.username || userObj.fullName || userObj.name;
                        } catch (e) {
                          console.error('Error parsing user from localStorage:', e);
                        }
                      }
                      
                      return (userName || 'U').charAt(0).toUpperCase();
                    })()}
                  </div>
                  <div className="author-info">
                    <div className="author-name">
                      {(() => {
                        const username = localStorage.getItem('username');
                        const user = localStorage.getItem('user');
                        let userName = username;
                        
                        if (!userName && user) {
                          try {
                            const userObj = JSON.parse(user);
                            userName = userObj.username || userObj.fullName || userObj.name;
                          } catch (e) {
                            console.error('Error parsing user from localStorage:', e);
                          }
                        }
                        
                        return userName || 'Người dùng';
                      })()}
                    </div>
                  </div>
                </div>
                <input
                  className="post-title-input"
                  placeholder="Tiêu đề bài viết..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <textarea
                  className="post-input"
                  placeholder="Nội dung bài viết..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                />
                <div className="post-actions">
                  <button 
                    className="post-btn"
                    onClick={handleCreatePost}
                    disabled={!newPostTitle.trim() || !newPostContent.trim() || isCreating}
                  >
                    {isCreating ? 'Đang đăng...' : 'Đăng bài'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải bài viết...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={loadPosts} className="retry-btn">
              Thử lại
            </button>
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="empty-container">
            <p>Chưa có bài viết nào.</p>
          </div>
        )}

        {!isLoading && !error && posts.length > 0 && (
          <div className="posts-feed">
            {posts.map((post) => (
              <div key={post.id} className="post-item" style={{ position: 'relative' }}>
                <div className="post-header" style={{ position: 'relative' }}>
                  <div className="post-author">
                    <div className="avatar">{post.author.avatar}</div>
                    <div className="author-info">
                      <div className="author-name">{post.author.name}</div>
                      <div className="post-time">{post.timestamp}</div>
                    </div>
                  </div>
                  {post.ownerUsername && post.ownerUsername === (localStorage.getItem('username') || '') && (
                    <button
                      aria-label="Tùy chọn bài viết"
                      onClick={() => setMenuOpenPostId(menuOpenPostId === post.id ? null : post.id)}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 18,
                        color: '#000000',
                        padding: 6,
                        borderRadius: 8
                      }}
                    >
                      ⋯
                    </button>
                  )}
                  {menuOpenPostId === post.id && post.ownerUsername === (localStorage.getItem('username') || '') && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 36,
                        right: 8,
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                        zIndex: 10,
                        overflow: 'hidden'
                      }}
                    >
                      <button
                        onClick={() => { setMenuOpenPostId(null); openEditModal(post); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#000000' }}
                      >
                        ✏️ Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                      >
                        🗑️ Xóa bài viết
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="post-title">
                  {post.title}
                </div>
                
                <div className="post-content">
                  {post.content}
                </div>
                
                <div className="post-actions">
                  <button 
                    className={`action-btn ${post.isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <span className="action-icon">❤️</span>
                    <span className="action-count">{post.likes}</span>
                  </button>
                  
                  <button 
                    className="action-btn"
                    onClick={() => handleComment(post.id)}
                  >
                    <span className="action-icon">💬</span>
                    <span className="action-count">{post.comments}</span>
                  </button>
                  
                  <button 
                    className="action-btn"
                    onClick={() => handleShare(post.id)}
                  >
                    <span className="action-icon">📤</span>
                    <span className="action-count">{post.shares}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          className="create-post-btn"
          onClick={() => setShowCreatePost(true)}
          aria-label="Tạo bài viết mới"
        >
          +
        </button>

        {/* Modal chỉnh sửa bài viết */}
        {editingPostId && (
          <div className="create-post-modal" onClick={closeEditModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Chỉnh sửa bài viết</h3>
                <button 
                  className="close-btn" 
                  onClick={closeEditModal}
                >
                  ×
                </button>
              </div>
              <div className="post-form">
                <div className="post-author" style={{ marginBottom: 8 }}>
                  <div className="avatar">
                    {(localStorage.getItem('username') || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="author-info">
                    <div className="author-name">{localStorage.getItem('username') || 'Người dùng'}</div>
                  </div>
                </div>
                <input
                  className="post-title-input"
                  placeholder="Tiêu đề bài viết..."
                  value={editPostTitle}
                  onChange={(e) => setEditPostTitle(e.target.value)}
                />
                <textarea
                  className="post-input"
                  placeholder="Nội dung bài viết..."
                  value={editPostContent}
                  onChange={(e) => setEditPostContent(e.target.value)}
                  rows={4}
                />
                <div className="post-actions">
                  <button 
                    className="post-btn"
                    onClick={handleUpdatePost}
                    disabled={!editPostTitle.trim() || !editPostContent.trim() || isUpdating}
                  >
                    {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
