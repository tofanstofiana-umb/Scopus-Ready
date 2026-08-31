-- Library resources: reading materials and tutorial videos, curated per
-- workbook module (or cross-module for "materi pendukung"), managed by
-- admin and read by everyone. Follows the worksheet_modules RLS pattern
-- (authenticated read, admin manage) rather than the notifications pattern
-- (service-role insert) — here the admin genuinely writes through their own
-- authenticated session, there's no "on behalf of another user" insert.

create table if not exists public.library_resources (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.worksheet_modules(id) on delete set null,
  category text not null check (category in ('bacaan','video','template','rubrik','prompt')),
  title text not null,
  description text not null,
  body text,
  url text,
  sequence integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists library_resources_module_idx on public.library_resources(module_id, sequence);

alter table public.library_resources enable row level security;

create policy "authenticated read published resources" on public.library_resources for select to authenticated
using (is_published = true or public.current_user_role() = 'admin');

create policy "admin manage resources" on public.library_resources for all to authenticated
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

-- Seed from the approved "Peta Materi TULIS" content concept. Everything
-- stays draft (title + description only) until admin fills in real body/url
-- content, except one worked example so the feature ships with something
-- real to look at.
insert into public.library_resources (module_id, category, title, description, body, url, sequence, is_published)
select id, 'bacaan', 'Dari Fenomena ke Klaim: Menulis Problem Statement yang Bisa Diuji',
  'Mengubah gejala yang diamati menjadi klaim awal yang jelas batasnya.',
  E'Problem statement yang baik bukan keluhan tentang dunia, melainkan klaim yang bisa diuji. Bedanya sederhana: keluhan berhenti di "ini masih jadi masalah", sementara klaim menyebutkan siapa yang terdampak, dalam kondisi apa, dan mengapa kondisi itu belum terjawab literatur.\n\nMulai dari fenomena yang benar-benar Anda amati, bukan topik yang terdengar populer. Tuliskan dulu gejalanya dalam satu kalimat lugas, lalu tanyakan tiga hal: siapa yang mengalami gejala ini, data atau pengamatan apa yang menunjukkan gejala itu nyata, dan mengapa gejala ini penting diselesaikan sekarang. Jawaban atas tiga pertanyaan itulah yang menjadi Data pendukung klaim Anda dalam kerangka Toulmin — bukan asumsi, bukan opini.\n\nSetelah itu, uji batasnya. Klaim yang terlalu luas ("pendidikan di Indonesia bermasalah") tidak bisa diuji; klaim yang spesifik ("mahasiswa semester akhir di bidang X kesulitan menyusun argumentasi ilmiah karena Y") bisa. Semakin spesifik klaim, semakin mudah pula Anda kelak menunjukkan warrant dan backing-nya di modul-modul berikutnya.\n\nProblem Builder ada di awal alur bukan kebetulan: setiap modul sesudahnya — Literature Map, Gap Detector, hingga Novelty Builder — akan terus menguji apakah klaim ini masih berdiri. Semakin jujur dan spesifik Anda merumuskannya di sini, semakin ringan pekerjaan menulis argumentasi di tahap selanjutnya.',
  null, 1, true
from public.worksheet_modules where code = 'problem';

insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'video', 'Merumuskan Problem Statement dalam 10 Menit', 'Simulasi proses menemukan ide sampai menjadi klaim awal.', 2, false
from public.worksheet_modules where code = 'problem';

insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'bacaan', 'Strategi Pencarian Literatur di Scopus dan Google Scholar', 'Menyusun kata kunci dan filter agar data yang terkumpul relevan.', 1, false
from public.worksheet_modules where code = 'literature';
insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'video', 'Tutorial Pencarian dan Penyaringan Literatur', 'Praktik langsung di Scopus dan Publish or Perish.', 2, false
from public.worksheet_modules where code = 'literature';

insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'bacaan', 'Empat Jenis Research Gap', 'Teoretis, metodologis, kontekstual, dan empiris — mengenali di mana penalaran bidang ilmu masih lemah.', 1, false
from public.worksheet_modules where code = 'gap';
insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'video', 'Menemukan Gap dari Kumpulan Literature Map', 'Membandingkan temuan untuk melihat pola yang hilang.', 2, false
from public.worksheet_modules where code = 'gap';

insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'bacaan', 'Novelty, Kontribusi, dan Signifikansi', 'Tiga hal yang sering tertukar — memperjelas apa yang sebenarnya dinilai reviewer.', 1, false
from public.worksheet_modules where code = 'novelty';
insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'video', 'Menguji Kekuatan Novelty Statement', 'Latihan menantang klaim kebaruan sendiri sebelum reviewer melakukannya.', 2, false
from public.worksheet_modules where code = 'novelty';

insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'bacaan', 'Struktur IMRaD dan Kapan Menyimpangi Polanya', 'Menyusun kerangka artikel yang mengikuti alur argumentasi, bukan sekadar format.', 1, false
from public.worksheet_modules where code = 'blueprint';
insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'video', 'Membuat Blueprint Artikel dalam 30 Menit', 'Dari Problem Builder dan Novelty Builder menjadi outline utuh.', 2, false
from public.worksheet_modules where code = 'blueprint';

insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'bacaan', 'Memilih Desain Penelitian yang Sesuai dengan Klaim', 'Menghindari metode populer yang tidak menjawab pertanyaan penelitian.', 1, false
from public.worksheet_modules where code = 'method';
insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'video', 'Menyesuaikan Metode dengan Tujuan Penelitian', 'Studi kasus pemilihan desain untuk tiga jenis pertanyaan penelitian berbeda.', 2, false
from public.worksheet_modules where code = 'method';

insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'bacaan', 'Scientific Storytelling: Menyusun Alur dari Masalah ke Simpulan', 'Menjaga benang merah argumen tetap utuh sepanjang naskah.', 1, false
from public.worksheet_modules where code = 'scientific_story';
insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'video', 'Contoh Alur Cerita Ilmiah yang Kuat', 'Anatomi naskah yang argumennya mengalir logis dari awal sampai akhir.', 2, false
from public.worksheet_modules where code = 'scientific_story';

insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'bacaan', 'Membaca Aims & Scope Jurnal Secara Strategis', 'Menilai kecocokan naskah dengan audiens dan fokus jurnal, bukan sekadar peringkatnya.', 1, false
from public.worksheet_modules where code = 'journal_target';
insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'video', 'Tutorial Mengecek Kredibilitas Jurnal di Scopus dan Sinta', 'Praktik langsung memeriksa jurnal target.', 2, false
from public.worksheet_modules where code = 'journal_target';

insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'bacaan', 'Membaca Naskah Sendiri seperti Reviewer', 'Checklist self-review lima gerbang sebelum meminta penilaian trainer.', 1, false
from public.worksheet_modules where code = 'internal_review';
insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'video', 'Simulasi Dialog Reflektif dengan AI sebagai Peretas Pedagogis', 'Contoh sesi tanya-tantang-koreksi tanpa AI menuliskan ulang argumen.', 2, false
from public.worksheet_modules where code = 'internal_review';

insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'bacaan', 'Menyesuaikan Gaya Sitasi dan Format tanpa Melemahkan Argumen', 'Perbedaan antara mengubah bentuk dan mengubah makna.', 1, false
from public.worksheet_modules where code = 'journal_adaptation';
insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'video', 'Tutorial Format Ulang Naskah Sesuai Author Guidelines', 'Menyesuaikan struktur dan sitasi ke format jurnal target.', 2, false
from public.worksheet_modules where code = 'journal_adaptation';

insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'bacaan', 'Dokumen Wajib Saat Submit', 'Highlights, graphical abstract, dan kelengkapan lain yang sering terlewat.', 1, false
from public.worksheet_modules where code = 'submission';
insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'video', 'Tutorial Submit Naskah via OJS/Editorial Manager', 'Langkah demi langkah proses unggah.', 2, false
from public.worksheet_modules where code = 'submission';

insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'bacaan', 'Apa yang Terjadi Setelah Submit?', 'Memahami alur proses review — dari desk review, peer review, hingga keputusan editor.', 1, false
from public.worksheet_modules where code = 'roadmap';
insert into public.library_resources (module_id, category, title, description, sequence, is_published)
select id, 'video', 'Studi Kasus: Perjalanan dari Submit sampai Accepted', 'Linimasa nyata satu manuskrip dari kelas sebelumnya.', 2, false
from public.worksheet_modules where code = 'roadmap';

insert into public.library_resources (module_id, category, title, description, sequence, is_published) values
  (null, 'template', 'Template Workbook Lengkap', 'Rangkuman seluruh 12 lembar kerja dalam satu dokumen.', 1, false),
  (null, 'rubrik', 'Rubrik SCOPUS READY Score™', '10 dimensi penilaian trainer beserta bobotnya.', 2, false),
  (null, 'prompt', 'Katalog Prompt AI (Peretas Pedagogis)', 'Kumpulan prompt yang bertanya dan menantang, bukan menuliskan ulang argumen peserta.', 3, false),
  (null, 'video', 'Mengenal SCOPUS READY™ dalam 5 Menit', 'Orientasi peserta baru terhadap alur workbook dan Model TULIS.', 4, false);
