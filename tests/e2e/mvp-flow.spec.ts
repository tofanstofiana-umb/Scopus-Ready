import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

type RoleAccount = {
  email?: string;
  password?: string;
  destination: "/dashboard" | "/trainer" | "/admin";
};

const accounts: Record<"participant" | "trainer" | "admin", RoleAccount> = {
  participant: {
    email: process.env.E2E_PARTICIPANT_EMAIL,
    password: process.env.E2E_PARTICIPANT_PASSWORD,
    destination: "/dashboard",
  },
  trainer: {
    email: process.env.SUPABASE_TEST_TRAINER_EMAIL,
    password: process.env.SUPABASE_TEST_TRAINER_PASSWORD,
    destination: "/trainer",
  },
  admin: {
    email: process.env.SUPABASE_TEST_ADMIN_EMAIL,
    password: process.env.SUPABASE_TEST_ADMIN_PASSWORD,
    destination: "/admin",
  },
};

async function login(page: import("@playwright/test").Page, account: RoleAccount) {
  await page.goto("/login");
  await page.getByLabel("Email Akun").fill(account.email!);
  await page.locator('input[name="password"]').fill(account.password!);
  await page.getByRole("button", { name: /^Masuk$/i }).click();
  await expect(page).toHaveURL(new RegExp(`${account.destination}$`));
}

test("anonymous and expired sessions are redirected to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);

  const participant = accounts.participant;
  test.skip(!participant.email || !participant.password, "Set E2E participant credentials first");
  await login(page, participant);
  await page.context().clearCookies();
  await page.goto("/projects");
  await expect(page).toHaveURL(/\/login\?next=%2Fprojects$/);
});

for (const [role, account] of Object.entries(accounts) as [keyof typeof accounts, RoleAccount][]) {
  test(`${role} is sent to the correct role home`, async ({ page }) => {
    test.skip(!account.email || !account.password, `Set E2E ${role} credentials first`);
    await login(page, account);
  });
}

test("participant cannot open trainer or admin routes", async ({ page }) => {
  const participant = accounts.participant;
  test.skip(!participant.email || !participant.password, "Set E2E participant credentials first");
  await login(page, participant);

  await page.goto("/trainer");
  await expect(page).toHaveURL(/\/unauthorized$/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/unauthorized$/);
});

test("trainer cannot open participant or admin routes", async ({ page }) => {
  const trainer = accounts.trainer;
  test.skip(!trainer.email || !trainer.password, "Set E2E trainer credentials first");
  await login(page, trainer);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/unauthorized$/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/unauthorized$/);

  await page.goto("/score");
  await expect(page).toHaveURL(/\/score$/);
  await expect(page.getByRole("heading", { name: "SCOPUS READY Score" })).toBeVisible();
});

test("participant creates and reopens a persistent manuscript project", async ({ page }, testInfo) => {
  const participant = accounts.participant;
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  test.skip(
    !participant.email || !participant.password || !serviceUrl || !serviceRoleKey,
    "Set participant and local Supabase service credentials first",
  );

  let createdProjectId: string | undefined;
  const title = `Proyek E2E ${testInfo.project.name} ${Date.now()}`;
  try {
    await login(page, participant);
    await page.goto("/projects/new");
    await page.getByLabel("Judul manuskrip").fill(title);
    await page.getByLabel("Bidang penelitian").fill("Pendidikan Digital");
    await page.getByLabel("Tahap penelitian").selectOption("proposal");
    await expect(page.getByLabel("Kelas pendampingan")).not.toHaveValue("");
    await page.getByRole("button", { name: /^Buat Proyek$/ }).click();

    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]{36}$/);
    createdProjectId = page.url().split("/").at(-1);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await page.goto("/projects");
    await expect(page.getByRole("link", { name: new RegExp(title) })).toBeVisible();
  } finally {
    if (createdProjectId) {
      const service = createClient(serviceUrl!, serviceRoleKey!, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      await service.from("projects").delete().eq("id", createdProjectId);
    }
  }
});

