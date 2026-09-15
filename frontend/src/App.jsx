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
import TeacherStudentChat from './components/TeacherStudentChat.jsx';
import { EDUCATOR_PROFILE, CONFIG } from './config.js';
import { getCurrentStudent, langLabel } from './utils/student.js';
import { LocalStore } from './data/mockData.js';
import { t } from './utils/i18n.js';
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
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState(CONFIG.API_BASE_URL);
  const [student, setStudent] = useState(() => getCurrentStudent());
  const [activeLang, setActiveLang] = useState(() => student?.language || 'mr');

  // Determine current active role strictly based on current path
  const isStudentRoute = location.pathname.startsWith('/student');
  const isParentRoute = location.pathname.startsWith('/parent');
  const activeRole = isStudentRoute ? 'student' : isParentRoute ? 'parent' : 'educator';

  useEffect(() => {
    api.checkHealth().then((online) => {
      setIsBackendOnline(online);
    });
  }, [currentApiUrl]);

  useEffect(() => {
    if (isStudentRoute) {
      const cur = getCurrentStudent();
      setStudent(cur);
      if (cur?.language) setActiveLang(cur.language);
    }
  }, [isStudentRoute]);

  function handleLangChange(newLang) {
    setActiveLang(newLang);
    if (student?._id) {
      const updated = LocalStore.updateStudentLanguage(student._id, newLang);
      if (updated) {
        setStudent({ ...updated });
      }
    }
  }

  const isFullWidth = location.pathname === '/' || location.pathname.startsWith('/login');

  return (
    <div className="app">
      {/* Header (shown on app subpages) */}
      {!isFullWidth && (
        <header className="app-header">
          <div className="educator-identity">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 800, fontSize: '1.1rem', marginRight: '16px' }}>
              ✨ Visions India
            </Link>
            {activeRole === 'educator' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="educator-avatar">{initialsOf(EDUCATOR_PROFILE.name)}</div>
                <div className="educator-details">
                  <span className="educator-name">{EDUCATOR_PROFILE.name}</span>
                  <span className="educator-role">
                    Logged in as {EDUCATOR_PROFILE.role} • Cluster {EDUCATOR_PROFILE.cluster}
                  </span>
                </div>
              </div>
            )}
            {activeRole === 'student' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="educator-avatar student-avatar">{initialsOf(student?.name)}</div>
                <div className="educator-details">
                  <span className="educator-name">{student?.name || 'Aarav Patil'}</span>
                  <span className="educator-role">
                    Logged in as Student{student ? ` • Grade ${student.grade} • ${langLabel(student.language)}` : ''}
                  </span>
                </div>
              </div>
            )}
            {activeRole === 'parent' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="educator-avatar" style={{ background: '#7c3aed' }}>SP</div>
                <div className="educator-details">
                  <span className="educator-name">Sita Patil</span>
                  <span className="educator-role">
                    Logged in as Parent • Parent of Aarav Patil
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="header-right-group">
            {/* Demo Local Language Selector */}
            <div className="header-lang-wrapper" title="Switch Demo Local Language">
              <span className="header-lang-icon">🌐</span>
              <select
                className="header-lang-select"
                value={activeLang}
                onChange={(e) => handleLangChange(e.target.value)}
                aria-label="Select Local Language"
              >
                <option value="mr">Marathi (मराठी)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="en">English (English)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="kn">Kannada (கன்னட)</option>
              </select>
            </div>

            {/* Strict Role Indicator & Sign Out */}
            <div className="role-locked-container">
              <span className={`role-locked-pill role-${activeRole}`}>
                {activeRole === 'educator' ? '🧑‍🏫 Educator' : activeRole === 'student' ? '🎒 Student' : '👨‍👩‍👧 Parent'}
              </span>
              <button
                className="header-logout-btn"
                onClick={() => navigate('/login')}
                title="Sign out of current role"
              >
                {t('sign_out', activeLang)}
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

      {/* Navigation (shown on subpages) - strictly isolated per role */}
      {!isFullWidth && (
        <nav className="app-nav">
          {activeRole === 'educator' && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{t('dashboard', activeLang)}</NavLink>
              <NavLink to="/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{t('students', activeLang)}</NavLink>
              <NavLink to="/assessments/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{t('add_assessment', activeLang)}</NavLink>
              <NavLink to="/content" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{t('content', activeLang)}</NavLink>
            </>
          )}
          {activeRole === 'student' && (
            <>
              <NavLink to="/student" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{t('student_dashboard', activeLang)}</NavLink>
              <NavLink to="/student/learn" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{t('learning_modules', activeLang)}</NavLink>
              <NavLink to="/student/resources" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{t('resources', activeLang)}</NavLink>
            </>
          )}
          {activeRole === 'parent' && (
            <>
              <NavLink to="/parent" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Child Progress</NavLink>
              <NavLink to="/student" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Student View</NavLink>
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
          <Route path="/student/resources" element={<StudentLearn />} />

          {/* Parent View Routes */}
          <Route path="/parent" element={<ParentHome />} />
          <Route path="/parent/:studentId" element={<ParentChild />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Teacher - Student Floating Chat Widget */}
      {!isFullWidth && <TeacherStudentChat activeRole={activeRole} studentOverride={student} />}

      {/* API Config Modal */}
      <ApiConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onUrlUpdated={(newUrl) => setCurrentApiUrl(newUrl)}
      />
    </div>
  );
}
