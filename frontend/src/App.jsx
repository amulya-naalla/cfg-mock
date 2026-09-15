import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import ContentScreen from './pages/ContentScreen.jsx';
import Dashboard from './pages/Dashboard.jsx';

// Owned by Frontend 1 — placeholder only so /educator routes somewhere during solo Frontend 2 work.
function EducatorPlaceholder() {
  return <p>Educator view — built by Frontend 1.</p>;
}

export default function App() {
  return (
    <main className="app-main">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/educator" element={<EducatorPlaceholder />} />
        <Route path="/leadership" element={<Dashboard />} />
        <Route path="/content/:id" element={<ContentScreen />} />
      </Routes>
    </main>
  );
}
