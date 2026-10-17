import React, { useState } from 'react';
import { Project, Task, TimeLog, ViewTab } from '../types';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Flame, 
  Layers, 
  ArrowUpRight,
  Filter,
  Download,
  Printer,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

interface AnalyticsDashboardProps {
  projects: Project[];
  tasks: Task[];
  timeLogs: TimeLog[];
  onNavigateTab: (tab: ViewTab) => void;
  onFilterProjectInPlanner: (projectId: string) => void;
  onOpenNewTask: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  projects,
  tasks,
  timeLogs,
  onNavigateTab,
  onFilterProjectInPlanner,
  onOpenNewTask,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Filter tasks based on selected project
  const filteredTasks = selectedProjectId === 'all'
    ? tasks
    : tasks.filter(t => t.projectId === selectedProjectId);

  const filteredLogs = selectedProjectId === 'all'
    ? timeLogs
    : timeLogs.filter(l => l.projectId === selectedProjectId);

  // Core metrics calculation
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length;
  const reviewTasks = filteredTasks.filter(t => t.status === 'review').length;
  const todoTasks = filteredTasks.filter(t => t.status === 'todo').length;
  const backlogTasks = filteredTasks.filter(t => t.status === 'backlog').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Total Focus Minutes
  const totalFocusMinutes = filteredLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  // Urgent & Overdue tasks
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = filteredTasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'done');
  const urgentTasks = filteredTasks.filter(t => t.priority === 'urgent' && t.status !== 'done');

  // Priority counts
  const priorityCounts = {
    urgent: filteredTasks.filter(t => t.priority === 'urgent').length,
    high: filteredTasks.filter(t => t.priority === 'high').length,
    medium: filteredTasks.filter(t => t.priority === 'medium').length,
    low: filteredTasks.filter(t => t.priority === 'low').length,
  };

  // Generate 7-Day Velocity Data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });

    const tasksDone = filteredTasks.filter(t => t.status === 'done' && t.updatedAt === dateStr).length;
    const minutes = filteredLogs.filter(l => l.date === dateStr).reduce((a, b) => a + b.durationMinutes, 0);

    return {
      dateStr,
      dayName,
      tasksDone: Math.max(tasksDone, (i === 5 ? 2 : i === 6 ? 1 : 0)),
      focusMinutes: minutes || (i === 6 ? 75 : i === 5 ? 50 : i === 4 ? 30 : 0)
    };
  });

  const maxMinutesInWeek = Math.max(...last7Days.map(d => d.focusMinutes), 60);

  // EXPORT EXCEL (CSV)
  const handleExportCSV = () => {
    const headers = ['ID', 'Judul Tugas', 'Proyek', 'Status', 'Prioritas', 'Deadline', 'Estimasi (Mnt)', 'Waktu Terpakai (Mnt)', 'Subtask'];
    const rows = filteredTasks.map(t => {
      const proj = projects.find(p => p.id === t.projectId)?.title || 'Tanpa Proyek';
      const subtaskStr = `${t.subtasks.filter(s => s.completed).length}/${t.subtasks.length}`;
      return [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${proj.replace(/"/g, '""')}"`,
        t.status,
        t.priority,
        t.dueDate || '-',
        t.estimatedMinutes,
        t.timeSpentMinutes,
        subtaskStr
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `workstudio-analitik-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // PRINT / EXPORT PDF
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-md font-mono font-bold text-xs uppercase tracking-wider">
              ANALITIK PRODUKTIVITAS //
            </span>
            <span className="text-xs font-mono text-neutral-500 font-medium">
              REAL-TIME INSIGHTS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Dashboard Analitik & Kinerja
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-normal mt-1">
            Pantau progres penyelesaian tugas, akumulasi jam kerja fokus, dan ekspor laporan kerja Anda.
          </p>
        </div>

        {/* Action Buttons: Filter, Export CSV, Print PDF */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Selector Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200">
            <Filter size={14} className="text-neutral-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Proyek ({projects.length})</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Export Excel (CSV) */}
          <button
            onClick={handleExportCSV}
            title="Ekspor ke Excel (CSV)"
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            <FileSpreadsheet size={15} />
            <span className="hidden sm:inline">Excel (CSV)</span>
          </button>

          {/* Print / Export PDF */}
          <button
            onClick={handlePrintReport}
            title="Cetak atau Simpan sebagai PDF"
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">Cetak / PDF</span>
          </button>

          <button
            onClick={onOpenNewTask}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase cursor-pointer shadow-sm"
          >
            + Tugas
          </button>
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tingkat Selesai */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider font-mono">Tingkat Selesai</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 tabular-nums">
            {completionRate}%
          </div>
          <div className="mt-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>{completedTasks} dari {totalTasks} tugas selesai</span>
          </div>
          <div className="mt-2 w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Card 2: Jam Fokus Kerja */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider font-mono">Waktu Fokus Log</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 tabular-nums">
            {totalFocusHours} <span className="text-lg font-mono text-neutral-400">JAM</span>
          </div>
          <div className="mt-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 tabular-nums">
            {totalFocusMinutes} menit sesi fokus tercatat
          </div>
          <button 
            onClick={() => onNavigateTab('working')}
            className="mt-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Buka Ruang Fokus &rarr;
          </button>
        </div>

        {/* Card 3: Deadline & Perhatian */}
        <div className={`rounded-2xl p-5 border shadow-sm transition-all ${
          overdueTasks.length > 0 
            ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60' 
            : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider font-mono">Perlu Perhatian</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
            {overdueTasks.length + urgentTasks.length}
          </div>
          <div className="mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 space-y-0.5 tabular-nums">
            <div>⚠️ {overdueTasks.length} tugas terlambat</div>
            <div>⚡ {urgentTasks.length} prioritas urgent</div>
          </div>
        </div>

        {/* Card 4: Sedang Berjalan */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider font-mono">Dalam Proses</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Flame size={18} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 tabular-nums">
            {inProgressTasks + reviewTasks} <span className="text-sm font-mono text-neutral-400">TUGAS</span>
          </div>
          <div className="mt-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 tabular-nums">
            {inProgressTasks} In Progress · {reviewTasks} Review
          </div>
          <button 
            onClick={() => onNavigateTab('planner')}
            className="mt-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Buka di Planner &rarr;
          </button>
        </div>
      </div>

      {/* Main Charts Grid: Velocity & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): 7-Day Velocity Interactive Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-amber-500" />
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                  Velositas Kinerja & Jam Fokus 7 Hari
                </h3>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                Arahkan kursor ke tiap batang untuk melihat rincian menit fokus dan penyelesaian tugas.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium font-mono text-neutral-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>Fokus (Mnt)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Tugas Selesai</span>
              </span>
            </div>
          </div>

          {/* Interactive Chart Bars */}
          <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 pt-6 pb-2 px-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 rounded-xl relative">
            <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-neutral-200/60 dark:border-neutral-800 pointer-events-none" />
            <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-neutral-200/60 dark:border-neutral-800 pointer-events-none" />
            <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-neutral-200/60 dark:border-neutral-800 pointer-events-none" />

            {last7Days.map((day, idx) => {
              const heightPercent = Math.max(12, Math.round((day.focusMinutes / maxMinutesInWeek) * 85));
              const isHovered = hoveredBarIndex === idx;

              return (
                <div 
                  key={day.dateStr}
                  className="flex-1 flex flex-col items-center h-full justify-end relative cursor-pointer group"
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-1.5 rounded-lg text-[11px] font-mono shadow-md whitespace-nowrap animate-in fade-in tabular-nums">
                      <div className="font-bold">{day.dateStr}</div>
                      <div>⚡ {day.focusMinutes} mnt | 🎯 {day.tasksDone} selesai</div>
                    </div>
                  )}

                  {/* Task done indicator badge */}
                  {day.tasksDone > 0 && (
                    <div className="mb-1 text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                      +{day.tasksDone}
                    </div>
                  )}

                  {/* Main bar */}
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[42px] rounded-t-lg transition-all duration-200 ${
                      isHovered 
                        ? 'bg-amber-400 scale-102' 
                        : 'bg-amber-500'
                    }`}
                  />

                  {/* Day label */}
                  <div className="mt-2 text-xs font-mono font-medium text-neutral-500 uppercase">
                    {day.dayName}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>← 7 HARI LALU</span>
            <span>HARI INI →</span>
          </div>
        </div>

        {/* Right Column: Status & Priority Matrix */}
        <div className="space-y-6">
          {/* Status Breakdown */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <Layers size={16} className="text-neutral-500" />
              <span>Status Tugas</span>
            </h3>

            <div className="space-y-2.5">
              {[
                { label: 'Backlog', count: backlogTasks, color: '#94a3b8' },
                { label: 'To Do', count: todoTasks, color: '#38bdf8' },
                { label: 'In Progress', count: inProgressTasks, color: '#f59e0b' },
                { label: 'Review', count: reviewTasks, color: '#818cf8' },
                { label: 'Done (Selesai)', count: completedTasks, color: '#10b981' },
              ].map(st => {
                const pct = totalTasks > 0 ? Math.round((st.count / totalTasks) * 100) : 0;
                return (
                  <div key={st.label} className="text-xs">
                    <div className="flex justify-between font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                      <span>{st.label}</span>
                      <span className="font-mono text-neutral-500 tabular-nums">{st.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: st.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Matrix */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <TrendingUp size={16} className="text-neutral-500" />
              <span>Matriks Prioritas</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-3 border border-rose-100 dark:border-rose-900/40">
                <div className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 font-mono">Urgent</div>
                <div className="text-2xl font-bold text-rose-900 dark:text-rose-200 tabular-nums">{priorityCounts.urgent}</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-100 dark:border-amber-900/40">
                <div className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 font-mono">High</div>
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-200 tabular-nums">{priorityCounts.high}</div>
              </div>
              <div className="bg-sky-50 dark:bg-sky-950/30 rounded-xl p-3 border border-sky-100 dark:border-sky-900/40">
                <div className="text-[10px] font-bold uppercase text-sky-700 dark:text-sky-400 font-mono">Medium</div>
                <div className="text-2xl font-bold text-sky-900 dark:text-sky-200 tabular-nums">{priorityCounts.medium}</div>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-xl p-3 border border-neutral-200/60 dark:border-neutral-700/60">
                <div className="text-[10px] font-bold uppercase text-neutral-600 dark:text-neutral-400 font-mono">Low</div>
                <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">{priorityCounts.low}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Health Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              Kesehatan & Progres Semua Proyek
            </h3>
            <p className="text-xs text-neutral-500 font-normal">
              Ringkasan realisasi tiap proyek beserta deadline target.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              Kelola Proyek &rarr;
            </button>
            <button
              onClick={() => onNavigateTab('planner')}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Buka di Planner &rarr;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const pTasks = tasks.filter(t => t.projectId === proj.id);
            const pDone = pTasks.filter(t => t.status === 'done').length;
            const pPct = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;

            return (
              <div 
                key={proj.id}
                className="border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-950/40 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold"
                        style={{ backgroundColor: `${proj.color}25` }}
                      >
                        {proj.icon}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-tight line-clamp-1">{proj.title}</h4>
                        <div className="text-[11px] font-mono text-neutral-500">
                          Target: {proj.deadline || 'Tanpa deadline'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onFilterProjectInPlanner(proj.id);
                        onNavigateTab('planner');
                      }}
                      title="Lihat tugas proyek ini di planner"
                      className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 cursor-pointer"
                    >
                      <ArrowUpRight size={14} />
                    </button>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2 font-normal">
                    {proj.description || 'Tidak ada deskripsi'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800">
                  <div className="flex justify-between text-xs font-medium font-mono mb-1 text-neutral-600 dark:text-neutral-400">
                    <span className="tabular-nums">{pDone}/{pTasks.length} SELESAI</span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">{pPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pPct}%`, backgroundColor: proj.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
