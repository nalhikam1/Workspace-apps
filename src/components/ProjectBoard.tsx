import React, { useState } from 'react';
import { Project, Task, TaskStatus, Priority, ViewTab } from '../types';
import confetti from 'canvas-confetti';
import { 
  Kanban, 
  List, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Calendar, 
  CheckSquare, 
  Play, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  Layers, 
  AlertCircle,
  FolderPlus,
  Settings2
} from 'lucide-react';

interface ProjectBoardProps {
  projects: Project[];
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenTaskModal: (task?: Task, initialStatus?: TaskStatus, initialProjectId?: string) => void;
  onOpenProjectModal: (project?: Project) => void;
  onStartWorkingOnTask: (task: Task) => void;
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; badge: string }[] = [
  { id: 'backlog', label: 'Backlog', color: '#E4E4E7', badge: 'IDEA' },
  { id: 'todo', label: 'To Do', color: '#93C5FD', badge: 'READY' },
  { id: 'in_progress', label: 'In Progress', color: '#FDE047', badge: 'WIP' },
  { id: 'review', label: 'Review', color: '#C4B5FD', badge: 'CHECK' },
  { id: 'done', label: 'Done', color: '#00E599', badge: 'SELESAI' },
];

export const ProjectBoard: React.FC<ProjectBoardProps> = ({
  projects,
  tasks,
  onUpdateTask,
  onDeleteTask,
  onOpenTaskModal,
  onOpenProjectModal,
  onStartWorkingOnTask,
  selectedProjectId,
  onSelectProject,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');

  // Trigger celebratory confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#FFE600', '#FF6AC2', '#00F0FF', '#00E599']
      });
    } catch {
      // fallback safe
    }
  };

  // Move task status forwards or backwards
  const handleMoveStatus = (task: Task, direction: 'next' | 'prev') => {
    const statusOrder: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    const currentIndex = statusOrder.indexOf(task.status);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < statusOrder.length) {
      const nextStatus = statusOrder[newIndex];
      const updated: Task = {
        ...task,
        status: nextStatus,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      onUpdateTask(updated);

      if (nextStatus === 'done') {
        triggerConfetti();
      }
    }
  };

  // Toggle single subtask
  const handleToggleSubtask = (task: Task, subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
    
    const updated: Task = {
      ...task,
      subtasks: updatedSubtasks,
      status: allDone ? 'done' : task.status,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateTask(updated);

    if (allDone && task.status !== 'done') {
      triggerConfetti();
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchTags = task.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  const activeProject = projects.find(p => p.id === selectedProjectId);
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-5">
      {/* Top Planner Control Hub */}
      <div className="bg-[#FFFDF5] border-3 border-black p-4 sm:p-5 shadow-[5px_5px_0_0_#000] space-y-4">
        {/* Header & View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#00F0FF] px-2 py-0.5 border-2 border-black font-mono font-bold text-xs uppercase shadow-[2px_2px_0_0_#000]">
                PROJECT PLANNER //
              </span>
              <span className="text-xs font-mono text-black/60 font-bold">
                {filteredTasks.length} TUGAS TERFILTER
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              <span>Papan Kerja & Alur Tugas</span>
              {activeProject && (
                <span className="text-sm font-bold bg-white px-2 py-0.5 border-2 border-black font-mono shadow-[2px_2px_0_0_#000]">
                  {activeProject.icon} {activeProject.title}
                </span>
              )}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex border-2 border-black bg-white shadow-[2px_2px_0_0_#000]">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black cursor-pointer transition-colors ${
                  viewMode === 'kanban' ? 'bg-[#FFE600]' : 'hover:bg-amber-50'
                }`}
              >
                <Kanban size={15} />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black border-l-2 border-black cursor-pointer transition-colors ${
                  viewMode === 'list' ? 'bg-[#FFE600]' : 'hover:bg-amber-50'
                }`}
              >
                <List size={15} />
                <span>Daftar</span>
              </button>
            </div>

            {/* Manage Project Button if filtered */}
            {activeProject ? (
              <button
                onClick={() => onOpenProjectModal(activeProject)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                <Settings2 size={14} />
                <span>Kelola Proyek</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenProjectModal()}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                <FolderPlus size={14} />
                <span>+ Proyek</span>
              </button>
            )}

            {/* Quick Add Task */}
            <button
              onClick={() => onOpenTaskModal(undefined, 'todo', selectedProjectId !== 'all' ? selectedProjectId : undefined)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#FFE600] hover:bg-[#ffe033] border-2 border-black shadow-[3px_3px_0_0_#000] text-xs font-black uppercase cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Tambah Tugas</span>
            </button>
          </div>
        </div>

        {/* Project Selector Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          <span className="text-[11px] font-mono font-bold uppercase text-black/60 mr-1 flex items-center gap-1">
            <Filter size={12} />
            <span>PILIH:</span>
          </span>

          <button
            onClick={() => onSelectProject('all')}
            className={`px-3 py-1 text-xs font-bold border-2 border-black cursor-pointer transition-all whitespace-nowrap ${
              selectedProjectId === 'all'
                ? 'bg-black text-white shadow-[2px_2px_0_0_#000]'
                : 'bg-white hover:bg-zinc-100 shadow-[1px_1px_0_0_#000]'
            }`}
          >
            Semua Proyek ({projects.length})
          </button>

          {projects.map((proj) => {
            const count = tasks.filter(t => t.projectId === proj.id).length;
            const isSelected = selectedProjectId === proj.id;
            return (
              <button
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold border-2 border-black cursor-pointer transition-all whitespace-nowrap ${
                  isSelected
                    ? 'shadow-[3px_3px_0_0_#000] -translate-y-0.5'
                    : 'bg-white hover:bg-slate-100 shadow-[1px_1px_0_0_#000]'
                }`}
                style={isSelected ? { backgroundColor: proj.color } : {}}
              >
                <span>{proj.icon}</span>
                <span>{proj.title}</span>
                <span className="font-mono text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t-2 border-black">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-white border-2 border-black px-2.5 py-1.5 shadow-[2px_2px_0_0_#000]">
            <Search size={15} className="text-black/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas atau tag..."
              className="w-full text-xs font-bold bg-transparent focus:outline-hidden"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs font-bold cursor-pointer">
                ×
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2 bg-white border-2 border-black px-2.5 py-1.5 shadow-[2px_2px_0_0_#000]">
            <span className="text-[11px] font-mono font-bold text-black/60">PRIORITAS:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full text-xs font-bold bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Prioritas</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status Filter (useful in List mode) */}
          <div className="flex items-center gap-2 bg-white border-2 border-black px-2.5 py-1.5 shadow-[2px_2px_0_0_#000]">
            <span className="text-[11px] font-mono font-bold text-black/60">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full text-xs font-bold bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter(t => t.status === col.id);

            return (
              <div 
                key={col.id}
                className="bg-[#FFFDF5] border-3 border-black shadow-[4px_4px_0_0_#000] flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div 
                  className="p-3 border-b-2 border-black flex items-center justify-between"
                  style={{ backgroundColor: col.color }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm uppercase tracking-wider">{col.label}</span>
                    <span className="w-5 h-5 bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenTaskModal(undefined, col.id, selectedProjectId !== 'all' ? selectedProjectId : undefined)}
                    title={`Tambah tugas ke ${col.label}`}
                    className="p-1 bg-white border border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Column Body: Task Cards */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)]">
                  {columnTasks.length === 0 ? (
                    <div className="border-2 border-dashed border-black/30 p-6 text-center text-xs font-mono text-black/40">
                      Belum ada tugas di kolom {col.label}.
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const project = projects.find(p => p.id === task.projectId);
                      const isOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'done';
                      const completedSubtasks = task.subtasks.filter(s => s.completed).length;

                      return (
                        <div
                          key={task.id}
                          className="bg-white border-2 border-black p-3 shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-y-0.5 transition-all group"
                        >
                          {/* Project & Priority Badges */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            {project && (
                              <span 
                                className="text-[10px] font-black uppercase px-1.5 py-0.5 border border-black font-mono truncate max-w-[120px]"
                                style={{ backgroundColor: project.color }}
                              >
                                {project.icon} {project.title}
                              </span>
                            )}

                            {/* Priority Indicator */}
                            <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 border border-black font-mono ${
                              task.priority === 'urgent' ? 'bg-[#FF6AC2] text-black' :
                              task.priority === 'high' ? 'bg-[#FFE600] text-black' :
                              task.priority === 'medium' ? 'bg-[#00F0FF] text-black' :
                              'bg-zinc-100 text-black'
                            }`}>
                              {task.priority}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h3 
                            onClick={() => onOpenTaskModal(task)}
                            className="font-black text-sm text-black leading-snug cursor-pointer hover:underline mb-1"
                          >
                            {task.title}
                          </h3>

                          {/* Task Description */}
                          {task.description && (
                            <p className="text-xs text-black/70 line-clamp-2 mb-2 font-medium">
                              {task.description}
                            </p>
                          )}

                          {/* Subtasks Progress if any */}
                          {task.subtasks.length > 0 && (
                            <div className="mb-2 bg-amber-50/60 border border-black p-1.5">
                              <div className="flex justify-between text-[10px] font-mono font-bold mb-1">
                                <span>Subtask</span>
                                <span>{completedSubtasks}/{task.subtasks.length}</span>
                              </div>
                              <div className="w-full h-1.5 bg-zinc-200 border border-black">
                                <div 
                                  className="h-full bg-[#00E599]"
                                  style={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Metadata: Due Date & Estimated/Spent */}
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono font-bold text-black/70 pt-2 border-t border-black/20">
                            {task.dueDate && (
                              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-black' : ''}`}>
                                <Calendar size={12} />
                                <span>{task.dueDate}</span>
                                {isOverdue && <span className="bg-red-600 text-white text-[9px] px-1 font-mono">LATE</span>}
                              </div>
                            )}

                            {task.estimatedMinutes > 0 && (
                              <div className="flex items-center gap-1 text-black/60">
                                <Clock size={12} />
                                <span>{task.timeSpentMinutes}/{task.estimatedMinutes}m</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons: Move Status & Start Work */}
                          <div className="mt-3 pt-2 border-t-2 border-black flex items-center justify-between gap-1">
                            {/* Start working mode */}
                            <button
                              onClick={() => onStartWorkingOnTask(task)}
                              title="Buka di Mode Kerja Fokus"
                              className="px-2 py-1 bg-[#00E599] hover:bg-[#00d08a] border border-black text-[11px] font-black uppercase flex items-center gap-1 cursor-pointer"
                            >
                              <Play size={10} fill="currentColor" />
                              <span>Fokus</span>
                            </button>

                            {/* Move Prev / Next */}
                            <div className="flex items-center gap-1">
                              {col.id !== 'backlog' && (
                                <button
                                  onClick={() => handleMoveStatus(task, 'prev')}
                                  title="Kembalikan status"
                                  className="p-1 bg-white hover:bg-slate-100 border border-black cursor-pointer"
                                >
                                  <ChevronLeft size={13} />
                                </button>
                              )}

                              <button
                                onClick={() => onOpenTaskModal(task)}
                                title="Edit tugas"
                                className="p-1 bg-white hover:bg-slate-100 border border-black cursor-pointer"
                              >
                                <Edit3 size={13} />
                              </button>

                              {col.id !== 'done' && (
                                <button
                                  onClick={() => handleMoveStatus(task, 'next')}
                                  title="Lanjutkan status"
                                  className="p-1 bg-[#FFE600] hover:bg-amber-300 border border-black cursor-pointer"
                                >
                                  <ChevronRight size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE: HIGH-DENSITY LIST */}
      {viewMode === 'list' && (
        <div className="bg-white border-3 border-black shadow-[5px_5px_0_0_#000] overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FFE600] border-b-2 border-black font-black uppercase text-[11px] tracking-wider font-mono">
                <th className="p-3 border-r-2 border-black w-10">OK</th>
                <th className="p-3 border-r-2 border-black">Judul Tugas</th>
                <th className="p-3 border-r-2 border-black">Proyek</th>
                <th className="p-3 border-r-2 border-black">Status</th>
                <th className="p-3 border-r-2 border-black">Prioritas</th>
                <th className="p-3 border-r-2 border-black">Deadline</th>
                <th className="p-3 border-r-2 border-black">Waktu</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs font-mono text-black/60 font-bold">
                    Tidak ada tugas yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const project = projects.find(p => p.id === task.projectId);
                  const isDone = task.status === 'done';
                  const isOverdue = task.dueDate && task.dueDate < todayStr && !isDone;

                  return (
                    <tr 
                      key={task.id} 
                      className={`border-b-2 border-black/20 hover:bg-amber-50/50 transition-colors ${
                        isDone ? 'bg-zinc-50 opacity-75' : ''
                      }`}
                    >
                      {/* Checkbox Complete */}
                      <td className="p-3 border-r-2 border-black text-center">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => {
                            const newStatus: TaskStatus = isDone ? 'todo' : 'done';
                            onUpdateTask({ ...task, status: newStatus });
                            if (newStatus === 'done') triggerConfetti();
                          }}
                          className="w-4 h-4 cursor-pointer accent-black"
                        />
                      </td>

                      {/* Title */}
                      <td className="p-3 border-r-2 border-black">
                        <div 
                          onClick={() => onOpenTaskModal(task)}
                          className={`font-black cursor-pointer hover:underline text-sm ${isDone ? 'line-through text-black/50' : 'text-black'}`}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-black/60 line-clamp-1 font-medium">{task.description}</div>
                        )}
                      </td>

                      {/* Project */}
                      <td className="p-3 border-r-2 border-black whitespace-nowrap">
                        {project ? (
                          <span 
                            className="px-2 py-0.5 border border-black text-[10px] font-black uppercase font-mono"
                            style={{ backgroundColor: project.color }}
                          >
                            {project.icon} {project.title}
                          </span>
                        ) : '-'}
                      </td>

                      {/* Status */}
                      <td className="p-3 border-r-2 border-black whitespace-nowrap">
                        <select
                          value={task.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as TaskStatus;
                            onUpdateTask({ ...task, status: newStatus });
                            if (newStatus === 'done') triggerConfetti();
                          }}
                          className="border border-black px-1.5 py-0.5 text-[11px] font-bold font-mono bg-white cursor-pointer"
                        >
                          <option value="backlog">Backlog</option>
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </td>

                      {/* Priority */}
                      <td className="p-3 border-r-2 border-black whitespace-nowrap">
                        <span className={`px-2 py-0.5 border border-black text-[10px] font-black uppercase font-mono ${
                          task.priority === 'urgent' ? 'bg-[#FF6AC2]' :
                          task.priority === 'high' ? 'bg-[#FFE600]' :
                          task.priority === 'medium' ? 'bg-[#00F0FF]' : 'bg-zinc-100'
                        }`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="p-3 border-r-2 border-black whitespace-nowrap font-mono font-bold">
                        <span className={isOverdue ? 'text-red-600' : 'text-black/80'}>
                          {task.dueDate || '-'}
                        </span>
                        {isOverdue && <span className="ml-1 text-[9px] bg-red-600 text-white px-1">LATE</span>}
                      </td>

                      {/* Time Spent */}
                      <td className="p-3 border-r-2 border-black whitespace-nowrap font-mono text-[11px]">
                        {task.timeSpentMinutes} / {task.estimatedMinutes}m
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onStartWorkingOnTask(task)}
                            title="Buka di Mode Kerja"
                            className="p-1.5 bg-[#00E599] border border-black hover:bg-emerald-400 cursor-pointer"
                          >
                            <Play size={12} fill="currentColor" />
                          </button>
                          <button
                            onClick={() => onOpenTaskModal(task)}
                            title="Edit"
                            className="p-1.5 bg-white border border-black hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            title="Hapus"
                            className="p-1.5 bg-red-100 border border-black hover:bg-red-200 cursor-pointer text-red-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
