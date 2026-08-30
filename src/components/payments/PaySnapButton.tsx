"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPaymentIntentAction } from "@/app/actions/payment";

interface SnapResult {
  order_id: string;
  transaction_status: string;
}

interface SnapWindow {
  snap: {
    pay: (token: string, callbacks: {
      onSuccess?: (result: SnapResult) => void;
      onPending?: (result: SnapResult) => void;
      onError?: (result: unknown) => void;
      onClose?: () => void;
    }) => void;
  };
}

export function PaySnapButton({ classId, snapJsSrc, clientKey }: { classId: string; snapJsSrc: string; clientKey: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  function goToPendingStatus() {
    setPending(false);
    router.push(`/classes/${classId}/pembayaran?status=menunggu`);
    router.refresh();
  }

  async function handlePay() {
    setPending(true);
    setError(null);
    const result = await createPaymentIntentAction(classId);
    if (!result.ok || !result.data) {
      setPending(false);
      setError(result.message || "Pembayaran belum dapat dimulai. Silakan coba lagi.");
      return;
    }
    try {
      const snapWindow = window as unknown as Partial<SnapWindow>;
      if (!snapWindow.snap) throw new Error("Snap belum siap");
      snapWindow.snap.pay(result.data.snapToken, {
        onSuccess: goToPendingStatus,
        onPending: goToPendingStatus,
        onError: () => {
          setPending(false);
          setError("Pembayaran gagal diproses. Silakan coba lagi.");
        },
        onClose: () => setPending(false),
      });
    } catch {
      // Guards the (rare) case where scriptReady is stale or window.snap
      // failed to attach despite the script's onLoad firing — without this,
      // an uncaught throw here left the button stuck on "Memproses..."
      // forever with setPending(false) never reached.
      setPending(false);
      setError("Sistem pembayaran belum siap. Muat ulang halaman dan coba lagi.");
    }
  }

  return (
    <div>
      <Script src={snapJsSrc} data-client-key={clientKey} strategy="afterInteractive" onLoad={() => setScriptReady(true)} />
      {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      <button type="button" onClick={handlePay} disabled={pending || !scriptReady} className="btn-primary">
        {!scriptReady ? "Memuat..." : pending ? "Memproses..." : "Bayar Sekarang"}
      </button>
    </div>
  );
}
