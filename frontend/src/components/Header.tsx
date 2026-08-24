import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch {
      /* cookie cleared server-side on best-effort */
    }
    localStorage.removeItem('me');
    navigate('/login');
  };

  return (
    <div className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur border-b border-neutral-200 dark:border-neutral-800 px-6 py-2.5 flex items-center justify-between gap-6 sticky top-0 z-40">
      <span
        className="font-semibold text-[15px] text-neutral-900 dark:text-neutral-100 cursor-pointer shrink-0 tracking-tight"
        onClick={() => navigate('/projects')}
      >
        Dawgs
      </span>
      <SearchBar />
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => navigate('/settings')}
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors px-2.5 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors px-2.5 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Logout
        </button>
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Header;