test("participant autosaves and restores five Problem Builder answers", async ({ page }, testInfo) => {
  const participant = accounts.participant;
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  test.skip(
    !participant.email || !participant.password || !serviceUrl || !serviceRoleKey,
    "Set participant and local Supabase service credentials first",
  );

  let createdProjectId: string | undefined;
  const service = createClient(serviceUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const title = `Problem Builder E2E ${testInfo.project.name} ${Date.now()}`;
  const answers = [
    { label: "Apa topik penelitian Anda?", value: "Pembelajaran digital di perguruan tinggi" },
    { label: "Fenomena apa yang sedang terjadi?", value: "Penggunaan platform digital meningkat pesat." },
    { label: "Apa yang menjadi masalah?", value: "Keterlibatan mahasiswa belum optimal." },
    { label: "Apa bukti bahwa masalah itu ada?", value: "Data kehadiran menunjukkan interaksi yang menurun." },
    { label: "Mengapa masalah tersebut penting?", value: "Keterlibatan memengaruhi capaian hasil belajar." },
  ];

  try {
    await login(page, participant);
    await page.goto("/projects/new");
    await page.getByLabel("Judul manuskrip").fill(title);
    await page.getByLabel("Bidang penelitian").fill("Pendidikan Digital");
    await page.getByRole("button", { name: /^Buat Proyek$/ }).click();
    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]{36}$/);
    createdProjectId = page.url().split("/").at(-1);

    await page.getByRole("link", { name: "Buka Problem Builder" }).click();
    for (const [index, answer] of answers.entries()) {
      await page.getByLabel(answer.label).fill(answer.value);
      if (index < answers.length - 1) {
        await page.getByRole("button", { name: "Lanjut" }).click();
      }
    }
    await expect(page.getByText("Menunggu autosave...")).toBeVisible();
    await expect(page.getByText("Tersimpan otomatis di database")).toBeVisible();
    await expect.poll(async () => {
      const { data } = await service
        .from("worksheet_answers")
        .select("content")
        .eq("project_id", createdProjectId!)
        .maybeSingle();
      return data?.content;
    }).toEqual(Object.fromEntries(answers.map((answer, index) => [
      ["topic", "phenomenon", "problem", "evidence", "importance"][index],
      answer.value,
    ])));

    await page.reload();
    await expect(page.getByLabel(answers[0].label)).toHaveValue(answers[0].value);
    await page.getByRole("button", { name: "Buka langkah 5" }).click();
    await expect(page.getByLabel(answers[4].label)).toHaveValue(answers[4].value);

    await page.context().clearCookies();
    await login(page, participant);
    await page.goto(`/projects/${createdProjectId}/workbook/problem`);
    await expect(page.getByLabel(answers[0].label)).toHaveValue(answers[0].value);
  } finally {
    if (createdProjectId) {
      await service.from("projects").delete().eq("id", createdProjectId);
    }
  }
});

test("participant autosaves and restores Literature Map and Gap Detector", async ({ page }, testInfo) => {
  const participant = accounts.participant;
  const trainer = accounts.trainer;
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  test.skip(
    !participant.email || !participant.password || !trainer.email || !trainer.password || !serviceUrl || !serviceRoleKey,
    "Set participant, trainer, and local Supabase service credentials first",
  );

  const service = createClient(serviceUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  let createdProjectId: string | undefined;
  const title = `Structured E2E ${testInfo.project.name} ${Date.now()}`;
  const literatureFirst = "Temuan konsisten tentang keterlibatan digital.";
  const gapFirst = "Keterlibatan digital telah banyak diteliti.";
  const feedbackComment = `Perkuat sintesis teori pada Literature Map ${testInfo.project.name}.`;

  try {
    await login(page, participant);
    await page.goto("/projects/new");
    await page.getByLabel("Judul manuskrip").fill(title);
    await page.getByLabel("Bidang penelitian").fill("Pendidikan Digital");
    await page.getByRole("button", { name: /^Buat Proyek$/ }).click();
    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]{36}$/);
    createdProjectId = page.url().split("/").at(-1);

    await page.getByRole("link", { name: "Buka Literature Map" }).click();
    await page.getByLabel("Apa temuan utama penelitian terdahulu?").fill(literatureFirst);
    await expect(page.getByText("Tersimpan otomatis di database")).toBeVisible();
    await page.goto(`/projects/${createdProjectId}`);
    await page.getByRole("link", { name: "Buka Gap Detector" }).click();
    await page.getByLabel("Apa yang sudah diketahui?").fill(gapFirst);
    await expect(page.getByText("Tersimpan otomatis di database")).toBeVisible();

    await expect.poll(async () => {
      const { data } = await service
        .from("worksheet_answers")
        .select("content")
        .eq("project_id", createdProjectId!);
      return data?.map((answer) => answer.content);
    }).toEqual(expect.arrayContaining([
      expect.objectContaining({ key_findings: literatureFirst }),
      expect.objectContaining({ established_knowledge: gapFirst }),
    ]));

    await page.context().clearCookies();
    await login(page, participant);
    await page.goto(`/projects/${createdProjectId}/workbook/literature`);
    await expect(page.getByLabel("Apa temuan utama penelitian terdahulu?")).toHaveValue(literatureFirst);
    await page.goto(`/projects/${createdProjectId}/workbook/gap`);
    await expect(page.getByLabel("Apa yang sudah diketahui?")).toHaveValue(gapFirst);

    await page.context().clearCookies();
    await login(page, trainer);
    await page.goto(`/trainer/projects/${createdProjectId}/literature`);
    await expect(page.getByText(literatureFirst)).toBeVisible();
    await page.getByLabel("Komentar").fill(feedbackComment);
    await page.getByLabel("Prioritas").selectOption("high");
    await page.getByRole("button", { name: "Kirim Feedback" }).click();
    await expect(page.getByText("Feedback berhasil disimpan.")).toBeVisible();

    await page.context().clearCookies();
    await login(page, participant);
    await page.goto(`/projects/${createdProjectId}/workbook/literature`);
    await expect(page.getByText("Status Literature Map: Perlu Revisi")).toBeVisible();
    await expect(page.getByText(feedbackComment)).toBeVisible();
  } finally {
    if (createdProjectId) await service.from("projects").delete().eq("id", createdProjectId);
  }
});

