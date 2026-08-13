"use client";

import { Shirt, Camera, Music, Plane, VolumeX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CustomIcon as CustomIconName } from "@/data/sites";

const ICONS: Record<CustomIconName, LucideIcon> = {
  dress: Shirt,
  photography: Camera,
  offerings: Music,
  drones: Plane,
  quiet: VolumeX,
};

interface CustomIconProps {
  icon: CustomIconName;
  size?: number;
  className?: string;
}

export function CustomIcon({ icon, size = 20, className = "" }: CustomIconProps) {
  const Icon = ICONS[icon];
  return <Icon size={size} strokeWidth={1.75} aria-hidden className={className} />;
}