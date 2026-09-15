import { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useLocation, useNavigate, Navigate } from 'react-router-dom';

// Pages
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ContentScreen from './pages/ContentScreen.jsx';
import StudentList from './pages/StudentList.jsx';
import StudentDetail from './pages/StudentDetail.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentLearn from './pages/StudentLearn.jsx';
import NewAssessmentForm from './pages/NewAssessmentForm.jsx';
import ParentHome from './pages/ParentHome.jsx';
import ParentChild from './pages/ParentChild.jsx';

// Components & Config
import ApiConfigModal from './components/ApiConfigModal.jsx';
import { EDUCATOR_PROFILE, CONFIG } from './config.js';
import { getCurrentStudent, langLabel } from './utils/student.js';
import api from './api/api.js';

function initialsOf(name) {
  return String(name || '')
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState('educator'); // 'educator' | 'student'
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState(CONFIG.API_BASE_URL);
  const [student, setStudent] = useState(() => getCurrentStudent());

  useEffect(() => {
    api.checkHealth().then((online) => {
      setIsBackendOnline(online);
    });
  }, [currentApiUrl]);

  function switchProfile(next) {
    if (next === profile) return;
    setProfile(next);
    if (next === 'student') {
      setStudent(getCurrentStudent());
      navigate('/student');
    } else {
      navigate('/dashboard');
    }
  }

  const isFullWidth = location.pathname === '/' || location.pathname.startsWith('/login');
  const isEducator = profile === 'educator';

  return (
    <div className="app">
      {/* Header (shown on app subpages) */}
      {!isFullWidth && (
        <header className="app-header">
          <div className="educator-identity">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 800, fontSize: '1.1rem', marginRight: '16px' }}>
              ✨ Visions India
            </Link>
            {isEducator ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="educator-avatar">{initialsOf(EDUCATOR_PROFILE.name)}</div>
                <div className="educator-details">
                  <span className="educator-name">{EDUCATOR_PROFILE.name}</span>
                  <span className="educator-role">
                    Logged in as {EDUCATOR_PROFILE.role} • Cluster {EDUCATOR_PROFILE.cluster}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="educator-avatar student-avatar">{initialsOf(student?.name)}</div>
                <div className="educator-details">
                  <span className="educator-name">{student?.name || 'Student'}</span>
                  <span className="educator-role">
                    Logged in as Student{student ? ` • Grade ${student.grade} • ${langLabel(student.language)}` : ''}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="header-right-group">
            {/* Profile switcher */}
            <div className="profile-switcher" role="group" aria-label="Switch profile">
              <button
                className={`profile-switch-btn ${isEducator ? 'is-active' : ''}`}
                onClick={() => switchProfile('educator')}
                title="Switch to educator profile"
              >
                🧑‍🏫 Educator
              </button>
              <button
                className={`profile-switch-btn ${!isEducator ? 'is-active' : ''}`}
                onClick={() => switchProfile('student')}
                title="Switch to student profile"
              >
                🎒 Student
              </button>
            </div>

            {/* Backend status pill */}
            <button
              className="header-status-badge-btn"
              onClick={() => setIsConfigModalOpen(true)}
              title="Click to configure backend URL"
            >
              <span className={`status-indicator-dot ${isBackendOnline ? 'online' : 'offline'}`}></span>
              <span>{isBackendOnline ? 'Live Backend' : 'Demo Mode'}</span>
            </button>
          </div>
        </header>
      )}

      {/* Navigation (shown on subpages) */}
      {!isFullWidth && (
        <nav className="app-nav">
          {isEducator ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
              <NavLink to="/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Students</NavLink>
              <NavLink to="/assessments/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>+ Assessment</NavLink>
              <NavLink to="/content" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Content</NavLink>
              <NavLink to="/parent" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Parent Portal</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/student" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Student Dashboard</NavLink>
              <NavLink to="/student/learn" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Learning Modules</NavLink>
              <NavLink to="/content" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Resources</NavLink>
            </>
          )}
        </nav>
      )}

      {/* Main Content Area */}
      <main className={isFullWidth ? '' : 'app-main'}>
        <Routes>
          {/* Public & Authentication */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/:role" element={<Login />} />

          {/* Educator & Leadership Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leadership" element={<Dashboard />} />
          <Route path="/educator" element={<Dashboard />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/assessments/new" element={<NewAssessmentForm />} />
          <Route path="/content" element={<ContentScreen />} />
          <Route path="/content/:id" element={<ContentScreen />} />

          {/* Student View Routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/learn" element={<StudentLearn />} />

          {/* Parent View Routes */}
          <Route path="/parent" element={<ParentHome />} />
          <Route path="/parent/:studentId" element={<ParentChild />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
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
