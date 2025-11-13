import { Post } from '@/types/community';
import { useCommunity } from '@/context/CommunityContext';
import { PostsSkeleton } from './LoadingSkeletons';
import { apiService } from '@/services/api';
import { useState, useEffect, useRef } from 'react';

interface GroupPostsProps {
  posts: Post[];
  isLoading: boolean;
  onReload?: (groupId: string | number) => Promise<void> | void;
}

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

export const GroupPosts: React.FC<GroupPostsProps> = ({ posts, isLoading, onReload }) => {
  const { selectedGroup, error, setError } = useCommunity();
  const [localPosts, setLocalPosts] = useState<Post[]>(posts);
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editModalPost, setEditModalPost] = useState<Post | null>(null);
  const [deleteModalPost, setDeleteModalPost] = useState<Post | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);


  // Ensure hooks are called in the same order on every render.
  // Single combined effect: keep localPosts in sync and handle outside-click closing.
  useEffect(() => {
    // sync posts into local state
    setLocalPosts(posts);

    // outside-click handler: close menu if click is outside any .post-menu
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;

      // 1) If a menu is open, close it when click is outside the menu
      if (openMenuFor) {
        const menuEl = document.querySelector('.post-menu');
        if (menuEl && !menuEl.contains(target)) {
          setOpenMenuFor(null);
          return;
        }
      }

      // 2) If an edit or delete modal is open, close when clicking outside the modal-card
      if (editModalPost || deleteModalPost) {
        const modalEl = document.querySelector('.modal-card');
        if (modalEl && !modalEl.contains(target)) {
          setEditModalPost(null);
          setDeleteModalPost(null);
        }
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (openMenuFor) setOpenMenuFor(null);
        if (editModalPost) setEditModalPost(null);
        if (deleteModalPost) setDeleteModalPost(null);
      }
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);

    // mark mounted once
    if (!hasMounted) setHasMounted(true);

    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [posts, openMenuFor, editModalPost, deleteModalPost, hasMounted]);

  if (error) {
    return (
      <div className="empty-state error">
        <p>Error loading posts:</p>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!selectedGroup) {
    return (
      <div className="empty-state">
        <p>Chọn một nhóm để xem các bài viết</p>
        <p className="hint">Các bài viết trong nhóm sẽ hiển thị ở đây</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <p>Đang tải bài viết...</p>
        <PostsSkeleton />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p>Chưa có bài viết nào trong nhóm này</p>
  {(selectedGroup as any).countUserJoin > 0 && (
          <p className="hint">Hãy là người đầu tiên tạo bài viết!</p>
        )}
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    // use relative time similar to ForumPage's getTimeAgo
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
    return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
  };

  const currentUsername = localStorage.getItem('username') || '';


  const handleOpenMenu = (postId: string) => {
    setOpenMenuFor((prev) => (prev === postId ? null : postId));
  };

  const openEditModal = (post: Post) => {
    setEditModalPost(post);
    setEditTitle(post.title || '');
    setEditContent(post.content || '');
    setOpenMenuFor(null);
  };

  const handleCancelEdit = () => {
    setEditPostId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleSaveEdit = async (post: Post) => {
    if (!selectedGroup) return;
    setIsSaving(true);
    try {
  const payload = { id: post.id, title: editTitle, content: editContent, groupId: selectedGroup.id };
  const res = await apiService.updatePost(payload);
  if (!res.success) throw new Error(res.error || 'Failed to update post');

      // Update localPosts
      setLocalPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, title: editTitle, content: editContent, updatedAt: new Date().toISOString() } : p)));
      handleCancelEdit();

      // reload via callback if provided
      if (typeof onReload === 'function') {
        await onReload(selectedGroup.id);
      }
    } catch (err) {
      console.error('Update post failed:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEditModal = async () => {
    if (!editModalPost || !selectedGroup) return;
    setIsSaving(true);
    try {
  const payload = { id: editModalPost.id, title: editTitle, content: editContent, groupId: selectedGroup.id };
  const res = await apiService.updatePost(payload);
  if (!res.success) throw new Error(res.error || 'Failed to update post');

  setLocalPosts((prev) => prev.map((p) => (p.id === editModalPost.id ? { ...p, title: editTitle, content: editContent, updatedAt: new Date().toISOString() } : p)));
  setEditModalPost(null);

      if (typeof onReload === 'function') {
        await onReload(selectedGroup.id);
      }
    } catch (err) {
      console.error('Update post (modal) failed:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (post: Post) => {
    setDeleteModalPost(post);
    setOpenMenuFor(null);
  };

  const handleConfirmDeleteModal = async () => {
    if (!deleteModalPost) return;
    try {
      const res = await apiService.deletePost(deleteModalPost.id as any);
      if (!res.success) throw new Error(res.error || 'Failed to delete post');
      setLocalPosts((prev) => prev.filter((p) => p.id !== deleteModalPost.id));
      setDeleteModalPost(null);
      if (typeof onReload === 'function' && selectedGroup) {
        await onReload(selectedGroup.id);
      }
    } catch (err) {
      console.error('Delete (modal) failed:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // (removed duplicate effect) - outside-click handled in the combined effect above

  return (
    <div className="post-container">
      {localPosts.map((post) => (
        <div className="post-card" key={post.id}>
          <div className="post-header">
            <div className="post-author-info">
              <div className="post-avatar">
                {post.userOfPost.urlAvatar ? (
                  <img src={post.userOfPost.urlAvatar} alt={post.userOfPost.username} />
                ) : (
                  <div className="avatar-placeholder">{getInitials(post.userOfPost.username)}</div>
                )}
              </div>
              <div className="post-author-details">
                <div className="post-author">{post.userOfPost.username}</div>
                <div className="post-timestamp">{formatDate(post.createdAt)}</div>
              </div>
            </div>

            {/* Three-dot menu button (only for post owner) */}
            {post.userOfPost.username === currentUsername && (
              <div className="post-menu-container">
                <button
                  className="post-menu-button"
                  onClick={() => handleOpenMenu(post.id)}
                  aria-haspopup="true"
                  aria-expanded={openMenuFor === post.id}
                  aria-label="Open post menu"
                >
                  ⋯
                </button>
                {openMenuFor === post.id && (
                  <div
                    className="post-menu"
                    ref={(el) => {
                      // only keep ref to the currently open menu
                      if (openMenuFor === post.id) menuRef.current = el;
                    }}
                    role="menu"
                  >
                    <button
                      className="menu-item"
                      onClick={() => {
                        openEditModal(post);
                      }}
                    >
                      <span className="menu-item-icon" aria-hidden>
                        {/* pencil icon */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 21v-3.75L17.81 2.44a1.5 1.5 0 012.12 0l.63.63a1.5 1.5 0 010 2.12L5.75 20.99H3z" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="menu-item-text">Sửa bài viết</span>
                    </button>

                    <button
                      className="menu-item"
                      onClick={() => {
                        openDeleteModal(post);
                      }}
                    >
                      <span className="menu-item-icon" aria-hidden>
                        {/* trash icon */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6h18" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M10 11v6M14 11v6" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="menu-item-text">Xóa bài viết</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="post-body">
            {editPostId === post.id ? (
              <div className="post-edit-form">
                <input className="post-title-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <textarea className="post-content-input" value={editContent} onChange={(e) => setEditContent(e.target.value)} style={{ height: '120px' }} />
                <div className="post-actions">
                  <button onClick={() => handleSaveEdit(post)} disabled={isSaving || !editTitle.trim() || !editContent.trim()}>{isSaving ? 'Đang lưu...' : 'Lưu'}</button>
                  <button onClick={handleCancelEdit}>Hủy</button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="post-title">{post.title || ''}</h3>
                <div className="post-content">{post.content}</div>
              </>
            )}
          </div>

          <div className="post-actions">
            <button className={`action-btn ${post.userIsLike ? 'liked' : ''}`} aria-pressed={post.userIsLike}>
              <span className="action-icon">❤️</span>
              <span className="action-count">{post.countLike}</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">💬</span>
              <span className="action-count">{post.countComment}</span>
            </button>
          </div>
        </div>
      ))}
      {/* Edit modal */}
      {editModalPost && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3 className="create-post-title">Chỉnh sửa bài viết</h3>
            <div className="create-post-card">
              <input className="post-title-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Tiêu đề" />
              <textarea className="post-content-input" value={editContent} onChange={(e) => setEditContent(e.target.value)} style={{ minHeight: 140 }} placeholder="Nội dung" />
              <div className="post-actions">
                <button onClick={handleSaveEditModal} disabled={isSaving || !editTitle.trim() || !editContent.trim()}>{isSaving ? 'Đang cập nhật...' : 'Cập nhật'}</button>
                <button onClick={() => setEditModalPost(null)}>Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModalPost && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3 className="create-post-title">Xác nhận xóa</h3>
            <div className="create-post-card">
              <p>Bạn chắc chắn muốn xóa bài viết?</p>
              <div className="post-actions">
                <button onClick={handleConfirmDeleteModal}>Xác nhận</button>
                <button onClick={() => setDeleteModalPost(null)}>Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