test("participant and trainer complete the Novelty Builder and Article Blueprint flow", async ({ page }, testInfo) => {
  const participant = accounts.participant;
  const trainer = accounts.trainer;
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  test.skip(
    !participant.email || !participant.password || !trainer.email || !trainer.password || !serviceUrl || !serviceRoleKey,
    "Set participant, trainer, and local Supabase service credentials first",
  );

  const service = createClient(serviceUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  let createdProjectId: string | undefined;
  const title = `Sprint 11 E2E ${testInfo.project.name} ${Date.now()}`;
  const noveltyValue = "Celah longitudinal pada institusi kecil belum dijawab.";
  const blueprintValue = "Model Keterlibatan Adaptif pada Institusi Kecil";
  const feedbackComment = `Perjelas hubungan gap dan novelty ${testInfo.project.name}.`;

  try {
    await login(page, participant);
    await page.goto("/projects/new");
    await page.getByLabel("Judul manuskrip").fill(title);
    await page.getByLabel("Bidang penelitian").fill("Pendidikan Digital");
    await page.getByRole("button", { name: /^Buat Proyek$/ }).click();
    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]{36}$/);
    createdProjectId = page.url().split("/").at(-1);

    await page.getByRole("link", { name: "Buka Novelty Builder" }).click();
    await page.getByLabel("Research gap apa yang menjadi dasar penelitian Anda?").fill(noveltyValue);
    await expect(page.getByText("Tersimpan otomatis di database")).toBeVisible();

    await page.goto(`/projects/${createdProjectId}`);
    await page.getByRole("link", { name: "Buka Article Blueprint" }).click();
    await page.getByLabel("Apa judul kerja manuskrip Anda?").fill(blueprintValue);
    await expect(page.getByText("Tersimpan otomatis di database")).toBeVisible();

    await expect.poll(async () => {
      const { data } = await service
        .from("worksheet_answers")
        .select("content")
        .eq("project_id", createdProjectId!);
      return data?.map((answer) => answer.content);
    }).toEqual(expect.arrayContaining([
      expect.objectContaining({ gap_basis: noveltyValue }),
      expect.objectContaining({ working_title: blueprintValue }),
    ]));

    await page.context().clearCookies();
    await login(page, participant);
    await page.goto(`/projects/${createdProjectId}/workbook/blueprint`);
    await expect(page.getByLabel("Apa judul kerja manuskrip Anda?")).toHaveValue(blueprintValue);

    await page.context().clearCookies();
    await login(page, trainer);
    await page.goto(`/trainer/projects/${createdProjectId}/novelty`);
    await expect(page.getByText(noveltyValue)).toBeVisible();
    await page.getByLabel("Komentar").fill(feedbackComment);
    await page.getByLabel("Prioritas").selectOption("high");
    await page.getByRole("button", { name: "Kirim Feedback" }).click();
    await expect(page.getByText("Feedback berhasil disimpan.")).toBeVisible();

    await page.context().clearCookies();
    await login(page, participant);
    await page.goto(`/projects/${createdProjectId}/workbook/novelty`);
    await expect(page.getByText("Status Novelty Builder: Perlu Revisi")).toBeVisible();
    await expect(page.getByText(feedbackComment)).toBeVisible();
  } finally {
    if (createdProjectId) await service.from("projects").delete().eq("id", createdProjectId);
  }
});

