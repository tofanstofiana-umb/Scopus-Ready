# SCOPUS READY™ Digital Workbook

Checkpoint Sprint 1 menyediakan autentikasi Supabase nyata, session cookie, role peserta/trainer/admin, route protection, schema inti, dan Row Level Security (RLS).

Checkpoint Sprint 2 menambahkan proyek manuskrip persisten: peserta dapat membuat, melihat daftar, membuka, melakukan refresh, dan login kembali tanpa kehilangan proyek. Problem Builder, autosave, dan feedback tetap menjadi checkpoint sprint berikutnya.

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

Trainer hanya dapat membaca proyek yang dihubungkan ke kelasnya. Worksheet belum diaktifkan pada checkpoint ini.

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
- `SUPABASE_SERVICE_ROLE_KEY` tidak digunakan oleh runtime client.
- Score penuh tidak ditampilkan sampai rubrik lengkap tersedia.

## Struktur MVP

- `src/services`: satu pintu akses identitas dan data.
- `src/domain`: permission helpers murni.
- `src/validation`: validasi server dengan Zod.
- `src/lib/supabase`: client SSR, browser, dan session proxy.
- `supabase/migrations`: schema, trigger, helper, RLS, dan seed modul.
- `tests`: unit, integrasi RLS, serta E2E role dan route protection.
