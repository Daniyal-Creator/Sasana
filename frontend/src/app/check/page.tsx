"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorFallback } from "@/components/ui/ErrorFallback";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { CameraUploader } from "@/components/check/CameraUploader";
import { ContextSelector, type CheckContext } from "@/components/check/ContextSelector";
import { ResultCard } from "@/components/check/ResultCard";
import { CheckEmptyState } from "@/components/check/CheckEmptyState";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/language";
import { apiUrl } from "@/lib/api";
import { t } from "@/lib/i18n";
import { readActiveSite } from "@/lib/site-context";
import type { PreparedImage } from "@/lib/image";
import type { SiteContext, VisionResult } from "@shared/contract";

type Phase = "idle" | "loading" | "done" | "error";

export default function CheckPage() {
  const { lang } = useLang();
  const [context, setContext] = useState<CheckContext>("temple");
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<VisionResult | null>(null);
  // The Site the visitor picked in Explore, if they came from there. Read after
  // mount rather than during render: sessionStorage does not exist on the
  // server, and reading it in a useState initialiser makes the first client
  // render disagree with the server's.
  const [site, setSite] = useState<SiteContext | null>(null);

  useEffect(() => {
    setSite(readActiveSite());
  }, []);

  const busy = phase === "loading";

  async function analyze() {
    if (!image) return;
    setPhase("loading");
    setResult(null);
    try {
      const res = await fetch(apiUrl("/api/vision"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // `site` is omitted when the visitor did not come from Explore, which
        // is what keeps the standalone check behaving exactly as it always has.
        body: JSON.stringify({
          image: image.base64,
          mimeType: image.mimeType,
          context,
          lang,
          ...(site ? { site } : {}),
        }),
      });
      if (!res.ok) throw new Error("vision request failed");
      setResult((await res.json()) as VisionResult);
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }

  function reset() {
    setImage(null);
    setResult(null);
    setPhase("idle");
  }

  return (
    // `main` is already `flex-1` inside the layout's `min-h-dvh` column, so
    // filling the viewport is `flex-1` — not a `100vh` calc, which overshoots
    // by the height of the mobile URL bar and pushes the footer off-screen.
    <div className="flex flex-1 flex-col justify-between">
      <div className="mx-auto w-full max-w-container flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {t(lang, "check.title")}
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">{t(lang, "check.subtitle")}</p>

        <div className="mt-6 max-w-md">
          <p className="mb-2 text-sm font-semibold text-text">{t(lang, "check.context.label")}</p>
          <ContextSelector value={context} onChange={setContext} disabled={busy} />
        </div>

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Left Column: Upload & Actions */}
          <div className="flex flex-col">
            <CameraUploader image={image} onImageReady={setImage} onClear={reset} disabled={busy} />

            <div className="mt-3 flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
              <Shield size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-text-muted" />
              <p>{t(lang, "check.privacy")}</p>
            </div>

            <Button
              size="lg"
              className="mt-4 w-full rounded-xl text-base"
              disabled={!image || busy}
              loading={busy}
              onClick={analyze}
            >
              {busy ? t(lang, "check.loading") : t(lang, "check.analyze")}
            </Button>
          </div>

          {/* Right Column: Result, Loading, Error, or Idle Placeholder */}
          <div className="min-h-[300px] lg:min-h-[380px]">
            {phase === "idle" && <CheckEmptyState />}
            {phase === "loading" && (
              <div className="flex h-full flex-col">
                <span className="sr-only" role="status">
                  {t(lang, "check.loading")}
                </span>
                <Skeleton variant="card" className="h-full min-h-[300px] rounded-2xl" />
              </div>
            )}
            {phase === "done" && result && <ResultCard result={result} image={image} onReset={reset} />}
            {phase === "error" && <ErrorFallback message={t(lang, "check.error")} onRetry={analyze} />}
          </div>
        </div>
      </div>

      <Footer className="bg-transparent" />
      <ScrollIndicator />
    </div>
  );
}
