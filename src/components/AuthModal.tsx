import React, { useState } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { X, Sparkles, User as UserIcon, LogIn, UserPlus, Zap } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChange: (user: User) => void;
  currentUser: User | null;
}

const AVATAR_EMOJIS = ['🚀', '⚡', '👾', '🔥', '🎯', '🛠️', '☕', '💻', '🎨', '🍕', '🦊', '⭐'];
const AVATAR_COLORS = ['#FFE600', '#FF6AC2', '#00F0FF', '#00E599', '#FF7A00', '#C4B5FD'];

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
  const [selectedColor, setSelectedColor] = useState('#FFE600');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFDF5] border-3 border-black shadow-[8px_8px_0_0_#000] w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#FFE600] border-b-3 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="fill-black" size={20} />
            <h2 className="font-black text-lg uppercase tracking-wider">
              Autentikasi & Profil Pengguna
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 border-b-2 border-black bg-white">
          <button
            onClick={() => { setActiveTab('guest'); setErrorMessage(''); }}
            className={`py-2.5 text-xs sm:text-sm font-black border-r-2 border-black transition-colors cursor-pointer ${
              activeTab === 'guest' ? 'bg-[#00F0FF] text-black' : 'hover:bg-slate-50'
            }`}
          >
            ⚡ Mode Tamu
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
            className={`py-2.5 text-xs sm:text-sm font-black border-r-2 border-black transition-colors cursor-pointer ${
              activeTab === 'register' ? 'bg-[#FF6AC2] text-black' : 'hover:bg-slate-50'
            }`}
          >
            Daftar Akun
          </button>
          <button
            onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
            className={`py-2.5 text-xs sm:text-sm font-black transition-colors cursor-pointer ${
              activeTab === 'login' ? 'bg-[#00E599] text-black' : 'hover:bg-slate-50'
            }`}
          >
            Ganti Akun
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 bg-red-100 border-2 border-red-600 text-red-900 px-3 py-2 text-xs font-bold font-mono">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* GUEST TAB */}
          {activeTab === 'guest' && (
            <div className="space-y-4">
              <div className="bg-[#FFF8D6] border-2 border-black p-4 shadow-[3px_3px_0_0_#000]">
                <div className="font-black text-base uppercase mb-1 flex items-center gap-2">
                  <span>🚀 Akses Kilat 1-Klik</span>
                </div>
                <p className="text-xs text-black/80 leading-relaxed font-medium">
                  Coba semua fitur Project Planner, Kalender, Mode Kerja Pomodoro, dan Dashboard Analitik langsung tanpa perlu mendaftar email atau password.
                </p>
                <div className="mt-3 text-[11px] font-mono text-black/70">
                  ✓ Data disimpan aman secara lokal per sesi<br />
                  ✓ Tersedia contoh proyek nyata siap pakai<br />
                  ✓ Bisa di-upgrade ke akun permanen kapan saja
                </div>
              </div>

              <button
                onClick={handleGuestLogin}
                className="w-full py-3 bg-[#FFE600] hover:bg-[#ffd700] border-3 border-black shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles size={18} />
                <span>Masuk Sebagai Tamu Sekarang</span>
              </button>
            </div>
          )}

          {/* REGISTER TAB */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {currentUser?.isGuest && (
                <div className="bg-[#00E599]/20 border-2 border-black p-3 text-xs font-bold text-black">
                  🎉 Data proyek & tugas dari mode tamu Anda akan langsung disinkronkan ke akun permanen baru ini!
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1 font-mono">
                  Nama Lengkap / Alias:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rian Hardianto"
                  className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-sm focus:outline-hidden focus:bg-amber-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1 font-mono">
                  Alamat Email:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-sm focus:outline-hidden focus:bg-amber-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1 font-mono">
                  Peran / Jabatan:
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-sm focus:outline-hidden"
                >
                  <option value="Lead Project Planner">Lead Project Planner</option>
                  <option value="Product Designer">Product Designer</option>
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="Marketing Specialist">Marketing Specialist</option>
                  <option value="Creative Director">Creative Director</option>
                  <option value="Solo Founder / Freelancer">Solo Founder / Freelancer</option>
                </select>
              </div>

              {/* Avatar Emoji & Color Customizer */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2 font-mono">
                  Kustomisasi Avatar:
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 border-2 border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center text-2xl font-bold"
                    style={{ backgroundColor: selectedColor }}
                  >
                    {selectedEmoji}
                  </div>
                  <div className="text-xs font-bold text-black/70">
                    Pilih ikon dan warna neo-brutalist favorit Anda.
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-8 h-8 border-2 border-black flex items-center justify-center text-base cursor-pointer ${
                        selectedEmoji === emoji ? 'bg-black text-white' : 'bg-white hover:bg-amber-100'
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
                      className={`w-7 h-7 border-2 border-black cursor-pointer ${
                        selectedColor === color ? 'scale-110 ring-2 ring-black' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#00E599] hover:bg-[#00d08a] border-3 border-black shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <UserPlus size={18} />
                <span>Buat Akun & Sinkronkan Data</span>
              </button>
            </form>
          )}

          {/* LOGIN / SWITCH ACCOUNT TAB */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <p className="text-xs text-black/70 font-medium">
                Pilih akun yang tersimpan pada peramban ini untuk berganti workspace:
              </p>

              {existingUsers.length === 0 ? (
                <div className="border-2 border-dashed border-black p-4 text-center text-xs font-bold text-black/60">
                  Belum ada profil akun lain yang tersimpan di browser ini. Silakan buat akun baru atau masuk sebagai tamu.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {existingUsers.map((u) => {
                    const isCurrent = currentUser?.id === u.id;
                    return (
                      <div
                        key={u.id}
                        className={`p-3 border-2 border-black flex items-center justify-between transition-all ${
                          isCurrent
                            ? 'bg-[#FFE600] shadow-[3px_3px_0_0_#000]'
                            : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0_0_#000]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 border-2 border-black flex items-center justify-center text-xl"
                            style={{ backgroundColor: u.avatarBg || '#FFE600' }}
                          >
                            {u.avatarEmoji || '⚡'}
                          </div>
                          <div>
                            <div className="font-black text-sm flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.isGuest && (
                                <span className="text-[10px] bg-black text-white px-1 font-mono">TAMU</span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-black/70">{u.email}</div>
                          </div>
                        </div>

                        {isCurrent ? (
                          <span className="text-xs font-black font-mono bg-black text-white px-2 py-0.5">
                            AKTIF
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSwitchUser(u.id)}
                            className="px-2.5 py-1 bg-black text-white hover:bg-zinc-800 text-xs font-black uppercase cursor-pointer"
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
