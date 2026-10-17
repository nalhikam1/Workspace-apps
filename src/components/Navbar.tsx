import React, { useState } from 'react';
import { User, ViewTab, Task, ThemeMode } from '../types';
import { 
  LayoutDashboard, 
  Kanban, 
  Calendar, 
  Timer, 
  Settings, 
  Plus, 
  FolderPlus,
  FolderTree,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Bell,
  AlertTriangle,
  Clock,
  X
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
  theme: ThemeMode;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  tasks: Task[];
  onOpenTaskModal: (task?: Task) => void;
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
  lastSyncedAt,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  tasks,
  onOpenTaskModal,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const syncTimeFormatted = lastSyncedAt 
    ? new Date(lastSyncedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
    : 'Baru saja';

  // Calculate overdue & urgent tasks
  const todayStr = new Date().toISOString().split('T')[0];
  const threeDaysAhead = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'done');
  const dueSoonTasks = tasks.filter(t => t.dueDate && t.dueDate >= todayStr && t.dueDate <= threeDaysAhead && t.status !== 'done');
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done');

  const totalAlerts = overdueTasks.length + dueSoonTasks.length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* Top Banner if Guest */}
      {user?.isGuest && (
        <div className="bg-amber-500 text-white px-4 py-1.5 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="bg-amber-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold">
              MODE TAMU
            </span>
            <span>Data Anda tersimpan di browser ini. Buat akun permanen untuk akses multi-perangkat.</span>
          </div>
          <button
            onClick={onOpenAuth}
            className="underline hover:text-white/80 font-bold whitespace-nowrap cursor-pointer text-xs"
          >
            Daftar Akun &rarr;
          </button>
        </div>
      )}

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => onTabChange('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
              WS
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-base sm:text-lg tracking-tight text-neutral-900 dark:text-neutral-50 leading-none">
                <span>WORK</span>
                <span className="text-amber-500">STUDIO</span>
              </div>
              <div className="text-[10px] font-mono font-medium text-neutral-400">
                PLANNER & FOCUS // V3.0
              </div>
            </div>
          </div>

          {/* Sync indicator */}
          <div 
            onClick={onOpenSettings}
            title={`Tersinkronisasi otomatis pada ${syncTimeFormatted}`}
            className="hidden lg:flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Tersimpan</span>
            <span className="text-neutral-400 text-[11px] tabular-nums">({syncTimeFormatted})</span>
          </div>
        </div>

        {/* Navigation Tabs - Soft Modern Pills */}
        <nav className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <LayoutDashboard size={15} />
            <span className="hidden sm:inline">Analitik</span>
            <span className="sm:hidden">Dash</span>
          </button>

          <button
            onClick={() => onTabChange('projects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'projects'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <FolderTree size={15} />
            <span>Proyek</span>
          </button>

          <button
            onClick={() => onTabChange('planner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'planner'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Kanban size={15} />
            <span>Planner</span>
          </button>

          <button
            onClick={() => onTabChange('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Calendar size={15} />
            <span>Kalender</span>
          </button>

          <button
            onClick={() => onTabChange('working')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'working'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Timer size={15} />
            <span>Mode Kerja</span>
          </button>
        </nav>

        {/* Right Tools: Dark/Light, Click Sound Toggle, Notifications, User */}
        <div className="flex items-center gap-1.5">
          {/* Sound Click Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Efek Suara Klik Aktif (Klik untuk Mute)' : 'Efek Suara Klik Mati (Klik untuk Nyalakan)'}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
          >
            {soundEnabled ? <Volume2 size={16} className="text-amber-500" /> : <VolumeX size={16} />}
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
          >
            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>

          {/* Deadline Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              title="Notifikasi & Pengingat Deadline"
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors relative"
            >
              <Bell size={16} />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-lg p-4 z-50 text-xs animate-in fade-in">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2 mb-3">
                  <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Clock size={15} className="text-amber-500" />
                    <span>Pengingat Deadline</span>
                  </div>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                {totalAlerts === 0 ? (
                  <div className="text-neutral-500 text-center py-4">
                    🎉 Tidak ada tugas yang terlambat atau mendekati tenggat!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {/* Overdue tasks */}
                    {overdueTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onOpenTaskModal(t);
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1 text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 mb-0.5">
                          <span>TERLAMBAT</span>
                          <span>{t.dueDate}</span>
                        </div>
                        <div className="font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {t.title}
                        </div>
                      </div>
                    ))}

                    {/* Due Soon tasks */}
                    {dueSoonTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onOpenTaskModal(t);
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 mb-0.5">
                          <span>MENDEKATI DEADLINE</span>
                          <span>{t.dueDate}</span>
                        </div>
                        <div className="font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {t.title}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Add Task */}
          <button
            onClick={onOpenNewTask}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Plus size={15} />
            <span>Tugas</span>
          </button>

          {/* Settings / Profile */}
          <button
            onClick={onOpenSettings}
            title="Pengaturan & Sinkronisasi"
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
