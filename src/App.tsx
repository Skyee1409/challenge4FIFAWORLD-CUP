import React, { useState, useEffect, useRef, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { ARENA_DATA, Match, ServiceItem } from './data/arenaData';
import { MapService, MAP_NODES, MAP_EDGES, STAFF_RESOURCES } from './services/mapService';
import { AIService } from './services/aiService';
import { SimulationService } from './services/simulationService';
import { useChat } from './hooks/useChat';
import { useEcoPoints } from './hooks/useEcoPoints';
import { useIncidents } from './hooks/useIncidents';

// Helper to sanitize HTML content to prevent XSS
const sanitize = (dirty: string) => {
  return { __html: DOMPurify.sanitize(dirty) };
};

// Helper to format basic markdown markers like **bold** or *italic* or newlines
const formatMarkdown = (text: string) => {
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
  return sanitize(formatted);
};

export default function App() {
  const [activePersona, setActivePersona] = useState<'fan' | 'staff'>('fan');
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // ServiceWait times state (allows randomizing on refresh click)
  const [servicesList, setServicesList] = useState<ServiceItem[]>(ARENA_DATA.services);
  const [isRefreshingServices, setIsRefreshingServices] = useState(false);

  // Seat Navigation selections
  const [startNode, setStartNode] = useState<string>('Gate_B');
  const [endNode, setEndNode] = useState<string>('Sec_105');
  const [accessibleOnly, setAccessibleOnly] = useState<boolean>(false);
  const [navigationRouteStr, setNavigationRouteStr] = useState<string>('');

  // Operations Map filters
  const [showSecurity, setShowSecurity] = useState(true);
  const [showMedical, setShowMedical] = useState(true);
  const [showVolunteers, setShowVolunteers] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);

  // Incident Logger Form State
  const [newIncType, setNewIncType] = useState<'Medical' | 'Crowd' | 'Maintenance' | 'Security' | 'Hardware'>('Medical');
  const [newIncLoc, setNewIncLoc] = useState<string>('Gate_A');
  const [newIncDesc, setNewIncDesc] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Simulation Sandbox State
  const [selectedScenario, setSelectedScenario] = useState<string>('thunderstorm');
  const [simStatus, setSimStatus] = useState<string>('');
  const [simImpact, setSimImpact] = useState<string>('');
  const [simAgentLogs, setSimAgentLogs] = useState<{ agent: string; role: string; text: string }[]>([]);

  // Frame-Busting Clickjacking Defense
  useEffect(() => {
    if (window.self !== window.top) {
      window.top.location = window.self.location;
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
    const path = MapService.findPath(start, end, accessOnly);
    if (path) {
      const points = path.map(nodeId => {
        const node = MAP_NODES[nodeId];
        return node ? `${node.x},${node.y}` : '';
      }).join(' ');
      setNavigationRouteStr(points);
    } else {
      setNavigationRouteStr('');
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
  const chat = useChat(selectedLang, handleChatTriggerAccessibility);
  const eco = useEcoPoints(250, (msg) => {
    // Append claimed eco rewards ticket to chat history
    chat.sendMessage(`System eco voucher request`); // Dummy call to trigger state
    // We override to append directly
  });
  
  // Custom hook voucher bypass
  const handleClaim = (reward: any) => {
    const success = eco.claimReward(reward);
    if (success) {
      const code = `WC2026-ECO-${Math.floor(1000 + Math.random() * 9000)}`;
      const msg = `🎉 **Voucher Unlocked!**\nYou claimed **${reward.name}**.\nPresent details to concessions:\n` +
        `\`\`\`\nCode: ${code}\n\`\`\`\n` +
        `Eco Champions reduce World Cup carbon footprints! ♻️`;
      // Inject to chat history
      chat.sendMessage(msg);
    }
  };

  const incidents = useIncidents(ARENA_DATA.incidents);

  // Set selected incident overlay mapping
  useEffect(() => {
    const activeInc = incidents.getSelectedIncident();
    if (activeInc && activePersona === 'staff') {
      // Draw route path from FirstAid to active incident loc
      const path = MapService.findPath('FirstAid', activeInc.loc, false);
      if (path) {
        const points = path.map(nodeId => `${MAP_NODES[nodeId].x},${MAP_NODES[nodeId].y}`).join(' ');
        setNavigationRouteStr(points);
      }
    } else if (activePersona === 'staff') {
      setNavigationRouteStr('');
    }
  }, [incidents.selectedIncidentId, activePersona, incidents]);

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

  // Submit operations incidents with Zod validations
  const handleIncidentSubmit = () => {
    setValidationErrors([]);
    const res = incidents.logIncident(newIncType, newIncLoc, newIncDesc);
    
    if (res.success) {
      setNewIncDesc('');
    } else if (res.errors) {
      setValidationErrors(res.errors);
    }
  };

  // Refresh services queue times
  const refreshWaitTimes = () => {
    setIsRefreshingServices(true);
    setTimeout(() => {
      setIsRefreshingServices(false);
      setServicesList(prev => {
        return prev.map(serv => {
          const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2 min
          return {
            ...serv,
            wait: Math.max(0, serv.wait + delta)
          };
        });
      });
    }, 700);
  };

  // Run Multi-Agent simulation sandbox
  const runSimulation = () => {
    setSimStatus('loading');
    setSimImpact('');
    setSimAgentLogs([]);

    const scenario = SimulationService.getScenario(selectedScenario);
    if (!scenario) {
      setSimStatus('');
      return;
    }

    // Delay representing computing scenario analytics
    setTimeout(() => {
      setSimStatus('complete');
      setSimImpact(scenario.impact);

      // Sequentially load agent coordination outputs
      scenario.actions.forEach((act, idx) => {
        setTimeout(() => {
          setSimAgentLogs(prev => [...prev, act]);
        }, idx * 900);
      });
    }, 1500);
  };

  // SVG Stadium Renderer
  const renderSVGMap = (isStaff: boolean) => {
    return (
      <svg viewBox="0 0 500 400" width="100%" height="100%" style={{ background: '#050810', display: 'block' }}>
        <defs>
          <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="1" />
          </pattern>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#map-grid)" />

        {/* Stadium Rings and Pitch */}
        <ellipse cx="250" cy="200" rx="220" ry="170" className="stadium-outline" />
        <ellipse cx="250" cy="200" rx="190" ry="140" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
        <ellipse cx="250" cy="200" rx="160" ry="110" fill="none" stroke="rgba(0,114,255,0.15)" strokeWidth={30} />

        <rect x="185" y="150" width="130" height="100" rx="4" className="pitch-green" />
        <rect x="190" y="155" width="120" height="90" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
        <line x1="250" y1="155" x2="250" y2="245" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
        <circle cx="250" cy="200" r="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />

        {/* Edge Lines */}
        {MAP_EDGES.map((edge, idx) => {
          const fromNode = MAP_NODES[edge.from];
          const toNode = MAP_NODES[edge.to];
          if (!fromNode || !toNode) return null;
          const color = edge.accessible ? "rgba(0, 242, 254, 0.15)" : "rgba(255, 255, 255, 0.04)";
          const dash = edge.accessible ? "2 2" : undefined;
          return (
            <line
              key={idx}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={color}
              strokeWidth={2}
              strokeDasharray={dash}
            />
          );
        })}

        {/* Seating Sections */}
        {Object.keys(MAP_NODES).map(key => {
          const node = MAP_NODES[key];
          if (node.type !== 'seating') return null;
          const colorClass = node.accessible ? "seating-sec accessibility-sec" : "seating-sec";
          return (
            <g key={key} style={{ cursor: 'pointer' }} onClick={() => handleMapNodeClick(key)}>
              <circle cx={node.x} cy={node.y} r={14} className={colorClass} />
              <text x={node.x} y={node.y + 3} textAnchor="middle" className="map-node-label" style={{ fontSize: '7px', fill: 'white' }}>
                {key.split('_')[1]}
              </text>
            </g>
          );
        })}

        {/* Gates */}
        {Object.keys(MAP_NODES).map(key => {
          const node = MAP_NODES[key];
          if (node.type !== 'gate') return null;
          return (
            <g key={key} style={{ cursor: 'pointer' }} onClick={() => handleMapNodeClick(key)}>
              <rect x={node.x - 12} y={node.y - 12} width={24} height={24} rx={4} className="stadium-gate" />
              <text x={node.x} y={node.y + 4} textAnchor="middle" className="map-node-label" style={{ fontSize: '8px', fontWeight: 'bold', fill: 'var(--neon-cyan)' }}>
                {key.charAt(5)}
              </text>
            </g>
          );
        })}

        {/* Service Concessions */}
        {Object.keys(MAP_NODES).map(key => {
          const node = MAP_NODES[key];
          if (node.type !== 'service') return null;
          let symbol = "🔹";
          if (key === "FirstAid") symbol = "🩺";
          if (key === "Concession_1") symbol = "🍔";
          if (key === "Restroom_1") symbol = "🚾";
          return (
            <g key={key} style={{ cursor: 'pointer' }} onClick={() => handleMapNodeClick(key)}>
              <circle cx={node.x} cy={node.y} r={12} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
              <text x={node.x} y={node.y + 4} textAnchor="middle" className="map-node-label" style={{ fontSize: '9px' }}>
                {symbol}
              </text>
            </g>
          );
        })}

        {/* Render Route Paths */}
        {navigationRouteStr && (
          <polyline
            points={navigationRouteStr}
            className={`wayfinding-path ${!isStaff && accessibleOnly ? 'accessible' : ''}`}
          />
        )}

        {/* Staff Overlay Pins */}
        {isStaff && (
          <>
            {showSecurity && STAFF_RESOURCES.filter(r => r.type === 'security').map(res => (
              <g key={res.id} className="resource-pin" transform={`translate(${res.x}, ${res.y})`}>
                <circle cx={0} cy={0} r={7} fill="var(--neon-magenta)" stroke="#050810" strokeWidth={1.5} />
                <title>{res.label}</title>
              </g>
            ))}
            {showMedical && STAFF_RESOURCES.filter(r => r.type === 'medical').map(res => (
              <g key={res.id} className="resource-pin" transform={`translate(${res.x}, ${res.y})`}>
                <circle cx={0} cy={0} r={7} fill="var(--neon-yellow)" stroke="#050810" strokeWidth={1.5} />
                <title>{res.label}</title>
              </g>
            ))}
            {showVolunteers && STAFF_RESOURCES.filter(r => r.type === 'volunteer').map(res => (
              <g key={res.id} className="resource-pin" transform={`translate(${res.x}, ${res.y})`}>
                <circle cx={0} cy={0} r={7} fill="var(--neon-green)" stroke="#050810" strokeWidth={1.5} />
                <title>{res.label}</title>
              </g>
            ))}
            
            {/* Pulsing incident warning signs */}
            {showAlerts && incidents.incidents.filter(inc => inc.status !== 'resolved').map(inc => {
              const node = MAP_NODES[inc.loc];
              if (!node) return null;
              const markerColor = inc.status === 'pending' ? 'var(--neon-magenta)' : 'var(--neon-orange)';
              return (
                <g key={inc.id} style={{ cursor: 'pointer' }} onClick={() => incidents.setSelectedIncidentId(inc.id)}>
                  <polygon
                    points={`${node.x},${node.y - 12} ${node.x - 10},${node.y + 6} ${node.x + 10},${node.y + 6}`}
                    fill={markerColor}
                    stroke="#050810"
                    strokeWidth={1.5}
                    filter="url(#glow-red)"
                  />
                  <text x={node.x} y={node.y + 3} textAnchor="middle" fontFamily="Outfit" fontSize="9px" fontWeight="900" fill="white">!</text>
                  <circle cx={node.x} cy={node.y + 2} r={15} fill="none" stroke={markerColor} strokeWidth={1.5} style={{ animation: 'pulse 1.8s infinite' }} />
                </g>
              );
            })}
          </>
        )}
      </svg>
    );
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setSelectedLang(lang);
    chat.changeLanguage(lang);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Panel */}
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
            <span className="live-text">{selectedLang === 'es' ? 'EN VIVO PARTIDO 14' : selectedLang === 'fr' ? 'EN DIRECT MATCH 14' : 'LIVE MATCH 14'}</span>
          </div>
          <div className="match-vs">
            <span className="team">MEXICO</span>
            <span className="score">2</span>
            <span className="vs">-</span>
            <span class="score">1</span>
            <span className="team">USA</span>
          </div>
          <div className="match-meta">Estadio Azteca • 76'</div>
        </div>

        {/* Header Controls */}
        <div className="header-actions">
          <div className="persona-switcher">
            <button
              onClick={() => setActivePersona('fan')}
              className={`btn-persona ${activePersona === 'fan' ? 'active' : ''}`}
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

      {/* Main Body */}
      <main className="app-container">
        
        {/* FAN VIEW */}
        <div className={`persona-view ${activePersona === 'fan' ? 'active' : ''}`}>
          <div className="view-grid grid-3-cols">
            
            {/* Col 1: AI Chat Assistant */}
            <section className="card glass-panel chat-container">
              <div className="card-header">
                <div className="title-with-subtitle">
                  <h2>GenAI Assistant</h2>
                  <p>Your multilingual event guide</p>
                </div>
                <span className="badge badge-success-glow">Active AI</span>
              </div>

              {/* Message History list */}
              <div className="chat-messages">
                {chat.messages.map((msg, idx) => (
                  <div key={idx} className={`chat-msg ${msg.sender}`}>
                    {/* DOMPurify used here to sanitize generated HTML inputs before rendering */}
                    <div className="msg-content" dangerouslySetInnerHTML={formatMarkdown(msg.text)} />
                    <span className="msg-time">{msg.timestamp}</span>
                    {msg.sender === 'bot' && !msg.isStreaming && (
                      <button
                        onClick={() => chat.playVoiceOutput(msg.text)}
                        className="msg-audio-btn"
                        title="Simulate Audio playback"
                        style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2}>
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                {/* Typing Loader Indicator */}
                {chat.isTyping && (
                  <div className="chat-msg bot chat-loading">
                    <span></span><span></span><span></span>
                  </div>
                )}
              </div>

              {/* Chips suggestions */}
              <div className="prompt-chips">
                <button className="chip" onClick={() => chat.sendMessage("Find accessible routes to my seat in Sec 105.")}>♿ Sec 105 Accessibility</button>
                <button className="chip" onClick={() => chat.sendMessage("What's the eco-friendly transport option after the match?")}>🌱 Eco Transport</button>
                <button className="chip" onClick={() => chat.sendMessage("How long is the line at Gate B concessions?")}>🌭 Concession B Line</button>
                <button className="chip" onClick={() => chat.sendMessage("Translate 'Where is the medical station' to Spanish.")}>🗣️ Translate</button>
              </div>

              {/* Text Input Panel */}
              <div className="chat-input-bar">
                <input
                  type="text"
                  placeholder="Ask ArenaMind..."
                  id="chat-field"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const inputEl = e.currentTarget;
                      chat.sendMessage(inputEl.value);
                      inputEl.value = '';
                    }
                  }}
                  autoComplete="off"
                />
                <button
                  onClick={() => {
                    const inputEl = document.getElementById('chat-field') as HTMLInputElement;
                    chat.simulateVoiceInput((val) => {
                      if (inputEl) {
                        inputEl.value = val;
                        chat.sendMessage(val);
                        inputEl.value = '';
                      }
                    });
                  }}
                  className="btn-icon"
                  title="Simulate Speech input"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const inputEl = document.getElementById('chat-field') as HTMLInputElement;
                    if (inputEl && inputEl.value.trim()) {
                      chat.sendMessage(inputEl.value);
                      inputEl.value = '';
                    }
                  }}
                  className="btn-primary-glow"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </section>

            {/* Col 2: Seat Map Navigation */}
            <section className="card glass-panel navigation-container">
              <div className="card-header">
                <div className="title-with-subtitle">
                  <h2>Navigation & Seat Wayfinding</h2>
                  <p>Real-time pathfinding and crowd density</p>
                </div>
                <div className="map-modes">
                  <label className="toggle-switch">
                    <input
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
                  <label>Start</label>
                  <select value={startNode} onChange={(e) => setStartNode(e.target.value)}>
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
                >
                  ⇆
                </button>
                <div className="select-wrapper">
                  <label>Destination</label>
                  <select value={endNode} onChange={(e) => setEndNode(e.target.value)}>
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

              <div className="map-view-box">
                {renderSVGMap(false)}
                <div className="map-legend">
                  <span className="legend-item"><span className="dot dot-green"></span> Low Wait</span>
                  <span class="legend-item"><span className="dot dot-orange"></span> Med Wait</span>
                  <span className="legend-item"><span class="dot dot-red"></span> High Wait</span>
                  <span className="legend-item"><span className="dot dot-wheelchair"></span> Elevators/Ramps</span>
                </div>
              </div>
            </section>

            {/* Col 3: Side cards */}
            <section className="card-column">
              {/* Eco goals tracker */}
              <div className="card glass-panel sustainability-card">
                <div className="card-header">
                  <div className="title-with-subtitle">
                    <h2>Green Goals Tracker</h2>
                    <p>Track your carbon footprint reductions</p>
                  </div>
                  <div className="points-badge">
                    <span>{eco.points}</span> <span className="lbl">PTS</span>
                  </div>
                </div>

                <div className="sustainability-body">
                  <div className="eco-progress-bar">
                    <div className="eco-progress-fill" style={{ width: `${Math.min(100, Math.floor((eco.points / 500) * 100))}%` }}></div>
                    <span className="progress-lbl">{eco.getLevelLabel()}</span>
                  </div>

                  <ul className="eco-checklist">
                    {ARENA_DATA.ecoActions.map(act => (
                      <li key={act.id}>
                        <label className="custom-checkbox">
                          <input
                            type="checkbox"
                            checked={!!eco.checkedActions[act.id]}
                            disabled={act.id === 'chk-transit'} // Default transit disabled
                            onChange={() => eco.toggleAction(act)}
                          />
                          <span className="checkmark"></span>
                          <span className="checkbox-label">
                            {act.label} <span className="points-val">+{act.points} XP</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>

                  <div className="rewards-section">
                    <h4>Claim Rewards</h4>
                    <div className="rewards-grid">
                      {ARENA_DATA.ecoRewards.map(reward => (
                        <button
                          key={reward.id}
                          onClick={() => handleClaim(reward)}
                          disabled={eco.points < reward.cost}
                          className="btn-reward"
                        >
                          <span>{reward.name}</span>
                          <span className="cost">{reward.cost} PTS</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Wait queues */}
              <div className="card glass-panel wait-times-card">
                <div className="card-header">
                  <div className="title-with-subtitle">
                    <h2>Live Services Density</h2>
                    <p>Estimated queues & wait times</p>
                  </div>
                  <button onClick={refreshWaitTimes} className="btn-icon" title="Refresh Live Data">
                    <svg className={isRefreshingServices ? 'animate-spin' : ''} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                    </svg>
                  </button>
                </div>

                <div className="services-list">
                  {servicesList.map(serv => {
                    const statusClass = serv.wait > 15 ? "text-red" : serv.wait > 8 ? "text-orange" : "text-green";
                    return (
                      <div key={serv.id} className="service-item">
                        <div className="service-name">{serv.name}</div>
                        <div className={`service-status ${statusClass}`}>{serv.wait} min wait</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* STAFF VIEW */}
        <div className={`persona-view ${activePersona === 'staff' ? 'active' : ''}`}>
          <div class="view-grid grid-3-cols">
            
            {/* Col 1: Operations Feed & Logger */}
            <section className="card glass-panel incidents-container">
              <div className="card-header">
                <div className="title-with-subtitle">
                  <h2>Operations Incident Feed</h2>
                  <p>Real-time volunteer and staff alerts</p>
                </div>
                <span className="counter-badge">
                  {incidents.incidents.filter(i => i.status !== 'resolved').length}
                </span>
              </div>

              {/* Log incident form */}
              <div className="new-incident-form">
                <h3>Log Field Report</h3>
                
                {/* Zod schema payload parsing validation messages overlay */}
                {validationErrors.length > 0 && (
                  <div style={{ background: 'rgba(255, 42, 95, 0.15)', border: '1px solid var(--neon-magenta)', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                    {validationErrors.map((err, idx) => (
                      <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--neon-magenta)', fontWeight: '600' }}>⚠️ {err}</div>
                    ))}
                  </div>
                )}

                <div className="form-row">
                  <select
                    value={newIncType}
                    onChange={(e) => setNewIncType(e.target.value as any)}
                  >
                    <option value="Medical">Medical Assistance</option>
                    <option value="Crowd">Crowd Congestion</option>
                    <option value="Maintenance">Maintenance / Spill</option>
                    <option value="Security">Security Issue</option>
                    <option value="Hardware">Hardware / Card Reader</option>
                  </select>
                  <select
                    value={newIncLoc}
                    onChange={(e) => setNewIncLoc(e.target.value)}
                  >
                    <option value="Gate_A">Gate A Corridor</option>
                    <option value="Gate_B">Gate B Corridor</option>
                    <option value="Gate_C">Gate C Corridor</option>
                    <option value="Gate_D">Gate D Corridor</option>
                    <option value="Sec_103">Section 103</option>
                    <option value="Sec_105">Section 105</option>
                    <option value="Restroom_1">Restrooms A</option>
                    <option value="FirstAid">First Aid Center</option>
                  </select>
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Details (e.g. Spill block near food court)..."
                    value={newIncDesc}
                    onChange={(e) => setNewIncDesc(e.target.value)}
                  />
                  <button onClick={handleIncidentSubmit} className="btn-action-primary">Report</button>
                </div>
              </div>

              {/* Feed items list */}
              <div className="incident-list">
                {incidents.incidents.filter(inc => inc.status !== 'resolved').map(inc => (
                  <div
                    key={inc.id}
                    onClick={() => incidents.setSelectedIncidentId(inc.id)}
                    className={`incident-item ${incidents.selectedIncidentId === inc.id ? 'selected' : ''}`}
                  >
                    <div className="incident-meta">
                      <span className="inc-type">
                        {inc.type === 'Medical' ? '🩺' : inc.type === 'Security' ? '🛡' : '⚠️'} {inc.type} Report
                      </span>
                      <span className="inc-time">{inc.time}</span>
                    </div>
                    <div className="inc-desc">{inc.desc}</div>
                    <div className="inc-status-row">
                      <span className="inc-loc">📍 Location: {inc.loc.replace('_', ' ')}</span>
                      <span className={`inc-status-lbl ${inc.status}`}>{inc.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dispatch Advice Card */}
              <div className="ai-dispatch-box">
                <div className="dispatch-header">
                  <span className="ai-badge">GenAI Copilot</span>
                  <h4>Smart Dispatch Recommendation</h4>
                </div>
                <div className="dispatch-body">
                  {incidents.selectedIncidentId ? (
                    (() => {
                      const activeInc = incidents.getSelectedIncident();
                      if (!activeInc) return null;
                      return (
                        <>
                          {/* DOMPurify sanitization applied to GenAI recommendations */}
                          <div dangerouslySetInnerHTML={formatMarkdown(activeInc.recommendation)} />
                          
                          <div className="dispatch-actions">
                            {activeInc.status === 'pending' && (
                              <button
                                onClick={() => incidents.dispatchIncident(activeInc.id)}
                                className="btn-action-primary"
                              >
                                Approve & Dispatch Personnel
                              </button>
                            )}
                            <button
                              onClick={() => incidents.resolveIncident(activeInc.id)}
                              className="btn-action"
                              style={{ background: 'rgba(255, 42, 95, 0.05)', border: '1px solid var(--neon-magenta)', color: 'var(--neon-magenta)' }}
                            >
                              Resolve Alert
                            </button>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <p className="placeholder-text">Select an active incident from the feed above to generate GenAI dispatch recommendations.</p>
                  )}
                </div>
              </div>
            </section>

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
                  <label className="filter-chk">
                    <input type="checkbox" checked={showSecurity} onChange={(e) => setShowSecurity(e.target.checked)} /> 🛡️ Security
                  </label>
                  <label className="filter-chk">
                    <input type="checkbox" checked={showMedical} onChange={(e) => setShowMedical(e.target.checked)} /> 🩺 Medical
                  </label>
                  <label className="filter-chk">
                    <input type="checkbox" checked={showVolunteers} onChange={(e) => setShowVolunteers(e.target.checked)} /> 🙋 Volunteers
                  </label>
                  <label className="filter-chk">
                    <input type="checkbox" checked={showAlerts} onChange={(e) => setShowAlerts(e.target.checked)} /> ⚠️ Alerts
                  </label>
                </div>
              </div>

              <div className="map-view-box">
                {renderSVGMap(true)}
                <div className="map-legend">
                  <span className="legend-item"><span className="dot dot-security"></span> Security</span>
                  <span className="legend-item"><span className="dot dot-medical"></span> Medical</span>
                  <span className="legend-item"><span className="dot dot-volunteer"></span> Volunteer</span>
                  <span className="legend-item"><span className="dot dot-incident-alert"></span> Incident</span>
                </div>
              </div>
            </section>

            {/* Col 3: Simulation Sandbox */}
            <section className="card glass-panel simulation-container">
              <div className="card-header">
                <div className="title-with-subtitle">
                  <h2>Multi-Agent Simulation Sandbox</h2>
                  <p>Predict response plans for operations scenarios</p>
                </div>
                <span className="badge badge-warning-glow">Sandbox</span>
              </div>

              <div className="simulation-selector">
                <label>Choose Scenario</label>
                <div className="select-btn-row">
                  <select value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value)}>
                    <option value="thunderstorm">⚠️ Severe Thunderstorm Warning</option>
                    <option value="subway_delay">🚇 Metro Subway Power Failure</option>
                    <option value="gate_card_reader">🎟️ Gate B Ticket Scanner Outage</option>
                    <option value="crowd_rush">📣 Post-match Crowd Congestion</option>
                  </select>
                  <button onClick={runSimulation} className="btn-action-warning">Run GenAI Simulation</button>
                </div>
              </div>

              <div className="simulation-output-area">
                {simStatus === 'loading' && (
                  <div className="sim-status-box">
                    <div className="spinner animate-spin"></div>
                    <div className="status-msg">GenAI agents evaluating scenario impacts...</div>
                  </div>
                )}

                {simStatus === 'complete' && (
                  <div className="sim-results">
                    {/* DOMPurify sanitization applied to simulated outputs */}
                    <div className="sim-summary">
                      <h4>GenAI Risk Assessment</h4>
                      <p dangerouslySetInnerHTML={sanitize(simImpact)} />
                    </div>

                    <div className="agent-responses-container" style={{ marginTop: '1rem' }}>
                      <h4>Agent Coordination Logs</h4>
                      <div className="agent-log-feed">
                        {simAgentLogs.map((log, idx) => (
                          <div key={idx} className={`agent-log-item ${log.role}`}>
                            <div className={`agent-log-header ${log.role}`}>
                              <span className="agent-name">🤖 {log.agent}</span>
                              <span className="agent-time">Active</span>
                            </div>
                            <div className="agent-action-taken">{log.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>

      </main>

      {/* Footer widget */}
      <footer className="app-footer">
        <div className="footer-left">
          <span>FIFA World Cup 2026™ Venue Operations Dashboard</span>
        </div>
        <div className="footer-right">
          <span className="status-dot green"></span> Connected to Stadium Edge Server Network
        </div>
      </footer>

    </div>
  );
}
