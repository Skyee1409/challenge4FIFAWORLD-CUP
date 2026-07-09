import React from 'react';

interface HeaderProps {
  selectedLang: string;
  currentTime: string;
  activePersona: 'fan' | 'staff';
  setActivePersona: (p: 'fan' | 'staff') => void;
  handleLanguageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLang,
  currentTime,
  activePersona,
  setActivePersona,
  handleLanguageChange,
}) => {
  return (
    <header className="app-header">
      <div className="header-logo">
        <div className="logo-glow"></div>
        <svg className="header-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          <path d="M2 12h20"></path>
        </svg>
        <h1>Arena<span>Mind</span></h1>
        <span className="badge badge-primary">FIFA WC 2026</span>
      </div>

      {/* Live Ticker */}
      <div className="match-ticker">
        <div className="live-indicator">
          <span className="live-dot animate-pulse"></span>
          <span className="live-text">
            {selectedLang === 'es' ? 'EN VIVO PARTIDO 14' : selectedLang === 'fr' ? 'EN DIRECT MATCH 14' : 'LIVE MATCH 14'}
          </span>
        </div>
        <div className="match-vs">
          <span className="team">MEXICO</span>
          <span className="score">2</span>
          <span className="vs">-</span>
          <span className="score">1</span>
          <span className="team">USA</span>
        </div>
        <div className="match-meta">Estadio Azteca • 76'</div>
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        <div className="persona-switcher">
          <button
            onClick={() => setActivePersona('fan')}
            className={`btn-persona ${activePersona === 'fan' ? 'active' : ''}`}
            aria-label="Switch to Fan Portal"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            {selectedLang === 'es' ? 'Fan Portal' : selectedLang === 'fr' ? 'Hub Fan' : 'Fan Hub'}
          </button>
          <button
            onClick={() => setActivePersona('staff')}
            className={`btn-persona ${activePersona === 'staff' ? 'active' : ''}`}
            aria-label="Switch to Operations Command"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            {selectedLang === 'es' ? 'Control' : selectedLang === 'fr' ? 'Securité' : 'Command'}
          </button>
        </div>

        <div className="lang-selector">
          <select value={selectedLang} onChange={handleLanguageChange} aria-label="Select Language">
            <option value="en">🇺🇸 EN</option>
            <option value="es">🇲🇽 ES</option>
            <option value="fr">🇫🇷 FR</option>
            <option value="pt">🇧🇷 PT</option>
          </select>
        </div>

        <div className="time-widget">
          <span>{currentTime}</span>
          <span className="widget-divider">|</span>
          <span>24°C ☀️</span>
        </div>
      </div>
    </header>
  );
};
