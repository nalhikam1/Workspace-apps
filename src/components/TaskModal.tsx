import React, { useState, useEffect } from 'react';
import { Project, Task, TaskStatus, Priority, Subtask } from '../types';
import { X, Plus, Trash2, CheckCircle2, Clock, Calendar, Tag, FileText } from 'lucide-react';

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

  useEffect(() => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFDF5] border-3 border-black shadow-[8px_8px_0_0_#000] w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#FFE600] border-b-3 border-black p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h2 className="font-black text-lg uppercase tracking-wider">
              {task ? 'Edit Tugas Planner' : 'Tambah Tugas Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono font-black uppercase mb-1">
              Judul Tugas:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Selesaikan Prototipe Dashboard Analitik"
              className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-sm focus:outline-hidden focus:bg-amber-50"
              required
            />
          </div>

          {/* Project & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-black uppercase mb-1">
                Pilih Proyek:
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-xs focus:outline-hidden cursor-pointer"
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
              <label className="block text-xs font-mono font-black uppercase mb-1">
                Status Kolom:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-xs focus:outline-hidden cursor-pointer"
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
              <label className="block text-xs font-mono font-black uppercase mb-1">
                Tingkat Prioritas:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="urgent">🚨 Urgent</option>
                <option value="high">⚡ High</option>
                <option value="medium">🎯 Medium</option>
                <option value="low">🌱 Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase mb-1">
                Tenggat (Due Date):
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-xs font-mono focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase mb-1">
                Estimasi (Menit):
              </label>
              <input
                type="number"
                min="0"
                step="15"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-xs font-mono focus:outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-black uppercase mb-1">
              Deskripsi Tugas:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail yang perlu diselesaikan..."
              rows={3}
              className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-medium text-xs focus:outline-hidden focus:bg-amber-50"
            />
          </div>

          {/* Subtasks Checklist */}
          <div className="bg-white border-2 border-black p-3.5 shadow-[3px_3px_0_0_#000]">
            <label className="block text-xs font-mono font-black uppercase mb-2">
              Subtask & Langkah Pengerjaan ({subtasks.length}):
            </label>

            {/* List of subtasks */}
            <div className="space-y-1.5 mb-2.5 max-h-40 overflow-y-auto">
              {subtasks.map((sub) => (
                <div 
                  key={sub.id} 
                  className="flex items-center justify-between gap-2 p-1.5 bg-[#FFFDF5] border border-black text-xs font-bold"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 truncate">
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="accent-black cursor-pointer"
                    />
                    <span className={sub.completed ? 'line-through text-black/50' : 'text-black'}>
                      {sub.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="p-1 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask input */}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Tambah langkah subtask..."
                className="flex-1 px-2.5 py-1.5 bg-[#FFFDF5] border border-black text-xs font-bold focus:outline-hidden"
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
                className="px-3 py-1.5 bg-[#00F0FF] hover:bg-cyan-300 border border-black text-xs font-black uppercase cursor-pointer"
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-mono font-black uppercase mb-1">
              Tag / Label (Tekan Enter):
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#FFE600] border border-black text-[11px] font-mono font-black px-2 py-0.5 flex items-center gap-1 shadow-[1px_1px_0_0_#000]"
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
              placeholder="Ketik tag lalu tekan enter (cth: UI, Urgent, Sprint)..."
              className="w-full px-3 py-1.5 bg-white border-2 border-black text-xs font-mono font-bold focus:outline-hidden"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t-2 border-black flex items-center justify-between gap-2">
            {task && onDeleteTask ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Yakin ingin menghapus tugas ini?')) {
                    onDeleteTask(task.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 border-2 border-black text-red-700 text-xs font-black uppercase cursor-pointer"
              >
                Hapus Tugas
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-slate-100 border-2 border-black text-xs font-bold uppercase cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#FFE600] hover:bg-[#ffe033] border-3 border-black shadow-[3px_3px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 text-xs font-black uppercase cursor-pointer"
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
