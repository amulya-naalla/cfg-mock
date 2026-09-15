import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import LessonView from './pages/LessonView.jsx';
import LeadershipDashboard from './pages/LeadershipDashboard.jsx';
import ParentHome from './pages/ParentHome.jsx';
import ParentChild from './pages/ParentChild.jsx';
import EducatorApp from './pages/EducatorApp.jsx';

// To be implemented (Phase E, deferred).
function StudentPlaceholder() {
  return (
    <div>
      <div className="topbar">
        <Link to="/" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Home
        </Link>
      </div>
      <p>Student view — to be implemented.</p>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isFullWidth = location.pathname === '/' || location.pathname.startsWith('/login');

  return (
    <main className={isFullWidth ? '' : 'app-main'}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/educator/*" element={<EducatorApp />} />
        <Route path="/student" element={<StudentPlaceholder />} />
        <Route path="/leadership" element={<LeadershipDashboard />} />
        <Route path="/content/:id" element={<LessonView />} />
        <Route path="/parent" element={<ParentHome />} />
        <Route path="/parent/:studentId" element={<ParentChild />} />
      </Routes>
    </main>
  );
}
