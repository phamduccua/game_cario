import { Group } from '@/types/community';
import { useCommunity } from '@/context/CommunityContext';
import { useState } from 'react';
import { GroupListSkeleton } from './LoadingSkeletons';
import { LockIcon } from './LockIcon';

interface GroupListProps {
  groups: Group[];
  isLoading: boolean;
  onReload?: () => Promise<void> | void;
}

export const GroupList: React.FC<GroupListProps> = ({ groups, isLoading, onReload }) => {
  const { selectedGroup, setSelectedGroup, error } = useCommunity();
  const [openMenuFor, setOpenMenuFor] = useState<number | null>(null);
  const [deleteGroupTarget, setDeleteGroupTarget] = useState<Group | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // current username
  const currentUsername = localStorage.getItem('username') || '';

  const handleDeleteConfirm = async () => {
    if (!deleteGroupTarget) return;
    setIsDeleting(true);
    try {
      const res = await (await import('@/services/api')).apiService.request<any>(`/group/delete/${deleteGroupTarget.id}`, { method: 'DELETE' }, 'deleteGroupFromList');
      if (!res.success) throw new Error(res.error || 'Failed to delete group');
      setDeleteGroupTarget(null);
      if (typeof onReload === 'function') await onReload();
    } catch (err) {
      console.error('Delete group failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };


  // If there are no groups at all, show a friendly empty message first
  if (!groups || groups.length === 0) {
    return (
      <div className="group-card">
        <div className="empty-state">
          <p>Bạn chưa tham gia nhóm nào</p>
          <p className="hint">Hãy tạo hoặc tìm nhóm để tham gia</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group-card">
        <div className="empty-state error">
          <p>Error loading groups:</p>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="group-card">
        <div style={{ padding: 12 }}>
          <p>Đang tải danh sách nhóm...</p>
          <GroupListSkeleton />
        </div>
      </div>
    );
  }

  // groups guaranteed non-empty here; render list below

  const renderRoleLabel = (role: string | null) => {
    if (!role) return null;
    const roleLower = String(role).toLowerCase();
    // Don't show label for guests/non-members
    if (roleLower === 'guest' || roleLower === 'none') return null;
    
    return String(role).charAt(0).toUpperCase() + String(role).slice(1);
  };

  return (
    <div className="group-card">
      {groups.map((group) => {
  const roleLower = (group.userRole || '').toLowerCase();
  const isOwner = (group as any).creator?.username === currentUsername || roleLower === 'owner' || roleLower === 'admin' || (group as any).creator === currentUsername;
        return (
          <div
            key={group.id}
            className={`group-item ${selectedGroup?.id === group.id ? 'selected' : ''}`}
            onClick={() => setSelectedGroup(group)}
            style={{ position: 'relative', padding: '14px 12px' }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {/* Group Avatar */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.3rem',
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {group.name.charAt(0).toUpperCase()}
              </div>

              {/* Group Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="group-header" style={{ marginBottom: 4 }}>
                  {group.isPrivate && <LockIcon className="group-icon" />}
                  <h3 className="group-name" style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{group.name}</h3>
                  {renderRoleLabel(group.userRole) && (
                    <span className={`group-role ${group.userRole}`} style={{ marginLeft: 8 }}>
                      {renderRoleLabel(group.userRole)}
                    </span>
                  )}
                </div>

                {/* Group Description */}
                {group.description && (
                  <p style={{
                    margin: '4px 0',
                    fontSize: '0.85rem',
                    color: '#6b7280',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {group.description}
                  </p>
                )}

                {/* Member Count */}
                <p className="group-meta" style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#9ca3af' }}>
                  👥 {group.countUserJoin || 0} thành viên
                </p>
              </div>
            </div>

            {isOwner && (
              <div style={{ position: 'absolute', right: 10, top: 12, zIndex: 80 }} onClick={(e) => e.stopPropagation()}>
                <button
                  className="group-item-menu-button"
                  onClick={() => setOpenMenuFor(openMenuFor === group.id ? null : group.id)}
                  aria-haspopup="true"
                  aria-expanded={openMenuFor === group.id}
                >
                  ⋯
                </button>
                {openMenuFor === group.id && (
                  <div className="post-menu" role="menu">
                    <button
                      className="menu-item"
                      onClick={() => {
                        setDeleteGroupTarget(group);
                        setOpenMenuFor(null);
                      }}
                    >
                      <span className="menu-item-text">Xóa nhóm</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {deleteGroupTarget && (
              <div className="modal-backdrop" role="dialog" aria-modal="true">
                <div className="modal-card">
                  <h3 className="create-post-title">Xác nhận xóa nhóm</h3>
                  <div className="create-post-card">
                    <p>Bạn chắc chắn muốn xóa nhóm "{deleteGroupTarget.name}"?</p>
                    <div className="post-actions">
                      <button onClick={handleDeleteConfirm} disabled={isDeleting}>{isDeleting ? 'Đang xóa...' : 'Xác nhận'}</button>
                      <button onClick={() => setDeleteGroupTarget(null)}>Hủy</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
