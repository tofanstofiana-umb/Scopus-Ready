# SCOPUS READY™ Digital Workbook

Checkpoint Sprint 1 menyediakan autentikasi Supabase nyata, session cookie, role peserta/trainer/admin, route protection, schema inti, dan Row Level Security (RLS).

Checkpoint Sprint 2 menambahkan proyek manuskrip persisten: peserta dapat membuat, melihat daftar, membuka, melakukan refresh, dan login kembali tanpa kehilangan proyek. Problem Builder, autosave, dan feedback tetap menjadi checkpoint sprint berikutnya.

Checkpoint Sprint 3 mengaktifkan lima jawaban Problem Builder dengan penyimpanan manual ke database, pemuatan kembali setelah refresh/login ulang, validasi berlapis, dan deteksi konflik antar-sesi. Autosave dan feedback trainer belum diaktifkan.

Checkpoint Sprint 4 mengaktifkan autosave nyata pada Problem Builder dengan debounce 1,2 detik, antrean penyimpanan tunggal, status menyimpan/berhasil/gagal, retry, dan perlindungan konflik antar-sesi. Tombol simpan manual tetap tersedia sebagai cadangan.

Checkpoint Sprint 5 mengaktifkan dashboard kelas trainer berbasis data nyata, pembacaan Problem Builder peserta, feedback persisten, status Perlu Revisi, tindak lanjut peserta, dan penyelesaian feedback oleh trainer.

Checkpoint Sprint 6 menjadikan worksheet status dan assessment sebagai satu-satunya sumber progres dan score. Dashboard peserta, halaman Score, dan tampilan trainer membaca hasil `getProjectMetrics()` yang sama; tidak ada lagi angka 72 atau 78 yang berdiri sendiri pada route produksi.

## Setup Supabase Local

Prasyarat: Node.js 22, Docker Desktop aktif, dan ruang disk kosong yang cukup untuk image Supabase.

1. Instal dependensi:

   ```bash
   npm install
   ```

2. Jalankan Supabase Local. Konfigurasi development ini hanya menyalakan layanan minimum untuk database, Auth, API, dan gateway agar lebih ringan:

   ```bash
   npm run supabase:start
   ```

3. Lihat URL dan key lokal:

   ```bash
   npm run supabase:status
   ```

4. Salin `.env.example` menjadi `.env.local`, kemudian isi nilai dari hasil status:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

5. Bangun ulang database dari migration dan seed data non-Auth:

   ```bash
   npm run supabase:reset
   ```

6. Buat akun login development untuk tiga role dan kelas uji:

   ```bash
   npm run supabase:seed-auth
   ```

   | Role | Email | Password |
   | --- | --- | --- |
   | Peserta | `peserta@scopusready.test` | `Participant123!` |
   | Trainer | `trainer@scopusready.test` | `Trainer123!` |
   | Admin | `admin@scopusready.test` | `Admin123!` |

   Script menolak URL selain `localhost`/`127.0.0.1`, sehingga kredensial development tidak dapat dibuat secara tidak sengaja pada proyek remote.

7. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

Registrasi publik melalui `/register` selalu menghasilkan role `participant`. Trainer dan admin hanya dapat ditetapkan melalui jalur administratif.

## Mencoba Sprint 2

1. Login sebagai peserta melalui `/login`.
2. Buka **Proyek Manuskrip** dari sidebar.
3. Pilih **Buat Proyek**, isi metadata, dan pilih kelas pendampingan.
4. Setelah proyek dibuat, aplikasi membuka halaman detail proyek.
5. Refresh halaman atau logout dan login kembali; proyek tetap tersedia di `/projects`.

Trainer hanya dapat membaca proyek yang dihubungkan ke kelasnya. Pada checkpoint Sprint 2, worksheet belum diaktifkan.

## Mencoba Sprint 4

1. Buka Problem Builder dari salah satu proyek peserta.
2. Ubah salah satu jawaban dan berhenti mengetik sejenak.
3. Pastikan status berubah dari **Menunggu autosave...** menjadi **Menyimpan ke database...**, lalu **Tersimpan otomatis di database**.
4. Refresh halaman atau logout dan login kembali; perubahan harus tetap tersedia.
5. Tombol **Simpan Sekarang** dapat digunakan sebagai cadangan tanpa menunggu debounce.

Jika koneksi gagal, gunakan **Coba Lagi**. Jika data telah diubah dari sesi lain, gunakan **Muat Ulang** agar versi terbaru tidak tertimpa.

## Mencoba Sprint 5

