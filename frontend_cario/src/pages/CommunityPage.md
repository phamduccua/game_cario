# Community Page Documentation

## Overview
The Community Page provides a Facebook-like group interface where users can browse and interact with community groups. It consists of several components that work together to provide a seamless user experience.

## Components

### CommunityPage
Main container component that sets up the context and error boundary.
- Location: `src/pages/CommunityPage.tsx`
- Features:
  - Provides CommunityContext
  - Implements error boundary
  - Manages loading states and data fetching

### CommunityLayout
Layout component that structures the page with a sidebar and main content area.
- Location: `src/components/CommunityLayout.tsx`
- Props:
  - `header?: React.ReactNode`
  - `sidebar?: React.ReactNode`
  - `content?: React.ReactNode`

### GroupSearchCard
Search interface for finding groups.
- Location: `src/components/GroupSearchCard.tsx`
- Props:
  - `onSearch: (query: string) => Promise<void>`
  - `isLoading: boolean`
- Features:
  - Debounced search input
  - Loading state handling

### GroupList
Displays the list of available groups.
- Location: `src/components/GroupList.tsx`
- Props:
  - `groups: Group[]`
  - `isLoading: boolean`
- Features:
  - Group selection
  - Empty state handling
  - Loading skeleton UI

### GroupPosts
Displays posts for the selected group.
- Location: `src/components/GroupPosts.tsx`
- Props:
  - `posts: Post[]`
  - `isLoading: boolean`
- Features:
  - Post display
  - Empty state handling
  - Loading skeleton UI

## State Management
The application uses React Context for state management:
- Location: `src/context/CommunityContext.tsx`
- Features:
  - Selected group management
  - Loading state management
  - Error state management

## Error Handling
The application includes comprehensive error handling:
- Component level error boundaries
- API error handling with fallbacks
- User-friendly error messages
- Recovery options (reload)

## API Integration
All API calls are made through the apiService:
- Location: `src/services/api.ts`
- Endpoints:
  - Search groups: `/group/get/all?name={query}`
  - User groups: `/group/get/by-user`
  - Group posts: `/posts/get/by-group?groupId={id}`

## Styling
The application uses Emotion for styling:
- Consistent with forum page design
- Responsive layout
- Loading skeleton animations
- Error state styling

## Usage Example
```tsx
// Import the page component
import { CommunityPage } from '@/pages/CommunityPage';

// Use in router
<Route path="/community" element={<CommunityPage />} />
```

## Performance Considerations
- Lazy loading for the community page
- Debounced search to prevent excessive API calls
- Loading skeletons for better UX
- Error boundaries for reliability

## Testing
The application includes comprehensive tests:
- Component tests for all main components
- Integration tests for the complete page
- Error boundary tests
- Loading state tests

## Future Improvements
- Pagination for groups and posts
- Real-time updates
- Group creation/management
- Post creation
- User interactions (likes, comments)
