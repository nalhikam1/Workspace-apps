# Rencana Implementasi: Transformasi Work Studio & Pengalaman Interaktif Audio-Visual

Pembaruan ini mentransformasikan aplikasi menjadi **Work Studio** dengan gaya **Minimalis Modern yang lembut dan elegan**, menyempurnakan fitur Pomodoro (tombol "Mulai", durasi menit kustom tanpa batas, perbaikan desimal status `0.393939%`), menghadirkan fitur produktivitas komprehensif (**Dark/Light Mode**, **Ambient Audio Player**, **Ekspor Excel/PDF**, **Pengingat Deadline**), serta menambahkan **efek suara klik sintetis yang memuaskan dan feedback visual klik pada seluruh tombol aktif**.

---

## 1. Efek Suara Klik & Animasi Klik pada Seluruh Tombol Aktif

### A. Generator Suara Klik Taktil (Web Audio API)
- Membuat modul audio global (`src/services/soundEffects.ts`) yang menghasilkan suara klik mekanis/taktil lembut (*satisfying haptic click*):
  - Menggunakan Web Audio API sintetis (frekuensi pitch pendek ~800Hz ke ~400Hz dengan durasi 20–30ms dan gain exponential decay).
  - Ringan, bebas lag, tanpa latensi unduhan file MP3/WAV eksternal.
  - Listener global atau helper pada event klik tombol (`data-sound="click"` atau handler otomatis pada `<button>`) sehingga bekerja di semua tombol navigasi, kontrol timer, aksi modal, dan checklist.
  - Tombol toggle on/off suara klik di Navbar atau Pengaturan dengan status yang tersimpan di `localStorage`.

### B. Efek Visual Klik (Tactile Feedback & Micro-interactions)
- Menambahkan kelas utilitas animasi klik di `src/index.css`:
  - `active:scale-[0.97]` atau `active:translate-y-0.5` untuk memberikan sensasi tombol fisik yang ditekan secara nyata.
  - Transisi halus `transition-all duration-100 ease-out`.
  - Efek fokus visual yang rapi dan elegan saat tombol di-hover atau ditekan.

---

## 2. Perbaikan Inti & Penyesuaian Pomodoro

### A. Ubah Teks Tombol Menjadi "Mulai"
- Mengganti teks tombol `"Mulai Bekerja"` pada timer Pomodoro dan Stopwatch di `src/components/WorkingStudio.tsx` menjadi `"Mulai"`.

### B. Pengaturan Menit Pomodoro Bebas Tanpa Batas
- Menambahkan kontrol durasi fleksibel di samping preset cepat (15m, 25m, 45m, 60m, 90m):
  - Input angka kustom menit kerja (contoh: 10, 35, 75, 120 menit atau berapapun tanpa batasan).
  - Validasi durasi dinamis yang otomatis menghitung sisa detik (`customMinutes * 60`).
  - Input langsung yang responsif dan tersinkronisasi dengan timer display.

### C. Perbaikan Bug Desimal Status Real-Time (`0.393939...%`)
- **Penyebab**: Perhitungan progres pada mode Stopwatch `(stopwatchSeconds / (60 * 60)) * 100` tidak dibulatkan sehingga menghasilkan angka desimal tak terhingga (contoh: `0.3939393939%`).
- **Solusi**:
  - Terapkan pembulatan konsisten: `Math.round(progressPercent)` pada seluruh mode timer (Pomodoro, Break, dan Stopwatch).
  - Terapkan kelas `font-mono tabular-nums` agar angka tidak bergetar (*no layout jitter*) saat counter detik berjalan.
  - Audit seluruh kalkulasi jam fokus dan rasio penyelesaian di `AnalyticsDashboard.tsx`, `ProjectBoard.tsx`, dan `ProjectManager.tsx`.

---

## 3. Rebranding: "WORK STUDIO" & Desain Minimalis Modern Elegan

### A. Identitas & Meta
- Perbarui judul aplikasi menjadi **Work Studio** pada:
  - `metadata.json` (nama & deskripsi aplikasi).
  - `index.html` (`<title>`, `<meta name="description">`, OpenGraph).
  - `src/components/Navbar.tsx` (logo `WORK STUDIO // PLANNER & FOCUS`).
  - Komponen footer dan dokumen ekspor cadangan.

