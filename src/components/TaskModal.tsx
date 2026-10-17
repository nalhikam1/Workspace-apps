import React, { useState, useEffect } from 'react';
import { Project, Task, TaskStatus, Priority, Subtask } from '../types';
import { X, Plus, Trash2, Clock, Calendar } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  projects: Project[];
  initialStatus?: TaskStatus;
  initialProjectId?: string;
  initialDate?: string;
  onSaveTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  projects,
  initialStatus = 'todo',
  initialProjectId,
  initialDate,
  onSaveTask,
  onDeleteTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setProjectId(task.projectId || projects[0]?.id || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setEstimatedMinutes(task.estimatedMinutes || 60);
      setTags(task.tags || []);
      setSubtasks(task.subtasks || []);
      setNotes(task.notes || '');
    } else {
      setTitle('');
      setDescription('');
      setProjectId(initialProjectId || projects[0]?.id || '');
      setStatus(initialStatus);
      setPriority('medium');
      setDueDate(initialDate || new Date().toISOString().split('T')[0]);
      setEstimatedMinutes(60);
      setTags([]);
      setSubtasks([]);
      setNotes('');
    }
  }, [task, isOpen, initialStatus, initialProjectId, initialDate, projects]);

  if (!isOpen) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    setSubtasks([
      ...subtasks,
      {
        id: 'sub-' + Math.random().toString(36).substring(2, 9),
        title: newSubtaskTitle.trim(),
        completed: false,
      }
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const taskData: Task = {
      id: task ? task.id : 'task-' + Math.random().toString(36).substring(2, 9),
      projectId: projectId || projects[0]?.id || 'default',
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate,
      estimatedMinutes: Number(estimatedMinutes) || 0,
      timeSpentMinutes: task ? task.timeSpentMinutes : 0,
      tags,
      subtasks,
      notes: notes.trim(),
      createdAt: task ? task.createdAt : today,
      updatedAt: today,
    };

    onSaveTask(taskData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-amber-500 text-white p-4 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base uppercase tracking-wider">
              {task ? 'Edit Tugas' : 'Tambah Tugas Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
              Judul Tugas:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Selesaikan Prototipe Dashboard Analitik"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium focus:outline-hidden text-neutral-900 dark:text-neutral-100"
              required
            />
          </div>

          {/* Project & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
                Pilih Proyek:
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium focus:outline-hidden cursor-pointer text-neutral-800 dark:text-neutral-200"
                required
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
                Status:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium focus:outline-hidden cursor-pointer text-neutral-800 dark:text-neutral-200"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done (Selesai)</option>
              </select>
            </div>
          </div>

          {/* Priority & Due Date & Estimated Minutes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
                Prioritas:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium focus:outline-hidden cursor-pointer text-neutral-800 dark:text-neutral-200"
              >
                <option value="urgent">🚨 Urgent</option>
                <option value="high">⚡ High</option>
                <option value="medium">🎯 Medium</option>
                <option value="low">🌱 Low</option>
              </select>
            </div>

            <div>
              <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
                Tenggat (Deadline):
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium font-mono focus:outline-hidden text-neutral-800 dark:text-neutral-200"
              />
            </div>

            <div>
              <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
                Estimasi (Menit):
              </label>
              <input
                type="number"
                min="0"
                step="15"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium font-mono focus:outline-hidden text-neutral-800 dark:text-neutral-200"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
              Deskripsi:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail yang perlu diselesaikan..."
              rows={3}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-normal focus:outline-hidden text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Subtasks Checklist */}
          <div className="bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 space-y-2">
            <label className="block font-mono font-medium uppercase text-neutral-500">
              Checklist Subtask ({subtasks.length}):
            </label>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {subtasks.map((sub) => (
                <div 
                  key={sub.id} 
                  className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 rounded-lg text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 truncate">
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="accent-amber-500 cursor-pointer rounded"
                    />
                    <span className={sub.completed ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-200'}>
                      {sub.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="p-1 text-neutral-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Tambah langkah subtask..."
                className="flex-1 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-medium focus:outline-hidden text-neutral-900 dark:text-neutral-100"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold uppercase cursor-pointer"
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
              Tag / Label (Tekan Enter):
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-md text-[11px] font-mono px-2 py-0.5 flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="cursor-pointer hover:font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Ketik tag lalu tekan enter..."
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono font-medium focus:outline-hidden text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
            {task && onDeleteTask ? (
              confirmDelete ? (
                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">Yakin hapus?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteTask(task.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold uppercase rounded-md cursor-pointer"
                  >
                    Ya, Hapus
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 text-neutral-500 hover:text-neutral-700 text-[11px] font-medium cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold uppercase cursor-pointer"
                >
                  Hapus Tugas
                </button>
              )
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-semibold uppercase cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs text-xs font-bold uppercase cursor-pointer transition-colors"
              >
                Simpan Tugas
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
