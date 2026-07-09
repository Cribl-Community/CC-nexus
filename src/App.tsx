import { Navigate, Route, Routes } from 'react-router-dom'
import WorkerGroupsPage from './pages/WorkerGroupsPage'
import IntegrationsListPage from './pages/IntegrationsListPage'
import IntegrationDetailPage from './pages/IntegrationDetailPage'
import './App.css'

function NexusIcon() {
  return (
    <svg
      className="nexus-topbar-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="tb-cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#aa3bff" />
          <stop offset="100%" stopColor="#7e14ff" />
        </radialGradient>
        <radialGradient id="tb-ng" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#47bfff" />
          <stop offset="100%" stopColor="#863bff" />
        </radialGradient>
        <filter id="tb-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <line x1="24" y1="24" x2="24" y2="5"  stroke="#863bff" strokeWidth="1.4" strokeOpacity="0.55" />
      <line x1="24" y1="24" x2="40" y2="14" stroke="#863bff" strokeWidth="1.4" strokeOpacity="0.55" />
      <line x1="24" y1="24" x2="40" y2="34" stroke="#863bff" strokeWidth="1.4" strokeOpacity="0.55" />
      <line x1="24" y1="24" x2="24" y2="43" stroke="#863bff" strokeWidth="1.4" strokeOpacity="0.55" />
      <line x1="24" y1="24" x2="8"  y2="34" stroke="#863bff" strokeWidth="1.4" strokeOpacity="0.55" />
      <line x1="24" y1="24" x2="8"  y2="14" stroke="#863bff" strokeWidth="1.4" strokeOpacity="0.55" />
      <circle cx="24" cy="5"  r="3"   fill="url(#tb-ng)" filter="url(#tb-glow)" />
      <circle cx="40" cy="14" r="3"   fill="url(#tb-ng)" filter="url(#tb-glow)" />
      <circle cx="40" cy="34" r="3"   fill="url(#tb-ng)" filter="url(#tb-glow)" />
      <circle cx="24" cy="43" r="3"   fill="url(#tb-ng)" filter="url(#tb-glow)" />
      <circle cx="8"  cy="34" r="3"   fill="url(#tb-ng)" filter="url(#tb-glow)" />
      <circle cx="8"  cy="14" r="3"   fill="url(#tb-ng)" filter="url(#tb-glow)" />
      <circle cx="24" cy="24" r="7"   fill="url(#tb-cg)" filter="url(#tb-glow)" />
      <circle cx="24" cy="24" r="3.2" fill="#ede6ff" fillOpacity="0.88" />
    </svg>
  )
}

export default function App() {
  return (
    <div className="nexus-app">
      <header className="nexus-topbar">
        <NexusIcon />
        <span className="nexus-brand">Cribl Nexus</span>
        <span className="nexus-topbar-divider" aria-hidden="true" />
        <span className="nexus-topbar-subtitle">Integration Hub</span>
      </header>

      <main className="nexus-main">
        <Routes>
          <Route path="/" element={<WorkerGroupsPage />} />
          <Route path="/group/:groupId/integrations" element={<IntegrationsListPage />} />
          <Route
            path="/group/:groupId/integration/:role/:integrationId"
            element={<IntegrationDetailPage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
