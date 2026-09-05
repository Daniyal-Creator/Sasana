"use client";

import { Search, X } from "lucide-react";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import type { Lang } from "@/lib/i18n";
import type { Site } from "@/data/sites";

/**
 * Whether a Site answers to what was typed.
 *
 * Name, region, and the area label, because a visitor looking for Uluwatu may
 * type "Badung" or "cliff" just as readily as the name. Accents are folded
 * away: "Tromsø" is not the issue here, but "Segara" typed without care is.
 */
export function matchesQuery(site: Site, query: string, lang: Lang): boolean {
  const needle = normalise(query);
  if (!needle) return true;
  return [site.name, site.region, site.areaLabel[lang]].some((field) =>
    normalise(field).includes(needle),
  );
}

function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

interface SiteSearchProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * A plain search field, deliberately.
 *
 * The list it filters is eleven rows at its longest, so this is a filter and
 * not a command palette: no shortcut to learn, no results overlay, no mode to
 * leave. It sits above the list and narrows it in place, which is the one
 * behaviour nobody has to be taught.
 */
export function SiteSearch({ value, onChange }: SiteSearchProps) {
  const { lang } = useLang();

  return (
    <div className="relative">
      <Search
        size={18}
        strokeWidth={1.75}
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // Escape clears rather than blurs. Inside a sheet, blur leaves the
        // visitor looking at a filtered list with no obvious way back to all
        // of it.
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            onChange("");
          }
        }}
        placeholder={tExplore(lang, "explore.search.placeholder")}
        aria-label={tExplore(lang, "explore.search.placeholder")}
        // Same vocabulary as the Assistant's composer input, down to the
        // radius and the border token: two text fields in one product that
        // differ for no reason means one of them is wrong.
        className={[
          "h-11 w-full rounded-md border border-border-strong bg-surface pl-11 pr-12",
          "text-base text-text placeholder:text-text-muted focus-visible:shadow-focus",
          // Safari draws its own clear affordance inside type="search", which
          // would sit beside the one below.
          "[&::-webkit-search-cancel-button]:appearance-none",
        ].join(" ")}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={tExplore(lang, "explore.search.clear")}
          // 44 square, not the 36 the icon wants to be: this is a touch
          // target on a phone held at arm's length in the sun.
          className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:text-text focus-visible:shadow-focus"
        >
          <X size={18} strokeWidth={1.75} aria-hidden />
        </button>
      )}
    </div>
  );
}
