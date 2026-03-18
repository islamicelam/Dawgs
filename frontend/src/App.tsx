import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProjectsPage from './pages/ProjectPage';
import BoardPage from './pages/BoardPage';
import ProtectedRoute from './components/ProtectedRoute';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/boards/:id" element={<BoardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/projects" />} />
      <Route path="*" element={
        localStorage.getItem('token') ? <Navigate to="/projects" /> : <Navigate to="/login" />
      } />
    </Routes>
  );
}

export default App;