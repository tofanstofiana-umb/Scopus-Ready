import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local terlebih dahulu.",
  );
}

const parsedUrl = new URL(supabaseUrl);
if (!["127.0.0.1", "localhost"].includes(parsedUrl.hostname)) {
  throw new Error("Script ini hanya boleh dijalankan terhadap Supabase Local.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const accounts = [
  {
    email: "peserta@scopusready.test",
    password: "Participant123!",
    fullName: "Peserta Demo",
    role: "participant",
  },
  {
    email: "trainer@scopusready.test",
    password: "Trainer123!",
    fullName: "Trainer Demo",
    role: "trainer",
  },
  {
    email: "admin@scopusready.test",
    password: "Admin123!",
    fullName: "Administrator Demo",
    role: "admin",
  },
];

async function findUserByEmail(email) {
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;

    const user = data.users.find((candidate) => candidate.email === email);
    if (user) return user;
    if (data.users.length < 100) return null;
    page += 1;
  }
}

async function ensureAccount(account) {
  let user = await findUserByEmail(account.email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName },
    });
    if (error || !data.user) throw error ?? new Error(`Gagal membuat ${account.email}`);
    user = data.user;
  } else {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: account.password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName },
    });
    if (error) throw error;
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: account.email,
    full_name: account.fullName,
    role: account.role,
  });
  if (profileError) throw profileError;

  return user;
}

const users = new Map();
for (const account of accounts) {
  users.set(account.role, await ensureAccount(account));
}

const trainer = users.get("trainer");
const participant = users.get("participant");
if (!trainer || !participant) throw new Error("Akun development tidak lengkap.");

const { data: classRow, error: classError } = await supabase
  .from("classes")
  .upsert(
    {
      name: "Workshop SCOPUS READY Angkatan 1",
      code: "SR-MVP-01",
      trainer_id: trainer.id,
      status: "active",
    },
    { onConflict: "code" },
  )
  .select("id")
  .single();
if (classError || !classRow) throw classError ?? new Error("Gagal membuat kelas development.");

const { error: memberError } = await supabase.from("class_members").upsert(
  [
    { class_id: classRow.id, user_id: trainer.id, member_role: "trainer" },
    { class_id: classRow.id, user_id: participant.id, member_role: "participant" },
  ],
  { onConflict: "class_id,user_id" },
);
if (memberError) throw memberError;

console.table(
  accounts.map(({ email, password, role }) => ({ role, email, password })),
);
console.log("Akun dan kelas Supabase Local siap digunakan.");
