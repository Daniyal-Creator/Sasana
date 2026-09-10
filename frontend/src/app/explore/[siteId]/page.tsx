import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITES } from "@/data/sites";
import { SitePageView } from "@/components/explore/SitePageView";

/**
 * A page per Site, prerendered into the static export.
 *
 * This route used to be a `redirect()` into `/explore?site=`, which meant every
 * temple in the app lived behind a map and a location prompt. The point of
 * giving each one a page is the two things a redirect cannot have: an address
 * somebody can send to a friend, and something for a search engine to read.
 */
export function generateStaticParams() {
  return SITES.map((site) => ({ siteId: site.id }));
}

// The export contains exactly the Sites in the catalogue. Anything else is a
// 404 at the server rather than a page rendered from an id nobody recognises.
export const dynamicParams = false;

interface SiteParamProps {
  params: Promise<{ siteId: string }>;
}

/**
 * Built at export time, so it cannot follow the language toggle the way the
 * page body does. English, because `PRODUCT.md` names the foreign visitor as
 * the primary user and this text exists for the moment before they arrive -
 * a search result, a pasted link - rather than for the moment they are reading.
 */
export async function generateMetadata({ params }: SiteParamProps): Promise<Metadata> {
  const { siteId } = await params;
  const site = SITES.find((s) => s.id === siteId);
  if (!site) return {};

  return {
    title: `${site.name} · SASANA`,
    description: site.description.en,
    openGraph: {
      title: `${site.name}, ${site.region}`,
      description: site.description.en,
      type: "article",
    },
  };
}

export default async function SitePage({ params }: SiteParamProps) {
  const { siteId } = await params;
  if (!SITES.some((site) => site.id === siteId)) notFound();

  return <SitePageView siteId={siteId} />;
}
