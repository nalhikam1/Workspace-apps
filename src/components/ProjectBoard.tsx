import React, { useState } from 'react';
import { Project, Task, TaskStatus, Priority, ViewTab } from '../types';
import confetti from 'canvas-confetti';
import { SoundEffects } from '../services/soundEffects';
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
  Trash2, 
  Edit3, 
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
  onNavigateToProjectManager?: () => void;
}

const COLUMNS: { id: TaskStatus; label: string; headerBg: string; badge: string }[] = [
  { id: 'backlog', label: 'Backlog', headerBg: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300', badge: 'IDEA' },
  { id: 'todo', label: 'To Do', headerBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300', badge: 'READY' },
  { id: 'in_progress', label: 'In Progress', headerBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300', badge: 'WIP' },
  { id: 'review', label: 'Review', headerBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300', badge: 'CHECK' },
  { id: 'done', label: 'Done', headerBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300', badge: 'SELESAI' },
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
  onNavigateToProjectManager,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');

  const triggerConfetti = () => {
    SoundEffects.playCompletionChime();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#F59E0B', '#10B981', '#6366F1']
      });
    } catch {}
  };

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

  const filteredTasks = tasks.filter(task => {
    if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTags = task.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  const activeProject = projects.find(p => p.id === selectedProjectId);
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Top Planner Control Hub */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Header & View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-md font-mono font-bold text-xs uppercase tracking-wider">
                PLANNER KERJA //
              </span>
              <span className="text-xs font-mono text-neutral-500 font-medium tabular-nums">
                {filteredTasks.length} TUGAS TERFILTER
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <span>Papan Kerja & Alur Tugas</span>
              {activeProject && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  {activeProject.icon} {activeProject.title}
                </span>
              )}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'kanban' 
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 shadow-xs' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Kanban size={14} />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 shadow-xs' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <List size={14} />
                <span>Daftar</span>
              </button>
            </div>

            {/* Project Management Action */}
            {onNavigateToProjectManager && (
              <button
                onClick={onNavigateToProjectManager}
                title="Buka Pusat Kelola Semua Proyek"
                className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 cursor-pointer transition-colors"
              >
                <Settings2 size={14} />
                <span>Kelola Proyek</span>
              </button>
            )}

            <button
              onClick={() => onOpenProjectModal(activeProject || undefined)}
              className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 cursor-pointer transition-colors"
            >
              <FolderPlus size={14} />
              <span>{activeProject ? 'Edit Proyek' : '+ Proyek'}</span>
            </button>

            {/* Quick Add Task */}
            <button
              onClick={() => onOpenTaskModal(undefined, 'todo', selectedProjectId !== 'all' ? selectedProjectId : undefined)}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase shadow-xs cursor-pointer transition-colors"
            >
              <Plus size={15} />
              <span>Tambah Tugas</span>
            </button>
          </div>
        </div>

        {/* Project Selector Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          <span className="text-[11px] font-mono font-medium uppercase text-neutral-400 mr-1 flex items-center gap-1">
            <Filter size={12} />
            <span>PILIH:</span>
          </span>

          <button
            onClick={() => onSelectProject('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap ${
              selectedProjectId === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
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
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                  isSelected
                    ? 'shadow-xs font-bold'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
                style={isSelected ? { backgroundColor: `${proj.color}25`, color: proj.color } : {}}
              >
                <span>{proj.icon}</span>
                <span>{proj.title}</span>
                <span className="font-mono text-[10px] opacity-75 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-3 py-1.5 text-xs">
            <Search size={14} className="text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas atau tag..."
              className="w-full font-medium bg-transparent focus:outline-hidden text-neutral-800 dark:text-neutral-200"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-neutral-400 hover:text-neutral-600 cursor-pointer">
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300">
            <span className="text-[11px] font-mono text-neutral-400">PRIORITAS:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full font-medium bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Prioritas</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300">
            <span className="text-[11px] font-mono text-neutral-400">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full font-medium bg-transparent focus:outline-hidden cursor-pointer"
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
                className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col min-h-[500px] shadow-xs"
              >
                {/* Column Header */}
                <div className={`p-3.5 border-b border-neutral-200 dark:border-neutral-800 rounded-t-2xl flex items-center justify-between ${col.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider">{col.label}</span>
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[11px] font-mono font-bold flex items-center justify-center tabular-nums">
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenTaskModal(undefined, col.id, selectedProjectId !== 'all' ? selectedProjectId : undefined)}
                    title={`Tambah tugas ke ${col.label}`}
                    className="p-1 rounded-md bg-white/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-white cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Column Cards */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)]">
                  {columnTasks.length === 0 ? (
                    <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-6 text-center text-xs font-mono text-neutral-400">
                      Kosong
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const project = projects.find(p => p.id === task.projectId);
                      const isOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'done';
                      const completedSubtasks = task.subtasks.filter(s => s.completed).length;

                      return (
                        <div
                          key={task.id}
                          className="bg-white dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700/80 rounded-xl p-3.5 shadow-xs hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600 transition-all group"
                        >
                          {/* Badges */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            {project && (
                              <span 
                                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono truncate max-w-[120px]"
                                style={{ backgroundColor: `${project.color}25`, color: project.color }}
                              >
                                {project.icon} {project.title}
                              </span>
                            )}

                            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded font-mono ${
                              task.priority === 'urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                              task.priority === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                              task.priority === 'medium' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' :
                              'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                            }`}>
                              {task.priority}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 
                            onClick={() => onOpenTaskModal(task)}
                            className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-snug cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 mb-1"
                          >
                            {task.title}
                          </h3>

                          {task.description && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-2 font-normal">
                              {task.description}
                            </p>
                          )}

                          {/* Subtasks */}
                          {task.subtasks.length > 0 && (
                            <div className="mb-2 bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-700/50">
                              <div className="flex justify-between text-[10px] font-mono text-neutral-500 mb-1 tabular-nums">
                                <span>Subtask</span>
                                <span>{completedSubtasks}/{task.subtasks.length}</span>
                              </div>
                              <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Meta: Due Date & Time */}
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-700/60 tabular-nums">
                            {task.dueDate && (
                              <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                                <Calendar size={12} />
                                <span>{task.dueDate}</span>
                                {isOverdue && <span className="bg-rose-500 text-white text-[9px] px-1 rounded font-mono">LATE</span>}
                              </div>
                            )}

                            {task.estimatedMinutes > 0 && (
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{task.timeSpentMinutes}/{task.estimatedMinutes}m</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between gap-1">
                            <button
                              onClick={() => onStartWorkingOnTask(task)}
                              title="Buka di Mode Kerja Fokus"
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Play size={10} fill="currentColor" />
                              <span>Fokus</span>
                            </button>

                            <div className="flex items-center gap-1 text-neutral-500">
                              {col.id !== 'backlog' && (
                                <button
                                  onClick={() => handleMoveStatus(task, 'prev')}
                                  title="Kembalikan status"
                                  className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                                >
                                  <ChevronLeft size={14} />
                                </button>
                              )}

                              <button
                                onClick={() => onOpenTaskModal(task)}
                                title="Edit tugas"
                                className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                              >
                                <Edit3 size={14} />
                              </button>

                              {col.id !== 'done' && (
                                <button
                                  onClick={() => handleMoveStatus(task, 'next')}
                                  title="Lanjutkan status"
                                  className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                                >
                                  <ChevronRight size={14} />
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
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/70 border-b border-neutral-200 dark:border-neutral-700 font-mono text-[11px] text-neutral-500 uppercase tracking-wider">
                  <th className="p-3.5 w-10 text-center">OK</th>
                  <th className="p-3.5">Judul Tugas</th>
                  <th className="p-3.5">Proyek</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Prioritas</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Waktu</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-xs font-mono text-neutral-400">
                      Tidak ada tugas yang cocok.
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
                        className={`border-b border-neutral-100 dark:border-neutral-800/60 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                          isDone ? 'opacity-60 bg-neutral-50/40 dark:bg-neutral-900/40' : ''
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => {
                              const newStatus: TaskStatus = isDone ? 'todo' : 'done';
                              onUpdateTask({ ...task, status: newStatus });
                              if (newStatus === 'done') triggerConfetti();
                            }}
                            className="w-4 h-4 cursor-pointer accent-amber-500 rounded"
                          />
                        </td>

                        <td className="p-3.5">
                          <div 
                            onClick={() => onOpenTaskModal(task)}
                            className={`font-semibold cursor-pointer hover:underline text-sm ${
                              isDone ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-neutral-100'
                            }`}
                          >
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-[11px] text-neutral-400 line-clamp-1">{task.description}</div>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          {project ? (
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono"
                              style={{ backgroundColor: `${project.color}25`, color: project.color }}
                            >
                              {project.icon} {project.title}
                            </span>
                          ) : '-'}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <select
                            value={task.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as TaskStatus;
                              onUpdateTask({ ...task, status: newStatus });
                              if (newStatus === 'done') triggerConfetti();
                            }}
                            className="border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-[11px] font-medium bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                          >
                            <option value="backlog">Backlog</option>
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </select>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${
                            task.priority === 'urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                            task.priority === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                            task.priority === 'medium' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' :
                            'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                          }`}>
                            {task.priority}
                          </span>
                        </td>

                        <td className="p-3.5 whitespace-nowrap font-mono font-medium tabular-nums">
                          <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-neutral-600 dark:text-neutral-400'}>
                            {task.dueDate || '-'}
                          </span>
                          {isOverdue && <span className="ml-1 text-[9px] bg-rose-500 text-white px-1 rounded">LATE</span>}
                        </td>

                        <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-neutral-500 tabular-nums">
                          {task.timeSpentMinutes} / {task.estimatedMinutes}m
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onStartWorkingOnTask(task)}
                              title="Buka di Mode Kerja"
                              className="p-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 cursor-pointer"
                            >
                              <Play size={12} fill="currentColor" />
                            </button>
                            <button
                              onClick={() => onOpenTaskModal(task)}
                              title="Edit"
                              className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 cursor-pointer"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              title="Hapus"
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 cursor-pointer"
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
        </div>
      )}
    </div>
  );
};
