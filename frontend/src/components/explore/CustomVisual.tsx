"use client";

import { useId } from "react";
import Image from "next/image";
import { Check } from "lucide-react";

import type { CustomIcon as CustomIconName } from "@/data/sites";
import { CUSTOM_IMAGE } from "@/lib/custom-image";
import type { Lang } from "@/lib/i18n";
import { useLang } from "@/lib/language";

interface CustomVisualProps {
  icon: CustomIconName;
  customId?: string;
  className?: string;
}

/** Which status palette a tag borrows. Never colour alone: the tag is a word first. */
type Tone = "primary" | "accent" | "ok" | "bad";

interface Tag {
  tone: Tone;
  /** Balinese and Indonesian terms that stay themselves in English carry the same string twice. */
  label: Record<Lang, string>;
  /** The plain-language gloss beside the term, where the term needs one. */
  note?: Record<Lang, string>;
}

interface VisualCopy {
  /** What the drawing shows, for a visitor who cannot see it. */
  alt: Record<Lang, string>;
  tags: Tag[];
  footnote: Record<Lang, string>;
}

const TONE: Record<Tone, string> = {
  primary: "border-primary/30 bg-primary-tint text-primary",
  accent: "border-status-warn-border bg-status-warn-bg text-accent-strong",
  ok: "border-status-ok-border bg-status-ok-bg text-status-ok-fg",
  bad: "border-status-bad-border bg-status-bad-bg text-status-bad-fg",
};

/**
 * The words that annotate each drawing.
 *
 * One table rather than five hand-laid diagrams. These labels used to be `<text>`
 * inside an SVG, each sitting on a `<rect>` whose width was typed in by hand, so
 * "Minta Izin Sembahyang" on a 112-unit rectangle ran out past its own
 * background and every translation was another chance to guess wrong. Here a tag
 * is an HTML element: its background is the width of its text by construction,
 * in either language, at any zoom.
 */
const VISUAL: Record<CustomIconName, VisualCopy> = {
  dress: {
    alt: {
      id: "Ilustrasi pakaian adat Bali: Kamen dan Selendang",
      en: "Illustration of Balinese temple attire: Kamen and Selendang sash",
    },
    tags: [
      {
        tone: "primary",
        label: { id: "1. Kamen", en: "1. Kamen" },
        note: { id: "Kain bawahan", en: "Lower wrap" },
      },
      {
        tone: "accent",
        label: { id: "2. Selendang", en: "2. Selendang" },
        note: { id: "Ikat pinggang", en: "Waist sash" },
      },
    ],
    footnote: { id: "Bahu & lutut tertutup sopan", en: "Shoulders & knees covered" },
  },

  offerings: {
    alt: {
      id: "Ilustrasi sesaji Canang Sari Bali",
      en: "Illustration of Balinese Canang Sari floral offering",
    },
    tags: [
      {
        tone: "ok",
        label: { id: "Canang Sari", en: "Canang Sari" },
        note: { id: "Sesaji di tanah", en: "Ground offering" },
      },
      {
        tone: "accent",
        label: { id: "Jangan Dilangkahi", en: "Walk Around" },
      },
    ],
    footnote: { id: "Berjalanlah memutari sesaji", en: "Please step around gently" },
  },

  photography: {
    alt: {
      id: "Ilustrasi etika fotografi di area pura",
      en: "Illustration of photography etiquette at sacred temple",
    },
    tags: [
      {
        tone: "primary",
        label: { id: "Etika Fotografi", en: "Etika Fotografi" },
      },
      {
        tone: "accent",
        label: { id: "Minta Izin Sembahyang", en: "Ask Praying Devotees" },
      },
    ],
    footnote: { id: "Jangan berdiri di depan pemangku", en: "Never stand higher than priest" },
  },

  drones: {
    alt: {
      id: "Ilustrasi larangan terbang drone di atas pura",
      en: "Illustration of drone flight restrictions over sacred temple",
    },
    tags: [
      {
        tone: "bad",
        label: { id: "Zona Bebas Drone", en: "No-Fly Airspace" },
      },
      {
        tone: "accent",
        label: { id: "Kosmologi Ketinggian", en: "Sacred Vertical Space" },
      },
    ],
    footnote: { id: "Hormati ketinggian pelinggih", en: "Do not fly above shrines" },
  },

  quiet: {
    alt: {
      id: "Ilustrasi menjaga ketenangan di area persembahyangan",
      en: "Illustration of maintaining quiet reverence at sacred site",
    },
    tags: [
      {
        tone: "accent",
        label: { id: "Ketenangan Suci", en: "Ketenangan Suci" },
      },
      {
        tone: "primary",
        label: { id: "Bicara Pelan & Tertib", en: "Low Speaking Voice" },
      },
    ],
    footnote: { id: "Pura adalah tempat ibadah aktif", en: "Active sacred place of worship" },
  },
};

/**
 * The ruled paper the annotations sit on.
 *
 * A tiling pattern rather than four drawn lines: the panel is now as tall as its
 * own text, which is taller in Indonesian than in English and taller again at
 * 200% zoom, and lines at fixed heights would stop reaching the bottom.
 */
function RuledPaper() {
  const patternId = `custom-visual-rule-${useId()}`;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 9 wide is one dash plus one gap, so the tile repeats without a seam. */}
        <pattern id={patternId} width="9" height="24" patternUnits="userSpaceOnUse">
          <path
            d="M0 23.5H9"
            className="stroke-border"
            strokeWidth="0.75"
            strokeDasharray="3 6"
            strokeOpacity="0.6"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/**
 * Cultural object visual representations for Balinese customs.
 *
 * Each Custom gets the object or the etiquette diagram it names, beside the two
 * terms a first-time visitor needs in order to recognise it. Two Customs are
 * only actionable once the visitor knows what they are looking at: "walk around
 * them, never over them" is broken by people who did not read what was on the
 * ground as an offering, and no amount of text fixes a failure of recognition
 * (ADR-0013).
 */
export function CustomVisual({ icon, customId, className = "" }: CustomVisualProps) {
  const { lang } = useLang();
  const copy = VISUAL[icon] ?? VISUAL.quiet;
  const image = CUSTOM_IMAGE[icon] ?? CUSTOM_IMAGE.quiet;

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border bg-[#F9F6F0] p-3 text-text ${className}`}
      data-custom={customId}
    >
      <RuledPaper />

      <div className="relative flex items-stretch gap-3">
        <span
          className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-md border border-border-strong"
          style={{ backgroundColor: image.ground }}
        >
          <Image
            src={image.src}
            alt={copy.alt[lang]}
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />
        </span>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          {copy.tags.map((tag) => (
            <div key={tag.label.en} className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className={`inline-block rounded border px-2 py-1 text-xs font-semibold leading-tight ${TONE[tag.tone]}`}
              >
                {tag.label[lang]}
              </span>
              {tag.note && <span className="text-xs text-text-secondary">{tag.note[lang]}</span>}
            </div>
          ))}

          <p className="mt-0.5 flex items-start gap-1 text-xs text-text-muted">
            <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="min-w-0">{copy.footnote[lang]}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
