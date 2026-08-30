"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, CreditCard, MessageSquare, NotebookPen } from "lucide-react";
import { getMyNotificationsAction, markAllNotificationsReadAction, markNotificationReadAction } from "@/app/actions/notification";
import type { AppNotification, NotificationType } from "@/types/notification";

const typeIcon: Record<NotificationType, typeof MessageSquare> = {
  feedback_received: MessageSquare,
  worksheet_needs_review: NotebookPen,
  payment_verified: CreditCard,
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function NotificationBell() {
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  async function refresh() {
    const result = await getMyNotificationsAction();
    if (result.ok && result.data) {
      setItems(result.data.items);
      setUnreadCount(result.data.unreadCount);
    }
    setLoaded(true);
  }

  useEffect(() => {
    // refresh() is async and every setState inside it happens after the
    // `await`, i.e. in a later microtask, not synchronously during this
    // effect — safe fetch-on-mount, the lint rule can't see past the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, []);

  async function handleSelect(notification: AppNotification) {
    if (!notification.read_at) {
      setItems((prev) => prev.map((item) => (item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item)));
      setUnreadCount((count) => Math.max(0, count - 1));
      await markNotificationReadAction(notification.id);
    }
    if (notification.link) router.push(notification.link);
  }

  async function handleMarkAllRead() {
    setItems((prev) => prev.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
    setUnreadCount(0);
    await markAllNotificationsReadAction();
  }

  return (
    <DropdownMenu.Root onOpenChange={(open) => open && refresh()}>
      <DropdownMenu.Trigger asChild>
        <button id="btn-notifications" className="topbar-icon relative" aria-label="Notifikasi">
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white ring-2 ring-white" style={{ background: "#EF4444" }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="z-50 w-80 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-bold text-[#082B5C]">Notifikasi</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs font-semibold text-[#0B4EA2] hover:underline">
                <CheckCheck size={13} /> Tandai semua dibaca
              </button>
            )}
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
          <div className="max-h-80 overflow-y-auto">
            {loaded && items.length === 0 && <div className="px-3 py-8 text-center text-xs text-slate-400">Belum ada notifikasi.</div>}
            {items.map((notification) => {
              const Icon = typeIcon[notification.type];
              return (
                <DropdownMenu.Item
                  key={notification.id}
                  onSelect={() => handleSelect(notification)}
                  className="flex cursor-pointer items-start gap-2.5 rounded-lg px-3 py-2.5 outline-none hover:bg-slate-50 focus:bg-slate-50"
                >
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0B4EA2]">
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm ${notification.read_at ? "font-medium text-slate-600" : "font-bold text-slate-900"}`}>{notification.title}</div>
                    {notification.body && <div className="mt-0.5 truncate text-xs text-slate-400">{notification.body}</div>}
                    <div className="mt-1 text-[10px] text-slate-400">{formatTimestamp(notification.created_at)}</div>
                  </div>
                  {!notification.read_at && <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: "#0B4EA2" }} />}
                </DropdownMenu.Item>
              );
            })}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
