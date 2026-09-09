"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import { formatDistance } from "@/lib/geo";
import { writeAmenityDestination } from "@/lib/amenity-destination";
import type { Amenity } from "@shared/contract";

interface AmenityListProps {
  amenities: Amenity[];
}

/**
 * The places an answer was written from, as somewhere a visitor can go.
 *
 * The sentence above already names them. This is not a second copy of the
 * answer: it carries the one thing prose cannot, which is the point on the map,
 * and choosing a row is what puts it there.
 *
 * The OSM tag is printed as it is - "guest house", not "hotel" - because the
 * map records what somebody tagged and nothing more. Rewriting `guest_house`
 * into a friendlier word would be the app making a claim the map never did.
 */
export function AmenityList({ amenities }: AmenityListProps) {
  const { lang } = useLang();
  const router = useRouter();

  if (amenities.length === 0) return null;

  const choose = (amenity: Amenity) => {
    writeAmenityDestination(amenity);
    router.push("/explore");
  };

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-text-secondary">
        {t(lang, "assistant.amenities.title")}
      </p>
      <ul className="mt-1.5 divide-y divide-border rounded-md border border-border bg-bg">
        {amenities.map((amenity) => (
          <li key={`${amenity.name}-${amenity.lat}-${amenity.lng}`}>
            <button
              type="button"
              onClick={() => choose(amenity)}
              aria-label={t(lang, "assistant.amenities.open", { name: amenity.name })}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-surface-sunken"
            >
              <MapPin
                size={16}
                strokeWidth={1.75}
                aria-hidden
                className="shrink-0 text-text-muted"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-text">{amenity.name}</span>
                <span className="block truncate text-xs text-text-secondary">
                  {amenity.kind.replace(/_/g, " ")}
                </span>
              </span>
              <span className="shrink-0 text-xs tabular-nums text-text-secondary">
                {formatDistance(amenity.distanceM, lang)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