test("participant and trainer complete the Method Fit and Scientific Story flow", async ({ page }, testInfo) => {
  const participant = accounts.participant;
  const trainer = accounts.trainer;
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  test.skip(
    !participant.email || !participant.password || !trainer.email || !trainer.password || !serviceUrl || !serviceRoleKey,
    "Set participant, trainer, and local Supabase service credentials first",
  );

  const service = createClient(serviceUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  let createdProjectId: string | undefined;
  const title = `Sprint 12 E2E ${testInfo.project.name} ${Date.now()}`;
  const methodValue = "Studi longitudinal dengan pendekatan campuran.";
  const storyValue = "Pendampingan adaptif memperkuat keterlibatan mahasiswa.";
  const feedbackComment = `Perjelas justifikasi pemilihan desain ${testInfo.project.name}.`;

  try {
    await login(page, participant);
    await page.goto("/projects/new");
    await page.getByLabel("Judul manuskrip").fill(title);
    await page.getByLabel("Bidang penelitian").fill("Pendidikan Digital");
    await page.getByRole("button", { name: /^Buat Proyek$/ }).click();
    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]{36}$/);
    createdProjectId = page.url().split("/").at(-1);

    await page.getByRole("link", { name: "Buka Method Fit" }).click();
    await page.getByLabel("Desain penelitian apa yang paling sesuai?").fill(methodValue);
    await expect(page.getByText("Tersimpan otomatis di database")).toBeVisible();

    await page.goto(`/projects/${createdProjectId}`);
    await page.getByRole("link", { name: "Buka Scientific Story" }).click();
    await page.getByLabel("Apa pesan ilmiah utama manuskrip Anda?").fill(storyValue);
    await expect(page.getByText("Tersimpan otomatis di database")).toBeVisible();

    await expect.poll(async () => {
      const { data } = await service
        .from("worksheet_answers")
        .select("content")
        .eq("project_id", createdProjectId!);
      return data?.map((answer) => answer.content);
    }).toEqual(expect.arrayContaining([
      expect.objectContaining({ research_design: methodValue }),
      expect.objectContaining({ central_message: storyValue }),
    ]));

    await page.context().clearCookies();
    await login(page, participant);
    await page.goto(`/projects/${createdProjectId}/workbook/scientific_story`);
    await expect(page.getByLabel("Apa pesan ilmiah utama manuskrip Anda?")).toHaveValue(storyValue);

    await page.context().clearCookies();
    await login(page, trainer);
    await page.goto(`/trainer/projects/${createdProjectId}/method`);
    await expect(page.getByText(methodValue)).toBeVisible();
    await page.getByLabel("Komentar").fill(feedbackComment);
    await page.getByLabel("Prioritas").selectOption("high");
    await page.getByRole("button", { name: "Kirim Feedback" }).click();
    await expect(page.getByText("Feedback berhasil disimpan.")).toBeVisible();

    await page.context().clearCookies();
    await login(page, participant);
    await page.goto(`/projects/${createdProjectId}/workbook/method`);
    await expect(page.getByText("Status Method Fit: Perlu Revisi")).toBeVisible();
    await expect(page.getByText(feedbackComment)).toBeVisible();
  } finally {
    if (createdProjectId) await service.from("projects").delete().eq("id", createdProjectId);
  }
});

