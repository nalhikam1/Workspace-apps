import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { X, Trash2, FolderPlus, Palette } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSaveProject: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}

const PROJECT_ICONS = ['🚀', '⚡', '🛡️', '🎯', '🎨', '💼', '💡', '🔥', '⚙️', '📱', '🌐', '📊'];
const PROJECT_COLORS = ['#FFE600', '#00F0FF', '#FF6AC2', '#00E599', '#FF7A00', '#A78BFA', '#F43F5E', '#38BDF8'];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaveProject,
  onDeleteProject,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#FFE600');
  const [icon, setIcon] = useState('🚀');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [deadline, setDeadline] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || '');
      setColor(project.color || '#FFE600');
      setIcon(project.icon || '🚀');
      setStatus(project.status || 'active');
      setDeadline(project.deadline || '');
      setTags(project.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setColor('#FFE600');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFDF5] border-3 border-black shadow-[8px_8px_0_0_#000] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div 
          className="border-b-3 border-black p-4 flex items-center justify-between"
          style={{ backgroundColor: color }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h2 className="font-black text-lg uppercase tracking-wider text-black">
              {project ? 'Pengaturan Proyek' : 'Buat Proyek Baru'}
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
          <div>
            <label className="block text-xs font-mono font-black uppercase mb-1">
              Nama Proyek:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Redesign Aplikasi Web Neo-Brutalist"
              className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-sm focus:outline-hidden focus:bg-amber-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase mb-1">
              Deskripsi Proyek:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Target dan ruang lingkup pengerjaan..."
              rows={2}
              className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-medium text-xs focus:outline-hidden focus:bg-amber-50"
            />
          </div>

          {/* Icon & Color Selector */}
          <div className="bg-white border-2 border-black p-3.5 shadow-[3px_3px_0_0_#000] space-y-3">
            <div>
              <label className="block text-xs font-mono font-black uppercase mb-1.5">
                Pilih Icon Proyek:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PROJECT_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`w-8 h-8 border-2 border-black flex items-center justify-center text-lg cursor-pointer ${
                      icon === ic ? 'bg-black text-white' : 'bg-white hover:bg-slate-100'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase mb-1.5">
                Pilih Warna Aksen Proyek:
              </label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 border-2 border-black cursor-pointer transition-transform ${
                      color === c ? 'scale-115 ring-2 ring-black' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Status & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-black uppercase mb-1">
                Status Proyek:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="active">Active (Sedang Berjalan)</option>
                <option value="completed">Completed (Selesai)</option>
                <option value="on_hold">On Hold (Ditunda)</option>
                <option value="archived">Archived (Diarsipkan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase mb-1">
                Target Deadline:
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-xs font-mono focus:outline-hidden"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t-2 border-black flex items-center justify-between gap-2">
            {project && onDeleteProject ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Yakin ingin menghapus proyek "${project.title}"? Semua tugas terkait akan tetap disimpan.`)) {
                    onDeleteProject(project.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 border-2 border-black text-red-700 text-xs font-black uppercase cursor-pointer"
              >
                Hapus Proyek
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
                Simpan Proyek
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
