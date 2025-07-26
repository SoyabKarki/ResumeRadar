import React from 'react';

const PassBanner = ({ missingRequired }) => (
  <div
    style={{
      padding: '6px 8px',
      marginBottom: '8px',
      borderRadius: '4px',
      background: missingRequired === 0 ? '#dff0d8' : '#f2dede',
      color: missingRequired === 0 ? '#3c763d' : '#a94442',
      fontWeight: 600,
      textAlign: 'center',
    }}
  >
    {missingRequired === 0 ? 'PASS: All required keywords present' : 'Missing required keywords'}
  </div>
);

export default PassBanner;