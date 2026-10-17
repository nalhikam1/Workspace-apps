import React, { useState } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { X, Sparkles, UserPlus, Zap } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChange: (user: User) => void;
  currentUser: User | null;
}

const AVATAR_EMOJIS = ['🚀', '⚡', '👾', '🔥', '🎯', '🛠️', '☕', '💻', '🎨', '🍕', '🦊', '⭐'];
const AVATAR_COLORS = ['#F59E0B', '#EC4899', '#06B6D4', '#10B981', '#F97316', '#8B5CF6'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onUserChange,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'guest' | 'login' | 'register'>('guest');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('⚡');
  const [selectedColor, setSelectedColor] = useState('#F59E0B');
  const [selectedRole, setSelectedRole] = useState('Lead Planner');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const existingUsers = StorageService.getAllUsers();

  const handleGuestLogin = () => {
    const guest = StorageService.createGuestUser();
    onUserChange(guest);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Silakan masukkan nama Anda!');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Silakan masukkan email yang valid!');
      return;
    }

    const newUser = StorageService.registerUser(
      name,
      email,
      selectedColor,
      selectedEmoji,
      selectedRole
    );
    onUserChange(newUser);
    onClose();
  };

  const handleSwitchUser = (userId: string) => {
    const user = StorageService.switchUser(userId);
    if (user) {
      onUserChange(user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-amber-500 text-white p-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Zap className="fill-white" size={18} />
            <h2 className="font-bold text-base tracking-wide">
              Autentikasi & Profil Pengguna
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 p-1 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('guest'); setErrorMessage(''); }}
            className={`py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'guest' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            ⚡ Mode Tamu
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
            className={`py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'register' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Daftar Akun
          </button>
          <button
            onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
            className={`py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'login' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Ganti Akun
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 text-xs">
          {errorMessage && (
            <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 px-3 py-2 rounded-xl font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* GUEST TAB */}
          {activeTab === 'guest' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 p-4 rounded-xl space-y-2">
                <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-amber-500" />
                  <span>Akses Kilat 1-Klik</span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                  Coba semua fitur Work Studio (Planner, Kalender, Pomodoro, dan Dashboard Analitik) tanpa perlu mendaftar email atau password.
                </p>
                <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-1">
                  ✓ Data disimpan aman secara lokal per sesi<br />
                  ✓ Contoh proyek siap pakai sudah tersedia<br />
                  ✓ Bisa di-upgrade ke akun permanen kapan saja
                </div>
              </div>

              <button
                onClick={handleGuestLogin}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Masuk Sebagai Tamu Sekarang</span>
              </button>
            </div>
          )}

          {/* REGISTER TAB */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {currentUser?.isGuest && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl font-medium text-emerald-800 dark:text-emerald-300">
                  🎉 Data dari mode tamu akan langsung disinkronkan ke akun permanen baru ini!
                </div>
              )}

              <div>
                <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
                  Nama Lengkap:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rian Hardianto"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium focus:outline-hidden text-neutral-900 dark:text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
                  Alamat Email:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium focus:outline-hidden text-neutral-900 dark:text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
                  Peran / Jabatan:
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium focus:outline-hidden cursor-pointer text-neutral-800 dark:text-neutral-200"
                >
                  <option value="Lead Project Planner">Lead Project Planner</option>
                  <option value="Product Designer">Product Designer</option>
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="Marketing Specialist">Marketing Specialist</option>
                  <option value="Solo Founder / Freelancer">Solo Founder / Freelancer</option>
                </select>
              </div>

              {/* Avatar Customizer */}
              <div>
                <label className="block font-mono font-medium uppercase text-neutral-500 mb-2">
                  Avatar Profil:
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-11 h-11 rounded-xl shadow-xs flex items-center justify-center text-xl font-bold"
                    style={{ backgroundColor: selectedColor }}
                  >
                    {selectedEmoji}
                  </div>
                  <div className="text-neutral-500 font-normal">
                    Pilih ikon dan warna aksen favorit Anda.
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm cursor-pointer ${
                        selectedEmoji === emoji ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                        selectedColor === color ? 'scale-115 ring-2 ring-neutral-900 dark:ring-white ring-offset-2' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <UserPlus size={16} />
                <span>Buat Akun & Sinkronkan</span>
              </button>
            </form>
          )}

          {/* LOGIN TAB */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <p className="text-neutral-500 font-normal">
                Pilih profil akun yang tersimpan pada peramban ini:
              </p>

              {existingUsers.length === 0 ? (
                <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-center text-neutral-400 font-mono">
                  Belum ada profil akun lain.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {existingUsers.map((u) => {
                    const isCurrent = currentUser?.id === u.id;
                    return (
                      <div
                        key={u.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isCurrent
                            ? 'bg-amber-500/10 border-amber-500'
                            : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                            style={{ backgroundColor: u.avatarBg || '#F59E0B' }}
                          >
                            {u.avatarEmoji || '⚡'}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.isGuest && (
                                <span className="text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-1 rounded font-mono">TAMU</span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-neutral-400">{u.email}</div>
                          </div>
                        </div>

                        {isCurrent ? (
                          <span className="text-[10px] font-mono font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-2 py-0.5 rounded">
                            AKTIF
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSwitchUser(u.id)}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Pilih
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
