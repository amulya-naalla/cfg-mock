import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import LessonView from './pages/LessonView.jsx';
import LeadershipDashboard from './pages/LeadershipDashboard.jsx';
import ParentHome from './pages/ParentHome.jsx';
import ParentChild from './pages/ParentChild.jsx';
import EducatorApp from './pages/EducatorApp.jsx';
import StudentPortal from './pages/StudentPortal.jsx';
import StudentView from './pages/StudentView.jsx';

// Catch-all so a wrong internal link degrades to something visible instead of a
// silent blank page (which is exactly how the missing /educator prefixes hid).
function NotFound() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">🧭</div>
      <div className="empty-state-title">Page not found</div>
      <p className="empty-state-desc">That link doesn&rsquo;t point anywhere in the app.</p>
      <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: 14 }}>
        Back to home
      </Link>
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
        <Route path="/student" element={<StudentPortal />} />
        <Route path="/student/:id" element={<StudentView />} />
        <Route path="/leadership" element={<LeadershipDashboard />} />
        <Route path="/content/:id" element={<LessonView />} />
        <Route path="/parent" element={<ParentHome />} />
        <Route path="/parent/:studentId" element={<ParentChild />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}
