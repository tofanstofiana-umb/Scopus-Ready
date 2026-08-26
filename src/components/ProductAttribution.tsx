interface ProductAttributionProps {
  inverse?: boolean;
  centered?: boolean;
  compact?: boolean;
}

export function ProductAttribution({ inverse = false, centered = false, compact = false }: ProductAttributionProps) {
  return (
    <div className={`${centered ? "text-center" : "text-left"} ${inverse ? "text-white/55" : "text-slate-500"}`} aria-label="Identitas pengembang aplikasi">
      <div className={`font-extrabold tracking-wide ${inverse ? "text-[#F4BF4F]" : "text-[#0B4EA2]"}`}>Publish-Lab</div>
      {!compact && <div className="mt-0.5 text-[10px] leading-4">Dikembangkan oleh Dr. Tofan Stofiana, M.Pd. © 2026</div>}
    </div>
  );
}
