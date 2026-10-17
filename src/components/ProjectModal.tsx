import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { X, Trash2, FolderPlus } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSaveProject: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}

const PROJECT_ICONS = ['🚀', '⚡', '🛡️', '🎯', '🎨', '💼', '💡', '🔥', '⚙️', '📱', '🌐', '📊'];
const PROJECT_COLORS = ['#F59E0B', '#06B6D4', '#EC4899', '#10B981', '#F97316', '#8B5CF6', '#F43F5E', '#3B82F6'];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaveProject,
  onDeleteProject,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#F59E0B');
  const [icon, setIcon] = useState('🚀');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [deadline, setDeadline] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
    if (project) {
      setTitle(project.title);
      setDescription(project.description || '');
      setColor(project.color || '#F59E0B');
      setIcon(project.icon || '🚀');
      setStatus(project.status || 'active');
      setDeadline(project.deadline || '');
      setTags(project.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setColor('#F59E0B');
      setIcon('🚀');
      setStatus('active');
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      setDeadline(nextMonth.toISOString().split('T')[0]);
      setTags(['Sprint']);
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const projectData: Project = {
      id: project ? project.id : 'proj-' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      description: description.trim(),
      color,
      icon,
      status,
      deadline,
      tags,
      createdAt: project ? project.createdAt : today,
      updatedAt: today,
    };

    onSaveProject(projectData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div 
          className="p-4 flex items-center justify-between rounded-t-2xl border-b border-neutral-100 dark:border-neutral-800"
          style={{ backgroundColor: `${color}20` }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{icon}</span>
            <h2 className="font-bold text-base text-neutral-900 dark:text-neutral-100 tracking-tight">
              {project ? 'Pengaturan Proyek' : 'Buat Proyek Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
              Nama Proyek:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Redesign Aplikasi Web"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium focus:outline-hidden text-neutral-900 dark:text-neutral-100"
              required
            />
          </div>

          <div>
            <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
              Deskripsi Proyek:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Target dan ruang lingkup pengerjaan..."
              rows={2}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-normal focus:outline-hidden text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Icon & Color Selector */}
          <div className="bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 space-y-3">
            <div>
              <label className="block font-mono font-medium uppercase text-neutral-500 mb-1.5">
                Pilih Icon Proyek:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PROJECT_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg cursor-pointer transition-all ${
                      icon === ic ? 'bg-amber-500 text-white shadow-xs' : 'bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-mono font-medium uppercase text-neutral-500 mb-1.5">
                Pilih Warna Aksen:
              </label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                      color === c ? 'scale-115 ring-2 ring-neutral-900 dark:ring-white ring-offset-2' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Status & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
                Status Proyek:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium focus:outline-hidden cursor-pointer text-neutral-800 dark:text-neutral-200"
              >
                <option value="active">Active (Sedang Berjalan)</option>
                <option value="completed">Completed (Selesai)</option>
                <option value="on_hold">On Hold (Ditunda)</option>
                <option value="archived">Archived (Diarsipkan)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
                Target Deadline:
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium font-mono focus:outline-hidden text-neutral-800 dark:text-neutral-200"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
            {project && onDeleteProject ? (
              confirmDelete ? (
                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">Yakin hapus?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteProject(project.id);
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
                  Hapus Proyek
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
                Simpan Proyek
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
