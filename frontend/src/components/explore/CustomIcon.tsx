"use client";

import { Shirt, VolumeX } from "lucide-react";
import type { CustomIcon as CustomIconName } from "@/data/sites";

interface CustomIconProps {
  icon: CustomIconName;
  size?: number;
  className?: string;
}

/**
 * Custom icons matching the SASANA visual identity and user specifications:
 * - dress: Shirt (clothing / attire requirement)
 * - photography: Camera (respectful photo boundaries)
 * - offerings: Canang Sari (woven ceper tray with floral petals and leaves)
 * - drones: Drone quadcopter with restriction slash
 * - quiet: VolumeX (silence / quiet indicator to prevent loud noise)
 */
export function CustomIcon({ icon, size = 20, className = "" }: CustomIconProps) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    width: size,
    height: size,
    className,
    "aria-hidden": true,
  };

  switch (icon) {
    case "dress":
      return <Shirt size={size} strokeWidth={1.75} aria-hidden className={className} />;

    case "photography":
      return (
        <svg {...commonProps}>
          {/* Camera body */}
          <rect x="3" y="6" width="18" height="14" rx="3" />
          {/* Viewfinder bump */}
          <path d="M8.5 6V4.5C8.5 4.2 8.7 4 9 4H12C12.3 4 12.5 4.2 12.5 4.5V6" />
          {/* Lens */}
          <circle cx="12" cy="13" r="4.2" />
          <circle cx="12" cy="13" r="1.5" />
          {/* Flash dot */}
          <circle cx="17.5" cy="8.5" r="0.75" fill="currentColor" />
        </svg>
      );

    case "offerings":
      return (
        <svg {...commonProps}>
          {/* Woven palm-leaf tray (Ceper / Canang) */}
          <path d="M4 14C4.8 18 7.8 19.8 12 19.8C16.2 19.8 19.2 18 20 14H4Z" />
          <path d="M3.5 14H20.5" strokeWidth={2} />
          {/* Blooming flowers & sacred petals */}
          <path d="M12 5C10.5 8 11.2 11 12 14C12.8 11 13.5 8 12 5Z" />
          <path d="M7 8.5C8.5 10 10.5 11.5 11.5 14" />
          <path d="M17 8.5C15.5 10 13.5 11.5 12.5 14" />
          <path d="M4.8 11C6.8 12 8.8 13 10.5 14" />
          <path d="M19.2 11C17.2 12 15.2 13 13.5 14" />
        </svg>
      );

    case "drones":
      return (
        <svg {...commonProps}>
          {/* Central hub */}
          <circle cx="12" cy="12" r="2.2" />
          {/* 4 diagonal arms */}
          <path d="M10.4 10.4L7.5 7.5" />
          <path d="M13.6 10.4L16.5 7.5" />
          <path d="M10.4 13.6L7.5 16.5" />
          <path d="M13.6 13.6L16.5 16.5" />
          {/* Rotors */}
          <path d="M5.5 7.5H9.5" strokeWidth={1.5} />
          <path d="M14.5 7.5H18.5" strokeWidth={1.5} />
          <path d="M5.5 16.5H9.5" strokeWidth={1.5} />
          <path d="M14.5 16.5H18.5" strokeWidth={1.5} />
          {/* Prohibition ring & slash */}
          <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
          <line x1="4.9" y1="4.9" x2="19.1" y2="19.1" strokeWidth={2} />
        </svg>
      );

    case "quiet":
    default:
      return <VolumeX size={size} strokeWidth={1.75} aria-hidden className={className} />;
  }
}