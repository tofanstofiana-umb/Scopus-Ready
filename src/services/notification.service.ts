import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireIdentity } from "./auth.service";
import type { AppNotification, NotificationType } from "@/types/notification";

const NOTIFICATION_FIELDS = "id,user_id,type,title,body,link,read_at,created_at";

/**
 * Fire-and-forget: notifications are supplementary, never allowed to break
 * the primary action (feedback creation, worksheet save, payment webhook)
 * that triggered them. Failures are logged, not thrown.
 */
export async function createNotification(userId: string, type: NotificationType, title: string, body?: string | null, link?: string | null): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("notifications").insert({ user_id: userId, type, title, body: body ?? null, link: link ?? null });
    if (error) throw error;
  } catch (error) {
    console.error("notification creation failed", type, error instanceof Error ? error.message : "unknown");
  }
}

export async function getMyNotifications(): Promise<{ items: AppNotification[]; unreadCount: number }> {
  const { profile } = await requireIdentity();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_FIELDS)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  const items = (data ?? []) as AppNotification[];
  return { items, unreadCount: items.filter((item) => !item.read_at).length };
}

export async function markNotificationRead(id: string): Promise<void> {
  const { profile } = await requireIdentity();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id).eq("user_id", profile.id);
  if (error) throw error;
}

export async function markAllNotificationsRead(): Promise<void> {
  const { profile } = await requireIdentity();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", profile.id)
    .is("read_at", null);
  if (error) throw error;
}
