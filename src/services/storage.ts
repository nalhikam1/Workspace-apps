import { User, Project, Task, TimeLog, CalendarEvent, UserDataStore } from '../types';

const STORAGE_KEY_CURRENT_USER = 'brutal_current_user';
const STORAGE_KEY_USERS = 'brutal_users_list';
const STORAGE_KEY_DATA_PREFIX = 'brutal_data_';

// Default initial seed data for new users & guests
export const getInitialData = (userName = 'Pengguna'): UserDataStore => {
  const today = new Date();
  const formatDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const sampleProjects: Project[] = [
    {
      id: 'proj-1',
      title: 'Peluncuran Aplikasi SaaS v2',
      description: 'Revamp UI Neo-Brutalism, migrasi backend, dan strategi onboarding pengguna baru.',
      color: '#FFE600', // Neon Yellow
      icon: '🚀',
      status: 'active',
      deadline: formatDate(14),
      tags: ['Design', 'Frontend', 'Q4'],
      createdAt: formatDate(-10),
      updatedAt: formatDate(0),
    },
    {
      id: 'proj-2',
      title: 'Branding & Kampanye Marketing',
      description: 'Asset visual media sosial, konten video tiktok, dan materi iklan peluncuran.',
      color: '#FF6AC2', // Neo Pink
      icon: '⚡',
      status: 'active',
      deadline: formatDate(7),
      tags: ['Marketing', 'Social'],
      createdAt: formatDate(-5),
      updatedAt: formatDate(0),
    },
    {
      id: 'proj-3',
      title: 'Audit Keamanan & Performa Web',
      description: 'Optimalisasi Core Web Vitals, caching headers, dan audit enkripsi data.',
      color: '#00F0FF', // Electric Cyan
      icon: '🛡️',
      status: 'active',
      deadline: formatDate(21),
      tags: ['DevOps', 'Security'],
      createdAt: formatDate(-2),
      updatedAt: formatDate(0),
    },
    {
      id: 'proj-4',
      title: 'Riset Pasar & Wawancara User',
      description: 'Analisis feedback 50 klien perdana mengenai kenyamanan workflow.',
      color: '#00E599', // Punchy Green
      icon: '🎯',
      status: 'completed',
      deadline: formatDate(-2),
      tags: ['Research'],
      createdAt: formatDate(-20),
      updatedAt: formatDate(-2),
    }
  ];

  const sampleTasks: Task[] = [
    {
      id: 'task-1',
      projectId: 'proj-1',
      title: 'Slicing Desain Komponen Neo-Brutalism',
      description: 'Buat tombol brutalist, card tebal dengan drop shadow tajam, dan badge kontras tinggi.',
      status: 'done',
      priority: 'high',
      dueDate: formatDate(-1),
      estimatedMinutes: 180,
      timeSpentMinutes: 200,
      tags: ['UI', 'Tailwind'],
      subtasks: [
        { id: 'sub-1', title: 'Atur variabel warna neon & border tebal', completed: true },
        { id: 'sub-2', title: 'Buat komponen tombol interaktif', completed: true },
        { id: 'sub-3', title: 'Test responsivitas pada layar mobile', completed: true }
      ],
      notes: 'Desain sudah di-approve oleh lead designer.',
      createdAt: formatDate(-6),
      updatedAt: formatDate(-1),
    },
    {
      id: 'task-2',
      projectId: 'proj-1',
      title: 'Integrasi Mode Kalender Interaktif',
      description: 'Tampilkan deadline tugas dan milestone langsung di grid kalender bulanan dan mingguan.',
      status: 'in_progress',
      priority: 'urgent',
      dueDate: formatDate(1),
      estimatedMinutes: 120,
      timeSpentMinutes: 75,
      tags: ['Calendar', 'Feature'],
      subtasks: [
        { id: 'sub-4', title: 'Rancang tampilan grid kalender bulanan', completed: true },
        { id: 'sub-5', title: 'Hubungkan event tugas dengan tanggal kalender', completed: true },
        { id: 'sub-6', title: 'Tambahkan modal tambah event cepat', completed: false }
      ],
      notes: 'Pastikan transisi navigasi bulan mulus dan responsif.',
      createdAt: formatDate(-3),
      updatedAt: formatDate(0),
    },
    {
      id: 'task-3',
      projectId: 'proj-1',
      title: 'Buat Dashboard Analitik Visual Dinamis',
      description: 'Grafik batang velositas mingguan, status proyek, dan alokasi waktu kerja fokus.',
      status: 'in_progress',
      priority: 'high',
      dueDate: formatDate(3),
      estimatedMinutes: 150,
      timeSpentMinutes: 90,
      tags: ['Analytics', 'Charts'],
      subtasks: [
        { id: 'sub-7', title: 'Hitung persentase task selesai per proyek', completed: true },
        { id: 'sub-8', title: 'Buat visualisasi grafik jam kerja fokus', completed: true },
        { id: 'sub-9', title: 'Tambahkan filter analitik berdasarkan proyek', completed: false }
      ],
      createdAt: formatDate(-2),
      updatedAt: formatDate(0),
    },
    {
      id: 'task-4',
      projectId: 'proj-1',
      title: 'Testing Alur Login Tamu & Multi-User Sync',
      description: 'Uji isolasi data lokal per akun dan pastikan data tamu dapat disimpan.',
      status: 'todo',
      priority: 'medium',
      dueDate: formatDate(4),
      estimatedMinutes: 90,
      timeSpentMinutes: 0,
      tags: ['Auth', 'QA'],
      subtasks: [
        { id: 'sub-10', title: 'Coba registrasi akun baru', completed: false },
        { id: 'sub-11', title: 'Uji tombol login tamu 1-klik', completed: false },
        { id: 'sub-12', title: 'Uji ekspor & impor file JSON cadangan', completed: false }
      ],
      createdAt: formatDate(-1),
      updatedAt: formatDate(0),
    },
    {
      id: 'task-5',
      projectId: 'proj-2',
      title: 'Produksi 5 Banner Poster Neo-Brutalist',
      description: 'Konten feed Instagram dan poster header Linkedin untuk kampanye peluncuran.',
      status: 'todo',
      priority: 'high',
      dueDate: formatDate(2),
      estimatedMinutes: 120,
      timeSpentMinutes: 30,
      tags: ['Creative', 'Copy'],
      subtasks: [
        { id: 'sub-13', title: 'Draft copy headline promosi', completed: true },
        { id: 'sub-14', title: 'Layout visual 1080x1080', completed: false }
      ],
      createdAt: formatDate(-2),
      updatedAt: formatDate(0),
    },
    {
      id: 'task-6',
      projectId: 'proj-2',
      title: 'Jadwalkan Siaran Pers dan Email Newsletter',
      description: 'Kirimkan email pembaruan kepada 1.200 subscriber komunitas pengguna beta.',
      status: 'backlog',
      priority: 'low',
      dueDate: formatDate(6),
      estimatedMinutes: 60,
      timeSpentMinutes: 0,
      tags: ['Email', 'Outreach'],
      subtasks: [],
      createdAt: formatDate(-1),
      updatedAt: formatDate(-1),
    },
    {
      id: 'task-7',
      projectId: 'proj-3',
      title: 'Review Kecepatan Akses & Optimasi Aset',
      description: 'Kompresi ikon font, minify build, dan pastikan Lighthouse score > 90.',
      status: 'review',
      priority: 'medium',
      dueDate: formatDate(5),
      estimatedMinutes: 100,
      timeSpentMinutes: 80,
      tags: ['Performance'],
      subtasks: [
        { id: 'sub-15', title: 'Audit bundle JS dengan Vite analyzer', completed: true },
        { id: 'sub-16', title: 'Optimasi CSS font fallback', completed: true }
      ],
      createdAt: formatDate(-4),
      updatedAt: formatDate(0),
    },
    {
      id: 'task-8',
      projectId: 'proj-4',
      title: 'Rangkum Insight Wawancara 15 Pengguna Pertama',
      description: 'Kompilasi poin positif dan saran perbaikan navigasi ke dalam slide kesimpulan.',
      status: 'done',
      priority: 'medium',
      dueDate: formatDate(-3),
      estimatedMinutes: 140,
      timeSpentMinutes: 130,
      tags: ['Synthesis'],
      subtasks: [
        { id: 'sub-17', title: 'Transkrip catatan wawancara', completed: true },
        { id: 'sub-18', title: 'Kelompokkan keluhan utama', completed: true }
      ],
      createdAt: formatDate(-12),
      updatedAt: formatDate(-3),
    }
  ];

  const sampleTimeLogs: TimeLog[] = [
    {
      id: 'log-1',
      taskId: 'task-1',
      projectId: 'proj-1',
      durationMinutes: 50,
      date: formatDate(-2),
      mode: 'pomodoro',
      note: 'Menyelesaikan setup palet warna dan komponen tombol',
      createdAt: formatDate(-2),
    },
    {
      id: 'log-2',
      taskId: 'task-1',
      projectId: 'proj-1',
      durationMinutes: 75,
      date: formatDate(-1),
      mode: 'pomodoro',
      note: 'Refactor modal dan layout form',
      createdAt: formatDate(-1),
    },
    {
      id: 'log-3',
      taskId: 'task-2',
      projectId: 'proj-1',
      durationMinutes: 45,
      date: formatDate(0),
      mode: 'stopwatch',
      note: 'Mengembangkan sistem navigasi grid kalender',
      createdAt: formatDate(0),
    },
    {
      id: 'log-4',
      taskId: 'task-3',
      projectId: 'proj-1',
      durationMinutes: 60,
      date: formatDate(0),
      mode: 'pomodoro',
      note: 'Kalkulasi visual metric analitik proyek',
      createdAt: formatDate(0),
    },
  ];

  const sampleEvents: CalendarEvent[] = [
    {
      id: 'ev-1',
      title: '🎯 Sprint Review & Demo Progress',
      date: formatDate(3),
      startTime: '10:00',
      endTime: '11:30',
      type: 'sprint',
      projectId: 'proj-1',
      color: '#FFE600',
      notes: 'Demo fitur kalender dan dashboard analitik kepada tim.'
    },
    {
      id: 'ev-2',
      title: '📢 Rilis Kampanye Media Sosial',
      date: formatDate(7),
      startTime: '14:00',
      endTime: '15:00',
      type: 'milestone',
      projectId: 'proj-2',
      color: '#FF6AC2',
      notes: 'Post batch pertama teaser produk.'
    },
    {
      id: 'ev-3',
      title: '⚡ Deadline Audit Keamanan',
      date: formatDate(10),
      type: 'deadline',
      projectId: 'proj-3',
      color: '#00F0FF',
      notes: 'Semua celah minor harus selesai ditambal.'
    }
  ];

  return {
    projects: sampleProjects,
    tasks: sampleTasks,
    timeLogs: sampleTimeLogs,
    events: sampleEvents,
    scratchpad: `// CATATAN CEPAT RUANG KERJA //\n- Selesaikan visualisasi grafik analitik hari ini\n- Hubungi klien jam 14:00 untuk sinkronisasi jadwal sprint\n- Cek kembali data cadangan JSON sebelum rilis!`,
    lastSyncedAt: new Date().toISOString(),
  };
};

