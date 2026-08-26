import Image from "next/image";

interface BrandMarkProps {
  compact?: boolean;
  inverse?: boolean;
}

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  return (
    <div className="brand-lockup" aria-label="SCOPUS READY Digital Workbook oleh Publish-Lab">
      <div className="brand-symbol" aria-hidden="true">
        <Image
          src="/brand/publish-lab-logo.jpeg"
          alt=""
          width={503}
          height={377}
          className="brand-symbol-image"
        />
      </div>
      {!compact && (
        <div className="min-w-0">
          <div className={`brand-name ${inverse ? "text-white" : "text-[#082B5C]"}`}>
            SCOPUS READY<span>™</span>
          </div>
          <div className={`brand-tagline ${inverse ? "text-white/55" : "text-slate-500"}`}>
            Digital Workbook · Publish-Lab
          </div>
        </div>
      )}
    </div>
  );
}
