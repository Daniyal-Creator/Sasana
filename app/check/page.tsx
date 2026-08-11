"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorFallback } from "@/components/ui/ErrorFallback";
import { CameraUploader } from "@/components/check/CameraUploader";
import { ContextSelector, type CheckContext } from "@/components/check/ContextSelector";
import { ResultCard } from "@/components/check/ResultCard";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import type { PreparedImage } from "@/lib/image";
import type { VisionResult } from "@/lib/types";

type Phase = "idle" | "loading" | "done" | "error";

export default function CheckPage() {
  const { lang } = useLang();
  const [context, setContext] = useState<CheckContext>("temple");
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<VisionResult | null>(null);

  const busy = phase === "loading";

  async function analyze() {
    if (!image) return;
    setPhase("loading");
    setResult(null);
    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: image.base64, mimeType: image.mimeType, context, lang }),
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
    <>
      <div className="mx-auto w-full max-w-tool flex-1 px-4 pb-6 pt-6 sm:px-6">
        <h1 className="font-display text-h1 font-semibold text-text">{t(lang, "check.title")}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t(lang, "check.subtitle")}</p>

        <div className="mt-6 space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium text-text-secondary">{t(lang, "check.context.label")}</p>
            <ContextSelector value={context} onChange={setContext} disabled={busy} />
          </div>

          <CameraUploader image={image} onImageReady={setImage} onClear={reset} disabled={busy} />

          {phase === "loading" && (
            <div>
              <span className="sr-only" role="status">
                {t(lang, "check.loading")}
              </span>
              <Skeleton variant="card" />
            </div>
          )}
          {phase === "done" && result && <ResultCard result={result} onReset={reset} />}
          {phase === "error" && <ErrorFallback message={t(lang, "check.error")} onRetry={analyze} />}
        </div>
      </div>

      {/* Sticky action bar on mobile, inline at md+ (ui-spec §4.2) */}
      {phase !== "done" && (
        <div className="sticky bottom-0 border-t border-border bg-bg px-4 py-3 md:static md:border-0 md:bg-transparent md:py-0">
          <div className="mx-auto max-w-tool space-y-3 md:px-2 md:pb-8">
            <p className="flex items-start gap-2 text-xs text-text-secondary">
              <ShieldCheck size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-accent-strong" />
              {t(lang, "check.privacy")}
            </p>
            <Button
              size="lg"
              className="w-full"
              disabled={!image || busy}
              loading={busy}
              onClick={analyze}
            >
              {busy ? t(lang, "check.loading") : t(lang, "check.analyze")}
            </Button>
          </div>
        </div>
      )}
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
