import React, { useState } from 'react';
import { User, UserDataStore } from '../types';
import { StorageService } from '../services/storage';
import { 
  X, 
  Download, 
  Upload, 
  ShieldCheck, 
  HardDrive
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
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen || !currentUser) return null;

  // Export JSON file download
  const handleExportJSON = () => {
    const jsonStr = StorageService.exportDataJSON(currentUser.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workstudio-backup-${currentUser.name.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.json`;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-amber-500 text-white p-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <HardDrive size={18} />
            <h2 className="font-bold text-base tracking-wide">
              Sinkronisasi & Manajemen Data
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 text-xs">
          {/* User Profile Summary Card */}
          <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-11 h-11 rounded-xl shadow-xs flex items-center justify-center text-xl font-bold"
                style={{ backgroundColor: currentUser.avatarBg || '#F59E0B' }}
              >
                {currentUser.avatarEmoji || '⚡'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-tight">{currentUser.name}</h3>
                  {currentUser.isGuest ? (
                    <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                      TAMU
                    </span>
                  ) : (
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                      TERVERIFIKASI
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-neutral-400">{currentUser.email}</div>
                <div className="text-[11px] font-medium text-neutral-500 mt-0.5">Peran: {currentUser.role}</div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-3 py-1.5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 cursor-pointer transition-colors"
            >
              Ganti Akun
            </button>
          </div>

          {/* Sync Status Banner */}
          <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-xl p-3.5 flex items-start gap-3">
            <ShieldCheck size={18} className="shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
            <div className="space-y-1">
              <div className="font-bold text-sky-900 dark:text-sky-200 uppercase font-mono">
                Penyimpanan Aman & Terisolasi Per-Akun
              </div>
              <p className="text-sky-800 dark:text-sky-300 font-normal leading-relaxed">
                Setiap profil akun memiliki database lokal tersendiri. Setiap perubahan tugas, log timer, dan kalender tersimpan otomatis secara real-time.
              </p>
            </div>
          </div>

          {/* Export & Import Backup */}
          <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 rounded-xl p-4 space-y-4">
            <div className="border-b border-neutral-200/60 dark:border-neutral-700/60 pb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 font-mono">
                CADANGAN DATA (BACKUP & RESTORE JSON)
              </h4>
              <p className="text-neutral-500 font-normal mt-0.5">
                Pindahkan data proyek Anda ke perangkat atau browser lain dengan mudah.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <Download size={14} />
                <span>Unduh Cadangan JSON</span>
              </button>
            </div>

            {/* Import box */}
            <div className="space-y-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
              <label className="block font-mono font-medium uppercase text-neutral-500">
                Tempelkan Teks JSON Cadangan untuk Impor:
              </label>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='Tempelkan isi file cadangan JSON di sini...'
                rows={3}
                className="w-full p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono text-[11px] focus:outline-hidden text-neutral-800 dark:text-neutral-200"
              />

              {importStatus === 'success' && (
                <div className="text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 font-mono">
                  ✓ Berhasil mengimpor data proyek!
                </div>
              )}
              {importStatus === 'error' && (
                <div className="text-xs font-medium text-rose-700 bg-rose-50 dark:bg-rose-950/50 p-2 rounded-lg border border-rose-200 dark:border-rose-800 font-mono">
                  ⚠️ Format JSON tidak valid atau struktur tidak cocok.
                </div>
              )}

              <button
                onClick={handleImportJSON}
                disabled={!importJsonText.trim()}
                className="px-4 py-2 bg-white dark:bg-neutral-800 hover:bg-neutral-100 disabled:opacity-40 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={14} />
                <span>Terapkan Impor JSON</span>
              </button>
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-xs text-neutral-900 dark:text-neutral-100 font-mono">Muat Ulang Sampel Demo</div>
              <div className="text-neutral-500 font-normal">
                Kembalikan daftar proyek, tugas, dan jadwal kalender contoh awal yang bersih.
              </div>
            </div>
            {confirmReset ? (
              <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60">
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">Yakin reset?</span>
                <button
                  type="button"
                  onClick={() => {
                    onDataReset();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold uppercase rounded-md cursor-pointer"
                >
                  Ya, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-neutral-500 hover:text-neutral-700 text-[11px] font-medium cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold uppercase cursor-pointer whitespace-nowrap"
              >
                Reset ke Demo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
