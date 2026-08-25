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
    await expect(page.getByText("Score belum dapat diterbitkan")).toBeVisible();
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
