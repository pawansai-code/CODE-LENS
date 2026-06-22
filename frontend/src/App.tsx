import { Routes, Route, Navigate } from 'react-router-dom';
import Workspace from './pages/Workspace';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Workspace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