1. Buat proyek peserta yang terhubung ke kelas dan isi Problem Builder.
2. Login sebagai trainer, buka **Dashboard Trainer → Buka Kelas → Detail Peserta**.
3. Buka Problem Builder peserta, tulis komentar minimal 10 karakter, pilih prioritas, lalu klik **Kirim Feedback**.
4. Login kembali sebagai peserta. Problem Builder menampilkan status **Perlu Revisi** dan komentar trainer.
5. Perbaiki jawaban, tunggu autosave selesai, lalu pilih **Tandai Sudah Diperbaiki**.
6. Login sebagai trainer dan pilih **Tandai Selesai** setelah memeriksa revisi peserta.

Trainer hanya dapat memberikan feedback untuk pasangan proyek dan worksheet yang benar-benar berada dalam kelasnya.

## Mencoba Sprint 6

1. Login sebagai peserta dan buka dashboard.
2. Progres proyek dihitung dari seluruh 12 status modul: `not_started = 0`, `in_progress = 0.5`, `needs_revision = 0.75`, dan `completed = 1`.
3. Isi Problem Builder sebagian; progres menjadi `4,2%` karena satu modul berstatus `in_progress` dari 12 modul.
4. Setelah trainer memberi feedback, status menjadi `needs_revision` dan progres menjadi `6,3%`.
5. Buka halaman **SCOPUS READY Score**. Tanpa sepuluh assessment rubrik lengkap, aplikasi menampilkan **Belum dinilai**, bukan angka contoh.

Score dihitung dari assessment tersimpan dan baru diterbitkan ketika kesepuluh dimensi memiliki nilai serta maksimum yang sesuai dengan rubrik resmi.

## Supabase hosted

Untuk lingkungan hosted, buat proyek Supabase, isi URL dan anon key proyek, lalu jalankan migration melalui workflow CLI yang terhubung. Jangan menjalankan `supabase:seed-auth` terhadap proyek remote dan jangan memasukkan service-role key ke browser.

Tanpa environment Supabase, route yang dilindungi ditutup dan pengguna diarahkan kembali ke login. Tidak ada fallback mock untuk autentikasi produksi.

## Quality gates

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

Integration test dan E2E menggunakan akun hasil `npm run supabase:seed-auth`. Nilai defaultnya sudah tersedia di `.env.example`:

```text
E2E_PARTICIPANT_EMAIL=
E2E_PARTICIPANT_PASSWORD=
SUPABASE_TEST_PARTICIPANT_EMAIL=
SUPABASE_TEST_PARTICIPANT_PASSWORD=
SUPABASE_TEST_TRAINER_EMAIL=
SUPABASE_TEST_TRAINER_PASSWORD=
SUPABASE_TEST_ADMIN_EMAIL=
SUPABASE_TEST_ADMIN_PASSWORD=
```

Jalankan `npm run test:e2e`. Perintah ini melakukan build produksi, menyalakan server uji di port `3100`, lalu menguji desktop dan emulasi mobile. Jika ingin memakai server yang sudah berjalan, isi `E2E_BASE_URL`.

## Keamanan

- Session dikelola Supabase SSR melalui cookie dan `src/proxy.ts`.
- Route diperiksa berdasarkan role; akses data tetap ditegakkan oleh PostgreSQL Row Level Security.
- Participant hanya dapat membaca atau mengubah data miliknya.
- Trainer hanya dapat membaca peserta dan proyek dalam kelas yang ditugaskan.
- Pemilihan kelas proyek diperiksa ulang pada Data Access Layer dan PostgreSQL RLS.
- RPC Problem Builder hanya menerima lima field yang diizinkan, membatasi panjang jawaban, memeriksa kepemilikan proyek, dan menolak penyimpanan versi lama.
- Penulisan feedback hanya melalui RPC tervalidasi yang memeriksa role trainer, kelas, proyek, dan worksheet sebagai satu hubungan.
- Progres dihitung dari status seluruh modul; score dihitung dari assessment rubrik lengkap dan tidak dapat diedit sebagai angka dashboard.
- `SUPABASE_SERVICE_ROLE_KEY` tidak digunakan oleh runtime client.
- Score penuh tidak ditampilkan sampai rubrik lengkap tersedia.

## Struktur MVP

- `src/services`: satu pintu akses identitas dan data.
- `src/domain`: permission helpers murni.
- `src/validation`: validasi server dengan Zod.
- `src/lib/supabase`: client SSR, browser, dan session proxy.
- `supabase/migrations`: schema, trigger, helper, RLS, dan seed modul.
- `tests`: unit, integrasi RLS, serta E2E role dan route protection.
