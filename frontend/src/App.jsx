import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import LessonView from './pages/LessonView.jsx';
import LeadershipDashboard from './pages/LeadershipDashboard.jsx';
import ParentHome from './pages/ParentHome.jsx';
import ParentChild from './pages/ParentChild.jsx';
import EducatorApp from './pages/EducatorApp.jsx';
import StudentPortal from './pages/StudentPortal.jsx';
import StudentView from './pages/StudentView.jsx';

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
      </Routes>
    </main>
  );
}
