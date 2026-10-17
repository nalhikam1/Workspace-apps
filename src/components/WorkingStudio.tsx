import React, { useState, useEffect } from 'react';
import { Project, Task, TimeLog, ViewTab } from '../types';
import confetti from 'canvas-confetti';
import { SoundEffects } from '../services/soundEffects';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Coffee, 
  CloudRain, 
  Wind, 
  Music, 
  Save, 
  Clock, 
  FileText, 
  ListTodo, 
  Sliders, 
  Settings2
} from 'lucide-react';

interface WorkingStudioProps {
  projects: Project[];
  tasks: Task[];
  activeTask: Task | null;
  onSelectActiveTask: (task: Task | null) => void;
  onUpdateTask: (task: Task) => void;
  onLogTime: (timeLog: TimeLog) => void;
  scratchpad: string;
  onSaveScratchpad: (content: string) => void;
  onNavigateTab: (tab: ViewTab) => void;
}

type TimerMode = 'pomodoro' | 'short_break' | 'long_break' | 'stopwatch';

export const WorkingStudio: React.FC<WorkingStudioProps> = ({
  projects,
  tasks,
  activeTask,
  onSelectActiveTask,
  onUpdateTask,
  onLogTime,
  scratchpad,
  onSaveScratchpad,
  onNavigateTab,
}) => {
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [customMinutes, setCustomMinutes] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [localScratchpad, setLocalScratchpad] = useState<string>(scratchpad);
  const [scratchpadSavedNotice, setScratchpadSavedNotice] = useState<boolean>(false);

  // Ambient sound player state
  const [ambientMode, setAmbientMode] = useState<'rain' | 'cafe' | 'whitenoise' | 'lofi' | null>(null);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);

  // Switch timer mode
  const switchMode = (mode: TimerMode, durationMins?: number) => {
    setIsRunning(false);
    setTimerMode(mode);

    if (mode === 'stopwatch') {
      setStopwatchSeconds(0);
    } else {
      let targetMins = durationMins || 25;
      if (mode === 'short_break') targetMins = 5;
      if (mode === 'long_break') targetMins = 15;
      if (mode === 'pomodoro') targetMins = durationMins || customMinutes;

      setCustomMinutes(targetMins);
      setTimeLeft(targetMins * 60);
    }
  };

  // Change custom minutes freely without limits
  const handleCustomMinutesChange = (newMinutes: number) => {
    const mins = Math.max(1, Math.floor(newMinutes));
    setCustomMinutes(mins);
    if (timerMode === 'pomodoro') {
      setIsRunning(false);
      setTimeLeft(mins * 60);
    }
  };

  // Timer interval
  useEffect(() => {
    let interval: any = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (timerMode === 'stopwatch') {
          setStopwatchSeconds(prev => prev + 1);
        } else {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsRunning(false);
              SoundEffects.playCompletionChime();
              
              try {
                confetti({
                  particleCount: 60,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#F59E0B', '#10B981', '#6366F1']
                });
              } catch {}

              // Auto-log completed session if active task
              if (activeTask && timerMode === 'pomodoro') {
                const log: TimeLog = {
                  id: 'log-' + Math.random().toString(36).substring(2, 9),
                  taskId: activeTask.id,
                  projectId: activeTask.projectId,
                  durationMinutes: customMinutes,
                  date: new Date().toISOString().split('T')[0],
                  mode: 'pomodoro',
                  note: `Sesi Fokus ${customMinutes} Menit Selesai`,
                  createdAt: new Date().toISOString(),
                };
                onLogTime(log);
                onUpdateTask({
                  ...activeTask,
                  timeSpentMinutes: (activeTask.timeSpentMinutes || 0) + customMinutes,
                  updatedAt: new Date().toISOString().split('T')[0]
                });
              }

              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerMode, activeTask, customMinutes]);

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Manual log time from stopwatch
  const handleLogStopwatchTime = () => {
    if (!activeTask || stopwatchSeconds < 30) return;
    const minutes = Math.max(1, Math.round(stopwatchSeconds / 60));

    const log: TimeLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      taskId: activeTask.id,
      projectId: activeTask.projectId,
      durationMinutes: minutes,
      date: new Date().toISOString().split('T')[0],
      mode: 'stopwatch',
      note: `Waktu kerja manual tercatat: ${minutes} menit`,
      createdAt: new Date().toISOString(),
    };

    onLogTime(log);
    onUpdateTask({
      ...activeTask,
      timeSpentMinutes: (activeTask.timeSpentMinutes || 0) + minutes,
      updatedAt: new Date().toISOString().split('T')[0]
    });

    setStopwatchSeconds(0);
    setIsRunning(false);
    SoundEffects.playCompletionChime();
  };

  // Scratchpad save
  const handleSaveScratchpad = () => {
    onSaveScratchpad(localScratchpad);
    setScratchpadSavedNotice(true);
    setTimeout(() => setScratchpadSavedNotice(false), 2000);
  };

  // Subtask checkbox
  const handleToggleSubtask = (subId: string) => {
    if (!activeTask) return;
    const updatedSubtasks = activeTask.subtasks.map(s => 
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
    
    const updated: Task = {
      ...activeTask,
      subtasks: updatedSubtasks,
      status: allDone ? 'done' : activeTask.status,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateTask(updated);

    if (allDone && activeTask.status !== 'done') {
      SoundEffects.playCompletionChime();
      try {
        confetti({ particleCount: 40, spread: 50, colors: ['#10B981', '#F59E0B'] });
      } catch {}
    }
  };

  // Ambient sound toggle
  const toggleAmbientSound = (mode: 'rain' | 'cafe' | 'whitenoise' | 'lofi') => {
    if (ambientMode === mode) {
      SoundEffects.stopAmbient();
      setAmbientMode(null);
    } else {
      SoundEffects.startAmbient(mode);
      setAmbientMode(mode);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    SoundEffects.setAmbientVolume(vol);
  };

  const activeProject = activeTask ? projects.find(p => p.id === activeTask.projectId) : null;
  const unfinishedTasks = tasks.filter(t => t.status !== 'done');

  // Exact rounded percentage - FIXES 0.39393939% bug cleanly!
  const totalTargetSeconds = timerMode === 'pomodoro' 
    ? customMinutes * 60 
    : (timerMode === 'short_break' ? 5 * 60 : 15 * 60);

  const progressPercent = timerMode === 'stopwatch'
    ? Math.min(100, Math.round((stopwatchSeconds / (60 * 60)) * 100))
    : Math.min(100, Math.max(0, Math.round(((totalTargetSeconds - timeLeft) / totalTargetSeconds) * 100)));

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-md font-mono font-bold text-xs uppercase tracking-wider">
              RUANG FOKUS //
            </span>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 font-medium">
              TIMER & AMBIENT STUDIO
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Mode Kerja Fokus & Pencatat Waktu
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-normal mt-1">
            Atur durasi bebas, aktifkan suara alam yang menenangkan, dan kaitkan waktu kerja langsung ke tugas Anda.
          </p>
        </div>

        {/* Ambient Sound Quick Status */}
        <div className="flex items-center gap-2">
          {ambientMode && (
            <span className="flex items-center gap-1.5 text-xs font-mono font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Audio: {ambientMode}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): Timer & Ambient Sound */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Mode Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {[
                { id: 'pomodoro', label: `Fokus (${customMinutes}m)`, color: 'bg-amber-500 text-white' },
                { id: 'short_break', label: 'Istirahat (5m)', color: 'bg-emerald-600 text-white' },
                { id: 'long_break', label: 'Rehat (15m)', color: 'bg-indigo-600 text-white' },
                { id: 'stopwatch', label: 'Stopwatch Bebas', color: 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => switchMode(m.id as TimerMode)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    timerMode === m.id
                      ? `${m.color} shadow-sm scale-102`
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Custom Minutes Quick Adjuster */}
            {timerMode === 'pomodoro' && (
              <div className="mb-6 bg-neutral-50 dark:bg-neutral-800/60 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  <Sliders size={15} />
                  <span>Atur Durasi Menit:</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[15, 25, 45, 60, 90].map(mins => (
                    <button
                      key={mins}
                      onClick={() => handleCustomMinutesChange(mins)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-mono font-medium transition-colors cursor-pointer ${
                        customMinutes === mins
                          ? 'bg-amber-500 text-white'
                          : 'bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}

                  {/* Freeform Minute Input */}
                  <div className="flex items-center gap-1 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg px-2 py-0.5">
                    <input
                      type="number"
                      min="1"
                      max="480"
                      value={customMinutes}
                      onChange={(e) => handleCustomMinutesChange(Number(e.target.value) || 25)}
                      className="w-12 text-xs font-mono font-bold text-center bg-transparent focus:outline-hidden text-neutral-900 dark:text-neutral-100"
                    />
                    <span className="text-[11px] font-mono text-neutral-400">menit</span>
                  </div>
                </div>
              </div>
            )}

            {/* Giant Clean Display */}
            <div className="bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 sm:p-12 text-center my-4 relative overflow-hidden">
              {/* Progress bar inside timer */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-neutral-200 dark:bg-neutral-800">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Digits with tabular figures */}
              <div className="text-6xl sm:text-8xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-50 select-none tabular-nums">
                {timerMode === 'stopwatch' ? formatTime(stopwatchSeconds) : formatTime(timeLeft)}
              </div>

              {/* Status Subtitle with FIXED decimal */}
              <div className="mt-3 text-xs sm:text-sm font-mono font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-neutral-400'}`} />
                <span>
                  {isRunning 
                    ? (timerMode === 'pomodoro' ? 'SESI FOKUS BERJALAN' : 'TIMER BERJALAN')
                    : 'SIAP'}
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">|</span>
                <span className="tabular-nums">Progres: {progressPercent}%</span>
              </div>
            </div>

            {/* Action Buttons - RENAMED TO "Mulai" */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {!isRunning ? (
                <button
                  onClick={() => setIsRunning(true)}
                  className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm font-bold text-sm tracking-wide flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Play size={18} fill="currentColor" />
                  <span>Mulai</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsRunning(false)}
                  className="px-8 py-3 bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-200 dark:hover:bg-white text-white dark:text-neutral-900 rounded-xl shadow-sm font-bold text-sm tracking-wide flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Pause size={18} fill="currentColor" />
                  <span>Jeda</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsRunning(false);
                  if (timerMode === 'stopwatch') {
                    setStopwatchSeconds(0);
                  } else {
                    setTimeLeft(customMinutes * 60);
                  }
                }}
                className="px-4 py-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl font-semibold text-sm flex items-center gap-1.5 cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>

              {timerMode === 'stopwatch' && stopwatchSeconds > 30 && activeTask && (
                <button
                  onClick={handleLogStopwatchTime}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={16} />
                  <span>Simpan Log ({Math.max(1, Math.round(stopwatchSeconds / 60))}m)</span>
                </button>
              )}
            </div>
          </div>

          {/* AMBIENT SOUND & LO-FI PLAYER PANEL */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Music size={18} className="text-amber-500" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Ambient Audio & Suara Alam Relaksasi
                </h3>
              </div>
              {ambientMode && (
                <button
                  onClick={() => {
                    SoundEffects.stopAmbient();
                    setAmbientMode(null);
                  }}
                  className="text-xs text-red-500 hover:underline cursor-pointer font-medium"
                >
                  Matikan Audio
                </button>
              )}
            </div>

            {/* Ambient Mode Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'rain', label: '🌧️ Hujan', desc: 'Deburan lembut' },
                { id: 'cafe', label: '☕ Kafe', desc: 'Suasana tenang' },
                { id: 'whitenoise', label: '🌊 White Noise', desc: 'Fokus dalam' },
                { id: 'lofi', label: '🎵 Lo-fi Pulse', desc: 'Detak ritme santai' },
              ].map(item => {
                const isActive = ambientMode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleAmbientSound(item.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 text-amber-900 dark:text-amber-200'
                        : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/60 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{item.label}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {item.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Volume Slider */}
            {ambientMode && (
              <div className="flex items-center gap-3 pt-2">
                <Volume2 size={16} className="text-neutral-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-mono text-neutral-500 w-10 text-right tabular-nums">
                  {Math.round(ambientVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Quick Scratchpad */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileText size={17} className="text-neutral-500" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Scratchpad / Catatan Kerja Cepat
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {scratchpadSavedNotice && (
                  <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    ✓ Tersimpan
                  </span>
                )}
                <button
                  onClick={handleSaveScratchpad}
                  className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>

            <textarea
              value={localScratchpad}
              onChange={(e) => setLocalScratchpad(e.target.value)}
              placeholder="Tulis ide cepat, catatan meeting kilat, atau potongan solusi saat fokus..."
              rows={4}
              className="w-full p-3 bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 rounded-xl font-mono text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500 resize-y text-neutral-800 dark:text-neutral-200"
            />
          </div>
        </div>

        {/* Right Column (1 col): Active Task Card & Selector */}
        <div className="space-y-6">
          {/* Active Task Focused Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-3">
              <span className="text-[11px] font-mono font-medium uppercase text-neutral-500">
                TUGAS TERHUBUNG
              </span>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                Fokus Tugas Saat Ini
              </h3>
            </div>

            {activeTask ? (
              <div className="space-y-4">
                <div className="bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 p-3.5 rounded-xl">
                  <div className="flex items-center justify-between gap-1 mb-2">
                    {activeProject && (
                      <span 
                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono truncate"
                        style={{ backgroundColor: `${activeProject.color}25`, color: activeProject.color }}
                      >
                        {activeProject.icon} {activeProject.title}
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {activeTask.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-snug mb-1">
                    {activeTask.title}
                  </h4>

                  {activeTask.description && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 font-normal line-clamp-2">
                      {activeTask.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                    <span>Deadline: {activeTask.dueDate || '-'}</span>
                    <span className="tabular-nums">Waktu: {activeTask.timeSpentMinutes}m</span>
                  </div>
                </div>

                {/* Subtasks Checklist */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold uppercase mb-2 text-neutral-600 dark:text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <ListTodo size={14} />
                      <span>Checklist Subtask</span>
                    </span>
                    <span className="tabular-nums">
                      {activeTask.subtasks.filter(s => s.completed).length}/{activeTask.subtasks.length}
                    </span>
                  </div>

                  {activeTask.subtasks.length === 0 ? (
                    <div className="text-[11px] font-mono text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-center">
                      Belum ada subtask pada tugas ini.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {activeTask.subtasks.map(sub => (
                        <label 
                          key={sub.id}
                          className="flex items-start gap-2.5 p-2 bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-xs font-medium"
                        >
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            onChange={() => handleToggleSubtask(sub.id)}
                            className="mt-0.5 accent-amber-500 cursor-pointer rounded"
                          />
                          <span className={sub.completed ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-200'}>
                            {sub.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mark Task as Done button */}
                <button
                  onClick={() => {
                    const updated = { ...activeTask, status: 'done' as const };
                    onUpdateTask(updated);
                    SoundEffects.playCompletionChime();
                    try {
                      confetti({ particleCount: 50, spread: 60, colors: ['#10B981', '#F59E0B'] });
                    } catch {}
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <CheckCircle2 size={15} />
                  <span>Selesaikan Tugas Ini</span>
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-5 text-center space-y-2">
                <div className="text-xs font-mono text-neutral-500 font-medium">
                  Belum ada tugas aktif yang dipilih.
                </div>
                <p className="text-[11px] text-neutral-400">
                  Pilih tugas dari daftar di bawah untuk mencatat durasi kerja secara otomatis.
                </p>
              </div>
            )}
          </div>

          {/* Quick Select another task */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-500 font-mono">
                PILIH TUGAS LAIN:
              </h3>
              <button
                onClick={() => onNavigateTab('planner')}
                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Lihat di Planner
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {unfinishedTasks.slice(0, 8).map(task => {
                const isSelected = activeTask?.id === task.id;
                const proj = projects.find(p => p.id === task.projectId);

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectActiveTask(task)}
                    className={`p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 text-amber-950 dark:text-amber-200' 
                        : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200/80 dark:border-neutral-700/60 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="font-bold truncate text-neutral-900 dark:text-neutral-100">{task.title}</div>
                      {proj && (
                        <div className="text-[10px] font-mono text-neutral-400">
                          {proj.icon} {proj.title}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                      {isSelected ? 'AKTIF' : 'PILIH'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