### B. Evolusi Gaya Visual: Minimalis Modern yang Lembut & Elegan
- Bertransisi dari gaya *heavy Neo-Brutalist* (border 3–4px hitam tebal dengan bayangan kaku) menuju **Minimalis Modern**:
  - Sudut elemen membulat halus (`rounded-xl` dan `rounded-2xl`).
  - Garis batas halus dan presisi (`border border-neutral-200 dark:border-neutral-800`).
  - Bayangan lembut berlapis (*soft diffused ambient shadows*).
  - Palet warna bersih berbasis neutral slate/zinc dengan aksen modern (Electric Amber `#F59E0B`, Emerald `#10B981`, Indigo `#6366F1`, dan Rose `#F43F5E`).

### C. Tema Gelap & Terang (Dark / Light Mode)
- Menambahkan state tema global (`theme: 'light' | 'dark'`) dengan toggle ikon Matahari/Bulan di Navbar.
- Dukungan kelas Tailwind `dark:` yang rapi di seluruh komponen (latar belakang lembut `dark:bg-neutral-950`, kartu `dark:bg-neutral-900`, teks kontras tinggi yang ramah mata).
- Tersimpan otomatis di profil dan `localStorage`.

---

## 4. Fitur Baru Produktivitas

### A. Audio Suara Alam & Lo-fi Player di Mode Kerja (Focus Studio)
- Generator audio berbasis **Web Audio API** sintetis langsung di browser (ringan, tanpa dependensi file eksternal yang berat, bekerja offline):
  - 🌧️ **Hujan Halus (Raindrops)**: Relaksasi suara deburan air hujan lembut.
  - ☕ **Suasana Kafe (Coffee Ambiance)**: Gemerisik suara latar kerja fokus.
  - 🌊 **White Noise / Deep Focus Drone**: Frekuensi peredam distraksi sekitar.
  - 🎵 **Lofi Pulse Rhythm**: Detak ritme pelan penunjang konsentrasi.
- Kontrol play/pause, pilihan mode suara, dan slider volume langsung di panel Ruang Kerja.

### B. Ekspor Laporan Analitik ke Excel (CSV) & Format Cetak / PDF
- **Ekspor Excel (CSV)**:
  - Mengunduh file `.csv` terstruktur berisi ringkasan tugas, proyek, tanggal tenggat, status, prioritas, dan log waktu kerja fokus yang dapat dibuka di Microsoft Excel, Google Sheets, atau Apple Numbers.
- **Ekspor PDF / Cetak Laporan**:
  - Tombol *"Cetak Laporan Produktivitas"* yang membuka jendela cetak browser / opsi Simpan sebagai PDF dengan layout khusus cetak (`@media print`) yang bersih dan rapi.

### C. Pengingat Tenggat Waktu & Widget Deadline
- **Widget Notifikasi Deadline di Topbar**:
  - Ikon lonceng notifikasi dengan badge merah penanda tugas yang terlambat (*overdue*) atau mendekati tenggat (< 24 jam dan < 3 hari).
  - Dropdown daftar tugas mendesak dengan tombol langsung menuju kartu tugas terkait.
- **Banner Peringatan Halus**:
  - Banner perhatian di Dashboard Analitik dan Planner yang mengingatkan target deadline penting minggu ini.

---

## 5. Rencana Langkah Pengerjaan

1. **Langkah 1**: Perbarui `metadata.json` dan `index.html` dengan identitas nama **Work Studio** dan font modern.
2. **Langkah 2**: Buat modul efek audio sintetis (`src/services/soundEffects.ts`) untuk suara klik tombol dan ambient noise (hujan, kafe, white noise). Pasang listener klik global dan animasi tekan `active:scale-[0.97]`.
3. **Langkah 3**: Modifikasi `src/types/index.ts` untuk mendukung preferensi tema (`theme`), preferensi audio klik (`soundEnabled`), durasi kustom pomodoro, dan data ekspor.
4. **Langkah 4**: Perbaiki `src/components/WorkingStudio.tsx`:
   - Ganti teks tombol menjadi *"Mulai"*.
   - Tambahkan input menit pomodoro bebas kustom (tanpa batas).
   - Perbaiki bug desimal persentase status real-time dengan `Math.round()`.
   - Pasang panel Ambient Sound & Lofi player.
5. **Langkah 5**: Implementasikan Dark/Light mode di `App.tsx`, `index.css`, pasang toggle tema dan toggle suara klik pada `Navbar.tsx`.
6. **Langkah 6**: Tambahkan modul Ekspor Excel (CSV) dan Print PDF di `AnalyticsDashboard.tsx`.
7. **Langkah 7**: Pasang widget Notifikasi Deadline di Navbar dan Banner Tugas Kritis.
8. **Langkah 8**: Verifikasi build via `compile_applet` dan `lint_applet` untuk memastikan seluruh fitur berjalan bebas error.
