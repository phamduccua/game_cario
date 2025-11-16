interface CommunityLayoutProps {
  sidebar?: React.ReactNode;
  content?: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export const CommunityLayout: React.FC<CommunityLayoutProps> = ({
  sidebar,
  content,
  rightSidebar,
}) => {
  return (
    <div className="community-container">
      <div className="community-layout-grid">
        <div className="community-sidebar">{sidebar}</div>
        <div className="community-main">{content}</div>
        {rightSidebar && (
          <div className="community-right-sidebar">{rightSidebar}</div>
        )}
      </div>
    </div>
  );
};
