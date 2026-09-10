"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SiteBrief } from "@/components/explore/SiteBrief";
import { useAssistant } from "@/lib/assistant-context";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import { siteContextFrom, writeActiveSite } from "@/lib/site-context";
import { SITES } from "@/data/sites";

interface SitePageViewProps {
  siteId: string;
}

/**
 * A Site on a page of its own, rather than inside the map.
 *
 * Until this existed `/explore/[siteId]` was seventeen lines of `redirect()`,
 * so every sacred place in the app was reachable only by opening a map and
 * granting location. That is the wrong way round for the visitor this product
 * is for: people decide where to go in Bali before they arrive, from a laptop
 * in another country, with no GPS and no reason to open a map. A place that
 * cannot be read, linked, or indexed is a place that does not exist to anybody
 * still planning a trip.
 *
 * It renders the same `SiteBrief` the map sheet does, deliberately. A second
 * component saying the same things in a different order is a second place for
 * the Customs to drift, and the Customs are the part that has to stay true.
 */
export function SitePageView({ siteId }: SitePageViewProps) {
  const { lang } = useLang();
  const router = useRouter();
  const { setHandoffPayload } = useAssistant();

  const site = SITES.find((s) => s.id === siteId);

  /**
   * Reading about a place counts as being at it, for the assistant's purposes.
   *
   * Not cleared on the way out. The visitor who reads this page and then opens
   * the assistant is asking about this temple, and the alternative - clearing on
   * unmount - would wipe the Site during the very navigation that needs it. It
   * expires the way it always has: when Explore sets another one, or when the
   * visitor closes the card the assistant now shows them.
   */
  useEffect(() => {
    if (!site) return;
    writeActiveSite(siteContextFrom(site));
  }, [site]);

  if (!site) return null;

  /**
   * No position travels from here, and that is correct rather than a gap. This
   * page has no fix to offer: it is read from a sofa as often as from a gate.
   * The assistant's context card handles it already - it keeps the place and
   * shows no distance, because a Site outlives a fix.
   */
  function ask() {
    setHandoffPayload({ question: "", lang, proximity: null });
    router.push("/assistant");
  }

  return (
    // `article` rather than `main`: `layout.tsx` already wraps every page in a
    // `main`, and a second one nested inside it gives a screen reader two
    // competing landmarks. A Site page is also a self-contained piece of
    // content in its own right, which is what `article` is for - and what the
    // Open Graph type above already calls it.
    <article className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <SiteBrief
        site={site}
        titleAs="h1"
        distanceM={null}
        onBack={() => router.push("/explore")}
        onAsk={ask}
      />

      {/* The way back into the feature this page was carved out of. Without it
          the page is a leaf: a visitor who has just read what is expected of
          them at a temple has no way to see where it is. */}
      <div className="mt-6">
        <Button
          variant="secondary"
          icon={Map}
          href={`/explore?site=${site.id}`}
          className="w-full"
        >
          {tExplore(lang, "explore.detail.openMap")}
        </Button>
      </div>
    </article>
  );
}
