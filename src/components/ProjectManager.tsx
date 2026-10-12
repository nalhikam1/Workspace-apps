import React, { useState } from 'react';
import { Project, Task, ProjectStatus, ViewTab } from '../types';
import { 
  FolderPlus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Archive, 
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
  { title: 'Landing Page Sprint', icon: '🚀', color: '#FFE600', desc: 'Desain & rilis landing page baru', tag: 'Web' },
  { title: 'Branding & Visuals', icon: '🎨', color: '#FF6AC2', desc: 'Desain aset identitas & poster', tag: 'Design' },
  { title: 'Mobile App Feature', icon: '📱', color: '#00F0FF', desc: 'Fitur baru aplikasi seluler', tag: 'App' },
  { title: 'Kampanye Sosmed', icon: '📢', color: '#00E599', desc: 'Promosi & outreach audience', tag: 'Marketing' },
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
  
  // Custom in-app delete confirmation state
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Statistics
  const totalProjects = projects.length;
  const activeCount = projects.filter(p => p.status === 'active').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const onHoldCount = projects.filter(p => p.status === 'on_hold').length;

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtered projects
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

  // Handle Quick Preset Create
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

  // Toggle status
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
      <div className="bg-[#FFFDF5] border-3 border-black p-4 sm:p-6 shadow-[5px_5px_0_0_#000] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#FFE600] px-2 py-0.5 border-2 border-black font-mono font-bold text-xs uppercase shadow-[2px_2px_0_0_#000]">
                PROJECT HUB //
              </span>
              <span className="text-xs font-mono text-black/60 font-bold">
                PUSAT KELOLA PROYEK & INISIASI
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Kelola & Atur Semua Proyek
            </h1>
            <p className="text-xs sm:text-sm text-black/80 font-medium mt-1">
              Atur status, buat proyek baru, hapus proyek yang tidak lagi dibutuhkan, atau buka alur tugas langsung di papan planner.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenProjectModal()}
              className="px-4 py-2.5 bg-[#FFE600] hover:bg-[#ffe033] border-3 border-black shadow-[4px_4px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 text-xs sm:text-sm font-black uppercase flex items-center gap-1.5 cursor-pointer"
            >
              <FolderPlus size={18} strokeWidth={2.5} />
              <span>+ Buat Proyek Baru</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t-2 border-black">
          <div className="bg-white border-2 border-black p-2.5 shadow-[2px_2px_0_0_#000]">
            <div className="text-[10px] font-mono font-bold text-black/60 uppercase">Total Proyek</div>
            <div className="text-xl font-black">{totalProjects}</div>
          </div>
          <div className="bg-[#00E599]/30 border-2 border-black p-2.5 shadow-[2px_2px_0_0_#000]">
            <div className="text-[10px] font-mono font-bold text-black/60 uppercase">Aktif Berjalan</div>
            <div className="text-xl font-black text-emerald-800">{activeCount}</div>
          </div>
          <div className="bg-[#00F0FF]/30 border-2 border-black p-2.5 shadow-[2px_2px_0_0_#000]">
            <div className="text-[10px] font-mono font-bold text-black/60 uppercase">Selesai</div>
            <div className="text-xl font-black text-cyan-800">{completedCount}</div>
          </div>
          <div className="bg-zinc-100 border-2 border-black p-2.5 shadow-[2px_2px_0_0_#000]">
            <div className="text-[10px] font-mono font-bold text-black/60 uppercase">Ditunda (On Hold)</div>
            <div className="text-xl font-black">{onHoldCount}</div>
          </div>
        </div>

        {/* Quick Template Presets for 1-click Fresh Creation */}
        <div className="bg-white border-2 border-black p-3.5 shadow-[3px_3px_0_0_#000]">
          <div className="text-[11px] font-mono font-bold uppercase mb-2 flex items-center gap-1.5 text-black/70">
            <Sparkles size={13} />
            <span>BUAT CEPAT DENGAN TEMPLATE:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.title}
                onClick={() => handleCreatePreset(preset)}
                className="px-2.5 py-1.5 bg-[#FFFDF5] hover:bg-amber-100 border-2 border-black shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>{preset.icon}</span>
                <span>{preset.title}</span>
                <span className="text-[10px] font-mono bg-black text-white px-1">1-KLIK</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t-2 border-black">
          <div className="sm:col-span-2 flex items-center gap-2 bg-white border-2 border-black px-2.5 py-1.5 shadow-[2px_2px_0_0_#000]">
            <Search size={15} className="text-black/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari proyek berdasarkan nama, deskripsi, atau tag..."
              className="w-full text-xs font-bold bg-transparent focus:outline-hidden"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs font-bold cursor-pointer">
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 bg-white border-2 border-black px-2.5 py-1.5 shadow-[2px_2px_0_0_#000]">
            <Filter size={14} className="text-black/60" />
            <span className="text-[11px] font-mono font-bold text-black/60">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full text-xs font-bold bg-transparent focus:outline-hidden cursor-pointer"
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
        <div className="bg-white border-3 border-black p-10 text-center shadow-[5px_5px_0_0_#000] space-y-4">
          <div className="text-4xl">📁</div>
          <h3 className="font-black text-lg uppercase">Tidak Ada Proyek yang Ditemukan</h3>
          <p className="text-xs text-black/70 max-w-md mx-auto">
            {projects.length === 0 
              ? 'Anda belum memiliki proyek. Mulai dengan membuat proyek baru atau gunakan template cepat di atas!'
              : 'Tidak ada proyek yang cocok dengan filter pencarian.'}
          </p>
          <button
            onClick={() => onOpenProjectModal()}
            className="px-4 py-2 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0_0_#000] text-xs font-black uppercase cursor-pointer"
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
                className="bg-white border-3 border-black shadow-[5px_5px_0_0_#000] hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                {/* Card Header with Color Banner */}
                <div>
                  <div 
                    className="p-3.5 border-b-2 border-black flex items-center justify-between"
                    style={{ backgroundColor: proj.color }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 bg-white border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0_0_#000]">
                        {proj.icon}
                      </span>
                      <div>
                        <h3 className="font-black text-base text-black uppercase leading-tight line-clamp-1">
                          {proj.title}
                        </h3>
                        <div className="text-[10px] font-mono font-bold text-black/70">
                          ID: {proj.id}
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <select
                      value={proj.status}
                      onChange={(e) => handleToggleStatus(proj, e.target.value as ProjectStatus)}
                      className="bg-white border-2 border-black px-1.5 py-0.5 text-[10px] font-black uppercase font-mono shadow-[1px_1px_0_0_#000] cursor-pointer"
                    >
                      <option value="active">🟢 AKTIF</option>
                      <option value="completed">✓ SELESAI</option>
                      <option value="on_hold">⏸ ON HOLD</option>
                      <option value="archived">📦 ARSIP</option>
                    </select>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-black/80 font-medium line-clamp-2 min-h-[32px]">
                      {proj.description || 'Tidak ada deskripsi singkat untuk proyek ini.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="bg-[#FFFDF5] border border-black p-2.5">
                      <div className="flex justify-between text-xs font-bold font-mono mb-1">
                        <span>PROGRES TUGAS</span>
                        <span>{doneTasks.length}/{projTasks.length} ({percent}%)</span>
                      </div>
                      <div className="w-full h-3 bg-zinc-200 border border-black overflow-hidden">
                        <div 
                          className="h-full border-r border-black transition-all"
                          style={{ width: `${percent}%`, backgroundColor: proj.color }}
                        />
                      </div>
                    </div>

                    {/* Meta Indicators */}
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono font-bold text-black/70 pt-1">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Deadline: {proj.deadline || 'Bebas'}</span>
                      </div>

                      {(urgentTasks.length > 0 || overdueTasks.length > 0) && (
                        <div className="flex items-center gap-1 text-red-600 bg-red-100 px-1 border border-red-500">
                          <AlertTriangle size={11} />
                          <span>{urgentTasks.length + overdueTasks.length} perhatian</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-mono font-bold bg-amber-50 px-1.5 py-0.5 border border-black/40">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer Bar */}
                <div className="p-3 bg-[#FFFDF5] border-t-2 border-black flex items-center justify-between gap-1">
                  {/* Left: Quick Planner Jump */}
                  <button
                    onClick={() => onNavigateToPlanner(proj.id)}
                    className="px-2.5 py-1.5 bg-[#FFE600] hover:bg-amber-300 border-2 border-black shadow-[2px_2px_0_0_#000] text-[11px] font-black uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Kanban size={13} />
                    <span>Buka Kanban</span>
                  </button>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenTaskModal(undefined, 'todo', proj.id)}
                      title="Tambah tugas baru ke proyek ini"
                      className="px-2 py-1.5 bg-[#00F0FF] hover:bg-cyan-300 border-2 border-black shadow-[1.5px_1.5px_0_0_#000] text-[11px] font-black uppercase flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Tugas</span>
                    </button>

                    <button
                      onClick={() => onOpenProjectModal(proj)}
                      title="Edit detail proyek"
                      className="p-1.5 bg-white hover:bg-slate-100 border-2 border-black shadow-[1.5px_1.5px_0_0_#000] cursor-pointer"
                    >
                      <Edit3 size={13} />
                    </button>

                    {/* HAPUS PROYEK (In-app trigger) */}
                    <button
                      onClick={() => setProjectToDelete(proj)}
                      title="Hapus proyek ini"
                      className="p-1.5 bg-red-100 hover:bg-red-200 border-2 border-black shadow-[1.5px_1.5px_0_0_#000] text-red-600 cursor-pointer"
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

      {/* CUSTOM IN-APP DELETE PROJECT CONFIRMATION MODAL (NO WINDOW.CONFIRM!) */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF5] border-3 border-black shadow-[8px_8px_0_0_#000] w-full max-w-md">
            <div className="bg-red-500 text-white border-b-3 border-black p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} />
                <h3 className="font-black text-base uppercase tracking-wider">
                  Konfirmasi Hapus Proyek
                </h3>
              </div>
              <button
                onClick={() => setProjectToDelete(null)}
                className="p-1 bg-white text-black border-2 border-black hover:bg-black hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-red-50 border-2 border-red-500 p-3 text-xs font-bold text-red-900 space-y-1">
                <div>Yakin ingin menghapus proyek: <strong>"{projectToDelete.title}"</strong>?</div>
                <div className="text-[11px] font-mono text-red-700">
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
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white border-2 border-black shadow-[3px_3px_0_0_#000] font-black text-xs uppercase cursor-pointer"
                >
                  🗑️ Hapus Proyek Sekaligus Semua Tugasnya
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDeleteProject(projectToDelete.id, false);
                    setProjectToDelete(null);
                  }}
                  className="w-full py-2.5 bg-[#FFE600] hover:bg-amber-300 border-2 border-black shadow-[3px_3px_0_0_#000] font-black text-xs uppercase cursor-pointer"
                >
                  📁 Hapus Proyek Saja (Simpan Tugas ke Tanpa Proyek)
                </button>

                <button
                  type="button"
                  onClick={() => setProjectToDelete(null)}
                  className="w-full py-2 bg-white hover:bg-slate-100 border-2 border-black font-bold text-xs uppercase cursor-pointer"
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
