import React, { useState } from 'react';
import { Project, Task, CalendarEvent } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Flag,
  Sparkles,
  X
} from 'lucide-react';

interface CalendarViewProps {
  projects: Project[];
  tasks: Task[];
  events: CalendarEvent[];
  onOpenTaskModal: (task?: Task, initialStatus?: any, initialProjectId?: string, initialDate?: string) => void;
  onAddEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  projects,
  tasks,
  events,
  onOpenTaskModal,
  onAddEvent,
  onDeleteEvent,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<'deadline' | 'meeting' | 'milestone' | 'sprint'>('milestone');
  const [newEventProject, setNewEventProject] = useState(projects[0]?.id || '');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const formatCellDate = (day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const selectedDateTasks = tasks.filter(t => t.dueDate === selectedDateStr);
  const selectedDateEvents = events.filter(e => e.date === selectedDateStr);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEv: CalendarEvent = {
      id: 'ev-' + Math.random().toString(36).substring(2, 9),
      title: newEventTitle.trim(),
      date: selectedDateStr,
      type: newEventType,
      projectId: newEventProject || undefined,
      color: newEventType === 'deadline' ? '#F43F5E' : newEventType === 'sprint' ? '#F59E0B' : '#06B6D4',
    };

    onAddEvent(newEv);
    setNewEventTitle('');
    setIsEventModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-md font-mono font-bold text-xs uppercase tracking-wider">
              KALENDER PROYEK //
            </span>
            <span className="text-xs font-mono text-neutral-500 font-medium">
              JADWAL & MILESTONE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <span>{monthNames[month]} {year}</span>
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Hari Ini
          </button>

          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-xl p-0.5">
            <button
              onClick={handlePrevMonth}
              title="Bulan sebelumnya"
              className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              title="Bulan berikutnya"
              className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => onOpenTaskModal(undefined, 'todo', undefined, selectedDateStr)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Jadwalkan Tugas</span>
            <span className="sm:hidden">Tugas</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar Grid & Date Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: Calendar Grid */}
        <div className="lg:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-5">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 text-center font-mono font-medium text-xs text-neutral-500 py-2 mb-2 border-b border-neutral-100 dark:border-neutral-800">
            {daysOfWeek.map((d, i) => (
              <div key={d} className={i === 0 ? 'text-rose-500 font-bold' : ''}>
                {d}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Blank cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div 
                key={`empty-${i}`} 
                className="min-h-[75px] sm:min-h-[95px] bg-neutral-50/40 dark:bg-neutral-950/20 rounded-xl opacity-30"
              />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = formatCellDate(dayNum);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDateStr;

              const dayTasks = tasks.filter(t => t.dueDate === dateStr);
              const dayEvents = events.filter(e => e.date === dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`min-h-[75px] sm:min-h-[95px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 shadow-xs' 
                      : isToday
                      ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30'
                      : 'border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-neutral-800/30 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {/* Date badge */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                      isToday 
                        ? 'bg-amber-500 text-white' 
                        : isSelected
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}>
                      {dayNum}
                    </span>

                    {(dayTasks.length > 0 || dayEvents.length > 0) && (
                      <span className="text-[10px] font-mono text-neutral-400 font-semibold tabular-nums">
                        {dayTasks.length + dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Tasks & Events preview list */}
                  <div className="mt-1 space-y-1 overflow-hidden flex-1">
                    {dayEvents.slice(0, 1).map(ev => (
                      <div 
                        key={ev.id}
                        className="text-[9px] font-bold truncate px-1.5 py-0.5 rounded font-mono bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                      >
                        ★ {ev.title}
                      </div>
                    ))}

                    {dayTasks.slice(0, 2).map(task => {
                      const proj = projects.find(p => p.id === task.projectId);
                      const isDone = task.status === 'done';
                      return (
                        <div
                          key={task.id}
                          className={`text-[9px] font-medium truncate px-1.5 py-0.5 rounded ${
                            isDone 
                              ? 'line-through bg-neutral-100 text-neutral-400 dark:bg-neutral-800' 
                              : 'bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200'
                          }`}
                          style={!isDone && proj ? { borderLeftWidth: '3px', borderLeftColor: proj.color } : {}}
                        >
                          {task.title}
                        </div>
                      );
                    })}

                    {dayTasks.length > 2 && (
                      <div className="text-[9px] font-mono text-neutral-400 text-right tabular-nums">
                        +{dayTasks.length - 2} lagi
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Date Agenda */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div className="text-[11px] font-mono font-medium uppercase text-neutral-400">
              AGENDA TANGGAL TERPILIH
            </div>
            <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
              {new Date(selectedDateStr).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenTaskModal(undefined, 'todo', undefined, selectedDateStr)}
              className="py-2 px-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Plus size={13} />
              <span>+ Tugas</span>
            </button>

            <button
              onClick={() => setIsEventModalOpen(true)}
              className="py-2 px-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Flag size={13} />
              <span>+ Milestone</span>
            </button>
          </div>

          {/* Milestone Events List */}
          <div>
            <div className="text-xs font-mono font-bold uppercase mb-2 flex items-center gap-1 text-neutral-500">
              <Sparkles size={13} className="text-amber-500" />
              <span>Milestone ({selectedDateEvents.length})</span>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="text-[11px] text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-center font-mono">
                Tidak ada milestone.
              </div>
            ) : (
              <div className="space-y-1.5">
                {selectedDateEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-neutral-100">{ev.title}</div>
                      <div className="text-[10px] font-mono uppercase text-neutral-400">{ev.type}</div>
                    </div>
                    <button
                      onClick={() => onDeleteEvent(ev.id)}
                      className="p-1 text-neutral-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks List */}
          <div>
            <div className="text-xs font-mono font-bold uppercase mb-2 flex items-center gap-1 text-neutral-500">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>Tugas Deadline ({selectedDateTasks.length})</span>
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="text-[11px] text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-center font-mono">
                Belum ada tugas terjadwal.
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {selectedDateTasks.map(task => {
                  const proj = projects.find(p => p.id === task.projectId);
                  const isDone = task.status === 'done';

                  return (
                    <div
                      key={task.id}
                      onClick={() => onOpenTaskModal(task)}
                      className={`p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition-all ${
                        isDone ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        {proj && (
                          <span 
                            className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded font-mono truncate"
                            style={{ backgroundColor: `${proj.color}25`, color: proj.color }}
                          >
                            {proj.icon} {proj.title}
                          </span>
                        )}
                        <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded font-mono ${
                          task.priority === 'urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      <div className={`font-semibold text-xs text-neutral-900 dark:text-neutral-100 ${isDone ? 'line-through text-neutral-400' : ''}`}>
                        {task.title}
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                        <span>{task.status}</span>
                        {task.estimatedMinutes > 0 && <span>{task.estimatedMinutes}m</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Add Milestone */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="bg-amber-500 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase">Tambah Milestone</h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-lg hover:bg-amber-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
                  Nama Milestone:
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Contoh: Rilis Beta v2.0"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium focus:outline-hidden text-neutral-900 dark:text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
                  Tipe Acara:
                </label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium focus:outline-hidden cursor-pointer text-neutral-800 dark:text-neutral-200"
                >
                  <option value="milestone">🎯 Milestone Utama</option>
                  <option value="sprint">⚡ Sprint / Review</option>
                  <option value="deadline">🚨 Batas Waktu Kritis</option>
                  <option value="meeting">📞 Pertemuan</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-medium uppercase text-neutral-500 mb-1">
                  Hubungkan dengan Proyek:
                </label>
                <select
                  value={newEventProject}
                  onChange={(e) => setNewEventProject(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium focus:outline-hidden cursor-pointer text-neutral-800 dark:text-neutral-200"
                >
                  <option value="">-- Tanpa Proyek --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.icon} {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-neutral-500 font-mono text-[11px] bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg border border-neutral-200 dark:border-neutral-700">
                Tanggal: <strong>{selectedDateStr}</strong>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold uppercase cursor-pointer transition-colors shadow-xs"
              >
                Simpan Milestone
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