test("Journal Target progress drives Internal Review and Reviewer Gate", async ({ page }, testInfo) => {
  const participant = accounts.participant;
  const trainer = accounts.trainer;
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  test.skip(
    !participant.email || !participant.password || !trainer.email || !trainer.password || !serviceUrl || !serviceRoleKey,
    "Set participant, trainer, and local Supabase service credentials first",
  );

  const service = createClient(serviceUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  let createdProjectId: string | undefined;
  const title = `Sprint 13 E2E ${testInfo.project.name} ${Date.now()}`;
  const primaryName = `Primary Journal ${testInfo.project.name}`;
  const backupName = `Backup Journal ${testInfo.project.name}`;
  const reviewAnswers = [
    { label: "Apakah manuskrip selaras dengan scope jurnal target?", value: "Scope, audiens, dan jenis artikel telah sesuai." },
    { label: "Apakah argumen manuskrip tersusun koheren?", value: "Alur masalah hingga kesimpulan telah koheren." },
    { label: "Apakah setiap klaim utama didukung bukti yang memadai?", value: "Klaim utama memiliki data dan referensi pendukung." },
    { label: "Apakah metode dilaporkan secara lengkap dan dapat direplikasi?", value: "Metode, sampel, instrumen, dan analisis telah lengkap." },
    { label: "Apa yang masih harus diperbaiki sebelum submit?", value: "Pemeriksaan akhir metadata telah diselesaikan." },
  ];

  try {
    await login(page, participant);
    await page.goto("/projects/new");
    await page.getByLabel("Judul manuskrip").fill(title);
    await page.getByLabel("Bidang penelitian").fill("Pendidikan Digital");
    await page.getByRole("button", { name: /^Buat Proyek$/ }).click();
    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]{36}$/);
    createdProjectId = page.url().split("/").at(-1);

    await page.getByRole("link", { name: "Buka Journal Target" }).click();
    const addJournal = async (name: string, status: "primary" | "backup") => {
      const addTargetSection = page.locator("section").filter({
        has: page.getByRole("heading", { name: "Tambah Target Jurnal" }),
      });
      await addTargetSection.getByLabel("Nama jurnal").fill(name);
      await addTargetSection.getByLabel("Penerbit").fill("SCOPUS READY Press");
      await addTargetSection.getByLabel("Alamat website").fill("https://example.test/journal");
      await addTargetSection.getByLabel("Quartile").selectOption("q1");
      await addTargetSection.getByLabel("Status target").selectOption(status);
      await addTargetSection.getByLabel("Kesesuaian scope").selectOption("5");
      await addTargetSection.getByLabel("Kesesuaian jenis artikel").selectOption("5");
      await addTargetSection.getByLabel("Kesesuaian audiens").selectOption("5");
      await addTargetSection.getByLabel("Kesesuaian persyaratan").selectOption("5");
      await addTargetSection.getByRole("button", { name: "Tambah Jurnal" }).click();
      await expect(page.getByRole("heading", { name })).toBeVisible();
    };
    await addJournal(primaryName, "primary");
    await expect(page.getByRole("heading", { name: "Journal Target 60%" })).toBeVisible();
    await addJournal(backupName, "backup");
    await expect(page.getByRole("heading", { name: "Journal Target 100%" })).toBeVisible();
    await expect(page.getByText("Selesai", { exact: true }).first()).toBeVisible();

    await page.goto(`/projects/${createdProjectId}/workbook/internal_review`);
    for (const [index, answer] of reviewAnswers.entries()) {
      await page.getByLabel(answer.label).fill(answer.value);
      if (index < reviewAnswers.length - 1) await page.getByRole("button", { name: "Lanjut" }).click();
    }
    await expect(page.getByText("Tersimpan otomatis di database")).toBeVisible();

    await page.context().clearCookies();
    await login(page, trainer);
    await page.goto(`/trainer/projects/${createdProjectId}/journal-target`);
    await expect(page.getByRole("heading", { name: primaryName })).toBeVisible();
    await expect(page.getByRole("heading", { name: backupName })).toBeVisible();
    await page.goto(`/trainer/projects/${createdProjectId}/internal_review`);
    await expect(page.getByText(reviewAnswers[0].value)).toBeVisible();
    await page.getByRole("button", { name: "Setujui Internal Review" }).click();
    await expect(page.getByText("Selesai · Gate PASS")).toBeVisible();

    await page.goto(`/score?projectId=${createdProjectId}`);
    const reviewerGate = page.getByRole("article").filter({ hasText: "Reviewer Gate" });
    await expect(reviewerGate.getByText("pass", { exact: true })).toBeVisible();

    await page.context().clearCookies();
    await login(page, participant);
    await page.goto(`/projects/${createdProjectId}/workbook/internal_review`);
    await expect(page.getByText("Status Internal Review: Selesai · Reviewer Gate PASS")).toBeVisible();
  } finally {
    if (createdProjectId) await service.from("projects").delete().eq("id", createdProjectId);
  }
});

