import { useState } from 'react';
import { getMe, login, register } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { BUTTON_PRIMARY_CLS, INPUT_CLS } from '../constants/ui';

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');

    if (isRegister) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      try {
        await register(name, email, password);
        await login(email, password);
        const me = await getMe();
        localStorage.setItem('me', JSON.stringify(me.data));
        navigate('/projects');
      } catch {
        setError('Registration failed');
      }
    } else {
      try {
        await login(email, password);
        const me = await getMe();
        localStorage.setItem('me', JSON.stringify(me.data));
        navigate('/projects');
      } catch {
        setError('Invalid email or password');
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 w-96">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
          {isRegister ? 'Create account' : 'Log in'}
        </h1>

        {isRegister && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${INPUT_CLS} mb-3`}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${INPUT_CLS} mb-3`}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${INPUT_CLS} mb-3`}
        />

        {isRegister && (
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`${INPUT_CLS} mb-3`}
          />
        )}

        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm mb-3">
            {error}
          </p>
        )}

        <button onClick={handleSubmit} className={`w-full ${BUTTON_PRIMARY_CLS} mb-3`}>
          {isRegister ? 'Create account' : 'Login'}
        </button>

        <p className="text-center text-sm text-neutral-400 dark:text-neutral-500">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 ml-1 transition-colors"
          >
            {isRegister ? 'Log in' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
