import { redirect } from "next/navigation";
import { SITES } from "@/data/sites";

export function generateStaticParams() {
  return SITES.map((site) => ({
    siteId: site.id,
  }));
}

interface SiteParamProps {
  params: Promise<{ siteId: string }>;
}

export default async function ExploreSiteRedirectPage({ params }: SiteParamProps) {
  const { siteId } = await params;
  redirect(`/explore?site=${siteId}`);
}
