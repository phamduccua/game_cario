export const GroupListSkeleton = () => (
  <>
    {[...Array(3)].map((_, i) => (
      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
        <div className="loading-skeleton" style={{ height: '24px', width: '80%' }} />
        <div className="loading-skeleton" style={{ height: '16px', width: '60%' }} />
      </div>
    ))}
  </>
);

export const PostsSkeleton = () => (
  <>
    {[...Array(3)].map((_, i) => (
      <div 
        key={i} 
        style={{ 
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="loading-skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <div className="loading-skeleton" style={{ height: '16px', width: '120px' }} />
            <div className="loading-skeleton" style={{ height: '12px', width: '80px' }} />
          </div>
        </div>
        <div className="loading-skeleton" style={{ height: '24px', width: '60%' }} />
        <div className="loading-skeleton" style={{ height: '60px', width: '100%' }} />
        <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
          <div className="loading-skeleton" style={{ height: '16px', width: '60px' }} />
          <div className="loading-skeleton" style={{ height: '16px', width: '60px' }} />
        </div>
      </div>
    ))}
  </>
);
