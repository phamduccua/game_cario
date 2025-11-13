export interface Group {
  id: number;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdAt: string;
  // API uses lowercase roles like 'admin' / 'member' — accept string or null
  userRole: string | null;
  // API field name is countUserJoin
  countUserJoin: number;
}

export interface UserPostInfo {
  username: string;
  urlAvatar: string | null;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userOfPost: UserPostInfo;
  countLike: number;
  countComment: number;
  userIsLike: boolean;
}

export interface GroupSearchResponse {
  success: boolean;
  error?: string;
  data: {
    groups: Group[];
    total: number;
  };
}

export interface UserGroupsResponse {
  success: boolean;
  error?: string;
  data: Group[];
}

export interface GroupPostsResponse {
  success: boolean;
  error?: string;
  data: {
    posts: Post[];
    total: number;
  };
}

export interface CommunityContextType {
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
  isLoading: boolean;
  error: Error | null;
}
