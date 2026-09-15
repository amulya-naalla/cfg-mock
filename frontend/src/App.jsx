import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import StudentList from './pages/StudentList.jsx';
import StudentDetail from './pages/StudentDetail.jsx';
import NewAssessmentForm from './pages/NewAssessmentForm.jsx';
import ContentScreen from './pages/ContentScreen.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ApiConfigModal from './components/ApiConfigModal.jsx';
import { EDUCATOR_PROFILE, CONFIG } from './config.js';
import api from './api/api.js';

export default function App() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState(CONFIG.API_BASE_URL);

  useEffect(() => {
    api.checkHealth().then((online) => {
      setIsBackendOnline(online);
    });
  }, [currentApiUrl]);

  return (
    <div className="app">
      {/* Educator Header Banner per spec */}
      <header className="app-header">
        <div className="educator-identity">
          <div className="educator-avatar">SS</div>
          <div className="educator-details">
            <span className="educator-name">{EDUCATOR_PROFILE.name}</span>
            <span className="educator-role">
              Logged in as {EDUCATOR_PROFILE.role} • Cluster {EDUCATOR_PROFILE.cluster}
            </span>
          </div>
        </div>

        {/* Clickable Backend Status Pill to configure ngrok URL live */}
        <button
          className="header-status-badge-btn"
          onClick={() => setIsConfigModalOpen(true)}
          title="Click to configure Person B's ngrok URL"
        >
          <span className={`status-indicator-dot ${isBackendOnline ? 'online' : 'offline'}`}></span>
          <span>{isBackendOnline ? 'Live Backend' : 'Demo Mode'}</span>
        </button>
      </header>

      {/* Shared Navigation (preserved for Person A, B, C, D) */}
      <nav className="app-nav">
        <Link to="/" className="nav-link">Students</Link>
        <Link to="/assessments/new" className="nav-link">+ New Assessment</Link>
        <Link to="/content" className="nav-link">Content</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
      </nav>

      {/* Main Content Area */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<StudentList />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/assessments/new" element={<NewAssessmentForm />} />
          <Route path="/content" element={<ContentScreen />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>

      {/* API Config Modal */}
      <ApiConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onUrlUpdated={(newUrl) => setCurrentApiUrl(newUrl)}
      />
    </div>
  );
}
