"use client";

import { useEffect, useState } from "react";

/**
 * Hook to provide a gentle, one-shot mount fade-in transition
 * respecting user's prefers-reduced-motion settings.
 */
function useWatermarkEntrance() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (media.matches) {
        setMounted(true);
        return;
      }
    }
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return mounted;
}

/* ───────────────────────────────────────────────────────────────────────────
   1. Hero: Horizontal Balinese Temple Skyline (Sesuai Gambar Pengguna)
   Posisikan di lantai paling bawah section Hero dengan skala ramping (~70-95px).
   ─────────────────────────────────────────────────────────────────────────── */
export function HeroBottomSkyline({ className = "" }: { className?: string }) {
  const mounted = useWatermarkEntrance();

  return (
    <div
      className={`pointer-events-none absolute -bottom-1 left-0 right-0 z-0 flex w-full justify-center overflow-hidden transition-opacity duration-700 ease-out select-none ${
        mounted ? "opacity-100" : "opacity-0"
      } ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 130"
        fill="none"
        preserveAspectRatio="xMidYMax slice"
        className="h-16 w-full max-w-[1400px] text-text sm:h-18 md:h-20 lg:h-22"
      >
        {/* ── Outer Decorative Penjor (Far Left) ── */}
        <g className="text-text">
          <path
            d="M 60 130 C 62 80, 78 36, 115 18 C 132 8, 148 15, 152 28 C 154 37, 148 45, 140 45"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.14"
            fill="none"
          />
          <path
            d="M 152 28 Q 154 55, 150 80 Q 148 95, 151 112"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="2 3"
            strokeOpacity="0.16"
          />
          <circle cx="152" cy="28" r="3" className="fill-accent/35 stroke-accent/45" strokeWidth="0.75" />
          <path d="M 148 45 L 156 45 L 152 56 Z" className="fill-accent/30" />
        </g>

        {/* ── Left Meru Tower: 7 Tiers (Meru Tumpang Pitu) ── */}
        <g transform="translate(190, 0)">
          {/* Base */}
          <path
            d="M 44 130 L 44 120 L 49 120 L 49 112 L 91 112 L 91 120 L 96 120 L 96 130 Z"
            fill="currentColor"
            fillOpacity="0.05"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.14"
          />
          {/* 7 Tiers of Thatched Roofs */}
          <path d="M 30 112 C 48 106, 70 106, 70 101 C 70 106, 92 106, 110 112 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 36 101 C 51 95, 70 95, 70 90 C 70 95, 89 95, 104 101 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 41 90 C 54 84, 70 84, 70 79 C 70 84, 86 84, 99 90 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 46 79 C 56 73, 70 73, 70 68 C 70 73, 84 73, 94 79 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 51 68 C 59 62, 70 62, 70 57 C 70 62, 81 62, 89 68 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 56 57 C 62 51, 70 51, 70 46 C 70 51, 78 51, 84 57 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 60 46 C 64 41, 70 41, 70 36 C 70 41, 76 41, 80 46 Z" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeWidth="1" strokeOpacity="0.16" />
          {/* Gold Finial */}
          <path d="M 68 36 L 72 36 L 70 24 Z" className="fill-accent/40 stroke-accent/50" strokeWidth="0.75" />
          <circle cx="70" cy="22" r="2.5" className="fill-accent/50 stroke-accent/65" strokeWidth="0.75" />
        </g>

        {/* ── Left Connecting Temple Wall (Penyengker) ── */}
        <path
          d="M 315 130 L 315 116 L 440 116 L 440 130"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.12"
          fill="currentColor"
          fillOpacity="0.04"
        />
        <line x1="315" y1="121" x2="440" y2="121" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 4" strokeOpacity="0.1" />

        {/* ── Centerpiece: Candi Bentar (Balinese Split Gateway) ── */}
        <g transform="translate(475, 0)">
          {/* Plinth & Steps */}
          <path
            d="M 50 130 L 50 124 L 200 124 L 200 130 Z"
            fill="currentColor"
            fillOpacity="0.05"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.14"
          />
          <path
            d="M 68 124 L 68 118 L 182 118 L 182 124 Z"
            fill="currentColor"
            fillOpacity="0.05"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.14"
          />

          {/* Left Pylon of Candi Bentar */}
          <path
            d="M 76 118 
               L 76 95 
               L 82 95 L 82 82 
               L 78 82 L 78 66 
               L 85 66 L 85 52 
               L 92 52 L 92 38 
               L 98 38 L 98 25 
               L 110 25 L 110 14 
               L 120 14 L 120 118 Z"
            fill="currentColor"
            fillOpacity="0.065"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeOpacity="0.18"
          />
          {/* Relief Horizontal Lines */}
          <line x1="76" y1="104" x2="120" y2="104" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.12" />
          <line x1="82" y1="88" x2="120" y2="88" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.12" />
          <line x1="78" y1="74" x2="120" y2="74" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.12" />
          <line x1="85" y1="59" x2="120" y2="59" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.12" />
          <line x1="92" y1="45" x2="120" y2="45" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.12" />
          <line x1="98" y1="31" x2="120" y2="31" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.12" />
          {/* Left Gold Finial */}
          <path d="M 112 14 L 120 14 L 120 6 L 116 6 Z" className="fill-accent/40 stroke-accent/55" strokeWidth="0.75" />

          {/* Center Split Void */}
          <line x1="125" y1="118" x2="125" y2="10" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" strokeOpacity="0.1" />

          {/* Right Pylon of Candi Bentar (Mirror) */}
          <path
            d="M 174 118 
               L 174 95 
               L 168 95 L 168 82 
               L 172 82 L 172 66 
               L 165 66 L 165 52 
               L 158 52 L 158 38 
               L 152 38 L 152 25 
               L 140 25 L 140 14 
               L 130 14 L 130 118 Z"
            fill="currentColor"
            fillOpacity="0.065"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeOpacity="0.18"
          />
          {/* Right Relief Horizontal Lines */}
          <line x1="130" y1="104" x2="174" y2="104" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.12" />
          <line x1="130" y1="88" x2="168" y2="88" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.12" />
          <line x1="130" y1="74" x2="172" y2="74" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.12" />
          <line x1="130" y1="59" x2="165" y2="59" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.12" />
          <line x1="130" y1="45" x2="158" y2="45" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.12" />
          <line x1="130" y1="31" x2="152" y2="31" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.12" />
          {/* Right Gold Finial */}
          <path d="M 130 14 L 138 14 L 134 6 L 130 6 Z" className="fill-accent/40 stroke-accent/55" strokeWidth="0.75" />
        </g>

        {/* ── Right Connecting Temple Wall (Penyengker) ── */}
        <path
          d="M 760 130 L 760 116 L 885 116 L 885 130"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.12"
          fill="currentColor"
          fillOpacity="0.04"
        />
        <line x1="760" y1="121" x2="885" y2="121" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 4" strokeOpacity="0.1" />

        {/* ── Right Meru Tower: 9 Tiers (Meru Tumpang Sia) ── */}
        <g transform="translate(870, 0)">
          {/* Base */}
          <path
            d="M 45 130 L 45 121 L 50 121 L 50 113 L 90 113 L 90 121 L 95 121 L 95 130 Z"
            fill="currentColor"
            fillOpacity="0.05"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.14"
          />
          {/* 9 Tiers */}
          <path d="M 28 113 C 48 108, 70 108, 70 103 C 70 108, 92 108, 112 113 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 33 103 C 51 98, 70 98, 70 93 C 70 98, 89 98, 107 103 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 38 93 C 53 88, 70 88, 70 83 C 70 88, 87 88, 102 93 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 43 83 C 55 78, 70 78, 70 73 C 70 78, 85 78, 97 83 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 47 73 C 57 68, 70 68, 70 63 C 70 68, 83 68, 93 73 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 51 63 C 59 58, 70 58, 70 53 C 70 58, 81 58, 89 63 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 55 53 C 61 48, 70 48, 70 43 C 70 48, 79 48, 85 53 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 59 43 C 63 38, 70 38, 70 33 C 70 38, 77 38, 81 43 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 62 33 C 65 28, 70 28, 70 24 C 70 28, 75 28, 78 33 Z" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeWidth="1" strokeOpacity="0.16" />
          {/* Gold Finial */}
          <path d="M 68 24 L 72 24 L 70 14 Z" className="fill-accent/40 stroke-accent/50" strokeWidth="0.75" />
          <circle cx="70" cy="12" r="2.5" className="fill-accent/50 stroke-accent/65" strokeWidth="0.75" />
        </g>

        {/* ── Outer Decorative Penjor (Far Right) ── */}
        <g className="text-text">
          <path
            d="M 1140 130 C 1138 80, 1122 36, 1085 18 C 1068 8, 1052 15, 1048 28 C 1046 37, 1052 45, 1060 45"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.14"
            fill="none"
          />
          <path
            d="M 1048 28 Q 1046 55, 1050 80 Q 1052 95, 1049 112"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="2 3"
            strokeOpacity="0.16"
          />
          <circle cx="1048" cy="28" r="3" className="fill-accent/35 stroke-accent/45" strokeWidth="0.75" />
          <path d="M 1052 45 L 1044 45 L 1048 56 Z" className="fill-accent/30" />
        </g>

        {/* Ground Baseline Hairline */}
        <line x1="0" y1="129" x2="1200" y2="129" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.16" />
      </svg>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   2. Story: Horizontal Penjor & Tedung Ground Silhouette
   Position: Di paling bawah section Story (Linimasa) sebelum SectionDivider.
   ─────────────────────────────────────────────────────────────────────────── */
export function StoryBottomWatermark() {
  const mounted = useWatermarkEntrance();

  return (
    <div
      className={`pointer-events-none absolute -bottom-1 left-0 right-0 z-0 flex w-full justify-center overflow-hidden transition-opacity duration-700 ease-out select-none ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 95"
        fill="none"
        preserveAspectRatio="xMidYMax slice"
        className="h-14 w-full max-w-[1400px] text-text sm:h-16 md:h-18 lg:h-20"
      >
        {/* Left Ceremonial Penjor & Tedung */}
        <g transform="translate(180, 0)">
          {/* Penjor Arc */}
          <path
            d="M 50 95 C 55 55, 80 20, 130 12 C 145 10, 155 18, 150 28"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.14"
            fill="none"
          />
          <circle cx="150" cy="28" r="3" className="fill-accent/40" />
          <path d="M 148 40 L 152 40 L 150 50 Z" className="fill-accent/30" />
          {/* Tedung (Umbrella) */}
          <line x1="105" y1="95" x2="105" y2="45" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.14" />
          <path d="M 80 65 C 95 48, 115 48, 130 65 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <circle cx="105" cy="42" r="2" className="fill-accent/40" />
        </g>

        {/* Center Connecting Stepped Shrine Contour */}
        <g transform="translate(520, 10)">
          <path
            d="M 40 85 L 40 76 L 50 76 L 50 68 L 110 68 L 110 76 L 120 76 L 120 85 Z"
            fill="currentColor"
            fillOpacity="0.05"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.14"
          />
          <path d="M 30 68 C 50 62, 80 62, 80 56 C 80 62, 110 62, 130 68 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <circle cx="80" cy="50" r="2.5" className="fill-accent/40" />
        </g>

        {/* Right Ceremonial Penjor & Tedung (Mirror) */}
        <g transform="translate(860, 0)">
          <path
            d="M 110 95 C 105 55, 80 20, 30 12 C 15 10, 5 18, 10 28"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.14"
            fill="none"
          />
          <circle cx="10" cy="28" r="3" className="fill-accent/40" />
          <path d="M 8 40 L 12 40 L 10 50 Z" className="fill-accent/30" />
          {/* Tedung */}
          <line x1="55" y1="95" x2="55" y2="45" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.14" />
          <path d="M 30 65 C 45 48, 65 48, 80 65 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <circle cx="55" cy="42" r="2" className="fill-accent/40" />
        </g>

        {/* Baseline */}
        <line x1="0" y1="94" x2="1200" y2="94" stroke="currentColor" strokeWidth="1.25" strokeOpacity="0.15" />
      </svg>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   3. Principles: Horizontal Meru Tumpang 3 & Padmasana Ground Silhouette
   Position: Di paling bawah section Principles sebelum SectionDivider.
   ─────────────────────────────────────────────────────────────────────────── */
export function PrinciplesBottomWatermark() {
  const mounted = useWatermarkEntrance();

  return (
    <div
      className={`pointer-events-none absolute -bottom-1 left-0 right-0 z-0 flex w-full justify-center overflow-hidden transition-opacity duration-700 ease-out select-none ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 95"
        fill="none"
        preserveAspectRatio="xMidYMax slice"
        className="h-14 w-full max-w-[1400px] text-text sm:h-16 md:h-18 lg:h-20"
      >
        {/* Center: Padmasana Lotus Throne & Meru Tumpang 3 */}
        <g transform="translate(515, 0)">
          {/* Base Plinth */}
          <path
            d="M 40 95 L 40 85 L 50 85 L 50 78 L 120 78 L 120 85 L 130 85 L 130 95 Z"
            fill="currentColor"
            fillOpacity="0.05"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.14"
          />
          {/* Lotus Crest */}
          <path d="M 50 78 C 65 70, 75 70, 85 78 C 95 70, 105 70, 120 78 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          
          {/* Meru Tumpang 3 */}
          <path d="M 45 68 C 65 60, 85 60, 85 54 C 85 60, 105 60, 125 68 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 55 54 C 70 48, 85 48, 85 43 C 85 48, 100 48, 115 54 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 64 43 C 74 38, 85 38, 85 33 C 85 38, 96 38, 106 43 Z" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeWidth="1" strokeOpacity="0.16" />
          
          {/* Gold Finial */}
          <path d="M 83 33 L 87 33 L 85 24 Z" className="fill-accent/45 stroke-accent/60" strokeWidth="0.75" />
          <circle cx="85" cy="22" r="2" className="fill-accent/50" />
        </g>

        {/* Flanking Stone Wall Balustrade relief */}
        <line x1="200" y1="88" x2="520" y2="88" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" strokeOpacity="0.12" />
        <line x1="680" y1="88" x2="1000" y2="88" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" strokeOpacity="0.12" />
        <circle cx="360" cy="85" r="3" className="fill-accent/30" />
        <circle cx="840" cy="85" r="3" className="fill-accent/30" />

        {/* Baseline */}
        <line x1="0" y1="94" x2="1200" y2="94" stroke="currentColor" strokeWidth="1.25" strokeOpacity="0.15" />
      </svg>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   4. Charter: Horizontal Kori Agung Gateway Ground Silhouette
   Position: Di paling bawah section Cultural Charter sebelum SectionDivider.
   ─────────────────────────────────────────────────────────────────────────── */
export function CharterBottomWatermark() {
  const mounted = useWatermarkEntrance();

  return (
    <div
      className={`pointer-events-none absolute -bottom-1 left-0 right-0 z-0 flex w-full justify-center overflow-hidden transition-opacity duration-700 ease-out select-none ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 95"
        fill="none"
        preserveAspectRatio="xMidYMax slice"
        className="h-14 w-full max-w-[1400px] text-text sm:h-16 md:h-18 lg:h-20"
      >
        {/* Center: Monumental Kori Agung / Paduraksa Gateway */}
        <g transform="translate(500, 0)">
          {/* Stepped Base */}
          <path
            d="M 30 95 L 30 86 L 40 86 L 40 80 L 160 80 L 160 86 L 170 86 L 170 95 Z"
            fill="currentColor"
            fillOpacity="0.05"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.14"
          />
          {/* Stepped Wing Walls */}
          <path d="M 40 80 L 40 65 L 55 65 L 55 52 L 70 52 L 70 42" stroke="currentColor" strokeWidth="1" strokeOpacity="0.14" />
          <path d="M 160 80 L 160 65 L 145 65 L 145 52 L 130 52 L 130 42" stroke="currentColor" strokeWidth="1" strokeOpacity="0.14" />

          {/* Roof Tiers */}
          <path d="M 55 52 L 55 42 L 145 42 L 145 52 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 68 42 L 68 32 L 132 32 L 132 42 Z" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 80 32 L 80 22 L 120 22 L 120 32 Z" fill="currentColor" fillOpacity="0.075" stroke="currentColor" strokeWidth="1" strokeOpacity="0.16" />

          {/* Bhoma Head Motif */}
          <path d="M 94 54 C 94 48, 106 48, 106 54 Z" className="fill-accent/35 stroke-accent/50" strokeWidth="0.75" />

          {/* Golden Finial */}
          <path d="M 98 22 L 102 22 L 100 12 Z" className="fill-accent/45 stroke-accent/60" strokeWidth="0.75" />
          <circle cx="100" cy="10" r="2" className="fill-accent/50" />
        </g>

        {/* Flanking Courtyard Walls */}
        <line x1="160" y1="86" x2="510" y2="86" stroke="currentColor" strokeWidth="1" strokeOpacity="0.12" />
        <line x1="690" y1="86" x2="1040" y2="86" stroke="currentColor" strokeWidth="1" strokeOpacity="0.12" />

        {/* Baseline */}
        <line x1="0" y1="94" x2="1200" y2="94" stroke="currentColor" strokeWidth="1.25" strokeOpacity="0.15" />
      </svg>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   5. Team: Horizontal Bale Banjar Ground Silhouette
   Position: Di paling bawah section Team sebelum SectionDivider.
   ─────────────────────────────────────────────────────────────────────────── */
export function TeamBottomWatermark() {
  const mounted = useWatermarkEntrance();

  return (
    <div
      className={`pointer-events-none absolute -bottom-1 left-0 right-0 z-0 flex w-full justify-center overflow-hidden transition-opacity duration-700 ease-out select-none ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 95"
        fill="none"
        preserveAspectRatio="xMidYMax slice"
        className="h-14 w-full max-w-[1400px] text-text sm:h-16 md:h-18 lg:h-20"
      >
        {/* Center: Bale Banjar Pavilion */}
        <g transform="translate(500, 0)">
          {/* Raised Stone Bebataran */}
          <path
            d="M 20 95 L 20 84 L 180 84 L 180 95 Z"
            fill="currentColor"
            fillOpacity="0.05"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.14"
          />

          {/* Wooden Columns */}
          <line x1="45" y1="84" x2="45" y2="55" stroke="currentColor" strokeWidth="1.75" strokeOpacity="0.15" />
          <line x1="80" y1="84" x2="80" y2="55" stroke="currentColor" strokeWidth="1.25" strokeOpacity="0.13" />
          <line x1="120" y1="84" x2="120" y2="55" stroke="currentColor" strokeWidth="1.25" strokeOpacity="0.13" />
          <line x1="155" y1="84" x2="155" y2="55" stroke="currentColor" strokeWidth="1.75" strokeOpacity="0.15" />

          {/* Lower Thatched Roof */}
          <path d="M 25 55 L 55 35 L 145 35 L 175 55 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          {/* Upper Thatched Roof */}
          <path d="M 50 35 L 75 20 L 125 20 L 150 35 Z" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeWidth="1" strokeOpacity="0.16" />

          {/* Ridge Finials */}
          <circle cx="75" cy="18" r="2" className="fill-accent/40" />
          <circle cx="100" cy="16" r="2.5" className="fill-accent/50" />
          <circle cx="125" cy="18" r="2" className="fill-accent/40" />
        </g>

        {/* Flanking Kulkul Slit Drum Towers */}
        <g transform="translate(240, 20)">
          <rect x="15" y="40" width="16" height="35" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth="1" strokeOpacity="0.12" />
          <path d="M 10 40 L 23 25 L 36 40 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.14" />
        </g>
        <g transform="translate(930, 20)">
          <rect x="15" y="40" width="16" height="35" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth="1" strokeOpacity="0.12" />
          <path d="M 10 40 L 23 25 L 36 40 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.14" />
        </g>

        {/* Baseline */}
        <line x1="0" y1="94" x2="1200" y2="94" stroke="currentColor" strokeWidth="1.25" strokeOpacity="0.15" />
      </svg>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   6. Closing: Horizontal Sacred Sanctuary & Lake Horizon Ground Skyline
   Position: Di paling bawah section Penutup (Closing).
   ─────────────────────────────────────────────────────────────────────────── */
export function ClosingBottomSkyline() {
  const mounted = useWatermarkEntrance();

  return (
    <div
      className={`pointer-events-none absolute -bottom-1 left-0 right-0 z-0 flex w-full justify-center overflow-hidden transition-opacity duration-700 ease-out select-none ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 120"
        fill="none"
        preserveAspectRatio="xMidYMax slice"
        className="h-16 w-full max-w-[1400px] text-text sm:h-20 md:h-22 lg:h-24"
      >
        {/* Subtle Dawn Rays */}
        <g stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" strokeOpacity="0.08">
          <line x1="600" y1="20" x2="600" y2="0" />
          <line x1="600" y1="20" x2="530" y2="5" />
          <line x1="600" y1="20" x2="670" y2="5" />
          <line x1="600" y1="20" x2="470" y2="15" />
          <line x1="600" y1="20" x2="730" y2="15" />
        </g>

        {/* Left Meru 7-tier */}
        <g transform="translate(240, 20)">
          <path d="M 35 100 L 35 90 L 75 90 L 75 100 Z" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1" strokeOpacity="0.14" />
          <path d="M 25 90 C 40 85, 55 85, 55 80 C 55 85, 70 85, 85 90 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 30 80 C 43 75, 55 75, 55 70 C 55 75, 67 75, 80 80 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 35 70 C 45 65, 55 65, 55 60 C 55 65, 65 65, 75 70 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 39 60 C 47 55, 55 55, 55 50 C 55 55, 63 55, 71 60 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 43 50 C 49 45, 55 45, 55 40 C 55 45, 61 45, 67 50 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 47 40 C 51 35, 55 35, 55 30 C 55 35, 59 35, 63 40 Z" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeWidth="1" strokeOpacity="0.16" />
          <circle cx="55" cy="24" r="2" className="fill-accent/40" />
        </g>

        {/* Center Grand 11-tier Meru */}
        <g transform="translate(545, 0)">
          <path d="M 35 120 L 35 108 L 75 108 L 75 120 Z" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1" strokeOpacity="0.14" />
          <path d="M 18 108 C 36 103, 55 103, 55 98 C 55 103, 74 103, 92 108 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 23 98 C 39 93, 55 93, 55 88 C 55 93, 71 93, 87 98 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 27 88 C 41 83, 55 83, 55 78 C 55 83, 69 83, 83 88 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 31 78 C 43 73, 55 73, 55 68 C 55 73, 67 73, 79 78 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 35 68 C 45 63, 55 63, 55 58 C 55 63, 65 63, 75 68 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 38 58 C 47 53, 55 53, 55 48 C 55 53, 63 53, 72 58 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 41 48 C 48 43, 55 43, 55 38 C 55 43, 62 43, 69 48 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 44 38 C 50 33, 55 33, 55 28 C 55 33, 60 33, 66 38 Z" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeWidth="1" strokeOpacity="0.16" />
          <circle cx="55" cy="22" r="2.5" className="fill-accent/50" />
        </g>

        {/* Right Meru 9-tier */}
        <g transform="translate(850, 15)">
          <path d="M 35 105 L 35 95 L 75 95 L 75 105 Z" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1" strokeOpacity="0.14" />
          <path d="M 22 95 C 38 90, 55 90, 55 85 C 55 90, 72 90, 88 95 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 27 85 C 41 80, 55 80, 55 75 C 55 80, 69 80, 83 85 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 31 75 C 43 70, 55 70, 55 65 C 55 70, 67 70, 79 75 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 35 65 C 45 60, 55 60, 55 55 C 55 60, 65 60, 75 65 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 39 55 C 47 50, 55 50, 55 45 C 55 50, 63 50, 71 55 Z" fill="currentColor" fillOpacity="0.065" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
          <path d="M 43 45 C 49 40, 55 40, 55 35 C 55 40, 61 40, 67 45 Z" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeWidth="1" strokeOpacity="0.16" />
          <circle cx="55" cy="28" r="2" className="fill-accent/40" />
        </g>

        {/* Water Ripples */}
        <line x1="80" y1="114" x2="340" y2="114" stroke="currentColor" strokeWidth="1" strokeDasharray="14 10 4 10" strokeOpacity="0.12" />
        <line x1="420" y1="116" x2="780" y2="116" stroke="currentColor" strokeWidth="1" strokeDasharray="20 14 6 14" strokeOpacity="0.12" />
        <line x1="840" y1="114" x2="1120" y2="114" stroke="currentColor" strokeWidth="1" strokeDasharray="14 10 4 10" strokeOpacity="0.12" />

        {/* Baseline */}
        <line x1="0" y1="119" x2="1200" y2="119" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.16" />
      </svg>
    </div>
  );
}
