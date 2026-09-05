"use client";

import { useEffect, useState } from "react";
import {
  AudioLines,
  Camera,
  CircleCheck,
  CircleHelp,
  CircleX,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Square,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/lib/language";
import { useAssistant } from "@/lib/assistant-context";
import { t, type CopyKey } from "@/lib/i18n";
import type { PreparedImage } from "@/lib/image";
import type { VisionResult, VisionStatus } from "@shared/contract";

interface ResultCardProps {
  result: VisionResult;
  image?: PreparedImage | null;
  onReset?: () => void;
}

// Status carried by header band + icon + label together, never color alone
// (ui-spec §5.3, DL5/DL8). No side-stripe.
const statusConfig: Record<
  VisionStatus,
  { icon: LucideIcon; labelKey: CopyKey; tipKey: CopyKey; band: string; borderClass: string }
> = {
  compliant: {
    icon: CircleCheck,
    labelKey: "result.compliant",
    tipKey: "result.tip.compliant",
    band: "bg-status-ok-bg text-status-ok-fg",
    borderClass: "border-status-ok-border",
  },
  needs_attention: {
    icon: TriangleAlert,
    labelKey: "result.needs_attention",
    tipKey: "result.tip.needs_attention",
    band: "bg-status-warn-bg text-status-warn-fg",
    borderClass: "border-status-warn-border",
  },
  not_compliant: {
    icon: CircleX,
    labelKey: "result.not_compliant",
    tipKey: "result.tip.not_compliant",
    band: "bg-status-bad-bg text-status-bad-fg",
    borderClass: "border-status-bad-border",
  },
  unclear: {
    icon: CircleHelp,
    labelKey: "result.unclear",
    tipKey: "result.tip.unclear",
    band: "bg-status-unknown-bg text-status-unknown-fg",
    borderClass: "border-status-unknown-border",
  },
};

export function ResultCard({ result, image, onReset }: ResultCardProps) {
  const router = useRouter();
  const { lang } = useLang();
  const { setHandoffPayload } = useAssistant();
  const config = statusConfig[result.status];
  const StatusIcon = config.icon;
  const isUnclear = result.status === "unclear";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Cancel audio when the card is unmounted (e.g. user resets)
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  function handleTts() {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = [result.reason, result.suggestion].filter(Boolean).join(". ");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "id" ? "id-ID" : "en-US";
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel(); // clear any leftover queue
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = inputValue.trim();
    if (!question) return;

    setHandoffPayload({
      question,
      imageUrl: image?.previewUrl ?? null,
      image: image ?? null,
      lang,
      contextResult: result,
    });

    router.push("/assistant");
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`overflow-hidden rounded-lg border bg-surface shadow-md animate-resultIn ${config.borderClass}`}
    >
      <div className={`flex items-center gap-2 px-5 py-3 ${config.band}`}>
        <StatusIcon size={24} strokeWidth={1.75} aria-hidden />
        <span className="text-base font-semibold">{t(lang, config.labelKey)}</span>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-base text-text">{result.reason}</p>

        {result.suggestion && (
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary">
              <Sparkles size={16} strokeWidth={1.75} aria-hidden className="text-accent-strong" />
              {t(lang, config.tipKey)}
            </p>
            <p className="mt-1 text-base font-medium text-text">{result.suggestion}</p>
          </div>
        )}

        {!isUnclear && result.reference && (
          <p className="text-sm text-text-muted">{t(lang, "check.source", { source: result.reference })}</p>
        )}
      </div>

      <div className="space-y-3 border-t border-border p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            icon={isSpeaking ? Square : AudioLines}
            onClick={handleTts}
            aria-pressed={isSpeaking}
            aria-label={isSpeaking ? t(lang, "check.tts.stop") : t(lang, "check.tts")}
          >
            {isSpeaking ? t(lang, "check.tts.stop") : t(lang, "check.tts")}
          </Button>

          {onReset && (
            isUnclear ? (
              <Button variant="primary" icon={Camera} onClick={onReset}>
                {t(lang, "check.unclear.retake")}
              </Button>
            ) : (
              <Button variant="secondary" icon={RefreshCw} onClick={onReset}>
                {t(lang, "check.reset")}
              </Button>
            )
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-full border border-border bg-surface-sunken px-3 py-1.5 focus-within:border-border-strong focus-within:shadow-focus"
        >
          <Plus size={18} strokeWidth={1.75} aria-hidden className="shrink-0 text-text-muted" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t(lang, "check.followup.placeholder")}
            aria-label={t(lang, "check.followup.placeholder")}
            className="min-w-0 flex-1 bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            aria-label={t(lang, "assistant.send")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg transition-[background-color,transform] duration-150 hover:bg-primary-hover active:scale-[0.98] focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={15} strokeWidth={1.75} aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
}
