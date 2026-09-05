"use client";

import Image from "next/image";
import { SourceReference } from "@/components/assistant/SourceReference";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string | null;
  source?: string | null;
  grounded?: boolean;
  isFirstOfTurn?: boolean;
}

export function SasanaAvatar({ size = "md" }: { size?: "md" | "lg" }) {
  const isLg = size === "lg";
  return (
    <span
      aria-hidden
      className={[
        "relative flex shrink-0 items-center justify-center",
        isLg ? "h-16 w-16" : "h-7 w-7",
      ].join(" ")}
    >
      <Image
        src="/sasana-logo.png"
        alt="Sasana"
        width={isLg ? 64 : 28}
        height={isLg ? 64 : 28}
        className="h-full w-full object-contain"
        priority={isLg}
      />
    </span>
  );
}

export function ChatBubble({
  role,
  content,
  imageUrl,
  source,
  grounded,
  isFirstOfTurn = true,
}: ChatBubbleProps) {
  const { lang } = useLang();
  const isUser = role === "user";

  return (
    <li className={`flex items-end gap-2 animate-msgIn ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (isFirstOfTurn ? <SasanaAvatar /> : <span aria-hidden className="w-7 shrink-0" />)}
      <div
        className={[
          "max-w-[85%] rounded-lg px-4 py-3 md:max-w-[75%]",
          isUser
            ? "rounded-br-sm bg-primary text-primary-fg"
            : "rounded-bl-sm border border-border bg-surface text-text",
        ].join(" ")}
      >
        <span className="sr-only">{t(lang, isUser ? "sr.you" : "sr.assistant")}: </span>
        {imageUrl && (
          <div className="mb-2 overflow-hidden rounded-md border border-border/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={t(lang, "check.photo.alt")}
              className="max-h-48 w-full object-cover"
            />
          </div>
        )}
        <p className="whitespace-pre-wrap text-base">{content}</p>
        {!isUser && grounded !== undefined && <SourceReference source={source ?? null} grounded={grounded} />}
      </div>
    </li>
  );
}
