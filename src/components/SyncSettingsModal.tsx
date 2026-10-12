import React, { useState } from 'react';
import { User, UserDataStore } from '../types';
import { StorageService } from '../services/storage';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  UserCheck, 
  Users, 
  ShieldCheck, 
  HardDrive, 
  LogOut, 
  Sparkles,
  FileJson,
  Check
} from 'lucide-react';

interface SyncSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChange: (user: User) => void;
  onDataReset: () => void;
  onDataImported: () => void;
  onOpenAuth: () => void;
}

export const SyncSettingsModal: React.FC<SyncSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onDataReset,
  onDataImported,
  onOpenAuth,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen || !currentUser) return null;

  const usersList = StorageService.getAllUsers();

  // Export JSON file download
  const handleExportJSON = () => {
    const jsonStr = StorageService.exportDataJSON(currentUser.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brutalwork-backup-${currentUser.name.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON handler
  const handleImportJSON = () => {
    if (!importJsonText.trim()) return;

    const success = StorageService.importDataJSON(currentUser.id, importJsonText);
    if (success) {
      setImportStatus('success');
      onDataImported();
      setTimeout(() => {
        setImportStatus('idle');
        onClose();
      }, 1200);
    } else {
      setImportStatus('error');
    }
  };

  // Switch to another user
  const handleSwitchUser = (userId: string) => {
    const u = StorageService.switchUser(userId);
    if (u) {
      onUserChange(u);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFDF5] border-3 border-black shadow-[8px_8px_0_0_#000] w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#00E599] border-b-3 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive size={20} />
            <h2 className="font-black text-lg uppercase tracking-wider text-black">
              Sinkronisasi & Manajemen Data
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* User Profile Summary Card */}
          <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0_0_#000] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: currentUser.avatarBg || '#FFE600' }}
              >
                {currentUser.avatarEmoji || '⚡'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base leading-tight">{currentUser.name}</h3>
                  {currentUser.isGuest ? (
                    <span className="bg-[#FFE600] border border-black text-[10px] font-black px-1.5 py-0.5 font-mono">
                      MODE TAMU
                    </span>
                  ) : (
                    <span className="bg-[#00E599] border border-black text-[10px] font-black px-1.5 py-0.5 font-mono">
                      TERVERIFIKASI
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-black/60">{currentUser.email}</div>
                <div className="text-[11px] font-bold text-black/70 mt-0.5">Peran: {currentUser.role}</div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-3 py-1.5 bg-[#FFE600] hover:bg-amber-300 border-2 border-black shadow-[2px_2px_0_0_#000] text-xs font-black uppercase cursor-pointer"
            >
              Ganti Akun
            </button>
          </div>

          {/* Sync Status Banner */}
          <div className="bg-[#00F0FF]/20 border-2 border-black p-3.5 flex items-start gap-3">
            <ShieldCheck size={20} className="shrink-0 mt-0.5" />
            <div className="text-xs font-medium space-y-1">
              <div className="font-black uppercase font-mono">
                Penyimpanan Lokal Terisolasi & Otomatis Tersinkron
              </div>
              <p className="text-black/80">
                Setiap akun (termasuk mode tamu) memiliki ruang database tersendiri. Setiap perubahan tugas, kalender, dan waktu kerja langsung disimpan secara aman.
              </p>
            </div>
          </div>

          {/* Export & Import Backup */}
          <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0_0_#000] space-y-4">
            <div className="border-b-2 border-black pb-2">
              <h4 className="font-black text-xs uppercase tracking-wider font-mono">
                CADANGAN DATA (BACKUP & RESTORE JSON)
              </h4>
              <p className="text-xs text-black/70 font-medium">
                Pindahkan data proyek Anda ke perangkat atau browser lain dengan mudah.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-[#FFE600] hover:bg-amber-300 border-2 border-black shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={15} />
                <span>Unduh Cadangan JSON</span>
              </button>
            </div>

            {/* Import box */}
            <div className="space-y-2 pt-2 border-t border-black/20">
              <label className="block text-xs font-mono font-black uppercase">
                Tempelkan Teks JSON Cadangan untuk Impor:
              </label>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='Tempelkan isi file cadangan JSON di sini...'
                rows={3}
                className="w-full p-2 bg-[#FFFDF5] border-2 border-black font-mono text-[11px] focus:outline-hidden"
              />

              {importStatus === 'success' && (
                <div className="text-xs font-bold text-green-700 bg-green-100 p-2 border border-green-600 font-mono">
                  ✓ Berhasil mengimpor data proyek!
                </div>
              )}
              {importStatus === 'error' && (
                <div className="text-xs font-bold text-red-700 bg-red-100 p-2 border border-red-600 font-mono">
                  ⚠️ Format JSON tidak valid atau struktur tidak cocok.
                </div>
              )}

              <button
                onClick={handleImportJSON}
                disabled={!importJsonText.trim()}
                className="px-4 py-2 bg-white hover:bg-slate-100 disabled:opacity-50 border-2 border-black shadow-[2px_2px_0_0_#000] text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={15} />
                <span>Terapkan Impor JSON</span>
              </button>
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <div className="bg-[#FFFDF5] border-2 border-black p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-black text-xs uppercase font-mono">Muat Ulang Sampel Demo</div>
              <div className="text-xs text-black/70">
                Kembalikan daftar proyek, tugas, dan jadwal kalender contoh awal.
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Muat ulang data contoh awal? Perubahan saat ini pada akun ini akan digantikan.')) {
                  onDataReset();
                  onClose();
                }
              }}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 border-2 border-black text-red-800 text-xs font-black uppercase cursor-pointer whitespace-nowrap"
            >
              Reset ke Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
