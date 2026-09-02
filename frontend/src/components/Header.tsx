import { useNavigate } from 'react-router-dom';
import { Gear, SignOut } from '@phosphor-icons/react';
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
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 shrink-0"
      >
        <img src="/mark.svg" alt="" className="w-5 h-5" />
        <span className="font-medium text-[15px] text-neutral-900 dark:text-neutral-100 tracking-tight">
          dawgs
        </span>
      </button>
      <SearchBar />
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => navigate('/settings')}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors px-2.5 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <Gear size={15} />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors px-2.5 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <SignOut size={15} />
          Log out
        </button>
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Header;
