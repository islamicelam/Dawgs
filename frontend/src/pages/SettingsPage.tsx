import { useState, useEffect } from 'react';
import { getMe } from '../api/auth';
import { updateUser } from '../api/users';
import Header from '../components/Header';
import type { User } from '../types';

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
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-lg mx-auto mt-12 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-xl font-semibold text-slate-800 mb-6">Settings</h1>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Role</label>
            <div className="px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-200">
              {user?.role}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-slate-800 text-white rounded-lg py-2 text-sm hover:bg-slate-700 transition-colors mt-2"
          >
            {saved ? 'Saved!' : 'Save changes'}
          </button>
          <hr className="border-slate-100 my-2" />

          <h2 className="text-sm font-semibold text-slate-700">
            Change password
          </h2>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}

          <button
            onClick={handleChangePassword}
            className="w-full bg-slate-800 text-white rounded-lg py-2 text-sm hover:bg-slate-700 transition-colors"
          >
            {passwordSaved ? 'Saved!' : 'Change password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
