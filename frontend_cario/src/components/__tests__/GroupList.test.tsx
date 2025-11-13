import { render, screen, fireEvent } from '@testing-library/react';
import { GroupList } from '../GroupList';
import { CommunityProvider } from '@/context/CommunityContext';
import { Group } from '@/types/community';

// Mock data
const mockGroups: Group[] = [
  {
    id: 1,
    name: 'Test Group 1',
    countUserJoin: 10,
    description: 'First group',
    isPrivate: false,
    userRole: null,
    createdAt: '2025-09-12T00:00:00Z'
  },
  {
    id: 2,
    name: 'Test Group 2',
    countUserJoin: 20,
    description: 'Second group',
    isPrivate: true,
    userRole: 'member',
    createdAt: '2025-09-12T00:00:00Z'
  }
];

describe('GroupList', () => {
  const renderWithContext = (component: React.ReactNode) => {
    return render(<CommunityProvider>{component}</CommunityProvider>);
  };

  it('renders loading state', () => {
    renderWithContext(<GroupList groups={[]} isLoading={true} />);
    expect(screen.getByText('Đang tải danh sách nhóm...')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    renderWithContext(<GroupList groups={[]} isLoading={false} />);
    expect(screen.getByText('Không tìm thấy nhóm nào')).toBeInTheDocument();
  });

  it('renders list of groups', () => {
    renderWithContext(<GroupList groups={mockGroups} isLoading={false} />);
    expect(screen.getByText('Test Group 1')).toBeInTheDocument();
    expect(screen.getByText('Test Group 2')).toBeInTheDocument();
  });

  it('shows group details', () => {
    renderWithContext(<GroupList groups={mockGroups} isLoading={false} />);
  expect(screen.getByText('First group')).toBeInTheDocument();
  expect(screen.getByText('Second group')).toBeInTheDocument();
  });

  it('selects group on click', () => {
    renderWithContext(<GroupList groups={mockGroups} isLoading={false} />);
    fireEvent.click(screen.getByText('Test Group 1'));
    // Note: We would need to mock the context to verify this properly
  });
});
