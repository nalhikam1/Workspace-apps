import React, { useState, useEffect, useRef } from 'react';
import { Project, Task, TimeLog, ViewTab } from '../types';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Flame, 
  Volume2, 
  VolumeX, 
  Coffee, 
  Save, 
  Clock, 
  Sparkles,
  FileText,
  ListTodo,
  ArrowRight
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
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minutes default
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [localScratchpad, setLocalScratchpad] = useState<string>(scratchpad);
  const [scratchpadSavedNotice, setScratchpadSavedNotice] = useState<boolean>(false);

  const initialTimeMap: Record<TimerMode, number> = {
    pomodoro: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
    stopwatch: 0,
  };

  // Play audio chime using Web Audio API (no external file needed!)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // fallback
    }
  };

  // Switch timer mode
  const switchMode = (mode: TimerMode) => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'stopwatch') {
      setStopwatchSeconds(0);
    } else {
      setTimeLeft(initialTimeMap[mode]);
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
              playChime();
              try {
                confetti({
                  particleCount: 60,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#FFE600', '#FF6AC2', '#00E599']
                });
              } catch {}

              // Auto-log completed session if active task
              if (activeTask && timerMode === 'pomodoro') {
                const log: TimeLog = {
                  id: 'log-' + Math.random().toString(36).substring(2, 9),
                  taskId: activeTask.id,
                  projectId: activeTask.projectId,
                  durationMinutes: 25,
                  date: new Date().toISOString().split('T')[0],
                  mode: 'pomodoro',
                  note: 'Sesi Pomodoro 25 Menit Selesai',
                  createdAt: new Date().toISOString(),
                };
                onLogTime(log);
                onUpdateTask({
                  ...activeTask,
                  timeSpentMinutes: (activeTask.timeSpentMinutes || 0) + 25,
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
  }, [isRunning, timerMode, activeTask]);

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Manual log time from stopwatch
  const handleLogStopwatchTime = () => {
    if (!activeTask || stopwatchSeconds < 60) return;
    const minutes = Math.round(stopwatchSeconds / 60);

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
    playChime();
  };

  // Scratchpad save
  const handleSaveScratchpad = () => {
    onSaveScratchpad(localScratchpad);
    setScratchpadSavedNotice(true);
    setTimeout(() => setScratchpadSavedNotice(false), 2000);
  };

  // Subtask checkbox inside working studio
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
      try {
        confetti({ particleCount: 40, spread: 50, colors: ['#00E599', '#FFE600'] });
      } catch {}
    }
  };

  const activeProject = activeTask ? projects.find(p => p.id === activeTask.projectId) : null;
  const unfinishedTasks = tasks.filter(t => t.status !== 'done');

  // Calculate percentage of timer completed
  const totalTargetSeconds = initialTimeMap[timerMode] || 1;
  const progressPercent = timerMode === 'stopwatch' 
    ? Math.min(100, (stopwatchSeconds / (60 * 60)) * 100)
    : Math.round(((totalTargetSeconds - timeLeft) / totalTargetSeconds) * 100);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-[#FFFDF5] border-3 border-black p-4 sm:p-5 shadow-[5px_5px_0_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#00E599] px-2 py-0.5 border-2 border-black font-mono font-bold text-xs uppercase shadow-[2px_2px_0_0_#000]">
              FOCUS STUDIO //
            </span>
            <span className="text-xs font-mono text-black/60 font-bold">
              RUANG KERJA & TIMER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Mode Kerja Fokus & Pencatat Waktu
          </h1>
          <p className="text-xs sm:text-sm text-black/80 font-medium mt-1">
            Eliminasi distraksi, pilih tugas aktif, jalankan sprint kerja, dan catat progres secara otomatis.
          </p>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black shadow-[2px_2px_0_0_#000] text-xs font-bold cursor-pointer transition-colors ${
            soundEnabled ? 'bg-[#FFE600]' : 'bg-zinc-200'
          }`}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span>{soundEnabled ? 'Audio Aktif' : 'Mute'}</span>
        </button>
      </div>

      {/* Main Studio Grid: Timer Hub & Active Task + Scratchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left (2 cols): Huge Neo-Brutalist Timer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border-3 border-black p-6 sm:p-8 shadow-[6px_6px_0_0_#000] relative overflow-hidden">
            {/* Mode Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {[
                { id: 'pomodoro', label: '⚡ Pomodoro (25m)', color: '#FFE600' },
                { id: 'short_break', label: '☕ Istirahat (5m)', color: '#00F0FF' },
                { id: 'long_break', label: '🌿 Rehat (15m)', color: '#FF6AC2' },
                { id: 'stopwatch', label: '⏱️ Stopwatch Bebas', color: '#00E599' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => switchMode(m.id as TimerMode)}
                  className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase cursor-pointer transition-all ${
                    timerMode === m.id
                      ? 'shadow-[3px_3px_0_0_#000] -translate-y-0.5'
                      : 'bg-white hover:bg-slate-100 shadow-[1px_1px_0_0_#000]'
                  }`}
                  style={timerMode === m.id ? { backgroundColor: m.color } : {}}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Giant Retro Digital Display */}
            <div className="bg-[#FFFDF5] border-3 border-black p-6 sm:p-10 shadow-[4px_4px_0_0_#000] text-center my-4 relative">
              {/* Progress bar inside timer */}
              <div className="absolute top-0 inset-x-0 h-2 bg-zinc-200 border-b border-black">
                <div 
                  className="h-full bg-black transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Digits */}
              <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight text-black select-none">
                {timerMode === 'stopwatch' ? formatTime(stopwatchSeconds) : formatTime(timeLeft)}
              </div>

              {/* Status Subtitle */}
              <div className="mt-3 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-black/70 flex items-center justify-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full border border-black ${isRunning ? 'bg-[#00E599] animate-ping' : 'bg-red-500'}`} />
                <span>
                  {isRunning 
                    ? (timerMode === 'pomodoro' ? 'SESI FOKUS BERJALAN' : 'TIMER SEDANG BERJALAN')
                    : 'SIAP MEMULAI'}
                </span>
                <span className="text-black/40">|</span>
                <span>Progres: {progressPercent}%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {!isRunning ? (
                <button
                  onClick={() => setIsRunning(true)}
                  className="px-8 py-3 bg-[#00E599] hover:bg-emerald-400 border-3 border-black shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none font-black text-base uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Play size={18} fill="currentColor" />
                  <span>Mulai Bekerja</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsRunning(false)}
                  className="px-8 py-3 bg-[#FFE600] hover:bg-amber-300 border-3 border-black shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none font-black text-base uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Pause size={18} fill="currentColor" />
                  <span>Jeda (Pause)</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsRunning(false);
                  if (timerMode === 'stopwatch') {
                    setStopwatchSeconds(0);
                  } else {
                    setTimeLeft(initialTimeMap[timerMode]);
                  }
                }}
                className="px-4 py-3 bg-white hover:bg-slate-100 border-3 border-black shadow-[3px_3px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 font-black text-sm uppercase flex items-center gap-1.5 cursor-pointer"
                title="Reset timer ke awal"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>

              {timerMode === 'stopwatch' && stopwatchSeconds > 30 && activeTask && (
                <button
                  onClick={handleLogStopwatchTime}
                  className="px-4 py-3 bg-[#00F0FF] hover:bg-cyan-300 border-3 border-black shadow-[3px_3px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 font-black text-sm uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={16} />
                  <span>Simpan Log ({Math.round(stopwatchSeconds / 60)}m)</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Scratchpad */}
          <div className="bg-[#FFFDF5] border-3 border-black p-5 shadow-[5px_5px_0_0_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} />
                <h3 className="font-black text-sm uppercase tracking-wider">
                  Scratchpad / Catatan Kerja Cepat
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {scratchpadSavedNotice && (
                  <span className="text-[11px] font-mono font-bold bg-[#00E599] px-2 py-0.5 border border-black animate-fade-in">
                    ✓ Tersimpan
                  </span>
                )}
                <button
                  onClick={handleSaveScratchpad}
                  className="px-3 py-1 bg-[#FFE600] hover:bg-amber-300 border-2 border-black shadow-[2px_2px_0_0_#000] text-xs font-black uppercase cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>

            <textarea
              value={localScratchpad}
              onChange={(e) => setLocalScratchpad(e.target.value)}
              placeholder="Tulis ide cepat, catatan meeting kilat, atau potongan kode saat Anda fokus di sini..."
              rows={4}
              className="w-full p-3 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] font-mono text-xs focus:outline-hidden focus:bg-amber-50/50 resize-y"
            />
          </div>
        </div>

        {/* Right Column (1 col): Active Task Card & Selector */}
        <div className="space-y-6">
          {/* Active Task Focused Card */}
          <div className="bg-white border-3 border-black p-5 shadow-[5px_5px_0_0_#000]">
            <div className="border-b-2 border-black pb-3 mb-3">
              <span className="text-[11px] font-mono font-bold uppercase text-black/60">
                TUGAS YANG SEDANG DIKERJAKAN
              </span>
              <h3 className="text-base font-black uppercase mt-1">
                Fokus Tugas Saat Ini
              </h3>
            </div>

            {activeTask ? (
              <div className="space-y-4">
                <div className="bg-[#FFFDF5] border-2 border-black p-3.5 shadow-[3px_3px_0_0_#000]">
                  <div className="flex items-center justify-between gap-1 mb-2">
                    {activeProject && (
                      <span 
                        className="text-[10px] font-black uppercase px-1.5 py-0.5 border border-black font-mono truncate"
                        style={{ backgroundColor: activeProject.color }}
                      >
                        {activeProject.icon} {activeProject.title}
                      </span>
                    )}
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 border border-black font-mono bg-[#FFE600]">
                      {activeTask.priority}
                    </span>
                  </div>

                  <h4 className="font-black text-sm leading-snug mb-1">{activeTask.title}</h4>

                  {activeTask.description && (
                    <p className="text-xs text-black/70 mb-2 font-medium">{activeTask.description}</p>
                  )}

                  <div className="flex items-center justify-between text-[11px] font-mono text-black/70 pt-2 border-t border-black/20">
                    <span>Deadline: {activeTask.dueDate || '-'}</span>
                    <span>Waktu: {activeTask.timeSpentMinutes}m</span>
                  </div>
                </div>

                {/* Subtasks Checklist */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-black uppercase mb-2">
                    <span className="flex items-center gap-1">
                      <ListTodo size={14} />
                      <span>Checklist Subtask</span>
                    </span>
                    <span>
                      {activeTask.subtasks.filter(s => s.completed).length}/{activeTask.subtasks.length}
                    </span>
                  </div>

                  {activeTask.subtasks.length === 0 ? (
                    <div className="text-[11px] font-mono text-black/50 border border-dashed border-black/30 p-2 text-center">
                      Belum ada subtask pada tugas ini.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {activeTask.subtasks.map(sub => (
                        <label 
                          key={sub.id}
                          className="flex items-start gap-2 p-2 bg-[#FFFDF5] border border-black cursor-pointer hover:bg-amber-50 text-xs font-bold"
                        >
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            onChange={() => handleToggleSubtask(sub.id)}
                            className="mt-0.5 accent-black cursor-pointer"
                          />
                          <span className={sub.completed ? 'line-through text-black/50' : 'text-black'}>
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
                    try {
                      confetti({ particleCount: 50, spread: 60, colors: ['#00E599', '#FFE600'] });
                    } catch {}
                  }}
                  className="w-full py-2 bg-[#00E599] hover:bg-emerald-400 border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 text-xs font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  <span>Selesaikan Tugas Ini</span>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-black p-5 text-center space-y-3">
                <div className="text-xs font-mono text-black/60 font-bold">
                  Belum ada tugas aktif yang dipilih untuk sesi kerja ini.
                </div>
                <p className="text-[11px] text-black/70">
                  Pilih salah satu tugas dari daftar di bawah untuk menghubungkan waktu kerja.
                </p>
              </div>
            )}
          </div>

          {/* Quick Select another task */}
          <div className="bg-[#FFFDF5] border-3 border-black p-5 shadow-[5px_5px_0_0_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <h3 className="font-black text-xs uppercase tracking-wider font-mono">
                PILIH TUGAS LAIN:
              </h3>
              <button
                onClick={() => onNavigateTab('planner')}
                className="text-[11px] font-bold underline cursor-pointer"
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
                    className={`p-2 border-2 border-black text-xs font-bold cursor-pointer transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-[#FFE600] shadow-[2px_2px_0_0_#000]' 
                        : 'bg-white hover:bg-slate-50 shadow-[1px_1px_0_0_#000]'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="font-black truncate">{task.title}</div>
                      {proj && (
                        <div className="text-[10px] font-mono text-black/60">
                          {proj.icon} {proj.title}
                        </div>
                      )}
                    </div>

                    <button className="text-[10px] font-black font-mono uppercase bg-black text-white px-1.5 py-0.5 whitespace-nowrap">
                      {isSelected ? 'AKTIF' : 'PILIH'}
                    </button>
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
