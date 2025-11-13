import { render, screen, fireEvent } from '@testing-library/react';
import { GroupSearchCard } from '../GroupSearchCard';

describe('GroupSearchCard', () => {
  const mockOnSearch = jest.fn();
  const mockIsLoading = false;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input correctly', () => {
    render(<GroupSearchCard onSearch={mockOnSearch} isLoading={mockIsLoading} />);
    const searchInput = screen.getByPlaceholderText('Tìm kiếm nhóm...');
    expect(searchInput).toBeInTheDocument();
  });

  it('calls onSearch with debounce when typing', async () => {
    render(<GroupSearchCard onSearch={mockOnSearch} isLoading={mockIsLoading} />);
    const searchInput = screen.getByPlaceholderText('Tìm kiếm nhóm...') as HTMLInputElement;
    
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for debounce
    await new Promise((r) => setTimeout(r, 500));
    expect(mockOnSearch).toHaveBeenCalledWith('test');
  });

  it('disables input when loading', () => {
    render(<GroupSearchCard onSearch={mockOnSearch} isLoading={true} />);
    const searchInput = screen.getByPlaceholderText('Tìm kiếm nhóm...') as HTMLInputElement;
    expect(searchInput).toBeDisabled();
  });
});
