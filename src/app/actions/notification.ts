"use server";

import { accessErrorResult } from "@/domain/errors/access-errors";
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/notification.service";
import type { ActionResult } from "@/types/auth";
import type { AppNotification } from "@/types/notification";

export async function getMyNotificationsAction(): Promise<ActionResult<{ items: AppNotification[]; unreadCount: number }>> {
  try {
    const data = await getMyNotifications();
    return { ok: true, data };
  } catch (error) {
    const accessError = accessErrorResult<{ items: AppNotification[]; unreadCount: number }>(error);
    if (accessError) return accessError;
    console.error("get notifications error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Notifikasi belum dapat dimuat." };
  }
}

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  try {
    await markNotificationRead(id);
    return { ok: true };
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    console.error("mark notification read error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE" };
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  try {
    await markAllNotificationsRead();
    return { ok: true };
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    console.error("mark all notifications read error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE" };
  }
}
