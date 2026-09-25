import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleNotch, WarningCircle } from '@phosphor-icons/react';
import { getMe } from '../api/auth';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        localStorage.setItem('me', JSON.stringify(me.data));
        navigate('/projects');
      } catch {
        setError(true);
      }
    })();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {error ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <WarningCircle size={28} className="text-red-500 dark:text-red-400" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Google sign-in failed.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-indigo-600 dark:text-indigo-400 underline"
          >
            Back to login
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <CircleNotch
            size={28}
            className="animate-spin text-neutral-400 dark:text-neutral-500"
          />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Completing sign-in…
          </p>
        </div>
      )}
    </div>
  );
};

export default OAuthCallbackPage;
