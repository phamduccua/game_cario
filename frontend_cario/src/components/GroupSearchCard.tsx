import { useState, useRef, useEffect } from 'react';

interface GroupSearchCardProps {
  onSearch: (query: string) => Promise<void>;
  isLoading: boolean;
}

export const GroupSearchCard: React.FC<GroupSearchCardProps> = ({
  onSearch,
  isLoading,
}) => {
  const [query, setQuery] = useState('');

  // ensure we always call the latest onSearch
  const latestOnSearch = useRef(onSearch);
  useEffect(() => {
    latestOnSearch.current = onSearch;
  }, [onSearch]);

  const debounceDelay = 300; // ms

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // only update local state here
    setQuery(e.target.value);
  };

  // Keep references to these values so TS/lint don't complain. No runtime effect.
  void isLoading;
  void handleSearchChange;

  // IMPORTANT: API calls from the search input were previously disabled.
  // Enable them so the search box will call the provided `onSearch` handler.
  const disableApiCalls = false;

  // debounce the API call when `query` changes — gated by disableApiCalls
  useEffect(() => {
    if (disableApiCalls) return;

    const id = window.setTimeout(() => {
      // call the latest onSearch with the current query value
      latestOnSearch.current(query);
    }, debounceDelay);

    return () => {
      window.clearTimeout(id);
    };
  }, [query, disableApiCalls]);

  return (
    <div className="search-card">
      <h3 className="search-card-title">Tìm kiếm cộng đồng</h3>
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">
          {/* Inline magnifying glass SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="11" cy="11" r="6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm nhóm..."
          value={query}
          onChange={handleSearchChange}
          disabled={isLoading}
          aria-label="Tìm kiếm nhóm"
        />
      </div>
    </div>
  );
};
