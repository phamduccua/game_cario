import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommunityPage } from '../CommunityPage';
import { apiService } from '@/services/api';

// Mock apiService
jest.mock('@/services/api', () => ({
  apiService: {
    request: jest.fn()
  },
  COMMUNITY_API: {
    searchGroups: (query: string) => `/group/get/all?name=${query}`,
    getUserGroups: () => '/group/get/by-user',
    getGroupPosts: (groupId: string) => `/posts/get/by-group?groupId=${groupId}`
  }
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('CommunityPage Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and displays user groups on mount', async () => {
    mockApiService.request.mockResolvedValueOnce({
      success: true,
      data: {
        data: {
          groups: [
            { id: '1', name: 'Group 1', memberCount: 10, createdAt: '2025-09-12T00:00:00Z' }
          ]
        }
      }
    });

    render(<CommunityPage />);

    expect(screen.getByText('Cộng đồng Cario')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });
  });

  it('displays loading state while fetching groups', () => {
    mockApiService.request.mockImplementation(() => new Promise(() => {}));
    render(<CommunityPage />);
    expect(screen.getByText('Đang tải danh sách nhóm...')).toBeInTheDocument();
  });

  it('searches groups when using search input', async () => {
    mockApiService.request
      .mockResolvedValueOnce({ success: true, data: { data: { groups: [] } } }) // Initial groups load
      .mockResolvedValueOnce({
        success: true,
        data: {
          data: {
            groups: [
              { id: '2', name: 'Search Result', memberCount: 5, createdAt: '2025-09-12T00:00:00Z' }
            ]
          }
        }
      });

    render(<CommunityPage />);

    const searchInput = screen.getByPlaceholderText('Tìm kiếm nhóm...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Search Result')).toBeInTheDocument();
    });
  });

  it('loads posts when selecting a group', async () => {
    // Mock initial groups load
    mockApiService.request.mockResolvedValueOnce({
      success: true,
      data: {
        data: {
          groups: [
            { id: '1', name: 'Group 1', memberCount: 10, createdAt: '2025-09-12T00:00:00Z' }
          ]
        }
      }
    });

    // Mock posts load
    mockApiService.request.mockResolvedValueOnce({
      success: true,
      data: {
        data: {
          posts: [
            {
              id: '1',
              content: 'Test post',
              authorId: 'user1',
              authorName: 'Test User',
              groupId: '1',
              createdAt: '2025-09-12T00:00:00Z'
            }
          ]
        }
      }
    });

    render(<CommunityPage />);

    await waitFor(() => {
      const groupElement = screen.getByText('Group 1');
      fireEvent.click(groupElement);
    });

    await waitFor(() => {
      expect(screen.getByText('Test post')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockApiService.request.mockRejectedValueOnce(new Error('API Error'));
    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy nhóm nào')).toBeInTheDocument();
    });
  });
});
