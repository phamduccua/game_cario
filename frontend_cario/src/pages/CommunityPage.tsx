import { useState, useEffect } from 'react';
import { CommunityLayout } from '@/components/CommunityLayout';
import { GroupSearchCard } from '@/components/GroupSearchCard';
import { GroupList } from '@/components/GroupList';
import { GroupPosts } from '@/components/GroupPosts';
import { CommunityProvider, useCommunity } from '@/context/CommunityContext';
import { 
  Group, 
  Post
} from '@/types/community';
import { apiService, COMMUNITY_API } from '@/services/api';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const CommunityPageContent: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const { selectedGroup, setSelectedGroup, setError } = useCommunity();

  // Membership state
  const [isMemberOfSelectedGroup, setIsMemberOfSelectedGroup] = useState(false);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);

  // Filter state
  const [groupFilter, setGroupFilter] = useState<'all' | 'managed' | 'joined'>('all');

  const validateGroups = (groups: unknown): Group[] => {
    // Support multiple shapes: array of raw groups, { groups: [] }, { data: [] }, or a single group object.
    const normalizeList = (raw: any): any[] => {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw.groups)) return raw.groups;
      if (Array.isArray(raw.data)) return raw.data;
      // Single object -> wrap into array
      if (typeof raw === 'object') return [raw];
      return [];
    };

    const rawList = normalizeList(groups as any);

    const mapped: Group[] = rawList.map((raw) => {
      const idRaw = raw?.id ?? raw?._id ?? raw?.groupId;
      const id = typeof idRaw === 'number' ? idRaw : (typeof idRaw === 'string' && idRaw.trim() !== '' && !isNaN(Number(idRaw)) ? Number(idRaw) : NaN);

      const name = raw?.name ?? raw?.title ?? '';
      const description = raw?.description ?? raw?.desc ?? '';
      const isPrivate = typeof raw?.isPrivate === 'boolean' ? raw.isPrivate : Boolean(raw?.private ?? false);
      const createdAt = raw?.createdAt ?? raw?.created_at ?? new Date().toISOString();
      // Determine userRole: prefer explicit userRole from API, else infer from creator
      const explicitRole = raw?.userRole ?? raw?.role ?? null;
      const creatorObj = raw?.creator ?? raw?.createdBy ?? raw?.owner ?? null;
      const creatorUsername = creatorObj && typeof creatorObj === 'object' ? (creatorObj.username ?? creatorObj.userName ?? null) : creatorObj;
      const currentUsername = localStorage.getItem('username') || '';
      let userRole = explicitRole ?? null;
      // If no explicit role from API, infer: creator -> 'admin', else 'member'
      if (userRole === null || userRole === undefined) {
        if (creatorUsername && String(creatorUsername) === currentUsername) {
          userRole = 'admin';
        } else {
          userRole = 'member';
        }
      }
      const countUserJoin = Number(raw?.countUserJoin ?? raw?.countUser ?? raw?.members ?? 0) || 0;

      return {
        id: id,
        name: String(name),
        description: typeof description === 'string' ? description : String(description ?? ''),
        isPrivate: Boolean(isPrivate),
        createdAt: String(createdAt),
  userRole: userRole === undefined || userRole === null ? null : String(userRole),
        countUserJoin: Number(countUserJoin),
      } as Group;
    }).filter((g) => Number.isFinite(g.id) && typeof g.name === 'string');

    // Log if mapping removed items
    if (rawList.length > 0 && mapped.length === 0) {
      console.error('All groups failed mapping/validation. Sample raw:', JSON.stringify(rawList[0], null, 2));
    }

    return mapped;
  };

  const validatePosts = (posts: unknown): Post[] => {
    // Accept raw post arrays from API and map them into our internal Post shape.
    if (!Array.isArray(posts)) {
      console.warn('Posts data is not an array:', posts);
      return [];
    }

    const mapped: Post[] = (posts as any[]).map((raw) => {
      const userOfPost = raw?.userOfPost || { username: raw?.user?.username || 'Người dùng', urlAvatar: null };

      return {
        id: String(raw?.id ?? raw?._id ?? ''),
        title: String(raw?.title ?? raw?.subject ?? ''),
        content: String(raw?.content ?? raw?.body ?? ''),
        createdAt: String(raw?.createdAt ?? raw?.timestamp ?? new Date().toISOString()),
        updatedAt: String(raw?.updatedAt ?? raw?.createdAt ?? new Date().toISOString()),
        userOfPost: {
          username: String(userOfPost.username ?? 'Người dùng'),
          urlAvatar: userOfPost.urlAvatar ?? null,
        },
        countLike: Number(raw?.countLike ?? raw?.likes ?? 0),
        countComment: Number(raw?.countComment ?? raw?.comments ?? 0),
        userIsLike: Boolean(raw?.userIsLike ?? raw?.isLiked ?? false),
      } as Post;
    });

    // Basic validation on mapped posts
    const validated = mapped.filter((p) => {
      const ok =
        typeof p.id === 'string' &&
        typeof p.title === 'string' &&
        typeof p.content === 'string' &&
        typeof p.createdAt === 'string' &&
        typeof p.updatedAt === 'string' &&
        p.userOfPost && typeof p.userOfPost.username === 'string' &&
        (p.userOfPost.urlAvatar === null || typeof p.userOfPost.urlAvatar === 'string') &&
        typeof p.countLike === 'number' &&
        typeof p.countComment === 'number' &&
        typeof p.userIsLike === 'boolean';

      if (!ok) {
        console.warn('Invalid mapped post:', JSON.stringify(p, null, 2));
      }

      return ok;
    });

    return validated;
  };

  const handleApiError = (error: unknown, errorMessage: string) => {
    if (error instanceof Error) {
      setError(error);
    } else if (typeof error === 'string') {
      setError(new Error(error));
    } else {
      setError(new Error(errorMessage));
    }
  };

  const searchGroups = async (query: string) => {
    setIsLoadingGroups(true);
    setError(null);
    try {
      const currentUsername = localStorage.getItem('username') || '';
      const endpoint = COMMUNITY_API.searchGroups(query, currentUsername);
      console.log('Calling searchGroups endpoint:', endpoint, 'with username:', currentUsername);

      const response = await apiService.request<{ groups: Group[]; total: number }>(
        endpoint,
        {},
        'searchGroups'
      );
      
      console.log('Search groups response:', JSON.stringify(response, null, 2));

      if (!response.success) {
        throw new Error(response.error || 'Failed to search groups');
      }

      // API sometimes returns data as an array (data: Group[]) or wrapped { groups: Group[], total }
      const raw = response.data;
      let rawGroups: any[] = [];

      if (Array.isArray(raw)) {
        rawGroups = raw;
      } else if (raw && Array.isArray((raw as any).groups)) {
        rawGroups = (raw as any).groups;
      } else if (raw && Array.isArray((raw as any).data)) {
        // handle double-wrapped structures just in case
        rawGroups = (raw as any).data;
      } else {
        console.warn('Unexpected groups payload shape:', raw);
        rawGroups = [];
      }

      if (!Array.isArray(rawGroups)) {
        console.error('Groups is not an array:', rawGroups);
        throw new Error('Invalid response format: groups is not an array');
      }

      const validatedGroups = validateGroups(rawGroups);

      if (validatedGroups.length === 0 && rawGroups.length > 0) {
        console.warn('All groups failed validation. Sample group:', JSON.stringify(rawGroups[0], null, 2));
        setGroups([]);
        return;
      }

      console.log('Validated', validatedGroups.length, 'out of', rawGroups.length, 'groups.');

      setGroups(validatedGroups);
    } catch (error) {
      handleApiError(error, 'Error searching groups');
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // Fetch groups to show in the sidebar. If a username exists in localStorage
  // we fetch that user's groups (joined/owned). If no username is present
  // (visitor / not logged in) we fetch public groups via the search/all endpoint
  // so that everyone can see public groups.
  const fetchGroups = async () => {
    setIsLoadingGroups(true);
    setError(null);

    const currentUsername = localStorage.getItem('username');
    try {
      // Always fetch public/all groups so visitors and other users can discover groups
      const allGroupsRes = await apiService.request<any>(
        COMMUNITY_API.searchGroups('', undefined as any),
        {},
        'searchAllGroups'
      );

      let userGroupsRes = null;
      if (currentUsername) {
        userGroupsRes = await apiService.request<any>(
          COMMUNITY_API.getUserGroups(currentUsername),
          {},
          'getUserGroups'
        );
      }

      if (!allGroupsRes.success) {
        console.warn('Failed to fetch all/public groups:', allGroupsRes.error);
      }

      if (userGroupsRes && !userGroupsRes.success) {
        console.warn('Failed to fetch user groups:', userGroupsRes.error);
      }

      // normalize raw arrays from responses
      const normalize = (raw: any): any[] => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw.groups)) return raw.groups;
        if (Array.isArray(raw.data)) return raw.data;
        return [];
      };

      const allRaw = normalize(allGroupsRes.data);
      const userRaw = normalize(userGroupsRes?.data);

      // Merge and dedupe by id (favor userRaw entries for richer metadata)
      const byId = new Map<number, any>();
      [...allRaw, ...userRaw].forEach((g: any) => {
        const idRaw = g?.id ?? g?._id ?? g?.groupId;
        const id = typeof idRaw === 'number' ? idRaw : (typeof idRaw === 'string' && idRaw.trim() !== '' && !isNaN(Number(idRaw)) ? Number(idRaw) : NaN);
        if (!Number.isFinite(id)) return;
        // If same id exists, prefer later entries (userRaw added after allRaw)
        byId.set(id, { ...(byId.get(id) || {}), ...g, id });
      });

      const mergedRawGroups = Array.from(byId.values());

      const validatedGroups = validateGroups(mergedRawGroups);
      console.log('Validated groups (merged):', validatedGroups);

      if (validatedGroups.length === 0 && mergedRawGroups.length > 0) {
        console.warn('Không validate được group nào, setGroups([]) để UI trống thay vì báo lỗi');
        setGroups([]);
        return;
      }

      setGroups(validatedGroups);
    } catch (error) {
      handleApiError(error, 'Error fetching groups');
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const fetchGroupPosts = async (groupId: string | number) => {
    setIsLoadingPosts(true);
    setError(null);
    try {
      const response = await apiService.request<any>(
        COMMUNITY_API.getGroupPosts(String(groupId)),
        {},
        'getGroupPosts'
      );

      console.log('Group posts response:', JSON.stringify(response, null, 2));

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch group posts');
      }

      // API may return data as an array (data: Post[]) or wrapped (data: { posts: Post[] })
      const raw = response.data;
      let rawPosts: any[] = [];

      if (Array.isArray(raw)) {
        rawPosts = raw;
      } else if (raw && Array.isArray(raw.posts)) {
        rawPosts = raw.posts;
      } else if (raw && Array.isArray((raw as any).data)) {
        // handle double-wrapped just in case
        rawPosts = (raw as any).data;
      } else {
        console.warn('Unexpected posts payload shape:', raw);
        rawPosts = [];
      }

      if (!Array.isArray(rawPosts)) {
        console.error('Posts data is not an array:', rawPosts);
        throw new Error('Invalid response format: posts is not an array');
      }

      const validatedPosts = validatePosts(rawPosts);
      console.log('Validated posts:', validatedPosts);

      if (validatedPosts.length === 0 && rawPosts.length > 0) {
        console.error('All posts failed validation. Sample post:', JSON.stringify(rawPosts[0], null, 2));
        // still set empty to avoid stale UI
        setPosts([]);
      } else {
        setPosts(validatedPosts);
      }
    } catch (error) {
      handleApiError(error, 'Error fetching group posts');
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  };



  // Handle joining a group
  const handleJoinGroup = async () => {
    if (!selectedGroup || isJoiningGroup) return;

    setIsJoiningGroup(true);
    try {
      const result = await apiService.joinGroup(selectedGroup.id);

      if (result.success) {
        // Refresh group list to get updated userRole from backend
        await fetchGroups();
        
        // The selectedGroup will be updated with new userRole through context
        // Wait a bit for state to update
        setTimeout(() => {
          // Find the updated group and set it as selected to trigger re-render
          setIsMemberOfSelectedGroup(true);
          fetchGroupPosts(selectedGroup.id);
        }, 100);

        alert('Tham gia nhóm thành công!');
      } else {
        setError(new Error(result.error || 'Không thể tham gia nhóm'));
        alert('Lỗi: ' + (result.error || 'Không thể tham gia nhóm'));
      }
    } catch (error) {
      console.error('Error joining group:', error);
      setError(error instanceof Error ? error : new Error('Có lỗi xảy ra khi tham gia nhóm'));
      alert('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsJoiningGroup(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      // Check user role from backend response
      const isAdmin = selectedGroup.userRole === 'admin' || selectedGroup.userRole === 'owner';
      const isMember = selectedGroup.userRole === 'member';
      
      // If user has any role (admin, owner, or member), they can see posts
      if (isAdmin || isMember) {
        setIsMemberOfSelectedGroup(true);
        fetchGroupPosts(selectedGroup.id);
      } else {
        // No role = not a member, need to join
        setIsMemberOfSelectedGroup(false);
        setPosts([]);
      }
    } else {
      setPosts([]);
      setIsMemberOfSelectedGroup(false);
    }
  }, [selectedGroup]);

  // create post state and handler
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Create group modal state
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupIsPrivate, setNewGroupIsPrivate] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Group delete state
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  const handleCreateGroupPost = async () => {
    if (!selectedGroup) return;
    if (!newPostTitle.trim() || !newPostContent.trim() || isCreatingPost) return;
    setIsCreatingPost(true);
    try {
      const payload = {
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        type: 'blog',
        groupId: selectedGroup.id,
      } as any;

      const res = await apiService.createPostInGroup(payload);
      if (!res.success) {
        throw new Error(res.error || 'Failed to create post');
      }

      // clear inputs
      setNewPostTitle('');
      setNewPostContent('');

      // reload posts for the current group
      await fetchGroupPosts(selectedGroup.id);
    } catch (e) {
      handleApiError(e, 'Error creating post');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleCreateGroup = async () => {
    setIsCreatingGroup(true);
    setError(null);
    try {
      const payload = {
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        isPrivate: Boolean(newGroupIsPrivate),
      };

      const res = await apiService.request<any>('/group/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, 'createGroup');

      if (!res.success) throw new Error(res.error || 'Failed to create group');

      // close modal and reset
      setShowCreateGroupModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setNewGroupIsPrivate(false);

      // reload groups
  await fetchGroups();
    } catch (err) {
      handleApiError(err, 'Error creating group');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const contentNode = (
    <div>
      {/* Welcome Panel - Show when no group selected */}
      {!selectedGroup && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <img src="/group_icon.jpg" alt="Groups" style={{ width: 120, height: 120, objectFit: 'contain' }} />
          </div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
            Chọn một nhóm để bắt đầu
          </h2>
          <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '1rem' }}>
            Xem bài viết, tham gia thảo luận và kết nối với các thành viên khác
          </p>
          
          {/* Featured Groups */}
          {groups.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 600, color: '#1f2937', textAlign: 'left' }}>
                🌟 Nhóm nổi bật
              </h3>
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                {groups.slice(0, 4).map(group => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    style={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: 12,
                      padding: 16,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                      }}>
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>{group.name}</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>👥 {group.countUserJoin} thành viên</p>
                      </div>
                    </div>
                    {group.description && (
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {group.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedGroup && (() => {
        const isAdmin = selectedGroup.userRole === 'admin' || selectedGroup.userRole === 'owner';

        return (
          <div className="group-header-card" style={{ position: 'relative' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.6rem',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {selectedGroup.name.charAt(0).toUpperCase()}
            </div>
            <div className="group-info">
              <h2 className="group-name">{selectedGroup.name}</h2>
              <p className="group-description">{selectedGroup.description || 'Không có mô tả'}</p>
              <p className="group-meta" style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: 8 }}>
                👥 {selectedGroup.countUserJoin || 0} thành viên
              </p>
            </div>

            {/* Join button if not admin and not a member */}
            {!isAdmin && !isMemberOfSelectedGroup && (
              <div style={{ position: 'absolute', right: 12, top: 12, zIndex: 80 }}>
                <button
                  onClick={handleJoinGroup}
                  disabled={isJoiningGroup}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: isJoiningGroup ? 'not-allowed' : 'pointer',
                    opacity: isJoiningGroup ? 0.7 : 1,
                  }}
                >
                  {isJoiningGroup ? 'Đang tham gia...' : '+ Tham gia'}
                </button>
              </div>
            )}

            {/* Delete button for admin */}
            {isAdmin && (
              <div style={{ position: 'absolute', right: 12, top: 12, zIndex: 80 }}>
                <button
                  className="group-header-menu-button"
                  aria-haspopup="true"
                  aria-label="Group actions"
                  onClick={() => {
                    setGroupToDelete(selectedGroup);
                    setShowDeleteGroupModal(true);
                  }}
                >
                  ⋯
                </button>
              </div>
            )}

            {/* Membership status indicator */}
            {isMemberOfSelectedGroup && !isAdmin && (
              <div style={{
                position: 'absolute',
                right: 12,
                top: 12,
                padding: '6px 12px',
                background: '#e0f2fe',
                color: '#0369a1',
                borderRadius: 6,
                fontSize: '0.85rem',
                fontWeight: 600,
              }}>
                ✓ Đã tham gia
              </div>
            )}
          </div>
        );
      })()}

      {/* Only show create post form if user is admin or member */}
      {selectedGroup && (isMemberOfSelectedGroup || selectedGroup.userRole === 'admin' || selectedGroup.userRole === 'owner') && (
        <div className="create-post-card">
          <h3 className="create-post-title">Tạo bài viết</h3>
          <input
            className="post-title-input"
            placeholder="Tiêu đề..."
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
          />
          <textarea
            className="post-content-input"
            placeholder="Nội dung..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            style={{ height: '120px' }}
          />
          <div className="post-actions">
            <button onClick={handleCreateGroupPost} disabled={isCreatingPost || !newPostTitle.trim() || !newPostContent.trim()}>
              {isCreatingPost ? 'Đang đăng...' : 'Đăng bài'}
            </button>
          </div>
        </div>
      )}

      {/* Show message if not a member and not admin */}
      {selectedGroup && !isMemberOfSelectedGroup && (
        <div style={{
          padding: 20,
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 12,
          marginBottom: 16,
        }}>
          <p style={{ color: '#6b7280', marginBottom: 12 }}>
            Bạn cần tham gia nhóm để xem bài viết
          </p>
          <button
            onClick={handleJoinGroup}
            disabled={isJoiningGroup}
            style={{
              padding: '10px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              cursor: isJoiningGroup ? 'not-allowed' : 'pointer',
              opacity: isJoiningGroup ? 0.7 : 1,
            }}
          >
            {isJoiningGroup ? 'Đang tham gia...' : '+ Tham gia nhóm'}
          </button>
        </div>
      )}

      {/* Only show posts if user is admin or member */}
      {selectedGroup && (isMemberOfSelectedGroup || selectedGroup.userRole === 'admin' || selectedGroup.userRole === 'owner') && (
        <GroupPosts
          posts={posts}
          isLoading={isLoadingPosts}
          onReload={fetchGroupPosts}
          isMember={isMemberOfSelectedGroup}
        />
      )}
    </div>
  );

  return (
    <>
      {/* Hero Section - Full width, always visible */}
      <div style={{
        background: 'white',
        backgroundImage: 'url(/community_background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '100px 0',
        marginBottom: 24,
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ margin: '0 0 32px 0', fontSize: '3rem', fontWeight: 700, color: '#1f2937', textShadow: '0 2px 4px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6)' }}>Khám phá – Thảo luận – Kết nối</h1>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                style={{
                  padding: '12px 24px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                + Tạo nhóm mới
              </button>
              <button
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                🔥 Khám phá nhóm phổ biến
              </button>
            </div>
          </div>
      </div>

      <CommunityLayout
        sidebar={
          <>
              {/* User Info Card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                }}>
                  {(localStorage.getItem('username') || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>{localStorage.getItem('username') || 'Người dùng'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Thành viên cộng đồng</div>
                </div>
              </div>

              <div className="sidebar-search-section">
                <GroupSearchCard onSearch={searchGroups} isLoading={isLoadingGroups} />
              </div>
              
              {/* Create group card below search */}
              <div className="create-group-card" style={{ marginTop: 12, padding: 12, background: 'rgba(255,255,255,0.95)', borderRadius: 12 }}>
                <button onClick={() => setShowCreateGroupModal(true)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#10b981', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  + Tạo nhóm
                </button>
              </div>

              {/* Filter Tabs */}
              <div style={{
                marginTop: 12,
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 12,
                padding: 8,
                display: 'flex',
                gap: 4,
              }}>
                <button
                  onClick={() => setGroupFilter('all')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: 8,
                    background: groupFilter === 'all' ? '#667eea' : 'transparent',
                    color: groupFilter === 'all' ? 'white' : '#6b7280',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setGroupFilter('managed')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: 8,
                    background: groupFilter === 'managed' ? '#667eea' : 'transparent',
                    color: groupFilter === 'managed' ? 'white' : '#6b7280',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Quản lý
                </button>
                <button
                  onClick={() => setGroupFilter('joined')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: 8,
                    background: groupFilter === 'joined' ? '#667eea' : 'transparent',
                    color: groupFilter === 'joined' ? 'white' : '#6b7280',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Đã tham gia
                </button>
              </div>

              <GroupList groups={(() => {
                if (groupFilter === 'all') return groups;
                if (groupFilter === 'managed') return groups.filter(g => g.userRole === 'admin' || g.userRole === 'owner');
                if (groupFilter === 'joined') return groups.filter(g => g.userRole === 'member' || g.userRole === 'admin' || g.userRole === 'owner');
                return groups;
              })()} isLoading={isLoadingGroups} onReload={fetchGroups} />
            </>
        }
        content={contentNode}
      />

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3 className="create-post-title">Tạo nhóm mới</h3>
            <div className="create-post-card">
              <input className="post-title-input" placeholder="Tên nhóm" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
              <textarea className="post-content-input" placeholder="Mô tả" value={newGroupDescription} onChange={(e) => setNewGroupDescription(e.target.value)} style={{ minHeight: 120 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <label style={{ fontWeight: 600 }}>Riêng tư</label>
                <input type="checkbox" checked={newGroupIsPrivate} onChange={(e) => setNewGroupIsPrivate(e.target.checked)} />
              </div>
              <div className="post-actions">
                <button onClick={handleCreateGroup} disabled={isCreatingGroup || !newGroupName.trim()}>{isCreatingGroup ? 'Đang tạo...' : 'Tạo nhóm'}</button>
                <button onClick={() => setShowCreateGroupModal(false)}>Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {showDeleteGroupModal && groupToDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3 className="create-post-title">Xác nhận xóa nhóm</h3>
            <div className="create-post-card">
              <p>Bạn chắc chắn muốn xóa nhóm "{groupToDelete.name}"? Hành động này không thể hoàn tác.</p>
              <div className="post-actions">
                <button
                  onClick={async () => {
                    if (!groupToDelete) return;
                    setIsDeletingGroup(true);
                    try {
                      const res = await apiService.request<any>(`/group/delete/${groupToDelete.id}`, { method: 'DELETE' }, 'deleteGroup');
                      if (!res.success) throw new Error(res.error || 'Failed to delete group');

                      // close modal
                      setShowDeleteGroupModal(false);
                      setGroupToDelete(null);

                      // reload groups
                      await fetchGroups();
                    } catch (err) {
                      setError(err instanceof Error ? err : new Error(String(err)));
                    } finally {
                      setIsDeletingGroup(false);
                    }
                  }}
                  disabled={isDeletingGroup}
                >
                  {isDeletingGroup ? 'Đang xóa...' : 'Xác nhận'}
                </button>
                <button onClick={() => { setShowDeleteGroupModal(false); setGroupToDelete(null); }}>Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const CommunityPage: React.FC = () => {
  return (
    <div className="community-page">
      <ErrorBoundary>
        <CommunityProvider>
          <CommunityPageContent />
        </CommunityProvider>
      </ErrorBoundary>
    </div>
  );
};
