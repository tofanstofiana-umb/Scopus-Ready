"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteLibraryResourceAction } from "@/app/actions/library";

export function DeleteLibraryResourceButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(`Hapus materi "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setPending(true);
    setError(null);
    const result = await deleteLibraryResourceAction(id);
    setPending(false);
    if (!result.ok) {
      setError(result.message || "Gagal menghapus materi.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <button type="button" onClick={handleDelete} disabled={pending} className="btn-outline px-3 py-1.5 text-xs text-red-600">
        {pending ? "Menghapus..." : "Hapus"}
      </button>
    </div>
  );
}