test("participant adapts a journal manuscript and completes the submission checklist", async ({ page }, testInfo) => {
  const participant = accounts.participant;
  const trainer = accounts.trainer;
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  test.skip(
    !participant.email || !participant.password || !trainer.email || !trainer.password || !serviceUrl || !serviceRoleKey,
    "Set participant, trainer, and local Supabase service credentials first",
  );

  const service = createClient(serviceUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  let createdProjectId: string | undefined;
  const title = `Sprint 14 E2E ${testInfo.project.name} ${Date.now()}`;
  const adaptationAnswers = [
    { label: "Apa ketentuan utama author guidelines jurnal?", value: "Artikel IMRaD maksimal 7.000 kata dan menggunakan blind review." },
    { label: "Bagaimana judul, abstrak, dan kata kunci harus disesuaikan?", value: "Judul dipadatkan dan kata kunci diselaraskan dengan scope jurnal." },
    { label: "Bagaimana struktur dan batas kata manuskrip akan disesuaikan?", value: "Pendahuluan dan pembahasan dipadatkan sesuai batas kata." },
    { label: "Apa penyesuaian sitasi, referensi, tabel, dan gambar?", value: "Referensi, tabel, dan gambar mengikuti gaya jurnal." },
    { label: "Apa saja paket dokumen yang harus disiapkan?", value: "Manuskrip, title page, cover letter, dan deklarasi." },
  ];
  const checklistLabels = [
    "Berkas manuskrip final sudah siap diunggah",
    "Format sudah mengikuti author guidelines",
    "Metadata artikel dan penulis sudah lengkap",
    "Etik dan seluruh deklarasi sudah lengkap",
    "Cover letter dan berkas pendukung sudah siap",
  ];
  const feedbackComment = `Periksa kembali konsistensi format jurnal ${testInfo.project.name}.`;

  try {
    await login(page, participant);
    await page.goto("/projects/new");
    await page.getByLabel("Judul manuskrip").fill(title);
    await page.getByLabel("Bidang penelitian").fill("Pendidikan Digital");
    await page.getByRole("button", { name: /^Buat Proyek$/ }).click();
    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]{36}$/);
    createdProjectId = page.url().split("/").at(-1);

    await page.getByRole("link", { name: "Buka Journal Adaptation" }).click();
    for (const [index, answer] of adaptationAnswers.entries()) {
      await page.getByLabel(answer.label).fill(answer.value);
      if (index < adaptationAnswers.length - 1) await page.getByRole("button", { name: "Lanjut" }).click();
    }
    await expect(page.getByText("Tersimpan otomatis di database")).toBeVisible();

    await page.goto(`/projects/${createdProjectId}/workbook/submission`);
    for (const [index, label] of checklistLabels.entries()) {
      await page.getByLabel(label).check();
      if (index < checklistLabels.length - 1) await page.getByRole("button", { name: "Lanjut" }).click();
    }
    await expect(page.getByText("Tersimpan otomatis di database")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Status Submission Checklist: Selesai")).toBeVisible();
    await page.getByRole("button", { name: "Buka langkah 5" }).click();
    await expect(page.getByLabel(checklistLabels[4])).toBeChecked();

    await expect.poll(async () => {
      const { data } = await service
        .from("worksheet_answers")
        .select("status,completion_percent,worksheet_modules!inner(code)")
        .eq("project_id", createdProjectId!)
        .eq("worksheet_modules.code", "submission")
        .single();
      return `${data?.status}:${data?.completion_percent}`;
    }).toBe("completed:100");

    await page.context().clearCookies();
    await login(page, trainer);
    await page.goto(`/trainer/projects/${createdProjectId}/journal_adaptation`);
    await expect(page.getByText(adaptationAnswers[0].value)).toBeVisible();
    await page.getByLabel("Komentar").fill(feedbackComment);
    await page.getByLabel("Prioritas").selectOption("medium");
    await page.getByRole("button", { name: "Kirim Feedback" }).click();
    await expect(page.getByText("Feedback berhasil disimpan.")).toBeVisible();
    await page.goto(`/trainer/projects/${createdProjectId}/submission`);
    await expect(page.getByText("Dikonfirmasi").first()).toBeVisible();
    await expect(page.getByText("Selesai", { exact: true })).toBeVisible();

    await page.context().clearCookies();
    await login(page, participant);
    await page.goto(`/projects/${createdProjectId}/workbook/journal_adaptation`);
    await expect(page.getByText("Status Journal Adaptation: Perlu Revisi")).toBeVisible();
    await expect(page.getByText(feedbackComment)).toBeVisible();
  } finally {
    if (createdProjectId) await service.from("projects").delete().eq("id", createdProjectId);
  }
});

