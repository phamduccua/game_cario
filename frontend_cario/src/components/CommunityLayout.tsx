interface CommunityLayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  content?: React.ReactNode;
}

interface CommunityLayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  content?: React.ReactNode;
}

export const CommunityLayout: React.FC<CommunityLayoutProps> = ({
  header,
  sidebar,
  content,
}) => {
  return (
    <div className="community-container">
      <div className="community-header forum-header">
        <h1 className="community-title">Cộng đồng Cario</h1>
        <p className="community-description">Thảo luận cùng hội nhóm của bạn.</p>
        {header}
      </div>
      <div className="community-sidebar">{sidebar}</div>
      <div className="community-main">{content}</div>
    </div>
  );
};
