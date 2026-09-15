import { Routes, Route, Link } from 'react-router-dom';
import StudentList from './pages/StudentList.jsx';
import StudentDetail from './pages/StudentDetail.jsx';
import NewAssessmentForm from './pages/NewAssessmentForm.jsx';
import ContentScreen from './pages/ContentScreen.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  return (
    <div className="app">
      <nav className="app-nav">
        <Link to="/">Students</Link>
        <Link to="/assessments/new">New Assessment</Link>
        <Link to="/content">Content</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<StudentList />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/assessments/new" element={<NewAssessmentForm />} />
          <Route path="/content" element={<ContentScreen />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}
