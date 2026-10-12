import React from 'react';
import { User, ViewTab } from '../types';
import { 
  LayoutDashboard, 
  Kanban, 
  Calendar, 
  Timer, 
  Settings, 
  Plus, 
  UserCheck, 
  LogOut, 
  RefreshCw,
  FolderPlus,
  FolderTree
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  lastSyncedAt: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onTabChange,
  onOpenNewTask,
  onOpenNewProject,
  onOpenAuth,
  onLogout,
  onOpenSettings,
  lastSyncedAt
}) => {
  const syncTimeFormatted = lastSyncedAt 
    ? new Date(lastSyncedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
    : 'Baru saja';

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF5] border-b-3 border-black shadow-[0_4px_0_0_#000]">
      {/* Top Banner if Guest */}
      {user?.isGuest && (
        <div className="bg-[#FFE600] border-b-2 border-black px-4 py-1.5 flex items-center justify-between text-xs font-bold text-black overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="bg-black text-[#FFE600] px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-mono">
              MODE TAMU
            </span>
            <span>Data Anda tersimpan di browser ini. Buat akun permanen agar dapat diakses kapan saja.</span>
          </div>
          <button
            onClick={onOpenAuth}
            className="ml-4 underline hover:text-black/80 font-black whitespace-nowrap cursor-pointer"
          >
            Daftar Akun Permanen &rarr;
          </button>
        </div>
      )}

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Sync Status */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => onTabChange('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center font-black text-xl group-hover:rotate-6 transition-transform">
              BW
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-black text-lg sm:text-xl tracking-tight uppercase leading-none">
                <span>BRUTAL</span>
                <span className="bg-[#00F0FF] px-1 border border-black shadow-[1.5px_1.5px_0_0_#000]">WORK</span>
              </div>
              <div className="text-[10px] font-mono font-bold text-black/60 tracking-wider">
                PLANNER & STUDIO // V2.4
              </div>
            </div>
          </div>

          {/* Sync indicator */}
          <div 
            onClick={onOpenSettings}
            title={`Tersinkronisasi otomatis pada ${syncTimeFormatted}`}
            className="hidden md:flex items-center gap-1.5 bg-white px-2.5 py-1 border-2 border-black shadow-[2px_2px_0_0_#000] text-xs font-mono font-bold cursor-pointer hover:bg-slate-50"
          >
            <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse border border-black"></span>
            <span>TERSIMPAN</span>
            <span className="text-black/40 text-[11px]">({syncTimeFormatted})</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-[#FFE600] shadow-[3px_3px_0_0_#000] -translate-y-0.5'
                : 'bg-white hover:bg-amber-50 shadow-[1px_1px_0_0_#000]'
            }`}
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Analitik</span>
            <span className="sm:hidden">Dash</span>
          </button>

          <button
            onClick={() => onTabChange('projects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'projects'
                ? 'bg-[#FF7A00] text-black shadow-[3px_3px_0_0_#000] -translate-y-0.5'
                : 'bg-white hover:bg-orange-50 shadow-[1px_1px_0_0_#000]'
            }`}
          >
            <FolderTree size={16} />
            <span>Kelola Proyek</span>
          </button>

          <button
            onClick={() => onTabChange('planner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'planner'
                ? 'bg-[#00F0FF] shadow-[3px_3px_0_0_#000] -translate-y-0.5'
                : 'bg-white hover:bg-cyan-50 shadow-[1px_1px_0_0_#000]'
            }`}
          >
            <Kanban size={16} />
            <span>Planner</span>
          </button>

          <button
            onClick={() => onTabChange('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-[#FF6AC2] shadow-[3px_3px_0_0_#000] -translate-y-0.5'
                : 'bg-white hover:bg-pink-50 shadow-[1px_1px_0_0_#000]'
            }`}
          >
            <Calendar size={16} />
            <span>Kalender</span>
          </button>

          <button
            onClick={() => onTabChange('working')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'working'
                ? 'bg-[#00E599] shadow-[3px_3px_0_0_#000] -translate-y-0.5'
                : 'bg-white hover:bg-emerald-50 shadow-[1px_1px_0_0_#000]'
            }`}
          >
            <Timer size={16} />
            <span>Mode Kerja</span>
          </button>
        </nav>

        {/* Quick Actions & User Badge */}
        <div className="flex items-center gap-2">
          {/* Add Actions */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={onOpenNewProject}
              title="Buat Proyek Baru"
              className="px-2.5 py-1.5 bg-white hover:bg-amber-100 border-2 border-black shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <FolderPlus size={15} />
              <span>Proyek</span>
            </button>

            <button
              onClick={onOpenNewTask}
              className="px-3 py-1.5 bg-[#FFE600] hover:bg-[#ffe033] border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 text-xs sm:text-sm font-black flex items-center gap-1 cursor-pointer"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Tugas</span>
            </button>
          </div>

          {/* User Profile / Auth Switcher */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 bg-white border-2 border-black px-2.5 py-1 shadow-[2px_2px_0_0_#000] hover:bg-gray-50 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer text-left"
              >
                <div 
                  className="w-6 h-6 border border-black flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: user.avatarBg || '#FFE600' }}
                >
                  {user.avatarEmoji || '⚡'}
                </div>
                <div className="hidden md:block max-w-[100px] truncate text-xs font-black">
                  {user.name}
                </div>
              </button>

              <button
                onClick={onOpenSettings}
                title="Pengaturan Data & Sinkronisasi"
                className="p-1.5 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] hover:bg-slate-100 cursor-pointer"
              >
                <Settings size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 bg-[#00F0FF] border-2 border-black shadow-[3px_3px_0_0_#000] font-black text-xs sm:text-sm cursor-pointer hover:bg-cyan-300"
            >
              Masuk / Tamu
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
