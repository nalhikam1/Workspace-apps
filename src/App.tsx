/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User, Project, Task, TimeLog, CalendarEvent, UserDataStore, ViewTab, TaskStatus, ThemeMode } from './types';
import { StorageService, getInitialData } from './services/storage';
import { SoundEffects } from './services/soundEffects';
import { Navbar } from './components/Navbar';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ProjectBoard } from './components/ProjectBoard';
import { CalendarView } from './components/CalendarView';
import { WorkingStudio } from './components/WorkingStudio';
import { AuthModal } from './components/AuthModal';
import { TaskModal } from './components/TaskModal';
import { ProjectModal } from './components/ProjectModal';
import { SyncSettingsModal } from './components/SyncSettingsModal';
import { ProjectManager } from './components/ProjectManager';

export default function App() {
  // Theme mode: light or dark
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem('workstudio_theme');
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {}
    return 'light';
  });

  // Sound effect state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => SoundEffects.isSoundEnabled());

  // Initialize global click sound and theme class
  useEffect(() => {
    SoundEffects.initGlobalClickSound();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('workstudio_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    SoundEffects.setSoundEnabled(next);
  };

  // Current user state (auto-initializes to guest or saved user on first visit)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const existing = StorageService.getCurrentUser();
    if (existing) return existing;
    return StorageService.createGuestUser();
  });

  // User's isolated data store
  const [store, setStore] = useState<UserDataStore>(() => {
    const user = StorageService.getCurrentUser() || StorageService.createGuestUser();
    return StorageService.getUserData(user.id);
  });

  // Active view tab
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [activeWorkingTask, setActiveWorkingTask] = useState<Task | null>(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskModalInitialStatus, setTaskModalInitialStatus] = useState<TaskStatus>('todo');
  const [taskModalInitialProjectId, setTaskModalInitialProjectId] = useState<string | undefined>(undefined);
  const [taskModalInitialDate, setTaskModalInitialDate] = useState<string | undefined>(undefined);

  // Sync data to localStorage on changes
  const saveStore = useCallback((newStore: UserDataStore) => {
    setStore(newStore);
    if (currentUser) {
      StorageService.saveUserData(currentUser.id, newStore);
    }
  }, [currentUser]);

  // Handle User change (switch account / login / register)
  const handleUserChange = (newUser: User) => {
    setCurrentUser(newUser);
    const userStore = StorageService.getUserData(newUser.id);
    setStore(userStore);
    setSelectedProjectId('all');
    setActiveWorkingTask(null);
  };

  // Logout
  const handleLogout = () => {
    StorageService.logout();
    const guest = StorageService.createGuestUser();
    setCurrentUser(guest);
    setStore(StorageService.getUserData(guest.id));
  };

  // Reload / Reset to Demo
  const handleResetData = () => {
    if (!currentUser) return;
    const fresh = StorageService.resetUserData(currentUser.id, currentUser.name);
    setStore(fresh);
    setActiveWorkingTask(null);
  };

  const handleDataImported = () => {
    if (!currentUser) return;
    const reloaded = StorageService.getUserData(currentUser.id);
    setStore(reloaded);
  };

  // TASK HANDLERS
  const handleSaveTask = (taskToSave: Task) => {
    const exists = store.tasks.some(t => t.id === taskToSave.id);
    let updatedTasks: Task[];

    if (exists) {
      updatedTasks = store.tasks.map(t => t.id === taskToSave.id ? taskToSave : t);
    } else {
      updatedTasks = [taskToSave, ...store.tasks];
    }

    if (activeWorkingTask?.id === taskToSave.id) {
      setActiveWorkingTask(taskToSave);
    }

    saveStore({
      ...store,
      tasks: updatedTasks,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = store.tasks.filter(t => t.id !== taskId);
    if (activeWorkingTask?.id === taskId) {
      setActiveWorkingTask(null);
    }
    saveStore({
      ...store,
      tasks: updatedTasks,
    });
  };

  // PROJECT HANDLERS
  const handleSaveProject = (projectToSave: Project) => {
    const exists = store.projects.some(p => p.id === projectToSave.id);
    let updatedProjects: Project[];

    if (exists) {
      updatedProjects = store.projects.map(p => p.id === projectToSave.id ? projectToSave : p);
    } else {
      updatedProjects = [...store.projects, projectToSave];
    }

    saveStore({
      ...store,
      projects: updatedProjects,
    });
  };

  const handleDeleteProject = (projectId: string, deleteTasksToo = false) => {
    const updatedProjects = store.projects.filter(p => p.id !== projectId);
    const updatedTasks = deleteTasksToo 
      ? store.tasks.filter(t => t.projectId !== projectId)
      : store.tasks.map(t => t.projectId === projectId ? { ...t, projectId: 'unassigned' } : t);
    const updatedEvents = store.events.filter(e => e.projectId !== projectId);
    
    saveStore({
      ...store,
      projects: updatedProjects,
      tasks: updatedTasks,
      events: updatedEvents,
    });
    if (selectedProjectId === projectId) {
      setSelectedProjectId('all');
    }
  };

  // TIME LOG HANDLER
  const handleLogTime = (timeLog: TimeLog) => {
    saveStore({
      ...store,
      timeLogs: [timeLog, ...store.timeLogs],
    });
  };

  // CALENDAR EVENT HANDLERS
  const handleAddEvent = (event: CalendarEvent) => {
    saveStore({
      ...store,
      events: [...store.events, event],
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    saveStore({
      ...store,
      events: store.events.filter(e => e.id !== eventId),
    });
  };

  // SCRATCHPAD HANDLER
  const handleSaveScratchpad = (content: string) => {
    saveStore({
      ...store,
      scratchpad: content,
    });
  };

  // QUICK OPEN TASK MODAL
  const handleOpenTaskModal = (
    task?: Task, 
    initialStatus: TaskStatus = 'todo', 
    initialProjectId?: string, 
    initialDate?: string
  ) => {
    setEditingTask(task || null);
    setTaskModalInitialStatus(initialStatus);
    setTaskModalInitialProjectId(initialProjectId);
    setTaskModalInitialDate(initialDate);
    setIsTaskModalOpen(true);
  };

  // QUICK OPEN PROJECT MODAL
  const handleOpenProjectModal = (project?: Project) => {
    setEditingProject(project || null);
    setIsProjectModalOpen(true);
  };

  // JUMP TO WORKING STUDIO WITH TASK
  const handleStartWorkingOnTask = (task: Task) => {
    setActiveWorkingTask(task);
    setActiveTab('working');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 flex flex-col transition-colors selection:bg-amber-400 selection:text-black">
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewTask={() => handleOpenTaskModal(undefined, 'todo', selectedProjectId !== 'all' ? selectedProjectId : undefined)}
        onOpenNewProject={() => handleOpenProjectModal()}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSyncModalOpen(true)}
        lastSyncedAt={store.lastSyncedAt}
        theme={theme}
        onToggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        tasks={store.tasks}
        onOpenTaskModal={handleOpenTaskModal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <AnalyticsDashboard
            projects={store.projects}
            tasks={store.tasks}
            timeLogs={store.timeLogs}
            onNavigateTab={setActiveTab}
            onFilterProjectInPlanner={(projId) => {
              setSelectedProjectId(projId);
              setActiveTab('planner');
            }}
            onOpenNewTask={() => handleOpenTaskModal(undefined, 'todo')}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectManager
            projects={store.projects}
            tasks={store.tasks}
            onOpenProjectModal={handleOpenProjectModal}
            onOpenTaskModal={handleOpenTaskModal}
            onUpdateProject={handleSaveProject}
            onDeleteProject={(projectId, deleteTasksToo) => handleDeleteProject(projectId, deleteTasksToo)}
            onNavigateToPlanner={(projectId) => {
              setSelectedProjectId(projectId);
              setActiveTab('planner');
            }}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'planner' && (
          <ProjectBoard
            projects={store.projects}
            tasks={store.tasks}
            onUpdateTask={handleSaveTask}
            onDeleteTask={handleDeleteTask}
            onOpenTaskModal={handleOpenTaskModal}
            onOpenProjectModal={handleOpenProjectModal}
            onStartWorkingOnTask={handleStartWorkingOnTask}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onNavigateToProjectManager={() => setActiveTab('projects')}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            projects={store.projects}
            tasks={store.tasks}
            events={store.events}
            onOpenTaskModal={handleOpenTaskModal}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {activeTab === 'working' && (
          <WorkingStudio
            projects={store.projects}
            tasks={store.tasks}
            activeTask={activeWorkingTask}
            onSelectActiveTask={setActiveWorkingTask}
            onUpdateTask={handleSaveTask}
            onLogTime={handleLogTime}
            scratchpad={store.scratchpad}
            onSaveScratchpad={handleSaveScratchpad}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {/* Footer in Work Studio modern minimal design */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-6 px-4 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="font-bold text-neutral-800 dark:text-neutral-200">WORK STUDIO // PROJECT PLANNER & FOCUS</span>
          </div>
          <div>
            Sistem Data Terisolasi Per-Pengguna · Minimalis Modern · Suara Alam & Pomodoro Fleksibel
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onUserChange={handleUserChange}
        currentUser={currentUser}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        projects={store.projects}
        initialStatus={taskModalInitialStatus}
        initialProjectId={taskModalInitialProjectId}
        initialDate={taskModalInitialDate}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={editingProject}
        onSaveProject={handleSaveProject}
        onDeleteProject={handleDeleteProject}
      />

      <SyncSettingsModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onDataReset={handleResetData}
        onDataImported={handleDataImported}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
    </div>
  );
}
