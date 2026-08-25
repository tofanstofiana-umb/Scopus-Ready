import { expect, test } from "@playwright/test";

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
});
