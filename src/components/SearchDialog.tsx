"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, Search, User, X } from "lucide-react";
import { searchAction } from "@/app/actions/search";
import type { SearchResult } from "@/types/search";

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const result = await searchAction(value);
      if (result.ok && result.data) setResults(result.data);
      setSearching(false);
    }, 300);
  }

  function handleSelect(href: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(href);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setQuery("");
          setResults([]);
        }
      }}
    >
      <Dialog.Trigger asChild>
        <button id="btn-search" className="topbar-icon" aria-label="Cari">
          <Search size={17} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-24 z-50 w-[92vw] max-w-lg -translate-x-1/2 rounded-2xl bg-white shadow-2xl">
          <Dialog.Title className="sr-only">Cari</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <Search size={16} className="flex-shrink-0 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Cari proyek manuskrip atau peserta..."
              className="flex-1 border-none text-sm outline-none placeholder:text-slate-400"
            />
            <Dialog.Close asChild>
              <button aria-label="Tutup" className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {query.trim().length < 2 && <div className="px-3 py-6 text-center text-xs text-slate-400">Ketik minimal 2 karakter untuk mencari.</div>}
            {query.trim().length >= 2 && searching && <div className="px-3 py-6 text-center text-xs text-slate-400">Mencari...</div>}
            {query.trim().length >= 2 && !searching && results.length === 0 && <div className="px-3 py-6 text-center text-xs text-slate-400">Tidak ada hasil untuk &ldquo;{query}&rdquo;.</div>}
            {results.map((result) => (
              <button
                key={`${result.kind}-${result.id}`}
                onClick={() => handleSelect(result.href)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0B4EA2]">
                  {result.kind === "project" ? <FolderOpen size={15} /> : <User size={15} />}
                </div>
                <div className="min-w-0 flex-1">
                  {result.kind === "project" ? (
                    <div className="truncate text-sm font-semibold text-slate-800">{result.title}</div>
                  ) : (
                    <>
                      <div className="truncate text-sm font-semibold text-slate-800">{result.fullName}</div>
                      <div className="truncate text-xs text-slate-400">{result.institution || result.email}</div>
                    </>
                  )}
                </div>
                <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                  {result.kind === "project" ? "Proyek" : "Peserta"}
                </span>
              </button>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
