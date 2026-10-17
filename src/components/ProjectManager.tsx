import React, { useState } from 'react';
import { Project, Task, ProjectStatus, ViewTab } from '../types';
import { 
  FolderPlus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Plus, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Kanban,
  AlertCircle,
  X
} from 'lucide-react';

interface ProjectManagerProps {
  projects: Project[];
  tasks: Task[];
  onOpenProjectModal: (project?: Project) => void;
  onOpenTaskModal: (task?: Task, initialStatus?: any, initialProjectId?: string) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string, deleteTasksToo: boolean) => void;
  onNavigateToPlanner: (projectId: string) => void;
  onNavigateTab: (tab: ViewTab) => void;
}

const QUICK_PRESETS = [
  { title: 'Landing Page Sprint', icon: '🚀', color: '#F59E0B', desc: 'Desain & rilis landing page baru', tag: 'Web' },
  { title: 'Branding & Visuals', icon: '🎨', color: '#EC4899', desc: 'Desain aset identitas & poster', tag: 'Design' },
  { title: 'Mobile App Feature', icon: '📱', color: '#06B6D4', desc: 'Fitur baru aplikasi seluler', tag: 'App' },
  { title: 'Kampanye Sosmed', icon: '📢', color: '#10B981', desc: 'Promosi & outreach audience', tag: 'Marketing' },
];

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  tasks,
  onOpenProjectModal,
  onOpenTaskModal,
  onUpdateProject,
  onDeleteProject,
  onNavigateToPlanner,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const totalProjects = projects.length;
  const activeCount = projects.filter(p => p.status === 'active').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const onHoldCount = projects.filter(p => p.status === 'on_hold').length;

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredProjects = projects.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchTag = p.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }
    return true;
  });

  const handleCreatePreset = (preset: typeof QUICK_PRESETS[0]) => {
    const today = new Date().toISOString().split('T')[0];
    const deadline = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const newProj: Project = {
      id: 'proj-' + Math.random().toString(36).substring(2, 9),
      title: preset.title,
      description: preset.desc,
      color: preset.color,
      icon: preset.icon,
      status: 'active',
      deadline,
      tags: [preset.tag],
      createdAt: today,
      updatedAt: today,
    };
    onUpdateProject(newProj);
  };

  const handleToggleStatus = (project: Project, newStatus: ProjectStatus) => {
    onUpdateProject({
      ...project,
      status: newStatus,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Hub */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-md font-mono font-bold text-xs uppercase tracking-wider">
                PROJECT HUB //
              </span>
              <span className="text-xs font-mono text-neutral-500 font-medium">
                PUSAT KELOLA PROYEK
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Kelola & Atur Semua Proyek
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-normal mt-1">
              Atur status, buat proyek baru, hapus proyek yang tidak lagi dibutuhkan, atau buka alur tugas langsung di papan planner.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenProjectModal()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs text-xs sm:text-sm font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FolderPlus size={16} />
              <span>+ Buat Proyek</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 rounded-xl p-3">
            <div className="text-[10px] font-mono font-medium text-neutral-500 uppercase">Total Proyek</div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">{totalProjects}</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3">
            <div className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 uppercase">Aktif Berjalan</div>
            <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 tabular-nums">{activeCount}</div>
          </div>
          <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-xl p-3">
            <div className="text-[10px] font-mono font-medium text-sky-600 dark:text-sky-400 uppercase">Selesai</div>
            <div className="text-2xl font-bold text-sky-800 dark:text-sky-200 tabular-nums">{completedCount}</div>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 rounded-xl p-3">
            <div className="text-[10px] font-mono font-medium text-neutral-500 uppercase">On Hold</div>
            <div className="text-2xl font-bold text-neutral-700 dark:text-neutral-300 tabular-nums">{onHoldCount}</div>
          </div>
        </div>

        {/* Quick Template Presets */}
        <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 rounded-xl p-3.5">
          <div className="text-[11px] font-mono font-medium uppercase mb-2 flex items-center gap-1.5 text-neutral-500">
            <Sparkles size={13} className="text-amber-500" />
            <span>BUAT CEPAT DENGAN TEMPLATE:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.title}
                onClick={() => handleCreatePreset(preset)}
                className="px-3 py-1.5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 hover:border-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-neutral-800 dark:text-neutral-100 transition-colors"
              >
                <span>{preset.icon}</span>
                <span>{preset.title}</span>
                <span className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-300 px-1 rounded">1-KLIK</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Status Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="sm:col-span-2 flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-3 py-1.5 text-xs">
            <Search size={14} className="text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari proyek berdasarkan nama atau tag..."
              className="w-full font-medium bg-transparent focus:outline-hidden text-neutral-800 dark:text-neutral-200"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-neutral-400 hover:text-neutral-600 cursor-pointer">
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300">
            <Filter size={14} className="text-neutral-400" />
            <span className="text-[11px] font-mono text-neutral-400">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full font-medium bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Status ({projects.length})</option>
              <option value="active">Aktif ({activeCount})</option>
              <option value="completed">Selesai ({completedCount})</option>
              <option value="on_hold">On Hold ({onHoldCount})</option>
              <option value="archived">Diarsipkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 text-center shadow-sm space-y-3">
          <div className="text-4xl">📁</div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">Tidak Ada Proyek</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Mulai dengan membuat proyek baru atau gunakan template cepat di atas.
          </p>
          <button
            onClick={() => onOpenProjectModal()}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
          >
            + Buat Proyek Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => {
            const projTasks = tasks.filter(t => t.projectId === proj.id);
            const doneTasks = projTasks.filter(t => t.status === 'done');
            const urgentTasks = projTasks.filter(t => t.priority === 'urgent' && t.status !== 'done');
            const overdueTasks = projTasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'done');
            const percent = projTasks.length > 0 ? Math.round((doneTasks.length / projTasks.length) * 100) : 0;

            return (
              <div
                key={proj.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Banner Header */}
                  <div 
                    className="p-4 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between"
                    style={{ backgroundColor: `${proj.color}15` }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-white dark:bg-neutral-800 shadow-xs flex items-center justify-center text-xl">
                        {proj.icon}
                      </span>
                      <div>
                        <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 leading-tight line-clamp-1">
                          {proj.title}
                        </h3>
                        <div className="text-[10px] font-mono text-neutral-400">
                          ID: {proj.id}
                        </div>
                      </div>
                    </div>

                    <select
                      value={proj.status}
                      onChange={(e) => handleToggleStatus(proj, e.target.value as ProjectStatus)}
                      className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-[10px] font-bold uppercase font-mono cursor-pointer"
                    >
                      <option value="active">🟢 AKTIF</option>
                      <option value="completed">✓ SELESAI</option>
                      <option value="on_hold">⏸ ON HOLD</option>
                      <option value="archived">📦 ARSIP</option>
                    </select>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 min-h-[32px]">
                      {proj.description || 'Tidak ada deskripsi singkat.'}
                    </p>

                    <div className="bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2.5">
                      <div className="flex justify-between text-xs font-medium font-mono mb-1 text-neutral-500">
                        <span>PROGRES</span>
                        <span className="tabular-nums">{doneTasks.length}/{projTasks.length} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percent}%`, backgroundColor: proj.color }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono text-neutral-500 pt-1">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Deadline: {proj.deadline || 'Bebas'}</span>
                      </div>

                      {(urgentTasks.length > 0 || overdueTasks.length > 0) && (
                        <div className="flex items-center gap-1 text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/60 tabular-nums">
                          <AlertTriangle size={11} />
                          <span>{urgentTasks.length + overdueTasks.length} perhatian</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-3 bg-neutral-50/70 dark:bg-neutral-950/40 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-1">
                  <button
                    onClick={() => onNavigateToPlanner(proj.id)}
                    className="px-3 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Kanban size={13} />
                    <span>Buka Kanban</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenTaskModal(undefined, 'todo', proj.id)}
                      title="Tambah tugas ke proyek ini"
                      className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus size={13} />
                      <span>Tugas</span>
                    </button>

                    <button
                      onClick={() => onOpenProjectModal(proj)}
                      title="Edit proyek"
                      className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 cursor-pointer"
                    >
                      <Edit3 size={13} />
                    </button>

                    <button
                      onClick={() => setProjectToDelete(proj)}
                      title="Hapus proyek"
                      className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle size={18} />
                <span>Konfirmasi Hapus Proyek</span>
              </div>
              <button
                onClick={() => setProjectToDelete(null)}
                className="p-1 rounded-lg hover:bg-rose-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3 text-xs text-rose-900 dark:text-rose-200 space-y-1">
                <div>Yakin ingin menghapus proyek: <strong>"{projectToDelete.title}"</strong>?</div>
                <div className="text-[11px] font-mono text-rose-700 dark:text-rose-400 tabular-nums">
                  Terdapat {tasks.filter(t => t.projectId === projectToDelete.id).length} tugas terhubung dengan proyek ini.
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteProject(projectToDelete.id, true);
                    setProjectToDelete(null);
                  }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs uppercase cursor-pointer transition-colors shadow-sm"
                >
                  🗑️ Hapus Proyek Sekaligus Semua Tugasnya
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDeleteProject(projectToDelete.id, false);
                    setProjectToDelete(null);
                  }}
                  className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-semibold text-xs uppercase cursor-pointer transition-colors"
                >
                  📁 Hapus Proyek Saja (Simpan Tugas)
                </button>

                <button
                  type="button"
                  onClick={() => setProjectToDelete(null)}
                  className="w-full py-2 bg-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 font-medium text-xs cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
