import { render, screen } from '@testing-library/react';
import { GroupPosts } from '../GroupPosts';
import { CommunityProvider } from '@/context/CommunityContext';
import { Post } from '@/types/community';

// Mock data
const mockPosts: Post[] = [
  {
    id: '1',
  title: 'Post One',
  content: 'Test post 1',
  createdAt: '2025-09-12T00:00:00Z',
  updatedAt: '2025-09-12T00:00:00Z',
  userOfPost: { username: 'User One', urlAvatar: null },
  countLike: 0,
  countComment: 0,
  userIsLike: false
  },
  {
    id: '2',
  title: 'Post Two',
  content: 'Test post 2',
  createdAt: '2025-09-12T01:00:00Z',
  updatedAt: '2025-09-12T01:00:00Z',
  userOfPost: { username: 'User Two', urlAvatar: null },
  countLike: 1,
  countComment: 2,
  userIsLike: true
  }
];

describe('GroupPosts', () => {
  const renderWithContext = (component: React.ReactNode) => {
    return render(<CommunityProvider>{component}</CommunityProvider>);
  };

  it('renders loading state', () => {
    renderWithContext(<GroupPosts posts={[]} isLoading={true} />);
    expect(screen.getByText('Đang tải bài viết...')).toBeInTheDocument();
  });

  it('renders empty state when no group selected', () => {
    renderWithContext(<GroupPosts posts={[]} isLoading={false} />);
    expect(screen.getByText('Chọn một nhóm để xem các bài viết')).toBeInTheDocument();
  });

  it('renders empty state when group has no posts', () => {
    renderWithContext(<GroupPosts posts={[]} isLoading={false} />);
    expect(screen.getByText('Chưa có bài viết nào trong nhóm này')).toBeInTheDocument();
  });

  it('renders list of posts', () => {
    renderWithContext(<GroupPosts posts={mockPosts} isLoading={false} />);
    expect(screen.getByText('Test post 1')).toBeInTheDocument();
    expect(screen.getByText('Test post 2')).toBeInTheDocument();
  expect(screen.getByText('User One')).toBeInTheDocument();
  expect(screen.getByText('User Two')).toBeInTheDocument();
  });
});
