import React, { useState } from 'react';
import { ServiceItem } from '../data/arenaData';

interface LiveServicesListProps {
  servicesList: ServiceItem[];
  setServicesList: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
}

export const LiveServicesList: React.FC<LiveServicesListProps> = ({ servicesList, setServicesList }) => {
  const [isRefreshingServices, setIsRefreshingServices] = useState(false);

  // Refresh services queue times (isolated state in component)
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

  return (
    <div className="card glass-panel wait-times-card" aria-label="Live Services Density">
      <div className="card-header">
        <div className="title-with-subtitle">
          <h2>Live Services Density</h2>
          <p>Estimated queues & wait times</p>
        </div>
        <button 
          onClick={refreshWaitTimes} 
          className="btn-icon" 
          title="Refresh Live Data"
          aria-label="Refresh live queue and wait times data"
        >
          <svg className={isRefreshingServices ? 'animate-spin' : ''} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
          </svg>
        </button>
      </div>

      <div className="services-list" aria-live="polite">
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
  );
};
