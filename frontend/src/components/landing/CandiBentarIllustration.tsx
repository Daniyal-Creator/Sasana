"use client";

export function CandiBentarIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex h-full w-full items-center justify-center p-2 select-none ${className}`.trim()}>
      <svg
        viewBox="0 0 440 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full max-h-[300px] overflow-visible"
        aria-label="Candi Bentar split gate in camera viewfinder illustration"
      >
        <defs>
          {/* Stone Texture Pattern */}
          <pattern id="stoneHatch" width="10" height="10" patternUnits="userSpaceOnUse">
            <line x1="0" y1="10" x2="10" y2="0" stroke="var(--color-border)" strokeWidth="0.5" strokeOpacity="0.4" />
          </pattern>
        </defs>

        {/* ── Background: Distant Sacred Horizon & Gentle Clouds ── */}
        <g className="opacity-40">
          {/* Distant Mountain Peak (Mt. Agung silhouette through the gate split) */}
          <path
            d="M170 190L220 120L270 190Z"
            className="fill-surface-sunken stroke-border"
            strokeWidth="1"
          />
          {/* Soft cloud horizontal guidelines */}
          <path
            d="M60 90C100 85 140 85 180 90M260 90C300 85 340 85 380 90"
            stroke="var(--color-border)"
            strokeWidth="0.75"
            strokeDasharray="4 6"
          />
        </g>

        {/* ── Ground Plinth & Sacred Temple Courtyard Steps ── */}
        <g>
          {/* Base platform */}
          <rect x="50" y="220" width="340" height="16" rx="2" className="fill-surface-sunken stroke-border-strong" strokeWidth="1.5" />
          <line x1="50" y1="228" x2="390" y2="228" className="stroke-border" strokeWidth="0.75" />
          {/* Middle step */}
          <rect x="70" y="208" width="300" height="12" rx="1.5" className="fill-surface stroke-border-strong" strokeWidth="1.5" />
          {/* Central courtyard stone pathway */}
          <path d="M195 220L185 245H255L245 220Z" className="fill-surface-sunken stroke-border" strokeWidth="1" />
          <line x1="220" y1="220" x2="220" y2="245" className="stroke-border-strong" strokeWidth="1" strokeDasharray="3 3" />
        </g>

        {/* ── Candi Bentar (Left Tower Wing) ── */}
        <g>
          {/* Base Pedestal (Lapik Batur) */}
          <path
            d="M85 208H195V175H100L95 190H85V208Z"
            className="fill-surface-sunken stroke-text"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          {/* Base Ornamental Relief */}
          <rect x="105" y="180" width="80" height="22" rx="2" className="fill-surface stroke-border-strong" strokeWidth="1" />
          <line x1="120" y1="180" x2="120" y2="202" className="stroke-accent" strokeWidth="1.25" />
          <line x1="145" y1="180" x2="145" y2="202" className="stroke-accent" strokeWidth="1.25" />
          <line x1="170" y1="180" x2="170" y2="202" className="stroke-accent" strokeWidth="1.25" />

          {/* Lower Body (Batur Tengah) */}
          <path
            d="M105 175H195V135H115L110 148H105V175Z"
            className="fill-surface-sunken stroke-text"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <line x1="115" y1="155" x2="195" y2="155" className="stroke-border-strong" strokeWidth="1" />

          {/* Middle Body Tier 1 */}
          <path
            d="M118 135H195V102H128L122 112H118V135Z"
            className="fill-surface stroke-text"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          {/* Traditional Winged Carving Projection (Sayap Candi Kiri) */}
          <path
            d="M118 135C102 135 94 122 100 110C108 116 114 124 122 128"
            className="fill-accent/15 stroke-accent-strong"
            strokeWidth="1.25"
          />

          {/* Tier 2 (Atap Undak Ke-2) */}
          <path
            d="M132 102H195V74H140L135 84H132V102Z"
            className="fill-surface-sunken stroke-text"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <line x1="138" y1="88" x2="195" y2="88" className="stroke-accent/70" strokeWidth="1" />

          {/* Tier 3 (Atap Undak Ke-3) */}
          <path
            d="M144 74H195V50H152L147 58H144V74Z"
            className="fill-surface stroke-text"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />

          {/* Peak Tier (Puncak Menara Kiri) */}
          <path
            d="M156 50H195V30L178 30L172 38L156 50Z"
            className="fill-surface-sunken stroke-text"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          {/* Top Finial (Murda / Mahkota Kiri) */}
          <path
            d="M188 30V20C188 16 195 16 195 20V30H188Z"
            className="fill-accent stroke-accent-strong"
            strokeWidth="1.25"
          />

          {/* Vertical Inner Split Face (Sisi Terbelah Rata) */}
          <line x1="195" y1="20" x2="195" y2="208" className="stroke-text" strokeWidth="2.5" />
        </g>

        {/* ── Candi Bentar (Right Tower Wing - Exact Mirror) ── */}
        <g>
          {/* Base Pedestal */}
          <path
            d="M355 208H245V175H340L345 190H355V208Z"
            className="fill-surface-sunken stroke-text"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          {/* Base Relief */}
          <rect x="255" y="180" width="80" height="22" rx="2" className="fill-surface stroke-border-strong" strokeWidth="1" />
          <line x1="270" y1="180" x2="270" y2="202" className="stroke-accent" strokeWidth="1.25" />
          <line x1="295" y1="180" x2="295" y2="202" className="stroke-accent" strokeWidth="1.25" />
          <line x1="320" y1="180" x2="320" y2="202" className="stroke-accent" strokeWidth="1.25" />

          {/* Lower Body */}
          <path
            d="M335 175H245V135H325L330 148H335V175Z"
            className="fill-surface-sunken stroke-text"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <line x1="245" y1="155" x2="325" y2="155" className="stroke-border-strong" strokeWidth="1" />

          {/* Middle Body Tier 1 */}
          <path
            d="M322 135H245V102H312L318 112H322V135Z"
            className="fill-surface stroke-text"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          {/* Sayap Candi Kanan */}
          <path
            d="M322 135C338 135 346 122 340 110C332 116 326 124 318 128"
            className="fill-accent/15 stroke-accent-strong"
            strokeWidth="1.25"
          />

          {/* Tier 2 */}
          <path
            d="M308 102H245V74H300L305 84H308V102Z"
            className="fill-surface-sunken stroke-text"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <line x1="245" y1="88" x2="302" y2="88" className="stroke-accent/70" strokeWidth="1" />

          {/* Tier 3 */}
          <path
            d="M296 74H245V50H288L293 58H296V74Z"
            className="fill-surface stroke-text"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />

          {/* Peak Tier */}
          <path
            d="M284 50H245V30L262 30L268 38L284 50Z"
            className="fill-surface-sunken stroke-text"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          {/* Top Finial (Mahkota Kanan) */}
          <path
            d="M252 30V20C252 16 245 16 245 20V30H252Z"
            className="fill-accent stroke-accent-strong"
            strokeWidth="1.25"
          />

          {/* Vertical Inner Split Face */}
          <line x1="245" y1="20" x2="245" y2="208" className="stroke-text" strokeWidth="2.5" />
        </g>

        {/* ── Camera Viewfinder AI Scanner Overlay ── */}
        <g>
          {/* Four Viewfinder Framing Brackets */}
          {/* Top-Left */}
          <path d="M30 45V25H50" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" />
          {/* Top-Right */}
          <path d="M410 45V25H390" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" />
          {/* Bottom-Left */}
          <path d="M30 235V255H50" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" />
          {/* Bottom-Right */}
          <path d="M410 235V255H390" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" />

          {/* Central Target Alignment Reticle */}
          <g className="opacity-75" transform="translate(220, 140)">
            <circle cx="0" cy="0" r="16" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="-24" y1="0" x2="-8" y2="0" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="8" y1="0" x2="24" y2="0" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="-24" x2="0" y2="-8" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="8" x2="0" y2="24" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="0" cy="0" r="2.5" className="fill-accent" />
          </g>

          {/* Cultural Etiquette Verification Chips */}
          {/* Upper Left: Target Recognition Tag */}
          <g transform="translate(36, 32)">
            <rect x="0" y="0" width="138" height="20" rx="4" className="fill-surface stroke-border shadow-xs" strokeWidth="1" />
            <circle cx="10" cy="10" r="3.5" className="fill-status-ok-fg" />
            <text x="18" y="13.5" className="fill-text font-mono text-[9px] font-semibold tracking-wide">
              OBJECT: CANDI BENTAR
            </text>
          </g>

          {/* Bottom Center: Alignment Notice */}
          <g transform="translate(145, 250)">
            <rect x="0" y="0" width="150" height="20" rx="4" className="fill-primary-tint/90 stroke-primary/30" strokeWidth="1" />
            <text x="75" y="13.5" textAnchor="middle" className="fill-primary font-mono text-[9px] font-bold tracking-wider">
              SACRED PASSAGEWAY · VERIFIED
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
