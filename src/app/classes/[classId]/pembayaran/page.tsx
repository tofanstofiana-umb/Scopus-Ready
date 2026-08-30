import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PaySnapButton } from "@/components/payments/PaySnapButton";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getClassForPayment } from "@/services/payment.service";
import { midtransClientKey, snapJsUrl } from "@/lib/midtrans/client";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export default async function ClassPaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePageIdentity(["participant"]);
  const { classId } = await params;
  const { status: queryStatus } = await searchParams;
  const enrollment = await getClassForPayment(classId);
  if (!enrollment) notFound();

  return (
    <AppShell title="Pembayaran Kelas" subtitle={enrollment.className}>
      <div className="mx-auto max-w-lg">
        <div className="section-card p-6 sm:p-8">
          <h2 className="font-extrabold text-[#082B5C]">{enrollment.className}</h2>
          <div className="mt-2 text-3xl font-black text-slate-900">{formatRupiah(enrollment.price)}</div>

          {enrollment.status === "paid" && (
            <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              Kelas ini sudah lunas. Anda dapat mengisi seluruh worksheet.
            </p>
          )}

          {enrollment.status === "unpaid" && queryStatus === "menunggu" && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              Pembayaran sedang diproses. Status akan diperbarui otomatis begitu konfirmasi diterima — muat ulang halaman ini dalam beberapa saat.
            </p>
          )}

          {enrollment.status === "unpaid" && (
            <div className="mt-5">
              <p className="mb-4 text-sm text-slate-500">Selesaikan pembayaran untuk membuka akses mengisi worksheet dan menerima feedback trainer di kelas ini.</p>
              <PaySnapButton classId={classId} snapJsSrc={snapJsUrl()} clientKey={midtransClientKey()} />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
