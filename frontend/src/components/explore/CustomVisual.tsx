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

            {/* Left side: Kamen (Sarong cloth) drape */}
            <g transform="translate(24, 12)">
              {/* Kamen cloth base */}
              <rect x="16" y="16" width="68" height="76" rx="4" fill="#EFE8DC" stroke="#CBBFA8" strokeWidth="1.5" />
              {/* Batik/Endek motif patterns */}
              <path
                d="M16 28L84 28M16 40L84 40M16 52L84 52M16 64L84 64M16 76L84 76"
                stroke="#2A2520"
                strokeWidth="1"
                strokeOpacity="0.25"
                strokeDasharray="4 4"
              />
              <path
                d="M28 16L72 92M72 16L28 92"
                stroke="#B8862B"
                strokeWidth="1"
                strokeOpacity="0.25"
              />
              {/* Center fold lines */}
              <path d="M46 16V92M54 16V92" stroke="#CBBFA8" strokeWidth="1.25" />

              {/* Golden Selendang (Waist Sash) */}
              <rect x="8" y="26" width="84" height="15" rx="3" fill="#B8862B" stroke="#8A6416" strokeWidth="1.5" />
              {/* Sash decorative center texture */}
              <path d="M12 33.5H88" stroke="#FFFDF9" strokeWidth="1.25" strokeDasharray="3 3" strokeOpacity="0.8" />
              
              {/* Selendang Knot (Simpul Ikat) */}
              <circle cx="68" cy="33.5" r="7" fill="#8A6416" stroke="#B8862B" strokeWidth="1.5" />
              <circle cx="68" cy="33.5" r="3.5" fill="#FFFDF9" />
              
              {/* Hanging sash ribbon/tassels */}
              <path
                d="M65 39C63 54 60 68 58 84L68 84C69 70 71 54 73 39Z"
                fill="#B8862B"
                stroke="#8A6416"
                strokeWidth="1.25"
              />
              <path d="M58 84L63 88L68 84" stroke="#8A6416" strokeWidth="1.25" fill="#8A6416" />
              <path d="M63 42V82" stroke="#FFFDF9" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.7" />
            </g>

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

            {/* Left side: Canang Sari Woven Tray */}
            <g transform="translate(24, 10)">
              {/* Shadow underneath */}
              <ellipse cx="50" cy="88" rx="42" ry="12" fill="#2A2520" fillOpacity="0.08" />

              {/* Ceper (Square woven palm leaf tray) */}
              <polygon
                points="18,52 50,22 82,52 50,82"
                fill="#6B8E4E"
                stroke="#4A6B34"
                strokeWidth="1.5"
              />
              <polygon
                points="24,52 50,28 76,52 50,76"
                fill="#7E9F5F"
                stroke="#4A6B34"
                strokeWidth="1"
              />
              {/* Palm leaf corner stitch pins (semat) */}
              <line x1="18" y1="52" x2="30" y2="52" stroke="#E4DACB" strokeWidth="1.5" />
              <line x1="82" y1="52" x2="70" y2="52" stroke="#E4DACB" strokeWidth="1.5" />
              <line x1="50" y1="22" x2="50" y2="34" stroke="#E4DACB" strokeWidth="1.5" />
              <line x1="50" y1="82" x2="50" y2="70" stroke="#E4DACB" strokeWidth="1.5" />

              {/* Colorful Sacred Flower Petals (Catur Lokapala) */}
              {/* North: Blue petal */}
              <ellipse cx="50" cy="38" rx="7" ry="9" fill="#1D4E89" stroke="#163C6B" strokeWidth="0.75" />
              {/* South: Red petal */}
              <ellipse cx="50" cy="66" rx="7" ry="9" fill="#B23A2E" stroke="#8A2C22" strokeWidth="0.75" />
              {/* East: White frangipani petal */}
              <ellipse cx="64" cy="52" rx="9" ry="7" fill="#FFFDF9" stroke="#E4DACB" strokeWidth="0.75" />
              <circle cx="64" cy="52" r="2.5" fill="#B8862B" />
              {/* West: Yellow marigold petal */}
              <ellipse cx="36" cy="52" rx="9" ry="7" fill="#B8862B" stroke="#8A6416" strokeWidth="0.75" />

              {/* Center: Pandan leaf shred & Porosan */}
              <circle cx="50" cy="52" r="8" fill="#4D7C38" stroke="#375D27" strokeWidth="1" />
              <circle cx="50" cy="52" r="3.5" fill="#EFE8DC" />

              {/* Dupa (Incense stick) with smoke trail */}
              <line x1="72" y1="68" x2="94" y2="36" stroke="#5C544A" strokeWidth="1.75" strokeLinecap="round" />
              <circle cx="94" cy="36" r="2" fill="#B23A2E" />
              <path
                d="M95 34C98 26 94 20 98 12C101 6 97 2 100 0"
                stroke="#8A8073"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeOpacity="0.6"
              />
            </g>

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

            {/* Left side: Camera with respectful distance brackets */}
            <g transform="translate(24, 18)">
              {/* Outer boundary / viewfinder brackets */}
              <path d="M8 24V12H20M80 12H92V24M8 64V76H20M80 76H92V64" stroke="#1D4E89" strokeWidth="1.75" strokeLinecap="round" />

              {/* Camera body */}
              <rect x="22" y="24" width="56" height="40" rx="6" fill="#2A2520" stroke="#163C6B" strokeWidth="1.5" />
              {/* Top flash & dial */}
              <rect x="30" y="19" width="16" height="5" rx="1.5" fill="#5C544A" />
              <rect x="58" y="20" width="8" height="4" rx="1" fill="#B8862B" />

              {/* Lens ring */}
              <circle cx="50" cy="44" r="14" fill="#1D4E89" stroke="#FFFDF9" strokeWidth="1.5" />
              <circle cx="50" cy="44" r="9" fill="#163C6B" />
              <circle cx="47" cy="41" r="3" fill="#FFFDF9" fillOpacity="0.8" />

              {/* Respect indicator wave */}
              <circle cx="50" cy="44" r="22" stroke="#B8862B" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.7" />
            </g>

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

            {/* Left side: Drone with no-fly ring over Meru roof */}
            <g transform="translate(24, 12)">
              {/* Meru roof outline below */}
              <path d="M40 76L50 62L60 76H40Z" fill="#5C544A" />
              <path d="M35 88L50 74L65 88H35Z" fill="#5C544A" />
              <rect x="47" y="88" width="6" height="8" fill="#2A2520" />

              {/* Drone Body */}
              <ellipse cx="50" cy="34" rx="14" ry="7" fill="#2A2520" stroke="#1D4E89" strokeWidth="1" />
              {/* Drone Arms */}
              <line x1="32" y1="26" x2="68" y2="42" stroke="#2A2520" strokeWidth="2" strokeLinecap="round" />
              <line x1="32" y1="42" x2="68" y2="26" stroke="#2A2520" strokeWidth="2" strokeLinecap="round" />
              {/* 4 Rotors */}
              <ellipse cx="30" cy="24" rx="8" ry="2.5" fill="#1D4E89" fillOpacity="0.4" stroke="#1D4E89" strokeWidth="0.75" />
              <ellipse cx="70" cy="44" rx="8" ry="2.5" fill="#1D4E89" fillOpacity="0.4" stroke="#1D4E89" strokeWidth="0.75" />
              <ellipse cx="30" cy="44" rx="8" ry="2.5" fill="#1D4E89" fillOpacity="0.4" stroke="#1D4E89" strokeWidth="0.75" />
              <ellipse cx="70" cy="24" rx="8" ry="2.5" fill="#1D4E89" fillOpacity="0.4" stroke="#1D4E89" strokeWidth="0.75" />

              {/* Restriction Ring & Slash */}
              <circle cx="50" cy="34" r="28" stroke="#B23A2E" strokeWidth="2" fill="#FBEAE7" fillOpacity="0.25" />
              <line x1="30" y1="14" x2="70" y2="54" stroke="#B23A2E" strokeWidth="2.25" strokeLinecap="round" />
            </g>

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

            {/* Left side: Sacred Ceremonial Bell (Genta / Bajra) */}
            <g transform="translate(24, 12)">
              {/* Serenity ripple circles */}
              <circle cx="50" cy="54" r="38" stroke="#E4DACB" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="50" cy="54" r="28" stroke="#CBBFA8" strokeWidth="1" strokeDasharray="2 3" />
              <circle cx="50" cy="54" r="18" stroke="#B8862B" strokeWidth="1" strokeOpacity="0.4" />

              {/* Vajra handle top */}
              <path d="M50 14L46 22H54L50 14Z" fill="#8A6416" />
              <rect x="48.5" y="22" width="3" height="14" fill="#B8862B" />
              <circle cx="50" cy="29" r="4" fill="#8A6416" />

              {/* Bell dome (Genta) */}
              <path
                d="M34 68C34 46 42 36 50 36C58 36 66 46 66 68H34Z"
                fill="#B8862B"
                stroke="#8A6416"
                strokeWidth="1.5"
              />
              {/* Bell rim & clapper */}
              <rect x="31" y="68" width="38" height="5" rx="2" fill="#8A6416" />
              <circle cx="50" cy="76" r="3" fill="#2A2520" />
            </g>

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