export const StorageService = {
  // User Management
  getAllUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return null;
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    // Ensure user exists in users list
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  },

  createGuestUser(): User {
    const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
    const guestUser: User = {
      id: guestId,
      name: 'Tamu Kreatif',
      email: 'tamu@brutalwork.local',
      avatarBg: '#FFE600',
      avatarEmoji: '⚡',
      role: 'Tamu Eksplorer',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    this.setCurrentUser(guestUser);
    
    // Seed guest initial data
    const initialData = getInitialData('Tamu Kreatif');
    this.saveUserData(guestId, initialData);

    return guestUser;
  },

  registerUser(name: string, email: string, avatarBg = '#FFE600', avatarEmoji = '🚀', role = 'Lead Planner'): User {
    const userId = 'usr_' + Math.random().toString(36).substring(2, 9);
    const newUser: User = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatarBg,
      avatarEmoji,
      role,
      isGuest: false,
      createdAt: new Date().toISOString(),
    };

    // If currently a guest, we can migrate the guest's data to this new registered user!
    const currentUser = this.getCurrentUser();
    let dataToMigrate: UserDataStore | null = null;
    if (currentUser && currentUser.isGuest) {
      dataToMigrate = this.getUserData(currentUser.id);
    }

    this.setCurrentUser(newUser);

    if (dataToMigrate) {
      dataToMigrate.lastSyncedAt = new Date().toISOString();
      this.saveUserData(userId, dataToMigrate);
    } else {
      this.saveUserData(userId, getInitialData(newUser.name));
    }

    return newUser;
  },

  switchUser(userId: string): User | null {
    const users = this.getAllUsers();
    const target = users.find(u => u.id === userId);
    if (target) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(target));
      return target;
    }
    return null;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  },

  // User Data Store Management
  getUserData(userId: string): UserDataStore {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_DATA_PREFIX}${userId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    }
    // Return fresh initial data if none exists
    const fresh = getInitialData();
    this.saveUserData(userId, fresh);
    return fresh;
  },

  saveUserData(userId: string, data: UserDataStore): void {
    try {
      data.lastSyncedAt = new Date().toISOString();
      localStorage.setItem(`${STORAGE_KEY_DATA_PREFIX}${userId}`, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving user data:', e);
    }
  },

  // Export / Import
  exportDataJSON(userId: string): string {
    const data = this.getUserData(userId);
    const user = this.getCurrentUser();
    const exportPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user,
      store: data,
    };
    return JSON.stringify(exportPayload, null, 2);
  },

  importDataJSON(userId: string, jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.store && Array.isArray(parsed.store.projects) && Array.isArray(parsed.store.tasks)) {
        this.saveUserData(userId, parsed.store);
        return true;
      }
      if (Array.isArray(parsed.projects) && Array.isArray(parsed.tasks)) {
        this.saveUserData(userId, parsed as UserDataStore);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to parse import JSON:', e);
      return false;
    }
  },

  resetUserData(userId: string, userName?: string): UserDataStore {
    const fresh = getInitialData(userName);
    this.saveUserData(userId, fresh);
    return fresh;
  }
};
