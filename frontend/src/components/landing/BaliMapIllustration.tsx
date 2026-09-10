"use client";

import { useState } from "react";

interface SacredPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  type: string;
}

const SACRED_POINTS: SacredPoint[] = [
  { id: "besakih", name: "Pura Besakih", x: 388, y: 135, type: "Mother Temple" },
  { id: "uluwatu", name: "Pura Luhur Uluwatu", x: 288, y: 290, type: "Sea Cliff Temple" },
  { id: "tanah-lot", name: "Pura Tanah Lot", x: 232, y: 215, type: "Coastal Temple" },
  { id: "beratan", name: "Pura Ulun Danu Beratan", x: 285, y: 115, type: "Highland Lake Temple" },
  { id: "tirta-empul", name: "Pura Tirta Empul", x: 336, y: 165, type: "Holy Spring Temple" },
];

export function BaliMapIllustration({ isScanning = true }: { isScanning?: boolean }) {
  const [hoveredPoint, setHoveredPoint] = useState<SacredPoint | null>(null);

  return (
    <div className="relative flex h-full w-full items-center justify-center p-2 select-none">
      <svg
        viewBox="0 0 540 330"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full max-h-[300px] overflow-visible"
        aria-label="Balinese sacred sites cartographic map illustration"
      >
        <defs>
          {/* Subtle alpha-only radial gradient for the radar scan center */}
          <radialGradient id="radarSweep" cx="55%" cy="45%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.18" />
            <stop offset="60%" stopColor="var(--color-accent)" stopOpacity="0.04" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </radialGradient>

          {/* Marker glow filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Oceanic Gridlines */}
        <g className="opacity-25" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 6">
          <line x1="40" y1="60" x2="500" y2="60" className="text-border-strong" />
          <line x1="40" y1="130" x2="500" y2="130" className="text-border-strong" />
          <line x1="40" y1="200" x2="500" y2="200" className="text-border-strong" />
          <line x1="40" y1="270" x2="500" y2="270" className="text-border-strong" />

          <line x1="100" y1="30" x2="100" y2="300" className="text-border-strong" />
          <line x1="200" y1="30" x2="200" y2="300" className="text-border-strong" />
          <line x1="300" y1="30" x2="300" y2="300" className="text-border-strong" />
          <line x1="400" y1="30" x2="400" y2="300" className="text-border-strong" />
        </g>

        {/* Outer Proximity Radar Wave (Animated when scanning) */}
        {isScanning && (
          <g className="transition-opacity duration-500">
            <circle
              cx="310"
              cy="165"
              r="120"
              className="text-accent/30 animate-ping origin-center"
              style={{ animationDuration: "4s" }}
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
            <circle
              cx="310"
              cy="165"
              r="85"
              className="text-accent/40"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeDasharray="4 4"
              fill="url(#radarSweep)"
            />
          </g>
        )}

        {/* Nusa Penida Silhouette */}
        <path
          d="M 432 232 C 445 220, 468 222, 476 235 C 482 245, 478 260, 465 264 C 450 268, 436 260, 430 248 Z"
          className="fill-surface-sunken stroke-border-strong transition-colors hover:fill-surface"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Nusa Lembongan & Ceningan */}
        <path
          d="M 418 226 C 423 222, 429 223, 430 227 C 430 231, 425 234, 420 233 Z"
          className="fill-surface-sunken stroke-border-strong"
          strokeWidth="1.25"
        />

        {/* Bali Mainland Silhouette */}
        <path
          d="M 46 112 
             C 65 104, 110 98, 150 82 
             C 185 68, 230 62, 275 62 
             C 320 62, 365 72, 405 88 
             C 435 100, 470 125, 484 150 
             C 490 162, 486 176, 470 188 
             C 455 198, 428 198, 412 208 
             C 395 218, 368 222, 348 222 
             C 336 222, 328 228, 320 238 
             C 314 246, 320 264, 318 278 
             C 316 292, 305 302, 290 300 
             C 278 298, 274 284, 276 270 
             C 278 256, 286 244, 282 234 
             C 274 222, 252 216, 235 212 
             C 205 204, 168 192, 132 178 
             C 95 164, 60 148, 42 132 
             C 35 125, 36 116, 46 112 Z"
          className="fill-surface-sunken stroke-border-strong transition-colors"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Interior Topographic Elevation Contour 1 (Lowland ring) */}
        <path
          d="M 170 102 
             C 210 88, 260 84, 300 86 
             C 345 88, 390 102, 425 124 
             C 445 138, 440 160, 415 174 
             C 385 190, 335 196, 295 196 
             C 255 196, 215 186, 185 170 
             C 155 152, 145 120, 170 102 Z"
          fill="none"
          className="stroke-border/70"
          strokeWidth="1"
          strokeDasharray="4 3"
        />

        {/* Interior Topographic Elevation Contour 2 (Midland volcanic ridge) */}
        <path
          d="M 215 120 
             C 245 106, 285 100, 325 104 
             C 365 108, 395 122, 405 140 
             C 412 155, 395 168, 365 174 
             C 330 180, 280 178, 250 170 
             C 220 160, 200 135, 215 120 Z"
          fill="none"
          className="stroke-accent/35"
          strokeWidth="1"
        />

        {/* Mt. Agung Volcano Ridge (Peak indicator) */}
        <path
          d="M 375 142 C 385 122, 400 122, 410 142"
          fill="none"
          className="stroke-accent/70"
          strokeWidth="1.5"
        />
        {/* Mt. Batur Caldera */}
        <ellipse
          cx="332"
          cy="116"
          rx="12"
          ry="7"
          fill="none"
          className="stroke-accent/50"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Sacred Site Radar Markers */}
        {SACRED_POINTS.map((pt) => {
          const isHovered = hoveredPoint?.id === pt.id;
          return (
            <g
              key={pt.id}
              className="cursor-pointer transition-transform duration-150 focus:outline-none"
              tabIndex={0}
              role="button"
              aria-label={`${pt.name} - ${pt.type}`}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
              onFocus={() => setHoveredPoint(pt)}
              onBlur={() => setHoveredPoint(null)}
            >
              {/* Radar pulse ping */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="7"
                className="stroke-accent/60 fill-accent/15 animate-ping origin-center"
                style={{ animationDuration: "3s" }}
              />

              {/* Core site anchor point */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? "5" : "3.5"}
                className={`transition-all duration-200 ${
                  isHovered
                    ? "fill-accent-strong stroke-surface shadow-md"
                    : "fill-primary stroke-surface"
                }`}
                strokeWidth="1.5"
              />

              {/* Small beacon ring */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? "9" : "6.5"}
                className="stroke-accent/50 fill-none"
                strokeWidth="1"
                strokeDasharray={isHovered ? "none" : "2 2"}
              />
            </g>
          );
        })}

        {/* Active Tooltip / Pin Callout */}
        {hoveredPoint && (
          <g className="transition-opacity duration-200 pointer-events-none" transform={`translate(${hoveredPoint.x}, ${hoveredPoint.y - 14})`}>
            {/* Tooltip badge container */}
            <rect
              x="-65"
              y="-32"
              width="130"
              height="28"
              rx="6"
              className="fill-surface stroke-border shadow-lg"
              strokeWidth="1"
            />
            {/* Tooltip downward pointer triangle */}
            <polygon
              points="0,-4 -5,-9 5,-9"
              className="fill-surface stroke-border"
              strokeWidth="1"
            />
            {/* Tooltip Title Text */}
            <text
              x="0"
              y="-19"
              textAnchor="middle"
              className="fill-text font-display text-[10px] font-bold"
            >
              {hoveredPoint.name}
            </text>
            {/* Tooltip Subtitle Text */}
            <text
              x="0"
              y="-9"
              textAnchor="middle"
              className="fill-text-secondary text-[8px] font-medium"
            >
              {hoveredPoint.type}
            </text>
          </g>
        )}

        {/* Cartographic Coordinate & Scale Label */}
        <g className="text-text-muted select-none opacity-60">
          <text x="46" y="44" className="fill-current text-[8.5px] font-mono tracking-wider">
            8°20&apos;S 115°13&apos;E · BALI SANCTUARY REEF
          </text>
          <text x="46" y="316" className="fill-current text-[8px] font-mono tracking-widest uppercase">
            SITUATION SENSING & PROXIMITY GRID
          </text>
        </g>
      </svg>
    </div>
  );
}
