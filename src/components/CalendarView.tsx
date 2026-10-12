import React, { useState } from 'react';
import { Project, Task, CalendarEvent } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
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

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigation handlers
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

  // Helper to format date string YYYY-MM-DD
  const formatCellDate = (day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Selected date tasks and events
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
      color: newEventType === 'deadline' ? '#FF6AC2' : newEventType === 'sprint' ? '#FFE600' : '#00F0FF',
    };

    onAddEvent(newEv);
    setNewEventTitle('');
    setIsEventModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Bar */}
      <div className="bg-[#FFFDF5] border-3 border-black p-4 sm:p-5 shadow-[5px_5px_0_0_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FF6AC2] px-2 py-0.5 border-2 border-black font-mono font-bold text-xs uppercase shadow-[2px_2px_0_0_#000]">
              KALENDER PROYEK //
            </span>
            <span className="text-xs font-mono text-black/60 font-bold">
              TIMELINE KERJA & MILESTONE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-2">
            <span>{monthNames[month]} {year}</span>
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-white hover:bg-amber-50 border-2 border-black shadow-[2px_2px_0_0_#000] text-xs font-black uppercase cursor-pointer"
          >
            Hari Ini
          </button>

          <div className="flex border-2 border-black bg-white shadow-[2px_2px_0_0_#000]">
            <button
              onClick={handlePrevMonth}
              title="Bulan sebelumnya"
              className="p-1.5 hover:bg-slate-100 cursor-pointer border-r border-black"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextMonth}
              title="Bulan berikutnya"
              className="p-1.5 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={() => onOpenTaskModal(undefined, 'todo', undefined, selectedDateStr)}
            className="px-3 py-1.5 bg-[#FFE600] hover:bg-[#ffe033] border-2 border-black shadow-[3px_3px_0_0_#000] text-xs font-black uppercase flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <Plus size={15} strokeWidth={3} />
            <span className="hidden sm:inline">Jadwalkan Tugas</span>
            <span className="sm:hidden">Tugas</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar Grid & Date Details Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: 3 cols Calendar Grid */}
        <div className="lg:col-span-3 bg-white border-3 border-black shadow-[6px_6px_0_0_#000] p-4 sm:p-5">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-2 border-black bg-[#FFE600] text-center font-black text-xs font-mono py-2 mb-2">
            {daysOfWeek.map((d, i) => (
              <div key={d} className={i === 0 ? 'text-red-700' : ''}>
                {d}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Blank cells for offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div 
                key={`empty-${i}`} 
                className="min-h-[75px] sm:min-h-[95px] bg-zinc-100/60 border border-black/20 opacity-40 p-1"
              />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = formatCellDate(dayNum);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDateStr;

              // Find tasks for this day
              const dayTasks = tasks.filter(t => t.dueDate === dateStr);
              // Find events for this day
              const dayEvents = events.filter(e => e.date === dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`min-h-[75px] sm:min-h-[95px] p-1.5 border-2 border-black transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isSelected 
                      ? 'ring-3 ring-black bg-amber-50 shadow-[3px_3px_0_0_#000] -translate-y-0.5 z-10' 
                      : isToday
                      ? 'bg-[#FFE600]/30 shadow-[2px_2px_0_0_#000]'
                      : 'bg-white hover:bg-slate-50 shadow-[1px_1px_0_0_#000]'
                  }`}
                >
                  {/* Date badge */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black font-mono px-1 border border-black ${
                      isToday ? 'bg-black text-[#FFE600]' : 'bg-white text-black'
                    }`}>
                      {dayNum}
                    </span>

                    {/* Count chips */}
                    {(dayTasks.length > 0 || dayEvents.length > 0) && (
                      <span className="text-[10px] font-mono font-bold text-black/70">
                        {dayTasks.length + dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Tasks & Events preview list */}
                  <div className="mt-1 space-y-1 overflow-hidden flex-1">
                    {/* Events first */}
                    {dayEvents.slice(0, 1).map(ev => (
                      <div 
                        key={ev.id}
                        className="text-[9px] font-black truncate px-1 border border-black font-mono"
                        style={{ backgroundColor: ev.color || '#00F0FF' }}
                      >
                        ★ {ev.title}
                      </div>
                    ))}

                    {/* Tasks */}
                    {dayTasks.slice(0, 2).map(task => {
                      const proj = projects.find(p => p.id === task.projectId);
                      const isDone = task.status === 'done';
                      return (
                        <div
                          key={task.id}
                          className={`text-[9px] font-bold truncate px-1 border border-black ${
                            isDone ? 'line-through bg-zinc-200 opacity-60' : 'bg-white'
                          }`}
                          style={!isDone && proj ? { borderLeftWidth: '4px', borderLeftColor: proj.color } : {}}
                        >
                          {task.title}
                        </div>
                      );
                    })}

                    {dayTasks.length > 2 && (
                      <div className="text-[9px] font-mono font-bold text-black/50 text-right">
                        +{dayTasks.length - 2} lagi
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Date Agenda Details */}
        <div className="bg-[#FFFDF5] border-3 border-black p-5 shadow-[6px_6px_0_0_#000] space-y-4">
          <div className="border-b-2 border-black pb-3">
            <div className="text-[11px] font-mono font-black uppercase text-black/60">
              AGENDA TANGGAL TERPILIH
            </div>
            <div className="text-xl font-black mt-1">
              {new Date(selectedDateStr).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Quick Actions for this Date */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenTaskModal(undefined, 'todo', undefined, selectedDateStr)}
              className="py-1.5 px-2 bg-[#FFE600] hover:bg-[#ffe033] border-2 border-black shadow-[2px_2px_0_0_#000] text-[11px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus size={13} strokeWidth={3} />
              <span>+ Tugas</span>
            </button>

            <button
              onClick={() => setIsEventModalOpen(true)}
              className="py-1.5 px-2 bg-[#00F0FF] hover:bg-cyan-300 border-2 border-black shadow-[2px_2px_0_0_#000] text-[11px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer"
            >
              <Flag size={13} />
              <span>+ Milestone</span>
            </button>
          </div>

          {/* Milestone Events List */}
          <div>
            <div className="text-xs font-mono font-black uppercase mb-2 flex items-center gap-1 text-black/70">
              <Sparkles size={13} />
              <span>Milestone & Acara ({selectedDateEvents.length})</span>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="text-[11px] text-black/50 border border-dashed border-black/30 p-2 text-center font-mono">
                Tidak ada milestone di tanggal ini.
              </div>
            ) : (
              <div className="space-y-1.5">
                {selectedDateEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="p-2 border-2 border-black flex items-center justify-between text-xs font-bold shadow-[2px_2px_0_0_#000]"
                    style={{ backgroundColor: ev.color || '#00F0FF' }}
                  >
                    <div>
                      <div className="font-black text-xs">{ev.title}</div>
                      <div className="text-[10px] font-mono uppercase opacity-75">Tipe: {ev.type}</div>
                    </div>
                    <button
                      onClick={() => onDeleteEvent(ev.id)}
                      className="p-1 hover:bg-black hover:text-white transition-colors cursor-pointer text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks List */}
          <div>
            <div className="text-xs font-mono font-black uppercase mb-2 flex items-center gap-1 text-black/70">
              <CheckCircle2 size={13} />
              <span>Tugas Deadline ({selectedDateTasks.length})</span>
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="text-[11px] text-black/50 border border-dashed border-black/30 p-3 text-center font-mono">
                Belum ada tugas terjadwal pada tanggal ini.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {selectedDateTasks.map(task => {
                  const proj = projects.find(p => p.id === task.projectId);
                  const isDone = task.status === 'done';

                  return (
                    <div
                      key={task.id}
                      onClick={() => onOpenTaskModal(task)}
                      className={`p-2.5 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] cursor-pointer hover:-translate-y-0.5 transition-transform ${
                        isDone ? 'opacity-65' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        {proj && (
                          <span 
                            className="text-[9px] font-black uppercase px-1 border border-black font-mono truncate"
                            style={{ backgroundColor: proj.color }}
                          >
                            {proj.icon} {proj.title}
                          </span>
                        )}
                        <span className={`text-[9px] font-bold uppercase px-1 border border-black font-mono ${
                          task.priority === 'urgent' ? 'bg-[#FF6AC2]' : 'bg-zinc-100'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      <div className={`font-black text-xs ${isDone ? 'line-through text-black/60' : 'text-black'}`}>
                        {task.title}
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-black/60">
                        <span>Status: {task.status}</span>
                        {task.estimatedMinutes > 0 && <span>Est: {task.estimatedMinutes}m</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Add Milestone / Calendar Event */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF5] border-3 border-black shadow-[8px_8px_0_0_#000] w-full max-w-sm">
            <div className="bg-[#00F0FF] border-b-3 border-black p-4 flex items-center justify-between">
              <h3 className="font-black text-base uppercase">Tambah Milestone Kalender</h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 bg-white border-2 border-black hover:bg-black hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-mono font-black uppercase mb-1">
                  Nama Milestone / Acara:
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Contoh: Sprint Review & Demo ke Klien"
                  className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-xs focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-black uppercase mb-1">
                  Tipe Acara:
                </label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="milestone">🎯 Milestone Utama</option>
                  <option value="sprint">⚡ Sprint / Rapat Tim</option>
                  <option value="deadline">🚨 Batas Waktu Kritis</option>
                  <option value="meeting">📞 Pertemuan Eksternal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-black uppercase mb-1">
                  Hubungkan dengan Proyek (Opsional):
                </label>
                <select
                  value={newEventProject}
                  onChange={(e) => setNewEventProject(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-bold text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="">-- Tanpa Proyek Spesifik --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.icon} {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs font-mono text-black/70 font-bold bg-amber-50 p-2 border border-black">
                Tanggal: <strong>{selectedDateStr}</strong>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#00E599] hover:bg-emerald-400 border-2 border-black shadow-[3px_3px_0_0_#000] font-black text-xs uppercase cursor-pointer"
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
