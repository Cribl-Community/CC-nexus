import { Navigate, Route, Routes } from 'react-router-dom'
import WorkerGroupsPage from './pages/WorkerGroupsPage'
import IntegrationsListPage from './pages/IntegrationsListPage'
import IntegrationDetailPage from './pages/IntegrationDetailPage'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WorkerGroupsPage />} />
      <Route path="/group/:groupId/integrations" element={<IntegrationsListPage />} />
      <Route
        path="/group/:groupId/integration/:role/:integrationId"
        element={<IntegrationDetailPage />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
