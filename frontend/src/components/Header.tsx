import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SearchBar from './SearchBar';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch { /* cookie cleared server-side on best-effort */ }
    localStorage.removeItem('me');
    navigate('/login');
  };

  return (
    <div className="bg-slate-900 text-white px-8 py-3 flex items-center justify-between gap-6">
      <span
        className="font-semibold cursor-pointer shrink-0"
        onClick={() => navigate('/projects')}
      >
        Dawgs
      </span>
      <SearchBar />
      <div className="flex items-center gap-4 shrink-0">
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
    </div>
  );
};

export default Header;
