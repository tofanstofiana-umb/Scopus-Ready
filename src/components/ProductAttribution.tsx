import Image from "next/image";

interface ProductAttributionProps {
  inverse?: boolean;
  centered?: boolean;
  compact?: boolean;
}

export function ProductAttribution({ inverse = false, centered = false, compact = false }: ProductAttributionProps) {
  return (
    <div
      className={`flex items-center gap-2.5 ${centered ? "justify-center text-left" : "text-left"} ${inverse ? "text-white/55" : "text-slate-500"}`}
      aria-label="Identitas pengembang aplikasi"
    >
      <Image
        src="/brand/publish-lab-logo.jpeg"
        alt="Logo Publish Lab"
        width={503}
        height={377}
        className={`${compact ? "h-8" : "h-10"} w-auto shrink-0 rounded-md bg-white object-contain p-0.5 shadow-sm`}
      />
      <div>
        <div className={`font-extrabold tracking-wide ${inverse ? "text-[#F4BF4F]" : "text-[#0B4EA2]"}`}>Publish-Lab</div>
        {!compact && <div className="mt-0.5 text-[10px] leading-4">Dikembangkan oleh Dr. Tofan Stofiana, M.Pd. © 2026</div>}
      </div>
    </div>
  );
}