test("trainer reviews Problem Builder and participant addresses persistent feedback", async ({ page }, testInfo) => {
  const participant = accounts.participant;
  const trainer = accounts.trainer;
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  test.skip(
    !participant.email || !participant.password || !trainer.email || !trainer.password || !serviceUrl || !serviceRoleKey,
    "Set participant, trainer, and local Supabase service credentials first",
  );

  const service = createClient(serviceUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  let createdProjectId: string | undefined;
  const title = `Trainer Feedback E2E ${testInfo.project.name} ${Date.now()}`;
  const initialTopic = "Pendampingan pembelajaran digital";
  const revisedTopic = "Pendampingan adaptif pada pembelajaran digital";
  const comment = `Perjelas konteks masalah dan bukti empiris ${testInfo.project.name}.`;

  try {
    await login(page, participant);
    await page.goto("/projects/new");
    await page.getByLabel("Judul manuskrip").fill(title);
    await page.getByLabel("Bidang penelitian").fill("Pendidikan Digital");
    await page.getByRole("button", { name: /^Buat Proyek$/ }).click();
    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]{36}$/);
    createdProjectId = page.url().split("/").at(-1);
    await page.getByRole("link", { name: "Buka Problem Builder" }).click();
    await page.getByLabel("Apa topik penelitian Anda?").fill(initialTopic);
    await expect(page.getByText("Tersimpan otomatis di database")).toBeVisible();
    await expect.poll(async () => {
      const { data } = await service
        .from("worksheet_answers")
        .select("content")
        .eq("project_id", createdProjectId!)
        .maybeSingle();
      return data?.content?.topic;
    }).toBe(initialTopic);

    await page.context().clearCookies();
    await login(page, trainer);
    await page.getByRole("link", { name: "Buka Kelas" }).first().click();
    await page.getByRole("link", { name: "Detail Peserta" }).click();
    const projectCard = page.locator(".section-card").filter({ hasText: title });
    await projectCard.getByRole("link", { name: "Buka Problem Builder" }).click();
    await expect(page.getByText(initialTopic)).toBeVisible();
    await expect(page.getByText("Progres 4.2%", { exact: true })).toBeVisible();
    await expect(page.getByText("Score Belum dinilai", { exact: true })).toBeVisible();
    await page.getByLabel("Komentar").fill(comment);
    await page.getByLabel("Prioritas").selectOption("high");
    await page.getByRole("button", { name: "Kirim Feedback" }).click();
    await expect(page.getByText("Feedback berhasil disimpan.")).toBeVisible();
    await expect(page.getByText(comment)).toBeVisible();
    await expect(page.getByText("Progres 6.3%", { exact: true })).toBeVisible();

    const rubricScores = [
      ["Masalah", "8"], ["Research Gap", "12"], ["Novelty", "12"], ["Kontribusi", "10"],
      ["Teori & Literatur", "10"], ["Metode", "12"], ["Hasil & Bukti", "10"],
      ["Pembahasan", "12"], ["Journal Fit", "8"], ["Bahasa & Teknis", "6"],
    ] as const;
    for (const [label, value] of rubricScores) {
      await page.getByLabel(`Nilai ${label}`).selectOption(value);
    }
    await page.getByRole("button", { name: "Simpan Penilaian Resmi" }).click();
    await expect(page.getByText("10 dimensi penilaian berhasil disimpan.")).toBeVisible();
    await expect(page.getByText("Score 100", { exact: true })).toBeVisible();
    await expect.poll(async () => {
      const { count } = await service.from("assessments").select("id", { count: "exact", head: true }).eq("project_id", createdProjectId!);
      return count;
    }).toBe(10);

    await expect.poll(async () => {
      const { data } = await service
        .from("worksheet_answers")
        .select("status")
        .eq("project_id", createdProjectId!)
        .single();
      return data?.status;
    }).toBe("needs_revision");

    await page.context().clearCookies();
    await login(page, participant);
    await page.goto(`/projects/${createdProjectId}/workbook/problem`);
    await expect(page.getByText("Status Problem Builder: Perlu Revisi")).toBeVisible();
    await expect(page.getByText(comment)).toBeVisible();
    await page.goto(`/score?projectId=${createdProjectId}`);
    await expect(page.getByText("Assessment rubrik lengkap")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Critical Gates" })).toBeVisible();
    await expect(page.getByText("Reviewer Gate")).toBeVisible();
    await expect(page.getByText("Progres 6.3% mengukur penyelesaian modul.")).toBeVisible();
    await page.goto(`/projects/${createdProjectId}/workbook/problem`);
    await page.getByLabel("Apa topik penelitian Anda?").fill(revisedTopic);
    await expect(page.getByText("Tersimpan otomatis di database")).toBeVisible();
    await page.getByRole("button", { name: "Tandai Sudah Diperbaiki" }).click();
    await expect(page.getByText("Menunggu Trainer")).toBeVisible();

    await expect.poll(async () => {
      const { data } = await service
        .from("feedback")
        .select("status")
        .eq("project_id", createdProjectId!)
        .single();
      return data?.status;
    }).toBe("addressed");

    await page.context().clearCookies();
    await login(page, trainer);
    await page.goto(`/trainer/projects/${createdProjectId}/problem`);
    await page.getByRole("button", { name: "Tandai Selesai" }).click();
    await expect(page.getByText("resolved", { exact: true })).toBeVisible();
    await expect(page.getByText("Progres 4.2%", { exact: true })).toBeVisible();
    await expect.poll(async () => {
      const { data } = await service
        .from("feedback")
        .select("status")
        .eq("project_id", createdProjectId!)
        .single();
      return data?.status;
    }).toBe("resolved");
  } finally {
    if (createdProjectId) await service.from("projects").delete().eq("id", createdProjectId);
  }
});

