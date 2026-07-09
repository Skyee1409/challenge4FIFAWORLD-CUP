import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-left">
        <span>FIFA World Cup 2026™ Venue Operations Dashboard</span>
      </div>
      <div className="footer-right">
        <span className="status-dot green" aria-hidden="true"></span> Connected to Stadium Edge Server Network
      </div>
    </footer>
  );
};
