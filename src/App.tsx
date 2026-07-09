import React, { useState, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { ARENA_DATA, ServiceItem, EcoReward } from './data/arenaData';
import { MapService, MAP_NODES } from './services/mapService';
import { useChat } from './hooks/useChat';
import { useEcoPoints } from './hooks/useEcoPoints';
import { useIncidents } from './hooks/useIncidents';

// Subcomponents import
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StadiumMap } from './components/StadiumMap';
import { ChatPanel } from './components/ChatPanel';
import { SustainabilityTracker } from './components/SustainabilityTracker';
import { LiveServicesList } from './components/LiveServicesList';
import { IncidentFeed } from './components/IncidentFeed';
import { SimulationSandbox } from './components/SimulationSandbox';

// Helper to format basic markdown markers like **bold** or *italic* or newlines
const formatMarkdown = (text: string) => {
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
  return { __html: DOMPurify.sanitize(formatted) };
};

export default function App() {
  const [activePersona, setActivePersona] = useState<'fan' | 'staff'>('fan');
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // ServiceWait times state
  const [servicesList, setServicesList] = useState<ServiceItem[]>(ARENA_DATA.services);

  // Seat Navigation selections
  const [startNode, setStartNode] = useState<string>('Gate_B');
  const [endNode, setEndNode] = useState<string>('Sec_105');
  const [accessibleOnly, setAccessibleOnly] = useState<boolean>(false);
  const [navigationRouteStr, setNavigationRouteStr] = useState<string>('');
  const [routeAccessible, setRouteAccessible] = useState<boolean>(true);

  // Operations Map filters
  const [showSecurity, setShowSecurity] = useState(true);
  const [showMedical, setShowMedical] = useState(true);
  const [showVolunteers, setShowVolunteers] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);

  // Incident Logger Form State (controlled for SVG map click sync)
  const [newIncType, setNewIncType] = useState<'Medical' | 'Crowd' | 'Maintenance' | 'Security' | 'Hardware'>('Medical');
  const [newIncLoc, setNewIncLoc] = useState<string>('Gate_A');

  // Frame-Busting Clickjacking Defense
  useEffect(() => {
    if (window.self !== window.top && window.top) {
      try {
        window.top.location.href = window.self.location.href;
      } catch {
        // ignore cross-origin error
      }
    }
  }, []);

  // Update Clock widget
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Seat path calculation logic
  const calculateRoute = useCallback((start: string, end: string, accessOnly: boolean) => {
    const res = MapService.findPath(start, end, accessOnly);
    if (res.path) {
      const points = res.path.map(nodeId => {
        const node = MAP_NODES[nodeId];
        return node ? `${node.x},${node.y}` : '';
      }).join(' ');
      setNavigationRouteStr(points);
      setRouteAccessible(res.accessible);
    } else {
      setNavigationRouteStr('');
      setRouteAccessible(true);
    }
  }, []);

  // Auto trigger route calculations on start, end, or accessibility toggle
  useEffect(() => {
    calculateRoute(startNode, endNode, accessibleOnly);
  }, [startNode, endNode, accessibleOnly, calculateRoute]);

  // Chat Trigger Accessibility callback
  const handleChatTriggerAccessibility = useCallback(() => {
    setStartNode('Gate_B');
    setEndNode('Sec_105');
    setAccessibleOnly(true);
  }, []);

  // Hooks setup
  const chat = useChat('en', handleChatTriggerAccessibility);
  
  const handleVoucherClaimed = useCallback((msg: string) => {
    chat.appendBotMessage(msg);
  }, [chat.appendBotMessage]);

  const eco = useEcoPoints(250, handleVoucherClaimed);
  
  const handleClaim = useCallback((reward: EcoReward) => {
    eco.claimReward(reward);
  }, [eco.claimReward]);

  const incidents = useIncidents(ARENA_DATA.incidents);
  const { selectedIncidentId, getSelectedIncident } = incidents;

  // Set selected incident overlay mapping
  useEffect(() => {
    const activeInc = getSelectedIncident();
    if (activeInc && activePersona === 'staff') {
      // Draw route path from FirstAid to active incident loc
      const res = MapService.findPath('FirstAid', activeInc.loc, false);
      if (res.path) {
        const points = res.path.map(nodeId => `${MAP_NODES[nodeId].x},${MAP_NODES[nodeId].y}`).join(' ');
        setNavigationRouteStr(points);
      }
    } else if (activePersona === 'staff') {
      setNavigationRouteStr('');
    }
  }, [selectedIncidentId, activePersona, getSelectedIncident]);

  // Handle map node clicking
  const handleMapNodeClick = (nodeId: string) => {
    if (activePersona === 'staff') {
      setNewIncLoc(nodeId);
    } else {
      if (startNode === nodeId) {
        // Toggle/rotate selections
        setStartNode(endNode);
        setEndNode(nodeId);
      } else {
        setEndNode(nodeId);
      }
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    chat.changeLanguage(e.target.value);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Panel */}
      <Header
        selectedLang={chat.selectedLanguage}
        currentTime={currentTime}
        activePersona={activePersona}
        setActivePersona={setActivePersona}
        handleLanguageChange={handleLanguageChange}
      />

      {/* Main Body */}
      <main className="app-container">
        
        {/* FAN VIEW */}
        <div className={`persona-view ${activePersona === 'fan' ? 'active' : ''}`}>
          <div className="view-grid grid-3-cols">
            
            {/* Col 1: AI Chat Assistant */}
            <ChatPanel chat={chat} />

            {/* Col 2: Seat Map Navigation */}
            <section className="card glass-panel navigation-container">
              <div className="card-header">
                <div className="title-with-subtitle">
                  <h2>Navigation & Seat Wayfinding</h2>
                  <p>Real-time pathfinding and crowd density</p>
                </div>
                <div className="map-modes">
                  <label htmlFor="toggle-accessibility" className="toggle-switch">
                    <input
                      id="toggle-accessibility"
                      type="checkbox"
                      checked={accessibleOnly}
                      onChange={(e) => setAccessibleOnly(e.target.checked)}
                    />
                    <span className="slider"></span>
                    <span className="label-text">♿ Accessible Only</span>
                  </label>
                </div>
              </div>

              {/* Sizing selections */}
              <div className="route-selector-row">
                <div className="select-wrapper">
                  <label htmlFor="route-start">Start</label>
                  <select id="route-start" value={startNode} onChange={(e) => setStartNode(e.target.value)}>
                    <option value="Gate_A">Gate A (North)</option>
                    <option value="Gate_B">Gate B (East)</option>
                    <option value="Gate_C">Gate C (South)</option>
                    <option value="Gate_D">Gate D (West)</option>
                    <option value="FirstAid">First Aid (Center)</option>
                  </select>
                </div>
                <button
                  className="route-swap-btn"
                  onClick={() => {
                    const tmp = startNode;
                    setStartNode(endNode);
                    setEndNode(tmp);
                  }}
                  aria-label="Swap start and destination locations"
                >
                  ⇆
                </button>
                <div className="select-wrapper">
                  <label htmlFor="route-end">Destination</label>
                  <select id="route-end" value={endNode} onChange={(e) => setEndNode(e.target.value)}>
                    <option value="Sec_101">Section 101 (Seating)</option>
                    <option value="Sec_102">Section 102 (Seating)</option>
                    <option value="Sec_103">Section 103 (Seating)</option>
                    <option value="Sec_104">Section 104 (Seating)</option>
                    <option value="Sec_105">Section 105 (Accessible Wheelchair Seating)</option>
                    <option value="Sec_106">Section 106 (Seating)</option>
                    <option value="Concession_1">Food Court 1 (West Corridor)</option>
                    <option value="Restroom_1">Restrooms A (East Corridor)</option>
                    <option value="FirstAid">First Aid (Center)</option>
                  </select>
                </div>
                <button
                  onClick={() => calculateRoute(startNode, endNode, accessibleOnly)}
                  className="btn-action"
                >
                  Guide Me
                </button>
              </div>

              {/* Accessible Route Warning Banner */}
              {!routeAccessible && accessibleOnly && (
                <div 
                  className="accessibility-warning-banner" 
                  style={{
                    background: 'rgba(255, 190, 26, 0.15)',
                    border: '1px solid var(--neon-yellow)',
                    color: 'var(--neon-yellow)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  role="alert"
                >
                  <span>⚠️</span>
                  <span>No step-free route available. Showing standard route instead.</span>
                </div>
              )}

              <div className="map-view-box">
                <StadiumMap
                  isStaff={false}
                  startNode={startNode}
                  endNode={endNode}
                  accessibleOnly={accessibleOnly}
                  navigationRouteStr={navigationRouteStr}
                  incidents={incidents.incidents}
                  handleMapNodeClick={handleMapNodeClick}
                />
                <div className="map-legend">
                  <span className="legend-item"><span className="dot dot-green"></span> Low Wait</span>
                  <span className="legend-item"><span className="dot dot-orange"></span> Med Wait</span>
                  <span className="legend-item"><span className="dot dot-red"></span> High Wait</span>
                  <span className="legend-item"><span className="dot dot-wheelchair"></span> Elevators/Ramps</span>
                </div>
              </div>
            </section>

            {/* Col 3: Side cards */}
            <section className="card-column">
              {/* Eco goals tracker */}
              <SustainabilityTracker eco={eco} handleClaim={handleClaim} />

              {/* Wait queues */}
              <LiveServicesList servicesList={servicesList} setServicesList={setServicesList} />
            </section>

          </div>
        </div>

        {/* STAFF VIEW */}
        <div className={`persona-view ${activePersona === 'staff' ? 'active' : ''}`}>
          <div className="view-grid grid-3-cols">
            
            {/* Col 1: Operations Feed & Logger */}
            <IncidentFeed
              incidents={incidents}
              newIncType={newIncType}
              setNewIncType={setNewIncType}
              newIncLoc={newIncLoc}
              setNewIncLoc={setNewIncLoc}
              formatMarkdown={formatMarkdown}
            />

            {/* Col 2: Operations Map */}
            <section className="card glass-panel staff-map-container">
              <div className="card-header">
                <div className="title-with-subtitle">
                  <h2>Dynamic Resource & Incident Map</h2>
                  <p>Tracks stadium personnel deployment and active incidents</p>
                </div>
              </div>

              <div className="staff-map-controls">
                <div className="filter-group">
                  <label htmlFor="show-security" className="filter-chk">
                    <input id="show-security" type="checkbox" checked={showSecurity} onChange={(e) => setShowSecurity(e.target.checked)} /> 🛡️ Security
                  </label>
                  <label htmlFor="show-medical" className="filter-chk">
                    <input id="show-medical" type="checkbox" checked={showMedical} onChange={(e) => setShowMedical(e.target.checked)} /> 🩺 Medical
                  </label>
                  <label htmlFor="show-volunteers" className="filter-chk">
                    <input id="show-volunteers" type="checkbox" checked={showVolunteers} onChange={(e) => setShowVolunteers(e.target.checked)} /> 🙋 Volunteers
                  </label>
                  <label htmlFor="show-incidents" className="filter-chk">
                    <input id="show-incidents" type="checkbox" checked={showAlerts} onChange={(e) => setShowAlerts(e.target.checked)} /> ⚠️ Alerts
                  </label>
                </div>
              </div>

              <div className="map-view-box">
                <StadiumMap
                  isStaff={true}
                  navigationRouteStr={navigationRouteStr}
                  showSecurity={showSecurity}
                  showMedical={showMedical}
                  showVolunteers={showVolunteers}
                  showAlerts={showAlerts}
                  incidents={incidents.incidents}
                  setSelectedIncidentId={incidents.setSelectedIncidentId}
                  handleMapNodeClick={handleMapNodeClick}
                />
                <div className="map-legend">
                  <span className="legend-item"><span className="dot dot-security"></span> Security</span>
                  <span className="legend-item"><span className="dot dot-medical"></span> Medical</span>
                  <span className="legend-item"><span className="dot dot-volunteer"></span> Volunteer</span>
                  <span className="legend-item"><span className="dot dot-incident-alert"></span> Incident</span>
                </div>
              </div>
            </section>

            {/* Col 3: Simulation Sandbox */}
            <SimulationSandbox />

          </div>
        </div>

      </main>

      {/* Footer widget */}
      <Footer />

    </div>
  );
}
