import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch { /* cookie cleared server-side on best-effort */ }
    localStorage.removeItem('me');
    navigate('/login');
  };

  return (
    <div className="bg-slate-900 text-white px-8 py-3 flex items-center justify-between">
      <span
        className="font-semibold cursor-pointer"
        onClick={() => navigate('/projects')}
      >
        Dawgs
      </span>
      <button
        onClick={() => navigate('/settings')}
        className="text-sm text-slate-300 hover:text-white transition-colors"
      >
        Settings
      </button>
      <button
        onClick={handleLogout}
        className="text-sm text-slate-300 hover:text-white transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default Header;
