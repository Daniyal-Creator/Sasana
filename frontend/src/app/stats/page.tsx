"use client";

// The answer cache's numbers, on a screen.
//
// Deliberately not linked from the header. This is a maintenance reading, not
// something a visitor came to Bali to see, and putting it in the navigation
// would say otherwise. It exists because a saving nobody can look at is a claim
// rather than a result: `GET /api/stats` returns JSON, and JSON is not
// something you can put on a projector.

import { useCallback, useEffect, useState } from "react";
import { Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorFallback } from "@/components/ui/ErrorFallback";
import { apiUrl } from "@/lib/api";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

interface CacheStats {
  entries: number;
  hits: number;
  misses: number;
  hitRate: number;
  tokensSaved: number;
  kbHash: string;
  enabled: boolean;
}

export default function StatsPage() {
  const { lang } = useLang();
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch(apiUrl("/api/stats"));
      if (!res.ok) throw new Error("stats request failed");
      setStats((await res.json()) as CacheStats);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const figures = stats
    ? [
        { label: t(lang, "stats.tokens"), value: stats.tokensSaved.toLocaleString(lang === "id" ? "id-ID" : "en-US") },
        { label: t(lang, "stats.hitrate"), value: `${Math.round(stats.hitRate * 100)}%` },
        { label: t(lang, "stats.answered"), value: `${stats.hits} / ${stats.hits + stats.misses}` },
        { label: t(lang, "stats.entries"), value: String(stats.entries) },
      ]
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-h2 font-semibold text-text">{t(lang, "stats.title")}</h1>
      <p className="mt-2 max-w-prose text-base text-text-secondary">{t(lang, "stats.body")}</p>

      {loading && (
        <div className="mt-10 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {failed && !loading && (
        <div className="mt-10">
          <ErrorFallback message={t(lang, "stats.error")} onRetry={load} />
        </div>
      )}

      {stats && !loading && !failed && (
        <>
          <dl className="mt-10 grid gap-4 sm:grid-cols-2">
            {figures.map((figure) => (
              <Card key={figure.label}>
                <dt className="text-sm text-text-secondary">{figure.label}</dt>
                <dd className="mt-1 font-display text-h3 font-semibold text-text">{figure.value}</dd>
              </Card>
            ))}
          </dl>

          {/* The cache being off is not an error, it is how the comparison is
              run, so it reads as a state rather than as a warning. */}
          <p className="mt-6 flex items-center gap-1.5 text-sm text-text-secondary">
            <Database size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-accent-strong" />
            {t(lang, stats.enabled ? "stats.on" : "stats.off")}
          </p>
          <p className="mt-1 text-sm text-text-muted">{t(lang, "stats.kb", { hash: stats.kbHash })}</p>

          <div className="mt-8">
            <Button variant="secondary" icon={RefreshCw} onClick={load}>
              {t(lang, "stats.refresh")}
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
