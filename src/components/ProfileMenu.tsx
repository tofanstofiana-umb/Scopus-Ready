"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { ChevronDown, LogOut, User } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export function ProfileMenu({ displayName, roleLabel, roleInitial }: { displayName: string; roleLabel: string; roleInitial: string }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="topbar-profile" aria-label="Menu pengguna">
          <span className="topbar-avatar">{roleInitial}</span>
          <span className="hidden text-left xl:block">
            <span className="block text-[11px] font-bold leading-none text-[#082B5C]">{displayName}</span>
            <span className="mt-1 block text-[9px] leading-none text-slate-400">{roleLabel}</span>
          </span>
          <ChevronDown size={13} className="hidden text-slate-400 xl:block" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[200px] rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg"
        >
          <div className="px-3 py-2">
            <div className="text-sm font-bold text-[#082B5C]">{displayName}</div>
            <div className="text-xs text-slate-400">{roleLabel}</div>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
          <DropdownMenu.Item asChild>
            <Link href="/profile" className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 outline-none hover:bg-slate-50 focus:bg-slate-50">
              <User size={15} /> Profil
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
          <DropdownMenu.Item asChild>
            <form action={logoutAction}>
              <button type="submit" className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 outline-none hover:bg-red-50 focus:bg-red-50">
                <LogOut size={15} /> Keluar
              </button>
            </form>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
