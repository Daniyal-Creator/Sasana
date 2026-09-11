"use client";

import type { CustomIcon as CustomIconName } from "@/data/sites";
import { useLang } from "@/lib/language";

interface CustomVisualProps {
  icon: CustomIconName;
  customId?: string;
  className?: string;
}

/**
 * Cultural object visual representations for Balinese customs.
 *
 * Each visual is an authentic, handcrafted vector artwork using SASANA's
 * exact design tokens (Paras stone, Segara indigo, Prada gold).
 * Gives visitors immediate visual clarity on cultural objects (such as
 * Kamen & Selendang, Canang Sari tray, photography etiquette, drone restrictions,
 * and temple serenity).
 */
export function CustomVisual({ icon, customId, className = "" }: CustomVisualProps) {
  const { lang } = useLang();

  switch (icon) {
    case "dress":
      return (
        <div
          className={`relative w-full overflow-hidden rounded-lg border border-border bg-[#F9F6F0] p-3 text-text ${className}`}
          role="img"
          aria-label={
            lang === "id"
              ? "Ilustrasi pakaian adat Bali: Kamen dan Selendang"
              : "Illustration of Balinese temple attire: Kamen and Selendang sash"
          }
        >
          <svg
            viewBox="0 0 320 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full select-none"
            aria-hidden="true"
          >
            {/* Background texture & soft grid */}
            <rect width="320" height="120" rx="8" fill="#F6F1E9" />
            <path
              d="M0 24H320M0 48H320M0 72H320M0 96H320"
              stroke="#E4DACB"
              strokeWidth="0.75"
              strokeDasharray="3 6"
              strokeOpacity="0.6"
            />

            {/* Left side: Kamen & Selendang illustration */}
            <defs>
              <clipPath id={`dress-clip-${customId ?? "default"}`}>
                <rect x="14" y="10" width="100" height="100" rx="6" />
              </clipPath>
            </defs>
            <image
              href="/customs/dress.jpg"
              x="14"
              y="10"
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#dress-clip-${customId ?? "default"})`}
            />
            <rect
              x="14"
              y="10"
              width="100"
              height="100"
              rx="6"
              stroke="#CBBFA8"
              strokeWidth="1"
              fill="none"
              strokeOpacity="0.8"
            />

            {/* Right side: Explanatory annotations & cultural badges */}
            <g transform="translate(136, 24)">
              {/* Kamen tag */}
              <rect x="0" y="4" width="70" height="22" rx="4" fill="#E7EEF6" stroke="#1D4E89" strokeWidth="1" strokeOpacity="0.3" />
              <text x="8" y="19" fill="#1D4E89" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">
                1. Kamen
              </text>
              <text x="76" y="19" fill="#5C544A" fontSize="10" fontFamily="system-ui, sans-serif">
                {lang === "id" ? "Kain bawahan" : "Lower wrap"}
              </text>

              {/* Selendang tag */}
              <rect x="0" y="34" width="82" height="22" rx="4" fill="#FBF1DE" stroke="#B8862B" strokeWidth="1" strokeOpacity="0.4" />
              <text x="8" y="49" fill="#8A6416" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">
                2. Selendang
              </text>
              <text x="88" y="49" fill="#5C544A" fontSize="10" fontFamily="system-ui, sans-serif">
                {lang === "id" ? "Ikat pinggang" : "Waist sash"}
              </text>

              {/* Modesty helper */}
              <text x="0" y="78" fill="#8A8073" fontSize="9.5" fontFamily="system-ui, sans-serif">
                {lang === "id" ? "✓ Bahu & lutut tertutup sopan" : "✓ Shoulders & knees covered"}
              </text>
            </g>
          </svg>
        </div>
      );

    case "offerings":
      return (
        <div
          className={`relative w-full overflow-hidden rounded-lg border border-border bg-[#F9F6F0] p-3 text-text ${className}`}
          role="img"
          aria-label={
            lang === "id"
              ? "Ilustrasi sesaji Canang Sari Bali"
              : "Illustration of Balinese Canang Sari floral offering"
          }
        >
          <svg
            viewBox="0 0 320 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full select-none"
            aria-hidden="true"
          >
            {/* Background texture */}
            <rect width="320" height="120" rx="8" fill="#F6F1E9" />
            <path
              d="M0 24H320M0 48H320M0 72H320M0 96H320"
              stroke="#E4DACB"
              strokeWidth="0.75"
              strokeDasharray="3 6"
              strokeOpacity="0.6"
            />

            {/* Left side: Canang Sari illustration */}
            <defs>
              <clipPath id={`offerings-clip-${customId ?? "default"}`}>
                <rect x="14" y="10" width="100" height="100" rx="6" />
              </clipPath>
            </defs>
            <image
              href="/customs/offerings.jpg"
              x="14"
              y="10"
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#offerings-clip-${customId ?? "default"})`}
            />
            <rect
              x="14"
              y="10"
              width="100"
              height="100"
              rx="6"
              stroke="#CBBFA8"
              strokeWidth="1"
              fill="none"
              strokeOpacity="0.8"
            />

            {/* Right side: Guidance & annotations */}
            <g transform="translate(136, 24)">
              <rect x="0" y="4" width="76" height="22" rx="4" fill="#E8F3EB" stroke="#2E7D46" strokeWidth="1" strokeOpacity="0.3" />
              <text x="8" y="19" fill="#2E7D46" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">
                Canang Sari
              </text>
              <text x="82" y="19" fill="#5C544A" fontSize="10" fontFamily="system-ui, sans-serif">
                {lang === "id" ? "Sesaji di tanah" : "Ground offering"}
              </text>

              <rect x="0" y="34" width="102" height="22" rx="4" fill="#FBF1DE" stroke="#B8862B" strokeWidth="1" strokeOpacity="0.4" />
              <text x="8" y="49" fill="#8A6416" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">
                {lang === "id" ? "Jangan Dilangkahi" : "Walk Around"}
              </text>

              <text x="0" y="78" fill="#8A8073" fontSize="9.5" fontFamily="system-ui, sans-serif">
                {lang === "id" ? "✓ Berjalanlah memutari sesaji" : "✓ Please step around gently"}
              </text>
            </g>
          </svg>
        </div>
      );

    case "photography":
      return (
        <div
          className={`relative w-full overflow-hidden rounded-lg border border-border bg-[#F9F6F0] p-3 text-text ${className}`}
          role="img"
          aria-label={
            lang === "id"
              ? "Ilustrasi etika fotografi di area pura"
              : "Illustration of photography etiquette at sacred temple"
          }
        >
          <svg
            viewBox="0 0 320 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full select-none"
            aria-hidden="true"
          >
            <rect width="320" height="120" rx="8" fill="#F6F1E9" />
            <path
              d="M0 24H320M0 48H320M0 72H320M0 96H320"
              stroke="#E4DACB"
              strokeWidth="0.75"
              strokeDasharray="3 6"
              strokeOpacity="0.6"
            />

            {/* Left side: Photography illustration */}
            <defs>
              <clipPath id={`photography-clip-${customId ?? "default"}`}>
                <rect x="14" y="10" width="100" height="100" rx="6" />
              </clipPath>
            </defs>
            <image
              href="/customs/photography.png"
              x="14"
              y="10"
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#photography-clip-${customId ?? "default"})`}
            />
            <rect
              x="14"
              y="10"
              width="100"
              height="100"
              rx="6"
              stroke="#CBBFA8"
              strokeWidth="1"
              fill="none"
              strokeOpacity="0.8"
            />

            {/* Right side: Etiquette guidance */}
            <g transform="translate(136, 24)">
              <rect x="0" y="4" width="94" height="22" rx="4" fill="#E7EEF6" stroke="#1D4E89" strokeWidth="1" strokeOpacity="0.3" />
              <text x="8" y="19" fill="#1D4E89" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">
                Etika Fotografi
              </text>

              <rect x="0" y="34" width="112" height="22" rx="4" fill="#FBF1DE" stroke="#B8862B" strokeWidth="1" strokeOpacity="0.4" />
              <text x="8" y="49" fill="#8A6416" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">
                {lang === "id" ? "Minta Izin Sembahyang" : "Ask Praying Devotees"}
              </text>

              <text x="0" y="78" fill="#8A8073" fontSize="9.5" fontFamily="system-ui, sans-serif">
                {lang === "id" ? "✓ Jangan berdiri di depan pemangku" : "✓ Never stand higher than priest"}
              </text>
            </g>
          </svg>
        </div>
      );

    case "drones":
      return (
        <div
          className={`relative w-full overflow-hidden rounded-lg border border-border bg-[#F9F6F0] p-3 text-text ${className}`}
          role="img"
          aria-label={
            lang === "id"
              ? "Ilustrasi larangan terbang drone di atas pura"
              : "Illustration of drone flight restrictions over sacred temple"
          }
        >
          <svg
            viewBox="0 0 320 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full select-none"
            aria-hidden="true"
          >
            <rect width="320" height="120" rx="8" fill="#F6F1E9" />
            <path
              d="M0 24H320M0 48H320M0 72H320M0 96H320"
              stroke="#E4DACB"
              strokeWidth="0.75"
              strokeDasharray="3 6"
              strokeOpacity="0.6"
            />

            {/* Left side: Drone restriction illustration */}
            <defs>
              <clipPath id={`drones-clip-${customId ?? "default"}`}>
                <rect x="14" y="10" width="100" height="100" rx="6" />
              </clipPath>
            </defs>
            <image
              href="/customs/drones.jpg"
              x="14"
              y="10"
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#drones-clip-${customId ?? "default"})`}
            />
            <rect
              x="14"
              y="10"
              width="100"
              height="100"
              rx="6"
              stroke="#CBBFA8"
              strokeWidth="1"
              fill="none"
              strokeOpacity="0.8"
            />

            {/* Right side: Rules */}
            <g transform="translate(136, 24)">
              <rect x="0" y="4" width="102" height="22" rx="4" fill="#FBEAE7" stroke="#B23A2E" strokeWidth="1" strokeOpacity="0.4" />
              <text x="8" y="19" fill="#B23A2E" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">
                {lang === "id" ? "Zona Bebas Drone" : "No-Fly Airspace"}
              </text>

              <rect x="0" y="34" width="112" height="22" rx="4" fill="#FBF1DE" stroke="#B8862B" strokeWidth="1" strokeOpacity="0.4" />
              <text x="8" y="49" fill="#8A6416" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">
                {lang === "id" ? "Kosmologi Ketinggian" : "Sacred Vertical Space"}
              </text>

              <text x="0" y="78" fill="#8A8073" fontSize="9.5" fontFamily="system-ui, sans-serif">
                {lang === "id" ? "✓ Hormati ketinggian pelinggih" : "✓ Do not fly above shrines"}
              </text>
            </g>
          </svg>
        </div>
      );

    case "quiet":
    default:
      return (
        <div
          className={`relative w-full overflow-hidden rounded-lg border border-border bg-[#F9F6F0] p-3 text-text ${className}`}
          role="img"
          aria-label={
            lang === "id"
              ? "Ilustrasi menjaga ketenangan di area persembahyangan"
              : "Illustration of maintaining quiet reverence at sacred site"
          }
        >
          <svg
            viewBox="0 0 320 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full select-none"
            aria-hidden="true"
          >
            <rect width="320" height="120" rx="8" fill="#F6F1E9" />
            <path
              d="M0 24H320M0 48H320M0 72H320M0 96H320"
              stroke="#E4DACB"
              strokeWidth="0.75"
              strokeDasharray="3 6"
              strokeOpacity="0.6"
            />

            {/* Left side: Sacred Ceremonial Bell (Genta / Bajra) illustration */}
            <defs>
              <clipPath id={`quiet-clip-${customId ?? "default"}`}>
                <rect x="14" y="10" width="100" height="100" rx="6" />
              </clipPath>
            </defs>
            <image
              href="/customs/quiet.jpg"
              x="14"
              y="10"
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#quiet-clip-${customId ?? "default"})`}
            />
            <rect
              x="14"
              y="10"
              width="100"
              height="100"
              rx="6"
              stroke="#CBBFA8"
              strokeWidth="1"
              fill="none"
              strokeOpacity="0.8"
            />

            {/* Right side: Serenity guidance */}
            <g transform="translate(136, 24)">
              <rect x="0" y="4" width="94" height="22" rx="4" fill="#FBF1DE" stroke="#B8862B" strokeWidth="1" strokeOpacity="0.4" />
              <text x="8" y="19" fill="#8A6416" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">
                Ketenangan Suci
              </text>

              <rect x="0" y="34" width="112" height="22" rx="4" fill="#E7EEF6" stroke="#1D4E89" strokeWidth="1" strokeOpacity="0.3" />
              <text x="8" y="49" fill="#1D4E89" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">
                {lang === "id" ? "Bicara Pelan & Tertib" : "Low Speaking Voice"}
              </text>

              <text x="0" y="78" fill="#8A8073" fontSize="9.5" fontFamily="system-ui, sans-serif">
                {lang === "id" ? "✓ Pura adalah tempat ibadah aktif" : "✓ Active sacred place of worship"}
              </text>
            </g>
          </svg>
        </div>
      );
  }
}
