import React from 'react';

export const Spinner = ({ message = 'Memuat data...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    gap: '16px'
  }}>
    <div className="spinner"></div>
    <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>{message}</p>
  </div>
);

export const SkeletonCard = () => (
  <div className="card" style={{ height: '100%', minHeight: '320px' }}>
    <div className="skeleton" style={{ width: '100%', aspectRatio: '16/10' }}></div>
    <div className="card-body" style={{ gap: '12px' }}>
      <div className="skeleton" style={{ width: '30%', height: '16px' }}></div>
      <div className="skeleton" style={{ width: '80%', height: '24px' }}></div>
      <div className="skeleton" style={{ width: '100%', height: '48px' }}></div>
      <div className="skeleton" style={{ width: '40%', height: '36px', marginTop: 'auto' }}></div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 3 }) => (
  <div className="grid grid-cols-3">
    {Array.from({ length: count }).map((_, idx) => (
      <SkeletonCard key={idx} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="table-wrapper">
    <table className="admin-table">
      <thead>
        <tr>
          {Array.from({ length: cols }).map((_, idx) => (
            <th key={idx}><div className="skeleton" style={{ width: '60px', height: '16px' }}></div></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rIdx) => (
          <tr key={rIdx}>
            {Array.from({ length: cols }).map((_, cIdx) => (
              <td key={cIdx}><div className="skeleton" style={{ width: cIdx === 0 ? '180px' : '80px', height: '16px' }}></div></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const SkeletonDetail = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div className="skeleton" style={{ width: '100%', aspectRatio: '21/9', borderRadius: 'var(--radius-lg)' }}></div>
    <div className="skeleton" style={{ width: '60%', height: '36px' }}></div>
    <div className="skeleton" style={{ width: '25%', height: '20px' }}></div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
      <div className="skeleton" style={{ width: '100%', height: '16px' }}></div>
      <div className="skeleton" style={{ width: '100%', height: '16px' }}></div>
      <div className="skeleton" style={{ width: '90%', height: '16px' }}></div>
      <div className="skeleton" style={{ width: '95%', height: '16px' }}></div>
      <div className="skeleton" style={{ width: '40%', height: '16px' }}></div>
    </div>
  </div>
);

const Loading = {
  Spinner,
  SkeletonCard,
  SkeletonGrid,
  SkeletonTable,
  SkeletonDetail
};

export default Loading;