test("participant manages Sprint 8 planning data and exports a report", async ({ page }, testInfo) => {
  const participant = accounts.participant;
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  test.skip(
    !participant.email || !participant.password || !serviceUrl || !serviceRoleKey,
    "Set participant and local Supabase service credentials first",
  );

  const service = createClient(serviceUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  let createdProjectId: string | undefined;
  const title = `Sprint 8 E2E ${testInfo.project.name} ${Date.now()}`;
  const journalName = `Journal Target ${testInfo.project.name}`;
  const taskTitle = `Adaptasi panduan penulis ${testInfo.project.name}`;

  try {
    await login(page, participant);
    await page.goto("/projects/new");
    await page.getByLabel("Judul manuskrip").fill(title);
    await page.getByLabel("Bidang penelitian").fill("Pendidikan Digital");
    await page.getByRole("button", { name: /^Buat Proyek$/ }).click();
    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]{36}$/);
    createdProjectId = page.url().split("/").at(-1);

    await page.goto(`/journals?projectId=${createdProjectId}`);
    await expect(page.getByRole("heading", { name: "Journal Target Matrix" })).toBeVisible();
    await page.getByLabel("Nama jurnal").fill(journalName);
    await page.getByLabel("Penerbit").fill("SCOPUS READY Press");
    await page.getByLabel("Alamat website").fill("https://example.test/journal");
    await page.getByLabel("Quartile").selectOption("q1");
    await page.getByLabel("Status target").selectOption("primary");
    await page.getByLabel("Kesesuaian scope").selectOption("5");
    await page.getByLabel("Kesesuaian jenis artikel").selectOption("4");
    await page.getByLabel("Kesesuaian audiens").selectOption("4");
    await page.getByLabel("Kesesuaian persyaratan").selectOption("3");
    await page.getByRole("button", { name: "Tambah Jurnal" }).click();
    await expect(page.getByText("Target jurnal ditambahkan.")).toBeVisible();
    await expect(page.getByRole("heading", { name: journalName })).toBeVisible();
    await expect(page.getByText("80%")).toBeVisible();

    await page.goto(`/action-plan?projectId=${createdProjectId}`);
    await expect(page.getByRole("heading", { name: "Action Plan" })).toBeVisible();
    await page.getByLabel("Tugas berikutnya").fill(taskTitle);
    await page.getByLabel("Deskripsi").fill("Sesuaikan struktur dan batas kata manuskrip.");
    await page.getByLabel("Tanggal target").fill("2026-09-15");
    await page.getByLabel("Prioritas").selectOption("high");
    await page.getByRole("button", { name: "Tambah Tugas" }).click();
    await expect(page.getByText("Tugas berhasil ditambahkan.")).toBeVisible();
    await expect(page.getByRole("heading", { name: taskTitle })).toBeVisible();
    await page.getByRole("button", { name: "Mulai" }).click();
    await expect(page.getByText("Sedang dikerjakan", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Tandai Selesai" }).click();
    await expect(page.getByText("Selesai", { exact: true })).toBeVisible();

    await page.goto(`/manuscript?projectId=${createdProjectId}`);
    await expect(page.getByRole("heading", { name: "Laporan Manuskrip" })).toBeVisible();
    await expect(page.getByRole("article").getByText(title)).toBeVisible();
    await expect(page.getByText(journalName)).toBeVisible();
    await expect(page.getByText(taskTitle)).toBeVisible();
    await expect(page.getByRole("button", { name: "Cetak / Simpan PDF" })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Unduh Data JSON" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(`scopus-ready-${createdProjectId}.json`);
  } finally {
    if (createdProjectId) await service.from("projects").delete().eq("id", createdProjectId);
  }
});
