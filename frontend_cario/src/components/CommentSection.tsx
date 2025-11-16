import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

interface Comment {
  id: number | string;
  content: string;
  createdAt: string;
  userOfComment: {
    username: string;
    urlAvatar?: string | null;
  };
  parentId?: number | string | null;
}

interface CommentSectionProps {
  postId: number | string;
  onCommentCountChange?: (count: number) => void;
}

const getTimeAgo = (dateString: string): string => {
  // Kiểm tra nếu không có dateString hoặc invalid
  if (!dateString || dateString.trim() === '') {
    return 'Vừa xong';
  }

  const now = new Date();
  const commentDate = new Date(dateString);

  // Kiểm tra nếu parse thất bại
  if (isNaN(commentDate.getTime())) {
    console.warn('Invalid date string:', dateString);
    return 'Vừa xong';
  }

  const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

  // Nếu thời gian trong tương lai (có thể do clock skew), hiển thị "Vừa xong"
  if (diffInSeconds < 0) {
    return 'Vừa xong';
  }

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  } else if (diffInSeconds < 604800) { // Less than 7 days
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  } else if (diffInSeconds < 2592000) { // Less than 30 days
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} tuần trước`;
  } else if (diffInSeconds < 31536000) { // Less than 365 days
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} tháng trước`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} năm trước`;
  }
};

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, onCommentCountChange }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | string | null>(null);
  const currentUsername = localStorage.getItem('username') || '';

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiService.getCommentsByPost(postId);

      if (result.success && result.data) {
        const formattedComments: Comment[] = result.data.map((comment: any) => {
          // Debug log để kiểm tra createdAt từ API
          if (!comment.createdAt && !comment.timestamp && !comment.created_at) {
            console.warn('Comment không có thời gian:', comment);
          }

          return {
            id: comment.id || comment._id,
            content: comment.content || '',
            // Ưu tiên các field thời gian, KHÔNG fallback về thời gian hiện tại
            createdAt: comment.createdAt || comment.timestamp || comment.created_at || '',
            userOfComment: {
              username: comment.userOfComment?.username || comment.user?.username || 'Người dùng',
              urlAvatar: comment.userOfComment?.urlAvatar || comment.user?.urlAvatar || null,
            },
            parentId: comment.parentId || null,
          };
        });
        setComments(formattedComments);
        onCommentCountChange?.(formattedComments.length);
      } else {
        setError(result.error || 'Không thể tải bình luận');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải bình luận');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        content: newComment.trim(),
        postId,
        ...(replyingTo && { parentId: replyingTo }),
      };

      const result = await apiService.createComment(payload);

      if (result.success) {
        setNewComment('');
        setReplyingTo(null);
        await loadComments();
      } else {
        setError(result.error || 'Không thể tạo bình luận');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo bình luận');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number | string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

    try {
      const result = await apiService.deleteComment(commentId);

      if (result.success) {
        await loadComments();
      } else {
        setError(result.error || 'Không thể xóa bình luận');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa bình luận');
    }
  };

  // Organize comments into parent and children
  const parentComments = comments.filter(c => !c.parentId);
  const childComments = comments.filter(c => c.parentId);

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
      {/* Comment input form */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#6366f1',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: 14,
            flexShrink: 0,
          }}>
            {currentUsername.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            {replyingTo && (
              <div style={{
                fontSize: 12,
                color: '#6366f1',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span>Đang trả lời bình luận</span>
                <button
                  onClick={() => setReplyingTo(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  Hủy
                </button>
              </div>
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              style={{
                width: '100%',
                minHeight: 60,
                padding: 8,
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                style={{
                  padding: '6px 16px',
                  background: newComment.trim() && !isSubmitting ? '#6366f1' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: newComment.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {isSubmitting ? 'Đang gửi...' : 'Bình luận'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          padding: 12,
          background: '#fee2e2',
          color: '#dc2626',
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>
          Đang tải bình luận...
        </div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#9ca3af', fontSize: 14 }}>
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {parentComments.map((comment) => {
            const children = childComments.filter(c => c.parentId === comment.id);

            return (
              <div key={comment.id}>
                {/* Parent comment */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#6366f1',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 14,
                    flexShrink: 0,
                  }}>
                    {comment.userOfComment.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      background: '#f3f4f6',
                      padding: '8px 12px',
                      borderRadius: 12,
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                        {comment.userOfComment.username}
                      </div>
                      <div style={{ fontSize: 14, color: '#374151' }}>
                        {comment.content}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: 12,
                      marginTop: 4,
                      fontSize: 12,
                      color: '#6b7280',
                      paddingLeft: 12,
                    }}>
                      <span>{getTimeAgo(comment.createdAt)}</span>
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#6366f1',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        Trả lời
                      </button>
                      {comment.userOfComment.username === currentUsername && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: 12,
                          }}
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    {/* Child comments (replies) */}
                    {children.length > 0 && (
                      <div style={{
                        marginTop: 12,
                        marginLeft: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}>
                        {children.map((child) => (
                          <div key={child.id} style={{ display: 'flex', gap: 8 }}>
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: '#8b5cf6',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: 12,
                              flexShrink: 0,
                            }}>
                              {child.userOfComment.username.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                background: '#f9fafb',
                                padding: '6px 10px',
                                borderRadius: 10,
                              }}>
                                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                                  {child.userOfComment.username}
                                </div>
                                <div style={{ fontSize: 13, color: '#374151' }}>
                                  {child.content}
                                </div>
                              </div>
                              <div style={{
                                display: 'flex',
                                gap: 12,
                                marginTop: 4,
                                fontSize: 11,
                                color: '#6b7280',
                                paddingLeft: 10,
                              }}>
                                <span>{getTimeAgo(child.createdAt)}</span>
                                {child.userOfComment.username === currentUsername && (
                                  <button
                                    onClick={() => handleDeleteComment(child.id)}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#dc2626',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      fontSize: 11,
                                    }}
                                  >
                                    Xóa
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
