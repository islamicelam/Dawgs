import { useState, useEffect } from 'react';
import { getMe } from '../api/auth';
import { updateUser } from '../api/users';
import Header from '../components/Header';
import type { User } from '../types';
import { BUTTON_PRIMARY_CLS, INPUT_CLS, LABEL_CLS } from '../constants/ui';

const SettingsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await getMe();
      setUser(res.data);
      setName(res.data.name);
      setEmail(res.data.email);
    })();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    await updateUser(user.id, { name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      return;
    }
    try {
      await updateUser(user!.id, { password: newPassword, currentPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch {
      setPasswordError('Current password is incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />
      <div className="max-w-lg mx-auto mt-12 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-8">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
          Settings
        </h1>

        <div className="flex flex-col gap-4">
          <div>
            <label className={LABEL_CLS}>Role</label>
            <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/60 rounded-md text-sm text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800">
              {user?.role}
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLS}
            />
          </div>

          <button onClick={handleSave} className={`${BUTTON_PRIMARY_CLS} mt-2`}>
            {saved ? 'Saved!' : 'Save changes'}
          </button>
          <hr className="border-neutral-100 dark:border-neutral-800 my-2" />

          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            Change password
          </h2>

          <div>
            <label className={LABEL_CLS}>Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={INPUT_CLS}
            />
          </div>

          {passwordError && (
            <p className="text-red-500 dark:text-red-400 text-sm">
              {passwordError}
            </p>
          )}

          <button onClick={handleChangePassword} className={BUTTON_PRIMARY_CLS}>
            {passwordSaved ? 'Saved!' : 'Change password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
