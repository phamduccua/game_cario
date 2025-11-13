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
import logo from '@/assets/logo.png';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const CommunityPageContent: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const { selectedGroup, setError } = useCommunity();

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

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupPosts(selectedGroup.id);
    } else {
      setPosts([]);
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
      {selectedGroup && (() => {
        // compute ownership debug info once
        const currentUsername = localStorage.getItem('username') || '';
        console.log('DEBUG - selectedGroup (community header):', selectedGroup);
        console.log('DEBUG - currentUsername:', currentUsername);

        // API shapes vary: check common fields
        const creatorObj = (selectedGroup as any).creator || (selectedGroup as any).createdBy || null;
        const creatorUsername = creatorObj?.username ?? creatorObj ?? null;
        const isCreator = creatorUsername === currentUsername || selectedGroup.userRole === 'owner' || (selectedGroup as any).owner === currentUsername;

        console.log('DEBUG - ownership check:', { creatorObj, creatorUsername, userRole: selectedGroup.userRole, isCreator });

        return (
          <div className="group-header-card" style={{ position: 'relative' }}>
            <div className="group-avatar">
              <img src={logo} alt={selectedGroup.name} />
            </div>
            <div className="group-info">
              <h2 className="group-name">{selectedGroup.name}</h2>
              <p className="group-description">{selectedGroup.description || 'Không có mô tả'}</p>
            </div>

            {isCreator && (
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
          </div>
        );
      })()}

      {selectedGroup && (
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

  <GroupPosts posts={posts} isLoading={isLoadingPosts} onReload={fetchGroupPosts} />
    </div>
  );

  return (
    <>
      <CommunityLayout
        sidebar={
          <>
              <div className="sidebar-search-section">
                <GroupSearchCard onSearch={searchGroups} isLoading={isLoadingGroups} />
              </div>
              {/* Create group card below search */}
              <div className="create-group-card" style={{ marginTop: 12, padding: 12, background: 'rgba(255,255,255,0.95)', borderRadius: 12 }}>
                <button onClick={() => setShowCreateGroupModal(true)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#10b981', color: 'white', border: 'none', fontWeight: 700 }}>
                  + Tạo nhóm
                </button>
              </div>

              <GroupList groups={groups} isLoading={isLoadingGroups} onReload={fetchGroups} />
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
