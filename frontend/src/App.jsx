import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import StudentList from './pages/StudentList.jsx';
import StudentDetail from './pages/StudentDetail.jsx';
import NewAssessmentForm from './pages/NewAssessmentForm.jsx';
import ContentScreen from './pages/ContentScreen.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentLearn from './pages/StudentLearn.jsx';
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

  const isEducator = profile === 'educator';

  return (
    <div className="app">
      {/* Header: identity follows the active profile */}
      <header className="app-header">
        <div className="educator-identity">
          {isEducator ? (
            <>
              <div className="educator-avatar">{initialsOf(EDUCATOR_PROFILE.name)}</div>
              <div className="educator-details">
                <span className="educator-name">{EDUCATOR_PROFILE.name}</span>
                <span className="educator-role">
                  Logged in as {EDUCATOR_PROFILE.role} • Cluster {EDUCATOR_PROFILE.cluster}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="educator-avatar student-avatar">{initialsOf(student?.name)}</div>
              <div className="educator-details">
                <span className="educator-name">{student?.name || 'Student'}</span>
                <span className="educator-role">
                  Logged in as Student{student ? ` • Grade ${student.grade} • ${langLabel(student.language)}` : ''}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="header-right-group">
          {/* Profile switcher: educator and student stay SEPARATE profiles */}
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

          {/* Backend status pill (unchanged) */}
          <button
            className="header-status-badge-btn"
            onClick={() => setIsConfigModalOpen(true)}
            title="Click to configure Person B's ngrok URL"
          >
            <span className={`status-indicator-dot ${isBackendOnline ? 'online' : 'offline'}`}></span>
            <span>{isBackendOnline ? 'Live Backend' : 'Demo Mode'}</span>
          </button>
        </div>
      </header>

      {/* Per-profile navigation */}
      <nav className="app-nav">
        {isEducator ? (
          <>
            <NavLink to="/dashboard" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
            <NavLink to="/content" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Content</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/student" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
            <NavLink to="/student/learn" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Learn</NavLink>
          </>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="app-main">
        {isEducator ? (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/content" element={<ContentScreen />} />
            {/* Preserved routes (not in main nav) so existing flows keep working */}
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/:id" element={<StudentDetail />} />
            <Route path="/assessments/new" element={<NewAssessmentForm />} />
            {/* Student routes are not part of the educator profile */}
            <Route path="/student*" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/student" replace />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/learn" element={<StudentLearn />} />
            {/* Educator routes are not part of the student profile */}
            <Route path="*" element={<Navigate to="/student" replace />} />
          </Routes>
        )}
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
