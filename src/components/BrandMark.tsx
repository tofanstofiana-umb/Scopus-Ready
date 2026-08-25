import { BookOpen, PenLine, Sparkles } from "lucide-react";

interface BrandMarkProps {
  compact?: boolean;
  inverse?: boolean;
}

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  return (
    <div className="brand-lockup" aria-label="SCOPUS READY Digital Workbook">
      <div className="brand-symbol" aria-hidden="true">
        <BookOpen className="brand-book" strokeWidth={1.8} />
        <PenLine className="brand-pen" strokeWidth={2.2} />
        <Sparkles className="brand-star" strokeWidth={2.4} />
      </div>
      {!compact && (
        <div className="min-w-0">
          <div className={`brand-name ${inverse ? "text-white" : "text-[#082B5C]"}`}>
            SCOPUS READY<span>™</span>
          </div>
          <div className={`brand-tagline ${inverse ? "text-white/55" : "text-slate-500"}`}>
            Digital Workbook
          </div>
        </div>
      )}
    </div>
  );
}
